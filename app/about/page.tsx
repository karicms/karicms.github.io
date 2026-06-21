import { profile } from "@/data/profile";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于",
  description: `${siteConfig.name} 的个人简介、教育与技能。`,
};

export default function AboutPage() {
  return (
    <div className="space-y-10">
      <header>
        <p className="geek-chip text-[#00ff88]">$ cat about.md</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">关于我</h1>
        <p className="mt-3 max-w-2xl text-[#8b8b96]">
          {profile.role} · {profile.location}
        </p>
      </header>

      <section className="geek-panel rounded-2xl p-6 sm:p-8">
        <h2 className="font-mono text-sm text-[#00d4ff]">## bio</h2>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-[#8b8b96] sm:text-base">
          {profile.bio.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="geek-panel rounded-2xl p-6">
          <h2 className="font-mono text-sm text-[#00d4ff]">## education</h2>
          <ul className="mt-4 space-y-4">
            {profile.education.map((item) => (
              <li key={item.school} className="border-l-2 border-[rgba(0,255,136,0.2)] pl-4">
                <p className="font-semibold text-[#e8e8ed]">{item.school}</p>
                <p className="mt-1 text-sm text-[#8b8b96]">{item.degree}</p>
                <p className="geek-chip mt-1 text-[#00ff88]">{item.period}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="geek-panel rounded-2xl p-6">
          <h2 className="font-mono text-sm text-[#00d4ff]">## links</h2>
          <ul className="mt-4 space-y-3">
            {profile.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between rounded-lg border border-transparent px-3 py-2 transition hover:border-[rgba(0,255,136,0.12)] hover:bg-[rgba(0,255,136,0.04)]"
                >
                  <span className="text-[#e8e8ed] group-hover:text-[#00ff88]">{link.label}</span>
                  <span className="font-mono text-xs text-[#8b8b96]">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="geek-panel rounded-2xl p-6 sm:p-8">
        <h2 className="font-mono text-sm text-[#00d4ff]">## stack</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {profile.skills.map((skill) => (
            <div
              key={skill}
              className="flex items-center gap-2 rounded-lg bg-[rgba(0,0,0,0.25)] px-3 py-2"
            >
              <span className="text-[#00ff88]">▸</span>
              <span className="geek-chip text-[#8b8b96]">{skill}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
