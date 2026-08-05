(function initForgeIntelligenceCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ForgeIntelligenceCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  function clamp(value, min, max) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return min;
    return Math.min(max, Math.max(min, numeric));
  }

  function round(value, digits = 0) {
    const factor = 10 ** digits;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function classifyComplexity(score) {
    if (score >= 75) return { label: 'Very high', key: 'very-high' };
    if (score >= 52) return { label: 'High', key: 'high' };
    if (score >= 28) return { label: 'Medium', key: 'medium' };
    return { label: 'Focused', key: 'focused' };
  }

  function infrastructureRecommendation(score, operations, branches, users) {
    if (score >= 75 || operations >= 50000 || branches >= 30) {
      return {
        tier: 'Tier 4 · High-assurance platform',
        summary: 'Managed multi-service architecture, asynchronous processing, observability, formal access controls, and staged rollout.',
      };
    }
    if (score >= 52 || operations >= 15000 || users >= 120 || branches >= 10) {
      return {
        tier: 'Tier 3 · Multi-organization managed app',
        summary: 'Managed database, API backend, background jobs, audit history, role-based access, monitoring, and controlled integrations.',
      };
    }
    if (score >= 28 || operations >= 3000 || users >= 25) {
      return {
        tier: 'Tier 2 · Managed operational MVP',
        summary: 'Hosted application, managed relational database, authentication, backups, basic analytics, and one validated integration.',
      };
    }
    return {
      tier: 'Tier 1 · Focused prototype',
      summary: 'Lightweight hosted prototype with fictional or limited pilot data, no unnecessary infrastructure, and direct user testing.',
    };
  }

  function mvpRecommendation(input, complexity) {
    const scope = ['One accountable workflow', 'One primary user role', 'Baseline and outcome measurement'];
    if (input.branches > 1) scope.push('Pilot in one branch before wider rollout');
    if (input.systems > 1) scope.push('Integrate only the highest-value system first');
    if (input.spreadsheets > 0) scope.push('Import one controlled spreadsheet template');
    if (input.errorRate >= 8 || input.reworkRate >= 12) scope.push('Exception and rework tracking');
    if (input.handoffs >= 4) scope.push('Responsibility and handoff history');
    if (complexity.key === 'very-high') scope.push('Technical spike before committing to full scope');
    return [...new Set(scope)].slice(0, 6);
  }

  function adoptionRecommendation(input, complexity) {
    const plan = [
      'Validate the current baseline with real operators.',
      `Run a controlled pilot with ${Math.min(input.users, Math.max(3, Math.ceil(input.users * 0.15)))} representative users.`,
      'Train with real tasks and record failure points.',
    ];
    if (input.branches > 1) plan.push('Expand branch by branch only after pilot evidence is reviewed.');
    if (input.users >= 50) plan.push('Create internal champions and role-specific onboarding.');
    if (complexity.key === 'high' || complexity.key === 'very-high') plan.push('Use a staged cutover with rollback and support coverage.');
    else plan.push('Review usage and outcomes after the first two operating cycles.');
    return plan;
  }

  function calculateScenario(rawInput = {}) {
    const input = {
      operations: clamp(rawInput.operations, 0, 1000000),
      minutes: clamp(rawInput.minutes, 0, 1440),
      reduction: clamp(rawInput.reduction, 0, 95),
      hourlyValue: clamp(rawInput.hourlyValue, 0, 1000000),
      users: clamp(rawInput.users, 1, 10000),
      branches: clamp(rawInput.branches, 1, 1000),
      errorRate: clamp(rawInput.errorRate, 0, 100),
      reworkRate: clamp(rawInput.reworkRate, 0, 100),
      growthRate: clamp(rawInput.growthRate, 0, 100),
      softwareCost: clamp(rawInput.softwareCost, 0, 1000000000),
      handoffs: clamp(rawInput.handoffs, 0, 100),
      spreadsheets: clamp(rawInput.spreadsheets, 0, 1000),
      systems: clamp(rawInput.systems, 1, 100),
    };

    const baseManualHours = input.operations * input.minutes / 60;
    const errorFriction = input.errorRate / 100 * 0.35;
    const reworkFriction = input.reworkRate / 100 * 0.55;
    const handoffFriction = Math.max(0, input.handoffs - 2) * 0.025;
    const spreadsheetFriction = input.spreadsheets * 0.012;
    const systemFriction = Math.max(0, input.systems - 1) * 0.02;
    const frictionMultiplier = 1 + errorFriction + reworkFriction + handoffFriction + spreadsheetFriction + systemFriction;
    const adjustedManualHours = baseManualHours * frictionMultiplier;
    const potentialHoursReleased = adjustedManualHours * input.reduction / 100;
    const annualHoursReleased = potentialHoursReleased * 12;
    const annualCapacityValue = annualHoursReleased * input.hourlyValue;
    const annualSoftwareCost = input.softwareCost * 12;
    const errorOperations = input.operations * input.errorRate / 100;
    const monthlyReworkHours = input.operations * input.reworkRate / 100 * input.minutes / 60;
    const projectedMonthlyOperations = input.operations * ((1 + input.growthRate / 100) ** 12);

    const complexityScore = clamp(
      8
      + Math.min(18, input.systems * 3)
      + Math.min(16, input.handoffs * 2)
      + Math.min(14, input.spreadsheets * 1.4)
      + Math.min(16, Math.max(0, input.branches - 1) * 2.2)
      + Math.min(14, Math.max(0, input.users - 5) / 8)
      + Math.min(8, input.errorRate / 2)
      + Math.min(6, input.reworkRate / 3),
      0,
      100,
    );

    const complexity = classifyComplexity(complexityScore);
    const infrastructure = infrastructureRecommendation(complexityScore, input.operations, input.branches, input.users);

    return {
      input,
      metrics: {
        baseManualHours: round(baseManualHours, 1),
        adjustedManualHours: round(adjustedManualHours, 1),
        potentialHoursReleased: round(potentialHoursReleased, 1),
        annualHoursReleased: round(annualHoursReleased, 1),
        annualCapacityValue: round(annualCapacityValue),
        annualSoftwareCost: round(annualSoftwareCost),
        errorOperations: round(errorOperations, 1),
        monthlyReworkHours: round(monthlyReworkHours, 1),
        projectedMonthlyOperations: round(projectedMonthlyOperations),
        frictionMultiplier: round(frictionMultiplier, 2),
      },
      complexity: { ...complexity, score: round(complexityScore) },
      infrastructure,
      mvpScope: mvpRecommendation(input, complexity),
      adoptionPlan: adoptionRecommendation(input, complexity),
      assumptions: [
        'The reduction percentage is an exploratory scenario, not a guaranteed efficiency gain.',
        'Hourly value represents capacity value and must not be treated automatically as cash savings.',
        'Error, rework, growth, and operating-volume inputs require validation with real process data.',
        'Infrastructure and MVP recommendations are directional and require human technical review.',
      ],
    };
  }

  return {
    calculateScenario,
    classifyComplexity,
    infrastructureRecommendation,
    clamp,
    round,
  };
});
