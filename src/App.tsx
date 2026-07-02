import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MissionControl from './components/MissionControl';
import MissionCalendar from './components/MissionCalendar';
import PlayerIdentityCard from './components/PlayerIdentityCard';
import TrainingCenter from './components/TrainingCenter';
import MatchCenter from './components/MatchCenter';
import PerformanceLab from './components/PerformanceLab';
import NutritionEngine from './components/NutritionEngine';
import AICoachChat from './components/AICoachChat';
import Onboarding from './components/Onboarding';
import FootballIQCenter from './components/FootballIQCenter';
import PhysicalPrepCenter from './components/PhysicalPrepCenter';
import AuthOverlay from './components/AuthOverlay';

// Firebase
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Types
import { PlayerProfile, SkillNode, Session, Match, Correlation, Experiment, Meal, CoachMessage, CoachPersonality, FootballDNA } from './types';

// Mock base data
import { 
  INITIAL_PLAYER_PROFILE, 
  INITIAL_DNA, 
  INITIAL_SKILLS, 
  INITIAL_SESSIONS, 
  INITIAL_MATCHES, 
  INITIAL_CORRELATIONS, 
  INITIAL_EXPERIMENTS, 
  INITIAL_MEALS 
} from './mockData';

import { Sparkles, MessageSquare, Shield, Trophy, Activity, Heart, X, AlertTriangle } from 'lucide-react';

