import { PartialType } from "@nestjs/swagger";
import { CreateFeedItemDto } from "./create-feed-item.dto";

export class UpdateFeedItemDto extends PartialType(CreateFeedItemDto) {}
