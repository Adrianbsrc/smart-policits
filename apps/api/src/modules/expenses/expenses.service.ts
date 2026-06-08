import { Injectable, NotFoundException } from "@nestjs/common";
import { paginate, type PaginatedResponse } from "../../common/dto/pagination.dto";
import { PrismaService } from "../../config/prisma.service";
import { ExpensesRepository } from "./expenses.repository";
import type { ListExpensesDto } from "./dto/list-expenses.dto";
import type { ExpenseResult, ExpenseSummary } from "./expenses.repository";

@Injectable()
export class ExpensesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: ExpensesRepository,
  ) {}

  private async resolvePoliticianId(slug: string): Promise<string> {
    const politician = await this.prisma.politician.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!politician) throw new NotFoundException(`Político "${slug}" não encontrado`);
    return politician.id;
  }

  async list(slug: string, query: ListExpensesDto): Promise<PaginatedResponse<ExpenseResult>> {
    const politicianId = await this.resolvePoliticianId(slug);
    const { data, total } = await this.repository.findMany(politicianId, query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 30;
    return paginate(data, total, page, limit);
  }

  async getSummary(slug: string, year: number): Promise<ExpenseSummary> {
    const politicianId = await this.resolvePoliticianId(slug);
    return this.repository.getSummary(politicianId, year);
  }
}
