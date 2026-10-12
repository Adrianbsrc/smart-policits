export { SITE_URL, SITE_NAME, SITE_LOCALE, SITE_DEFAULT_TITLE, SITE_DEFAULT_DESCRIPTION, absoluteUrl } from "./site-config";
export { buildMetadata } from "./metadata";
export type { PageMetadataInput, PageMetadataImage, PageOpenGraphType } from "./metadata";
export {
  buildWebsiteJsonLd,
  buildOrganizationJsonLd,
  buildBreadcrumbJsonLd,
  buildPersonJsonLd,
  buildFaqPageJsonLd,
} from "./json-ld";
export type { BreadcrumbItem, PersonJsonLdInput, FaqItem } from "./json-ld";
