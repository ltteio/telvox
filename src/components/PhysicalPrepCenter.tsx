import React, { useState, useEffect } from 'react';
import { PlayerProfile } from '../types';
import { Shield, Dumbbell, Flame, CheckCircle, Clock, Heart, Award, RefreshCw, ChevronRight, Activity, Zap, Play } from 'lucide-react';

interface PhysicalPrepCenterProps {
  player: PlayerProfile;
  setPlayer: React.Dispatch<React.SetStateAction<PlayerProfile>>;
  lastCheckIn: any;
}

interface MuscleExercise {
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  restSeconds: number;
  completedSets?: boolean[];
}

interface PhysicalWorkout {
  id: string;
  name: string;
  category: 'haut' | 'core' | 'bas';
  durationMinutes: number;
  intensity: 'Léger' | 'Modéré' | 'Intense';
  exercises: MuscleExercise[];
}

const PRESET_WORKOUTS: PhysicalWorkout[] = [
  {
    id: "prep_haut",
    name: "Hypertrophie & Puissance - Haut du Corps",
    category: "haut",
    durationMinutes: 40,
    intensity: "Modéré",
    exercises: [
      { name: "Développé couché haltières", muscleGroup: "pectoraux", sets: 4, reps: "10-12 reps", restSeconds: 90 },
      { name: "Tirage buste penché (Rowing)", muscleGroup: "dos", sets: 4, reps: "10 reps", restSeconds: 90 },
      { name: "Développé militaire barre", muscleGroup: "épaules", sets: 3, reps: "12 reps", restSeconds: 75 },
      { name: "Haussements d'épaules (Shrugs)", muscleGroup: "trapèzes", sets: 3, reps: "15 reps", restSeconds: 60 },
      { name: "Curl biceps incliné", muscleGroup: "biceps", sets: 3, reps: "12 reps", restSeconds: 60 },
      { name: "Extensions poulie haute", muscleGroup: "triceps", sets: 3, reps: "12 reps", restSeconds: 60 },
      { name: "Prise marteau & flexions", muscleGroup: "avant-bras", sets: 2, reps: "15 reps", restSeconds: 45 }
    ]
  },
  {
    id: "prep_core",
    name: "Blindage Tronc & Stabilité - Core",
    category: "core",
    durationMinutes: 25,
    intensity: "Léger",
    exercises: [
      { name: "Gainage planche militaire dynamique", muscleGroup: "gainage", sets: 3, reps: "1 min", restSeconds: 60 },
      { name: "Relevés de jambes suspendu", muscleGroup: "abdominaux", sets: 3, reps: "15 reps", restSeconds: 45 },
      { name: "Russian twists lestés", muscleGroup: "obliques", sets: 3, reps: "20 reps", restSeconds: 45 },
      { name: "Extensions lombaires au banc", muscleGroup: "lombaires", sets: 3, reps: "15 reps", restSeconds: 60 }
    ]
  },
  {
    id: "prep_bas",
    name: "Force Explosive & Appuis - Bas du Corps",
    category: "bas",
    durationMinutes: 45,
    intensity: "Intense",
    exercises: [
      { name: "Back Squat barre libre", muscleGroup: "quadriceps", sets: 4, reps: "8 reps", restSeconds: 120 },
      { name: "Soulevé de terre jambes tendues", muscleGroup: "ischios", sets: 4, reps: "10 reps", restSeconds: 90 },
      { name: "Hip Thrust lourd fessier", muscleGroup: "fessiers", sets: 3, reps: "10 reps", restSeconds: 90 },
      { name: "Extensions mollets debout", muscleGroup: "mollets", sets: 3, reps: "15 reps", restSeconds: 60 },
      { name: "Adductions poulie basse", muscleGroup: "adducteurs", sets: 3, reps: "12 reps", restSeconds: 60 }
    ]
  }
];

