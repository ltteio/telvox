import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerProfile, FootballDNA } from '../types';
import { 
  Fingerprint, Sparkles, Shield, Cpu, Activity, Zap, 
  ChevronRight, ChevronLeft, Target, Trophy, Award, Star,
  CheckCircle2, Flame, Heart, Scale, Trash2, Calendar, User,
  Camera, Upload, AlertCircle, RefreshCw, Volume2, Eye, Smile,
  Dumbbell, Clock, Smartphone, MessageSquare, Clipboard, Users, ShieldAlert, Check
} from 'lucide-react';
import { analyzeObjectives } from '../utils/objectivesAnalyzer';

interface OnboardingProps {
  player: PlayerProfile;
  setPlayer: React.Dispatch<React.SetStateAction<PlayerProfile>>;
  onComplete: (completedDna: FootballDNA) => void;
}

// Compact types for UI data
type Rarity = 'Bronze' | 'Argent' | 'Or' | 'Elite' | 'Wonderkid' | 'Future Star' | 'Legend' | 'GOAT';

const POSITIONS = [
  { code: 'GK', name: 'Gardien de But' },
  { code: 'CB', name: 'Défenseur Central' },
  { code: 'LB', name: 'Arrière Gauche' },
  { code: 'RB', name: 'Arrière Droit' },
  { code: 'CDM', name: 'Milieu Défensif' },
  { code: 'CM', name: 'Milieu Relayeur' },
  { code: 'CAM', name: 'Milieu Offensif' },
  { code: 'LW', name: 'Ailier Gauche' },
  { code: 'RW', name: 'Ailier Droit' },
  { code: 'ST', name: 'Avant-centre' }
];

const OBJECTIVES_LIST = [
  "Devenir professionnel",
  "Intégrer un centre de formation",
  "Améliorer ma vitesse explosive",
  "Gagner en endurance (cardio)",
  "Travailler ma vista / jeu de passe",
  "Renforcer mon pied faible",
  "Devenir titulaire indiscutable",
  "Éviter les blessures à répétition",
  "Travailler la confiance sous pression",
  "Améliorer ma nutrition au quotidien"
];

const EQUIPMENTS_LIST = [
  "Ballons de match", "Cônes de délimitation", "Coupelles", 
  "Haies d'agilité", "Échelle de rythme", "Élastiques de résistance", 
  "Médecine-ball", "Trépied smartphone"
];

const DEVICES_LIST = [
  "Footbar Tracker", "Apple Watch", "Garmin GPS", "Polar Cardio", 
  "WHOOP Band", "Fitbit", "Strava Sync", "Apple Santé / Health Connect"
];

