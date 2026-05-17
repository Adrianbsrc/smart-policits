import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { Office, PartyIdeology } from "../generated/prisma/enums";
import { calculateScoreFromMock } from "../../scoring/index";

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"]! });
const prisma = new PrismaClient({ adapter });

const PARTIES = [
  { name: "Partido dos Trabalhadores", acronym: "PT", colorHex: "#CC0000", ideology: PartyIdeology.left },
  { name: "Partido Liberal", acronym: "PL", colorHex: "#003580", ideology: PartyIdeology.right },
  { name: "União Brasil", acronym: "UNIÃO", colorHex: "#002868", ideology: PartyIdeology.center_right },
  { name: "Movimento Democrático Brasileiro", acronym: "MDB", colorHex: "#0D6EFD", ideology: PartyIdeology.center },
  { name: "Progressistas", acronym: "PP", colorHex: "#005EA6", ideology: PartyIdeology.center_right },
  { name: "Partido Social Democrático", acronym: "PSD", colorHex: "#009C3B", ideology: PartyIdeology.center },
  { name: "Partido da Social Democracia Brasileira", acronym: "PSDB", colorHex: "#006DB3", ideology: PartyIdeology.center },
  { name: "Partido Socialista Brasileiro", acronym: "PSB", colorHex: "#E8003D", ideology: PartyIdeology.center_left },
  { name: "Partido Democrático Trabalhista", acronym: "PDT", colorHex: "#006D77", ideology: PartyIdeology.center_left },
  { name: "Republicanos", acronym: "REPUBLICANOS", colorHex: "#0B6623", ideology: PartyIdeology.center_right },
  { name: "Partido Novo", acronym: "NOVO", colorHex: "#FF6600", ideology: PartyIdeology.right },
  { name: "Partido Socialismo e Liberdade", acronym: "PSOL", colorHex: "#FFCC00", ideology: PartyIdeology.far_left },
  { name: "Avante", acronym: "AVANTE", colorHex: "#1A7EC8", ideology: PartyIdeology.center_left },
  { name: "Rede Sustentabilidade", acronym: "REDE", colorHex: "#00A859", ideology: PartyIdeology.center_left },
  { name: "Podemos", acronym: "PODE", colorHex: "#FF4B00", ideology: PartyIdeology.center },
] as const;

interface SeedCandidate {
  name: string;
  partyAcronym: string;
  office: Office;
  state?: string;
  tseId?: string;
  photoUrl?: string;
  bio: string;
  seedN: number;
}