export default function PhysicalPrepCenter({ player, setPlayer, lastCheckIn }: PhysicalPrepCenterProps) {
  const [workouts, setWorkouts] = useState<PhysicalWorkout[]>(PRESET_WORKOUTS);
  const [activeWorkout, setActiveWorkout] = useState<PhysicalWorkout | null>(null);
  const [exerciseStates, setExerciseStates] = useState<MuscleExercise[]>([]);
  const [completedWorkout, setCompletedWorkout] = useState<boolean>(false);
  
  // Overtraining Protection Calculator
  const recoveryPercentage = lastCheckIn?.recoveryPercentage ?? 91;
  const isHighRisk = recoveryPercentage < 75;

  const handleStartWorkout = (workout: PhysicalWorkout) => {
    // Automatically apply AI Overtraining adjustments!
    let adjustedExercises = workout.exercises.map(ex => {
      let finalSets = ex.sets;
      let finalRest = ex.restSeconds;
      
      if (isHighRisk) {
        // Drop sets and increase rest dynamically to prevent injuries
        finalSets = Math.max(2, ex.sets - 1);
        finalRest = ex.restSeconds + 30;
      }

      return {
        ...ex,
        sets: finalSets,
        restSeconds: finalRest,
        completedSets: Array(finalSets).fill(false)
      };
    });

    setActiveWorkout({
      ...workout,
      exercises: adjustedExercises
    });
    setExerciseStates(adjustedExercises);
    setCompletedWorkout(false);
  };

  const toggleSetCompletion = (exIdx: number, setIdx: number) => {
    setExerciseStates(prev => prev.map((ex, idx) => {
      if (idx === exIdx) {
        const sets = [...(ex.completedSets || [])];
        sets[setIdx] = !sets[setIdx];
        return { ...ex, completedSets: sets };
      }
      return ex;
    }));
  };

  const handleFinishWorkout = () => {
    if (!activeWorkout) return;

    // Grant secure rewards
    const xpGain = activeWorkout.intensity === 'Intense' ? 350 : 200;
    const coinsGain = activeWorkout.intensity === 'Intense' ? 80 : 50;

    setPlayer(prev => ({
      ...prev,
      xp: prev.xp + xpGain,
      coins: prev.coins + coinsGain,
      level: prev.xp + xpGain >= prev.xpNextLevel ? prev.level + 1 : prev.level,
      xpNextLevel: prev.xp + xpGain >= prev.xpNextLevel ? prev.xpNextLevel + 1000 : prev.xpNextLevel,
      progressScore: Math.min(1000, prev.progressScore + 20)
    }));

    setCompletedWorkout(true);
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-100">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h2 className="text-2xl font-sans font-black text-white uppercase tracking-wide">Préparation Physique</h2>
            <p className="text-xs text-slate-400">Renforce ton physique avec un équilibrage intelligent anti-surentraînement.</p>
          </div>
        </div>
      </div>

      {/* AI Overtraining Alert Ribbon */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs ${
        isHighRisk 
          ? 'bg-rose-500/10 border-rose-500/25 text-rose-400' 
          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
      }`}>
        <div className="flex items-start md:items-center space-x-3">
          <span className={`p-2 rounded-xl shrink-0 ${isHighRisk ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400 animate-pulse'}`}>
            <Activity className="w-4 h-4" />
          </span>
          <div>
            <span className="font-bold text-white text-sm">Contrôleur de Charge Physio IA</span>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              {isHighRisk 
                ? `Vigilance Overtraining Active (Recup: ${recoveryPercentage}%). L'IA a automatiquement réduit les séries de 1 bloc et rallongé les récupérations.`
                : `Équilibre Musculaire Optimal (Recup: ${recoveryPercentage}%). Ton corps est prêt à encaisser la charge physique nominale.`
              }
            </p>
          </div>
        </div>
        <div className="text-[10px] font-mono text-slate-500 uppercase shrink-0 tracking-wider">
          PROTECTION ACTIVE
        </div>
      </div>

      {!activeWorkout ? (
        // Workout List Selection View
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {workouts.map(workout => (
            <div key={workout.id} className="bg-slate-900 border border-slate-850 rounded-2xl p-6 hover:border-slate-800 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="bg-emerald-500/10 text-emerald-400 font-bold px-2.5 py-1 rounded-md uppercase">{workout.category} du corps</span>
                  <span className="text-slate-500 font-bold">{workout.durationMinutes} MINS</span>
                </div>
                <h3 className="text-lg font-sans font-black text-white leading-snug">{workout.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Travail ciblé sur l'hypertrophie, la puissance et la rééducation des articulations essentielles du footballeur.
                </p>
                <div className="pt-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">Groupes musculaires visés :</span>
                  <div className="flex flex-wrap gap-1.5">
                    {workout.exercises.map((e, i) => (
                      <span key={i} className="text-[9px] font-mono font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-850/60 text-slate-400">
                        {e.muscleGroup}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleStartWorkout(workout)}
                className="w-full py-3 bg-slate-950 border border-slate-850 hover:border-emerald-500/40 text-white font-sans font-black uppercase text-xs tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>Démarrer le bloc</span>
                <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        // Active Workout Exercising Panel
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
          
          <div className="flex justify-between items-start border-b border-slate-850 pb-4">
            <div>
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest block">Préparation Active</span>
              <h3 className="text-xl font-sans font-black text-white">{activeWorkout.name}</h3>
            </div>
            <button
              onClick={() => setActiveWorkout(null)}
              className="text-xs font-mono text-slate-500 hover:text-white underline cursor-pointer"
            >
              Retour à la liste
            </button>
          </div>

          {!completedWorkout ? (
            <div className="space-y-6">
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block">Exercices & Séries</span>
              
              <div className="space-y-4">
                {exerciseStates.map((ex, exIdx) => (
                  <div key={exIdx} className="bg-slate-950/40 border border-slate-850 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-sans font-bold text-sm text-white">{ex.name}</h4>
                        <span className="text-[9px] font-mono font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          {ex.muscleGroup}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono">
                        Objectif : {ex.reps} • {ex.restSeconds}s de repos
                      </p>
                    </div>

                    {/* Interactive Sets Checkboxes */}
                    <div className="flex items-center space-x-2.5">
                      <span className="text-[10px] font-mono text-slate-500 uppercase mr-1">Séries complétées :</span>
                      {ex.completedSets?.map((completed, setIdx) => (
                        <button
                          key={setIdx}
                          onClick={() => toggleSetCompletion(exIdx, setIdx)}
                          className={`w-8 h-8 rounded-lg border font-mono text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                            completed 
                              ? 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-md' 
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          S{setIdx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleFinishWorkout}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-sans font-black uppercase text-xs tracking-wider rounded-xl shadow-lg shadow-emerald-500/10 cursor-pointer transition-all text-center block"
              >
                Terminer la séance physique
              </button>
            </div>
          ) : (
            // Success Complete Screen
            <div className="text-center py-8 space-y-5 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow animate-pulse">
                <Award className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-xl font-sans font-black text-white uppercase tracking-wider">Séance Complétée !</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Excellent travail physique, {player.firstName || 'Joueur'}. Tes muscles se renforcent et s'adaptent pour maximiser ton explosivité de sprint et ta tenue au duel.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto text-center font-mono text-xs">
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                  <span className="text-slate-500 block text-[9px] uppercase">RÉCOMPENSE</span>
                  <span className="text-emerald-400 font-bold block mt-0.5">+{activeWorkout.intensity === 'Intense' ? 350 : 200} XP</span>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                  <span className="text-slate-500 block text-[9px] uppercase">COINS VX</span>
                  <span className="text-yellow-400 font-bold block mt-0.5">+{activeWorkout.intensity === 'Intense' ? 80 : 50} VX</span>
                </div>
              </div>

              <button
                onClick={() => setActiveWorkout(null)}
                className="px-6 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer inline-block"
              >
                Retour aux séances musculaires
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
