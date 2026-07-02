import { PlayerProfile, FootballDNA, SkillNode, Session, Match, Correlation, Experiment, Meal, CareerMilestone, Exercise } from './types';

export const INITIAL_PLAYER_PROFILE: PlayerProfile = {
  firstName: "",
  lastName: "",
  club: "",
  league: "",
  position: "",
  secondaryPosition: "",
  preferredFoot: "Droit",
  size: 175,
  weight: 65,
  number: 10,
  practiceYears: 1,
  level: 1,
  xp: 0,
  xpNextLevel: 1000,
  coins: 0,
  progressScore: 0, // Current momentum
  legacyScore: 0, // Global career progression
  streak: 0, // Active consecutive days
  currentGoal: "",
  biography: "",
  age: 16,
  nationality: "",
  country: "",
  photoUrl: undefined,
  selectedObjectives: []
};

export const INITIAL_DNA: FootballDNA = {
  creativity: 50,
  discipline: 50,
  leadership: 50,
  explosiveness: 50,
  vision: 50,
  calm: 50,
  resilience: 50,
  technique: 50
};

export const INITIAL_SKILLS: SkillNode[] = [
  // TECHNIQUE BRANCH (Parent: None)
  { id: 'tech_root', name: 'Maitrise Technique', category: 'Technique', value: 50, unlocked: true, cost: 0 },
  { id: 'tech_1', name: 'Première touche', category: 'Technique', value: 50, unlocked: false, cost: 200, parentId: 'tech_root', description: 'Contrôle initial de balle orienté ou arrêté.' },
  { id: 'tech_2', name: 'Dribble', category: 'Technique', value: 50, unlocked: false, cost: 200, parentId: 'tech_root', description: 'Capacité à éliminer en un contre un.' },
  { id: 'tech_3', name: 'Conduite rapide', category: 'Technique', value: 50, unlocked: false, cost: 200, parentId: 'tech_root', description: 'Contrôle à pleine vitesse.' },
  { id: 'tech_4', name: 'Pied faible (Gauche)', category: 'Technique', value: 50, unlocked: false, cost: 400, parentId: 'tech_root', description: 'Qualité de frappe et de passe du pied gauche.' },
  { id: 'tech_5', name: 'Contrôle orienté', category: 'Technique', value: 50, unlocked: false, cost: 200, parentId: 'tech_1', description: 'Contrôle éliminant l\'adversaire d\'une touche.' },
  { id: 'tech_6', name: 'Centres', category: 'Technique', value: 50, unlocked: false, cost: 200, parentId: 'tech_root', description: 'Précision des transmissions latérales aériennes.' },
  { id: 'tech_7', name: 'Passe courte', category: 'Technique', value: 50, unlocked: false, cost: 200, parentId: 'tech_root', description: 'Fluidité et tempo des passes au sol.' },

  // PHYSIQUE BRANCH (Parent: None)
  { id: 'phys_root', name: 'Qualité Physique', category: 'Physique', value: 50, unlocked: true, cost: 0 },
  { id: 'phys_1', name: 'Accélération', category: 'Physique', value: 50, unlocked: false, cost: 200, parentId: 'phys_root', description: 'Vitesse de démarrage sur les 5 premiers mètres.' },
  { id: 'phys_2', name: 'Sprint maximal', category: 'Physique', value: 50, unlocked: false, cost: 200, parentId: 'phys_root', description: 'Vitesse de pointe lancée.' },
  { id: 'phys_3', name: 'Endurance spécifique', category: 'Physique', value: 50, unlocked: false, cost: 200, parentId: 'phys_root', description: 'Capacité à répéter les efforts de haute intensité.' },
  { id: 'phys_4', name: 'Explosivité d\'appui', category: 'Physique', value: 50, unlocked: false, cost: 200, parentId: 'phys_root', description: 'Vivacité et changements de direction rapides.' },
  { id: 'phys_5', name: 'Détente verticale', category: 'Physique', value: 50, unlocked: false, cost: 300, parentId: 'phys_root', description: 'Hauteur d\'impulsion lors des duels aériens.' },

  // TACTIQUE BRANCH
  { id: 'tact_root', name: 'Intelligence Tactique', category: 'Tactique', value: 50, unlocked: true, cost: 0 },
  { id: 'tact_1', name: 'Appels de balle', category: 'Tactique', value: 50, unlocked: false, cost: 200, parentId: 'tact_root', description: 'Timing et direction des démarquages.' },
  { id: 'tact_2', name: 'Prise d\'information (Scan)', category: 'Tactique', value: 50, unlocked: false, cost: 350, parentId: 'tact_root', description: 'Prise visuelle de l\'environnement avant de recevoir.' },
  { id: 'tact_3', name: 'Pressing ciblé', category: 'Tactique', value: 50, unlocked: false, cost: 200, parentId: 'tact_root', description: 'Efficacité du harcèlement sur le porteur adverse.' },
  { id: 'tact_4', name: 'Lecture des transitions', category: 'Tactique', value: 50, unlocked: false, cost: 200, parentId: 'tact_root', description: 'Anticipation des pertes et récupérations de balle.' },

  // MENTAL BRANCH
  { id: 'ment_root', name: 'Force Mentale', category: 'Mental', value: 50, unlocked: true, cost: 0 },
  { id: 'ment_1', name: 'Calme sous pression', category: 'Mental', value: 50, unlocked: false, cost: 200, parentId: 'ment_root', description: 'Sérénité de décision dans les zones denses.' },
  { id: 'ment_2', name: 'Discipline de routine', category: 'Mental', value: 50, unlocked: false, cost: 200, parentId: 'ment_root', description: 'Régularité des exercices hors entraînement.' },
  { id: 'ment_3', name: 'Résilience au combat', category: 'Mental', value: 50, unlocked: false, cost: 200, parentId: 'ment_root', description: 'Capacité à se surpasser après une erreur.' },

  // LIFESTYLE BRANCH
  { id: 'life_root', name: 'Style de Vie', category: 'Lifestyle', value: 50, unlocked: true, cost: 0 },
  { id: 'life_1', name: 'Sommeil récupérateur', category: 'Lifestyle', value: 50, unlocked: false, cost: 200, parentId: 'life_root', description: 'Régularité et profondeur du sommeil.' },
  { id: 'life_2', name: 'Hydratation cellulaire', category: 'Lifestyle', value: 50, unlocked: false, cost: 200, parentId: 'life_root', description: 'Régularité des apports d\'eau quotidiens.' },
  { id: 'life_3', name: 'Nutrition sportive', category: 'Lifestyle', value: 50, unlocked: false, cost: 250, parentId: 'life_root', description: 'Équilibre des apports en fonction de la charge.' }
];

