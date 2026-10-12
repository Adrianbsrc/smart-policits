import { politicalProfileApi } from "@/features/political-profile";
import { OFFICIAL_SOURCES } from "./official-sources";

/**
 * Arquitetura para métricas reais da Home (docs/SPECs/home.md#estratégia-de-métricas-dinâmicas).
 * Nunca hardcode um número final no componente visual — cada métrica passa
 * por aqui, e ganha `available: false` (nunca um valor inventado) quando o
 * dado real ainda não existe.
 */

const UNAVAILABLE_LABEL = "—";

export interface HomeMetric {
  value: string;
  label: string;
  available: boolean;
}

export interface HomeMetrics {
  profilesAvailable: HomeMetric;
  verifiedEvidences: HomeMetric;
  officialSources: HomeMetric;
  lastUpdated: HomeMetric;
}

function unavailableMetric(label: string): HomeMetric {
  return { value: UNAVAILABLE_LABEL, label, available: false };
}

/** `GET /profiles` já devolve `meta.total` — nenhum endpoint novo é necessário para esta métrica. */
async function getProfilesAvailable(): Promise<HomeMetric> {
  try {
    const { meta } = await politicalProfileApi.list({ limit: 1 });
    return { value: String(meta.total), label: "perfis disponíveis", available: true };
  } catch {
    return unavailableMetric("perfis disponíveis");
  }
}

/**
 * Nenhum endpoint agrega evidências ou `updatedAt` globalmente hoje (ver
 * SPEC) — fallback honesto até que existam, sem criar API nova aqui.
 */
export async function getHomeMetrics(): Promise<HomeMetrics> {
  const profilesAvailable = await getProfilesAvailable();

  return {
    profilesAvailable,
    verifiedEvidences: unavailableMetric("evidências verificadas"),
    officialSources: { value: String(OFFICIAL_SOURCES.length), label: "fontes oficiais", available: true },
    lastUpdated: unavailableMetric("última atualização"),
  };
}
