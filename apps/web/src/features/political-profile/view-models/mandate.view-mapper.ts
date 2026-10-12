import type { ElectoralResult } from "../validations";
import type { MandateModel } from "../models";
import { formatMandatePeriod } from "../utils";
import { POLITICAL_OFFICE_TYPE_LABELS } from "./executive-summary.view-mapper";
import type { MandateViewModel } from "./mandate.view-model";

const ELECTORAL_RESULT_LABELS: Record<ElectoralResult, string> = {
  elected: "Eleito",
  runner_up: "Segundo turno",
  not_elected: "Não eleito",
};

/** ViewModel Mapper — Domain Model → View Model. Único lugar onde office/electoralResult viram texto de exibição. */
export function mapMandateModelToViewModel(model: MandateModel): MandateViewModel {
  return {
    id: model.id,
    officeLabel: POLITICAL_OFFICE_TYPE_LABELS[model.officeType],
    period: formatMandatePeriod(model.startDate, model.endDate),
    reelected: model.reelected,
    electoralResultLabel: model.electoralResult ? ELECTORAL_RESULT_LABELS[model.electoralResult] : null,
    electionYear: model.electionYear,
    description: model.description,
  };
}
