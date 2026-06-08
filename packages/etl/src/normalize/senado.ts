import type { SenadoSenador } from "../sources/senado/senado";

export interface NormalizedSenador {
  senadoId: string;
  name: string;
  slug: string;
  siglaPartido: string;
  siglaUf: string;
  photoUrl: string;
}

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function toTitleCase(str: string): string {
  const lowers = new Set(["da", "de", "do", "das", "dos", "e", "em"]);
  return str
    .toLowerCase()
    .split(" ")
    .map((word, i) =>
      i === 0 || !lowers.has(word)
        ? word.charAt(0).toUpperCase() + word.slice(1)
        : word,
    )
    .join(" ");
}

export function normalizeSenador(s: SenadoSenador): NormalizedSenador {
  return {
    senadoId: s.CodigoParlamentar,
    name: toTitleCase(s.NomeParlamentar),
    slug: slugify(s.NomeParlamentar),
    siglaPartido: s.SiglaPartidoParlamentar,
    siglaUf: s.UfParlamentar,
    photoUrl: s.UrlFotoParlamentar ?? "",
  };
}
