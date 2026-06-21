import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listBlogPosts, readBlogPost } from "@/lib/blog";
import { MarkdownBody } from "@/components/MarkdownBody";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = listBlogPosts();
  if (posts.length === 0) {
    return [{ slug: "__empty__" }];
  }
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = readBlogPost(slug);
  if (!post) return { title: "未找到" };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = readBlogPost(slug);
  if (!post) notFound();

  return (
    <article className="space-y-6">
      <Link href="/blog" className="geek-chip geek-link inline-flex">
        ← cd ../blog
      </Link>
      <div className="geek-panel rounded-2xl px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex flex-wrap items-center gap-2 text-sm text-[#8b8b96]">
          <span className="geek-chip rounded border border-[rgba(0,255,136,0.12)] px-2 py-0.5">
            {post.category}
          </span>
          <span>{post.date}</span>
          <span>{post.author}</span>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
        <div className="mt-8 border-t border-[rgba(0,255,136,0.08)] pt-8">
          <MarkdownBody content={post.content} />
        </div>
      </div>
    </article>
  );
}
