// 构建 / 开发前从 EMU-Stu-Blog 拉取本人文章，同步图片到 public/blog-images。
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const REPO = process.env.BLOG_REPO ?? "https://github.com/EMU-Stu/EMU-Stu-Blog.git";
const BRANCH = process.env.BLOG_BRANCH ?? "main";
const AUTHOR = process.env.BLOG_AUTHOR ?? "蔡明思";
const BLOG_CACHE = path.join(root, "content", ".blog-cache");
const ARTICLES_SRC = path.join(BLOG_CACHE, "articles");
const ARTICLES_DST = path.join(root, "content", "blog", "articles");
const IMAGES_SRC = path.join(ARTICLES_SRC, "images");
const IMAGES_DST = path.join(root, "public", "blog-images");

const git = (args, opts = {}) => execFileSync("git", args, { stdio: "inherit", ...opts });

function syncAuthorArticles() {
  if (!existsSync(ARTICLES_SRC)) {
    console.warn("[fetch-blog] 未找到远程 articles/，保留仓库内已有文章");
    return 0;
  }

  mkdirSync(ARTICLES_DST, { recursive: true });

  let count = 0;
  for (const file of readdirSync(ARTICLES_SRC)) {
    if (!file.endsWith(".md")) continue;
    const raw = readFileSync(path.join(ARTICLES_SRC, file), "utf8");
    const { data } = matter(raw);
    if (data.author !== AUTHOR) continue;
    writeFileSync(path.join(ARTICLES_DST, file), raw);
    count += 1;
  }
  return count;
}

try {
  if (existsSync(path.join(BLOG_CACHE, ".git"))) {
    console.log(`[fetch-blog] 已存在 blog-cache，拉取最新 ${BRANCH} …`);
    git(["fetch", "--depth", "1", "origin", BRANCH], { cwd: BLOG_CACHE });
    git(["reset", "--hard", `origin/${BRANCH}`], { cwd: BLOG_CACHE });
  } else {
    console.log(`[fetch-blog] 克隆 ${REPO} → content/.blog-cache/ …`);
    rmSync(BLOG_CACHE, { recursive: true, force: true });
    mkdirSync(path.dirname(BLOG_CACHE), { recursive: true });
    git(["clone", "--depth", "1", "--branch", BRANCH, REPO, BLOG_CACHE]);
  }

  const count = syncAuthorArticles();
  if (count > 0) {
    console.log(`[fetch-blog] 已同步 ${count} 篇 author="${AUTHOR}" 的文章`);
  } else {
    console.log(`[fetch-blog] 远程无匹配文章，保留 content/blog/articles/ 内已有内容`);
  }

  rmSync(IMAGES_DST, { recursive: true, force: true });
  mkdirSync(IMAGES_DST, { recursive: true });

  if (existsSync(IMAGES_SRC)) {
    for (const file of readdirSync(IMAGES_SRC)) {
      cpSync(path.join(IMAGES_SRC, file), path.join(IMAGES_DST, file));
    }
    console.log(`[fetch-blog] 已同步 ${readdirSync(IMAGES_DST).length} 张图片 → public/blog-images/`);
  }

  console.log("[fetch-blog] 完成 ✓");
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error("[fetch-blog] 失败:", message);
  process.exit(1);
}