const CANDIDATES: SeedCandidate[] = [
  {
    name: "Luiz Inácio Lula da Silva",
    partyAcronym: "PT",
    office: Office.president,
    tseId: "000000001",
    bio: "35º Presidente da República Federativa do Brasil. Ex-presidente de 2003 a 2010. Fundador do Partido dos Trabalhadores. Histórico de políticas de distribuição de renda e redução da pobreza.",
    seedN: 1,
  },
  {
    name: "Geraldo Alckmin",
    partyAcronym: "PSB",
    office: Office.governor,
    state: "SP",
    tseId: "000000002",
    bio: "Vice-Presidente da República e ex-Governador de São Paulo. Médico e político com mais de três décadas de experiência em gestão pública estadual.",
    seedN: 2,
  },
  {
    name: "Simone Tebet",
    partyAcronym: "MDB",
    office: Office.senator,
    state: "MS",
    tseId: "000000003",
    bio: "Senadora pelo Mato Grosso do Sul e ex-candidata à Presidência da República. Professora universitária e defensora da pauta fiscal e educacional.",
    seedN: 3,
  },
  {
    name: "Rodrigo Pacheco",
    partyAcronym: "PSD",
    office: Office.senator,
    state: "MG",
    tseId: "000000004",
    bio: "Presidente do Senado Federal. Senador por Minas Gerais, advogado e professor. Defensor da reforma tributária e modernização institucional.",
    seedN: 4,
  },
  {
    name: "Renan Calheiros",
    partyAcronym: "MDB",
    office: Office.senator,
    state: "AL",
    tseId: "000000005",
    bio: "Senador por Alagoas com décadas de experiência parlamentar. Ex-presidente do Senado Federal em múltiplas oportunidades. Atuação nas comissões de Constituição e Justiça.",
    seedN: 5,
  },
  {
    name: "Tarcísio de Freitas",
    partyAcronym: "REPUBLICANOS",
    office: Office.governor,
    state: "SP",
    tseId: "000000006",
    bio: "Governador do Estado de São Paulo. Ex-ministro da Infraestrutura. Engenheiro militar com histórico de obras de infraestrutura e concessões.",
    seedN: 6,
  },
  {
    name: "Romeu Zema",
    partyAcronym: "NOVO",
    office: Office.governor,
    state: "MG",
    tseId: "000000007",
    bio: "Governador de Minas Gerais. Empresário do setor agropecuário. Defensor da austeridade fiscal e da redução do papel do Estado.",
    seedN: 7,
  },
  {
    name: "Eduardo Leite",
    partyAcronym: "PSDB",
    office: Office.governor,
    state: "RS",
    tseId: "000000008",
    bio: "Governador do Rio Grande do Sul. Advogado e ex-prefeito de Pelotas. Referência em reformas de gestão pública e responsabilidade fiscal.",
    seedN: 8,
  },
  {
    name: "Gleisi Hoffmann",
    partyAcronym: "PT",
    office: Office.federal_deputy,
    state: "PR",
    tseId: "000000009",
    bio: "Deputada Federal pelo Paraná e presidenta nacional do Partido dos Trabalhadores. Ex-ministra da Casa Civil. Atuação em direitos trabalhistas e proteção social.",
    seedN: 9,
  },
  {
    name: "Tabata Amaral",
    partyAcronym: "PSB",
    office: Office.federal_deputy,
    state: "SP",
    tseId: "000000010",
    bio: "Deputada Federal por São Paulo. Física e astrofísica formada pelo MIT. Militante da educação pública de qualidade e reforma educacional.",
    seedN: 10,
  },
  {
    name: "André Janones",
    partyAcronym: "AVANTE",
    office: Office.federal_deputy,
    state: "MG",
    tseId: "000000011",
    bio: "Deputado Federal por Minas Gerais. Ex-candidato à Presidência da República. Engenheiro e comunicador, defensor de políticas de renda básica.",
    seedN: 11,
  },
  {
    name: "Kim Kataguiri",
    partyAcronym: "UNIÃO",
    office: Office.federal_deputy,
    state: "SP",
    tseId: "000000012",
    bio: "Deputado Federal por São Paulo. Co-fundador do Movimento Brasil Livre. Economista e defensor do liberalismo econômico e liberdade individual.",
    seedN: 12,
  },
  {
    name: "Marina Silva",
    partyAcronym: "REDE",
    office: Office.senator,
    state: "AC",
    tseId: "000000013",
    bio: "Ministra do Meio Ambiente e ex-senadora pelo Acre. Ex-candidata à Presidência da República em múltiplas oportunidades. Referência mundial em pauta ambiental.",
    seedN: 13,
  },
  {
    name: "Ciro Gomes",
    partyAcronym: "PDT",
    office: Office.federal_deputy,
    state: "CE",
    tseId: "000000014",
    bio: "Deputado Federal pelo Ceará. Ex-governador, ex-ministro e ex-candidato à Presidência por quatro vezes. Economista e defensor do desenvolvimento nacional.",
    seedN: 14,
  },
  {
    name: "Alessandro Vieira",
    partyAcronym: "MDB",
    office: Office.senator,
    state: "SE",
    tseId: "000000015",
    bio: "Senador por Sergipe. Delegado de Polícia Federal aposentado. Atuação destacada no combate à corrupção e na transparência da gestão pública.",
    seedN: 15,
  },
  {
    name: "Paulo Paim",
    partyAcronym: "PT",
    office: Office.senator,
    state: "RS",
    tseId: "000000016",
    bio: "Senador pelo Rio Grande do Sul com décadas de mandato. Ex-deputado federal e defensor histórico dos direitos trabalhistas e da igualdade racial.",
    seedN: 16,
  },
  {
    name: "Soraya Thronicke",
    partyAcronym: "PODE",
    office: Office.senator,
    state: "MS",
    tseId: "000000017",
    bio: "Senadora pelo Mato Grosso do Sul. Advogada e ex-candidata à Presidência. Defensora da autonomia parlamentar e reforma política.",
    seedN: 17,
  },
  {
    name: "Flávio Dino",
    partyAcronym: "PSOL",
    office: Office.senator,
    state: "MA",
    tseId: "000000018",
    bio: "Ministro do STF e ex-senador pelo Maranhão. Ex-governador e ex-ministro da Justiça. Jurista com atuação em segurança pública e direitos fundamentais.",
    seedN: 18,
  },
  {
    name: "Josué Filho",
    partyAcronym: "UNIÃO",
    office: Office.state_deputy,
    state: "CE",
    tseId: "000000019",
    bio: "Deputado Estadual pelo Ceará. Servidor público e gestor municipal. Atuação em infraestrutura urbana e políticas de habitação.",
    seedN: 19,
  },
  {
    name: "Luciana Santos",
    partyAcronym: "PSB",
    office: Office.governor,
    state: "PE",
    tseId: "000000020",
    bio: "Vice-Governadora de Pernambuco. Professora universitária e dirigente partidária. Atuação em educação, ciência e tecnologia.",
    seedN: 20,
  },
];

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

async function main() {
  console.log("Seeding database...");

  // Upsert parties
  const partyMap = new Map<string, string>();
  for (const p of PARTIES) {
    const party = await prisma.party.upsert({
      where: { acronym: p.acronym },
      update: { name: p.name, colorHex: p.colorHex, ideology: p.ideology },
      create: { name: p.name, acronym: p.acronym, colorHex: p.colorHex, ideology: p.ideology },
    });
    partyMap.set(p.acronym, party.id);
    console.log(`  Party: ${p.acronym}`);
  }

  // Upsert candidates + scores
  for (const c of CANDIDATES) {
    const slug = slugify(c.name);
    const partyId = partyMap.get(c.partyAcronym);
    if (!partyId) {
      console.warn(`  Party not found: ${c.partyAcronym}`);
      continue;
    }

    const candidate = await prisma.candidate.upsert({
      where: { slug },
      update: { name: c.name, office: c.office, state: c.state, partyId, bio: c.bio, tseId: c.tseId },
      create: {
        name: c.name,
        slug,
        office: c.office,
        state: c.state,
        partyId,
        bio: c.bio,
        tseId: c.tseId,
        photoUrl: c.photoUrl,
      },
    });

    const scores = calculateScoreFromMock(c.seedN);
    await prisma.score.upsert({
      where: { candidateId: candidate.id },
      update: scores,
      create: { candidateId: candidate.id, ...scores },
    });

    console.log(`  Candidate: ${c.name} (${c.partyAcronym}) — score: ${scores.overall}`);
  }

  console.log("\nSeed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
