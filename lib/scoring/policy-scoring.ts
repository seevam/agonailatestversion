/**
 * Policy scoring system for AgonAI debate agents.
 */

export interface PolicyDimension {
  benefit: number;
  cost: number;
  net: number;
}

export interface PolicyScores {
  political: PolicyDimension;
  economic: PolicyDimension;
  social: PolicyDimension;
}

export interface RegionWeights {
  political: number;
  economic: number;
  social: number;
}

export const REGION_WEIGHTS: Record<string, RegionWeights> = {
  default:       { political: 0.34, economic: 0.33, social: 0.33 },
  authoritarian: { political: 0.50, economic: 0.30, social: 0.20 },
  democratic:    { political: 0.25, economic: 0.30, social: 0.45 },
  conflict_zone: { political: 0.45, economic: 0.35, social: 0.20 },
  economic_hub:  { political: 0.20, economic: 0.55, social: 0.25 },
};

// ── Ideology benefit/cost seeds ───────────────────────────────────────────────
const IDEOLOGY_POLICY: Record<string, PolicyScores> = {
  fascism: {
    political: { benefit: 75, cost: 30, net: 45 },
    economic:  { benefit: 55, cost: 40, net: 15 },
    social:    { benefit: 30, cost: 65, net: -35 },
  },
  communism: {
    political: { benefit: 65, cost: 35, net: 30 },
    economic:  { benefit: 50, cost: 50, net: 0  },
    social:    { benefit: 55, cost: 30, net: 25 },
  },
  democracy: {
    political: { benefit: 60, cost: 25, net: 35 },
    economic:  { benefit: 60, cost: 30, net: 30 },
    social:    { benefit: 65, cost: 20, net: 45 },
  },
  nonviolence: {
    political: { benefit: 40, cost: 20, net: 20 },
    economic:  { benefit: 45, cost: 25, net: 20 },
    social:    { benefit: 80, cost: 10, net: 70 },
  },
  muslim_nationalism: {
    political: { benefit: 65, cost: 30, net: 35 },
    economic:  { benefit: 50, cost: 35, net: 15 },
    social:    { benefit: 60, cost: 25, net: 35 },
  },
  authoritarianism: {
    political: { benefit: 80, cost: 20, net: 60 },
    economic:  { benefit: 50, cost: 40, net: 10 },
    social:    { benefit: 20, cost: 70, net: -50 },
  },
  liberalism: {
    political: { benefit: 55, cost: 25, net: 30 },
    economic:  { benefit: 65, cost: 25, net: 40 },
    social:    { benefit: 70, cost: 15, net: 55 },
  },
  conservatism: {
    political: { benefit: 60, cost: 25, net: 35 },
    economic:  { benefit: 60, cost: 30, net: 30 },
    social:    { benefit: 50, cost: 30, net: 20 },
  },
  capitalism: {
    political: { benefit: 55, cost: 25, net: 30 },
    economic:  { benefit: 75, cost: 20, net: 55 },
    social:    { benefit: 50, cost: 35, net: 15 },
  },
};

