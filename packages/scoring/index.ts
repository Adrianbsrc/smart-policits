export interface RawScoreInput {
  // Presence and activity
  presenceRate: number;        // 0-100: % presença em votações
  approvedBills: number;       // nº projetos aprovados
  // Finances
  patrimonyGrowthRate: number; // 0-100: crescimento de patrimônio (menor = melhor)
  corporateDonors: number;     // nº financiadores empresariais (menor = melhor)
  // Integrity
  transparencyScore: number;   // 0-10: score externo (CGU/TCU)
  // Thematic votes (0-100 each)
  educationVotes: number;
  healthVotes: number;
  securityVotes: number;
  economyVotes: number;
  environmentVotes: number;
  infrastructureVotes: number;
  technologyVotes: number;
  agricultureVotes: number;
  internationalVotes: number;
  cultureVotes: number;
  socialRightsVotes: number;
  entrepreneurshipVotes: number;
}

export interface ScoreResult {
  overall: number;
  // Main dimensions — weight 2× in overall (10 pts each)
  education: number;
  health: number;
  security: number;
  economy: number;
  transparency: number;
  // Extended dimensions — weight 1× in overall (10 pts each)
  environment: number;
  infrastructure: number;
  technology: number;
  agriculture: number;
  international: number;
  culture: number;
  socialRights: number;
  entrepreneurship: number;
}

function clamp(value: number, min = 0, max = 10): number {
  return Math.min(max, Math.max(min, value));
}

function normalize(value: number, max: number): number {
  return clamp((value / max) * 10);
}

export function calculateScore(input: RawScoreInput): ScoreResult {
  const presence = normalize(input.presenceRate, 100);

  const education = clamp(normalize(input.educationVotes, 100) * 0.7 + presence * 0.3);
  const health = clamp(normalize(input.healthVotes, 100) * 0.7 + presence * 0.3);
  const security = clamp(normalize(input.securityVotes, 100) * 0.7 + presence * 0.3);
  const economy = clamp(
    normalize(input.economyVotes, 100) * 0.6 +
    presence * 0.2 +
    clamp(10 - normalize(input.patrimonyGrowthRate, 100)) * 0.2,
  );
  const transparency = clamp(
    input.transparencyScore * 0.5 +
    clamp(10 - normalize(input.corporateDonors, 20)) * 0.3 +
    normalize(input.approvedBills, 50) * 0.2,
  );
  const environment = clamp(normalize(input.environmentVotes, 100) * 0.7 + presence * 0.3);
  const infrastructure = clamp(normalize(input.infrastructureVotes, 100) * 0.7 + presence * 0.3);
  const technology = clamp(normalize(input.technologyVotes, 100) * 0.7 + presence * 0.3);
  const agriculture = clamp(normalize(input.agricultureVotes, 100) * 0.7 + presence * 0.3);
  const international = clamp(normalize(input.internationalVotes, 100) * 0.7 + presence * 0.3);
  const culture = clamp(normalize(input.cultureVotes, 100) * 0.7 + presence * 0.3);
  const socialRights = clamp(normalize(input.socialRightsVotes, 100) * 0.7 + presence * 0.3);
  const entrepreneurship = clamp(normalize(input.entrepreneurshipVotes, 100) * 0.7 + presence * 0.3);

  // Main dims × 2, extended × 1 → total weight 18
  const overall = clamp(
    (2 * education + 2 * health + 2 * security + 2 * economy + 2 * transparency +
      environment + infrastructure + technology + agriculture + international +
      culture + socialRights + entrepreneurship) / 18,
  );

  const round = (v: number) => Math.round(v * 10) / 10;
  return {
    overall: round(overall),
    education: round(education),
    health: round(health),
    security: round(security),
    economy: round(economy),
    transparency: round(transparency),
    environment: round(environment),
    infrastructure: round(infrastructure),
    technology: round(technology),
    agriculture: round(agriculture),
    international: round(international),
    culture: round(culture),
    socialRights: round(socialRights),
    entrepreneurship: round(entrepreneurship),
  };
}

export function calculateScoreFromMock(seed: number): ScoreResult {
  // Deterministic seeded random: range [min, min+range)
  const rng = (offset: number, min = 2, range = 8) => {
    const x = Math.sin(seed + offset) * 10_000;
    return (x - Math.floor(x)) * range + min;
  };
  const round = (v: number) => Math.round(v * 10) / 10;

  const education = round(rng(1));
  const health = round(rng(2));
  const security = round(rng(3));
  const economy = round(rng(4));
  const transparency = round(rng(5));
  const environment = round(rng(6, 1, 9));
  const infrastructure = round(rng(7, 1, 9));
  const technology = round(rng(8, 1, 9));
  const agriculture = round(rng(9, 1, 9));
  const international = round(rng(10, 1, 9));
  const culture = round(rng(11, 1, 9));
  const socialRights = round(rng(12, 1, 9));
  const entrepreneurship = round(rng(13, 1, 9));

  const overall = round(
    (2 * education + 2 * health + 2 * security + 2 * economy + 2 * transparency +
      environment + infrastructure + technology + agriculture + international +
      culture + socialRights + entrepreneurship) / 18,
  );

  return {
    overall,
    education, health, security, economy, transparency,
    environment, infrastructure, technology, agriculture, international,
    culture, socialRights, entrepreneurship,
  };
}
