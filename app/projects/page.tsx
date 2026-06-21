import { ProjectCard } from "@/components/ProjectCard";
import { projects } from "@/data/projects";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "项目",
  description: `${siteConfig.name} 参与和构建的开源项目与实验。`,
};

export default function ProjectsPage() {
  return (
    <div className="space-y-10">
      <header className="geek-panel rounded-2xl px-6 py-8 sm:px-8">
        <p className="geek-chip text-[#00ff88]">$ ls ~/projects/</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">项目</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#8b8b96] sm:text-base">
          从嵌入式固件到云端 AI Agent，从实验室基础设施到个人毕业设计——这里是我正在做、或持续维护的一些东西。
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
}
