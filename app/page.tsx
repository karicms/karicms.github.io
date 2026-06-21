import Link from "next/link";
import { TerminalHero } from "@/components/TerminalHero";
import { ProjectCard } from "@/components/ProjectCard";
import { featuredProjects } from "@/data/projects";
import { profile } from "@/data/profile";
import { listBlogPosts } from "@/lib/blog";
import { siteConfig } from "@/lib/site-config";

export default function HomePage() {
  const posts = listBlogPosts().slice(0, 3);
  const featured = featuredProjects();

  return (
    <div className="space-y-16">
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="geek-chip mb-4 text-[#00ff88]">
            <span className="text-[#00d4ff]">const</span> developer = &quot;{siteConfig.handle}&quot;;
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-[#e8e8ed] sm:text-5xl lg:text-6xl">
            {siteConfig.name}
          </h1>
          <p className="mt-2 font-mono text-lg text-[#00d4ff] sm:text-xl">{siteConfig.title}</p>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#8b8b96]">
            {siteConfig.tagline}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/projects"
              className="inline-flex items-center justify-center rounded-lg bg-[#00ff88] px-5 py-2.5 font-mono text-sm font-medium text-[#07070d] transition hover:bg-[#00cc6a] hover:shadow-[0_0_24px_rgba(0,255,136,0.25)]"
            >
              查看项目
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center justify-center rounded-lg border border-[rgba(0,255,136,0.2)] px-5 py-2.5 font-mono text-sm text-[#00ff88] transition hover:border-[rgba(0,255,136,0.4)] hover:bg-[rgba(0,255,136,0.06)]"
            >
              阅读博客
            </Link>
            <a
              href={siteConfig.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-[rgba(0,212,255,0.15)] px-5 py-2.5 font-mono text-sm text-[#00d4ff] transition hover:border-[rgba(0,212,255,0.35)] hover:bg-[rgba(0,212,255,0.06)]"
            >
              GitHub ↗
            </a>
          </div>
        </div>
        <TerminalHero />
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="geek-chip text-[#00ff88]">// featured_projects</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">精选项目</h2>
          </div>
          <Link href="/projects" className="geek-chip geek-link">
            view_all() →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="geek-chip text-[#00ff88]">// recent_posts</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">最新文章</h2>
          </div>
          <Link href="/blog" className="geek-chip geek-link">
            read_more() →
          </Link>
        </div>
        {posts.length === 0 ? (
          <div className="geek-panel rounded-2xl p-6">
            <p className="text-sm text-[#8b8b96]">
              暂无文章。build 时会从 EMU-Stu-Blog 拉取 author=&quot;{siteConfig.blogAuthor}&quot; 的内容。
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="geek-panel geek-panel-glow group rounded-2xl p-5 transition duration-300"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#8b8b96]">
                  <span className="geek-chip rounded border border-[rgba(0,255,136,0.12)] px-2 py-0.5">
                    {post.category}
                  </span>
                  <span>{post.date}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-[#e8e8ed] group-hover:text-[#00ff88]">
                  {post.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#8b8b96]">
                  {post.excerpt}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="geek-panel rounded-2xl p-6 sm:p-8">
        <p className="geek-chip text-[#00ff88]">// skills[]</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {profile.skills.map((skill) => (
            <span
              key={skill}
              className="geek-chip rounded-lg border border-[rgba(0,212,255,0.12)] bg-[rgba(0,212,255,0.04)] px-3 py-1.5 text-[#8b8b96]"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
