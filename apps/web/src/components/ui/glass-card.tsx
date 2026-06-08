import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  /** Remove o padding padrão */
  noPadding?: boolean;
  /** Aplica borda colorida no topo */
  accentColor?: string;
  as?: React.ElementType;
}

export function GlassCard({
  children,
  className,
  noPadding = false,
  accentColor,
  as: Tag = "div",
}: GlassCardProps) {
  return (
    <Tag
      className={cn(
        "glass rounded-2xl",
        !noPadding && "p-5",
        className,
      )}
      style={accentColor ? { borderTop: `3px solid ${accentColor}` } : undefined}
    >
      {children}
    </Tag>
  );
}
