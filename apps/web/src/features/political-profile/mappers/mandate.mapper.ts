import type { MandateDto } from "../validations";
import type { MandateModel } from "../models";

/** Mapper DTO → Domain Model. Nunca produz labels/strings de exibição — isso é trabalho do ViewModel Mapper em view-models/. */
export function mapMandateDtoToModel(dto: MandateDto): MandateModel {
  return {
    id: dto.id,
    officeType: dto.office.type,
    officeName: dto.office.name,
    startDate: new Date(dto.startDate),
    endDate: dto.endDate ? new Date(dto.endDate) : null,
    reelected: dto.reelected,
    electoralResult: dto.electoralResult,
    electionYear: dto.electionYear,
    description: dto.description,
  };
}
