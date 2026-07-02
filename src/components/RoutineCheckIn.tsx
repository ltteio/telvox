import React, { useState, useEffect } from 'react';
import { PlayerProfile } from '../types';
import { 
  Sun, Moon, Sparkles, Send, Coffee, Brain, Activity, 
  ChevronRight, Award, Flame, RefreshCw, Star, ArrowRight, ShieldCheck
} from 'lucide-react';

interface RoutineCheckInProps {
  player: PlayerProfile;
  setPlayer: React.Dispatch<React.SetStateAction<PlayerProfile>>;
  setLastCheckIn?: (val: any) => void;
}

interface RoutineAnswer {
  question: string;
  answer: string;
}

export default function RoutineCheckIn({ player, setPlayer, setLastCheckIn }: RoutineCheckInProps) {
  const [activeRoutine, setActiveRoutine] = useState<'morning' | 'evening'>('morning');
  const [currentStep, setCurrentStep] = useState<number>(0); // 0: start, 1-3: questions, 4: final analysis
  const [loading, setLoading] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [answers, setAnswers] = useState<RoutineAnswer[]>([]);
  const [playerInput, setPlayerInput] = useState<string>('');
  
  // History of completed check-ins during this session (for instant feedback/visual state)
  const [morningCompleted, setMorningCompleted] = useState<boolean>(false);
  const [eveningCompleted, setEveningCompleted] = useState<boolean>(false);
  
  // Bilan final returned from AI
  const [finalReport, setFinalReport] = useState<{
    analysis: string;
    intensityZoneRecommendation: string;
    recoveryPercentage: number;
    fatigueLevel: string;
    xpReward: number;
    sleepTip?: string;
    dayTip?: string;
  } | null>(null);

  // Initialize first question
  const fetchNextQuestion = async (updatedAnswers: RoutineAnswer[], step: number) => {
    setLoading(true);
    try {
      const response = await fetch('/api/coach/routine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routine: activeRoutine,
          answers: updatedAnswers,
          playerProfile: player,
          currentStep: step
        })
      });
      const data = await response.json();
      
      if (data.isFinal) {
        setFinalReport(data);
        setCurrentStep(4);

        if (setLastCheckIn) {
          setLastCheckIn({
            recoveryPercentage: data.recoveryPercentage || 91,
            fatigueLevel: (data.fatigueLevel || 'FAIBLE') as any,
            sleepHours: activeRoutine === 'morning' ? 8 : 8,
            soreness: data.analysis || "Aucune",
            injuryStatus: "Ok"
          });
        }
        
        // Grant Rewards to player profile securely!
        const xpGain = data.xpReward || 50;
        setPlayer(prev => {
          let newXp = prev.xp + xpGain;
          let newLevel = prev.level;
          let nextLevelThreshold = prev.xpNextLevel;
          let coinsReward = 15; // bonus cash
          
          if (newXp >= nextLevelThreshold) {
            newXp -= nextLevelThreshold;
            newLevel += 1;
            nextLevelThreshold = Math.round(nextLevelThreshold * 1.2);
            coinsReward += 50; // level up cash bonus!
          }
          
          return {
            ...prev,
            xp: newXp,
            level: newLevel,
            xpNextLevel: nextLevelThreshold,
            coins: prev.coins + coinsReward,
            progressScore: Math.min(1000, Math.max(100, prev.progressScore + (activeRoutine === 'morning' ? 12 : 18)))
          };
        });

        if (activeRoutine === 'morning') {
          setMorningCompleted(true);
        } else {
          setEveningCompleted(true);
        }
      } else {
        setCurrentQuestion(data.nextQuestion);
        setCurrentStep(step + 1);
      }
    } catch (err) {
      console.error(err);
      // Fallback
      setCurrentQuestion(
        activeRoutine === 'morning' 
          ? "Comment te sens-tu mentalement pour la séance d'aujourd'hui ?" 
          : "Quelle est ta principale tension physique à relâcher ce soir ?"
      );
      setCurrentStep(step + 1);
    } finally {
      setLoading(false);
    }
  };

  const startCheckIn = () => {
    setAnswers([]);
    setPlayerInput('');
    setFinalReport(null);
    fetchNextQuestion([], 0);
  };

  const submitAnswer = () => {
    if (!playerInput.trim()) return;
    
    const newAnswer: RoutineAnswer = {
      question: currentQuestion,
      answer: playerInput
    };
    
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    setPlayerInput('');
    
    fetchNextQuestion(updatedAnswers, currentStep);
  };

  const resetRoutine = () => {
    setCurrentStep(0);
    setAnswers([]);
    setPlayerInput('');
    setFinalReport(null);
  };

  return (
    <div id="routine-checkin" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-slate-100">
      
      {/* Decorative accent background glows matching the routine type */}
      {activeRoutine === 'morning' ? (
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      ) : (
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      )}

      {/* Routine Mode Switcher tabs */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-2.5">
          <Brain className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-lg font-sans font-black text-white tracking-wide uppercase">Routines Coach IA</h2>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Analyse biométrique en temps réel</span>
          </div>
        </div>

        {currentStep === 0 && (
          <div className="flex space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveRoutine('morning')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all uppercase ${activeRoutine === 'morning' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Matin</span>
            </button>
            <button
              onClick={() => setActiveRoutine('evening')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all uppercase ${activeRoutine === 'evening' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Soir</span>
            </button>
          </div>
        )}
      </div>

      {/* Interactive Questionnaire flow states */}
      {currentStep === 0 ? (
        // STATE 0: Welcome / Launcher Screen
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${activeRoutine === 'morning' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'}`}>
              {activeRoutine === 'morning' ? <Sun className="w-8 h-8" /> : <Moon className="w-8 h-8" />}
            </div>
            <div className="space-y-1.5 text-center sm:text-left">
              <span className={`text-[10px] font-mono uppercase tracking-widest font-black ${activeRoutine === 'morning' ? 'text-emerald-400' : 'text-cyan-400'}`}>
                {activeRoutine === 'morning' ? "Protocole d'Éveil de l'Athlète" : "Protocole de Fermeture de l'Athlète"}
              </span>
              <h3 className="text-base font-bold text-white">
                {activeRoutine === 'morning' 
                  ? "Entretien du Matin : Forme & Charge d'Entraînement" 
                  : "Entretien du Soir : Récupération & Sommeil Clinique"
                }
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xl">
                {activeRoutine === 'morning'
                  ? "Chaque matin, réponds brièvement à 3 questions du Coach IA pour évaluer ton sommeil, tes raideurs et ton mental. Le Progress Engine adaptera dynamiquement l'intensité recommandée de tes entraînements de la journée."
                  : "Chaque soir avant de te coucher, le Coach IA évalue tes tensions musculaires, ton alimentation et ta fatigue. Cela nous permet de concevoir ton protocole de régénération nocturne et d'apprendre à te connaître en direct."
                }
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${morningCompleted ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                <span className="text-[10px] font-mono text-slate-500 uppercase">Matin : {morningCompleted ? 'COMPLÉTÉ' : 'À FAIRE'}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${eveningCompleted ? 'bg-cyan-500' : 'bg-slate-800'}`} />
                <span className="text-[10px] font-mono text-slate-500 uppercase">Soir : {eveningCompleted ? 'COMPLÉTÉ' : 'À FAIRE'}</span>
              </div>
            </div>

            <button
              onClick={startCheckIn}
              className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-sans font-black text-sm tracking-wide transition-all duration-200 uppercase flex items-center justify-center space-x-2 cursor-pointer ${
                activeRoutine === 'morning' 
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/15 hover:bg-emerald-400' 
                  : 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/15 hover:bg-cyan-400'
              }`}
            >
              <span>DÉMARRER L'ENTRETIEN</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : currentStep < 4 ? (
        // STATE 1-3: Active interactive chatbot questionnaire
        <div className="space-y-6">
          
          {/* Progress bar steps dots */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Progrès de l'entretien : Étape {currentStep}/3</span>
            <div className="flex space-x-1">
              {[1, 2, 3].map(step => (
                <div 
                  key={step} 
                  className={`w-8 h-1.5 rounded-full transition-all duration-300 ${
                    currentStep === step 
                      ? activeRoutine === 'morning' ? 'bg-emerald-400' : 'bg-cyan-400' 
                      : currentStep > step 
                        ? activeRoutine === 'morning' ? 'bg-emerald-600/50' : 'bg-cyan-600/50' 
                        : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Chatbubble Container */}
          <div className="space-y-4">
            
            {/* Coach interactive question */}
            <div className="flex items-start space-x-3.5">
              <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${activeRoutine === 'morning' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'}`}>
                <Brain className="w-5 h-5 animate-pulse" />
              </div>
              <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-r-2xl rounded-bl-2xl max-w-xl text-sm leading-relaxed shadow-sm relative">
                <span className="block text-[8px] font-mono text-slate-500 uppercase font-bold tracking-wider mb-1">Coach IA / Progress Engine</span>
                {loading ? (
                  <div className="flex items-center space-x-2 py-1">
                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                ) : (
                  <p className="text-slate-100 font-medium">{currentQuestion}</p>
                )}
              </div>
            </div>

            {/* Answer History already provided */}
            {answers.length > 0 && (
              <div className="pl-14 space-y-3.5 pt-2 border-l border-slate-850">
                {answers.map((ans, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <span className="block text-[8px] font-mono text-slate-500 uppercase">R{idx + 1} : {ans.question}</span>
                    <p className="bg-slate-900 border border-slate-800 px-3.5 py-2.5 rounded-xl text-xs font-mono text-emerald-400 max-w-lg">
                      "{ans.answer}"
                    </p>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Active input bar */}
          <div className="pt-4 border-t border-slate-850 flex items-center gap-3">
            <input
              type="text"
              value={playerInput}
              onChange={(e) => setPlayerInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitAnswer()}
              disabled={loading}
              placeholder={loading ? "Interrogation de l'IA..." : "Saisis ta réponse ici de manière honnête..."}
              className="flex-1 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-cyan-500/50 outline-none text-sm px-4 py-3 rounded-2xl font-sans transition-colors placeholder:text-slate-600 text-white"
            />
            <button
              onClick={submitAnswer}
              disabled={loading || !playerInput.trim()}
              className={`p-3 rounded-2xl shrink-0 transition-all ${
                playerInput.trim() && !loading
                  ? activeRoutine === 'morning' ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400' : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                  : 'bg-slate-950 text-slate-700 border border-slate-850 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Quick options/tags to easily fill answers */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono text-slate-500">
            <span>Saisie rapide :</span>
            {[
              "8h de sommeil, très réparateur",
              "Légère raideur aux ischios",
              "Motivé, prêt à tout donner",
              "Pas de douleur ce soir",
              "Alimentation respectée à 100%"
            ].map(suggest => (
              <button
                key={suggest}
                onClick={() => setPlayerInput(suggest)}
                className="bg-slate-950 border border-slate-850 hover:border-slate-700 px-2.5 py-1 rounded-lg hover:text-white transition-colors uppercase text-[9px]"
              >
                {suggest}
              </button>
            ))}
          </div>

        </div>
      ) : (
        // STATE 4: Final AI analysis / report outcome with rewards
        <div className="space-y-6">
          <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-3xl relative overflow-hidden">
            <div className="absolute top-4 right-4 text-emerald-500/10 pointer-events-none">
              <Award className="w-24 h-24" />
            </div>

            <div className="flex items-center space-x-2.5 mb-3.5">
              <span className="p-1.5 bg-emerald-500/15 text-emerald-400 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Analyse biométrique terminée</span>
                <h3 className="text-base font-sans font-black text-white">Rapport du {activeRoutine === 'morning' ? 'Matin' : 'Soir'} par le Coach IA</h3>
              </div>
            </div>

            {/* Dynamic AI assessment response content */}
            <p className="text-slate-200 text-sm leading-relaxed font-medium mt-3 border-l-2 border-emerald-500/30 pl-4 py-1">
              "{finalReport?.analysis}"
            </p>

            {/* Adjusted indicators dynamic showcase */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              
              <div className="bg-slate-900 border border-slate-850 p-3.5 rounded-2xl text-center">
                <span className="block text-[8px] font-mono text-slate-500 uppercase">Indice de Récupération</span>
                <span className="block text-2xl font-black text-emerald-400 font-mono mt-0.5">{finalReport?.recoveryPercentage}%</span>
              </div>

              <div className="bg-slate-900 border border-slate-850 p-3.5 rounded-2xl text-center">
                <span className="block text-[8px] font-mono text-slate-500 uppercase">Intensité Ciblée</span>
                <span className="block text-xs font-mono font-black text-cyan-400 mt-2 truncate uppercase">{finalReport?.intensityZoneRecommendation}</span>
              </div>

              <div className="bg-slate-900 border border-slate-850 p-3.5 rounded-2xl text-center">
                <span className="block text-[8px] font-mono text-slate-500 uppercase">Niveau Fatigue</span>
                <span className="block text-sm font-sans font-black text-yellow-400 mt-2.5 uppercase">{finalReport?.fatigueLevel}</span>
              </div>

              <div className="bg-slate-900 border border-slate-850 p-3.5 rounded-2xl text-center">
                <span className="block text-[8px] font-mono text-slate-500 uppercase">Gain XP d'Analyse</span>
                <span className="block text-sm font-mono font-bold text-white mt-2.5">+{finalReport?.xpReward} XP</span>
              </div>

            </div>

            {/* Flash Tips advice */}
            {(finalReport?.dayTip || finalReport?.sleepTip) && (
              <div className="mt-4 p-3 bg-slate-900/50 border border-slate-850 rounded-xl flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-[11px] font-mono text-slate-300">
                  <strong className="text-amber-400 uppercase">CONSEIL FLASH :</strong> {finalReport?.dayTip || finalReport?.sleepTip}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-2xl text-xs font-mono">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 shrink-0 mr-1.5" />
              <span>COINS BONUS DU COACH : <span className="text-yellow-400 font-bold">+15 Coins</span></span>
            </div>

            <button
              onClick={resetRoutine}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-mono font-bold transition-all uppercase cursor-pointer"
            >
              Terminer et Fermer
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