// ── Topic modifiers — shift scores based on debate topic ─────────────────────
const TOPIC_MODIFIERS: Record<string, Partial<Record<string, Partial<PolicyScores>>>> = {
  war: {
    fascism:        { political: { benefit: 85, cost: 20, net: 65 }, economic: { benefit: 40, cost: 60, net: -20 }, social: { benefit: 20, cost: 80, net: -60 } },
    democracy:      { political: { benefit: 65, cost: 30, net: 35 }, economic: { benefit: 50, cost: 50, net: 0  }, social: { benefit: 55, cost: 35, net: 20 } },
    nonviolence:    { political: { benefit: 25, cost: 10, net: 15 }, economic: { benefit: 40, cost: 20, net: 20 }, social: { benefit: 90, cost: 5,  net: 85 } },
    authoritarianism:{ political: { benefit: 85, cost: 15, net: 70 }, economic: { benefit: 40, cost: 55, net: -15 }, social: { benefit: 15, cost: 75, net: -60 } },
  },
  territorial_disputes: {
    fascism:        { political: { benefit: 90, cost: 15, net: 75 }, economic: { benefit: 60, cost: 30, net: 30 }, social: { benefit: 25, cost: 60, net: -35 } },
    muslim_nationalism: { political: { benefit: 80, cost: 20, net: 60 }, economic: { benefit: 55, cost: 30, net: 25 }, social: { benefit: 65, cost: 20, net: 45 } },
    nonviolence:    { political: { benefit: 35, cost: 15, net: 20 }, economic: { benefit: 40, cost: 20, net: 20 }, social: { benefit: 85, cost: 10, net: 75 } },
    democracy:      { political: { benefit: 55, cost: 25, net: 30 }, economic: { benefit: 55, cost: 30, net: 25 }, social: { benefit: 60, cost: 20, net: 40 } },
  },
  economic_policy: {
    capitalism:     { political: { benefit: 55, cost: 20, net: 35 }, economic: { benefit: 85, cost: 15, net: 70 }, social: { benefit: 45, cost: 40, net: 5  } },
    communism:      { political: { benefit: 60, cost: 35, net: 25 }, economic: { benefit: 55, cost: 45, net: 10 }, social: { benefit: 65, cost: 25, net: 40 } },
    democracy:      { political: { benefit: 60, cost: 20, net: 40 }, economic: { benefit: 65, cost: 25, net: 40 }, social: { benefit: 65, cost: 20, net: 45 } },
    fascism:        { political: { benefit: 70, cost: 25, net: 45 }, economic: { benefit: 60, cost: 35, net: 25 }, social: { benefit: 25, cost: 60, net: -35 } },
  },
  immigration: {
    fascism:        { political: { benefit: 80, cost: 20, net: 60 }, economic: { benefit: 45, cost: 40, net: 5  }, social: { benefit: 15, cost: 80, net: -65 } },
    democracy:      { political: { benefit: 55, cost: 30, net: 25 }, economic: { benefit: 65, cost: 25, net: 40 }, social: { benefit: 65, cost: 25, net: 40 } },
    liberalism:     { political: { benefit: 50, cost: 25, net: 25 }, economic: { benefit: 70, cost: 20, net: 50 }, social: { benefit: 75, cost: 15, net: 60 } },
    conservatism:   { political: { benefit: 65, cost: 25, net: 40 }, economic: { benefit: 50, cost: 35, net: 15 }, social: { benefit: 45, cost: 40, net: 5  } },
  },
  socialism: {
    communism:      { political: { benefit: 70, cost: 30, net: 40 }, economic: { benefit: 60, cost: 40, net: 20 }, social: { benefit: 70, cost: 20, net: 50 } },
    capitalism:     { political: { benefit: 50, cost: 30, net: 20 }, economic: { benefit: 70, cost: 30, net: 40 }, social: { benefit: 40, cost: 45, net: -5 } },
    democracy:      { political: { benefit: 55, cost: 25, net: 30 }, economic: { benefit: 60, cost: 30, net: 30 }, social: { benefit: 65, cost: 20, net: 45 } },
    fascism:        { political: { benefit: 65, cost: 30, net: 35 }, economic: { benefit: 50, cost: 45, net: 5  }, social: { benefit: 20, cost: 70, net: -50 } },
  },
  wartime_state_power: {
    fascism:        { political: { benefit: 90, cost: 10, net: 80 }, economic: { benefit: 55, cost: 45, net: 10 }, social: { benefit: 20, cost: 75, net: -55 } },
    democracy:      { political: { benefit: 65, cost: 30, net: 35 }, economic: { benefit: 60, cost: 40, net: 20 }, social: { benefit: 65, cost: 25, net: 40 } },
    authoritarianism:{ political: { benefit: 88, cost: 12, net: 76 }, economic: { benefit: 50, cost: 50, net: 0  }, social: { benefit: 15, cost: 80, net: -65 } },
    liberalism:     { political: { benefit: 50, cost: 30, net: 20 }, economic: { benefit: 60, cost: 35, net: 25 }, social: { benefit: 70, cost: 20, net: 50 } },
  },
  race_relations: {
    fascism:        { political: { benefit: 60, cost: 40, net: 20 }, economic: { benefit: 40, cost: 45, net: -5 }, social: { benefit: 10, cost: 90, net: -80 } },
    nonviolence:    { political: { benefit: 45, cost: 15, net: 30 }, economic: { benefit: 40, cost: 20, net: 20 }, social: { benefit: 90, cost: 5,  net: 85 } },
    democracy:      { political: { benefit: 55, cost: 25, net: 30 }, economic: { benefit: 55, cost: 25, net: 30 }, social: { benefit: 75, cost: 15, net: 60 } },
    authoritarianism:{ political: { benefit: 65, cost: 30, net: 35 }, economic: { benefit: 40, cost: 40, net: 0  }, social: { benefit: 10, cost: 85, net: -75 } },
  },
};

