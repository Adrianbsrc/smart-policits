export interface ScoreWeights {
  education: number;
  health: number;
  security: number;
  economy: number;
  transparency: number;
}

export interface ScoreInput {
  candidateId: string;
  dimensions: {
    education: DimensionData;
    health: DimensionData;
    security: DimensionData;
    economy: DimensionData;
    transparency: DimensionData;
  };
}

export interface DimensionData {
  rawScore: number;
  maxPossible: number;
  indicators: Indicator[];
}

export interface Indicator {
  name: string;
  value: number;
  weight: number;
  source: string;
}

export interface ScoreOutput {
  candidateId: string;
  overall: number;
  education: number;
  health: number;
  security: number;
  economy: number;
  transparency: number;
  computedAt: Date;
}
