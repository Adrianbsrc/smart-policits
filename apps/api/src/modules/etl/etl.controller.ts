import { Controller, DefaultValuePipe, ParseIntPipe, Post, Query, UseGuards, Get } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import { JwtAuthGuard } from "../auth/auth.guard";
import { EtlService } from "./etl.service";

@ApiTags("etl")
@Controller("etl")
@UseGuards(JwtAuthGuard)
export class EtlController {
  constructor(private readonly etlService: EtlService) {}

  @Post("sync/camara")
  @Throttle({ default: { ttl: 60_000, limit: 2 } })
  @ApiOperation({ summary: "Sincroniza deputados federais da Câmara dos Deputados (admin)" })
  syncCamara() {
    return this.etlService.syncCamaraDeputados();
  }

  @Post("sync/senado")
  @Throttle({ default: { ttl: 60_000, limit: 2 } })
  @ApiOperation({ summary: "Sincroniza senadores do Senado Federal (admin)" })
  syncSenado() {
    return this.etlService.syncSenadores();
  }

  @Post("sync/governors")
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @ApiOperation({ summary: "Sincroniza governadores 2023-2027 (seed data)" })
  syncGovernors() {
    return this.etlService.syncGovernors();
  }

  @Post("sync/presidents")
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @ApiOperation({ summary: "Sincroniza candidatos à presidência — eleição 2022 (seed data)" })
  syncPresidents() {
    return this.etlService.syncPresidents();
  }

  @Post("sync/all")
  @Throttle({ default: { ttl: 300_000, limit: 1 } })
  @ApiOperation({ summary: "Sincroniza todos os políticos em paralelo (admin)" })
  syncAll() {
    return this.etlService.syncAll();
  }

  @Post("sync/events/interpret")
  @Throttle({ default: { ttl: 300_000, limit: 1 } })
  @ApiOperation({ summary: "Interpreta eventos políticos não processados via IA (admin)" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Máximo de eventos a processar (padrão: 50)" })
  interpretEvents(
    @Query("limit", new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.etlService.interpretPendingEvents(limit);
  }

  @Post("sync/curated-scores")
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @ApiOperation({
    summary: "Aplica scores parciais curados para presidentes e governadores",
    description:
      "Calcula scores via calculateScore() com inputs baseados em fontes públicas (TSE, TCU, Aos Fatos, IBGE). " +
      "scoreType=partial. Idempotente.",
  })
  syncCuratedScores() {
    return this.etlService.syncCuratedScores();
  }

  @Post("sync/tse-bens")
  @Throttle({ default: { ttl: 300_000, limit: 2 } })
  @ApiOperation({
    summary: "Busca declarações de bens do TSE para presidentes e governadores",
    description:
      "Consulta a API pública do TSE DivulgaCandContas e armazena bens em AssetDeclaration. " +
      "Padrão: eleição 2022.",
  })
  @ApiQuery({ name: "ano", required: false, type: Number, description: "Ano eleitoral (padrão: 2022)" })
  syncTseBens(
    @Query("ano", new DefaultValuePipe(2022), ParseIntPipe) ano: number,
  ) {
    return this.etlService.syncTseBens(ano);
  }

  @Post("sync/integrity-cnj")
  @Throttle({ default: { ttl: 300_000, limit: 1 } })
  @ApiOperation({
    summary: "Enriquece integridade via CNJ Datajud (processos criminais)",
    description:
      "Busca processos judiciais de deputados e senadores no CNJ Datajud (API pública). " +
      "Executa em lotes para respeitar rate limit. Resultado armazenado como ScoreEvidence. " +
      "NOTA: busca por nome pode ter falsos positivos — filtrado por tipo de parte (réu/investigado).",
  })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Máximo de políticos a processar (padrão: 50, máx: 200)" })
  syncIntegrityCnj(
    @Query("limit", new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.etlService.syncIntegrityFromCnj(limit);
  }

  @Get("status")
  @ApiOperation({ summary: "Status dos módulos ETL e contagem de registros" })
  async status() {
    const [politicians, scores, events, assets] = await Promise.all([
      this.etlService["prisma"].politician.count(),
      this.etlService["prisma"].score.count({ where: { scoreType: { not: "mock" } } }),
      this.etlService["prisma"].politicalEvent.count(),
      this.etlService["prisma"].assetDeclaration.count(),
    ]);
    return {
      politicians,
      realScores: scores,
      politicalEvents: events,
      assetDeclarations: assets,
      timestamp: new Date().toISOString(),
    };
  }
}
