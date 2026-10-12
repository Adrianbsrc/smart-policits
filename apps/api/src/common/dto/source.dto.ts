import { ApiProperty } from "@nestjs/swagger";
import type { Source } from "@smart-politics/core";

/**
 * DTO Swagger-decorado do Value Object compartilhado `Source`
 * (packages/core/src/domain). Reaproveitado por qualquer módulo que
 * precise citar a origem de um dado (Timeline, Promises, ...) — nunca
 * duplicar esta forma em um módulo específico.
 */
export class SourceDto implements Source {
  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true, type: String })
  url: string | null;
}
