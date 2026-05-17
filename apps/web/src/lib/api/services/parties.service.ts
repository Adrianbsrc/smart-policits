import { api } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Party } from "../types";

export const partiesService = {
  list: () => api.get<Party[]>(ENDPOINTS.parties.list),
  detail: (acronym: string) => api.get<Party>(ENDPOINTS.parties.detail(acronym)),
};
