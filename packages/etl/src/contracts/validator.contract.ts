import type { JobContext } from "./job.contract";

export type ValidationIssueSeverity = "error" | "warning";

/** Categorias de checagem descritas em docs/SPECs/etl.md#3-validate. */
export type ValidationIssueCategory =
  | "required"
  | "duplicate"
  | "consistency"
  | "integrity"
  | "versioning";

export interface ValidationIssue {
  readonly category: ValidationIssueCategory;
  readonly severity: ValidationIssueSeverity;
  readonly code: string;
  readonly message: string;
  readonly field?: string;
}

export interface ValidationResult<TNormalized> {
  readonly valid: boolean;
  readonly data: TNormalized;
  readonly issues: ValidationIssue[];
}

/**
 * Verifica obrigatoriedade, duplicidade, consistência, integridade e
 * versionamento de um registro já normalizado (docs/SPECs/etl.md#3-validate).
 */
export interface Validator<TNormalized = unknown> {
  validate(
    data: TNormalized,
    context: JobContext,
  ): Promise<ValidationResult<TNormalized>> | ValidationResult<TNormalized>;
}