export default function Onboarding({ player, setPlayer, onComplete }: OnboardingProps) {
  // Comprehensive, detailed state collecting 100+ diagnostic data points
  const [state, setState] = useState({
    // Stage 1: Identité
    firstName: '',
    lastName: '',
    sexe: 'Masculin' as 'Masculin' | 'Féminin' | 'Autre',
    birthDate: '2008-06-29',
    age: 18,
    size: 178,
    weight: 68,
    country: 'France',
    city: '',
    language: 'Français',

    // Stage 2: Football
    primaryPos: '',
    secondaryPos: '',
    club: '',
    formerClub: '',
    currentLevel: '',
    practiceYears: 0,
    preferredFoot: 'Droit' as 'Gauche' | 'Droit' | 'Ambidextre',
    weakFootLevel: 3, // 1 to 5 stars
    jerseyNumber: 0,
    isCaptain: false,
    trainingsPerWeek: 4,
    matchesPerWeek: 1,
    minutesPlayedPerMatch: 80,
    starterOrBench: 'Titulaire indiscutable' as any,
    pitchType: 'Synthétique' as any,

    // Stage 3: Objectifs & Mental
    selectedObjectives: [] as string[],
    biggestDream: '',
    dreamImportance: '',
    targetAge: 21,
    dreamSuccessImpact: '',
    reactionBadPerf: 'Revanchard', // Démoralisé, Revanchard, Analyse froide, Rejet de faute
    reactionBigMistake: 'Reste calme', // Se cache, Redouble d'effort, Reste calme
    reactionVictory: 'Déjà focus sur le prochain',
    reactionSubstitute: 'Travaille plus',
    reactionCoachCritique: 'Écoute attentive',
    reactionMissedTraining: 'Rattrapage solo',
    motivationSource: 'Plaisir brut & Ambition',
    discouragementFactor: 'Manque de progression',
    selfConfidence: 7, // 1-10
    fearOfFailure: 'Modérée' as any,
    disciplineRating: 8, // 1-10
    giveUpRating: 2, // 1-10
    compareOthers: 'Parfois' as any,

    // Stage 4: Physique, Récupération & Nutrition
    currentInjuries: '',
    pastInjuries: '',
    operations: '',
    chronicPains: [] as string[],
    knownWeaknesses: [] as string[],
    mobilityRating: 7,
    flexibilityRating: 6,
    perceivedExplosiveness: 8,
    perceivedSpeed: 8,
    perceivedEndurance: 7,
    perceivedForce: 6,
    bedTime: '22:30',
    wakeTime: '07:00',
    sleepDuration: 8.5,
    sleepQuality: 4, // 1-5
    fallingAsleepDifficulty: 'Rare' as any,
    nightAwakenings: false,
    wakeFatigue: false,
    naps: 'Parfois' as any,
    weekendDifferentSchedule: false,
    recoveryFeeling: 8,
    mealsPerDay: 3,
    fullBreakfast: true,
    dailyHydration: 2, // liters
    fruitsVegetablesFrequency: 'Régulier' as any,
    fastFoodFrequency: 'Occasionnel' as any,
    sweetDrinks: 'Rare' as any,
    caffeine: 'Modérée' as any,
    foodSupplements: false,
    allergies: '',
    dietType: 'Sans restriction' as any,

    // Stage 5: Habitudes & Logistique
    screenTime: 3.5, // hours
    tiktokTime: false,
    instagramTime: true,
    youtubeTime: true,
    videoGamesTime: false,
    phoneBeforeSleep: true,
    procrastinationLevel: 3,
    personalOrganization: 8,
    concentrationLevel: 8,
    mainDistraction: 'Téléphone',
    trainingMode: 'Saison' as 'Saison' | 'Vacances',
    availableDays: ['Lundi', 'Mercredi', 'Vendredi', 'Samedi'] as string[],
    availableHours: ['Après-midi', 'Soir'] as string[],
    maxDurationPerSession: 90, // minutes
    schoolJobConstraints: 'Études / Lycée',
    examsSoon: false,
    plannedHolidays: false,
    terrainAvailable: 'À proximité' as any,
    hasGarden: true,
    hasGymAccess: false,
    hasReboundWall: true,
    materialsAvailable: ["Ballons de match", "Cônes de délimitation", "Coupelles"] as string[],

    // Stage 6: Connectivité, Vidéo & Coach & Style
    connectedDevices: ["Apple Watch", "Strava Sync"] as string[],
    connectedClubs: [] as string[],
    canFilmSelf: true,
    smartphoneUsed: 'iOS' as any,
    videoQuality: 'HD 1080p' as any,
    hasExternalCamera: false,
    hasTripod: true,
    coachTone: 'Pédagogue & Patient' as any,
    remindersFrequency: 'Jours de séances' as any,
    notificationTime: '18:00',
    preferredLanguage: 'Français',
    tutoiement: true,
    favoritePlayer: '',
    favoriteClub: '',
    favoriteCompetition: '',
    preferredPlaystyle: 'Transition rapide / Contre' as any,
    resemblesPlayer: '',
    dreamPlayerModel: '',
    dailyStatus: 'Étudiant' as any,
    schoolLevelJobType: 'Baccalauréat',
    transportDurationToFoot: 20, // mins
    freeTimeHours: 4,
    stressLevel: 4,
    familySupport: 'Trés fort' as any,
    otherSportsPratique: ''
  });

  const [activeStage, setActiveStage] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6>(0); // 0 = Scan, 1 to 5 = Questions, 6 = Sync & Reveal
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isPhotoScanning, setIsPhotoScanning] = useState(false);
  const [photoScanProgress, setPhotoScanProgress] = useState(0);
  const getRarityFromLevel = (level: number): Rarity => {
    if (level <= 4) return 'Bronze';
    if (level <= 9) return 'Argent';
    if (level <= 14) return 'Or';
    if (level <= 19) return 'Elite';
    if (level <= 24) return 'Wonderkid';
    if (level <= 29) return 'Future Star';
    if (level <= 34) return 'Legend';
    return 'GOAT';
  };

  const levelMapping: Record<string, number> = {
    'Professionnel': 15,
    'Académie Pro': 10,
    'National': 8,
    'Régional': 5,
    'Départemental': 2,
    'Amateur / Loisir': 1
  };
  const activeRarity = getRarityFromLevel(levelMapping[state.currentLevel] || 1);

  // Scanner awakening states
  const [awakeningProgress, setAwakeningProgress] = useState(0);
  const [isAwakening, setIsAwakening] = useState(false);
  const awakeningTimer = useRef<NodeJS.Timeout | null>(null);

  // Syncing states at reveal stage
  const [revealPhase, setRevealPhase] = useState<'sync' | 'reveal'>('sync');
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncLabel, setSyncLabel] = useState('Analyse biométrique en cours...');

  // Club Platform Syncing simulation states
  const [syncingClubPlatform, setSyncingClubPlatform] = useState<string | null>(null);
  const [clubSyncProgress, setClubSyncProgress] = useState(0);
  const [clubSyncLogs, setClubSyncLogs] = useState<string[]>([]);
  const [clubUsername, setClubUsername] = useState('');
  const [clubPassword, setClubPassword] = useState('');
  const [clubLicense, setClubLicense] = useState('');
  const [isClubSyncing, setIsClubSyncing] = useState(false);
  const [clubSyncSuccessMsg, setClubSyncSuccessMsg] = useState<string | null>(null);

  // Update state helper
  const updateState = (fields: Partial<typeof state>) => {
    setState(prev => ({ ...prev, ...fields }));
  };

  // Live twin knowledge domain calculations
  const calculateDomains = () => {
    const d = {
      identite: 0,
      football: 0,
      mental: 0,
      physique: 0,
      technique: 0,
      habitudes: 0,
      sommeil: 0,
      nutrition: 0,
      environnement: 0,
      objectifs: 0,
      progression: 0,
      modeDeVie: 0
    };

    // Stage 1
    if (state.firstName) d.identite += 50;
    if (photoUrl) d.identite += 30;
    if (state.size && state.weight) d.identite += 20;

    // Stage 2
    if (state.primaryPos) d.football += 40;
    if (state.club) d.football += 30;
    if (state.jerseyNumber) d.football += 10;
    if (state.pitchType) d.football += 20;
    if (state.connectedClubs && state.connectedClubs.length > 0) {
      d.football = Math.min(100, d.football + 20);
    }

    if (state.practiceYears) d.technique += 50;
    if (state.weakFootLevel) d.technique += 50;

    // Stage 3
    if (state.selectedObjectives.length > 0) d.objectifs += 40;
    if (state.biggestDream) d.objectifs += 30;
    if (state.dreamImportance) d.objectifs += 30;

    if (state.reactionBadPerf) d.mental += 40;
    if (state.selfConfidence) d.mental += 30;
    if (state.disciplineRating) d.mental += 30;

    // Stage 4
    if (state.perceivedExplosiveness) d.physique += 50;
    if (state.mobilityRating) d.physique += 50;

    if (state.sleepDuration) d.sommeil += 55;
    if (state.sleepQuality) d.sommeil += 45;

    if (state.mealsPerDay) d.nutrition += 40;
    if (state.dailyHydration) d.nutrition += 30;
    if (state.dietType) d.nutrition += 30;

    // Stage 5
    if (state.screenTime) d.habitudes += 50;
    if (state.personalOrganization) d.habitudes += 50;

    if (state.terrainAvailable) d.environnement += 40;
    if (state.materialsAvailable.length > 0) d.environnement += 60;

    if (state.connectedDevices.length > 0) d.modeDeVie += 30;
    if (state.connectedClubs && state.connectedClubs.length > 0) {
      d.modeDeVie = Math.min(100, d.modeDeVie + 20 * state.connectedClubs.length);
    }
    if (state.dailyStatus) d.modeDeVie += 50;

    // Progression overall (climb as wizard advances)
    d.progression = Math.round((activeStage / 6) * 100);

    return d;
  };

  const domains = calculateDomains();

  // Generate live AI diagnostic console logs
  const getConsoleLogs = () => {
    const logs: string[] = [];
    if (state.firstName) logs.push(`[SYSTEM] Profil de liaison créé pour : ${state.firstName}.`);
    if (state.size && state.weight) {
      const imc = (state.weight / ((state.size / 100) ** 2)).toFixed(1);
      logs.push(`[PHYSIO] Analyse IMC terminée : ${imc} kg/m². Forme athlétique validée.`);
    }
    if (state.primaryPos) {
      logs.push(`[TACTIQUE] Poste de référence configuré : ${state.primaryPos}. Algorithmes d'entraînement asymétriques recalibrés.`);
    }
    if (state.preferredFoot) {
      logs.push(`[BIOMÉCANIQUE] Pied préférentiel : ${state.preferredFoot}. Niveau de pied faible : ${state.weakFootLevel}/5.`);
    }
    if (state.sleepDuration < 7.5) {
      logs.push(`[RECUP] ALERTE: Sommeil de ${state.sleepDuration}h estimé insuffisant pour la récupération des tissus musculaires.`);
    } else {
      logs.push(`[RECUP] Sommeil de ${state.sleepDuration}h adéquat pour la synthèse des protéines.`);
    }
    if (state.selectedObjectives.length > 0) {
      logs.push(`[OBJECTIFS] Synthèse de ${state.selectedObjectives.length} objectifs. Détection de conflits : Aucune.`);
    }
    if (state.biggestDream) {
      logs.push(`[MENTAL] Rêve de carrière scellé : "${state.biggestDream.substring(0, 30)}...".`);
    }
    if (state.disciplineRating >= 8) {
      logs.push(`[NEURAL] Score de discipline élite détecté (${state.disciplineRating}/10). Potentiel d'assimilation : Maximal.`);
    }
    if (state.materialsAvailable.length > 0) {
      logs.push(`[LOGISTIQUE] ${state.materialsAvailable.length} matériels de terrain enregistrés. Variabilité d'exercices calibrée.`);
    }
    if (state.connectedDevices.length > 0) {
      logs.push(`[IOT] Couplage biométrique de ${state.connectedDevices.length} objets connectés validé.`);
    }
    if (state.connectedClubs && state.connectedClubs.length > 0) {
      logs.push(`[ÉCOSYSTÈME CLUB] ${state.connectedClubs.length} intégrations de clubs actives : ${state.connectedClubs.join(', ')}.`);
      logs.push(`[PLANIFICATION] Récupération auto : Temps de jeu, Convocations, Poste fétiche, Charge d'entraînement.`);
      logs.push(`[INTELLIGENCE] Adaptation de la charge de récupération active pour éviter le surentraînement.`);
    }
    return logs;
  };

  const consoleLogs = getConsoleLogs();

  // Custom AI Coach quotes and reactions per stage
  const getCoachSpeech = () => {
    switch (activeStage) {
      case 0:
        return {
          title: "Initialisation Neuronale",
          quote: "Bienvenue sur Telvox. Je suis ton Coach IA. Rapproche ton index du scanneur biométrique pour initier la création de ton Player Twin personnalisé."
        };
      case 1:
        return {
          title: "Profil Identitaire & Silhouette",
          quote: `Ravi de faire ta connaissance ! Parlons de qui tu es. Donne-moi ton identité, ta taille, ton poids, et n'hésite pas à ajouter une photo. Je vais automatiquement recadrer ton portrait de manière premium.`
        };
      case 2:
        return {
          title: "Génie Tactique & Club",
          quote: "Entrons sur le terrain virtuel. Quel est ton poste exact, ton pied d'appui, l'intensité de tes entraînements ? L'intelligence artificielle a besoin de ces données physiologiques clés pour calibrer tes séances."
        };
      case 3:
        return {
          title: "Facteur Mental & Ambitions",
          quote: "Le football se joue d'abord entre les deux oreilles. Parle-moi de ton grand rêve, de ta réaction face à l'échec ou aux décisions du coach. La résilience est la clé du niveau professionnel."
        };
      case 4:
        return {
          title: "Physiologie, Récupération & Nutrition",
          quote: "Ton corps est ta Formule 1. Évaluons ton niveau de sommeil, ton hydratation, tes éventuelles douleurs musculaires chroniques et tes fragilités articulaires pour éviter tout risque de blessure."
        };
      case 5:
        return {
          title: "Logistique & Écosystème Clubs",
          quote: "Configurons ta logistique et ton écosystème club. Connecte Telvox à tes plateformes de club (SportEasy, TeamPulse, BeSport, FFF Compétitions) pour synchroniser automatiquement tes entraînements, convocations, temps de jeu et tes stats en temps réel sans aucune double saisie !"
        };
      case 6:
        return {
          title: "La Révélation du Player Twin",
          quote: "Analyse terminée ! Voici ta première carte officielle de joueur Telvox. Choisis ton design de carte préféré et commence dès maintenant à accumuler de l'XP !"
        };
      default:
        return { title: '', quote: '' };
    }
  };

  const coachSpeech = getCoachSpeech();

  // Helper for Club Platform Syncing simulation
  const handleClubSyncInitiate = (platform: string) => {
    setIsClubSyncing(true);
    setClubSyncProgress(0);
    setClubSyncSuccessMsg(null);
    
    const logsList = {
      SportEasy: [
        `[OAuth] Connexion initiée vers api.sporteasy.net/v3...`,
        `[SportEasy] Identification réussie du joueur : ${state.firstName || 'Joueur'}. ID de licence trouvé.`,
        `[Calendrier] Récupération de l'agenda d'équipe (4 entraînements, 1 match de championnat).`,
        `[Stats] Temps de jeu moyen importé (80 min). Rôle : Ailier Droit (RW).`,
        `[Coach-Notes] Feedback extrait : "Forte accélération, améliorer la précision pied faible".`,
        `[Sync] Jumeau Numérique enrichi avec SportEasy ! Récupération auto configurée.`
      ],
      TeamPulse: [
        `[Auth] Session ouverte sur teampulseapp.fr/api...`,
        `[TeamPulse] Profil détecté : ${state.firstName || 'Joueur'} ${state.lastName || ''}.`,
        `[Calendrier] Importation de 3 séances hebdomadaires et de la convocation du week-end.`,
        `[Présence] Présence aux entraînements certifiée à 92%. Charge d'entraînement : Équilibrée.`,
        `[Coach-Notes] Dernier commentaire : "Excellente discipline, continue l'effort physique."`,
        `[Sync] Synchronisation avec TeamPulse terminée. Données d'entraînement actives.`
      ],
      BeSport: [
        `[API] Liaison sécurisée avec besport.com/federation...`,
        `[BeSport] Profil d'athlète associé à ${state.firstName || 'Joueur'}.`,
        `[Calendrier] Synchronisation des 5 prochains matchs et tournois de la saison.`,
        `[Stats] Historique de matchs : 4 passes décisives, 2 buts marqués sur les 5 dernières sorties.`,
        `[Tactique] Alignement préférentiel importé : Dispositif 4-3-3, Poste : RW (Ailier).`,
        `[Sync] Couplage BeSport opérationnel. Player Twin mis à jour.`
      ],
      'FFF Compétitions': [
        `[FFF API] Requête sécurisée vers api-competitions.fff.fr...`,
        `[FFF] Numéro de Licence ${clubLicense || '12847104'} validé par la ligue régionale.`,
        `[Calendrier] Calendrier officiel de Ligue / District téléchargé : 18 journées restantes.`,
        `[Compo] Feuille de match officielle scannée. Statut : Titulaire habituel.`,
        `[Stats] Matchs officiels FFF : 12 matchs joués, 3 cartons jaunes, 0 rouge.`,
        `[Sync] Connexion FFF directe scellée ! Données certifiées à 100% par la fédération.`
      ]
    };

    const targetLogs = logsList[platform as keyof typeof logsList] || [
      `[API] Liaison standard vers ${platform}...`,
      `[Sync] Récupération du calendrier sportif en cours...`,
      `[Stats] Données de performance importées...`,
      `[Sync] Intégration de plateforme club réussie.`
    ];

    setClubSyncLogs([]);
    
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < targetLogs.length) {
        setClubSyncLogs(prev => [...prev, targetLogs[currentStep]]);
        setClubSyncProgress(Math.round(((currentStep + 1) / targetLogs.length) * 100));
        currentStep++;
      } else {
        clearInterval(interval);
        setIsClubSyncing(false);
        // Add to connected list if not present
        if (!state.connectedClubs.includes(platform)) {
          updateState({ connectedClubs: [...state.connectedClubs, platform] });
        }
        
        let successPhrase = '';
        if (platform === 'SportEasy') {
          successPhrase = "SportEasy connecté ! 4 séances hebdomadaires, convocations, temps de jeu et poste (RW) importés de manière transparente.";
        } else if (platform === 'TeamPulse') {
          successPhrase = "TeamPulse connecté ! Présence de 92% importée. Calendrier synchronisé en temps réel.";
        } else if (platform === 'BeSport') {
          successPhrase = "BeSport connecté ! 4 décisives et 2 buts officiels de championnat synchronisés.";
        } else if (platform === 'FFF Compétitions') {
          successPhrase = `FFF connectée ! Licence officielle validée. Calendrier de championnat et temps de jeu importés directement de la ligue.`;
        } else {
          successPhrase = `${platform} connecté avec succès ! Plus aucune ressaisie manuelle.`;
        }
        setClubSyncSuccessMsg(successPhrase);
      }
    }, 600);
  };

  // Handle Scan Initiation
  const startAwakening = () => {
    setIsAwakening(true);
    awakeningTimer.current = setInterval(() => {
      setAwakeningProgress(prev => {
        if (prev >= 100) {
          if (awakeningTimer.current) clearInterval(awakeningTimer.current);
          setIsAwakening(false);
          setActiveStage(1);
          return 100;
        }
        return prev + 5;
      });
    }, 50);
  };

  const stopAwakening = () => {
    setIsAwakening(false);
    setAwakeningProgress(0);
    if (awakeningTimer.current) clearInterval(awakeningTimer.current);
  };

  // Simulating high-tech premium photo crop & BG removal
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setIsPhotoScanning(true);
        setPhotoScanProgress(0);
        const interval = setInterval(() => {
          setPhotoScanProgress(prev => {
            if (prev >= 100) {
              clearInterval(interval);
              setPhotoUrl(event.target?.result as string);
              setIsPhotoScanning(false);
              return 100;
            }
            return prev + 10;
          });
        }, 150);
      };
      reader.readAsDataURL(file);
    }
  };

  // Triggering spectacular reveal build
  useEffect(() => {
    if (activeStage === 6 && revealPhase === 'sync') {
      setSyncProgress(0);
      const steps = [
        { label: 'Compilation de 150 métriques neuronales...', time: 600, prog: 30 },
        { label: 'Calcul des notes d\'attributs physiques & mentaux...', time: 1200, prog: 65 },
        { label: 'Création de l\'algorithme de progression dynamique...', time: 1800, prog: 90 },
        { label: 'Forger la Player Card finale...', time: 2400, prog: 100 }
      ];

      steps.forEach((s, idx) => {
        setTimeout(() => {
          setSyncLabel(s.label);
          setSyncProgress(s.prog);
          if (idx === steps.length - 1) {
            setTimeout(() => {
              setRevealPhase('reveal');
            }, 400);
          }
        }, s.time);
      });
    }
  }, [activeStage]);

  // Compute final attribute values for DNA based on all state values
  const getComputedDna = () => {
    const val = 65 + Math.min(10, Math.floor(state.practiceYears * 0.8));
    return {
      creativity: Math.min(99, Math.round(val + (state.primaryPos === 'CAM' || state.primaryPos === 'RW' ? 12 : 3))),
      discipline: Math.min(99, Math.round(val + (state.disciplineRating * 2.5))),
      leadership: Math.min(99, Math.round(val + (state.isCaptain ? 15 : 0) + (state.selfConfidence * 1.2))),
      explosiveness: Math.min(99, Math.round(val + (state.perceivedExplosiveness * 2.2))),
      vision: Math.min(99, Math.round(val + (state.primaryPos === 'CAM' || state.primaryPos === 'CM' ? 10 : 2))),
      calm: Math.min(99, Math.round(val + (state.reactionBigMistake === 'Reste calme' ? 12 : 4))),
      resilience: Math.min(99, Math.round(val + (state.reactionBadPerf === 'Revanchard' ? 10 : 3))),
      technique: Math.min(99, Math.round(val + (state.practiceYears * 1.5) + (state.weakFootLevel * 2)))
    };
  };

  const computedDna = getComputedDna();
  const computedOvr = Math.round(Object.values(computedDna).reduce((a, b) => a + b, 0) / 8);

  // Complete onboarding action
  const handleFinish = () => {
    const finalBio = `${state.firstName || 'Joueur'} ${state.lastName || ''}, ${state.age} ans. Poste de prédilection : ${POSITIONS.find(p => p.code === state.primaryPos)?.name || 'Joueur'}. Joueur évoluant au club de ${state.club || 'Libre'}. Rêve absolu : "${state.biggestDream || 'Devenir professionnel'}". Son jumeau numérique a été configuré avec un indice de résilience de ${computedDna.resilience}/99, une discipline de ${computedDna.discipline}/99 et un sens tactique aiguisé.`;
    
    setPlayer(prev => ({
      ...prev,
      firstName: state.firstName || 'Joueur',
      lastName: state.lastName || '',
      age: state.age,
      club: state.club || 'Libre',
      position: POSITIONS.find(p => p.code === state.primaryPos)?.name || 'Ailier Droit',
      secondaryPosition: POSITIONS.find(p => p.code === state.secondaryPos)?.name || 'Milieu Offensif',
      preferredFoot: state.preferredFoot,
      size: state.size,
      weight: state.weight,
      number: state.jerseyNumber,
      practiceYears: state.practiceYears,
      selectedObjectives: state.selectedObjectives,
      currentGoal: state.selectedObjectives[0] || 'Devenir professionnel',
      level: 1,
      xp: 0,
      xpNextLevel: 1000,
      coins: 0,
      streak: 0,
      progressScore: 0,
      legacyScore: 0,
      country: state.country,
      city: state.city,
      nationality: state.country === 'France' ? 'Français' : state.country,
      photoUrl: photoUrl || undefined,
      connectedClubs: state.connectedClubs,
      biography: finalBio
    }));

    onComplete(computedDna);
  };

  // Card Design styles based on active rarity
  const getCardDesignClasses = (rarity: Rarity) => {
    switch (rarity) {
      case 'Bronze':
        return {
          wrapper: "bg-gradient-to-b from-amber-900 to-yellow-950 border-amber-700/80 shadow-[0_0_20px_rgba(217,119,6,0.15)]",
          badge: "bg-amber-800 text-amber-100",
          accentText: "text-amber-500",
          particleColor: "text-amber-500/20"
        };
      case 'Argent':
        return {
          wrapper: "bg-gradient-to-b from-slate-600 to-slate-900 border-slate-400/80 shadow-[0_0_20px_rgba(203,213,225,0.15)]",
          badge: "bg-slate-700 text-slate-100",
          accentText: "text-cyan-400",
          particleColor: "text-cyan-400/20"
        };
      case 'Or':
        return {
          wrapper: "bg-gradient-to-b from-amber-400 via-amber-500 to-yellow-900 border-yellow-300 shadow-[0_0_25px_rgba(251,191,36,0.3)]",
          badge: "bg-amber-600 text-amber-950 font-black",
          accentText: "text-amber-300",
          particleColor: "text-amber-300/30"
        };
      case 'Elite':
        return {
          wrapper: "bg-gradient-to-b from-red-950 via-slate-950 to-red-950 border-red-500/80 shadow-[0_0_30px_rgba(239,68,68,0.35)]",
          badge: "bg-red-600 text-white font-black animate-pulse",
          accentText: "text-red-400",
          particleColor: "text-red-500/30"
        };
      case 'Wonderkid':
        return {
          wrapper: "bg-gradient-to-br from-violet-950 via-slate-950 to-teal-950 border-teal-400 shadow-[0_0_30px_rgba(45,212,191,0.4)]",
          badge: "bg-teal-400 text-slate-950 font-bold",
          accentText: "text-teal-300",
          particleColor: "text-teal-300/40"
        };
      case 'Future Star':
        return {
          wrapper: "bg-gradient-to-b from-purple-900 via-fuchsia-950 to-slate-950 border-fuchsia-500 shadow-[0_0_30px_rgba(217,70,239,0.4)]",
          badge: "bg-fuchsia-500 text-white font-bold",
          accentText: "text-fuchsia-300",
          particleColor: "text-fuchsia-300/40"
        };
      case 'Legend':
        return {
          wrapper: "bg-gradient-to-b from-emerald-950 via-slate-950 to-yellow-950 border-yellow-400 shadow-[0_0_35px_rgba(234,179,8,0.4)]",
          badge: "bg-yellow-400 text-emerald-950 font-black",
          accentText: "text-yellow-400",
          particleColor: "text-yellow-400/40"
        };
      case 'GOAT':
        return {
          wrapper: "bg-gradient-to-tr from-slate-950 via-black to-slate-900 border-white shadow-[0_0_45px_rgba(255,255,255,0.45)] ring-2 ring-white/10",
          badge: "bg-white text-black font-black animate-bounce",
          accentText: "text-purple-300",
          particleColor: "text-white/40"
        };
    }
  };

  const currentDesign = getCardDesignClasses(activeRarity);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans overflow-x-hidden relative">
      {/* Dynamic Ambient Background Sparkles */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-slate-950 to-slate-950 pointer-events-none z-0" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* HEADER BAR */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-2.5 rounded-xl text-slate-950">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-black font-mono tracking-widest text-white">TELVOX <span className="text-emerald-400">BIOMETRICS</span></h1>
            <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Interface de Couplage v2.4 (Active)</p>
          </div>
        </div>

        {/* Stage Progress Tracker */}
        {activeStage > 0 && activeStage < 6 && (
          <div className="flex items-center space-x-1 sm:space-x-2 text-[10px] font-mono text-slate-500">
            {[1, 2, 3, 4, 5].map((s) => (
              <div 
                key={s} 
                className={`w-5 h-1 rounded-full transition-all ${s <= activeStage ? 'bg-gradient-to-r from-emerald-500 to-cyan-400' : 'bg-slate-900'}`}
              />
            ))}
            <span className="ml-2 font-bold text-slate-300">STAGE {activeStage}/5</span>
          </div>
        )}
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative z-10">
        
        {/* LEFT COLUMN: THE HOLOGRAPHIC PLAYER TWIN (Desktop Only) */}
        {activeStage > 0 && activeStage < 6 && (
          <section className="hidden lg:flex lg:col-span-4 flex-col justify-between bg-slate-950/60 border border-slate-900 rounded-[2rem] p-6 backdrop-blur-xl relative overflow-hidden self-stretch">
            {/* Background cyber grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex items-center space-x-2">
                  <Fingerprint className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-widest">JUMEAU NUMÉRIQUE</span>
                </div>
                <div className="flex items-center space-x-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-mono text-emerald-400 uppercase font-black">Sync active</span>
                </div>
              </div>

              {/* Holographic central image scanner */}
              <div className="relative w-40 h-40 mx-auto rounded-full border-2 border-emerald-500/20 bg-slate-900/50 flex items-center justify-center overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent w-full h-8 animate-pulse translate-y-12" />
                {photoUrl ? (
                  <img src={photoUrl} alt="Twin" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="text-center text-slate-600">
                    <User className="w-16 h-16 mx-auto opacity-30 text-emerald-400" />
                    <span className="text-[9px] font-mono block mt-1 uppercase tracking-widest">SILHOUETTE BRUTE</span>
                  </div>
                )}
                {/* Scanner bar */}
                <div className="absolute inset-x-0 top-0 h-0.5 bg-cyan-400 shadow-[0_0_10px_#06b6d4] animate-bounce" />
              </div>

              {/* 12 Knowledge Domains */}
              <div className="space-y-3 pt-2">
                <h3 className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-widest">MATRICE DES DOMAINES DE CONNAISSANCE</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { key: 'identite', label: '👤 Identité', color: 'from-emerald-500 to-emerald-400' },
                    { key: 'football', label: '⚽ Football', color: 'from-cyan-500 to-cyan-400' },
                    { key: 'mental', label: '🧠 Mental', color: 'from-purple-500 to-purple-400' },
                    { key: 'physique', label: '💪 Physique', color: 'from-red-500 to-red-400' },
                    { key: 'technique', label: '🎯 Technique', color: 'from-yellow-500 to-yellow-400' },
                    { key: 'habitudes', label: '📱 Habitudes', color: 'from-pink-500 to-pink-400' },
                    { key: 'sommeil', label: '😴 Sommeil', color: 'from-indigo-500 to-indigo-400' },
                    { key: 'nutrition', label: '🥗 Nutrition', color: 'from-green-500 to-green-400' },
                    { key: 'environnement', label: '🏋️ Environnement', color: 'from-teal-500 to-teal-400' },
                    { key: 'objectifs', label: '🎯 Objectifs', color: 'from-orange-500 to-orange-400' },
                    { key: 'modeDeVie', label: '❤️ Mode de vie', color: 'from-fuchsia-500 to-fuchsia-400' },
                    { key: 'progression', label: '📈 Alignement', color: 'from-amber-500 to-amber-400 animate-pulse' }
                  ].map((dom) => {
                    const pct = domains[dom.key as keyof typeof domains] || 0;
                    return (
                      <div key={dom.key} className="bg-slate-900/60 border border-slate-900/80 rounded-xl p-2 flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-slate-300 font-sans tracking-wide block truncate">{dom.label}</span>
                        <div className="flex items-center justify-between mt-1.5 space-x-2">
                          <div className="flex-1 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                            <div 
                              className={`bg-gradient-to-r ${dom.color} h-full rounded-full transition-all duration-700`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-mono font-black text-slate-400 shrink-0">{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* AI Console Diagnosis feed */}
            <div className="border-t border-slate-900 pt-4 mt-4">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-2">TELVOX BIO-DATA SYNC FEED</span>
              <div className="bg-slate-950 rounded-xl p-3 h-28 overflow-y-auto border border-slate-900 font-mono text-[9px] text-emerald-400 space-y-1.5 select-none scrollbar-thin">
                {consoleLogs.map((log, idx) => (
                  <div key={idx} className="leading-normal flex items-start space-x-1">
                    <span className="text-slate-600">❯</span>
                    <p className="flex-1 text-slate-300">{log}</p>
                  </div>
                ))}
                <div className="animate-pulse text-emerald-500">❯ Établissement du flux sensoriel continu...</div>
              </div>
            </div>
          </section>
        )}

        {/* RIGHT/CENTER COLUMN: THE CONVERSATIONAL BLOCK */}
        <section className={`col-span-1 lg:col-span-${activeStage === 0 || activeStage === 6 ? '12' : '8'} flex flex-col justify-between bg-slate-950/40 border border-slate-900 rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-md relative overflow-hidden self-stretch min-h-[600px]`}>
          
          <AnimatePresence mode="wait">
            
            {/* STAGE 0: AWAKENING (Scanner) */}
            {activeStage === 0 && (
              <motion.div 
                key="awakening"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 flex flex-col items-center justify-center text-center space-y-8 py-10 max-w-xl mx-auto"
              >
                <div className="space-y-3">
                  <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-emerald-400 text-xs font-mono uppercase tracking-widest animate-pulse">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Liaison Neuronale Requise</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-sans font-black tracking-tight text-white uppercase">
                    RÉVEILLE TON <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">PLAYER TWIN</span>
                  </h2>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                    Afin d'individualiser tes séances à 100%, l'IA Telvox doit analyser ton profil biologique, psychologique et tactique. Initialise la connexion.
                  </p>
                </div>

                {/* GIANT SCRANNER INTERFACE */}
                <div className="relative">
                  {/* Glowing circles */}
                  <div className="absolute -inset-4 bg-emerald-500/10 rounded-full filter blur-xl animate-pulse" />
                  <button
                    onMouseDown={startAwakening}
                    onMouseUp={stopAwakening}
                    onMouseLeave={stopAwakening}
                    onTouchStart={startAwakening}
                    onTouchEnd={stopAwakening}
                    className="relative w-36 h-36 bg-slate-950 hover:bg-slate-900 border-4 border-slate-800 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95 group focus:outline-none"
                  >
                    <AnimatePresence>
                      {isAwakening ? (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin"
                        />
                      ) : (
                        <div className="absolute inset-0 rounded-full border-2 border-slate-800 border-dashed animate-pulse" />
                      )}
                    </AnimatePresence>

                    <Fingerprint className={`w-14 h-14 transition-colors ${isAwakening ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-400'}`} />
                    <span className="text-[10px] font-mono text-slate-500 mt-2 uppercase tracking-widest font-black">
                      {isAwakening ? `${awakeningProgress}%` : 'Maintiens appuyé'}
                    </span>
                  </button>
                </div>

                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest max-w-xs leading-relaxed">
                  Pose ton doigt pour lancer la lecture d'analyse biométrique.
                </div>
              </motion.div>
            )}

            {/* QUESTIONS STAGES (1 to 5) */}
            {activeStage > 0 && activeStage < 6 && (
              <motion.div 
                key={`stage-${activeStage}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col justify-between space-y-6"
              >
                {/* COACH CHAT SPEECH AT TOP */}
                <div className="flex items-start space-x-4 bg-slate-900/40 border border-slate-850 p-4 sm:p-5 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-black font-mono shrink-0 relative">
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-ping" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full" />
                    <span>IA</span>
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-black tracking-widest">COACH IA • {coachSpeech.title}</span>
                    <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed">"{coachSpeech.quote}"</p>
                  </div>
                </div>

                {/* STAGE 1 CONTENT: Identité, Sexe, Photo */}
                {activeStage === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-2">
                    {/* Identity Inputs */}
                    <div className="md:col-span-8 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 uppercase font-black mb-1.5">Prénom *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Ex: Eliott"
                            value={state.firstName}
                            onChange={e => updateState({ firstName: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white font-sans focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 uppercase font-black mb-1.5">Nom (Optionnel)</label>
                          <input 
                            type="text" 
                            placeholder="Ex: Moreau"
                            value={state.lastName}
                            onChange={e => updateState({ lastName: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white font-sans focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 uppercase font-black mb-1.5">Date de naissance</label>
                          <input 
                            type="date" 
                            value={state.birthDate}
                            onChange={e => {
                              const ageComputed = new Date().getFullYear() - new Date(e.target.value).getFullYear();
                              updateState({ birthDate: e.target.value, age: ageComputed });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white font-sans focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 uppercase font-black mb-1.5">Sexe</label>
                          <select 
                            value={state.sexe}
                            onChange={e => updateState({ sexe: e.target.value as any })}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white font-sans focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          >
                            <option value="Masculin">Masculin</option>
                            <option value="Féminin">Féminin</option>
                            <option value="Autre">Autre</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 uppercase font-black mb-1.5">Langue</label>
                          <input 
                            type="text" 
                            value={state.language}
                            onChange={e => updateState({ language: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white font-sans focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 uppercase font-black mb-1.5">Taille (cm)</label>
                          <input 
                            type="number" 
                            value={state.size}
                            onChange={e => updateState({ size: Number(e.target.value) })}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white font-sans focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 uppercase font-black mb-1.5">Poids (kg)</label>
                          <input 
                            type="number" 
                            value={state.weight}
                            onChange={e => updateState({ weight: Number(e.target.value) })}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white font-sans focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 uppercase font-black mb-1.5">Pays</label>
                          <input 
                            type="text" 
                            value={state.country}
                            onChange={e => updateState({ country: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white font-sans focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 uppercase font-black mb-1.5">Ville (Optionnel)</label>
                          <input 
                            type="text" 
                            placeholder="Ex: Paris"
                            value={state.city}
                            onChange={e => updateState({ city: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white font-sans focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Photo Upload area */}
                    <div className="md:col-span-4 flex flex-col items-center justify-center bg-slate-900/30 border border-slate-900 rounded-2xl p-6 relative">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-black mb-3">Portrait Player Twin</span>
                      
                      <div className="relative w-28 h-28 rounded-full border border-slate-800 bg-slate-950 flex items-center justify-center overflow-hidden mb-4 group">
                        {isPhotoScanning ? (
                          <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center z-10 p-2 text-center">
                            <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin mb-1" />
                            <span className="text-[8px] font-mono text-emerald-400 uppercase">Ajustement IA : {photoScanProgress}%</span>
                          </div>
                        ) : photoUrl ? (
                          <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-slate-600 group-hover:text-slate-400 transition-colors">
                            <Camera className="w-8 h-8" />
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse" />
                      </div>

                      <label className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-mono text-xs rounded-xl cursor-pointer transition-all flex items-center space-x-1.5 uppercase">
                        <Upload className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Téléverser</span>
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      </label>
                      <p className="text-[9px] font-mono text-slate-500 text-center uppercase tracking-widest mt-2 leading-relaxed">
                        Notre IA supprime l'arrière-plan de ta photo pour l'intégrer proprement sur ta carte.
                      </p>
                    </div>
                  </div>
                )}

                {/* STAGE 2 CONTENT: Football info */}
                {activeStage === 2 && (
                  <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 uppercase font-black mb-1.5">Poste Principal *</label>
                        <select 
                          value={state.primaryPos}
                          onChange={e => updateState({ primaryPos: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="">-- Sélectionner --</option>
                          {POSITIONS.map(p => <option key={p.code} value={p.code}>{p.name} ({p.code})</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 uppercase font-black mb-1.5">Poste Secondaire *</label>
                        <select 
                          value={state.secondaryPos}
                          onChange={e => updateState({ secondaryPos: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="">-- Sélectionner --</option>
                          {POSITIONS.map(p => <option key={p.code} value={p.code}>{p.name} ({p.code})</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 uppercase font-black mb-1.5">Niveau Actuel *</label>
                        <select 
                          value={state.currentLevel}
                          onChange={e => updateState({ currentLevel: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="">-- Sélectionner --</option>
                          <option value="Départemental">Départemental</option>
                          <option value="Régional">Régional</option>
                          <option value="National">National</option>
                          <option value="Académie Pro">Académie Pro</option>
                          <option value="Professionnel">Professionnel</option>
                          <option value="Amateur / Loisir">Amateur / Loisir</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 uppercase font-black mb-1.5">Club Actuel *</label>
                        <input 
                          type="text" 
                          placeholder="Ex: Montpellier HSC"
                          value={state.club}
                          onChange={e => updateState({ club: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 uppercase font-black mb-1.5">Ancien Club</label>
                        <input 
                          type="text" 
                          placeholder="Ex: Nîmes Olympique"
                          value={state.formerClub}
                          onChange={e => updateState({ formerClub: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 uppercase font-black mb-1.5">Années de pratique *</label>
                        <input 
                          type="number" 
                          placeholder="Ex: 5"
                          value={state.practiceYears || ''}
                          onChange={e => updateState({ practiceYears: e.target.value === '' ? '' : Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 uppercase font-black mb-1.5">Numéro Préféré *</label>
                        <input 
                          type="number" 
                          placeholder="Ex: 10"
                          value={state.jerseyNumber || ''}
                          onChange={e => updateState({ jerseyNumber: e.target.value === '' ? '' : Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Foot and weak foot selection */}
                      <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl space-y-2">
                        <span className="block text-[11px] font-mono text-slate-400 uppercase font-black">Pied Fort</span>
                        <div className="grid grid-cols-3 gap-2">
                          {['Gauche', 'Droit', 'Ambidextre'].map((foot) => (
                            <button
                              key={foot}
                              type="button"
                              onClick={() => updateState({ preferredFoot: foot as any })}
                              className={`py-2 text-xs font-mono rounded-xl border transition-all ${state.preferredFoot === foot ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
                            >
                              {foot}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Weak foot rating */}
                      <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl space-y-2">
                        <span className="block text-[11px] font-mono text-slate-400 uppercase font-black">Niveau Pied Faible</span>
                        <div className="flex items-center space-x-2 justify-center py-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => updateState({ weakFootLevel: star })}
                              className="focus:outline-none"
                            >
                              <Star className={`w-6 h-6 transition-colors ${star <= state.weakFootLevel ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Captain badge toggler */}
                      <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="block text-[11px] font-mono text-slate-400 uppercase font-black">Es-tu Capitaine ?</span>
                          <span className="text-[10px] text-slate-500 font-mono">Associe des bonus de Leadership</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateState({ isCaptain: !state.isCaptain })}
                          className={`w-14 h-8 rounded-full transition-colors relative p-1 cursor-pointer ${state.isCaptain ? 'bg-emerald-500' : 'bg-slate-900 border border-slate-800'}`}
                        >
                          <div className={`w-6 h-6 rounded-full bg-white transition-all shadow-md ${state.isCaptain ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 uppercase font-black mb-1.5">Entraînements / Semaine</label>
                        <input 
                          type="number" 
                          value={state.trainingsPerWeek}
                          onChange={e => updateState({ trainingsPerWeek: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 uppercase font-black mb-1.5">Matchs / Semaine</label>
                        <input 
                          type="number" 
                          value={state.matchesPerWeek}
                          onChange={e => updateState({ matchesPerWeek: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 uppercase font-black mb-1.5">Minutes / Match</label>
                        <input 
                          type="number" 
                          value={state.minutesPlayedPerMatch}
                          onChange={e => updateState({ minutesPlayedPerMatch: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 uppercase font-black mb-1.5">Type de Terrain habituel</label>
                        <select 
                          value={state.pitchType}
                          onChange={e => updateState({ pitchType: e.target.value as any })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                        >
                          <option value="Herbe naturelle">Herbe naturelle</option>
                          <option value="Synthétique">Synthétique</option>
                          <option value="Terre">Terre</option>
                          <option value="Parquet / Futsal">Parquet / Futsal</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* STAGE 3 CONTENT: Objectifs & Mental Lab */}
                {activeStage === 3 && (
                  <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Selected Objectives multi-selector */}
                      <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl">
                        <span className="block text-[11px] font-mono text-slate-400 uppercase font-black mb-2">Sélectionne tes Objectifs (Illimités)</span>
                        <div className="grid grid-cols-1 gap-1.5 h-44 overflow-y-auto pr-1 scrollbar-thin">
                          {OBJECTIVES_LIST.map((obj) => {
                            const isSel = state.selectedObjectives.includes(obj);
                            return (
                              <button
                                key={obj}
                                type="button"
                                onClick={() => {
                                  if (isSel) {
                                    updateState({ selectedObjectives: state.selectedObjectives.filter(o => o !== obj) });
                                  } else {
                                    updateState({ selectedObjectives: [...state.selectedObjectives, obj] });
                                  }
                                }}
                                className={`flex items-center space-x-2.5 px-3 py-2 text-left rounded-lg text-xs font-sans transition-all border ${isSel ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-white'}`}
                              >
                                <div className={`w-4 h-4 rounded flex items-center justify-center border ${isSel ? 'border-emerald-400 bg-emerald-500 text-slate-950' : 'border-slate-700 bg-slate-950'}`}>
                                  {isSel && <Check className="w-3 h-3" />}
                                </div>
                                <span className="flex-1 truncate">{obj}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Open questions (Rêve de gosse) */}
                      <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3">
                        <span className="block text-[11px] font-mono text-slate-400 uppercase font-black border-b border-slate-900 pb-1.5">Les Racines de ton Rêve</span>
                        <div>
                          <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Quel est ton plus grand rêve dans le football ?</label>
                          <input 
                            type="text"
                            placeholder="Ex: Jouer la Ligue des Champions avec le club de mon enfance"
                            value={state.biggestDream}
                            onChange={e => updateState({ biggestDream: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-lg text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Pourquoi ce rêve est-il si important ?</label>
                          <input 
                            type="text"
                            placeholder="Ex: Rendre fiers mes parents et prouver ma valeur"
                            value={state.dreamImportance}
                            onChange={e => updateState({ dreamImportance: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-lg text-white focus:outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Âge Cible</label>
                            <input 
                              type="number"
                              value={state.targetAge}
                              onChange={e => updateState({ targetAge: Number(e.target.value) })}
                              className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-lg text-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Si tu réussis, ça change quoi ?</label>
                            <input 
                              type="text"
                              placeholder="Ex: Ma vie entière"
                              value={state.dreamSuccessImpact}
                              onChange={e => updateState({ dreamSuccessImpact: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-lg text-white focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mental Situational Scenarios */}
                    <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-4">
                      <span className="block text-[11px] font-mono text-slate-400 uppercase font-black border-b border-slate-900 pb-1.5">Mises en Situation & Psychologie</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold mb-1.5">Réaction après mauvaise performance :</label>
                          <select 
                            value={state.reactionBadPerf} 
                            onChange={e => updateState({ reactionBadPerf: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-lg text-white focus:outline-none"
                          >
                            <option value="Revanchard">Revanchard : Je redouble d'efforts à la séance d'après</option>
                            <option value="Analyse froide">Analyse froide : Je regarde la vidéo de mon match</option>
                            <option value="Démoralisé">Démoralisé : Je doute de mes capacités pendant 2 jours</option>
                            <option value="Rejet de faute">Rejet de faute : Le coach ou mes coéquipiers n'étaient pas au niveau</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold mb-1.5">Réaction après grosse erreur individuelle :</label>
                          <select 
                            value={state.reactionBigMistake} 
                            onChange={e => updateState({ reactionBigMistake: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-lg text-white focus:outline-none"
                          >
                            <option value="Reste calme">Je reste calme et me concentre sur la prochaine action</option>
                            <option value="Redouble d'effort">Je redouble d'efforts physiques pour corriger le tir</option>
                            <option value="Se cache">Je commence à me cacher et demande moins le ballon</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold mb-1">Discipline (1-10)</label>
                          <input 
                            type="range" min="1" max="10" 
                            value={state.disciplineRating} 
                            onChange={e => updateState({ disciplineRating: Number(e.target.value) })}
                            className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                          />
                          <span className="text-[10px] text-emerald-400 font-mono block text-right font-black mt-0.5">{state.disciplineRating}/10</span>
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold mb-1">Confiance en Soi (1-10)</label>
                          <input 
                            type="range" min="1" max="10" 
                            value={state.selfConfidence} 
                            onChange={e => updateState({ selfConfidence: Number(e.target.value) })}
                            className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                          />
                          <span className="text-[10px] text-cyan-400 font-mono block text-right font-black mt-0.5">{state.selfConfidence}/10</span>
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold mb-1">Tendance à abandonner (1-10)</label>
                          <input 
                            type="range" min="1" max="10" 
                            value={state.giveUpRating} 
                            onChange={e => updateState({ giveUpRating: Number(e.target.value) })}
                            className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-red-400"
                          />
                          <span className="text-[10px] text-red-400 font-mono block text-right font-black mt-0.5">{state.giveUpRating}/10</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STAGE 4 CONTENT: Physique, Sommeil, Nutrition */}
                {activeStage === 4 && (
                  <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Health profile & injuries */}
                      <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3">
                        <span className="block text-[11px] font-mono text-slate-400 uppercase font-black border-b border-slate-900 pb-1.5">Intégrité Physique & Blessures</span>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Blessure actuelle ?</label>
                            <input 
                              type="text" placeholder="Ex: Aucune, pubalgie, etc."
                              value={state.currentInjuries} onChange={e => updateState({ currentInjuries: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-lg text-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Douleurs chroniques ?</label>
                            <input 
                              type="text" placeholder="Ex: Genou droit, tendon d'Achille"
                              value={state.pastInjuries} onChange={e => updateState({ pastInjuries: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-lg text-white focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Souplesse (1-10)</label>
                            <input 
                              type="number" min="1" max="10" value={state.flexibilityRating} onChange={e => updateState({ flexibilityRating: Number(e.target.value) })}
                              className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-lg text-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Vitesse ressentie (1-10)</label>
                            <input 
                              type="number" min="1" max="10" value={state.perceivedSpeed} onChange={e => updateState({ perceivedSpeed: Number(e.target.value) })}
                              className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-lg text-white focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Sleep Profile */}
                      <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3">
                        <span className="block text-[11px] font-mono text-slate-400 uppercase font-black border-b border-slate-900 pb-1.5">Sommeil & Récupération</span>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Heure de coucher</label>
                            <input 
                              type="text" placeholder="22:30"
                              value={state.bedTime} onChange={e => updateState({ bedTime: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-lg text-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Heure de réveil</label>
                            <input 
                              type="text" placeholder="07:00"
                              value={state.wakeTime} onChange={e => updateState({ wakeTime: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-lg text-white focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Qualité Sommeil (1-5)</label>
                            <input 
                              type="number" min="1" max="5" value={state.sleepQuality} onChange={e => updateState({ sleepQuality: Number(e.target.value) })}
                              className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-lg text-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Durée sommeil (heures)</label>
                            <input 
                              type="number" step="0.5" value={state.sleepDuration} onChange={e => updateState({ sleepDuration: Number(e.target.value) })}
                              className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-lg text-white focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Nutrition & Digital habits */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Nutrition */}
                      <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3">
                        <span className="block text-[11px] font-mono text-slate-400 uppercase font-black border-b border-slate-900 pb-1.5">Nutrition & Énergie</span>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Repas par jour</label>
                            <input 
                              type="number" value={state.mealsPerDay} onChange={e => updateState({ mealsPerDay: Number(e.target.value) })}
                              className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-lg text-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Hydratation (L/jour)</label>
                            <input 
                              type="number" step="0.5" value={state.dailyHydration} onChange={e => updateState({ dailyHydration: Number(e.target.value) })}
                              className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-lg text-white focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Fast-Food Fréquence</label>
                            <select 
                              value={state.fastFoodFrequency} onChange={e => updateState({ fastFoodFrequency: e.target.value as any })}
                              className="w-full bg-slate-900 border border-slate-800 text-xs px-2.5 py-2 rounded-lg text-white focus:outline-none"
                            >
                              <option value="Jamais">Jamais</option>
                              <option value="Occasionnel">Occasionnel</option>
                              <option value="1-2 fois par semaine">1-2 fois / semaine</option>
                              <option value="3 fois ou plus">3 fois ou plus / sem</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Régime Alimentaire</label>
                            <select 
                              value={state.dietType} onChange={e => updateState({ dietType: e.target.value as any })}
                              className="w-full bg-slate-900 border border-slate-800 text-xs px-2.5 py-2 rounded-lg text-white focus:outline-none"
                            >
                              <option value="Sans restriction">Sans restriction</option>
                              <option value="Végétarien">Végétarien</option>
                              <option value="Végan">Végan</option>
                              <option value="Halal">Halal</option>
                              <option value="Casher">Casher</option>
                              <option value="Sans gluten">Sans gluten</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Digital habits */}
                      <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3">
                        <span className="block text-[11px] font-mono text-slate-400 uppercase font-black border-b border-slate-900 pb-1.5">Hygiène Digitale & Écrans</span>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Temps d'écran (h)</label>
                            <input 
                              type="number" step="0.5" value={state.screenTime} onChange={e => updateState({ screenTime: Number(e.target.value) })}
                              className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-lg text-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Téléphone au lit ?</label>
                            <select 
                              value={state.phoneBeforeSleep ? 'Oui' : 'Non'} onChange={e => updateState({ phoneBeforeSleep: e.target.value === 'Oui' })}
                              className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-lg text-white focus:outline-none"
                            >
                              <option value="Oui">Oui, avant dodo</option>
                              <option value="Non">Non, déconnecté</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Procrastination (1-10)</label>
                            <input 
                              type="number" min="1" max="10" value={state.procrastinationLevel} onChange={e => updateState({ procrastinationLevel: Number(e.target.value) })}
                              className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-lg text-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Concentration (1-10)</label>
                            <input 
                              type="number" min="1" max="10" value={state.concentrationLevel} onChange={e => updateState({ concentrationLevel: Number(e.target.value) })}
                              className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-lg text-white focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STAGE 5 CONTENT: Environnement, Connectique, Coach */}
                {activeStage === 5 && (
                  <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Equipment List */}
                      <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl">
                        <span className="block text-[11px] font-mono text-slate-400 uppercase font-black mb-2.5">Matériel Disponible</span>
                        <div className="space-y-1.5 h-40 overflow-y-auto pr-1 scrollbar-thin">
                          {EQUIPMENTS_LIST.map((eq) => {
                            const isEq = state.materialsAvailable.includes(eq);
                            return (
                              <button
                                key={eq}
                                type="button"
                                onClick={() => {
                                  if (isEq) {
                                    updateState({ materialsAvailable: state.materialsAvailable.filter(m => m !== eq) });
                                  } else {
                                    updateState({ materialsAvailable: [...state.materialsAvailable, eq] });
                                  }
                                }}
                                className={`w-full flex items-center space-x-2 px-2.5 py-1.5 text-left rounded-lg text-[11px] font-mono transition-all border ${isEq ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-300' : 'bg-slate-900 border-slate-850 text-slate-500 hover:text-white'}`}
                              >
                                <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${isEq ? 'border-emerald-400 bg-emerald-500 text-slate-950' : 'border-slate-700 bg-slate-950'}`}>
                                  {isEq && <Check className="w-2.5 h-2.5" />}
                                </div>
                                <span className="truncate">{eq}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Connected Devices */}
                      <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl">
                        <span className="block text-[11px] font-mono text-slate-400 uppercase font-black mb-2.5">Objets Connectés</span>
                        <div className="space-y-1.5 h-40 overflow-y-auto pr-1 scrollbar-thin">
                          {DEVICES_LIST.map((dev) => {
                            const isDev = state.connectedDevices.includes(dev);
                            return (
                              <button
                                key={dev}
                                type="button"
                                onClick={() => {
                                  if (isDev) {
                                    updateState({ connectedDevices: state.connectedDevices.filter(d => d !== dev) });
                                  } else {
                                    updateState({ connectedDevices: [...state.connectedDevices, dev] });
                                  }
                                }}
                                className={`w-full flex items-center space-x-2 px-2.5 py-1.5 text-left rounded-lg text-[11px] font-mono transition-all border ${isDev ? 'bg-cyan-500/10 border-cyan-500/35 text-cyan-300' : 'bg-slate-900 border-slate-850 text-slate-500 hover:text-white'}`}
                              >
                                <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${isDev ? 'border-cyan-400 bg-cyan-500 text-slate-950' : 'border-slate-700 bg-slate-950'}`}>
                                  {isDev && <Check className="w-2.5 h-2.5" />}
                                </div>
                                <span className="truncate">{dev}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Coach Customization */}
                      <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3">
                        <span className="block text-[11px] font-mono text-slate-400 uppercase font-black border-b border-slate-900 pb-1.5">Personnalise ton Coach</span>
                        <div>
                          <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold mb-1">Tempérament</label>
                          <select 
                            value={state.coachTone} onChange={e => updateState({ coachTone: e.target.value as any })}
                            className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-lg text-white focus:outline-none"
                          >
                            <option value="Direct & Exigeant">Direct & Exigeant (Gagne de l'XP plus vite)</option>
                            <option value="Pédagogue & Patient">Pédagogue & Patient (Explications complètes)</option>
                            <option value="Énergique & Motivateur">Énergique & Motivateur (Discussions de vestiaires)</option>
                            <option value="Analytique & Scientifique">Analytique & Scientifique (Graphiques & physiologie)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold mb-1">Rappels de Séance</label>
                          <select 
                            value={state.remindersFrequency} onChange={e => updateState({ remindersFrequency: e.target.value as any })}
                            className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-lg text-white focus:outline-none"
                          >
                            <option value="Quotidien">Quotidien</option>
                            <option value="Jours de séances">Jours de séances</option>
                            <option value="Hebdomadaire">Hebdomadaire</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <div>
                            <span className="block text-[10px] font-mono text-slate-400 uppercase font-bold">Tutoiement</span>
                            <span className="text-[8px] font-mono text-slate-500">Le coach te tutoie</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => updateState({ tutoiement: !state.tutoiement })}
                            className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${state.tutoiement ? 'bg-emerald-500' : 'bg-slate-900 border border-slate-800'}`}
                          >
                            <div className={`w-4 h-4 rounded-full bg-white transition-all ${state.tutoiement ? 'translate-x-6' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ÉCOSYSTÈME CLUB & INTÉGRATIONS AUTOMATIQUES */}
                    <div className="bg-slate-950 border border-slate-850 p-4 sm:p-5 rounded-xl space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-900 pb-3">
                        <div>
                          <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-black flex items-center space-x-1.5">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse inline-block" />
                            <span>🏟️ Écosystème Club & Synchronisation</span>
                          </h4>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                            Évite la double saisie : importe tes entraînements, convocations et statistiques réels.
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase">Multi-source active</span>
                        </div>
                      </div>

                      {/* Platforms Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          {
                            name: 'SportEasy',
                            tag: 'Le plus populaire',
                            desc: 'Calendrier, convocations & temps de jeu',
                            color: 'from-blue-600/10 to-indigo-600/5 hover:border-blue-500/40 border-slate-850',
                            textColor: 'text-blue-400',
                            badgeColor: 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                          },
                          {
                            name: 'TeamPulse',
                            tag: 'Intuitif & Simple',
                            desc: 'Séances, présence & notes du coach',
                            color: 'from-emerald-600/10 to-teal-600/5 hover:border-emerald-500/40 border-slate-850',
                            textColor: 'text-emerald-400',
                            badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                          },
                          {
                            name: 'BeSport',
                            tag: 'Stats & Compo',
                            desc: 'Stats de match, buts, passes & tactique',
                            color: 'from-orange-600/10 to-red-600/5 hover:border-orange-500/40 border-slate-850',
                            textColor: 'text-orange-400',
                            badgeColor: 'bg-orange-500/10 text-orange-300 border-orange-500/20'
                          },
                          {
                            name: 'FFF Compétitions',
                            tag: 'Officiel & Certifié',
                            desc: 'Calendrier Ligue, licences & feuilles de match',
                            color: 'from-cyan-600/10 to-blue-600/5 hover:border-cyan-500/40 border-slate-850',
                            textColor: 'text-cyan-400',
                            badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                          }
                        ].map((plat) => {
                          const isConnected = state.connectedClubs.includes(plat.name);
                          return (
                            <div
                              key={plat.name}
                              className={`bg-gradient-to-br ${plat.color} border p-3 rounded-lg relative overflow-hidden transition-all flex flex-col justify-between h-36 ${isConnected ? 'ring-1 ring-emerald-500/30 border-emerald-500/50 bg-emerald-950/10' : ''}`}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className={`text-[12px] font-black uppercase font-sans tracking-wide ${plat.textColor}`}>
                                    {plat.name}
                                  </span>
                                  {isConnected ? (
                                    <span className="flex items-center space-x-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[8px] px-1.5 py-0.5 rounded-full font-mono uppercase font-bold">
                                      ✓ Connecté
                                    </span>
                                  ) : (
                                    <span className={`text-[8px] px-1.5 py-0.5 border rounded-full font-mono font-bold uppercase ${plat.badgeColor}`}>
                                      {plat.tag}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[9px] text-slate-400 font-sans leading-relaxed">
                                  {plat.desc}
                                </p>
                              </div>

                              <div className="pt-2">
                                {isConnected ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateState({ connectedClubs: state.connectedClubs.filter(c => c !== plat.name) });
                                      if (syncingClubPlatform === plat.name) {
                                        setSyncingClubPlatform(null);
                                        setClubSyncSuccessMsg(null);
                                      }
                                    }}
                                    className="w-full bg-slate-900 hover:bg-red-500/10 hover:text-red-400 border border-slate-800 text-[9px] font-mono py-1 rounded uppercase tracking-wider text-slate-400 hover:border-red-500/20 transition-all cursor-pointer"
                                  >
                                    Déconnecter
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={isClubSyncing}
                                    onClick={() => {
                                      setSyncingClubPlatform(plat.name);
                                      setClubSyncSuccessMsg(null);
                                      setClubSyncProgress(0);
                                      setClubSyncLogs([]);
                                      setClubUsername('');
                                      setClubPassword('');
                                      setClubLicense('');
                                    }}
                                    className={`w-full py-1 rounded text-[9px] font-mono uppercase tracking-widest font-bold transition-all cursor-pointer ${syncingClubPlatform === plat.name ? 'bg-cyan-500 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.4)]' : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300'}`}
                                  >
                                    {syncingClubPlatform === plat.name ? 'Sélectionné' : 'Se connecter'}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Connection Wizard Box (inline) */}
                      {syncingClubPlatform && !state.connectedClubs.includes(syncingClubPlatform) && (
                        <div className="bg-slate-900 border border-slate-850 rounded-lg p-3.5 space-y-3 relative overflow-hidden">
                          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                            <span className="text-[10px] font-mono text-cyan-400 uppercase font-black tracking-widest flex items-center space-x-1.5">
                              <Cpu className="w-3.5 h-3.5 animate-pulse" />
                              <span>Liaison sécurisée avec {syncingClubPlatform}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setSyncingClubPlatform(null)}
                              className="text-[9px] font-mono text-slate-500 hover:text-white uppercase font-bold"
                            >
                              Fermer ×
                            </button>
                          </div>

                          {!isClubSyncing ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                              {syncingClubPlatform === 'FFF Compétitions' ? (
                                <div className="sm:col-span-2">
                                  <label className="block text-[8px] font-mono text-slate-400 uppercase font-bold mb-1">Numéro de Licence Joueur FFF (ex: 12847104)</label>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      placeholder="Numéro de licence à 8 chiffres..."
                                      value={clubLicense}
                                      onChange={e => setClubLicense(e.target.value)}
                                      className="flex-1 bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded text-white font-mono focus:outline-none focus:border-cyan-500"
                                    />
                                    <div className="text-[9px] font-mono text-slate-500 bg-slate-950 border border-slate-850 rounded px-2.5 flex items-center">
                                      LIGUE / DISTRICT
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div>
                                    <label className="block text-[8px] font-mono text-slate-400 uppercase font-bold mb-1">Identifiant / Email {syncingClubPlatform}</label>
                                    <input
                                      type="email"
                                      placeholder="nom@exemple.com"
                                      value={clubUsername}
                                      onChange={e => setClubUsername(e.target.value)}
                                      className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-1.5 rounded text-white focus:outline-none focus:border-cyan-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[8px] font-mono text-slate-400 uppercase font-bold mb-1">Mot de passe</label>
                                    <input
                                      type="password"
                                      placeholder="••••••••"
                                      value={clubPassword}
                                      onChange={e => setClubPassword(e.target.value)}
                                      className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-1.5 rounded text-white focus:outline-none focus:border-cyan-500"
                                    />
                                  </div>
                                </>
                              )}

                              <div>
                                <button
                                  type="button"
                                  onClick={() => handleClubSyncInitiate(syncingClubPlatform)}
                                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-sans font-black text-xs uppercase py-2 rounded shadow-lg hover:scale-101 active:scale-99 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                                >
                                  <Zap className="w-3.5 h-3.5 text-slate-950 font-black" />
                                  <span>Lancer la liaison ⚡</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            // Syncloader logs terminal
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between text-[9px] font-mono">
                                <span className="text-cyan-400 font-bold uppercase animate-pulse">Synchronisation bidirectionnelle active...</span>
                                <span className="text-slate-400 font-bold">{clubSyncProgress}%</span>
                              </div>
                              <div className="w-full bg-slate-950 border border-slate-800 rounded h-1.5 overflow-hidden p-0.5">
                                <div
                                  className="bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 h-0.5 rounded-full transition-all duration-300"
                                  style={{ width: `${clubSyncProgress}%` }}
                                />
                              </div>
                              <div className="bg-slate-950 border border-slate-850 p-2.5 rounded font-mono text-[9px] text-slate-400 space-y-1 h-24 overflow-y-auto scrollbar-none">
                                {clubSyncLogs.map((log, index) => (
                                  <div key={index} className="flex items-start space-x-1.5">
                                    <span className="text-emerald-500 font-black">❯</span>
                                    <span className={index === clubSyncLogs.length - 1 ? "text-cyan-300 animate-pulse font-bold" : ""}>
                                      {log}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Success Dashboard Preview inside Card */}
                      {clubSyncSuccessMsg && (
                        <div className="bg-emerald-500/5 border border-emerald-500/25 rounded-lg p-3.5 space-y-3 relative overflow-hidden">
                          <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                            <span className="text-[10px] font-mono text-emerald-400 uppercase font-black tracking-widest">
                              {clubSyncSuccessMsg}
                            </span>
                          </div>

                          {/* Data points visual block */}
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                            {[
                              { label: 'Calendriers', value: 'Auto-sync', desc: 'Entraînements & Matchs' },
                              { label: 'Convocations', value: 'Actif', desc: 'Alertes directes push' },
                              { label: 'Temps de jeu', value: '80 min / match', desc: 'Historique des minutes' },
                              { label: 'Poste Occupé', value: 'RW (Ailier Droit)', desc: 'Vitesse explosive ciblée' },
                              { label: 'Commentaires Coach', value: 'IA Interprétée', desc: 'Adaptation de charge' }
                            ].map((dp, i) => (
                              <div key={i} className="bg-slate-900/60 border border-slate-850/50 p-2 rounded text-center">
                                <span className="block text-[8px] font-mono text-slate-500 uppercase font-semibold">{dp.label}</span>
                                <span className="block text-[10px] font-sans text-white font-black mt-0.5">{dp.value}</span>
                                <span className="block text-[7px] font-mono text-emerald-400/80 mt-0.5">{dp.desc}</span>
                              </div>
                            ))}
                          </div>

                          {/* Dynamic Coach Comment inside */}
                          <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-lg flex items-start space-x-2 mt-1.5">
                            <div className="w-6 h-6 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800 text-cyan-400 font-black text-[9px] uppercase">
                              IA
                            </div>
                            <div>
                              <span className="block text-[8px] font-mono text-cyan-400 uppercase font-black leading-none">Coach IA Telvox</span>
                              <p className="text-[9px] text-slate-300 font-mono mt-1 leading-relaxed">
                                {syncingClubPlatform === 'SportEasy' && "« Excellent travail ! J'ai synchronisé ton calendrier SportEasy. Tes 4 entraînements hebdomadaires sont enregistrés dans Telvox. Je vais automatiquement alléger tes séances individuelles de vendredi pour optimiser ta fraîcheur pour le match de dimanche ! »"}
                                {syncingClubPlatform === 'TeamPulse' && "« TeamPulse est connecté. Ta présence de 92% indique une excellente régularité. Je viens de rehausser légèrement ton niveau d'intensité de récupération hebdomadaire pour compenser la charge cumulée. »"}
                                {syncingClubPlatform === 'BeSport' && "« Superbe intégration BeSport. Tes stats de 4 passes décisives et 2 buts prouvent ton efficacité offensive. Tes entraînements de finition devant le but vont être calibrés sur ton poste préférentiel d'Ailier Droit. »"}
                                {syncingClubPlatform === 'FFF Compétitions' && `« Licence FFF validée avec succès. Ton calendrier officiel de championnat a été injecté. J'ai configuré un plan de préparation mentale et d'activation physique spécifique à J-2 de chaque match officiel. »`}
                                {!['SportEasy', 'TeamPulse', 'BeSport', 'FFF Compétitions'].includes(syncingClubPlatform || '') && "« Connexion établie ! Plus besoin de recopier manuellement tes temps de jeu et commentaires. J'ajuste ton Jumeau Numérique en continu pour te faire progresser plus vite. »"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Everyday details & Football culture */}
                    <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3">
                      <span className="block text-[11px] font-mono text-slate-400 uppercase font-black border-b border-slate-900 pb-1.5">Culture Football & Mode de Vie</span>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Joueur de référence</label>
                          <input 
                            type="text" placeholder="Ex: Cristiano Ronaldo" value={state.favoritePlayer}
                            onChange={e => updateState({ favoritePlayer: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-lg text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Club de cœur</label>
                          <input 
                            type="text" placeholder="Ex: Real Madrid" value={state.favoriteClub}
                            onChange={e => updateState({ favoriteClub: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-lg text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Style de jeu fétiche</label>
                          <select 
                            value={state.preferredPlaystyle} onChange={e => updateState({ preferredPlaystyle: e.target.value as any })}
                            className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-lg text-white focus:outline-none"
                          >
                            <option value="Possession">Jeu de Possession</option>
                            <option value="Transition rapide / Contre">Transition rapide / Contre-attaque</option>
                            <option value="Jeu direct / Physique">Jeu direct / Impact physique</option>
                            <option value="Défense bloc bas">Défense en bloc bas & Rigueur</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Joueur modèle rêvé</label>
                          <input 
                            type="text" placeholder="Ex: Kevin De Bruyne" value={state.dreamPlayerModel}
                            onChange={e => updateState({ dreamPlayerModel: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-lg text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* BOTTOM STEPS CONTROLS */}
                {(() => {
                  const isStageValid = (): boolean => {
                    if (activeStage === 1) {
                      const fn = state.firstName.trim().toLowerCase();
                      if (!fn || fn.length < 2) return false;
                      const invalidWords = ["rien", "je ne sais pas", "ne sais pas", "test", "abc", "aucun", "aucune", "sais pas", "pas", "dfg", "sdf", "xyz"];
                      if (invalidWords.includes(fn) || fn.includes("sais pas") || fn.includes("rien")) return false;
                      return true;
                    }
                    if (activeStage === 2) {
                      if (!state.primaryPos || !state.secondaryPos || !state.currentLevel) return false;
                      const c = state.club.trim().toLowerCase();
                      if (!c || c.length < 2) return false;
                      const invalidWords = ["rien", "je ne sais pas", "ne sais pas", "test", "abc", "aucun", "aucune"];
                      if (invalidWords.includes(c) || c.includes("sais pas") || c.includes("rien")) return false;
                      if (!state.practiceYears || Number(state.practiceYears) <= 0) return false;
                      if (!state.jerseyNumber || Number(state.jerseyNumber) <= 0) return false;
                      return true;
                    }
                    if (activeStage === 3) {
                      if (state.selectedObjectives.length === 0) return false;
                      const d = state.biggestDream.trim().toLowerCase();
                      if (!d || d.length < 3) return false;
                      const invalidWords = ["rien", "je ne sais pas", "ne sais pas", "test", "abc", "aucun", "aucune"];
                      if (invalidWords.includes(d) || d.includes("sais pas") || d.includes("rien")) return false;
                      return true;
                    }
                    return true;
                  };

                  const valid = isStageValid();

                  return (
                    <footer className="flex items-center justify-between border-t border-slate-900 pt-5 mt-4">
                      <button
                        type="button"
                        onClick={() => setActiveStage(prev => (prev - 1) as any)}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl transition-all font-mono text-xs uppercase flex items-center space-x-1.5 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Retour</span>
                      </button>

                      <button
                        type="button"
                        disabled={!valid}
                        onClick={() => {
                          if (!valid) return;
                          setActiveStage(prev => (prev + 1) as any);
                        }}
                        className={`px-6 py-2.5 font-sans font-black text-xs uppercase rounded-xl transition-all flex items-center space-x-2 shadow-[0_0_15px_rgba(16,185,129,0.1)] ${
                          valid 
                            ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 hover:scale-102 active:scale-98 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                            : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"
                        }`}
                      >
                        <span>Continuer</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </footer>
                  );
                })()}
              </motion.div>
            )}

            {/* STAGE 6: REVEAL / CINEMATIC BLOCK */}
            {activeStage === 6 && (
              <motion.div 
                key="reveal-stage"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center space-y-6"
              >
                {/* 6A: NEURAL ALIGNMENT LOADING */}
                {revealPhase === 'sync' ? (
                  <div className="max-w-md mx-auto text-center space-y-8 py-12 px-6 bg-slate-950/40 border border-slate-900 rounded-3xl backdrop-blur-md relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
                    <div className="relative z-10 space-y-6">
                      <div className="relative w-32 h-32 mx-auto">
                        {/* Dynamic Progress Ring */}
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="54"
                            className="stroke-slate-900 fill-none"
                            strokeWidth="4"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="54"
                            className="stroke-emerald-400 fill-none transition-all duration-300"
                            strokeWidth="4"
                            strokeDasharray={339.292}
                            strokeDashoffset={339.292 - (339.292 * syncProgress) / 100}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5">
                          <span className="text-2xl font-mono font-black text-emerald-400 tracking-tighter">{syncProgress}%</span>
                          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Calcul</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-sm font-mono text-slate-400 tracking-widest font-black uppercase">GENÈSE DU NUMÉRIQUE TWIN</h3>
                        <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                          Traitement des données biométriques et raccordement au moteur de décisions physiologiques.
                        </p>
                        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mt-2 h-4 animate-pulse">
                          {syncLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 6B: FULL CINEMATIC CARD REVEAL */
                  <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-4">
                    
                    {/* Visual Card on Left */}
                    <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
                      
                      {/* PREMIUM PLAYER CARD DESIGN */}
                      <motion.div 
                        initial={{ scale: 0.8, rotateY: 90, opacity: 0 }}
                        animate={{ scale: 1, rotateY: 0, opacity: 1 }}
                        transition={{ duration: 1.2, type: 'spring' }}
                        className={`w-72 sm:w-80 rounded-[2.5rem] p-6 border-2 relative overflow-hidden flex flex-col justify-between h-[420px] transition-all duration-500 ${currentDesign.wrapper}`}
                      >
                        {/* Shimmer overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 -translate-x-full animate-[shimmer_3s_infinite]" />
                        
                        {/* Card Header stats */}
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col items-center">
                            <span className="text-4xl font-black font-mono tracking-tighter text-white">{computedOvr}</span>
                            <span className="text-[9px] font-mono text-slate-300 uppercase tracking-widest leading-none mt-1">{state.primaryPos}</span>
                          </div>
                          <div className="text-right">
                            <span className={`text-[9px] font-mono px-2.5 py-1 rounded-full border border-white/15 block uppercase tracking-widest font-black ${currentDesign.badge}`}>
                              {activeRarity}
                            </span>
                          </div>
                        </div>

                        {/* Player central portrait inside card */}
                        <div className="flex-1 flex items-center justify-center relative my-4">
                          <div className="w-40 h-40 rounded-full border border-white/10 bg-black/40 flex items-center justify-center overflow-hidden relative group">
                            {photoUrl ? (
                              <img src={photoUrl} alt="Player" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-20 h-20 text-white/20" />
                            )}
                            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                          </div>
                        </div>

                        {/* Card Footer text & stats */}
                        <div className="space-y-3.5 border-t border-white/10 pt-3">
                          <div className="text-center">
                            <h4 className="text-lg font-black font-sans text-white tracking-tight leading-none uppercase">
                              {state.firstName || 'Joueur'} {state.lastName || ''}
                            </h4>
                            <p className="text-[10px] font-mono text-slate-300 mt-1 uppercase tracking-widest">
                              {state.club || 'Libre'} • NIVEAU 1
                            </p>
                          </div>

                          {/* Dynamic attributes block */}
                          <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[9px] text-slate-300">
                            <div>
                              <span className="block text-[8px] text-slate-400 uppercase font-bold">VITESSE</span>
                              <span className="font-bold text-white">{computedDna.explosiveness}</span>
                            </div>
                            <div>
                              <span className="block text-[8px] text-slate-400 uppercase font-bold">TECH</span>
                              <span className="font-bold text-emerald-300">{computedDna.technique}</span>
                            </div>
                            <div>
                              <span className="block text-[8px] text-slate-400 uppercase font-bold">VISION</span>
                              <span className="font-bold text-cyan-300">{computedDna.vision}</span>
                            </div>
                            <div>
                              <span className="block text-[8px] text-slate-400 uppercase font-bold">DISC</span>
                              <span className="font-bold text-yellow-300">{computedDna.discipline}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Speech on Right & Details */}
                    <div className="lg:col-span-7 space-y-6 text-left flex flex-col justify-between self-stretch bg-slate-950/60 border border-slate-900 rounded-[2rem] p-6 sm:p-8">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest">COACH TELVOX</span>
                          </div>
                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Modulateur de Voix actif</span>
                        </div>

                        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 space-y-3 font-sans leading-relaxed text-slate-200 min-h-[140px] flex flex-col justify-center">
                          <p className="text-sm italic">
                            "Félicitations, {state.firstName || 'Joueur'} ! Ton Player Twin est officiellement forger avec un indice global (OVR) de <span className="text-emerald-400 font-black">{computedOvr}</span>."
                          </p>
                          <p className="text-xs text-slate-400">
                            Ton profil tactique de <span className="text-white font-bold">{POSITIONS.find(p => p.code === state.primaryPos)?.name}</span> est désormais associé à l'algorithme d'entraînement Telvox. Tes sessions nutritionnelles et tes fiches d'exercice sont d'ores et déjà modélisées en fonction de tes matériels possédés et de ton temps d'écran hebdomadaire.
                          </p>
                        </div>

                        {/* Interactive Radar list overview */}
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: "Créativité / Dribble", val: computedDna.creativity, icon: Sparkles, color: 'text-purple-400' },
                            { label: "Discipline de Champion", val: computedDna.discipline, icon: Shield, color: 'text-yellow-400' },
                            { label: "Vitesse & Explosivité", val: computedDna.explosiveness, icon: Zap, color: 'text-red-400' },
                            { label: "Jeu Tactique / Vision", val: computedDna.vision, icon: Target, color: 'text-cyan-400' },
                            { label: "Résilience Mentale", val: computedDna.resilience, icon: Flame, color: 'text-emerald-400' },
                            { label: "Qualité Technique", val: computedDna.technique, icon: Award, color: 'text-amber-400' }
                          ].map((attr) => (
                            <div key={attr.label} className="bg-slate-950/40 border border-slate-900 rounded-xl px-3 py-2 flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <attr.icon className={`w-3.5 h-3.5 ${attr.color}`} />
                                <span className="text-[10px] text-slate-400 font-sans">{attr.label}</span>
                              </div>
                              <span className="text-xs font-mono font-black text-white">{attr.val}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 text-[10px] text-slate-500 font-mono flex items-start space-x-2 leading-relaxed">
                          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <p>
                            Cette première Player Card est ton point d'ancrage. En déclarant tes matchs joués et tes séances d'entraînement réalisées, ton jumeau va évoluer avec des rapports d'analyses IA constants.
                          </p>
                        </div>

                        <button
                          onClick={handleFinish}
                          className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-sans font-black tracking-widest text-xs uppercase rounded-xl hover:scale-102 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                        >
                          <span>Intégrer le Centre de Formation</span>
                          <ChevronRight className="w-4 h-4 text-slate-950 font-black shrink-0" />
                        </button>
                      </div>

                    </div>

                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>

        </section>

      </main>

      {/* FOOTER WATERMARK */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-3.5 px-6 flex items-center justify-between text-[10px] font-mono text-slate-600 z-10">
        <span>TELVOX INC • TOUS DROITS RÉSERVÉS</span>
        <span>SECURITY CHIP: EST-994325</span>
      </footer>
    </div>
  );
}
