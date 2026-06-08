import { Injectable } from "@nestjs/common";
import type { Prisma } from "@smart-politics/db";
import { PrismaService } from "../../config/prisma.service";
import type { ListExpensesDto } from "./dto/list-expenses.dto";

const EXPENSE_SELECT = {
  id: true,
  category: true,
  description: true,
  amountBrl: true,
  expenseDate: true,
  supplier: true,
  documentUrl: true,
  year: true,
  month: true,
  createdAt: true,
} as const satisfies Prisma.PublicExpenseSelect;

export type ExpenseResult = Prisma.PublicExpenseGetPayload<{
  select: typeof EXPENSE_SELECT;
}>;

export interface ExpenseSummary {
  year: number;
  totalBrl: number;
  byCategory: { category: string; totalBrl: number; count: number }[];
}

@Injectable()
export class ExpensesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(
    politicianId: string,
    query: ListExpensesDto,
  ): Promise<{ data: ExpenseResult[]; total: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 30;
    const skip = (page - 1) * limit;

    const where: Prisma.PublicExpenseWhereInput = {
      politicianId,
      ...(query.year ? { year: query.year } : {}),
      ...(query.month ? { month: query.month } : {}),
      ...(query.category ? { category: query.category } : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.publicExpense.findMany({
        where,
        select: EXPENSE_SELECT,
        orderBy: { expenseDate: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.publicExpense.count({ where }),
    ]);

    return { data, total };
  }

  async getSummary(politicianId: string, year: number): Promise<ExpenseSummary> {
    const expenses = await this.prisma.publicExpense.findMany({
      where: { politicianId, year },
      select: { category: true, amountBrl: true },
    });

    const byCategory = new Map<string, { totalBrl: number; count: number }>();
    let totalBrl = 0;

    for (const e of expenses) {
      totalBrl += e.amountBrl;
      const existing = byCategory.get(e.category) ?? { totalBrl: 0, count: 0 };
      byCategory.set(e.category, {
        totalBrl: existing.totalBrl + e.amountBrl,
        count: existing.count + 1,
      });
    }

    return {
      year,
      totalBrl,
      byCategory: Array.from(byCategory.entries()).map(([category, stats]) => ({
        category,
        ...stats,
      })),
    };
  }
}