export const MOCK_EXERCISES_LIBRARY: Exercise[] = [
  {
    id: "ex_1",
    name: "Contrôle orienté - Mur & plots",
    duration: 12,
    intensity: "Modérée",
    targetReps: "3 séries de 40 répétitions (pied gauche)",
    focusPoints: ["Hanches ouvertes vers la destination", "Pied d'appui à 30cm du ballon", "Regard haut avant le contrôle"],
    commonErrors: ["Corps rigide vers le mur", "Trop de recul après le rebond"],
    easyVariant: "Mur rapproché with soft ball",
    hardVariant: "Contrôle orienté + quick strike",
    description: "Amélioration de la première touche du pied gauche sous pression simulée. Permet d'éliminer un défenseur direct dès la réception.",
    videoDemoName: "WallControl"
  },
  {
    id: "ex_2",
    name: "Sprints courts avec changements d'appui",
    duration: 15,
    intensity: "Élevée",
    targetReps: "5 séries de 6 répétitions",
    focusPoints: ["Abaisser le centre de gravité au virage", "Poussée explosive du métatarse", "Gainage abdominal maximal"],
    commonErrors: ["Buste redressé au pivot", "Glissade par manque d'appuis ancrés"],
    easyVariant: "No sharp turns, run in fluid curve",
    hardVariant: "Add ball pickup after pivot",
    description: "Amélioration de l'accélération sur les 3 premiers mètres et renforcement de l'explosivité musculaire des jambes.",
    videoDemoName: "SprintShuttle"
  },
  {
    id: "ex_3",
    name: "Prise d'information aveugle (Scan)",
    duration: 10,
    intensity: "Faible",
    targetReps: "4 séries de 2 minutes",
    focusPoints: ["Tourner la tête 2 fois avant de recevoir", "Garder la balle vivante sous la semelle", "Mémoriser la couleur du plot derrière"],
    commonErrors: ["Scanner uniquement quand la balle est partie", "Fixer le ballon des yeux"],
    easyVariant: "One colored cone behind",
    hardVariant: "Active color change triggered by signal",
    description: "Augmentation de la vitesse de prise d'information périphérique. Essentiel pour accélérer le jeu et réduire les pertes de balle.",
    videoDemoName: "ScanTraining"
  },
  {
    id: "ex_4",
    name: "Crossover dribble & Accélération",
    duration: 15,
    intensity: "Élevée",
    targetReps: "4 séries de 8 répétitions",
    focusPoints: ["Fausse piste avec le buste", "Pied d'appui projeté vers l'avant", "Accélération immédiate après le crochet"],
    commonErrors: ["Accélération tardive", "Crochet trop court facilitant le tacle"],
    easyVariant: "Slow dribble around static cones",
    hardVariant: "Add passive defender to beat",
    description: "Dribble signature pour éliminer sur l'aile droite et s'ouvrir le chemin du but ou du centre.",
    videoDemoName: "WingDribble"
  },
  {
    id: "ex_5",
    name: "Gainage dynamique & Mobilité hanches",
    duration: 10,
    intensity: "Faible",
    targetReps: "3 séries de 1 minute",
    focusPoints: ["Hanches alignées avec les épaules", "Mouvement fluide des fessiers", "Respiration diaphragmatique"],
    commonErrors: ["Dos creusé", "Apnée durant l'effort"],
    easyVariant: "Static plank on knees",
    hardVariant: "Plank with alternating leg lifts",
    description: "Idéal pour stabiliser les hanches lors des duels physiques et renforcer la rééducation.",
    videoDemoName: "PlankFlow"
  }
];

export const INITIAL_SESSIONS: Session[] = [];
export const INITIAL_MATCHES: Match[] = [];
export const INITIAL_CORRELATIONS: Correlation[] = [];
export const INITIAL_EXPERIMENTS: Experiment[] = [];
export const INITIAL_MEALS: Meal[] = [];
export const INITIAL_MILESTONES: CareerMilestone[] = [];
