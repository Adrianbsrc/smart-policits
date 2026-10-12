import { PartialType } from "@nestjs/swagger";

import { CreatePoliticalProfileDto } from "./create-political-profile.dto";

export class UpdatePoliticalProfileDto extends PartialType(CreatePoliticalProfileDto) {}