function mergeDimension(
  base: PolicyDimension,
  override?: Partial<PolicyDimension>,
): PolicyDimension {
  if (!override) return { ...base };
  const benefit = override.benefit ?? base.benefit;
  const cost    = override.cost    ?? base.cost;
  return { benefit, cost, net: benefit - cost };
}

export function scoreProposal(
  topic: string,
  ideology: string,
  personalityModifier: number,
  cooperativeness: number,
): PolicyScores {
  const base = IDEOLOGY_POLICY[ideology] ?? IDEOLOGY_POLICY.democracy;

  // Normalize topic key
  const topicKey = topic.toLowerCase().replace(/[\s-]+/g, "_");
  const topicMod = TOPIC_MODIFIERS[topicKey]?.[ideology];

  const political = mergeDimension(base.political, topicMod?.political);
  const economic  = mergeDimension(base.economic,  topicMod?.economic);
  const social    = mergeDimension(base.social,    topicMod?.social);

  // Apply personality modifier — scales benefits up/down by personality
  const pm = Math.max(0.5, Math.min(1.5, 1 + personalityModifier * 0.3));
  // Cooperative agents get a social bonus
  const cooperationBonus = cooperativeness * 5;

  return {
    political: {
      benefit: Math.min(100, political.benefit * pm),
      cost:    political.cost,
      net:     Math.min(100, political.benefit * pm) - political.cost,
    },
    economic: {
      benefit: Math.min(100, economic.benefit * pm),
      cost:    economic.cost,
      net:     Math.min(100, economic.benefit * pm) - economic.cost,
    },
    social: {
      benefit: Math.min(100, social.benefit * pm + cooperationBonus),
      cost:    social.cost,
      net:     Math.min(100, social.benefit * pm + cooperationBonus) - social.cost,
    },
  };
}

export function computeObjective(
  scores: PolicyScores,
  weights: RegionWeights,
  fatigue: number,
  penalty: number,
): number {
  const raw =
    scores.political.net * weights.political +
    scores.economic.net  * weights.economic  +
    scores.social.net    * weights.social;

  const fatigued = raw * (1 - fatigue * 0.1);
  return Math.max(-100, fatigued - penalty);
}

export function applyEmpathyMultiplier(
  ownObjective: number,
  opponentObjective: number,
  empathyRatio: number,
): number {
  if (empathyRatio <= 0) return ownObjective;
  return ownObjective * (1 - empathyRatio) + opponentObjective * empathyRatio;
}

export function applyFatiguePenalty(
  currentFatigue: number,
  roundNumber: number,
  emotionalStability: number,
  maxRounds: number,
): number {
  const roundFraction = roundNumber / Math.max(maxRounds, 1);
  const fatigueDelta = roundFraction * (1 - emotionalStability) * 0.15;
  return Math.min(1, currentFatigue + fatigueDelta);
}

