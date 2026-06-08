import Link from "next/link";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_VARIANTS, type BlogPost } from "@/lib/content/blog-posts";

interface BlogPostCardProps {
  post: BlogPost;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-background p-5 transition-all hover:border-border-strong hover:shadow-md"
    >
      <Badge variant={CATEGORY_VARIANTS[post.category] ?? "default"} className="w-fit">
        {post.category}
      </Badge>
      <h3 className="font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
        {post.title}
      </h3>
      <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">{post.excerpt}</p>
      <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {post.readTime}
        </span>
        <span className="text-xs text-muted-foreground">{post.date}</span>
      </div>
    </Link>
  );
}
