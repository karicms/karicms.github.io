import { siteConfig } from "@/lib/site-config";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[rgba(0,255,136,0.08)] bg-[#07070d]/90">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="geek-chip text-[#8b8b96]">
          <span className="text-[#00ff88]">$</span> echo &quot;© {year} {siteConfig.name}&quot;
        </p>
        <div className="flex flex-wrap gap-4">
          <a href={siteConfig.github} className="geek-chip geek-link" target="_blank" rel="noreferrer">
            github.com/{siteConfig.handle}
          </a>
          <a href={siteConfig.blogRepoUrl} className="geek-chip geek-link" target="_blank" rel="noreferrer">
            EMU-Stu-Blog
          </a>
        </div>
      </div>
    </footer>
  );
}
