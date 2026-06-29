import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import crypto from 'crypto';
import { execFileSync, execSync } from 'child_process';

const projectRoot = process.cwd();
const LOCAL_ARTICLES_DIR = path.join(projectRoot, 'content', 'blog', 'articles');
const LOCAL_IMAGES_DIR = path.join(projectRoot, 'content', 'blog', 'images');
const PUBLIC_IMAGES_DIR = path.join(projectRoot, 'public', 'blog-images');

const SYNC_DIR = path.join(projectRoot, 'content', '.emu-blog-sync');
const SYNC_ARTICLES_DIR = path.join(SYNC_DIR, 'articles');
const SYNC_IMAGES_DIR = path.join(SYNC_ARTICLES_DIR, 'images');
const CLONE_DIR = path.join(projectRoot, 'content', 'emu-blog-sync');

const EMU_REPO = 'EMU-Stu/EMU-Stu-Blog';
const token = process.env.EMU_SYNC_TOKEN ?? process.env.GH_TOKEN;
const EMU_REPO_URL = token
  ? `https://x-access-token:${token}@github.com/${EMU_REPO}.git`
  : `https://github.com/${EMU_REPO}.git`;

const ghEnv = { ...process.env, ...(token ? { GH_TOKEN: token } : {}) };
const gitOption = { cwd: CLONE_DIR, stdio: 'inherit' };

console.log(`🚀 脚本启动，项目根目录：${projectRoot}`);
console.log(`📂 扫描文章目录：${LOCAL_ARTICLES_DIR}`);

if (fs.existsSync(SYNC_DIR)) {
  fs.rmSync(SYNC_DIR, { recursive: true, force: true });
}
fs.mkdirSync(SYNC_ARTICLES_DIR, { recursive: true });
fs.mkdirSync(SYNC_IMAGES_DIR, { recursive: true });

if (!fs.existsSync(LOCAL_ARTICLES_DIR)) {
  console.error(`❌ 找不到文章目录 ${LOCAL_ARTICLES_DIR}`);
  process.exit(1);
}

const allFiles = fs.readdirSync(LOCAL_ARTICLES_DIR).filter((f) => f.endsWith('.md'));
console.log(`📂 共 ${allFiles.length} 篇文章：`, allFiles);

const imageRegex = /!\[.*?\]\(\.\/images\/(.*?)\)/g;

for (const filename of allFiles) {
  const filePath = path.join(LOCAL_ARTICLES_DIR, filename);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data } = matter(fileContent);
  const slug = filename.replace('.md', '');
  const hasLabs =
    'labs' in data && data.labs !== null && data.labs !== undefined && data.labs.length > 0;

  if (!hasLabs) {
    console.log(`🔕 [隔离] 纯个人文章: [${slug}]`);
    console.log('--------------------------------');
    continue;
  }

  console.log(`📌 [命中] [${slug}] labs: ${JSON.stringify(data.labs)}`);
  fs.writeFileSync(path.join(SYNC_ARTICLES_DIR, filename), fileContent, 'utf-8');
  console.log(`   ✅ 已加入同步队列: ${filename}`);

  let imageCount = 0;
  let match;
  imageRegex.lastIndex = 0;
  while ((match = imageRegex.exec(fileContent)) !== null) {
    const imageName = match[1];
    const sourceImagePath = resolveImageSource(imageName);
    if (!sourceImagePath) {
      console.warn(`   ⚠️ 图片不存在: ${imageName}`);
      continue;
    }
    fs.copyFileSync(sourceImagePath, path.join(SYNC_IMAGES_DIR, imageName));
    console.log(`   ✅ 已复制图片: ${imageName}`);
    imageCount += 1;
  }
  if (imageCount > 0) {
    console.log(`   ✅ 共复制 ${imageCount} 张图片`);
  }
  console.log('--------------------------------');
}

console.log('\n✨ 本地筛选完成');

// 阶段 2：克隆远端并 diff
console.log('\n🔍 克隆 EMU-Stu-Blog 并对比差异');
if (fs.existsSync(CLONE_DIR)) {
  fs.rmSync(CLONE_DIR, { recursive: true, force: true });
}

console.log('🔍 git clone...');
execFileSync('git', ['clone', '--depth', '1', EMU_REPO_URL, CLONE_DIR], { stdio: 'inherit' });

const pendingChanges = [];
const syncArticles = fs.readdirSync(SYNC_ARTICLES_DIR).filter((f) => f.endsWith('.md'));

for (const filename of syncArticles) {
  const localPath = path.join(SYNC_ARTICLES_DIR, filename);
  const remotePath = path.join(CLONE_DIR, 'articles', filename);
  const slug = filename.replace('.md', '');

  let status = 'NEW';
  let isChanged = false;

  if (fs.existsSync(remotePath)) {
    status = 'UPDATED';
    if (getFileHash(localPath) !== getFileHash(remotePath)) {
      isChanged = true;
    }
  } else {
    isChanged = true;
  }

  if (isChanged) {
    pendingChanges.push({ filename, status, slug });
    console.log(`   🚨 [需同步] [${slug}] -> ${status}（正文有变动）`);
  } else {
    console.log(`   ✅ [${slug}] -> ${status}（正文无变动）`);
  }
}

