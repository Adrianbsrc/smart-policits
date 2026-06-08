import type { Metadata } from "next";
import { BlogFeaturedPost } from "@/components/blog/blog-featured-post";
import { BlogPostCard } from "@/components/blog/blog-post-card";
import { BLOG_POSTS } from "@/lib/content/blog-posts";

export const metadata: Metadata = {
  title: "Blog — Smart Politics",
  description: "Análises, dados e insights sobre política brasileira e o cenário eleitoral.",
};

export default function BlogPage() {
  const [featured, ...rest] = BLOG_POSTS;

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="mb-12">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Blog</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Política com dados, não com opinião
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Análises baseadas em fontes públicas. Sem sensacionalismo, sem viés.
        </p>
      </div>

      {featured && <BlogFeaturedPost post={featured} />}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((post) => (
          <BlogPostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
