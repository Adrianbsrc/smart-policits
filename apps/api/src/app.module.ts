import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerModule } from "@nestjs/throttler";

import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { PrismaModule } from "./config/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CandidatesModule } from "./modules/candidates/candidates.module";
import { AlertsModule } from "./modules/alerts/alerts.module";
import { FollowsModule } from "./modules/follows/follows.module";
import { HealthModule } from "./modules/health/health.module";
import { PartiesModule } from "./modules/parties/parties.module";
import { EtlModule } from "./modules/etl/etl.module";
import { QuizModule } from "./modules/quiz/quiz.module";
import { RankingsModule } from "./modules/rankings/rankings.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [
        { name: "default", ttl: 60_000, limit: 100 },
        { name: "short", ttl: 1_000, limit: 10 },
      ],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    CandidatesModule,
    RankingsModule,
    PartiesModule,
    AlertsModule,
    FollowsModule,
    QuizModule,
    EtlModule,
  ],
  providers: [{ provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }],
})
export class AppModule {}