export function computePenalty(
  violatedRedLines: number,
  lowCooperationRounds: number,
  repeatedPositions: number,
): number {
  return violatedRedLines * 15 + lowCooperationRounds * 3 + repeatedPositions * 5;
}

export class OCEANTraits {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;

  constructor(
    openness: number,
    conscientiousness: number,
    extraversion: number,
    agreeableness: number,
    neuroticism: number,
  ) {
    this.openness          = Math.max(0, Math.min(1, openness));
    this.conscientiousness = Math.max(0, Math.min(1, conscientiousness));
    this.extraversion      = Math.max(0, Math.min(1, extraversion));
    this.agreeableness     = Math.max(0, Math.min(1, agreeableness));
    this.neuroticism       = Math.max(0, Math.min(1, neuroticism));
  }

  empathyScore(): number {
    return (this.agreeableness * 0.5 + this.openness * 0.3 + (1 - this.neuroticism) * 0.2);
  }

  personalityModifier(): number {
    return (
      this.openness          * 0.25 +
      this.conscientiousness * 0.20 +
      this.extraversion      * 0.20 +
      this.agreeableness     * 0.20 +
      (1 - this.neuroticism) * 0.15
    ) - 0.5;
  }

  asDict(): Record<string, number> {
    return {
      openness:          Math.round(this.openness          * 1000) / 1000,
      conscientiousness: Math.round(this.conscientiousness * 1000) / 1000,
      extraversion:      Math.round(this.extraversion      * 1000) / 1000,
      agreeableness:     Math.round(this.agreeableness     * 1000) / 1000,
      neuroticism:       Math.round(this.neuroticism        * 1000) / 1000,
    };
  }
}

export class AgentScorecard {
  agentName: string;
  roundsPlayed = 0;
  roundScores: PolicyScores[] = [];
  objectiveValues: number[] = [];
  fatigue = 0;
  penalties = 0;
  empathyBonus = 0;
  cumulativeScores: PolicyScores = {
    political: { benefit: 0, cost: 0, net: 0 },
    economic:  { benefit: 0, cost: 0, net: 0 },
    social:    { benefit: 0, cost: 0, net: 0 },
  };

  constructor(agentName: string) {
    this.agentName = agentName;
  }

  get finalObjective(): number {
    if (!this.objectiveValues.length) return 0;
    return this.objectiveValues[this.objectiveValues.length - 1];
  }

  asDict(): Record<string, unknown> {
    return {
      agent:            this.agentName,
      rounds_played:    this.roundsPlayed,
      final_objective:  Math.round(this.finalObjective * 100) / 100,
      fatigue:          Math.round(this.fatigue        * 1000) / 1000,
      penalties:        Math.round(this.penalties      * 100)  / 100,
      empathy_bonus:    Math.round(this.empathyBonus   * 100)  / 100,
      cumulative_scores: {
        political: {
          benefit: Math.round(this.cumulativeScores.political.benefit * 100) / 100,
          cost:    Math.round(this.cumulativeScores.political.cost    * 100) / 100,
          net:     Math.round(this.cumulativeScores.political.net     * 100) / 100,
        },
        economic: {
          benefit: Math.round(this.cumulativeScores.economic.benefit  * 100) / 100,
          cost:    Math.round(this.cumulativeScores.economic.cost     * 100) / 100,
          net:     Math.round(this.cumulativeScores.economic.net      * 100) / 100,
        },
        social: {
          benefit: Math.round(this.cumulativeScores.social.benefit    * 100) / 100,
          cost:    Math.round(this.cumulativeScores.social.cost       * 100) / 100,
          net:     Math.round(this.cumulativeScores.social.net        * 100) / 100,
        },
      },
      objective_history: this.objectiveValues.map((v) => Math.round(v * 100) / 100),
    };
  }
}


