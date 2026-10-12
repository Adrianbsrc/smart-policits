import { Routes } from "@/routes";
import { SITE_DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from "./site-config";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface PersonJsonLdInput {
  name: string;
  path: string;
  description?: string;
  image?: string;
  jobTitle?: string;
  affiliation?: string;
}

/** JSON-LD `WebSite`, com `SearchAction` apontando para o ranking (busca do site). */
export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DEFAULT_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl(Routes.ranking())}?search={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  } as const;
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
  } as const;
}

/** JSON-LD `BreadcrumbList` — usar em conjunto com o componente `Breadcrumb`. */
export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  } as const;
}

export interface FaqItem {
  question: string;
  answer: string;
}

/** JSON-LD `FAQPage` — a partir dos mesmos itens já renderizados na seção FAQ, sem duplicar conteúdo. */
export function buildFaqPageJsonLd(items: readonly FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  } as const;
}

/**
 * JSON-LD `Person` — preparado para perfis políticos (qualquer domínio:
 * PoliticalProfile ou Politician legado). Nenhum dado específico é
 * preenchido aqui, apenas a estrutura.
 */
export function buildPersonJsonLd(input: PersonJsonLdInput) {
  const { name, path, description, image, jobTitle, affiliation } = input;
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url: absoluteUrl(path),
    ...(description && { description }),
    ...(image && { image }),
    ...(jobTitle && { jobTitle }),
    ...(affiliation && { affiliation: { "@type": "Organization", name: affiliation } }),
  } as const;
}
