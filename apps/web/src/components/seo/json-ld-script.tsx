interface JsonLdScriptProps {
  data: object;
}

/** Injeta um bloco `<script type="application/ld+json">` a partir de um builder de lib/seo/json-ld.ts. */
export function JsonLdScript({ data }: JsonLdScriptProps) {
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
