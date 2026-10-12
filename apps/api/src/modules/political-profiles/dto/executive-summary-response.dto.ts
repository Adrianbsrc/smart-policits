import { ApiProperty } from "@nestjs/swagger";
import { PoliticalOfficeType, PoliticalProfileStatus } from "@smart-politics/db";

/**
 * DTOs de resposta do Executive Summary. Nunca reutilizar tipos inferidos do
 * Prisma (Prisma.PoliticalProfileGetPayload etc.) — o mapeamento domínio→DTO
 * fica em political-profiles.mapper.ts.
 */

export class ExecutiveSummaryPartyDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  acronym: string;

  @ApiProperty({ nullable: true, type: String })
  logo: string | null;
}

export class ExecutiveSummaryOfficeDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: PoliticalOfficeType })
  type: PoliticalOfficeType;

  @ApiProperty()
  name: string;
}

export class ExecutiveSummaryExperienceItemDto {
  @ApiProperty({ enum: PoliticalOfficeType })
  officeType: PoliticalOfficeType;

  @ApiProperty()
  officeName: string;

  @ApiProperty()
  year: number;
}

/**
 * Patrimônio declarado — hoje sempre `null`. `AssetDeclaration` (ver
 * schema.prisma) está ligado a `Politician` (modelo legado), não a
 * `PoliticalProfile` — não existe ainda um caminho de dado real até aqui.
 * O tipo já existe para o campo aparecer assim que essa ligação existir
 * (via extensão do PoliticalProfileWriter ou via Evidence, categoria
 * "Asset" — ver docs/SPECs/evidence.md), sem quebrar nenhum consumidor.
 */
export class ExecutiveSummaryDeclaredAssetsDto {
  @ApiProperty()
  totalValueBrl: number;

  @ApiProperty()
  year: number;
}

export class ExecutiveSummaryResponseDto {
  @ApiProperty()
  slug: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty({ nullable: true, type: String })
  photo: string | null;

  @ApiProperty({ enum: PoliticalProfileStatus })
  status: PoliticalProfileStatus;

  @ApiProperty()
  isIncumbent: boolean;

  @ApiProperty({ type: ExecutiveSummaryPartyDto, nullable: true })
  currentParty: ExecutiveSummaryPartyDto | null;

  @ApiProperty({ type: ExecutiveSummaryOfficeDto, nullable: true })
  currentOffice: ExecutiveSummaryOfficeDto | null;

  @ApiProperty({ description: "Quantidade de mandatos exercidos" })
  mandateCount: number;

  @ApiProperty({ nullable: true, type: String, description: "Biografia truncada para exibição resumida" })
  shortBiography: string | null;

  @ApiProperty({ type: [ExecutiveSummaryExperienceItemDto], description: "Cargos distintos exercidos, em ordem cronológica" })
  experience: ExecutiveSummaryExperienceItemDto[];

  @ApiProperty({ nullable: true, type: Number, description: "Anos de vida pública, do primeiro ao último/atual mandato" })
  yearsOfPublicLife: number | null;

  @ApiProperty({ nullable: true, type: Number, description: "Ano da primeira eleição disputada (Mandate.electionYear mais antigo)" })
  firstElectionYear: number | null;

  @ApiProperty({ description: "Quantidade de eleições distintas disputadas (anos únicos em Mandate.electionYear)" })
  disputedElectionsCount: number;

  @ApiProperty({ type: ExecutiveSummaryDeclaredAssetsDto, nullable: true })
  declaredAssets: ExecutiveSummaryDeclaredAssetsDto | null;

  @ApiProperty({ description: "Data da última atualização do perfil" })
  lastUpdatedAt: Date;
}
