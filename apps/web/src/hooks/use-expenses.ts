"use client";

import { useQuery } from "@tanstack/react-query";
import { politiciansService } from "@/lib/api/services/politicians.service";

export function useExpensesSummary(slug: string, year?: number, enabled = true) {
  return useQuery({
    queryKey: ["expenses-summary", slug, year],
    queryFn: () => politiciansService.expensesSummary(slug, year),
    staleTime: 30 * 60 * 1000, // 30min
    enabled: !!slug && enabled,
  });
}

export function useExpenses(slug: string, params?: { year?: number; page?: number }, enabled = true) {
  return useQuery({
    queryKey: ["expenses", slug, params],
    queryFn: () => politiciansService.expenses(slug, params),
    staleTime: 30 * 60 * 1000,
    enabled: !!slug && enabled,
  });
}
