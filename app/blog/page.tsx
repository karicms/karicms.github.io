import Link from "next/link";
import { listBlogPosts } from "@/lib/blog";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "博客",
  description: `${siteConfig.name} 的技术博客与实战记录。`,
};

export default function BlogIndexPage() {
  const posts = listBlogPosts();

  return (
    <div className="space-y-10">
      <header className="geek-panel rounded-2xl px-6 py-8 sm:px-8">
        <p className="geek-chip text-[#00ff88]">$ tail -f ~/blog/*.md</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">技术博客</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#8b8b96]">
          文章源来自{" "}
          <a
            href={siteConfig.blogRepoUrl}
            className="geek-link"
            target="_blank"
            rel="noreferrer"
          >
            EMU-Stu-Blog
          </a>
          ，build 时自动拉取 author=&quot;{siteConfig.blogAuthor}&quot; 的投稿并静态渲染。
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {posts.length === 0 ? (
          <p className="text-sm text-[#8b8b96]">
            暂无文章。向 EMU-Stu-Blog 投稿时在 frontmatter 填写 author: {siteConfig.blogAuthor} 即可同步。
          </p>
        ) : (
          posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="geek-panel geek-panel-glow group rounded-2xl p-6 transition duration-300"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#8b8b96]">
                <span className="geek-chip rounded border border-[rgba(0,255,136,0.12)] px-2 py-0.5">
                  {post.category}
                </span>
                <span>{post.date}</span>
              </div>
              <h2 className="mt-3 text-xl font-semibold text-[#e8e8ed] group-hover:text-[#00ff88]">
                {post.title}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#8b8b96]">
                {post.excerpt}
              </p>
              <p className="mt-4 font-mono text-xs text-[#00ff88] opacity-0 transition group-hover:opacity-100">
                → read()
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
