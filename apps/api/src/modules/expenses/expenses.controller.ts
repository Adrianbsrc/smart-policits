import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import type { PaginatedResponse } from "../../common/dto/pagination.dto";
import { ExpensesService } from "./expenses.service";
import { ListExpensesDto } from "./dto/list-expenses.dto";
import type { ExpenseResult, ExpenseSummary } from "./expenses.repository";

@ApiTags("expenses")
@Controller("politicians/:slug/expenses")
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @ApiOperation({ summary: "Lista gastos públicos do político" })
  @ApiParam({ name: "slug" })
  list(@Param("slug") slug: string, @Query() query: ListExpensesDto): Promise<PaginatedResponse<ExpenseResult>> {
    return this.expensesService.list(slug, query);
  }

  @Get("summary")
  @ApiOperation({ summary: "Resumo de gastos por categoria para um dado ano" })
  @ApiParam({ name: "slug" })
  @ApiQuery({ name: "year", type: Number, description: "Ano (padrão: ano atual)" })
  getSummary(
    @Param("slug") slug: string,
    @Query("year", new DefaultValuePipe(new Date().getFullYear()), ParseIntPipe) year: number,
  ): Promise<ExpenseSummary> {
    return this.expensesService.getSummary(slug, year);
  }
}
