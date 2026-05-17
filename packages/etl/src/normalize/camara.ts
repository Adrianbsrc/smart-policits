import type { PartyIdeology } from "@smart-politics/db";

import type { CamaraDeputado } from "../sources/camara/camara";

export interface NormalizedDeputado {
  camaraId: number;
  name: string;
  slug: string;
  siglaPartido: string;
  siglaUf: string;
  photoUrl: string;
}

export interface NormalizedParty {
  acronym: string;
  name: string;
  colorHex: string;
  ideology: PartyIdeology;
}

// Canonical color per party acronym
const PARTY_COLORS: Record<string, string> = {
  PT: "#CC0000",
  PL: "#003580",
  "UNIÃO": "#002868",
  MDB: "#0D6EFD",
  PP: "#005EA6",
  PSD: "#009C3B",
  PSDB: "#006DB3",
  PSB: "#E8003D",
  PDT: "#006D77",
  REPUBLICANOS: "#0B6623",
  NOVO: "#FF6600",
  PSOL: "#FFCC00",
  AVANTE: "#1A7EC8",
  REDE: "#00A859",
  PODE: "#FF4B00",
  SOLIDARIEDADE: "#00B0F0",
  PCdoB: "#8B0000",
  PV: "#228B22",
  PRD: "#004080",
  PATRIOTA: "#006400",
  PTB: "#000080",
  PRTB: "#8B0000",
  DC: "#00529B",
  PMN: "#8B4513",
  PROS: "#E05D00",
  AGIR: "#FF8C00",
  CIDADANIA: "#0066CC",
};

const PARTY_IDEOLOGY: Record<string, PartyIdeology> = {
  PSOL: "far_left",
  PCdoB: "far_left",
  PT: "left",
  PDT: "left",
  PSB: "center_left",
  REDE: "center_left",
  AVANTE: "center_left",
  SOLIDARIEDADE: "center_left",
  PV: "center_left",
  PMN: "center_left",
  CIDADANIA: "center_left",
  MDB: "center",
  PSD: "center",
  PODE: "center",
  PRD: "center",
  AGIR: "center",
  PSDB: "center_right",
  PP: "center_right",
  REPUBLICANOS: "center_right",
  "UNIÃO": "center_right",
  PROS: "center_right",
  PL: "right",
  NOVO: "right",
  PTB: "right",
  PRTB: "right",
  DC: "right",
  PATRIOTA: "right",
};

// Display name for unknown parties (Câmara sigla → readable name when known)
const PARTY_NAMES: Record<string, string> = {
  PT: "Partido dos Trabalhadores",
  PL: "Partido Liberal",
  "UNIÃO": "União Brasil",
  MDB: "Movimento Democrático Brasileiro",
  PP: "Progressistas",
  PSD: "Partido Social Democrático",
  PSDB: "Partido da Social Democracia Brasileira",
  PSB: "Partido Socialista Brasileiro",
  PDT: "Partido Democrático Trabalhista",
  REPUBLICANOS: "Republicanos",
  NOVO: "Partido Novo",
  PSOL: "Partido Socialismo e Liberdade",
  AVANTE: "Avante",
  REDE: "Rede Sustentabilidade",
  PODE: "Podemos",
  SOLIDARIEDADE: "Solidariedade",
  PCdoB: "Partido Comunista do Brasil",
  PV: "Partido Verde",
  PRD: "Partido Renovação Democrática",
  PATRIOTA: "Patriota",
  PTB: "Partido Trabalhista Brasileiro",
  PRTB: "Partido Renovador Trabalhista Brasileiro",
  DC: "Democracia Cristã",
  PMN: "Partido da Mobilização Nacional",
  PROS: "Partido Republicano da Ordem Social",
  AGIR: "Agir",
  CIDADANIA: "Cidadania",
};

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function normalizeDeputado(dep: CamaraDeputado): NormalizedDeputado {
  return {
    camaraId: dep.id,
    name: toTitleCase(dep.nome),
    slug: slugify(dep.nome),
    siglaPartido: dep.siglaPartido,
    siglaUf: dep.siglaUf,
    photoUrl: dep.urlFoto,
  };
}

export function normalizeParty(acronym: string): NormalizedParty {
  return {
    acronym,
    name: PARTY_NAMES[acronym] ?? acronym,
    colorHex: PARTY_COLORS[acronym] ?? "#666666",
    ideology: PARTY_IDEOLOGY[acronym] ?? "center",
  };
}

function toTitleCase(str: string): string {
  const lowers = new Set(["da", "de", "do", "das", "dos", "e", "em"]);
  return str
    .toLowerCase()
    .split(" ")
    .map((word, i) => (i === 0 || !lowers.has(word) ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(" ");
}
