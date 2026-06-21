---
excerpt: "复盘：GitHub Pages 部署 Next.js 静态站点，热力图 404 蒸发事件"
category: "技术分享"
author: "蔡明思"
labs: [IOT-Lab]
date: "2026-06-20"
---

之前在做物联网实验室网站 `lab-web` 的全景热力图时，遇到了一个特玄学的 Bug：

在本地跑 `npm run dev` 的时候，热力图格子红红绿绿显示得完全正常。但是当我把代码 push 到 GitHub，通过 Actions 自动化部署到 GitHub Pages 之后，线上的热力图就死活显示 **「数据暂不可用」**。

当时我上去查了一下，发现后端分发过来的 `lab-stats.json` 静态数据文件明明在线上物理存在。但诡异的是，线上浏览器去 fetch 这个 JSON 的时候，路径直接把我们的子路径 `/IOT-lab-web` 给丢了，一头撞向根域名，当场报了 **404**。

顺着代码摸过去，最后发现原因出在 `site-config.js` 的环境配置上。



## 🔎 一、 案发现场：代码在“两个世界”里的物理隔离


我们最初在 `site-config.js` 里，是这样给 GitHub Pages 子路径配 `basePath` 的：

```typescript// 修复前的写法export const repoName = "IOT-lab-web";const isGithubPages = process.env.GITHUB_PAGES === "true";export const siteConfig = {  basePath: isGithubPages ? `/${repoName}` : ""};

而在热力图组件 `ContributionHeatmap.tsx` 里面，我们是用这行变量来手写原生 `fetch` 请求的：

TypeScript

```
// 客户端热力图组件里的请求逻辑
const url = `${siteConfig.basePath}/lab-stats.json`;
fetch(url, { cache: "no-store" })
  .then((res) => res.json())
  .then((data) => setStats(data))
  .catch(() => setError(true));
```

这个逻辑看着很顺，但实际上我们的站点是在**两个完全独立的世界**里运行的：

1. **远端 GitHub Actions 服务器（编译期）**：我们在 `deploy.yml` 里配了 `GITHUB_PAGES: "true"`，相当于在 Actions 的 Linux 服务器里写了全局变量。这时候运行 `npm run build`，Node.js 确实能读到它，打包出来的静态 HTML 基础路径也没错。

2. **用户浏览器（运行时）**：热力图是一个客户端组件（带有 `"use client"`）。当用户打开网页执行这段 JS 去 fetch 数据时，是在他自己的浏览器沙盒里跑的。

**这时候，浏览器上哪去读 `process.env.GITHUB_PAGES`？根本读不到。**

Next.js 底层的打包器（Webpack / Turbopack）有一条硬性安全防线：为了防止开发者的敏感机密（比如数据库密码、私人 Token）泄露到外网，**凡是不带特定前缀的普通环境变量，在打包发往浏览器时，绝对不会被替换成具体的值，而是原封不动地保留一串死字符。**

于是，浏览器运行代码时发现 `process` 直接是 `undefined`，三元表达式不成立，`basePath` 瞬间“蒸发”成了空字符串 `""`。原生 `fetch()` 沦为 `fetch("/lab-stats.json")`，直接在根域名里迷路 404 了。

> 💡 **顺便提一嘴**：为什么网站别的组件（比如 `<Link>`）不需要手动加前缀也能活？因为 Next.js 自带的路由组件有特权，框架会自动把 `basePath` 注入到 React Context 里帮它拼接。而原生的 `fetch` 属于浏览器标准 API，框架管不到它，必须由我们手动把 `basePath` 拼齐。

## 🛠️ 二、 修复方案：用短路求值做一套双保险配置

既然知道了原理，解决起来就很快了。我们利用 **空值合并运算符（`??`）** 配合 Next.js 官方的 **`NEXT_PUBLIC_` 通行证**，把 `site-config.js` 改造了一下：

TypeScript

```
// ✅ 修复后的完美配置
export const repoName = "IOT-lab-web";

export const siteConfig = {
  basePath:
    process.env.NEXT_PUBLIC_BASE_PATH ??
    (process.env.GITHUB_PAGES === "true" ? `/${repoName}` : ""),
};
```

这行代码利用了 JavaScript 的 **“短路求值”** 特性，直接把“远端构建”和“浏览器运行”两个环境都兼顾到了：

### 1. 线上浏览器运行时

因为我们在 Actions 编译时注入了 `NEXT_PUBLIC_BASE_PATH: /IOT-lab-web`，带有前缀。Next.js 的编译器直接在打包时玩了一场“文本替换”魔术，把这个值硬编码塞进了 JS 束。

浏览器拿到的真实代码其实长这样：

JavaScript

```
basePath: "/IOT-lab-web" ?? (process.env.GITHUB_PAGES === "true" ? "/IOT-lab-web" : "")
```

浏览器从左往右执行，看到左边的 `"/IOT-lab-web"` 是一个合法字符串。根据 `??` 的规则，**直接采用左边，右边那半句直接短路作废！** 浏览器成功拿到前缀，完美的绕过了右边会变成 `undefined` 的雷区。

### 2. Actions 远端编译时

在 Actions 跑构建的一瞬间，核心文件 `next.config.ts` 也要读取这个配置。

因为 Node.js 在服务器上能通吃所有变量，如果左边没配，`??` 就会激活右边。右边靠着服务器上的 `process.env.GITHUB_PAGES === "true"` 精准接盘，依旧能算出 `"/IOT-lab-web"`，保证静态打包时 HTML 的路径也是对的。

### 3. 本地开发调试时（`npm run dev`）

我们在本地电脑上写代码，这两个变量我们都没配。

代码左边为 `undefined`，走向右边；右边判定也是 `false`，最后一路畅通地输出空字符串 `""`。完美适配本地的 `localhost:3000`。

## 🎯 三、 总结

这次热力图 404 的排查，留下的教训很直接：

1. **凡是 Client Component 里要用到的、跟动态路径或 API 拼接有关的配置变量，必须加 `NEXT_PUBLIC_` 前缀。**

2. **本地 `dev` 是活的（有 Node 进程在背后随时打补丁），线上 `build` 是死的一锤子买卖（变量直接被固化替换成死文本）。永远不要拿本地 dev 的理所当然，去挑战线上的静态打包规则。**

把配置 commit 顺手一推，等远端 Actions 跑完，实验室全景热力图瞬间全盘亮起！搞定，收工！
