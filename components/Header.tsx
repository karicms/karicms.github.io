import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

const nav = [
  { href: "/about", label: "关于" },
  { href: "/projects", label: "项目" },
  { href: "/blog", label: "博客" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[rgba(0,255,136,0.08)] bg-[#07070d]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(0,255,136,0.2)] bg-[rgba(0,255,136,0.06)] font-mono text-xs font-bold text-[#00ff88] transition group-hover:border-[rgba(0,255,136,0.4)] group-hover:shadow-[0_0_16px_rgba(0,255,136,0.15)]">
            K
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight text-[#e8e8ed]">
              {siteConfig.handle}
            </span>
            <span className="geek-chip mt-0.5 text-[10px] text-[#8b8b96]">~/dev/null → home</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="geek-chip rounded-md px-3 py-1.5 text-[#8b8b96] transition hover:bg-[rgba(0,255,136,0.06)] hover:text-[#00ff88]"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={siteConfig.github}
            target="_blank"
            rel="noreferrer"
            className="ml-1 hidden rounded-md border border-[rgba(0,255,136,0.15)] px-3 py-1.5 font-mono text-xs text-[#00d4ff] transition hover:border-[rgba(0,212,255,0.35)] hover:bg-[rgba(0,212,255,0.06)] sm:inline-flex"
          >
            GitHub ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
