/**
 * CNJ Datajud — consulta de processos judiciais.
 *
 * API pública (sem chave): https://api-publica.datajud.cnj.jus.br/
 * Retorna processos de todos os tribunais integrados ao CNJ.
 *
 * Limitações da API pública:
 *  - Busca por nome retorna falsos positivos (homônimos)
 *  - CPF do político é necessário para resultado preciso
 *  - Limite de 10.000 documentos por índice
 *
 * Para reduzir falsos positivos, cruzamos: nome + tribunal + tipo_de_parte.
 */
import type {
  CnjPoliticianProfile,
  CnjProcesso,
  CnjProcessoGravidade,
  CnjSearchResponse,
} from "./cnj.types";

const CNJ_PUBLIC_BASE = "https://api-publica.datajud.cnj.jus.br";

// Tribunais com maior relevância para políticos federais/estaduais
const PRIORITY_TRIBUNAIS = [
  "api_publica_stf",  // Supremo Tribunal Federal
  "api_publica_stj",  // Superior Tribunal de Justiça
  "api_publica_trf1", "api_publica_trf2", "api_publica_trf3",
  "api_publica_trf4", "api_publica_trf5", "api_publica_trf6",
  "api_publica_tjmg", "api_publica_tjsp", "api_publica_tjrj",
  "api_publica_tjrs", "api_publica_tjpr", "api_publica_tjgo",
  "api_publica_tjba", "api_publica_tjce", "api_publica_tjpe",
];

const CRIMINAL_CLASS_CODES = new Set([
  // Códigos de classe processual penal (CNJ)
  38,  // Ação Penal - Procedimento Ordinário
  39,  // Ação Penal - Procedimento Sumário
  40,  // Inquérito Policial
  41,  // Habeas Corpus
  126, // Inquérito
  436, // Procedimento do Júri
  864, // Ação Penal Originária
]);

const ADMINISTRATIVE_CLASS_CODES = new Set([
  // Mandado de Segurança, Ação Popular, Ação Civil Pública, etc.
  269, 270, 271, 129, 121,
]);

/** Identifica gravidade pelo código de classe processual CNJ. */
function classifyProcesso(processo: CnjProcesso): CnjProcessoGravidade {
  const code = processo.classeProcessual?.codigo;
  if (!code) return "other";
  if (CRIMINAL_CLASS_CODES.has(code)) return "criminal";
  if (ADMINISTRATIVE_CLASS_CODES.has(code)) return "administrative";
  // Fallback por nome da classe
  const nome = (processo.classeProcessual?.nome ?? "").toLowerCase();
  if (nome.includes("penal") || nome.includes("criminal") || nome.includes("habeas") || nome.includes("inquérito")) return "criminal";
  if (nome.includes("mandado") || nome.includes("popular") || nome.includes("improbidade")) return "administrative";
  return "civil";
}

/** Verifica se o processo está encerrado (transitado em julgado ou arquivado). */
function isEncerrado(processo: CnjProcesso): boolean {
  const movimentos = processo.movimentos ?? [];
  const lastMov = movimentos.at(-1);
  if (!lastMov) return false;
  const nome = lastMov.nome.toLowerCase();
  return (
    nome.includes("arquivado") ||
    nome.includes("encerrado") ||
    nome.includes("julgado") ||
    nome.includes("baixado") ||
    nome.includes("transitou")
  );
}

/** Busca processos em um tribunal por nome de parte. */
async function searchInTribunal(
  tribunal: string,
  nome: string,
  apiKey?: string,
): Promise<CnjProcesso[]> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (apiKey) headers["Authorization"] = `ApiKey ${apiKey}`;

  const body = {
    query: {
      bool: {
        must: [
          { match: { "partes.nome": { query: nome, operator: "and" } } },
        ],
      },
    },
    _source: ["numeroProcesso", "tribunal", "grau", "dataAjuizamento", "classeProcessual", "assuntos", "orgaoJulgador", "partes", "movimentos"],
    size: 50,
    sort: [{ dataAjuizamento: { order: "desc" } }],
  };

  const res = await fetch(`${CNJ_PUBLIC_BASE}/${tribunal}/_search`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(12_000),
  });

  if (!res.ok) return []; // Tribunal indisponível — não quebrar o fluxo
  const data = (await res.json()) as CnjSearchResponse;
  return (data.hits?.hits ?? []).map((h) => h._source);
}

