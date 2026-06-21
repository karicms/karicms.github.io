import type { Project } from "@/data/projects";

const statusLabel: Record<Project["status"], string> = {
  active: "ACTIVE",
  maintained: "MAINTAINED",
  archived: "ARCHIVED",
};

const statusColor: Record<Project["status"], string> = {
  active: "text-[#00ff88]",
  maintained: "text-[#00d4ff]",
  archived: "text-[#8b8b96]",
};

type Props = {
  project: Project;
};

export function ProjectCard({ project }: Props) {
  return (
    <a
      href={project.href}
      target="_blank"
      rel="noreferrer"
      className="geek-panel geek-panel-glow group flex h-full flex-col rounded-2xl p-6 transition duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="geek-chip text-[#00d4ff]">{project.tagline}</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-[#e8e8ed] group-hover:text-[#00ff88]">
            {project.title}
          </h3>
        </div>
        <span className={`geek-chip flex items-center gap-1.5 ${statusColor[project.status]}`}>
          <span className={`geek-status-dot h-1.5 w-1.5 rounded-full bg-current ${statusColor[project.status]}`} />
          {statusLabel[project.status]}
        </span>
      </div>
      <p className="mt-4 flex-1 text-sm leading-relaxed text-[#8b8b96]">{project.description}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="geek-chip rounded border border-[rgba(0,255,136,0.12)] bg-[rgba(0,255,136,0.04)] px-2 py-1 text-[#8b8b96]"
          >
            {tag}
          </span>
        ))}
      </div>
      <p className="mt-5 font-mono text-xs text-[#00ff88] opacity-0 transition group-hover:opacity-100">
        → open_repo()
      </p>
    </a>
  );
}
