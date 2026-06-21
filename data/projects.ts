export type Project = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  tags: string[];
  href: string;
  status: "active" | "maintained" | "archived";
  featured?: boolean;
};

export const projects: Project[] = [
  {
    slug: "ai-home",
    title: "AI Home",
    tagline: "ESP32 + MQTT + Spring AI 智能家居",
    description:
      "多端联动的毕业设计级智能家居系统：ESP32 执行/感知双板、Spring Boot 后端统一 Topic 路由、Vue 管理端与微信小程序，AI 助手支持自然语言控制灯、门、空调与天气查询。",
    tags: ["ESP32", "MQTT", "Spring Boot", "Spring AI", "Vue 3", "微信小程序"],
    href: "https://github.com/karicms/AI-HOME",
    status: "active",
    featured: true,
  },
  {
    slug: "iot-lab-web",
    title: "IoT Lab Web",
    tagline: "实验室门户 · 静态站点",
    description:
      "为 EMU-Stu 物联网实验室搭建的新生导览站：未来指引、技术博客、学长学姐联络。Build 时从 EMU-Stu-Blog 按 labs 字段过滤文章，GitHub Pages 零成本部署。",
    tags: ["Next.js", "GitHub Pages", "Markdown", "GitHub Actions"],
    href: "https://github.com/EMU-Stu/IOT-lab-web",
    status: "maintained",
    featured: true,
  },
  {
    slug: "lab-pulse",
    title: "Lab Pulse",
    tagline: "GitHub 风格贡献热力图",
    description:
      "汇总实验室 Git 提交与博客发文，生成 lab-stats.json，在门户首页渲染 GitHub 风格热力图——完全静态导出友好，不依赖外部 CDN 数据分支。",
    tags: ["Next.js", "Node.js", "Data Viz", "Static Export"],
    href: "https://emu-stu.github.io/IOT-lab-web/",
    status: "maintained",
    featured: true,
  },
  {
    slug: "blog-automation",
    title: "Blog Auto-Fetch",
    tagline: "内容仓库 + 展示仓库分离",
    description:
      "为实验室站点实现 build 前自动 clone EMU-Stu-Blog、按 frontmatter 过滤、图片路径重写，解决 Next.js 静态导出 + GitHub Pages 子路径下的博客同步问题。",
    tags: ["Node.js", "gray-matter", "CI/CD"],
    href: "https://github.com/EMU-Stu/IOT-lab-web",
    status: "maintained",
  },
];

export function featuredProjects(): Project[] {
  return projects.filter((p) => p.featured);
}