export default function App() {
  // App primary states with LocalStorage persistence fallbacks
  const [player, setPlayer] = useState<PlayerProfile>(() => {
    const stored = localStorage.getItem('football_ai_player_profile');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    return INITIAL_PLAYER_PROFILE;
  });

  const [dna, setDna] = useState<FootballDNA>(() => {
    const stored = localStorage.getItem('football_ai_dna');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    return INITIAL_DNA;
  });

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    const stored = localStorage.getItem('football_ai_completed_onboarding');
    return stored === 'true';
  });

  const [skills, setSkills] = useState<SkillNode[]>(() => {
    const stored = localStorage.getItem('football_ai_skills');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    return INITIAL_SKILLS;
  });

  const [sessions, setSessions] = useState<Session[]>(() => {
    const stored = localStorage.getItem('football_ai_sessions');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    return INITIAL_SESSIONS;
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    const stored = localStorage.getItem('football_ai_matches');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    return INITIAL_MATCHES;
  });

  const [experiments, setExperiments] = useState<Experiment[]>(() => {
    const stored = localStorage.getItem('football_ai_experiments');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    return INITIAL_EXPERIMENTS;
  });

  const [meals, setMeals] = useState<Meal[]>(() => {
    const stored = localStorage.getItem('football_ai_meals');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    return INITIAL_MEALS;
  });

  // Firebase Auth and Cloud Sync states
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'local'>('local');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // Auth listener & Cloud Hydrator
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      setLoadingAuth(false);
      if (fbUser) {
        setSyncStatus('syncing');
        try {
          const docRef = doc(db, 'users', fbUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.player) setPlayer(data.player);
            if (data.dna) setDna(data.dna);
            if (data.skills) setSkills(data.skills);
            if (data.sessions) setSessions(data.sessions);
            if (data.matches) setMatches(data.matches);
            if (data.experiments) setExperiments(data.experiments);
            if (data.meals) setMeals(data.meals);
            if (data.hasCompletedOnboarding !== undefined) setHasCompletedOnboarding(data.hasCompletedOnboarding);
            setSyncStatus('synced');
          } else {
            // New user on Firebase, seed database with current local progress
            await setDoc(docRef, {
              player,
              dna,
              skills,
              sessions,
              matches,
              experiments,
              meals,
              hasCompletedOnboarding,
              updatedAt: new Date().toISOString()
            });
            setSyncStatus('synced');
          }
        } catch (e) {
          console.error("Firestore initialization/loading error:", e);
          setSyncStatus('error');
        }
      } else {
        setSyncStatus('local');
      }
    });
    return () => unsubscribe();
  }, []);

  // Continuous Cloud Sync on local state changes (Debounced)
  useEffect(() => {
    if (!user) return;
    const saveToCloud = async () => {
      setSyncStatus('syncing');
      try {
        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, {
          player,
          dna,
          skills,
          sessions,
          matches,
          experiments,
          meals,
          hasCompletedOnboarding,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        setSyncStatus('synced');
      } catch (e) {
        console.error("Debounced sync failed:", e);
        setSyncStatus('error');
      }
    };

    const timer = setTimeout(() => {
      saveToCloud();
    }, 2000);

    return () => clearTimeout(timer);
  }, [player, dna, skills, sessions, matches, experiments, meals, hasCompletedOnboarding, user]);

  // Automatically write states to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('football_ai_completed_onboarding', String(hasCompletedOnboarding));
  }, [hasCompletedOnboarding]);

  useEffect(() => {
    localStorage.setItem('football_ai_player_profile', JSON.stringify(player));
  }, [player]);

  useEffect(() => {
    localStorage.setItem('football_ai_dna', JSON.stringify(dna));
  }, [dna]);

  useEffect(() => {
    localStorage.setItem('football_ai_skills', JSON.stringify(skills));
  }, [skills]);

  useEffect(() => {
    localStorage.setItem('football_ai_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('football_ai_matches', JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem('football_ai_experiments', JSON.stringify(experiments));
  }, [experiments]);

  useEffect(() => {
    localStorage.setItem('football_ai_meals', JSON.stringify(meals));
  }, [meals]);

  // Active workout states
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // Central Decision Engine and Physiological physical states
  const [lastCheckIn, setLastCheckIn] = useState(() => {
    const stored = localStorage.getItem('football_ai_last_checkin');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return {
      recoveryPercentage: 91,
      fatigueLevel: 'FAIBLE' as 'FAIBLE' | 'MODÉRÉE' | 'ÉLEVÉE',
      sleepHours: 8,
      soreness: 'Aucune',
      injuryStatus: 'Ok'
    };
  });

  const [decisionState, setDecisionState] = useState<any>(() => {
    const stored = localStorage.getItem('football_ai_decision_state');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return null;
  });

  // Chat/Coach states
  const [personality, setPersonality] = useState<CoachPersonality>('pedagogue');
  const [coachMessages, setCoachMessages] = useState<CoachMessage[]>([
    {
      id: "welcome",
      sender: 'coach',
      text: "Bonjour ! Je suis ton Progress Engine, ton coach IA personnel. Prêt à analyser tes performances ou à programmer ta journée de travail ?",
      timestamp: "10:00"
    }
  ]);

  // Tab routing
  const [activeTab, setActiveTab] = useState<string>('mission');

  // Slide-out Drawer state for AI Coach
  const [isCoachDrawerOpen, setIsCoachDrawerOpen] = useState(false);

  // Utility to auto-trigger a question in Coach IA and open the drawer
  const openCoachDiscussion = (customPrompt: string) => {
    setIsCoachDrawerOpen(true);
    // Append user message and trigger send
    const userMsg: CoachMessage = {
      id: "msg_auto_" + Date.now(),
      sender: 'player',
      text: customPrompt,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    setCoachMessages(prev => [...prev, userMsg]);
    triggerCoachResponse(customPrompt);
  };

  // Safe manual response generator for auto-prompts
  const triggerCoachResponse = async (text: string) => {
    try {
      const response = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...coachMessages, { sender: 'player', text }],
          personality,
          playerProfile: player,
          footballDna: dna
        })
      });

      const data = await response.json();
      
      const coachMsg: CoachMessage = {
        id: "msg_coach_auto_" + Date.now(),
        sender: 'coach',
        text: data.text || "Je suis en train d'analyser cette problématique d'entraînement. Continue ta régularité !",
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };

      setCoachMessages(prev => [...prev, coachMsg]);
    } catch (err) {
      console.error(err);
    }
  };

  // Central Command Executor for the AI Coach
  const handleExecuteCoachCommand = (cmd: { action: string, payload: any }) => {
    console.log("Coach executing direct command:", cmd);
    let parsedPayload = cmd.payload;
    if (typeof cmd.payload === 'string') {
      try {
        parsedPayload = JSON.parse(cmd.payload);
      } catch (e) {
        console.error("Payload parse error:", e);
      }
    }

    switch (cmd.action) {
      case 'DELETE_SESSION':
        setSessions(prev => {
          if (parsedPayload?.date === 'tomorrow') {
            const uncompleted = prev.filter(s => !s.completed);
            if (uncompleted.length > 0) {
              return prev.filter(s => s.id !== uncompleted[0].id);
            }
          } else if (parsedPayload?.date) {
            return prev.filter(s => s.date !== parsedPayload.date);
          }
          return prev;
        });
        break;

      case 'ADD_SESSION':
        const newSess: Session = {
          id: "sess_ai_" + Date.now(),
          name: parsedPayload?.name || "Séance Spécifique IA",
          category: parsedPayload?.category || "Technique",
          intensity: parsedPayload?.intensity || "Modérée",
          date: parsedPayload?.date || "Prochainement",
          completed: false,
          duration: parsedPayload?.duration || 30,
          exercises: parsedPayload?.exercises || [
            { name: "Frappes en pivot", duration: 10, focusPoints: ["Pied faible", "Prise d'information"], description: "Exercice recommandé par le Coach IA." }
          ]
        };
        setSessions(prev => [...prev, newSess]);
        break;

      case 'SET_SEASON_MODE':
        if (parsedPayload?.mode) {
          setPlayer(prev => ({
            ...prev,
            seasonMode: parsedPayload.mode
          }));
        }
        break;

      case 'SET_INJURED':
        setPlayer(prev => ({
          ...prev,
          currentGoal: "Réathlétisation & Récupération active suite à gêne physique"
        }));
        setSessions(prev => prev.map(s => {
          if (!s.completed && s.intensity === 'Élevée') {
            return {
              ...s,
              name: "Récupération passive & Étirements guidés",
              intensity: "Faible",
              category: "Physique",
              exercises: [
                { name: "Glaçage & Mobilité passive", duration: 15, focusPoints: ["Relâchement musculaire", "Aucun impact"], description: "Traitement de l'inflammation conseillé par le Progress Engine." }
              ]
            };
          }
          return s;
        }));
        break;

      case 'SET_VACATION':
        setPlayer(prev => ({
          ...prev,
          currentGoal: "Maintien physique léger (Période de Vacances)"
        }));
        setSessions(prev => prev.map(s => {
          if (!s.completed) {
            return {
              ...s,
              name: "Maintien léger & Footing régénératif",
              intensity: "Faible",
              exercises: [
                { name: "Footing aérobie léger", duration: 20, focusPoints: ["Fréquence cardiaque basse"], description: "Entretien cardiovasculaire sans contrainte." }
              ]
            };
          }
          return s;
        }));
        break;

      case 'LEFT_FOOT_ONLY':
        setSessions(prev => prev.map(s => {
          if (!s.completed && s.category === 'Technique') {
            return {
              ...s,
              name: "Spécifique Pied Gauche (Faiblesse Identifiée)",
              exercises: s.exercises.map(ex => ({
                ...ex,
                name: `${ex.name} (Exclusif Pied Gauche)`,
                focusPoints: [...ex.focusPoints, "Pied faible uniquement"]
              }))
            };
          }
          return s;
        }));
        break;

      case 'SET_FOOD_PROFILE':
        if (parsedPayload) {
          setPlayer(prev => ({
            ...prev,
            foodProfile: {
              ...prev.foodProfile,
              ...parsedPayload
            }
          }));
        }
        break;

      case 'ADD_MATCH':
        const newM: Match = {
          id: "match_ai_" + Date.now(),
          opponent: parsedPayload?.opponent || "Adversaire IA",
          date: "Samedi Prochain",
          type: "Officiel",
          playedMinutes: 0,
          readinessIndex: 85,
          completed: false,
          rating: 0,
          stats: {
            goals: 0,
            assists: 0,
            passesAttempted: 0,
            passesCompleted: 0,
            sprints: 0,
            maxSpeed: 0,
            distanceCovered: 0,
            tacklesWon: 0,
            interceptions: 0,
            yellowCards: 0,
            redCards: 0
          }
        };
        setMatches(prev => [...prev, newM]);
        break;

      case 'UPDATE_OBJECTIVE':
        if (parsedPayload?.objective) {
          setPlayer(prev => ({
            ...prev,
            currentGoal: parsedPayload.objective
          }));
        }
        break;

      default:
        console.warn("Unhandled coach action command:", cmd.action);
    }
  };

  // Dynamic "Why Engine" connector mapped globally
  const [whyModalOpen, setWhyModalOpen] = useState(false);
  const [whyTopic, setWhyTopic] = useState('');
  const [whyAnswer, setWhyAnswer] = useState('');
  const [loadingWhy, setLoadingWhy] = useState(false);

  const openWhyEngine = async (topic: string, value: string, context: string) => {
    setWhyTopic(topic);
    setWhyModalOpen(true);
    setLoadingWhy(true);
    try {
      const response = await fetch('/api/coach/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metric: topic, value, context, playerProfile: player })
      });
      const data = await response.json();
      setWhyAnswer(data.explanation);
    } catch (err) {
      setWhyAnswer("Cette donnée clé est modélisée par ton Player Twin pour adapter tes séances. Reste régulier à l'effort pour maximiser ta progression !");
    } finally {
      setLoadingWhy(false);
    }
  };

  if (!hasCompletedOnboarding) {
    return (
      <Onboarding 
        player={player} 
        setPlayer={setPlayer} 
        onComplete={(completedDna) => {
          setDna(completedDna);
          
          // Clear all dynamic entities so they start completely empty
          setSessions([]);
          setMatches([]);
          setMeals([]);
          setExperiments([]);

          // Verrouille l'arbre de compétences pour que seuls les nœuds racines soient débloqués par défaut, forçant la progression
          setSkills(prev => prev.map(s => {
            const isRoot = s.id.endsWith('_root');
            return {
              ...s,
              unlocked: isRoot,
              cost: isRoot ? 0 : (s.cost || 200),
              value: isRoot ? s.value : Math.max(50, s.value - 15) // Laisse de la marge pour monter en compétences
            };
          }));

          setHasCompletedOnboarding(true);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950 relative">
      
      <div className="flex-1 pb-16">
        {/* Navigation & Header */}
        <Header 
          player={player} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          user={user}
          syncStatus={syncStatus}
          onAuthClick={() => setIsAuthOpen(true)}
          onReset={() => {
            localStorage.clear();
            window.location.reload();
          }}
        />

        {/* Tab contents wrapper */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {activeTab === 'mission' && (
            <MissionControl 
              player={player} 
              setPlayer={setPlayer}
              sessions={sessions} 
              matches={matches} 
              setActiveTab={setActiveTab}
              setSelectedSession={setSelectedSession}
              openCoachDiscussion={openCoachDiscussion}
              lastCheckIn={lastCheckIn}
              setLastCheckIn={setLastCheckIn}
              decisionState={decisionState}
              setDecisionState={setDecisionState}
            />
          )}

          {activeTab === 'calendar' && (
            <MissionCalendar 
              player={player}
              setPlayer={setPlayer}
              sessions={sessions}
              setSessions={setSessions}
              openCoachDiscussion={openCoachDiscussion}
            />
          )}

          {activeTab === 'player_os' && (
            <PlayerIdentityCard 
              player={player}
              setPlayer={setPlayer}
              skills={skills}
              setSkills={setSkills}
              dna={dna}
              setDna={setDna}
              openWhyEngine={openWhyEngine}
            />
          )}

          {activeTab === 'training' && (
            <TrainingCenter 
              player={player}
              setPlayer={setPlayer}
              sessions={sessions}
              setSessions={setSessions}
              selectedSession={selectedSession}
              setSelectedSession={setSelectedSession}
              skills={skills}
              setSkills={setSkills}
              decisionState={decisionState}
            />
          )}

          {activeTab === 'match' && (
            <MatchCenter 
              player={player}
              setPlayer={setPlayer}
              matches={matches}
              setMatches={setMatches}
              setSkills={setSkills}
            />
          )}

          {activeTab === 'phys_prep' && (
            <PhysicalPrepCenter 
              player={player}
              setPlayer={setPlayer}
              lastCheckIn={lastCheckIn}
            />
          )}

          {activeTab === 'football_iq' && (
            <FootballIQCenter 
              player={player}
              setPlayer={setPlayer}
              setSkills={setSkills}
            />
          )}

          {activeTab === 'lab' && (
            <PerformanceLab 
              player={player}
              correlations={INITIAL_CORRELATIONS}
              experiments={experiments}
              setExperiments={setExperiments}
            />
          )}

          {activeTab === 'nutrition' && (
            <NutritionEngine 
              player={player}
              meals={meals}
              setMeals={setMeals}
              activeSession={selectedSession || sessions.find(s => !s.completed) || null}
              decisionState={decisionState}
            />
          )}

        </main>
      </div>

      {/* Floating Action Button (FAB) to open Coach IA slide-out panel */}
      <button
        onClick={() => setIsCoachDrawerOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950 font-bold hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/20 z-40 transition-all cursor-pointer flex items-center space-x-2 group"
        title="Discuter avec le Coach IA"
      >
        <MessageSquare className="w-6 h-6 fill-slate-950 group-hover:rotate-12 transition-transform duration-300" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-mono font-black tracking-wide">
          COACH IA
        </span>
      </button>

      {/* COACH IA SLIDE-OUT DRAWER */}
      {isCoachDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs">
          {/* Backdrop Click Dismiss */}
          <div className="flex-1 cursor-pointer" onClick={() => setIsCoachDrawerOpen(false)} />
          
          <div className="w-full max-w-lg bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-800 animate-slide-in">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center text-slate-100">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono text-slate-400">Assistant Proactif</span>
              </div>
              <button 
                onClick={() => setIsCoachDrawerOpen(false)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden p-2">
              <AICoachChat 
                player={player}
                dna={INITIAL_DNA}
                coachMessages={coachMessages}
                setCoachMessages={setCoachMessages}
                personality={personality}
                setPersonality={setPersonality}
                onExecuteCommand={handleExecuteCoachCommand}
              />
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL WHY ENGINE EXPLANATION MODAL */}
      {whyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-slate-100 animate-scale-up">
            <h4 className="text-xl font-sans font-black text-white mb-2 uppercase tracking-wide flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span>Telvox Why Engine</span>
            </h4>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest block mb-4">Sujet : {whyTopic}</span>
            
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 min-h-24 flex items-center justify-center text-sm leading-relaxed text-slate-300">
              {loadingWhy ? (
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-mono text-slate-500">Analyse de causalité en cours...</span>
                </div>
              ) : (
                <p>"{whyAnswer}"</p>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button 
                onClick={() => setWhyModalOpen(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-mono cursor-pointer transition-all border border-slate-700/50"
              >
                Fermer
              </button>
              {!loadingWhy && (
                <button 
                  onClick={() => {
                    setWhyModalOpen(false);
                    openCoachDiscussion(`Peux-tu m'expliquer plus en détail comment progresser sur : ${whyTopic} ?`);
                  }}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans font-bold text-xs rounded-xl cursor-pointer transition-all"
                >
                  Discuter avec le Coach
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AUTHENTICATION OVERLAY MODAL */}
      {isAuthOpen && (
        <AuthOverlay 
          user={user}
          loadingAuth={loadingAuth}
          onClose={() => setIsAuthOpen(false)}
          syncStatus={syncStatus}
          onSyncManual={async () => {
            if (!user) return;
            setSyncStatus('syncing');
            try {
              const docRef = doc(db, 'users', user.uid);
              await setDoc(docRef, {
                player,
                dna,
                skills,
                sessions,
                matches,
                experiments,
                meals,
                hasCompletedOnboarding,
                updatedAt: new Date().toISOString()
              }, { merge: true });
              setSyncStatus('synced');
            } catch (e) {
              console.error("Manual sync failed:", e);
              setSyncStatus('error');
            }
          }}
        />
      )}

      {/* Footer Branding credits */}
      <footer className="text-center py-4 text-[10px] text-slate-600 font-mono tracking-widest uppercase border-t border-slate-900/50 bg-slate-950">
        Telvox OS v1.0 © {new Date().getFullYear()} — Designed for Elites.
      </footer>

    </div>
  );
}
