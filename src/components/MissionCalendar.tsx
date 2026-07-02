import React, { useState, useEffect } from 'react';
import { PlayerProfile, Session, Match, Exercise } from '../types';
import { 
  Calendar, Clock, Plus, Check, Zap, CloudRain, Sun, Dumbbell, Award, 
  Shield, Activity, Heart, Play, Trash2, ExternalLink, Cpu, Moon, 
  RefreshCw, AlertTriangle, Smile, BookOpen, Video, Trash, ChevronRight, X, Sparkles, CheckCircle2
} from 'lucide-react';
import LiveDemonstrationPlayer from './LiveDemonstrationPlayer';

interface MissionCalendarProps {
  player: PlayerProfile;
  setPlayer: React.Dispatch<React.SetStateAction<PlayerProfile>>;
  sessions: Session[];
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
  openCoachDiscussion: (prompt: string) => void;
}

export type PeriodType = 'pre_season' | 'season' | 'break' | 'holidays' | 'injury' | 'recovery';

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  type: 'club' | 'match' | 'telvox' | 'physical' | 'mental' | 'recovery' | 'rest' | 'video' | 'bilan' | 'challenge' | 'goal' | 'exam' | 'holidays_event' | 'personal';
  description: string;
  duration: number; // minutes
  dayOfWeek: number; // 0: Lundi, 1: Mardi, ..., 6: Dimanche
  completed: boolean;
  exercises?: Exercise[];
  targetStats?: { label: string; value: string }[];
  objectives?: string[];
}

const INITIAL_EVENTS: CalendarEvent[] = [];

