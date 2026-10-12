import { Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";
import { ConfigModule } from "@nestjs/config";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerModule } from "@nestjs/throttler";

import { CacheHeadersInterceptor } from "./common/interceptors/cache-headers.interceptor";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { PrismaModule } from "./config/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { PoliticiansModule } from "./modules/politicians/politicians.module";
import { FeedModule } from "./modules/feed/feed.module";
import { AlertsModule } from "./modules/alerts/alerts.module";
import { FollowsModule } from "./modules/follows/follows.module";
import { HealthModule } from "./modules/health/health.module";
import { PartiesModule } from "./modules/parties/parties.module";
import { EtlModule } from "./modules/etl/etl.module";
import { IntelligenceModule } from "./modules/intelligence/intelligence.module";
import { QuizModule } from "./modules/quiz/quiz.module";
import { RankingsModule } from "./modules/rankings/rankings.module";
import { UsersModule } from "./modules/users/users.module";
import { TimelineModule } from "./modules/timeline/timeline.module";
import { PromisesModule } from "./modules/promises/promises.module";
import { ExpensesModule } from "./modules/expenses/expenses.module";
import { AssetsModule } from "./modules/assets/assets.module";
import { PoliticalProfilesModule } from "./modules/political-profiles/political-profiles.module";
import { PoliticalPartiesModule } from "./modules/political-parties/political-parties.module";
import { PoliticalOfficesModule } from "./modules/political-offices/political-offices.module";
import { PoliticalAffiliationsModule } from "./modules/political-affiliations/political-affiliations.module";
import { PoliticalTimelineModule } from "./modules/political-timeline/political-timeline.module";
import { PoliticalPromisesModule } from "./modules/political-promises/political-promises.module";
import { PoliticalIndicatorsModule } from "./modules/political-indicators/political-indicators.module";
import { PoliticalIntegrityModule } from "./modules/political-integrity/political-integrity.module";
import { PoliticalEvidenceModule } from "./modules/political-evidence/political-evidence.module";
import { MandatesModule } from "./modules/mandates/mandates.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // In-memory cache: scores mudam apenas via ETL admin (1x/dia no máximo)
    // TTL 15min + max 500 entradas cobre rankings e perfis sem Redis
    CacheModule.register({
      isGlobal: true,
      ttl: 15 * 60 * 1000, // 15 min em ms
      max: 500,
    }),
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
    PoliticiansModule,
    FeedModule,
    RankingsModule,
    PartiesModule,
    AlertsModule,
    FollowsModule,
    QuizModule,
    EtlModule,
    IntelligenceModule,
    TimelineModule,
    PromisesModule,
    ExpensesModule,
    AssetsModule,
    PoliticalProfilesModule,
    PoliticalPartiesModule,
    PoliticalOfficesModule,
    PoliticalAffiliationsModule,
    PoliticalTimelineModule,
    PoliticalPromisesModule,
    PoliticalIndicatorsModule,
    PoliticalIntegrityModule,
    PoliticalEvidenceModule,
    MandatesModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: CacheHeadersInterceptor },
  ],
})
export class AppModule {}
