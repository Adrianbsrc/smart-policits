import Link from "next/link";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_VARIANTS, type BlogPost } from "@/lib/content/blog-posts";
import { Routes } from "@/routes";

interface BlogFeaturedPostProps {
  post: BlogPost;
}

export function BlogFeaturedPost({ post }: BlogFeaturedPostProps) {
  return (
    <Link
      href={Routes.blogPost(post.slug)}
      className="group mb-10 block overflow-hidden rounded-2xl border border-border bg-background transition-all hover:border-border-strong hover:shadow-lg"
    >
      <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start">
        <div className="flex-1">
          <div className="mb-3 flex items-center gap-2">
            <Badge variant={CATEGORY_VARIANTS[post.category] ?? "default"}>{post.category}</Badge>
            <span className="text-xs text-muted-foreground">Destaque</span>
          </div>
          <h2 className="text-xl font-bold text-foreground transition-colors group-hover:text-primary sm:text-2xl">
            {post.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
          <div className="mt-4 flex items-center gap-4">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime} de leitura
            </span>
            <span className="text-xs text-muted-foreground">{post.date}</span>
          </div>
        </div>
        <div className="flex h-32 w-full shrink-0 items-center justify-center rounded-xl bg-primary/5 sm:h-40 sm:w-40">
          <span className="text-4xl">📊</span>
        </div>
      </div>
    </Link>
  );
}