export default function MissionCalendar({ 
  player, 
  setPlayer, 
  sessions, 
  setSessions, 
  openCoachDiscussion 
}: MissionCalendarProps) {
  
  // Storage keys & local state
  const [period, setPeriod] = useState<PeriodType>(() => {
    const stored = localStorage.getItem('telvox_calendar_period');
    return (stored as PeriodType) || 'season';
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const stored = localStorage.getItem('telvox_calendar_events');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    return INITIAL_EVENTS;
  });

  const [selectedDay, setSelectedDay] = useState<number>(0); // 0 (Mon) to 6 (Sun)
  
  // Recalculation simulation state
  const [recalculating, setRecalculating] = useState(false);
  const [recalcLogs, setRecalcLogs] = useState<string[]>([]);
  const [coachAdvice, setCoachAdvice] = useState<string>(
    "« Actuellement en période de Saison. Ton programme cible la fraîcheur physique pour le match de samedi, tout en greffant des fenêtres courtes d'explosivité individuelle d'ailier droit. »"
  );

  // Synchronization loader simulation
  const [syncingPlatform, setSyncingPlatform] = useState<string | null>(null);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  // Event modal state
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  
  // Timer state for workout session inside event modal
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerIntervalId, setTimerIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionPain, setSessionPain] = useState<string>('aucune');
  const [sessionDifficulty, setSessionDifficulty] = useState<'Facile' | 'Correct' | 'Difficile' | 'Impossible'>('Correct');

  // Custom Event Creator Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvtTitle, setNewEvtTitle] = useState('');
  const [newEvtTime, setNewEvtTime] = useState('14:00');
  const [newEvtType, setNewEvtType] = useState<CalendarEvent['type']>('telvox');
  const [newEvtDesc, setNewEvtDesc] = useState('');
  const [newEvtDuration, setNewEvtDuration] = useState(45);
  const [newEvtDay, setNewEvtDay] = useState(2);

  // IA Adaptation Options
  const [adaptSleep, setAdaptSleep] = useState<'good' | 'bad'>('good');
  const [adaptFatigue, setAdaptFatigue] = useState<'low' | 'high'>('low');
  const [adaptWeather, setAdaptWeather] = useState<'sun' | 'rain'>('sun');
  const [adaptPain, setAdaptPain] = useState<'none' | 'ischios' | 'knee'>('none');
  const [adaptExams, setAdaptExams] = useState(false);

  // Save calendar items to localStorage
  useEffect(() => {
    localStorage.setItem('telvox_calendar_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('telvox_calendar_period', period);
  }, [period]);

  // Handle countdown timer inside active workout
  useEffect(() => {
    if (timerActive) {
      const interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
      setTimerIntervalId(interval);
      return () => clearInterval(interval);
    } else {
      if (timerIntervalId) {
        clearInterval(timerIntervalId);
        setTimerIntervalId(null);
      }
    }
  }, [timerActive]);

  // Map of days
  const DAYS_NAME = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  // Color helper according to prompt specs
  const getEventColors = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'club':
        return { bg: 'bg-blue-500/10 hover:bg-blue-500/15', border: 'border-blue-500/40', text: 'text-blue-400', dot: 'bg-blue-400' };
      case 'match':
        return { bg: 'bg-red-500/10 hover:bg-red-500/15', border: 'border-red-500/40', text: 'text-red-400', dot: 'bg-red-400' };
      case 'telvox':
        return { bg: 'bg-emerald-500/10 hover:bg-emerald-500/15', border: 'border-emerald-500/40', text: 'text-emerald-400', dot: 'bg-emerald-400' };
      case 'mental':
        return { bg: 'bg-violet-500/10 hover:bg-violet-500/15', border: 'border-violet-500/40', text: 'text-violet-400', dot: 'bg-violet-400' };
      case 'physical':
        return { bg: 'bg-orange-500/10 hover:bg-orange-500/15', border: 'border-orange-500/40', text: 'text-orange-400', dot: 'bg-orange-400' };
      case 'recovery':
        return { bg: 'bg-cyan-500/10 hover:bg-cyan-500/15', border: 'border-cyan-500/40', text: 'text-cyan-400', dot: 'bg-cyan-400' };
      case 'rest':
        return { bg: 'bg-slate-500/10 hover:bg-slate-500/15', border: 'border-slate-500/40', text: 'text-slate-400', dot: 'bg-slate-400' };
      case 'video':
        return { bg: 'bg-rose-500/10 hover:bg-rose-500/15', border: 'border-rose-500/40', text: 'text-rose-400', dot: 'bg-rose-400' };
      case 'challenge':
      case 'goal':
        return { bg: 'bg-yellow-500/10 hover:bg-yellow-500/15', border: 'border-yellow-500/40', text: 'text-yellow-400', dot: 'bg-yellow-400' };
      default:
        return { bg: 'bg-slate-800/40 hover:bg-slate-800/60', border: 'border-slate-700', text: 'text-slate-300', dot: 'bg-slate-500' };
    }
  };

  // 1. Recalculate program when current period changes
  const handlePeriodChange = (newPeriod: PeriodType) => {
    setPeriod(newPeriod);
    setRecalculating(true);
    setRecalcLogs([`Initialisation du recalcul intelligent pour la période : [${newPeriod.toUpperCase()}]...`]);

    let logs: string[] = [];
    let updatedEvents = [...INITIAL_EVENTS];
    let advice = '';

    if (newPeriod === 'injury') {
      logs = [
        "⚠ Activation du protocole Blessure & Réhabilitation médicale.",
        "🚫 Désactivation automatique des séances explosives (Sprints 10m, Crossover Dribble).",
        "🟢 Remplacement par 3 séances de rééducation articulaire par semaine.",
        "🧠 Ajout de sessions de neuro-visualisation cognitive pour conserver la vivacité intellectuelle.",
        "📉 Limitation de la charge d'entraînement club (Contact interdit).",
        "🥗 Notification Nutrition : Réduction des glucides complexes (-350 kcal) pour éviter la prise de gras."
      ];
      advice = "« Mode Blessure actif. Le Coach IA a remplacé tes entraînements de sprint par de la réhabilitation articulaire basse intensité et de la visualisation neuro-cognitive. Préserve ton corps. »";
      
      // Update Wednesday & Thursday for injury protocol
      updatedEvents = updatedEvents.map(e => {
        if (e.id === 'evt_wed_1') {
          return {
            ...e,
            title: '🧘 Séance Telvox - Rééducation & Mobilité Légère',
            description: 'Mobilité active et rééducation proprioceptive pour articulations blessées.',
            exercises: [
              {
                id: 'ex_inj_1',
                name: 'Mobilisation chevilles & hanches',
                duration: 20,
                intensity: 'Faible',
                focusPoints: ['Aucune contrainte de charge', 'Respiration ample'],
                commonErrors: ['Prendre appui brusquement'],
                easyVariant: 'Assis',
                hardVariant: 'Debout unilatéral',
                description: 'Assure une irrigation sanguine optimale de la zone touchée.',
                videoDemoName: 'MobilityFlow'
              }
            ]
          };
        }
        if (e.id === 'evt_thu_1') {
          return {
            ...e,
            title: '🧠 Visualisation cognitive d\'avant-match',
            description: 'Entraînement mental des schémas tactiques et scan de l\'espace par imagerie cérébrale.',
            type: 'mental'
          };
        }
        if (e.id === 'evt_sat_2') {
          return {
            ...e,
            title: '🚫 MATCH reporté - Repos blessure',
            description: 'Protocole médical de rééducation passive. Zéro contrainte d\'appui.',
            type: 'rest'
          };
        }
        return e;
      });
    } else if (newPeriod === 'pre_season') {
      logs = [
        "⚡ Mode Pré-Saison : Accentuation du volume foncier et de l'endurance spécifique.",
        "📈 Augmentation du volume de préparation physique (+25 mins de travail d'aérobie).",
        "🎯 Focus technique : Précision et répétition des gestes de base.",
        "💪 Ajout d'une séance de renforcement musculaire global le mardi matin."
      ];
      advice = "« Pré-saison active. Préparation foncière maximale. Ton volume horaire hebdomadaire augmente pour forger un physique capable de répéter les efforts intensifs sans fatigue. »";
      
      // Add pre-season training
      updatedEvents.push({
        id: 'evt_pre_1',
        title: '💪 Renforcement musculaire foncier',
        time: '08:30',
        type: 'physical',
        description: 'Force maximale et résistance à l\'effort répété.',
        duration: 45,
        dayOfWeek: 1,
        completed: false
      });
    } else if (newPeriod === 'holidays') {
      logs = [
        "🌴 Mode Vacances actif. Transition vers la régénération mentale.",
        "🧘 Planification d'activités récréatives légères et sommeil libre.",
        "😴 Suspension des entraînements officiels obligatoires du club.",
        "⚡ Maintien de routines d'étirements très légères pour éviter le raidissement fessier."
      ];
      advice = "« Vacances programmées. Coupe psychologiquement, ton corps en a besoin. Nous limitons ton programme à 15 minutes quotidiennes de mobilité relaxante. Profite. »";
      
      updatedEvents = updatedEvents.map(e => {
        if (e.type === 'club' || e.type === 'match') {
          return {
            ...e,
            title: `✈️ Vacances & Repos libre`,
            description: 'Temps libre hors club pour la régénération complète.',
            type: 'rest'
          };
        }
        return e;
      });
    } else {
      logs = [
        "🟢 Planification de Saison régulière recalibrée.",
        "🏆 Alignement sur le calendrier de Championnat U19.",
        "🔥 Intensité explosive ciblée sur l'aile droite.",
        `⚽ Intégration directe des entraînements de l'Académie ${player.club || 'Libre'}.`
      ];
      advice = "« Nous sommes en pleine Saison. Ton programme est sculpté autour de la fraîcheur physique du samedi pour te permettre de briller en match officiel. »";
    }

    // Run progressive logs
    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < logs.length) {
        setRecalcLogs(prev => [...prev, logs[currentIdx]]);
        currentIdx++;
      } else {
        clearInterval(interval);
        setRecalculating(false);
        setEvents(updatedEvents);
        setCoachAdvice(advice);
      }
    }, 300);
  };

  // 2. Adaptive simulation process
  const triggerIAAdaptation = () => {
    setRecalculating(true);
    setRecalcLogs(["⚡ Diagnostic des variables externes de l'athlète..."]);

    const logs: string[] = [];

    // Analyze fatigue/sleep
    if (adaptSleep === 'bad') {
      logs.push("😴 Détection de sommeil non optimal (<6h) : Alerte dette cumulée.");
      logs.push("🧘 Remplacement des sprints intenses du mercredi par une séance d'activation de basse charge neuro-musculaire.");
    } else {
      logs.push("💚 Sommeil optimal déclaré. Amplitude hormonale de récupération validée.");
    }

    // Muscle pains
    if (adaptPain === 'ischios') {
      logs.push("⚠ Alerte biométrique : Tension déclarée à l'ischio-jambier droit.");
      logs.push("🚫 Retrait immédiat des charges pliométriques lourdes et des accélérations maximales.");
      logs.push("💊 Programmation automatique de 2 protocoles de massage et d'étirements excentriques légers.");
    } else if (adaptPain === 'knee') {
      logs.push("⚠ Alerte biométrique : Point douloureux au tendon rotulien.");
      logs.push("🩹 Modification des appuis : Suspension des sauts verticaux. Remplacement par de la piscine / vélo.");
    }

    // Weather
    if (adaptWeather === 'rain') {
      logs.push(`🌧️ Météo : Pluie torrentielle détectée sur ${player.city || 'ta région'}.`);
      logs.push("🏠 Repli recommandé : Déplacement de la séance technique individuelle en gymnase ou en salle couverte.");
    }

    // Academic exams
    if (adaptExams) {
      logs.push("📚 Contrainte de vie scolaire : Semaine d'examens détectée.");
      logs.push("😴 Allègement de l'entraînement du soir à 19h00. Augmentation des temps de repos mental.");
    }

    logs.push("🚀 Recalcul finalisé. Ton plan d'entraînement s'est automatiquement adapté.");

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < logs.length) {
        setRecalcLogs(prev => [...prev, logs[currentIdx]]);
        currentIdx++;
      } else {
        clearInterval(interval);
        setRecalculating(false);

        // Mutate events slightly to prove dynamic adaptation to variables
        setEvents(prev => {
          return prev.map(e => {
            if (e.id === 'evt_wed_1' && (adaptSleep === 'bad' || adaptPain === 'ischios')) {
              return {
                ...e,
                title: '🧘 Séance Adaptée - Récupération & Activation Ischios',
                description: 'Intensité rabaissée suite à dette de sommeil ou tension musculaire.',
                duration: 25,
                exercises: [
                  {
                    id: 'ex_adapted_1',
                    name: 'Étirements excentriques très légers',
                    duration: 15,
                    intensity: 'Faible',
                    focusPoints: ['Ne jamais forcer', 'S\'hydrater en continu'],
                    commonErrors: ['Mouvements brusques'],
                    easyVariant: 'Allongé sur le dos',
                    hardVariant: 'Utilisation d\'élastique souple',
                    description: 'Favorise la cicatrisation et la détente de la chaîne d\'ischio-jambiers.',
                    videoDemoName: 'StretchPost'
                  }
                ]
              };
            }
            return e;
          });
        });

        // Set coach advice tailored
        let tailMessage = "« Programme recalculé avec succès ! Ton plan a été ajusté en fonction de ton niveau de fatigue, de tes douleurs d'ischios et des contraintes d'examens. La priorité est ta préservation. »";
        setCoachAdvice(tailMessage);
      }
    }, 400);
  };

  // 3. Platform synchronization simulation
  const handlePlatformSync = (platformName: string) => {
    setSyncingPlatform(platformName);
    setSyncLogs([`Connexion aux serveurs distants de ${platformName}...`]);

    const logs = [
      "🔑 Authentification sécurisée OAuth2...",
      "📅 Lecture de ton agenda externe et filtrage des mots-clés sportifs...",
      "📦 Importation de 3 nouveaux événements détectés (1 entraînement supplémentaire, 1 événement personnel d'examens et 1 rappel tactique).",
      "🤖 Envoi des nouvelles métadonnées au Progress Engine Telvox...",
      "⚡ Recalcul automatique du planning hebdomadaire finalisé avec succès !"
    ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < logs.length) {
        setSyncLogs(prev => [...prev, logs[currentIdx]]);
        currentIdx++;
      } else {
        clearInterval(interval);
        setSyncingPlatform(null);

        // Append synchronized events to the calendar
        const newSyncedEvents: CalendarEvent[] = [
          {
            id: `evt_synced_${platformName}_1`,
            title: `📌 [Import ${platformName}] Réunion tactique d'équipe`,
            time: '18:15',
            type: 'club',
            description: 'Briefing tactique général avec l\'entraîneur pour le match de samedi.',
            duration: 45,
            dayOfWeek: 4, // Vendredi
            completed: false
          }
        ];

        if (platformName === 'SportEasy') {
          newSyncedEvents.push({
            id: `evt_synced_se_2`,
            title: `🏆 [SportEasy] Convocation Match Monaco`,
            time: '13:30',
            type: 'match',
            description: 'Rassemblement officiel au club house.',
            duration: 60,
            dayOfWeek: 5, // Samedi
            completed: false
          });
        }

        setEvents(prev => [...prev, ...newSyncedEvents]);
        
        // Slightly reward the user with coins for syncing a real calendar
        setPlayer(prev => ({
          ...prev,
          coins: prev.coins + 100,
          xp: prev.xp + 150
        }));
      }
    }, 600);
  };

  // 4. Custom Event Creator Form submit
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvtTitle.trim()) return;

    const newEvt: CalendarEvent = {
      id: `evt_custom_${Date.now()}`,
      title: newEvtTitle,
      time: newEvtTime,
      type: newEvtType,
      description: newEvtDesc || "Événement planifié manuellement par le joueur.",
      duration: Number(newEvtDuration),
      dayOfWeek: Number(newEvtDay),
      completed: false
    };

    setEvents(prev => [...prev, newEvt]);
    setNewEvtTitle('');
    setNewEvtDesc('');
    setShowAddForm(false);
  };

  // Delete event helper
  const handleDeleteEvent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEvents(prev => prev.filter(evt => evt.id !== id));
    if (selectedEvent?.id === id) {
      setSelectedEvent(null);
    }
  };

  // 5. Action workout modal triggers
  const startWorkoutSession = () => {
    setTimerActive(true);
    setTimerSeconds(0);
    setCurrentExerciseIdx(0);
  };

  const stopWorkoutSession = () => {
    setTimerActive(false);
    if (timerIntervalId) {
      clearInterval(timerIntervalId);
      setTimerIntervalId(null);
    }
  };

  const completeWorkoutSession = () => {
    stopWorkoutSession();
    if (!selectedEvent) return;

    // Award XP, level up check, VX coins check
    const xpReward = selectedEvent.type === 'match' ? 1000 : 350;
    const coinsReward = selectedEvent.type === 'match' ? 250 : 80;

    // Mutate local events
    setEvents(prev => prev.map(evt => {
      if (evt.id === selectedEvent.id) {
        return { ...evt, completed: true };
      }
      return evt;
    }));

    // Update global state of sessions to match this completion if it corresponds to a training
    if (selectedEvent.type === 'telvox') {
      setSessions(prev => prev.map(s => {
        // Match by first parts of name or duration
        if (s.duration === selectedEvent.duration || s.name.includes('Optimisation')) {
          return {
            ...s,
            completed: true,
            feedbackScore: sessionDifficulty,
            adjustmentNote: `Validée le ${DAYS_NAME[selectedEvent.dayOfWeek]} avec ressenti "${sessionDifficulty}". Notes : ${sessionNotes}`
          };
        }
        return s;
      }));
    }

    // Award player
    setPlayer(prev => {
      let newXp = prev.xp + xpReward;
      let newLevel = prev.level;
      let newXpNext = prev.xpNextLevel;
      if (newXp >= prev.xpNextLevel) {
        newLevel += 1;
        newXp -= prev.xpNextLevel;
        newXpNext = Math.floor(prev.xpNextLevel * 1.25);
      }
      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        xpNextLevel: newXpNext,
        coins: prev.coins + coinsReward,
        progressScore: Math.min(1000, prev.progressScore + 15),
        streak: prev.streak + 1
      };
    });

    // Close event modal
    setSelectedEvent(null);
  };

  // Filter events of the selected day
  const dailyEvents = events
    .filter(evt => evt.dayOfWeek === selectedDay)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-8 animate-fade-in text-slate-100">
      
      {/* HEADER BAR AND PERIOD SELECTOR */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-sans font-black tracking-tight text-white flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-cyan-400" />
              <span>📅 Mission Calendar</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Le moteur centralisé de Telvox OS. Il coordonne ta préparation, planifie tes charges de travail et recalcule instantanément ton programme en fonction de tes aléas physiques.
            </p>
          </div>

          {/* Period selector */}
          <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-2xl shrink-0 space-y-2.5">
            <span className="block text-[10px] font-mono text-slate-400 uppercase font-black tracking-widest">
              Période Athlétique Actuelle :
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { key: 'pre_season', label: '🟢 Pré-saison' },
                { key: 'season', label: '🔵 Saison' },
                { key: 'break', label: '🟡 Trêve' },
                { key: 'holidays', label: '🟠 Vacances' },
                { key: 'injury', label: '🔴 Blessure / Réathlé' },
                { key: 'recovery', label: '⚪ Reprise' }
              ].map(p => (
                <button
                  key={p.key}
                  onClick={() => handlePeriodChange(p.key as PeriodType)}
                  className={`px-3 py-1.5 text-[11px] font-sans font-bold rounded-lg border uppercase tracking-wider text-left transition-all ${
                    period === p.key 
                      ? 'bg-cyan-500 border-cyan-500 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.3)] scale-102 font-extrabold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recalculation logs feedback */}
        {recalculating && (
          <div className="mt-6 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5 animate-pulse">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-cyan-400 animate-spin" />
              <span className="text-[11px] font-mono text-cyan-400 uppercase font-black tracking-widest">RE-PLANIFICATION AUTOMATIQUE PAR LE COACH IA EN COURS...</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-900 font-mono text-[10px] text-slate-400 space-y-1 max-h-24 overflow-y-auto no-scrollbar">
              {recalcLogs.map((log, i) => (
                <div key={i} className="flex items-start space-x-1.5">
                  <span className="text-emerald-500">❯</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coach Advice Block */}
        {!recalculating && coachAdvice && (
          <div className="mt-6 bg-slate-950/60 border border-slate-850 p-4 rounded-2xl flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 font-sans font-black text-xs uppercase shrink-0">
              IA
            </div>
            <div>
              <span className="block text-[10px] font-mono text-cyan-400 uppercase font-black">Planificateur Intelligent Telvox</span>
              <p className="text-xs text-slate-300 font-mono mt-1 leading-relaxed italic">
                {coachAdvice}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* WEEK TABS NAVIGATION */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 border-b border-slate-800 pb-3">
          <div>
            <span className="block text-[10px] font-mono text-slate-400 uppercase font-black tracking-wider">
              Microcycle Hebdomadaire
            </span>
            <span className="text-sm font-sans font-black text-white">
              Cible J-2 Match contre Monaco U19
            </span>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-sans font-black text-[11px] uppercase rounded-xl tracking-wider flex items-center space-x-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Planifier une activité</span>
          </button>
        </div>

        {/* Tabs Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
          {DAYS_NAME.map((name, idx) => {
            const isToday = idx === selectedDay;
            // Get event count for this day
            const count = events.filter(e => e.dayOfWeek === idx).length;
            const completedCount = events.filter(e => e.dayOfWeek === idx && e.completed).length;

            return (
              <button
                key={idx}
                onClick={() => setSelectedDay(idx)}
                className={`p-3 rounded-2xl border text-center flex flex-col justify-between transition-all ${
                  isToday 
                    ? 'bg-slate-950 border-cyan-500 text-cyan-400 shadow-[inset_0_0_12px_rgba(6,182,212,0.1)]'
                    : 'bg-slate-900/40 border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-[10px] font-mono uppercase tracking-wider block font-bold">
                  {name.substring(0, 3)}.
                </span>
                <span className="block text-lg font-sans font-black text-white mt-1">
                  {idx === 5 ? '🏆' : '⚽'}
                </span>
                
                {/* Micro dots */}
                <div className="flex items-center justify-center space-x-1 mt-2.5">
                  {count === 0 ? (
                    <span className="text-[8px] font-mono text-slate-600 uppercase font-bold">REPOS</span>
                  ) : (
                    <span className={`text-[9px] font-mono font-black ${completedCount === count ? 'text-emerald-400' : 'text-cyan-400'}`}>
                      {completedCount}/{count} ✓
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* TWO COLUMNS: EVENTS LIST & AI ADAPTATION PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMN 1: Daily Events list (2 cols on desktop) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2">
            <h3 className="text-lg font-sans font-black text-white flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <span>Activités programmées le {DAYS_NAME[selectedDay]}</span>
            </h3>
            <span className="text-xs font-mono text-slate-500">
              {dailyEvents.length} événements
            </span>
          </div>

          {/* Form Create Event */}
          {showAddForm && (
            <form onSubmit={handleAddEvent} className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-5 space-y-4 shadow-xl animate-scale-up">
              <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                <span className="text-xs font-mono text-cyan-400 uppercase font-black tracking-widest">Planifier une nouvelle activité personnelle</span>
                <button type="button" onClick={() => setShowAddForm(false)} className="text-slate-500 hover:text-white">×</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold mb-1">Intitulé de l'événement</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Footing VMA, Kiné, Devoirs..."
                    value={newEvtTitle}
                    onChange={e => setNewEvtTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold mb-1">Type / Code Couleur</label>
                  <select
                    value={newEvtType}
                    onChange={e => setNewEvtType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-white font-sans"
                  >
                    <option value="club">⚽ Entraînement club (Bleu)</option>
                    <option value="match">🏆 Match officiel (Rouge)</option>
                    <option value="telvox">🏃 Séance Telvox (Vert)</option>
                    <option value="physical">💪 Préparation physique (Orange)</option>
                    <option value="mental">🧠 Préparation mentale (Violet)</option>
                    <option value="recovery">🧘 Récupération (Turquoise)</option>
                    <option value="rest">😴 Repos (Gris)</option>
                    <option value="video">🎥 Analyse vidéo (Rose)</option>
                    <option value="personal">📌 Événement personnel (Gris)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold mb-1">Heure de début</label>
                  <input
                    type="time"
                    value={newEvtTime}
                    onChange={e => setNewEvtTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold mb-1">Durée (minutes)</label>
                  <input
                    type="number"
                    value={newEvtDuration}
                    onChange={e => setNewEvtDuration(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold mb-1">Jour programmé</label>
                  <select
                    value={newEvtDay}
                    onChange={e => setNewEvtDay(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {DAYS_NAME.map((name, i) => (
                      <option key={i} value={i}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold mb-1">Description / Notes libres</label>
                <textarea
                  placeholder="Objectifs de la séance, matériel nécessaire..."
                  value={newEvtDesc}
                  onChange={e => setNewEvtDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white h-16 resize-none focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-sans font-black text-xs uppercase rounded-xl shadow-lg hover:from-cyan-400 hover:to-blue-400 active:scale-98 transition-all"
              >
                Valider l'inscription au planning ⚡
              </button>
            </form>
          )}

          {/* Events list */}
          {dailyEvents.length === 0 ? (
            <div className="bg-slate-900 border border-slate-850 p-8 rounded-3xl text-center text-slate-500">
              <Moon className="w-10 h-10 text-slate-600 mx-auto mb-2 animate-bounce" />
              <p className="text-sm font-sans font-black uppercase text-slate-400">Aucun événement programmé</p>
              <p className="text-xs text-slate-500 mt-1">Le Coach IA recommande une journée de repos passif pour recharger les réserves énergétiques.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dailyEvents.map(evt => {
                const colors = getEventColors(evt.type);
                return (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className={`${colors.bg} border-l-4 ${colors.border} rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 cursor-pointer relative group`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                        <span className={`text-[9px] font-mono uppercase tracking-widest font-black ${colors.text}`}>
                          {evt.type === 'telvox' ? '🏃 Séance Individuelle Telvox' : evt.type.toUpperCase()}
                        </span>
                        {evt.completed && (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                            ✓ Terminé
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-sans font-black text-white group-hover:text-cyan-300 transition-colors">
                        {evt.title}
                      </h4>

                      <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                        {evt.description}
                      </p>

                      <div className="flex items-center space-x-4 pt-1 text-[10px] font-mono text-slate-500">
                        <span className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          {evt.time} ({evt.duration} min)
                        </span>
                        {evt.objectives && (
                          <span className="hidden sm:inline">
                            🎯 {evt.objectives.length} objectifs
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2.5 shrink-0 self-end sm:self-auto">
                      {!evt.completed && evt.type === 'telvox' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(evt);
                            startWorkoutSession();
                          }}
                          className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-sans font-black text-[10px] uppercase rounded-lg shadow flex items-center space-x-1"
                        >
                          <Play className="w-3 h-3 fill-slate-950" />
                          <span>Démarrer</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleDeleteEvent(evt.id, e)}
                        className="p-1.5 bg-slate-950 border border-slate-850 hover:border-red-500/50 text-slate-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="Retirer cet événement"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* COLUMN 2: IA ADAPTIVE CONTROLS & PLATFORMS SYNC (1 col) */}
        <div className="space-y-6">
          
          {/* AI ADAPTATION SIMULATOR BOX */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <h3 className="text-xs font-mono text-cyan-400 uppercase font-black tracking-widest flex items-center space-x-1.5">
                <Cpu className="w-4 h-4 animate-pulse" />
                <span>Adaptation IA en continu</span>
              </h3>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Simule des changements de ton environnement réel (météo, douleurs, examens scolaires). Le planificateur recalculera ton planning instantanément.
            </p>

            <div className="space-y-3.5 pt-2">
              {/* Variable: Sleep */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Sommeil :</span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setAdaptSleep('good')}
                    className={`px-2 py-1 text-[9px] font-mono rounded uppercase font-bold ${adaptSleep === 'good' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-slate-950 text-slate-500 border border-slate-900'}`}
                  >
                    Normal (&gt; 8h)
                  </button>
                  <button
                    onClick={() => setAdaptSleep('bad')}
                    className={`px-2 py-1 text-[9px] font-mono rounded uppercase font-bold ${adaptSleep === 'bad' ? 'bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse' : 'bg-slate-950 text-slate-500 border border-slate-900'}`}
                  >
                    Dette (&lt; 6h)
                  </button>
                </div>
              </div>

              {/* Variable: Douleur */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Douleur :</span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setAdaptPain('none')}
                    className={`px-2 py-1 text-[9px] font-mono rounded uppercase font-bold ${adaptPain === 'none' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-slate-950 text-slate-500 border border-slate-900'}`}
                  >
                    Aucune
                  </button>
                  <button
                    onClick={() => setAdaptPain('ischios')}
                    className={`px-2 py-1 text-[9px] font-mono rounded uppercase font-bold ${adaptPain === 'ischios' ? 'bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse' : 'bg-slate-950 text-slate-500 border border-slate-900'}`}
                  >
                    Ischios
                  </button>
                  <button
                    onClick={() => setAdaptPain('knee')}
                    className={`px-2 py-1 text-[9px] font-mono rounded uppercase font-bold ${adaptPain === 'knee' ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'bg-slate-950 text-slate-500 border border-slate-900'}`}
                  >
                    Rotule
                  </button>
                </div>
              </div>

              {/* Variable: Météo */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Météo :</span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setAdaptWeather('sun')}
                    className={`px-2 py-1 text-[9px] font-mono rounded uppercase font-bold flex items-center space-x-1 ${adaptWeather === 'sun' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30' : 'bg-slate-950 text-slate-500 border border-slate-900'}`}
                  >
                    <Sun className="w-3 h-3" />
                    <span>Soleil</span>
                  </button>
                  <button
                    onClick={() => setAdaptWeather('rain')}
                    className={`px-2 py-1 text-[9px] font-mono rounded uppercase font-bold flex items-center space-x-1 ${adaptWeather === 'rain' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' : 'bg-slate-950 text-slate-500 border border-slate-900'}`}
                  >
                    <CloudRain className="w-3 h-3" />
                    <span>Pluie</span>
                  </button>
                </div>
              </div>

              {/* Variable: Scolaire */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Période examens :</span>
                <button
                  type="button"
                  onClick={() => setAdaptExams(!adaptExams)}
                  className={`px-3 py-1 text-[9px] font-mono rounded uppercase font-bold ${adaptExams ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30' : 'bg-slate-950 text-slate-500 border border-slate-900'}`}
                >
                  {adaptExams ? 'Actif' : 'Désactivé'}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={triggerIAAdaptation}
              disabled={recalculating}
              className="w-full mt-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-sans font-black text-xs uppercase rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
              <span>Calculer & Adapter ⚡</span>
            </button>
          </div>

          {/* CALENDAR SYNCHRONIZATIONS PLATFORMS */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-mono text-cyan-400 uppercase font-black tracking-widest border-b border-slate-850 pb-2 flex items-center space-x-1.5">
              <ExternalLink className="w-4 h-4" />
              <span>Synchronisation Calendrier</span>
            </h3>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Connecte ton planning personnel externe. Telvox ingère tes contraintes pour dégager de la fraîcheur.
            </p>

            {syncingPlatform ? (
              <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-cyan-400 animate-pulse uppercase font-black">Sync {syncingPlatform}...</span>
                  <div className="w-3 h-3 border border-t-transparent border-cyan-400 animate-spin rounded-full" />
                </div>
                <div className="text-[8px] font-mono text-slate-500 space-y-1">
                  {syncLogs.map((log, i) => (
                    <div key={i} className="flex items-start space-x-1 text-slate-400">
                      <span>•</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                {[
                  { name: 'Google Cal', color: 'hover:border-blue-500/40 text-blue-400' },
                  { name: 'Apple Cal', color: 'hover:border-slate-400/40 text-white' },
                  { name: 'TeamPulse', color: 'hover:border-emerald-500/40 text-emerald-400' },
                  { name: 'SportEasy', color: 'hover:border-cyan-500/40 text-cyan-400' }
                ].map(plat => (
                  <button
                    key={plat.name}
                    type="button"
                    onClick={() => handlePlatformSync(plat.name)}
                    className={`bg-slate-950 border border-slate-850 p-2 text-[10px] font-mono uppercase font-black rounded-xl transition-all flex items-center justify-center space-x-1.5 ${plat.color}`}
                  >
                    <RefreshCw className="w-3 h-3 shrink-0" />
                    <span>{plat.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EVENT DETAIL & WORKOUT RUN MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative text-slate-100 animate-scale-up max-h-[90vh] overflow-y-auto no-scrollbar">
            
            {/* Modal close */}
            <button
              onClick={() => {
                setSelectedEvent(null);
                stopWorkoutSession();
              }}
              className="absolute top-4 right-4 p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-[9px] rounded-full uppercase tracking-wider font-black">
                  Fiche d'Événement Telvox
                </span>
                <span className="text-[10px] font-mono text-slate-500">{selectedEvent.time}</span>
              </div>

              <h3 className="text-xl font-sans font-black text-white">
                {selectedEvent.title}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950/50 p-3 rounded-xl border border-slate-850">
                {selectedEvent.description}
              </p>

              {/* Target Stats expected */}
              {selectedEvent.targetStats && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {selectedEvent.targetStats.map((st, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-850 p-2.5 rounded-xl">
                      <span className="block text-[8px] font-mono text-slate-500 uppercase font-black">{st.label}</span>
                      <span className="block text-sm font-sans font-black text-white mt-0.5">{st.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Objectives List */}
              {selectedEvent.objectives && selectedEvent.objectives.length > 0 && (
                <div className="space-y-1.5">
                  <span className="block text-[9px] font-mono text-slate-400 uppercase font-black tracking-wider">🎯 Objectifs de la séance :</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedEvent.objectives.map((obj, i) => (
                      <div key={i} className="flex items-center space-x-2 bg-slate-950 border border-slate-850/60 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                        <span>{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exercises associated view */}
              {selectedEvent.exercises && selectedEvent.exercises.length > 0 && !timerActive && (
                <div className="space-y-2.5">
                  <span className="block text-[9px] font-mono text-slate-400 uppercase font-black tracking-wider">🏃 Exercices préconisés ({selectedEvent.exercises.length}) :</span>
                  <div className="space-y-2">
                    {selectedEvent.exercises.map((ex, i) => (
                      <div key={i} className="bg-slate-950 border border-slate-850/70 p-3.5 rounded-xl space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-sans font-black text-white">{ex.name}</span>
                          <span className="bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded font-mono text-[9px] font-black">{ex.duration} mins</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{ex.description}</p>
                        
                        <div className="pt-1.5 space-y-1 border-t border-slate-900">
                          <span className="block text-[8px] font-mono text-slate-500 uppercase font-bold">Points clés d'exécution :</span>
                          <div className="grid grid-cols-1 gap-1 text-[10px] font-mono text-slate-400">
                            {ex.focusPoints.map((pt, idx) => (
                              <div key={idx} className="flex items-start space-x-1">
                                <span className="text-emerald-500 font-bold">•</span>
                                <span>{pt}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* INTERACTIVE WORKOUT SESSION TIMER SCREEN */}
              {timerActive && selectedEvent.exercises && (
                <div className="bg-slate-950 border border-cyan-500/30 rounded-3xl p-5 space-y-4 animate-scale-up text-center">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase font-black tracking-widest flex items-center space-x-1.5">
                      <Activity className="w-4 h-4 animate-pulse" />
                      <span>SÉANCE ACTIVE : {selectedEvent.exercises[currentExerciseIdx].name}</span>
                    </span>
                    <span className="text-xs font-mono text-slate-400">Ex {currentExerciseIdx + 1}/{selectedEvent.exercises.length}</span>
                  </div>

                  {/* Timer Display */}
                  <div className="py-6">
                    <span className="block text-4xl font-mono font-black text-white leading-none">
                      {Math.floor(timerSeconds / 60).toString().padStart(2, '0')}:{(timerSeconds % 60).toString().padStart(2, '0')}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mt-2">Chronomètre de l'effort actif</span>
                  </div>

                  {/* Real-time Video Demonstration Simulator */}
                  <div className="text-left my-4">
                    <LiveDemonstrationPlayer 
                      drillName={selectedEvent.exercises[currentExerciseIdx].name} 
                      videoDemoName={selectedEvent.exercises[currentExerciseIdx].videoDemoName || "WallControl"} 
                    />
                  </div>

                  {/* Focus points dynamically shown for active exercise */}
                  <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl text-left space-y-2">
                    <span className="block text-[9px] font-mono text-cyan-400 uppercase font-black">Focus d'exécution :</span>
                    <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                      {selectedEvent.exercises[currentExerciseIdx].focusPoints.map((pt, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Next / Previous exercise controllers */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      disabled={currentExerciseIdx === 0}
                      onClick={() => setCurrentExerciseIdx(prev => prev - 1)}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono rounded-lg disabled:opacity-50"
                    >
                      Précédent
                    </button>
                    <span className="text-xs font-mono text-slate-500">Durée recommandée : {selectedEvent.exercises[currentExerciseIdx].duration} mins</span>
                    <button
                      type="button"
                      disabled={currentExerciseIdx === selectedEvent.exercises.length - 1}
                      onClick={() => setCurrentExerciseIdx(prev => prev + 1)}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono rounded-lg disabled:opacity-50"
                    >
                      Suivant
                    </button>
                  </div>

                  {/* Pain declaration & Workout logger */}
                  <div className="border-t border-slate-900 pt-4 space-y-3 text-left">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold mb-1">Difficulté ressentie</label>
                        <select
                          value={sessionDifficulty}
                          onChange={e => setSessionDifficulty(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-850 text-xs rounded-lg p-2 text-white"
                        >
                          <option value="Facile">🟢 Facile</option>
                          <option value="Correct">🔵 Correct</option>
                          <option value="Difficile">🟡 Difficile</option>
                          <option value="Impossible">🔴 Impossible</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold mb-1">Signaler une douleur</label>
                        <select
                          value={sessionPain}
                          onChange={e => setSessionPain(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-850 text-xs rounded-lg p-2 text-white"
                        >
                          <option value="aucune">Aucune</option>
                          <option value="ischios">Ischio-jambier droit</option>
                          <option value="mollet">Mollet contracté</option>
                          <option value="genou">Douleur rotulienne</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold mb-1">Notes / Remarques d'entraînement</label>
                      <input
                        type="text"
                        placeholder="ex: Bonne sensation sur les contrôles orientés..."
                        value={sessionNotes}
                        onChange={e => setSessionNotes(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-850 text-xs rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <button
                      type="button"
                      onClick={stopWorkoutSession}
                      className="py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-sans font-bold text-xs uppercase rounded-xl transition-all"
                    >
                      Mettre en pause
                    </button>
                    <button
                      type="button"
                      onClick={completeWorkoutSession}
                      className="py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans font-black text-xs uppercase rounded-xl shadow-lg transition-all"
                    >
                      Valider & Terminer ✓
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons at bottom of modal */}
              {!timerActive && (
                <div className="flex space-x-3 pt-4 border-t border-slate-850">
                  {selectedEvent.type === 'telvox' && !selectedEvent.completed && (
                    <button
                      type="button"
                      onClick={startWorkoutSession}
                      className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-sans font-black text-sm uppercase rounded-2xl shadow-lg hover:scale-101 active:scale-99 transition-all cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>Lancer la séance interactive</span>
                    </button>
                  )}

                  {!selectedEvent.completed && (selectedEvent.type !== 'telvox') && (
                    <button
                      type="button"
                      onClick={completeWorkoutSession}
                      className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans font-black text-sm uppercase rounded-2xl shadow-lg hover:scale-101 active:scale-99 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Marquer comme complété</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEvent(null);
                      openCoachDiscussion(`Peux-tu m'en dire plus sur l'activité "${selectedEvent.title}" du calendrier et me donner des conseils spécifiques ?`);
                    }}
                    className="px-4 py-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-2xl text-xs font-mono font-bold tracking-wide"
                  >
                    Discuter de l'activité
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
