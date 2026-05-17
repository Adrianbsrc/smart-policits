import { candidatesService } from "./candidates.service";
import type { CandidateListFilters } from "../types";

type OfficeFilters = Omit<CandidateListFilters, "office">;

export const politiciansService = {
  presidents: (filters?: OfficeFilters) =>
    candidatesService.list({ ...filters, office: "president" }),

  governors: (filters?: OfficeFilters) =>
    candidatesService.list({ ...filters, office: "governor" }),

  stateDeputies: (filters?: OfficeFilters) =>
    candidatesService.list({ ...filters, office: "state_deputy" }),

  federalDeputies: (filters?: OfficeFilters) =>
    candidatesService.list({ ...filters, office: "federal_deputy" }),

  senators: (filters?: OfficeFilters) =>
    candidatesService.list({ ...filters, office: "senator" }),
};
