export const MODEL = Object.freeze({
  minAgents: 1,
  maxAgents: 12,
  automaticExtraAgents: 4,
  agentCost: 1,
  coordinationCost: 0.25,
  roleCoordinationFactor: 0.5,
  roundCapCoordinationFactor: 0.4,
  noRoundCapCoordinationFactor: 1.6,
  budgetCostLimit: 12,
  coordinatorCostPerAgent: 0.15,
  qualityExponent: 0.6,
  roleEfficiency: 0.7,
  conflictStart: 4,
  conflictPerExtraAgent: 5,
  roleConflictFactor: 0.4,
  coordinatorConflictFactor: 0.6,
  riskPerAgent: 6,
  signoffRiskFactor: 0.4,
  roundCapRiskFactor: 0.7,
  coordinatorRiskFactor: 0.85,
  irreversibleRiskFactor: 2,
  lowRiskMax: 19,
  mediumRiskMax: 44,
});

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round1 = (value) => Math.round(value * 10) / 10;

export function calculateModel({ agents = 1, roles = false, budget = false, cap = false, signoff = false, coordinator = false, noLimit = false, irreversible = false } = {}) {
  const n = clamp(Math.round(Number(agents) || MODEL.minAgents), MODEL.minAgents, MODEL.maxAgents);
  const effectiveAgents = noLimit && !budget ? Math.min(MODEL.maxAgents, n + MODEL.automaticExtraAgents) : n;
  const coordination = MODEL.coordinationCost * effectiveAgents * (effectiveAgents - 1) / 2
    * (roles ? MODEL.roleCoordinationFactor : 1)
    * (cap ? MODEL.roundCapCoordinationFactor : MODEL.noRoundCapCoordinationFactor);
  const coordinatorCost = coordinator ? MODEL.coordinatorCostPerAgent * effectiveAgents : 0;
  const rawCost = effectiveAgents * MODEL.agentCost + coordination + coordinatorCost;
  const cost = round1(budget ? Math.min(MODEL.budgetCostLimit, rawCost) : rawCost);

  const qualityAgents = effectiveAgents * (roles ? 1 : MODEL.roleEfficiency);
  let conflict = Math.max(0, qualityAgents - MODEL.conflictStart) * MODEL.conflictPerExtraAgent * (roles ? MODEL.roleConflictFactor : 1);
  if (coordinator) conflict *= MODEL.coordinatorConflictFactor;
  const quality = Math.round(clamp(100 * (1 - Math.exp(-MODEL.qualityExponent * qualityAgents)) - conflict, 0, 100));

  let riskScore = effectiveAgents * MODEL.riskPerAgent
    * (signoff ? MODEL.signoffRiskFactor : 1)
    * (cap ? MODEL.roundCapRiskFactor : 1);
  if (coordinator) riskScore *= MODEL.coordinatorRiskFactor;
  if (irreversible) riskScore *= MODEL.irreversibleRiskFactor;
  const riskLevel = irreversible && !signoff ? "high"
    : riskScore <= MODEL.lowRiskMax ? "low"
      : riskScore <= MODEL.mediumRiskMax ? "medium" : "high";

  const summary = effectiveAgents < 3 ? "tooFew"
    : riskLevel === "high" || (noLimit && !budget) || (effectiveAgents > 7 && (!roles || !cap)) ? "tooMany"
      : "justRight";
  return {
    selectedAgents: n,
    effectiveAgents,
    cost,
    quality,
    riskScore: round1(riskScore),
    riskLevel,
    summary,
    conflict: round1(conflict),
    automatic: noLimit && !budget,
  };
}
