import React, { useState } from 'react';
import { PlayerProfile, Session, Match } from '../types';
import { Shield, Sparkles, Zap, Flame, Calendar, Award, AlertTriangle, ChevronRight, Play, MessageSquare, Heart, Clock } from 'lucide-react';
import RoutineCheckIn from './RoutineCheckIn';
import CentralDecisionCenter from './CentralDecisionCenter';

interface MissionControlProps {
  player: PlayerProfile;
  setPlayer: React.Dispatch<React.SetStateAction<PlayerProfile>>;
  sessions: Session[];
  matches: Match[];
  setActiveTab: (tab: string) => void;
  setSelectedSession: (session: Session) => void;
  openCoachDiscussion: (prompt: string) => void;
  lastCheckIn: any;
  setLastCheckIn: any;
  decisionState: any;
  setDecisionState: any;
}

export default function MissionControl({ 
  player, 
  setPlayer,
  sessions, 
  matches, 
  setActiveTab, 
  setSelectedSession,
  openCoachDiscussion,
  lastCheckIn,
  setLastCheckIn,
  decisionState,
  setDecisionState
}: MissionControlProps) {
  const activeSession = sessions.find(s => !s.completed) || sessions[0];
  const nextMatch = matches.find(m => !m.completed);

  // Why Engine trigger modal state
  const [whyModalOpen, setWhyModalOpen] = useState(false);
  const [whyTopic, setWhyTopic] = useState('');
  const [whyAnswer, setWhyTopicAnswer] = useState('');
  const [loadingWhy, setLoadingWhy] = useState(false);

  const handleWhyEngine = async (topic: string, value: string, context: string) => {
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
      setWhyTopicAnswer(data.explanation);
    } catch (err) {
      setWhyTopicAnswer("Ta régularité sur ce point influence directement ton développement. Maintiens l'effort pour débloquer de nouveaux paliers !");
    } finally {
      setLoadingWhy(false);
    }
  };

  const startDay = () => {
    if (activeSession) {
      setSelectedSession(activeSession);
      setActiveTab('training');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in p-1 sm:p-4 text-slate-100">
      
      {/* 1. Header Hero Panel */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-cyan-500/5 rounded-full blur-3xl -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] rounded-full uppercase tracking-widest font-black">Mode Autopilot Actif</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-sans font-black tracking-tight text-white leading-tight">
              Bonjour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{player.firstName}</span>.
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl font-medium">
              Aujourd'hui, ton <span className="text-slate-200">Progress Score</span> est de <span className="text-emerald-400 font-mono font-bold">{player.progressScore}</span>. Le moteur de décision a configuré ton programme.
            </p>
          </div>

          <div className="flex items-center space-x-4 shrink-0 bg-slate-900/60 border border-slate-800/80 p-4 sm:p-6 rounded-2xl backdrop-blur-sm">
            <div className="text-center pr-4 border-r border-slate-800">
              <span className="text-[10px] block text-slate-400 font-mono font-black uppercase tracking-wider">Récupération</span>
              <span className="text-3xl font-black text-emerald-400 font-mono">{lastCheckIn?.recoveryPercentage ?? 91}%</span>
            </div>
            <div className="text-center pl-2">
              <span className="text-[10px] block text-slate-400 font-mono font-black uppercase tracking-wider">Fatigue</span>
              <span className="text-lg font-black text-cyan-400 block font-sans">{lastCheckIn?.fatigueLevel ?? "FAIBLE"}</span>
            </div>
            <button 
              onClick={() => handleWhyEngine("Score de Récupération", `${lastCheckIn?.recoveryPercentage ?? 91}%`, `Calculé en fonction de ${lastCheckIn?.sleepHours ?? 8}h de sommeil, de douleurs de type "${lastCheckIn?.soreness ?? 'aucune'}" et du dernier intervalle d'entraînement.`)}
              className="text-xs text-slate-500 hover:text-emerald-400 font-mono underline pl-2 cursor-pointer transition-colors"
            >
              Pourquoi ?
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Morning and Evening Routine Check-Ins with AI Coach */}
      <RoutineCheckIn player={player} setPlayer={setPlayer} setLastCheckIn={setLastCheckIn} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* BIG ACTION: Commencer ma Journée */}
        {sessions.length === 0 ? (
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20" />
            <div className="space-y-4 relative z-10">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 font-mono text-xs rounded-lg font-bold uppercase tracking-wider">Initialisation du Jumeau Numérique</span>
              </div>
              <h3 className="text-2xl font-sans font-black text-white">PLANIFIE TA PREMIÈRE SÉANCE</h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
                Bienvenue sur ton centre de commandement individuel ! Pour démarrer ta progression et permettre au moteur de décision de calibrer tes charges et tes axes physiologiques, planifie ou génère ton premier entraînement aujourd'hui.
              </p>
            </div>
            <button 
              onClick={() => setActiveTab('training')}
              className="mt-8 w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-sans font-black text-sm tracking-wider uppercase rounded-2xl shadow-lg shadow-emerald-500/10 hover:scale-101 active:scale-99 transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer relative z-10"
            >
              <span>Générer ma première séance</span>
              <ChevronRight className="w-4 h-4 text-slate-950 font-black" />
            </button>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-slate-900 border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all duration-300">
            <div className="absolute top-4 right-4 text-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
              <Play className="w-40 h-40" />
            </div>
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 font-mono text-xs rounded-lg font-bold">Aujourd'hui, tu peux gagner :</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">EXP ESTIMÉ</span>
                  <span className="text-2xl font-black text-white font-mono">+620 XP</span>
                </div>
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">PROG. ESTIMÉE</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">+1,4%</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="flex items-center text-sm text-slate-300">
                  <Clock className="w-4 h-4 text-slate-500 mr-2" />
                  <span className="font-medium">Durée estimée : <span className="text-white font-semibold font-mono">{activeSession?.duration || 37} minutes</span></span>
                </div>
                <div className="flex items-center text-sm text-slate-300">
                  <Zap className="w-4 h-4 text-slate-500 mr-2" />
                  <span className="font-medium">Priorité ciblée : <span className="text-emerald-400 font-semibold">Première touche & Appels</span></span>
                </div>
              </div>
            </div>

            <button 
              onClick={startDay}
              className="mt-8 w-full py-4 bg-emerald-500 text-slate-950 font-sans font-black text-lg tracking-wider rounded-2xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95 transition-all duration-200 flex items-center justify-center space-x-3 cursor-pointer relative z-10"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>COMMENCER MA SÉANCE</span>
            </button>
          </div>
        )}

        {/* Weekly Focus Widget */}
        {sessions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Focus Hebdomadaire</span>
                <span className="p-2 bg-slate-800 text-slate-500 rounded-xl"><Sparkles className="w-4 h-4" /></span>
              </div>
              
              <div>
                <h3 className="text-lg font-sans font-black text-slate-400 uppercase">Aucun focus actif</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  L'IA analysera tes performances et tes lacunes techniques dès tes premières séances ou tes premiers matchs pour calibrer un focus sur mesure.
                </p>
              </div>

              <div className="py-6 border border-dashed border-slate-850 rounded-2xl flex flex-col items-center justify-center text-center p-4">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Données insuffisantes</span>
                <span className="text-[9px] text-slate-600 mt-1">Enregistre des entraînements</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Focus Hebdomadaire</span>
                <span className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl"><Sparkles className="w-4 h-4" /></span>
              </div>
              
              <div>
                <h3 className="text-xl font-sans font-black text-white">PIED FAIBLE (GAUCHE)</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Pourquoi ? <span className="text-slate-300 italic">"Parce qu'il limite actuellement ta qualité de finition et tes ouvertures axiales."</span>
                </p>
              </div>

              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>OBJECTIF : 400 PASSES</span>
                  <span className="text-cyan-400">281 / 400</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full" style={{ width: '70.2%' }} />
                </div>
              </div>

              <div className="text-xs font-mono text-slate-500">
                Impact estimé : <span className="text-emerald-400 font-bold">+6%</span> sur tes performances globales de finition.
              </div>
            </div>

            <button 
              onClick={() => handleWhyEngine("Pied Faible", "58/100", "L'analyse vidéo de ton dernier match montre que 81% de tes dribbles se terminent sur le pied droit, rendant tes trajectoires prévisibles pour les défenseurs.")}
              className="w-full mt-4 py-2 text-center text-xs font-mono text-slate-400 hover:text-white border border-slate-800 rounded-xl hover:bg-slate-800/40 cursor-pointer transition-all"
            >
              Pourquoi ce focus ?
            </button>
          </div>
        )}

      </div>

      {/* 3. Central Decision Engine */}
      <CentralDecisionCenter 
        player={player}
        sessions={sessions}
        matches={matches}
        lastCheckIn={lastCheckIn}
        setLastCheckIn={setLastCheckIn}
        decisionState={decisionState}
        setDecisionState={setDecisionState}
        openCoachDiscussion={openCoachDiscussion}
      />

      {/* 4. Smart Alerts Panel */}
      <div className="space-y-4">
        <h3 className="text-lg font-sans font-black text-white tracking-wide uppercase flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <span>Alertes Intelligentes</span>
        </h3>
        
        {sessions.length === 0 && matches.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl text-center">
            <p className="text-sm font-bold text-slate-400">Aucune alerte active pour le moment</p>
            <p className="text-xs text-slate-500 mt-1">Ton statut corporel et tes charges d'entraînements sont équilibrés.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Match Alert */}
            <div className="bg-slate-900 border-l-4 border-amber-500 border-y border-r border-slate-800 p-4 rounded-r-2xl flex items-start space-x-3 shadow">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest font-black block">Prochain match dans 2 jours</span>
                <p className="text-slate-200 text-xs mt-1 leading-relaxed">
                  Le système recommande de limiter les exercices de musculation lourde et d'éviter les sprints de plus de 30 mètres pour conserver ta fraîcheur physique contre Monaco.
                </p>
              </div>
            </div>

            {/* Sleep Alert */}
            <div className="bg-slate-900 border-l-4 border-cyan-500 border-y border-r border-slate-800 p-4 rounded-r-2xl flex items-start space-x-3 shadow">
              <AlertTriangle className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest font-black block">Analyse Sommeil Hebdomadaire</span>
                <p className="text-slate-200 text-xs mt-1 leading-relaxed">
                  Tu as accumulé une dette de sommeil de 1h20 sur les 3 dernières nuits. Augmente ta consommation d'eau aujourd'hui (+500ml) pour éviter les micro-blessures.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Career Momentum Widget */}
      <div className="bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Award className="w-5 h-5 text-emerald-400" />
          <span className="text-sm text-slate-300 font-medium">
            <span className="text-emerald-400 font-semibold font-mono">Inertie de Carrière positive</span> : Tu progresses 14% plus vite que la moyenne nationale de ta catégorie d'âge.
          </span>
        </div>
        <button 
          onClick={() => setActiveTab('player_os')}
          className="text-xs font-mono text-slate-400 hover:text-emerald-400 underline cursor-pointer transition-colors"
        >
          Voir ma chronologie complète
        </button>
      </div>

      {/* 6. Why Engine Explanation Modal */}
      {whyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative animate-scale-up text-slate-100">
            <h4 className="text-xl font-sans font-black text-white mb-2 uppercase tracking-wide flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span>Telvox Why Engine</span>
            </h4>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest block mb-4">Sujet : {whyTopic}</span>
            
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 min-h-24 flex items-center justify-center text-sm leading-relaxed text-slate-300">
              {loadingWhy ? (
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-mono text-slate-500">Interrogation du Progress Engine...</span>
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
                    openCoachDiscussion(`Peux-tu m'expliquer plus en détail comment améliorer ma statistique de ${whyTopic} ?`);
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

    </div>
  );
}
