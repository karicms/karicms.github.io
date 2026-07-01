import fs from "fs";
import path from "path";
import matter from "gray-matter";

const articlesDir = path.join(process.cwd(), "content/blog/articles");

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  content: string;
};

function stripLeadingTitle(content: string): { title?: string; body: string } {
  const match = content.match(/^\s*#\s+(.+)\n+/);
  if (!match) return { body: content };
  return {
    title: match[1].trim(),
    body: content.slice(match[0].length),
  };
}

function autoExcerpt(body: string): string {
  const plain = body
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[[^\]]*\]\([^)]+\)/g, "$1")
    .replace(/[#>*_`~-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > 150 ? `${plain.slice(0, 150)}…` : plain;
}

function normalizeBlogImagePaths(content: string): string {
  return content.replace(
    /!\[([^\]]*)\]\((?!https?:\/\/)(\.\/)?images\/([^)]+)\)/g,
    "![$1](/blog-images/$3)",
  );
}

/** 个人站文章路由为 /blog/[slug]，将 EMU 主站格式转为本地格式 */
function normalizeBlogInternalLinks(content: string): string {
  return content.replace(
    /\]\(\/article\?slug=([a-z0-9-]+)\)/gi,
    "](/blog/$1)",
  );
}

/** YAML 中未加引号的 date 会被 gray-matter 解析为 Date，需统一转成 YYYY-MM-DD */
function normalizeFrontmatterDate(raw: unknown): string {
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    return raw.toISOString().slice(0, 10);
  }
  if (typeof raw === "string") {
    const match = raw.trim().match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }
  return new Date().toISOString().slice(0, 10);
}

function parseBlogFile(slug: string, raw: string): BlogPost {
  const { data, content: rawContent } = matter(raw);
  const { title: headingTitle, body } = stripLeadingTitle(rawContent);
  const title =
    (typeof data.title === "string" && data.title.trim()) ||
    headingTitle ||
    slug.replaceAll("-", " ");

  return {
    slug,
    title,
    excerpt:
      (typeof data.excerpt === "string" && data.excerpt.trim()) || autoExcerpt(body),
    category: typeof data.category === "string" ? data.category : "技术分享",
    author: typeof data.author === "string" ? data.author : "Anonymous",
    date: normalizeFrontmatterDate(data.date),
    content: normalizeBlogInternalLinks(normalizeBlogImagePaths(body)),
  };
}

export function listBlogPosts(): BlogPost[] {
  if (!fs.existsSync(articlesDir)) return [];

  return fs
    .readdirSync(articlesDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const slug = path.basename(f, ".md");
      const raw = fs.readFileSync(path.join(articlesDir, f), "utf8");
      return parseBlogFile(slug, raw);
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function readBlogPost(slug: string): BlogPost | null {
  const filePath = path.join(articlesDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  return parseBlogFile(slug, raw);
}
