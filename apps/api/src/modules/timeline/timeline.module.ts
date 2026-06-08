import { Module } from "@nestjs/common";
import { TimelineController } from "./timeline.controller";
import { TimelineService } from "./timeline.service";
import { TimelineRepository } from "./timeline.repository";

@Module({
  controllers: [TimelineController],
  providers: [TimelineService, TimelineRepository],
})
export class TimelineModule {}
