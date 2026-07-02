export interface ObjectivesAnalysis {
  primaryGoal: string;
  secondaryGoals: string[];
  conflicts: string[];
  synergies: string[];
  dnaAdjustments: {
    creativity: number;
    discipline: number;
    leadership: number;
    explosiveness: number;
    vision: number;
    calm: number;
    resilience: number;
    technique: number;
  };
}

export const ALL_OBJECTIVES = [
  "Devenir professionnel",
  "Intégrer un centre de formation",
  "Jouer en National",
  "Être titulaire",
  "Gagner en vitesse",
  "Améliorer ma finition",
  "Reprendre après une blessure",
  "Retrouver confiance",
  "Perdre du poids",
  "Développer mon physique",
  "Être plus régulier",
  "Mieux récupérer",
  "Prévenir les blessures",
  "Améliorer ma vision du jeu",
  "Développer mon mental"
];

// Hierarchy of ambition to automatically select the primary goal
const AMBITION_HIERARCHY = [
  "Devenir professionnel",
  "Intégrer un centre de formation",
  "Jouer en National",
  "Être titulaire",
  "Gagner en vitesse",
  "Améliorer ma finition",
  "Améliorer ma vision du jeu",
  "Développer mon mental",
  "Développer mon physique",
  "Être plus régulier",
  "Reprendre après une blessure",
  "Retrouver confiance",
  "Mieux récupérer",
  "Prévenir les blessures",
  "Perdre du poids"
];

export function analyzeObjectives(selected: string[]): ObjectivesAnalysis {
  if (!selected || selected.length === 0) {
    return {
      primaryGoal: "Progresser au football",
      secondaryGoals: [],
      conflicts: [],
      synergies: [],
      dnaAdjustments: {
        creativity: 0,
        discipline: 0,
        leadership: 0,
        explosiveness: 0,
        vision: 0,
        calm: 0,
        resilience: 0,
        technique: 0
      }
    };
  }

  // Find primary goal by seeking the first match in our hierarchy
  let primaryGoal = selected[0];
  for (const candidate of AMBITION_HIERARCHY) {
    if (selected.includes(candidate)) {
      primaryGoal = candidate;
      break;
    }
  }

  // Secondary goals are everything else
  const secondaryGoals = selected.filter(g => g !== primaryGoal);

  // Detect conflicts and synergies
  const conflicts: string[] = [];
  const synergies: string[] = [];

  const has = (goal: string) => selected.includes(goal);

  // Conflict 1: Recovery + High Intensity
  if (has("Reprendre après une blessure") && (has("Gagner en vitesse") || has("Développer mon physique"))) {
    conflicts.push(
      "Alerte Surcharge : Reprendre de blessure tout en cherchant à développer ta vitesse/force athlétique présente un risque élevé de récidive. Ton programme d'entraînement imposera un palier de réathlétisation progressif."
    );
  }

  // Conflict 2: Weight loss + Mass gain
  if (has("Perdre du poids") && has("Développer mon physique")) {
    conflicts.push(
      "Double Métabolisme : Perdre du poids (déficit calorique) et développer ton physique (prise de masse musculaire) sont physiologiquement opposés. Le Nutrition Engine devra cibler une recomposition corporelle très précise."
    );
  }

  // Synergy 1: Finition + Vision
  if (has("Améliorer ma finition") && has("Améliorer ma vision du jeu")) {
    synergies.push(
      "Synergie Offensive : L'association d'une finition chirurgicale et d'une vision de jeu élargie forme le profil d'un attaquant moderne ultra-complet."
    );
  }

  // Synergy 2: Mental + Confiance
  if (has("Développer mon mental") && has("Retrouver confiance")) {
    synergies.push(
      "Alignement Psychologique : Le renforcement mental accélère de 40% le retour de la confiance après un doute ou une mauvaise passe."
    );
  }

  // Synergy 3: Récupération + Régularité
  if (has("Mieux récupérer") && has("Être plus régulier")) {
    synergies.push(
      "Axe d'Hygiène de Vie : Optimiser ta récupération est le secret absolu pour maintenir un niveau de performance régulier sans baisse de régime."
    );
  }

  // Synergy 4: Prévention + Physique
  if (has("Prévenir les blessures") && has("Développer mon physique")) {
    synergies.push(
      "Synergie Prophylactique : Un renforcement musculaire ciblé et intelligent est la meilleure arme de prévention des blessures musculaires."
    );
  }

  // Calculate DNA adjustments
  const dnaAdjustments = {
    creativity: 0,
    discipline: 0,
    leadership: 0,
    explosiveness: 0,
    vision: 0,
    calm: 0,
    resilience: 0,
    technique: 0
  };

  selected.forEach(goal => {
    switch (goal) {
      case "Gagner en vitesse":
        dnaAdjustments.explosiveness += 3;
        break;
      case "Améliorer ma finition":
        dnaAdjustments.technique += 2;
        dnaAdjustments.calm += 1;
        break;
      case "Améliorer ma vision du jeu":
        dnaAdjustments.vision += 3;
        dnaAdjustments.creativity += 1;
        break;
      case "Développer mon mental":
        dnaAdjustments.calm += 2;
        dnaAdjustments.leadership += 2;
        break;
      case "Retrouver confiance":
        dnaAdjustments.calm += 3;
        dnaAdjustments.resilience += 1;
        break;
      case "Développer mon physique":
        dnaAdjustments.resilience += 3;
        break;
      case "Être plus régulier":
        dnaAdjustments.discipline += 3;
        break;
      case "Mieux récupérer":
        dnaAdjustments.discipline += 1;
        dnaAdjustments.resilience += 2;
        break;
      case "Prévenir les blessures":
        dnaAdjustments.discipline += 2;
        break;
      case "Devenir professionnel":
      case "Intégrer un centre de formation":
        dnaAdjustments.discipline += 1;
        dnaAdjustments.leadership += 1;
        break;
      default:
        break;
    }
  });

  return {
    primaryGoal,
    secondaryGoals,
    conflicts,
    synergies,
    dnaAdjustments
  };
}
