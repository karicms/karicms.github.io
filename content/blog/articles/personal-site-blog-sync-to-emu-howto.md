---
excerpt: "将个人网站的博客和组织的博客网站链接起来，实现在个人网页上传博客同时也提交给别的网站"
category: "技术分享"
author: "蔡明思"
labs: [IOT-Lab]
date: "2026-06-29"
---

# 个人站博客如何自动同步到 EMU-Stu-Blog

在 [上一篇文章](/blog/lab-web-blog-auto-fetch-howto) 里，IoT-lab-web 的做法是 **build 前从 EMU-Stu-Blog 拉文章**。个人站 [karicms.github.io](https://karicms.github.io/) 我把方向反过来了：

- **写作入口只有一个**：`content/blog/articles/`
- frontmatter **没有 `labs`** → 只出现在个人站
- frontmatter **有 `labs: [IoT-Lab]`** → 个人站展示 + 自动同步到 EMU-Stu-Blog → lab-web 按 `labs` 过滤后展示

这篇文章复盘 `scripts/sync-to-emu-blog.mjs` 的实现：本地筛选、内容 hash 对比、推 `karicms` 分支、自动开 PR。

## 整体链路

```mermaid
flowchart LR
  Write["karicms.github.io\ncontent/blog/"]
  Script["sync-to-emu-blog.mjs"]
  PR["EMU-Stu-Blog\nkaricms → main PR"]
  Notify["notify-main-site.yml"]
  Lab["IOT-lab-web 重建"]

  Write -->|push main| Script
  Script -->|push karicms| PR
  PR -->|merge| Notify
  Notify --> Lab
```

和 lab-web **拉取**相反，这里是 **推送**：

| 方向 | 仓库 | 触发 |
|------|------|------|
| 个人站 → EMU | `karicms.github.io` | `content/blog/**` push |
| EMU → lab-web | `EMU-Stu-Blog` main merge | 已有 `repository_dispatch` |

个人站 **不需要** 在 EMU 的 deploy 里配置「通知个人站」；你是源头，EMU 是下游。

## 文章怎么写：一个目录，两种去向

目录约定：

```text
content/blog/
  articles/
    my-post.md          # slug = 文件名
  images/               # 或用 public/blog-images/ 作 fallback
    screenshot.png
```

**只上个人站：**

```yaml
---
title: 随笔
category: 随笔
author: 蔡明思
date: 2026-06-20
---
```

**个人站 + 实验室门户：**

```yaml
---
title: 技术分享
category: 技术分享
author: 蔡明思
labs: [IoT-Lab]
date: 2026-06-20
---
```

脚本用 `gray-matter` 解析 frontmatter，只有 `labs` 非空数组的文章才进入同步队列。图片引用统一写 `./images/xxx.png`，脚本会从 `content/blog/images/` 或 `public/blog-images/` 解析源文件。

## 脚本四阶段

`sync-to-emu-blog.mjs` 可以拆成四步理解。

### 1. collect：筛 labs + 写影子目录

扫描 `content/blog/articles/*.md`，带 `labs` 的复制到临时目录 `content/.emu-blog-sync/articles/`，图片复制到 `.emu-blog-sync/articles/images/`。

影子目录每次运行前清空重建，**不提交进 git**（已写进 `.gitignore`）。

### 2. diff：和 EMU main 比 hash

浅克隆 `EMU-Stu/EMU-Stu-Blog` 到 `content/emu-blog-sync/`，逐篇对比 MD5：

| 状态 | 条件 |
|------|------|
| NEW | 远端无该 slug |
| UPDATED | 有文件但 hash 不同 |
| UNCHANGED | hash 相同，跳过 |

图片在**文章循环外**单独 `diffImages()`，对比整个 `images/` 目录。只要文章或图片任一有变，`needsSync = true`。

这样避免「只改了图、正文没变」却误判为无需同步。

### 3. publish：写入工作区并 push

有差异时，在 clone 目录里：

```text
git checkout -B karicms    # 从当前 main 重建固定分支
复制 pendingChanges 中的 md
复制 changedImages 中的图片
git add / commit / push -f origin karicms
```

只复制**有变动**的文件，不是整仓覆盖。`git status --porcelain` 为空则跳过 commit，防止 `nothing to commit` 报错。

CI 里 clone 需要 token，脚本读取环境变量：

```javascript
const token = process.env.EMU_SYNC_TOKEN ?? process.env.GH_TOKEN;
const EMU_REPO_URL = token
  ? `https://x-access-token:${token}@github.com/EMU-Stu/EMU-Stu-Blog.git`
  : `https://github.com/EMU-Stu/EMU-Stu-Blog.git';
```

### 4. PR：`gh` 查重后创建

```bash
gh pr list --repo EMU-Stu/EMU-Stu-Blog --head karicms --base main --state open
```

- 已有 open PR → push 后 diff 自动更新，不重复建
- 没有 → `gh pr create --base main --head karicms`

本地调试需 `gh auth login`；CI 里传 `GH_TOKEN` / `EMU_SYNC_TOKEN` 即可。

## GitHub Actions

`.github/workflows/sync-emu-blog.yml`：

```yaml
on:
  push:
    branches: [main]
    paths:
      - 'content/blog/**'
  workflow_dispatch:

jobs:
  sync:
    steps:
      - uses: actions/checkout@v4
      - run: sudo apt-get install -y gh
      - env:
          GH_TOKEN: ${{ secrets.EMU_SYNC_TOKEN }}
        run: gh auth setup-git
      - env:
          EMU_SYNC_TOKEN: ${{ secrets.EMU_SYNC_TOKEN }}
          GH_TOKEN: ${{ secrets.EMU_SYNC_TOKEN }}
        run: node scripts/sync-to-emu-blog.mjs
```

注意：

- `GITHUB_TOKEN` **只能操作当前仓库**，push 到 EMU-Stu-Blog 必须单独配 **`EMU_SYNC_TOKEN`**（PAT，需 Contents + Pull requests 写权限）
- 改脚本本身 **不会** 触发 sync（paths 只监听 `content/blog/**`），方便先把基础设施 merge 再改文章

与个人站 deploy 并行、互不影响：

```text
push main
  ├─ deploy.yml         → karicms.github.io 静态站
  └─ sync-emu-blog.yml  → EMU PR（仅 content/blog 变更时）
```

## 踩坑记录

写脚本过程中几个典型坑，供对照：

**1. `execFileSync` 参数必须是数组**

```javascript
// ❌ 会把整句命令当可执行文件名，ENOENT
execFileSync('git checkout -B karicms', gitOption);

// ✅
execFileSync('git', ['checkout', '-B', 'karicms'], gitOption);
```

**2. 图片路径**

文章里写 `./images/`，源文件可能在 `public/blog-images/`（个人站 build 用）。`resolveImageSource()` 按顺序 fallback，避免影子目录缺图导致后续 `copyFileSync` ENOENT。

**3. 正则捕获组**

匹配 Markdown 图片路径（形如 `./images/文件名.png`）时，正则需用 `([^)]+)` 捕获文件名，否则 `match[1]` 为 `undefined`，`path.join` 直接炸。

**4. `gh` 与 `git push` 是两套鉴权**

- `git push`：`EMU_SYNC_TOKEN` 写入 clone URL，或本地 `gh auth setup-git`
- `gh pr create`：读 `GH_TOKEN` 环境变量

**5. PR 变量名 typo**

`existingPrs` 和 `existingPs` 混用会导致 `JSON.parse` 失败；`gh` 失败时也不要对空数组 parse，应先判断类型。

## 和 lab-web 的关系

| 仓库 | 角色 |
|------|------|
| **karicms.github.io** | 写作源头，本地 Markdown |
| **EMU-Stu-Blog** | 组织级内容仓，PR 合入 main |
| **IOT-lab-web** | build 时 pull Blog，按 `labs: [IoT-Lab]` 过滤 |

个人文章与实验室文章**同一套 frontmatter 规范**，只靠 `labs` 字段分流。merge PR 后，EMU 现有的 `notify-main-site.yml` 会通知 lab-web 重建，无需额外配置。

## 小结

- 个人站 = **唯一写作入口**，不再从 EMU 拉博客
- `labs` = 同步开关 + lab-web 过滤条件
- 脚本 = collect → hash diff → push `karicms` → 自动 PR
- 生产依赖 `EMU_SYNC_TOKEN` + `sync-emu-blog.yml`

完整脚本见 [karicms.github.io/scripts/sync-to-emu-blog.mjs](https://github.com/karicms/karicms.github.io/blob/main/scripts/sync-to-emu-blog.mjs)。
