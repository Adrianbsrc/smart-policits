/**
 * Seed do domínio PoliticalProfile (V1) — docs/SPECs/political-profile.md.
 *
 * Popula PoliticalParty, PoliticalOffice, PoliticalProfile e Mandate a partir
 * dos mesmos dados estáticos usados pelo seed de Politician (GOVERNORS_SEED /
 * PRESIDENTS_SEED), sem tocar nas tabelas legadas. Chamado por seed.ts.
 */
import type { PrismaClient } from "../generated/prisma/client";
import { GOVERNORS_SEED, PRESIDENTS_SEED } from "../../etl/src/seeds/politicians";
import { PARTY_META, slugify } from "./seed-shared";

const ALL_SEEDS = [...GOVERNORS_SEED, ...PRESIDENTS_SEED];

const OFFICES_SEED = [
  { type: "president" as const, name: "Presidente da República", scope: "national" as const, termYears: 4 },
  { type: "governor" as const, name: "Governador", scope: "state" as const, termYears: 4 },
  { type: "mayor" as const, name: "Prefeito", scope: "municipal" as const, termYears: 4 },
  { type: "senator" as const, name: "Senador", scope: "national" as const, termYears: 8 },
  { type: "federal_deputy" as const, name: "Deputado Federal", scope: "national" as const, termYears: 4 },
  { type: "state_deputy" as const, name: "Deputado Estadual", scope: "state" as const, termYears: 4 },
];

interface KnownMandate {
  startDate: string;
  endDate: string | null;
  electionYear: number;
  endReason?: string;
}

/**
 * tseId dos únicos registros do seed onde office="president" corresponde a um
 * mandato presidencial real e verificável (os demais "pré-candidatos à
 * presidência" nunca ocuparam o cargo — não geram Mandate, só PoliticalProfile).
 */
const KNOWN_PRESIDENTIAL_MANDATES: Record<string, KnownMandate> = {
  "pres-001": { startDate: "2023-01-01", endDate: null, electionYear: 2022 }, // Lula — mandato em curso
  "pres-002": { startDate: "2019-01-01", endDate: "2023-01-01", electionYear: 2018, endReason: "term_end" }, // Bolsonaro
};

/** Data de filiação usada quando não há registro histórico verificável (apenas seed). */
const UNVERIFIED_AFFILIATION_START = "2019-01-01";

export async function seedPoliticalProfiles(prisma: PrismaClient): Promise<void> {
  console.log("\nSeeding PoliticalProfile domain...");

  // PoliticalParty
  const partyIdMap = new Map<string, string>();
  const partySiglas = [...new Set(ALL_SEEDS.map((s) => s.party))];
  for (const sigla of partySiglas) {
    const meta = PARTY_META[sigla];
    const name = meta?.name ?? sigla;
    const number = meta?.number ?? null;
    const party = await prisma.politicalParty.upsert({
      where: { acronym: sigla },
      update: { name, number },
      create: { acronym: sigla, name, number },
    });
    partyIdMap.set(sigla, party.id);
  }
  console.log(`  PoliticalParty: ${partyIdMap.size} partidos`);

  // PoliticalOffice
  const officeIdMap = new Map<string, string>();
  for (const o of OFFICES_SEED) {
    const office = await prisma.politicalOffice.upsert({
      where: { type: o.type },
      update: { name: o.name, scope: o.scope, termYears: o.termYears },
      create: o,
    });
    officeIdMap.set(o.type, office.id);
  }
  console.log(`  PoliticalOffice: ${officeIdMap.size} cargos`);

  // PoliticalProfile + Mandate
  let profileCount = 0;
  for (const s of ALL_SEEDS) {
    const partyId = partyIdMap.get(s.party);
    const officeId = officeIdMap.get(s.office);
    if (!partyId || !officeId) {
      console.warn(`  Party/Office não encontrado para "${s.name}" — pulando`);
      continue;
    }

    const slug = slugify(s.name);
    const status = (s.status ?? (s.office === "president" && !s.isPreCandidate ? "former" : "in_mandate")) as never;
    const isIncumbent = status === "in_mandate";

    const profileData = {
      fullName: s.name,
      displayName: s.name,
      biography: s.bio ?? null,
      photo: s.photoUrl ?? null,
      currentOfficeId: officeId,
      status,
      isCandidate: s.isPreCandidate ?? false,
      isIncumbent,
    };

    const profile = await prisma.politicalProfile.upsert({
      where: { slug },
      update: profileData,
      create: { slug, ...profileData },
    });
    profileCount++;

    // PoliticalAffiliation — histórico de filiação partidária, no máximo uma isCurrent=true por perfil.
    const currentAffiliation = await prisma.politicalAffiliation.findFirst({
      where: { profileId: profile.id, isCurrent: true },
    });
    if (!currentAffiliation) {
      await prisma.politicalAffiliation.create({
        data: {
          profileId: profile.id,
          partyId,
          startDate: new Date(UNVERIFIED_AFFILIATION_START),
          isCurrent: true,
          reason: "Seed inicial — data de filiação não verificada",
        },
      });
    } else if (currentAffiliation.partyId !== partyId) {
      await prisma.politicalAffiliation.update({
        where: { id: currentAffiliation.id },
        data: { isCurrent: false, endDate: new Date() },
      });
      await prisma.politicalAffiliation.create({
        data: {
          profileId: profile.id,
          partyId,
          startDate: new Date(),
          isCurrent: true,
          reason: "Atualização de seed — troca de partido detectada",
        },
      });
    }

    const mandateDates: KnownMandate | undefined =
      s.office === "governor" && status === "in_mandate"
        ? { startDate: "2023-01-01", endDate: "2027-01-01", electionYear: 2022 }
        : KNOWN_PRESIDENTIAL_MANDATES[s.tseId];

    if (mandateDates) {
      const existingMandate = await prisma.mandate.findFirst({ where: { profileId: profile.id, officeId } });
      if (!existingMandate) {
        await prisma.mandate.create({
          data: {
            profileId: profile.id,
            officeId,
            startDate: new Date(mandateDates.startDate),
            endDate: mandateDates.endDate ? new Date(mandateDates.endDate) : null,
            electionYear: mandateDates.electionYear,
            electoralResult: "elected",
            startReason: "election",
            endReason: mandateDates.endReason ?? null,
          },
        });
      }
    }
  }

  console.log(`  PoliticalProfile: ${profileCount} perfis`);
}
