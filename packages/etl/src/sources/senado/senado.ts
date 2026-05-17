const BASE_URL = "https://legis.senado.leg.br/dadosabertos";
const DELAY_MS = 300;

export interface SenadoSenador {
  CodigoParlamentar: string;
  NomeParlamentar: string;
  SiglaPartidoParlamentar: string;
  UfParlamentar: string;
  UrlFotoParlamentar: string;
}

interface SenadoResponse {
  ListaParlamentarEmExercicio: {
    Parlamentares: {
      Parlamentar: Array<{
        IdentificacaoParlamentar: SenadoSenador;
      }>;
    };
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchSenadores(): Promise<SenadoSenador[]> {
  await delay(DELAY_MS);
  const res = await fetch(`${BASE_URL}/senador/lista/atual.json`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Senado API error: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as SenadoResponse;
  const parlamentares =
    json.ListaParlamentarEmExercicio?.Parlamentares?.Parlamentar ?? [];

  return parlamentares.map((p) => p.IdentificacaoParlamentar);
}
