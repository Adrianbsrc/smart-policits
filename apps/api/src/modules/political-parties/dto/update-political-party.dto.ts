import { PartialType } from "@nestjs/swagger";

import { CreatePoliticalPartyDto } from "./create-political-party.dto";

export class UpdatePoliticalPartyDto extends PartialType(CreatePoliticalPartyDto) {}