const { imagesChanged, changedImages } = diffImages(
  SYNC_IMAGES_DIR,
  path.join(CLONE_DIR, 'articles', 'images'),
);

const needsSync = pendingChanges.length > 0 || imagesChanged;

console.log('\n📊 最终比对报告：');
if (!needsSync) {
  console.log('🥳 文章和图片均已是最新，无需建 PR');
  process.exit(0);
}

console.log(`🔥 需同步：${pendingChanges.length} 篇文章、${changedImages.length} 张图片`);

try {
  console.log('\n🔍 创建 karicms 分支...');
  execFileSync('git', ['checkout', '-B', 'karicms'], gitOption);

  console.log('📋 复制变动内容到工作区...');
  const remoteArticles = path.join(CLONE_DIR, 'articles');
  const remoteImagesDir = path.join(remoteArticles, 'images');
  fs.mkdirSync(remoteImagesDir, { recursive: true });

  for (const change of pendingChanges) {
    fs.copyFileSync(
      path.join(SYNC_ARTICLES_DIR, change.filename),
      path.join(remoteArticles, change.filename),
    );
    console.log(`   ✅ 文章: ${change.filename}`);
  }

  for (const imageName of changedImages) {
    const src = resolveSyncImage(imageName);
    if (!src) {
      console.warn(`   ⚠️ 跳过缺失图片: ${imageName}`);
      continue;
    }
    fs.copyFileSync(src, path.join(remoteImagesDir, imageName));
    console.log(`   ✅ 图片: ${imageName}`);
  }

  const porcelain = execFileSync('git', ['status', '--porcelain'], {
    cwd: CLONE_DIR,
    encoding: 'utf8',
  }).trim();

  if (!porcelain) {
    console.log('ℹ️ 工作区无 git 变更，跳过 commit/push');
    process.exit(0);
  }

  execFileSync('git', ['add', '.'], gitOption);
  execFileSync('git', ['commit', '-m', 'sync: update articles from karicms.github.io'], gitOption);
  execFileSync('git', ['push', '-f', 'origin', 'karicms'], gitOption);
  console.log('🎉 已 push 到 origin/karicms');

  handlePullRequest();
} catch (error) {
  console.error('\n❌ 发布失败：', error.message);
  process.exit(1);
}

function resolveImageSource(imageName) {
  const candidates = [
    path.join(LOCAL_IMAGES_DIR, imageName),
    path.join(PUBLIC_IMAGES_DIR, imageName),
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? null;
}

function resolveSyncImage(imageName) {
  const syncPath = path.join(SYNC_IMAGES_DIR, imageName);
  if (fs.existsSync(syncPath)) return syncPath;
  return resolveImageSource(imageName);
}

function handlePullRequest() {
  console.log('\n🔍 检查 PR 状态...');
  let prJson = '';
  try {
    prJson = execSync(
      `gh pr list --repo ${EMU_REPO} --head karicms --base main --state open --json number`,
      { cwd: CLONE_DIR, stdio: 'pipe', env: ghEnv },
    )
      .toString()
      .trim();
  } catch {
    console.warn('⚠️ gh 不可用或未登录，请手动创建 PR：');
    console.warn(`   https://github.com/${EMU_REPO}/compare/main...karicms`);
    return;
  }

  if (!prJson.startsWith('[')) {
    console.warn('⚠️ gh 返回异常，请手动创建 PR');
    return;
  }

  const prList = JSON.parse(prJson);
  if (prList.length > 0) {
    console.log(`ℹ️  已有 open PR #${prList[0].number}，push 已自动更新`);
    return;
  }

  console.log('🔍 创建 PR...');
  execSync(
    `gh pr create --repo ${EMU_REPO} --title "sync: 来自 karicms 的博客投稿" --body "🤖 自动化脚本：同步最新的实验室文章与关联图片。" --base main --head karicms`,
    { cwd: CLONE_DIR, stdio: 'inherit', env: ghEnv },
  );
  console.log('🎉 PR 已创建');
}

function getFileHash(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(buffer).digest('hex');
}

function diffImages(localImgDir, remoteImgDir) {
  const changedImages = [];

  if (!fs.existsSync(localImgDir)) {
    return { imagesChanged: false, changedImages };
  }

  for (const imageName of fs.readdirSync(localImgDir)) {
    const localImagePath = path.join(localImgDir, imageName);
    if (!fs.statSync(localImagePath).isFile()) continue;

    const remoteImagePath = path.join(remoteImgDir, imageName);
    if (!fs.existsSync(remoteImagePath) || getFileHash(localImagePath) !== getFileHash(remoteImagePath)) {
      changedImages.push(imageName);
      console.log(`   🖼️ [图片变动] ${imageName}`);
    }
  }

  return {
    imagesChanged: changedImages.length > 0,
    changedImages,
  };
}
