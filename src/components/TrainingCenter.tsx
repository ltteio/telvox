import React, { useState, useEffect, useRef } from 'react';
import { PlayerProfile, Session, Exercise, SkillCategory } from '../types';
import { MOCK_EXERCISES_LIBRARY, INITIAL_SESSIONS } from '../mockData';
import { Dumbbell, Search, Sparkles, Play, Award, Coins, Compass, CheckCircle2, ChevronRight, X, Clock, HelpCircle, AlertOctagon, RefreshCw } from 'lucide-react';
import LiveDemonstrationPlayer from './LiveDemonstrationPlayer';

interface TrainingCenterProps {
  player: PlayerProfile;
  setPlayer: React.Dispatch<React.SetStateAction<PlayerProfile>>;
  sessions: Session[];
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
  selectedSession: Session | null;
  setSelectedSession: (session: Session | null) => void;
  skills: any[];
  setSkills: React.Dispatch<React.SetStateAction<any[]>>;
  decisionState?: any;
}

export default function TrainingCenter({
  player,
  setPlayer,
  sessions,
  setSessions,
  selectedSession,
  setSelectedSession,
  skills,
  setSkills,
  decisionState
}: TrainingCenterProps) {
  const [trainingMode, setTrainingMode] = useState<'go' | 'explorer' | 'libre'>('go');
  const [explorerSearch, setExplorerSearch] = useState('');
  const [explorerFilterCategory, setExplorerFilterCategory] = useState<SkillCategory | 'All'>('all' as any);
  const [expandedDemoDrillId, setExpandedDemoDrillId] = useState<string | null>(null);

  // Active workout execution states
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [workoutCompleteData, setWorkoutCompleteData] = useState<{ xp: number; coins: number; upgrades: { name: string; val: number }[] } | null>(null);

  // Real-time AI Adaptations states
  const [adaptationMessage, setAdaptationMessage] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic central engine exercises mapping
  const currentExercises = (() => {
    if (!selectedSession) return [];
    if (!decisionState?.adjustments?.training?.exerciseReplacements || decisionState.adjustments.training.exerciseReplacements.length === 0) {
      return selectedSession.exercises;
    }
    const reps = decisionState.adjustments.training.exerciseReplacements;
    return selectedSession.exercises.map((ex: any) => {
      const found = reps.find((r: any) => r.originalId === ex.id);
      if (found) {
        return {
          ...ex,
          name: found.name,
          duration: found.duration,
          intensity: found.intensity,
          description: found.description,
          focusPoints: found.focusPoints
        };
      }
      return ex;
    });
  })();

  const activeExercise = currentExercises[activeExerciseIndex];

  // Stopwatch/timer effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  // Explorer drills triggering custom session
  const startSingleDrill = (drill: Exercise) => {
    const singleSession: Session = {
      id: "explorer_" + drill.id,
      name: `Séance Focus - ${drill.name}`,
      duration: drill.duration,
      intensity: drill.intensity,
      category: "Technique",
      completed: false,
      exercises: [drill],
      adjustmentNote: "Généré via le mode d'exploration Telvox."
    };
    setSelectedSession(singleSession);
    setActiveExerciseIndex(0);
    setTimerSeconds(drill.duration * 30); // 30s per drill minute simulated
    setIsTimerRunning(false);
    setAdaptationMessage(null);
    setWorkoutCompleteData(null);
  };

  // GO Default Workout Launch
  const startGoSession = () => {
    const defaultSession = sessions.find(s => !s.completed) || sessions[0];
    if (defaultSession) {
      setSelectedSession(defaultSession);
      setActiveExerciseIndex(0);
      setTimerSeconds(60);
      setIsTimerRunning(false);
      setAdaptationMessage(null);
      setWorkoutCompleteData(null);
    }
  };

  // Chapter 8: Live AI Adaptations (Real-time adjustments)
  const handleAIAdaptation = (reason: 'exhausted' | 'pain') => {
    if (!selectedSession || !activeExercise) return;

    if (reason === 'exhausted') {
      setTimerSeconds((prev) => prev + 45); // Extends resting/duration period
      setAdaptationMessage("Progress Engine: 'Régulation en temps réel détectée. Séance raccourcie, repos allongé de +45s pour optimiser la régénération cardiaque.'");
    } else if (reason === 'pain') {
      // Dynamically replaces the active exercise with a soft mobility movement (Exercise 5 in Library)
      const mobilityExercise = MOCK_EXERCISES_LIBRARY[4]; // Plank Flow
      const updatedExercises = [...selectedSession.exercises];
      updatedExercises[activeExerciseIndex] = mobilityExercise;

      setSelectedSession({
        ...selectedSession,
        exercises: updatedExercises,
        adjustmentNote: "Ajusté en temps réel : Exercice explosif remplacé par du gainage pour préserver ton intégrité articulaire."
      });
      setTimerSeconds(60);
      setAdaptationMessage(`Progress Engine: 'Alerte douleur prise en compte. Remplacement immédiat par l'exercice à faible impact : "${mobilityExercise.name}" pour éviter la surcharge.'`);
    }
  };

  // Finish Workout: triggers core rewards loop
  const finishWorkout = () => {
    if (!selectedSession) return;

    // Set complete
    setSessions(prev => prev.map(s => {
      if (s.id === selectedSession.id) {
        return { ...s, completed: true };
      }
      return s;
    }));

    // Generate attribute upgrades
    const earnedXp = selectedSession.intensity === 'Élevée' ? 450 : 250;
    const earnedCoins = selectedSession.intensity === 'Élevée' ? 120 : 60;

    // Upgrading first touch or stamina in skills
    const upgrades: { name: string; val: number }[] = [];
    if (selectedSession.category === 'Technique') {
      upgrades.push({ name: 'Contrôle orienté', val: 0.8 }, { name: 'Première touche', val: 0.4 });
    } else {
      upgrades.push({ name: 'Explosivité d\'appui', val: 0.6 }, { name: 'Accélération', val: 0.2 });
    }

    // Mutate state of player coins and xp
    setPlayer(prev => ({
      ...prev,
      xp: prev.xp + earnedXp,
      coins: prev.coins + earnedCoins,
      progressScore: Math.min(1000, prev.progressScore + 22),
      legacyScore: Math.min(1000, prev.legacyScore + 4)
    }));

    // Mutate state of skills
    setSkills(prev => prev.map(s => {
      const matchUpgrade = upgrades.find(up => up.name === s.name);
      if (matchUpgrade) {
        return { ...s, value: Math.min(99, parseFloat((s.value + matchUpgrade.val).toFixed(1))) };
      }
      return s;
    }));

    setWorkoutCompleteData({
      xp: earnedXp,
      coins: earnedCoins,
      upgrades
    });
  };

  // Close complete overlay
  const closeCompletedSession = () => {
    setSelectedSession(null);
    setWorkoutCompleteData(null);
  };

  // Filtering Explorer lists
  const explorerDrills = MOCK_EXERCISES_LIBRARY.filter(drill => {
    const matchesSearch = drill.name.toLowerCase().includes(explorerSearch.toLowerCase()) || 
                          drill.description.toLowerCase().includes(explorerSearch.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in text-slate-100">
      
      {/* Active Workout Overlay (Live Screen - Chapter 8) */}
      {selectedSession && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
          
          <div className="flex justify-between items-center pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest block">Séance Active</span>
              <h2 className="text-xl sm:text-2xl font-sans font-black text-white">{selectedSession.name}</h2>
            </div>
            <button 
              onClick={() => setSelectedSession(null)}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer transition-colors"
            >
              <X className="w-5 h-5 text-slate-400 hover:text-white" />
            </button>
          </div>

          {decisionState?.adjustments?.training && (
            <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/25 p-3.5 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <span className="p-1 bg-emerald-500/20 text-emerald-400 rounded-md animate-pulse">✨</span>
                <div>
                  <span className="font-bold text-white font-sans">Ajustement Cérébral IA Actif</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Séance pilotée par le Cerveau Central. Intensité : <span className="text-emerald-400 font-bold">{decisionState.adjustments.training.intensityOverride}</span> • Difficulté : <span className="text-cyan-400 font-bold">{decisionState.adjustments.training.difficultyLevel}</span>
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-mono text-slate-500 hidden sm:inline">PILOTING ACTIVE</span>
            </div>
          )}

          {!workoutCompleteData ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Exercise Animation & Controls Column */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Live Demonstration Video Simulator & Interactive Pitch */}
                <LiveDemonstrationPlayer 
                  drillName={activeExercise?.name || "Démonstration Tactique"} 
                  videoDemoName={activeExercise?.videoDemoName || "WallControl"} 
                />

                {/* Progress Indicators */}
                <div className="flex justify-between items-center text-xs font-mono">
                  <span>Exercice {activeExerciseIndex + 1} sur {currentExercises.length}</span>
                  <div className="flex space-x-1.5">
                    {currentExercises.map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-4 h-1.5 rounded-full transition-colors ${
                          i === activeExerciseIndex 
                            ? 'bg-emerald-400' 
                            : i < activeExerciseIndex ? 'bg-emerald-800' : 'bg-slate-800'
                        }`} 
                      />
                    ))}
                  </div>
                </div>

                {/* Timer Control Widget */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl font-mono font-black text-white">
                      {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
                    </div>
                    <span className="text-xs text-slate-400 font-mono">CHRONOMÈTRE DE SÉRIE</span>
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className="flex-1 sm:flex-initial px-6 py-2.5 bg-emerald-500 text-slate-950 font-sans font-bold text-xs rounded-xl hover:bg-emerald-400 cursor-pointer active:scale-95 transition-all"
                    >
                      {isTimerRunning ? 'PAUSE' : 'LANCER'}
                    </button>
                    <button
                      onClick={() => setTimerSeconds(60)}
                      className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer transition-colors"
                      title="Réinitialiser"
                    >
                      <RefreshCw className="w-4 h-4 text-slate-300" />
                    </button>
                  </div>
                </div>

                {/* Live Direct Coaching Interventions */}
                <div className="space-y-3">
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block">Adaptations en temps réel</span>
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <button 
                      onClick={() => handleAIAdaptation('exhausted')}
                      className="p-3 bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center space-x-2 cursor-pointer transition-all"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Fatigué / Trop long</span>
                    </button>
                    <button 
                      onClick={() => handleAIAdaptation('pain')}
                      className="p-3 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center space-x-2 cursor-pointer transition-all"
                    >
                      <AlertOctagon className="w-4 h-4" />
                      <span>J'ai une Douleur</span>
                    </button>
                  </div>

                  {adaptationMessage && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-xs text-emerald-400 leading-relaxed font-mono">
                      {adaptationMessage}
                    </div>
                  )}
                </div>

              </div>

              {/* Focus Points and Details Column */}
              <div className="lg:col-span-5 space-y-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Description de l'exercice</span>
                  <h3 className="text-lg font-bold text-white font-sans">{activeExercise?.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{activeExercise?.description}</p>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-mono text-slate-500 uppercase block">Cible d'effort</span>
                  <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/80 text-xs flex justify-between font-mono text-slate-300">
                    <span>Intensité : <span className="text-cyan-400 font-bold">{activeExercise?.intensity}</span></span>
                    <span>Durée : <span className="text-white font-bold">{activeExercise?.duration} Mins</span></span>
                  </div>
                  {activeExercise?.targetReps && (
                    <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/80 text-xs font-mono text-yellow-400 text-center font-bold">
                      Cible : {activeExercise.targetReps}
                    </div>
                  )}
                </div>

                {/* Focus points & errors */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wide block">Points d'attention (Moteur)</span>
                    <ul className="space-y-1.5 text-xs text-slate-300 list-inside list-disc">
                      {activeExercise?.focusPoints.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-mono text-rose-400 font-bold uppercase tracking-wide block">Erreurs Fréquentes</span>
                    <ul className="space-y-1.5 text-xs text-slate-300 list-inside list-disc">
                      {activeExercise?.commonErrors.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  </div>
                </div>

                {/* Progression buttons */}
                <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between gap-4">
                  {activeExerciseIndex > 0 ? (
                    <button
                      onClick={() => {
                        setActiveExerciseIndex(prev => prev - 1);
                        setAdaptationMessage(null);
                      }}
                      className="px-4 py-2.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-mono cursor-pointer"
                    >
                      PRÉCÉDENT
                    </button>
                  ) : <div />}

                  {activeExerciseIndex < selectedSession.exercises.length - 1 ? (
                    <button
                      onClick={() => {
                        setActiveExerciseIndex(prev => prev + 1);
                        setAdaptationMessage(null);
                      }}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-mono flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>EXERCICE SUIVANT</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={finishWorkout}
                      className="px-6 py-2.5 bg-emerald-500 text-slate-950 font-sans font-black tracking-wide text-xs rounded-xl hover:bg-emerald-400 cursor-pointer shadow-lg shadow-emerald-500/20"
                    >
                      TERMINER LA SÉANCE
                    </button>
                  )}
                </div>

              </div>

            </div>
          ) : (
            /* Workout Complete Rewards Screen - Chapter 8 Completion */
            <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center animate-scale-up">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Award className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-sans font-black text-white">SÉANCE REÇUE ET ANALYSÉE !</h3>
                <p className="text-slate-400 text-sm max-w-sm">
                  Félicitations {player.firstName || 'Joueur'}, ton effort a été enregistré. Le Progress Engine a mis à jour ton Player Twin.
                </p>
              </div>

              {/* Rewards loop badges */}
              <div className="grid grid-cols-2 gap-4 w-full max-w-xs pt-4 text-xs font-mono">
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800 text-center">
                  <span className="text-slate-500 block text-[10px] uppercase">EXPÉRIENCE</span>
                  <span className="text-lg font-black text-white">+{workoutCompleteData.xp} XP</span>
                </div>
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800 text-center">
                  <span className="text-slate-500 block text-[10px] uppercase">VX COINS GAGNÉS</span>
                  <span className="text-lg font-black text-yellow-400">+{workoutCompleteData.coins} VX</span>
                </div>
              </div>

              {/* Attribute gains updates representation */}
              <div className="w-full max-w-xs space-y-2 bg-slate-950/20 p-4 rounded-2xl border border-slate-850 text-left">
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Mises à jour des attributs</span>
                {workoutCompleteData.upgrades.map((u, i) => (
                  <div key={i} className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300">{u.name}</span>
                    <span className="text-emerald-400 font-bold">+{u.val}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={closeCompletedSession}
                className="mt-6 px-8 py-3 bg-emerald-500 text-slate-950 font-sans font-black tracking-wide text-xs rounded-xl hover:bg-emerald-400 active:scale-95 transition-all cursor-pointer"
              >
                RETOURNER AU MENU
              </button>
            </div>
          )}

        </div>
      )}

      {/* Main Mode Selection Screen */}
      {!selectedSession && (
        <div className="space-y-6">
          
          {/* Header & Modes Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-sans font-black text-white tracking-wide">TRAINING CENTER</h2>
              <p className="text-xs text-slate-400">
                Choisis un mode pour démarrer ton entraînement intelligent.
              </p>
            </div>

            <div className="flex space-x-1 border border-slate-800 bg-slate-950/40 p-1 rounded-xl">
              {[
                { id: 'go', label: 'IA GO', icon: Sparkles },
                { id: 'explorer', label: 'Explorer', icon: Search },
                { id: 'libre', label: 'Libre', icon: Compass }
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setTrainingMode(m.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center space-x-2 cursor-pointer ${
                      trainingMode === m.id 
                        ? 'bg-emerald-500 text-slate-950 font-bold' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 1. GO MODE (Default, fully AI-generated) */}
          {trainingMode === 'go' && (
            sessions.filter(s => !s.completed).length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 max-w-lg mx-auto shadow-xl">
                <Dumbbell className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-xl font-sans font-black text-white">AUCUNE SÉANCE DISPONIBLE</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ton programme d'entraînement de la journée est complété ou vide. Tu peux explorer la bibliothèque pour lancer un drill spécifique, ou charger le programme recommandé par Telvox.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <button
                    onClick={() => setSessions(INITIAL_SESSIONS)}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Charger le programme recommandé</span>
                  </button>
                  <button
                    onClick={() => setTrainingMode('explorer')}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
                  >
                    Explorer la bibliothèque
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -mr-12 -mt-12" />
                
                <div className="space-y-2 max-w-xl">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest block">Recommandation du jour (Progress Engine)</span>
                  <h3 className="text-2xl font-sans font-black text-white">SÉANCE INTELLIGENTE SUR MESURE</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Le moteur de carrière a analysé tes données physiques de la semaine pour te compiler la meilleure séance sur mesure possible.
                  </p>
                </div>

                <div className="p-5 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-slate-100 font-sans">
                      {sessions.find(s => !s.completed)?.name || "Séance sur mesure"}
                    </h4>
                    <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400">
                      <span>Durée : <span className="text-white font-semibold">{sessions.find(s => !s.completed)?.duration || 30} Mins</span></span>
                      <span>Intensité : <span className="text-emerald-400 font-semibold">{sessions.find(s => !s.completed)?.intensity || "Élevée"}</span></span>
                      <span>Drills : <span className="text-white font-semibold">{sessions.find(s => !s.completed)?.exercises.length || 0} Exercices</span></span>
                    </div>
                  </div>

                  <button
                    onClick={startGoSession}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans font-black tracking-wide text-xs rounded-xl shadow-lg shadow-emerald-500/10 cursor-pointer flex items-center space-x-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>DÉMARRER LA SÉANCE GO</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block">Exercices au programme</span>
                  <div className="space-y-2.5">
                    {sessions.find(s => !s.completed)?.exercises.map((ex, i) => (
                      <div key={ex.id} className="bg-slate-950/20 p-4 rounded-xl border border-slate-850 flex justify-between items-center text-xs">
                        <div>
                          <span className="text-slate-500 font-mono">0{i+1}.</span>
                          <span className="text-slate-200 font-bold ml-2 font-sans">{ex.name}</span>
                        </div>
                        <span className="text-slate-400 font-mono">{ex.duration} Mins</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          )}

          {/* 2. EXPLORER MODE */}
          {trainingMode === 'explorer' && (
            <div className="space-y-6">
              
              {/* Search bar */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col sm:flex-row gap-4 shadow-md">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute top-3.5 left-3.5" />
                  <input
                    type="text"
                    value={explorerSearch}
                    onChange={(e) => setExplorerSearch(e.target.value)}
                    placeholder="Rechercher un exercice (ex: contrôle, sprint, scan...)"
                    className="w-full bg-slate-950 text-slate-200 text-xs py-3 pl-10 pr-4 border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Grid lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {explorerDrills.map((drill) => (
                  <div key={drill.id} className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-500 uppercase">Durée : {drill.duration} mins</span>
                        <span className="p-1 bg-cyan-500/10 text-cyan-400 rounded-lg font-bold">{drill.intensity}</span>
                      </div>
                      <h4 className="font-bold text-white text-base">{drill.name}</h4>
                      <p className="text-slate-400 text-xs leading-relaxed mb-2">{drill.description}</p>
                      
                      {/* Inline Live Video Simulator */}
                      {expandedDemoDrillId === drill.id && (
                        <div className="mt-3 border-t border-slate-800/80 pt-3">
                          <LiveDemonstrationPlayer 
                            drillName={drill.name} 
                            videoDemoName={drill.videoDemoName} 
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/40 flex justify-between items-center gap-2">
                      <button
                        onClick={() => setExpandedDemoDrillId(prev => prev === drill.id ? null : drill.id)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all ${
                          expandedDemoDrillId === drill.id 
                            ? 'bg-cyan-500 text-slate-950 font-black' 
                            : 'bg-slate-850 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {expandedDemoDrillId === drill.id ? 'MASQUER DÉMO' : '🖥️ VOIR DÉMO DIRECT'}
                      </button>
                      <button
                        onClick={() => startSingleDrill(drill)}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans text-xs font-black rounded-xl cursor-pointer transition-colors"
                      >
                        LANCER DRILL
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. FREE MODE */}
          {trainingMode === 'libre' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-xl">
              <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/5">
                <Compass className="w-6 h-6" />
              </div>
              <div className="space-y-2 max-w-sm mx-auto">
                <h3 className="text-xl font-sans font-black text-white">MODE ENTRAÎNEMENT LIBRE</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Tu as un entraînement en club ou tu veux travailler à ton rythme sans chronomètre imposé ? Active le mode libre. Telvox observera tes efforts et les analysera après coup.
                </p>
              </div>

              <button
                onClick={() => {
                  const freeSession: Session = {
                    id: "free_workout",
                    name: "Entraînement Libre Observé",
                    duration: 45,
                    intensity: "Modérée",
                    category: "Football IQ",
                    completed: false,
                    exercises: [MOCK_EXERCISES_LIBRARY[0]], // fallback placeholder
                    adjustmentNote: "Mode d'observation libre activé."
                  };
                  setSelectedSession(freeSession);
                }}
                className="px-6 py-3 bg-cyan-500 text-slate-950 font-sans font-black tracking-wide text-xs rounded-xl shadow-lg shadow-cyan-500/10 hover:bg-cyan-400 transition-all cursor-pointer"
              >
                ACTIVER LE MODE LIBRE
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
