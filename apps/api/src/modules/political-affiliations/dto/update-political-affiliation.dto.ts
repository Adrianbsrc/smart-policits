import { PartialType } from "@nestjs/swagger";

import { CreatePoliticalAffiliationDto } from "./create-political-affiliation.dto";

export class UpdatePoliticalAffiliationDto extends PartialType(CreatePoliticalAffiliationDto) {}
