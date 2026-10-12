import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import type { PlaceholderSectionContent } from "./placeholder-content";

interface PlaceholderSectionProps {
  content: PlaceholderSectionContent;
}

/**
 * Shell reutilizado pelas seções ainda não implementadas do perfil político
 * (fora do escopo desta task). Evita duplicar markup entre Assessment,
 * Timeline, Promises, Indicators, Integrity e Sources.
 */
export function PlaceholderSection({ content }: PlaceholderSectionProps) {
  return (
    <section aria-labelledby={`${content.id}-heading`} className="scroll-mt-24">
      <GlassCard className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <h2 id={`${content.id}-heading`} className="text-lg font-semibold text-foreground">
            {content.title}
          </h2>
          <Badge variant="outline">Em breve</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{content.description}</p>
      </GlassCard>
    </section>
  );
}
