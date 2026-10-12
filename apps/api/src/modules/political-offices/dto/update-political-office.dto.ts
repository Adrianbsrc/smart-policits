import { PartialType } from "@nestjs/swagger";

import { CreatePoliticalOfficeDto } from "./create-political-office.dto";

export class UpdatePoliticalOfficeDto extends PartialType(CreatePoliticalOfficeDto) {}
