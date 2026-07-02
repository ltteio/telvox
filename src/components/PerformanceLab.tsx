import React, { useState } from 'react';
import { PlayerProfile, Correlation, Experiment } from '../types';
import { Heart, Activity, TrendingUp, Sparkles, AlertTriangle, ArrowRight, Zap, Target, BookOpen, Clock } from 'lucide-react';

interface PerformanceLabProps {
  player: PlayerProfile;
  correlations: Correlation[];
  experiments: Experiment[];
  setExperiments: React.Dispatch<React.SetStateAction<Experiment[]>>;
}

export default function PerformanceLab({
  player,
  correlations,
  experiments,
  setExperiments
}: PerformanceLabProps) {
  const [selectedScenario, setSelectedBranchScenario] = useState<'sleep' | 'left_foot' | 'weight' | 'none'>('sleep');

  const startExperiment = (id: string) => {
    setExperiments(prev => prev.map(exp => {
      if (exp.id === id) {
        return { ...exp, status: 'active', progressDays: 1, totalDays: 21 };
      }
      return exp;
    }));
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-100">
      
      {/* 1. Header Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-2 shadow-xl">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg"><Heart className="w-5 h-5" /></span>
          <h3 className="text-xl font-sans font-black text-white uppercase tracking-wide">Performance Lab</h3>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Le laboratoire d'analyse de Telvox découvre les <span className="text-slate-200 font-bold">causes de tes performances</span>. Les statistiques isolées n'ont pas de valeur ; seul le lien de cause à effet permet de progresser.
        </p>
      </div>

      {/* 2. IA Correlations Panel (Chapitre 10) */}
      <div className="space-y-4">
        <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block">Corrélations IA Détectées</span>
        {correlations.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-2">
            <TrendingUp className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-400">Aucune corrélation détectée</p>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
              L'IA de Telvox commencera à identifier des corrélations de cause à effet dès que tu auras enregistré tes premières séances d'entraînement et tes premiers matchs.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {correlations.map((corr) => (
              <div 
                key={corr.id} 
                className={`p-5 rounded-2xl border-2 flex flex-col justify-between shadow-md ${
                  corr.positive 
                    ? 'bg-emerald-500/5 border-emerald-500/20' 
                    : 'bg-rose-500/5 border-rose-500/20'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-1 bg-slate-950/40 border border-slate-800 rounded-lg text-[10px] font-mono font-bold text-slate-300">
                      Symptôme : {corr.factor.split(' ')[0]}
                    </span>
                    <span className={`text-xl font-black font-mono ${corr.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {corr.positive ? '+' : '-'}{corr.percent}%
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">Quand : <span className={corr.positive ? 'text-emerald-400' : 'text-rose-400'}>{corr.factor}</span></h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{corr.description}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/40 text-[10px] font-mono text-slate-500">
                  Fiabilité de l'analyse : <span className="text-slate-300 font-bold">92%</span> (Modèle robuste)
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Trajectory Simulator ("Et si... ?") */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="space-y-1">
          <span className="text-xs font-mono text-slate-500 uppercase">Simulateur de Trajectoire</span>
          <h3 className="text-xl font-sans font-black text-white">ET SI TU ADOPTAIS UN NOUVEAU COMPORTEMENT ?</h3>
          <p className="text-xs text-slate-400">
            Simule l'impact de tes futurs choix sportifs ou de style de vie sur tes statistiques OVR d'ici 3 mois.
          </p>
        </div>

        {/* Buttons choices */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'sleep', label: 'Si Sommeil +45m', desc: 'Améliore la régénération nerveuse.' },
            { id: 'left_foot', label: 'Si Pied Gauche intensif', desc: 'Rend ton profil ambidextre.' },
            { id: 'weight', label: 'Si Perte de 3kg gras', desc: 'Augmente ton rapport poids/puissance.' }
          ].map((sc) => (
            <button
              key={sc.id}
              onClick={() => setSelectedBranchScenario(sc.id as any)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedScenario === sc.id 
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                  : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="font-sans font-bold text-xs text-white block mb-1">{sc.label}</span>
              <span className="text-[10px] opacity-80 leading-normal block">{sc.desc}</span>
            </button>
          ))}
        </div>

        {/* Simulated results graph indicators */}
        <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-850 space-y-4">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Estimation des impacts d'ici 3 mois (Progress Engine)</span>
          
          {selectedScenario === 'sleep' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-slate-400 block">PRÉCISION PASSE COURTE :</span>
                <span className="text-lg font-bold text-emerald-400">+8.4% estimé</span>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-slate-400 block">RISQUE DE BLESSURE :</span>
                <span className="text-lg font-bold text-emerald-400">-14.2% estimé</span>
              </div>
            </div>
          )}

          {selectedScenario === 'left_foot' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-slate-400 block">RATING FINITION PIED FAIBLE :</span>
                <span className="text-lg font-bold text-emerald-400">+12 points (58 ➔ 70)</span>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-slate-400 block">POLYVALENCE OFFENSIVE :</span>
                <span className="text-lg font-bold text-emerald-400">Évolution vers 'Ailier Ambidextre'</span>
              </div>
            </div>
          )}

          {selectedScenario === 'weight' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-slate-400 block">SPRINT MAXIMAL :</span>
                <span className="text-lg font-bold text-emerald-400">+3.8% (90 ➔ 93)</span>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-slate-400 block">DÉMARRAGE SUR 5 MÈTRES :</span>
                <span className="text-lg font-bold text-emerald-400">+4.5% d'accélération</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Experiments / Scientific Tests (Chapitre 10 - Les Expériences) */}
      <div className="space-y-4">
        <h3 className="text-lg font-sans font-black text-white tracking-wide uppercase">Expériences Scientifiques Conseillées</h3>
        {experiments.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-2">
            <Target className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-400">Aucune expérience disponible</p>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
              Enregistre de nouvelles séances ou des matchs dans ton espace Telvox pour débloquer des protocoles expérimentaux personnalisés par le Coach IA.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {experiments.map((exp) => (
              <div key={exp.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-lg">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-slate-400">Protocole : {exp.durationWeeks} semaines</span>
                    {exp.status === 'active' ? (
                      <span className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-[10px] font-bold rounded-lg uppercase">
                        Actif ({exp.progressDays} / {exp.totalDays} J)
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-slate-500 font-mono text-[10px] font-bold rounded-lg uppercase">
                        Suggéré
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-slate-100">{exp.name}</h4>
                  <p className="text-xs text-slate-400 leading-normal">Objectif : <span className="text-slate-300 font-medium">{exp.objective}</span></p>

                  {exp.insight && (
                    <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 text-[11px] text-emerald-400 leading-relaxed font-mono">
                      {exp.insight}
                    </div>
                  )}
                </div>

                {exp.status === 'suggested' && (
                  <button
                    onClick={() => startExperiment(exp.id)}
                    className="mt-5 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold rounded-xl cursor-pointer transition-colors border border-slate-750"
                  >
                    LANCER LE PROTOCOLE
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
