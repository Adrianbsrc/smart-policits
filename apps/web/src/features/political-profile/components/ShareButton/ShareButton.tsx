"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ShareButtonProps {
  /** URL absoluta a ser copiada — a página é quem sabe montar (Routes + origin). */
  url: string;
  className?: string;
}

/**
 * Copia o link do perfil para a área de transferência, com feedback visual
 * temporário. Client Component isolado — o resto da página permanece Server
 * Component (ver HeroSection).
 */
export function ShareButton({ url, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-all hover:border-border-strong hover:bg-muted",
        className,
      )}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-success" />
          Link copiado!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          Compartilhar
        </>
      )}
    </button>
  );
}
