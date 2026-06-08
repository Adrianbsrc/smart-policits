// teste: packages/intelligence/scripts/test-mock.ts (apague depois)
import { IntelligenceService, MockProvider } from "../src/index";

const service = new IntelligenceService(
  [new MockProvider()],
  { primaryProvider: "mock", fallbackProvider: "mock" },
);

async function main() {
  const result = await service.interpretBill({
    title: "PL 1234/2026 - Aumenta pena para roubo armado",
    description: "Projeto de lei que altera o Código Penal para aumentar a pena mínima de crimes com uso de arma de fogo de 4 para 8 anos.",
    authors: ["parlamentar-exemplo"],
  });

  console.log(JSON.stringify(result, null, 2));

  const story = await service.generateStoryFromBill({
    title: "PL 1234/2026 - Aumenta pena para roubo armado",
    description: "Projeto de lei que altera o Código Penal...",
  });

  console.log("\n--- STORY ---");
  console.log(JSON.stringify(story, null, 2));
}

main().catch(console.error);