/** Filtra falsos positivos: a parte deve ser réu/investigado, não autor. */
function isReuOuInvestigado(processo: CnjProcesso, nome: string): boolean {
  const nomeNorm = nome.toLowerCase().trim();
  const partes = processo.partes ?? [];
  return partes.some((p) => {
    const tipoLower = (p.tipo ?? "").toLowerCase();
    const nomeLower = (p.nome ?? "").toLowerCase();
    const isTarget = nomeLower.includes(nomeNorm.split(" ")[0]!.toLowerCase());
    const isReu = tipoLower.includes("réu") || tipoLower.includes("investigado") ||
      tipoLower.includes("acusado") || tipoLower.includes("denunciado") || tipoLower.includes("requerido");
    return isTarget && isReu;
  });
}

/**
 * Busca o perfil judicial de um político no CNJ Datajud.
 *
 * @param nome     - Nome completo (ou parte significativa). Mais preciso = menos falsos positivos.
 * @param tribunais - Lista de índices CNJ a consultar. Default: tribunais prioritários.
 * @param apiKey   - Chave CNJ opcional para maior limite de requisições.
 */
export async function fetchCnjProfile(
  nome: string,
  tribunais = PRIORITY_TRIBUNAIS,
  apiKey?: string,
): Promise<CnjPoliticianProfile> {
  const allProcessos: CnjProcesso[] = [];
  const tribunaisEncontrados = new Set<string>();

  // Busca em paralelo nos primeiros 4 tribunais prioritários (STF, STJ, TRFs)
  // O restante é sequencial para não sobrecarregar
  const [priority, rest] = [tribunais.slice(0, 4), tribunais.slice(4)];

  const priorityResults = await Promise.allSettled(
    priority.map((t) => searchInTribunal(t, nome, apiKey)),
  );
  for (const r of priorityResults) {
    if (r.status === "fulfilled") allProcessos.push(...r.value);
  }

  for (const tribunal of rest) {
    const processos = await searchInTribunal(tribunal, nome, apiKey);
    allProcessos.push(...processos);
    await new Promise((r) => setTimeout(r, 200));
  }

  // Filtrar falsos positivos (homônimos como autor, não como réu)
  const relevantes = allProcessos.filter((p) => isReuOuInvestigado(p, nome));

  for (const p of relevantes) {
    if (p.tribunal) tribunaisEncontrados.add(p.tribunal);
    if (p.orgaoJulgador?.uf) tribunaisEncontrados.add(`TJ-${p.orgaoJulgador.uf}`);
  }

  const criminaisAtivos    = relevantes.filter((p) => classifyProcesso(p) === "criminal" && !isEncerrado(p)).length;
  const criminaisEncerrados= relevantes.filter((p) => classifyProcesso(p) === "criminal" && isEncerrado(p)).length;
  const administrativos    = relevantes.filter((p) => classifyProcesso(p) === "administrative").length;
  const civis              = relevantes.filter((p) => classifyProcesso(p) === "civil").length;

  return {
    totalProcessos:       relevantes.length,
    criminaisAtivos,
    criminaisEncerrados,
    administrativos,
    civis,
    tribunais:            [...tribunaisEncontrados],
    processos:            relevantes,
  };
}

/**
 * Converte perfil CNJ em campos de IntegrityInput.
 * Use como override parcial sobre os inputs curados existentes.
 */
export function cnjProfileToIntegrityFields(profile: CnjPoliticianProfile): {
  criminalConvictions: number;
  criminalCharges: number;
  mpChargesAccepted: number;
} {
  // Processos encerrados com condenação == convictions (aproximação)
  // Em produção: cruzar com movimentos de "Condenação" para precisão
  return {
    criminalConvictions: Math.min(profile.criminaisEncerrados, 3),
    criminalCharges:     Math.min(profile.criminaisAtivos, 5),
    mpChargesAccepted:   Math.min(profile.criminaisAtivos, 3),
  };
}
