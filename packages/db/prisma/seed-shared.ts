/**
 * Utilitários e dados estáticos compartilhados entre os scripts de seed
 * (seed.ts, seed-political-profiles.ts). Evita duplicar PARTY_META/slugify.
 */

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export const PARTY_META: Record<string, { name: string; colorHex: string; ideology: string; number: number }> = {
  PT:            { name: "Partido dos Trabalhadores",               colorHex: "#CC0000", ideology: "left",         number: 13 },
  PL:            { name: "Partido Liberal",                         colorHex: "#003580", ideology: "right",        number: 22 },
  "UNIÃO":       { name: "União Brasil",                            colorHex: "#002868", ideology: "center_right", number: 44 },
  MDB:           { name: "Movimento Democrático Brasileiro",        colorHex: "#0D6EFD", ideology: "center",       number: 15 },
  PP:            { name: "Progressistas",                           colorHex: "#005EA6", ideology: "center_right", number: 11 },
  PSD:           { name: "Partido Social Democrático",               colorHex: "#009C3B", ideology: "center",       number: 55 },
  PSDB:          { name: "Partido da Social Democracia Brasileira",  colorHex: "#006DB3", ideology: "center_right", number: 45 },
  PSB:           { name: "Partido Socialista Brasileiro",            colorHex: "#E8003D", ideology: "center_left",  number: 40 },
  PDT:           { name: "Partido Democrático Trabalhista",          colorHex: "#006D77", ideology: "left",         number: 12 },
  REPUBLICANOS:  { name: "Republicanos",                             colorHex: "#0B6623", ideology: "center_right", number: 10 },
  NOVO:          { name: "Partido Novo",                             colorHex: "#FF6600", ideology: "right",        number: 30 },
  PSOL:          { name: "Partido Socialismo e Liberdade",           colorHex: "#FFCC00", ideology: "far_left",     number: 50 },
  SOLIDARIEDADE: { name: "Solidariedade",                            colorHex: "#00B0F0", ideology: "center_left",  number: 77 },
  PODE:          { name: "Podemos",                                  colorHex: "#FF4B00", ideology: "center",       number: 19 },
  AVANTE:        { name: "Avante",                                   colorHex: "#1A7EC8", ideology: "center_left",  number: 70 },
  REDE:          { name: "Rede Sustentabilidade",                    colorHex: "#00A859", ideology: "center_left",  number: 18 },
  PATRIOTA:      { name: "Patriota",                                 colorHex: "#006400", ideology: "right",        number: 51 },
  PCB:           { name: "Partido Comunista Brasileiro",             colorHex: "#8B0000", ideology: "far_left",     number: 21 },
  PCO:           { name: "Partido da Causa Operária",                colorHex: "#B00000", ideology: "far_left",     number: 29 },
};
