import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PromisesController } from "./promises.controller";
import { PromisesService } from "./promises.service";
import { PromisesRepository } from "./promises.repository";

@Module({
  imports: [AuthModule],
  controllers: [PromisesController],
  providers: [PromisesService, PromisesRepository],
})
export class PromisesModule {}
