# karicms.github.io

蔡明思（karicms）的个人网站，部署于 [https://karicms.github.io/](https://karicms.github.io/)。

## 功能

- **首页**：终端风格 Hero、精选项目、最新文章、技能标签
- **关于**：个人简介、教育背景、外链
- **项目**：AI Home、IoT Lab Web 等作品集
- **博客**：build 时从 [EMU-Stu-Blog](https://github.com/EMU-Stu/EMU-Stu-Blog) 拉取 `author: 蔡明思` 的文章

## 本地开发

```bash
npm install
npm run dev
```

`predev` / `prebuild` 会自动执行 `scripts/fetch-blog.mjs` 拉取博客内容。

## 部署

推送到 `main` 分支后，GitHub Actions 自动构建并发布到 GitHub Pages。

首次使用需在仓库 **Settings → Pages** 中将 Source 设为 **GitHub Actions**。

## 技术栈

Next.js 15 · React 19 · Tailwind CSS 4 · 静态导出 · GitHub Pages
