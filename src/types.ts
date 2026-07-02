export type SkillCategory = 'Technique' | 'Physique' | 'Mental' | 'Tactique' | 'Lifestyle' | 'Football IQ';

export interface FootballDNA {
  creativity: number;
  discipline: number;
  leadership: number;
  explosiveness: number;
  vision: number;
  calm: number;
  resilience: number;
  technique: number;
}

export interface PlayerProfile {
  firstName: string;
  lastName: string;
  club: string;
  league: string;
  position: string;
  secondaryPosition: string;
  preferredFoot: 'Gauche' | 'Droit' | 'Ambidextre';
  size: number; // cm
  weight: number; // kg
  number: number;
  practiceYears: number;
  level: number;
  xp: number;
  xpNextLevel: number;
  coins: number;
  progressScore: number; // 0 - 1000 (current momentum)
  legacyScore: number; // 0 - 1000 (career progress)
  streak: number; // days
  currentGoal: string;
  biography: string;
  age: number;
  nationality: string;
  country: string;
  city?: string;
  photoUrl?: string;
  selectedObjectives?: string[];
  connectedClubs?: string[];
  seasonMode?: SeasonMode;
  foodProfile?: FoodProfile;
}

export interface SkillNode {
  id: string;
  name: string;
  category: SkillCategory;
  value: number; // 0-99
  unlocked: boolean;
  cost: number; // in Coins
  description?: string;
  parentId?: string; // for Skill Tree dependency
}

export interface Exercise {
  id: string;
  name: string;
  duration: number; // minutes
  intensity: 'Faible' | 'Modérée' | 'Élevée';
  targetReps?: string;
  focusPoints: string[];
  commonErrors: string[];
  easyVariant: string;
  hardVariant: string;
  description: string;
  videoDemoName: string; // fallback icon/illust name
}

export interface Session {
  id: string;
  name: string;
  duration: number; // total minutes
  intensity: 'Faible' | 'Modérée' | 'Élevée';
  category: SkillCategory;
  exercises: Exercise[];
  completed: boolean;
  date?: string;
  feedbackScore?: 'Facile' | 'Correct' | 'Difficile' | 'Impossible';
  adjustmentNote?: string;
}

export interface MatchStats {
  goals: number;
  assists: number;
  passesAttempted: number;
  passesCompleted: number;
  sprints: number;
  maxSpeed: number; // km/h
  distanceCovered: number; // km
  tacklesWon: number;
  interceptions: number;
  yellowCards: number;
  redCards: number;
}

export interface Match {
  id: string;
  opponent: string;
  type: 'Officiel' | 'Amical' | 'Détection' | 'Tournoi' | 'Five' | 'Entraînement';
  date: string;
  playedMinutes: number;
  stats: MatchStats;
  rating: number; // out of 10
  readinessIndex: number; // calculated % (before match)
  matchPlan?: {
    mainObjective: string;
    vigilancePoints: string[];
    tacticalAdvice: string;
    nutritionPreMatch: string;
  };
  impactScore?: number; // 0-100 (influence on career)
  report?: {
    successHighlights: string[];
    weaknessesExposed: string[];
    nextActionStep: string;
    careerImpactPhrase: string;
  };
  completed: boolean;
}

export interface Correlation {
  id: string;
  factor: string;
  effect: string;
  percent: number; // e.g. +11
  description: string;
  positive: boolean;
}

export interface Experiment {
  id: string;
  name: string;
  durationWeeks: number;
  objective: string;
  status: 'suggested' | 'active' | 'completed';
  progressDays: number;
  totalDays: number;
  insight?: string;
}

export interface Meal {
  id: string;
  name: string;
  time: string; // e.g., "08:00"
  type: 'Petit-déjeuner' | 'Collation' | 'Déjeuner' | 'Dîner';
  description: string;
  calories: number;
  proteins: number; // g
  carbs: number; // g
  fats: number; // g
  isHealthy: boolean;
}

export interface CoachMessage {
  id: string;
  sender: 'coach' | 'player';
  text: string;
  timestamp: string;
  suggestedAction?: {
    type: 'session' | 'recipe' | 'setup';
    label: string;
    data: any;
  };
}

export type CoachPersonality = 'exigeant' | 'pedagogue' | 'motivant' | 'professionnel';

export type SeasonMode = 'pre_season' | 'in_season' | 'off_season' | 'reprise';

export interface FoodProfile {
  allergies: string[];
  intolerances: string[];
  dislikedFoods: string[];
  dietType: 'omnivore' | 'vegetarien' | 'vegan' | 'halal' | 'autre';
  budget: 'economique' | 'moyen' | 'premium';
  cookingTime: number; // minutes
  objectives: 'prise_de_masse' | 'maintien' | 'seche' | 'performance';
  availableIngredients: string[];
}

export interface FootballIQVideo {
  id: string;
  title: string;
  youtubeUrl: string;
  category: string; // displacements, calls, timing, 1v1, info intake
  description: string;
  quizQuestions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  completed: boolean;
  quizPassed?: boolean;
}

export interface ProMatch {
  id: string;
  teams: string; // PSG vs Arsenal
  time: string; // 21h00
  date: string; // 2026-06-30 etc
  competition: string;
  tvChannels: string[];
  isFree: boolean;
  officialLink?: string;
  tacticalObservationGuide: string;
}

export interface MuscleExercise {
  name: string;
  muscleGroup: string; // pectoraux, dos, épaules, trapèzes, biceps, triceps, avant-bras, gainage, abdominaux, obliques, lombaires, quadriceps, ischios, fessiers, mollets, adducteurs
  sets: number;
  reps: string;
  restSeconds: number;
}

export interface MuscleWorkout {
  id: string;
  name: string; // e.g. Haut du corps, Core, Bas du corps
  category: 'haut' | 'core' | 'bas';
  exercises: MuscleExercise[];
  completed: boolean;
  date: string;
  durationMinutes: number;
}

export interface CareerMilestone {
  id: string;
  title: string;
  date: string;
  description: string;
  type: 'achievement' | 'milestone' | 'record' | 'injury';
  rewardXp?: number;
  rewardCoins?: number;
}

