const BASE_URL = "https://legis.senado.leg.br/dadosabertos";

export interface MateriasResult {
  proposed: number;
  approved: number;
}

interface SenadoMateria {
  CodigoMateria: string;
  SiglaTipo: string;
  Numero: string;
  Ano: string;
  DescricaoObjetivoProcesso: string;
}

interface SenadoMateriasResponse {
  PesquisaBasicaMateria?: {
    Materias?: {
      Materia?: SenadoMateria | SenadoMateria[];
    };
  };
}

function toArray<T>(val: T | T[] | undefined): T[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

/**
 * Busca proposições apresentadas pelo senador.
 * Endpoint: GET /materia/pesquisa/lista?codigoAutor={id}
 * Retorna zeros se o endpoint falhar (API instável).
 */
export async function fetchSenadorMaterias(senadoId: string): Promise<MateriasResult> {
  try {
    const url = `${BASE_URL}/materia/pesquisa/lista?codigoAutor=${senadoId}&itens=100`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return { proposed: 0, approved: 0 };
    const json = (await res.json()) as SenadoMateriasResponse;
    const materias = toArray(json.PesquisaBasicaMateria?.Materias?.Materia);

    // Sem endpoint direto para aprovadas — proxy: matérias com "aprovad" na descrição
    const approved = materias.filter((m) =>
      m.DescricaoObjetivoProcesso?.toLowerCase().includes("aprovad"),
    ).length;

    return { proposed: materias.length, approved };
  } catch {
    return { proposed: 0, approved: 0 };
  }
}
