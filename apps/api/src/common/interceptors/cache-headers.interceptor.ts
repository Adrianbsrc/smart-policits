import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

/**
 * Aplica Cache-Control headers em respostas GET bem-sucedidas.
 *
 * Permite que a Vercel Edge CDN e o browser cacheiem respostas de
 * endpoints públicos de leitura sem nenhuma infraestrutura adicional.
 *
 * TTLs escolhidos com base na frequência de mudança dos dados:
 * - Scores e rankings: atualizados apenas pelo ETL admin (≤1x/dia)
 * - Perfis de candidatos: idem
 * - stale-while-revalidate: entrega cache stale enquanto busca fresh em bg
 */
const CACHE_RULES: { pattern: RegExp; maxAge: number; swr: number }[] = [
  { pattern: /^\/rankings/,              maxAge: 900,  swr: 3600  }, // 15min fresh, 1h stale
  { pattern: /^\/politicians\/[^/]+$/,    maxAge: 3600, swr: 7200  }, // 1h fresh, 2h stale
  { pattern: /^\/politicians/,            maxAge: 900,  swr: 3600  }, // 15min fresh, 1h stale
  { pattern: /^\/parties/,               maxAge: 7200, swr: 14400 }, // 2h fresh, 4h stale
];

@Injectable()
export class CacheHeadersInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    if (req.method !== "GET") return next.handle();

    return next.handle().pipe(
      tap(() => {
        if (res.statusCode < 200 || res.statusCode >= 300) return;

        const rule = CACHE_RULES.find((r) => r.pattern.test(req.path));
        if (!rule) return;

        res.setHeader(
          "Cache-Control",
          `public, max-age=${rule.maxAge}, stale-while-revalidate=${rule.swr}`,
        );
      }),
    );
  }
}
