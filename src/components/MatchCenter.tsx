import React, { useState } from 'react';
import { PlayerProfile, Match } from '../types';
import { Shield, Calendar, Award, Sparkles, CheckSquare, Zap, Clock, AlertTriangle, ArrowRight, Play, BookOpen, Smile } from 'lucide-react';

interface MatchCenterProps {
  player: PlayerProfile;
  setPlayer: React.Dispatch<React.SetStateAction<PlayerProfile>>;
  matches: Match[];
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  setSkills: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function MatchCenter({
  player,
  setPlayer,
  matches,
  setMatches,
  setSkills
}: MatchCenterProps) {
  const [activeTab, setActiveTab] = useState<'prep' | 'history'>('prep');

  // Checklist items
  const [checklist, setChecklist] = useState([
    { id: '1', label: 'Crampons adaptés à la météo (mouillé/sec)', checked: true },
    { id: '2', label: 'Protège-tibias obligatoires', checked: true },
    { id: '3', label: 'Gourde d\'eau froide préparée', checked: false },
    { id: '4', label: 'Maillot / Chaussettes MHSC clean', checked: true },
    { id: '5', label: 'Gants (Gardien) / Bandeaux si besoin', checked: false },
    { id: '6', label: 'Vérifier l\'itinéraire et l\'heure de départ (13:15)', checked: true }
  ]);

  // Match report simulation form states
  const [reportOpponent, setReportOpponent] = useState('Nîmes Olympique (U19)');
  const [reportType, setReportType] = useState<'Officiel' | 'Amical' | 'Five'>('Officiel');
  const [reportMinutes, setReportMinutes] = useState(90);
  const [reportGoals, setReportReportGoals] = useState(0);
  const [reportAssists, setReportAssists] = useState(1);
  const [reportRating, setReportRating] = useState(7.5);
  const [showReportComplete, setShowReportComplete] = useState<Match | null>(null);

  const toggleChecklist = (id: string) => {
    setChecklist(prev => prev.map(item => {
      if (item.id === id) return { ...item, checked: !item.checked };
      return item;
    }));
  };

  // Submit Match Report
  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const matchImpact = reportType === 'Officiel' ? Math.round(50 + reportRating * 4) : Math.round(20 + reportRating * 4);
    
    const newMatch: Match = {
      id: "match_" + Date.now(),
      opponent: reportOpponent,
      type: reportType,
      date: "Aujourd'hui",
      playedMinutes: reportMinutes,
      stats: {
        goals: reportGoals,
        assists: reportAssists,
        passesAttempted: 40,
        passesCompleted: 32,
        sprints: 12,
        maxSpeed: 33.5,
        distanceCovered: 9.8,
        tacklesWon: 3,
        interceptions: 1,
        yellowCards: 0,
        redCards: 0
      },
      rating: reportRating,
      readinessIndex: 85,
      impactScore: matchImpact,
      completed: true,
      report: {
        successHighlights: [
          `Passe décisive lumineuse sur le but égalisateur.`,
          "Bonne présence physique dans le couloir droit lors des transitions défensives."
        ],
        weaknessesExposed: [
          "Baisse de régime physique constatée en milieu de 2ème mi-temps.",
          "Peu de tentatives de frappes lointaines."
        ],
        nextActionStep: "Optimise ton endurance d'appui lors de ta prochaine séance.",
        careerImpactPhrase: `Ce match solide t'octroie un Match Impact de ${matchImpact} points.`
      }
    };

    // Prepend to matches history list
    setMatches(prev => [newMatch, ...prev]);

    // Reward player state
    setPlayer(prev => ({
      ...prev,
      xp: prev.xp + 900, // Match Analyzed XP Chapter 11
      coins: prev.coins + 150,
      progressScore: Math.min(1000, prev.progressScore + 30),
      legacyScore: Math.min(1000, prev.legacyScore + Math.round(matchImpact / 10))
    }));

    // Reward selected skills with upgrades
    setSkills(prev => prev.map(s => {
      if (s.name === 'Passe courte') return { ...s, value: Math.min(99, s.value + 0.6) };
      if (s.name === 'Appels de balle') return { ...s, value: Math.min(99, s.value + 0.4) };
      return s;
    }));

    setShowReportComplete(newMatch);
  };

  const upcomingMatch = matches.find(m => !m.completed) || matches[0];

  return (
    <div className="space-y-8 animate-fade-in text-slate-100">
      
      {/* Tab Navigation header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-sans font-black text-white tracking-wide">MATCH CENTER</h2>
          <p className="text-xs text-slate-400">Prépare ton prochain match ou analyse tes performances historiques.</p>
        </div>

        <div className="flex space-x-1 border border-slate-800 bg-slate-950/40 p-1 rounded-xl">
          <button
            onClick={() => { setActiveTab('prep'); setShowReportComplete(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              activeTab === 'prep' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Préparation Match
          </button>
          <button
            onClick={() => { setActiveTab('history'); setShowReportComplete(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              activeTab === 'history' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Historique & Rapport
          </button>
        </div>
      </div>

      {/* REPORT COMPLETED OVERLAY MODAL */}
      {showReportComplete && (
        <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative animate-scale-up">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest block">Analyse de Match Terminée !</span>
              <h3 className="text-2xl font-sans font-black text-white">Rapport : Monaco MHSC Académie</h3>
            </div>
            <button 
              onClick={() => setShowReportComplete(null)} 
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
            >
              Fermer
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-xs font-mono">
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-500 block text-[10px]">MATCH IMPACT</span>
              <span className="text-2xl font-black text-cyan-400">{showReportComplete.impactScore} / 100</span>
            </div>
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-500 block text-[10px]">COINS ATHLÈTE</span>
              <span className="text-2xl font-black text-yellow-400">+150 VX</span>
            </div>
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-500 block text-[10px]">EXPÉRIENCE PARCOURS</span>
              <span className="text-2xl font-black text-white">+900 XP</span>
            </div>
          </div>

          <div className="bg-slate-950/20 p-5 rounded-2xl border border-slate-850 space-y-4">
            <div>
              <span className="text-xs font-mono text-emerald-400 font-bold block uppercase mb-1">Points forts du match</span>
              <ul className="list-inside list-disc text-xs text-slate-300 space-y-1">
                {showReportComplete.report?.successHighlights.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div>
              <span className="text-xs font-mono text-rose-400 font-bold block uppercase mb-1">Axes de vigilance</span>
              <ul className="list-inside list-disc text-xs text-slate-300 space-y-1">
                {showReportComplete.report?.weaknessesExposed.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="pt-2 border-t border-slate-850">
              <p className="text-xs text-slate-300">
                <span className="text-yellow-400 font-semibold font-mono">Recommandation du Coach : </span>
                {showReportComplete.report?.nextActionStep}
              </p>
            </div>
          </div>
        </div>
      )}

      {!showReportComplete && activeTab === 'prep' && !upcomingMatch && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 max-w-lg mx-auto shadow-xl">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-xl font-sans font-black text-white">AUCUN MATCH PROGRAMMÉ</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tu as réinitialisé tes données de match. Demande à ton <span className="text-white font-bold">Coach IA</span> dans le chat de te programmer un match (ex: "Ajoute un match contre Monaco ce samedi"). Ton jumeau numérique va instantanément générer un plan de match tactique personnalisé et des recommandations adaptées.
          </p>
        </div>
      )}

      {!showReportComplete && activeTab === 'prep' && upcomingMatch && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Readiness, Match Plan & Advice Column */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Readiness calculation panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-2xl" />
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-black block">Pre-Match Analysis</span>
                <h3 className="text-2xl font-sans font-black text-white">INDICE DE PRÉPARATION (READINESS)</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Calculé sur l'historique d'hydratation, le sommeil de qualité (7h50 moyen) et l'adaptation à la charge de la semaine.
                </p>
              </div>

              <div className="shrink-0 text-center bg-slate-950 p-6 rounded-2xl border border-slate-850">
                <span className="text-5xl font-black font-mono text-emerald-400 block">{player.progressScore ? Math.round(player.progressScore / 10) + 7 : 91}%</span>
                <span className="text-[9px] font-mono text-slate-400 uppercase mt-1 block">Prêt à performer</span>
              </div>
            </div>

            {/* Tactical Game Plan (Monaco) */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg"><Sparkles className="w-4 h-4" /></span>
                <h3 className="text-xl font-sans font-black text-white">PLAN DE MATCH IA (CONTRE {upcomingMatch.opponent})</h3>
              </div>

              <div className="space-y-4 text-sm leading-relaxed">
                <div>
                  <span className="text-xs font-mono text-slate-400 uppercase block mb-1">Objectif principal de l'IA</span>
                  <p className="text-slate-200 font-medium">"{upcomingMatch.matchPlan?.mainObjective}"</p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono text-slate-400 uppercase block">Points de vigilance</span>
                  <ul className="list-inside list-disc text-xs text-slate-300 space-y-1">
                    {upcomingMatch.matchPlan?.vigilancePoints.map((v, i) => <li key={i}>{v}</li>)}
                  </ul>
                </div>

                <div>
                  <span className="text-xs font-mono text-slate-400 uppercase block mb-1">Conseil tactique</span>
                  <p className="text-xs text-slate-300 italic">"{upcomingMatch.matchPlan?.tacticalAdvice}"</p>
                </div>

                <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-850 space-y-1">
                  <span className="text-xs font-mono text-yellow-400 uppercase block font-bold">Nutrition Pré-Match</span>
                  <p className="text-xs text-slate-300">{upcomingMatch.matchPlan?.nutritionPreMatch}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Pre-Match Equipment Checklist */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Checklist Automatique</span>
              <h3 className="text-xl font-sans font-black text-white">VÉRIFICATION D'ÉQUIPEMENT</h3>
              <p className="text-xs text-slate-400">
                La check-list est générée en fonction de la météo (22°C dégagé) et de ta feuille de route.
              </p>
            </div>

            <div className="space-y-3">
              {checklist.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className="flex items-center space-x-3 p-3 bg-slate-950/30 rounded-xl border border-slate-850 hover:border-slate-700/60 cursor-pointer transition-colors"
                >
                  <CheckSquare className={`w-5 h-5 ${item.checked ? 'text-emerald-400 fill-emerald-500/10' : 'text-slate-600'}`} />
                  <span className={`text-xs ${item.checked ? 'text-slate-300 line-through opacity-70' : 'text-slate-100 font-medium'}`}>{item.label}</span>
                </div>
              ))}
            </div>

            <div className="text-xs font-mono text-slate-500 text-center pt-2">
              Tout est prêt avant le départ à l'échauffement.
            </div>
          </div>

        </div>
      )}

      {/* HISTORIC MATCHES & POST MATCH REPORT FORM */}
      {!showReportComplete && activeTab === 'history' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Post match stats logger form */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-850 p-6 sm:p-8 rounded-3xl space-y-5 shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Analyse de Performance</span>
              <h3 className="text-xl font-sans font-black text-white">ENREGISTRER UN MATCH RECENT</h3>
              <p className="text-xs text-slate-400">
                Saisis tes statistiques réelles de match. Le Progress Engine en déduira tes axes de développement.
              </p>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-mono">Adversaire</label>
                <input
                  type="text"
                  value={reportOpponent}
                  onChange={(e) => setReportOpponent(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 py-2.5 px-3 border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono">Type de match</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as any)}
                    className="w-full bg-slate-950 text-slate-200 py-2.5 px-3 border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="Officiel">Officiel</option>
                    <option value="Amical">Amical</option>
                    <option value="Five">Five</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-mono">Minutes jouées</label>
                  <input
                    type="number"
                    value={reportMinutes}
                    onChange={(e) => setReportMinutes(parseInt(e.target.value))}
                    className="w-full bg-slate-950 text-slate-200 py-2.5 px-3 border border-slate-800 rounded-xl focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono">Buts</label>
                  <input
                    type="number"
                    value={reportGoals}
                    onChange={(e) => setReportReportGoals(parseInt(e.target.value))}
                    className="w-full bg-slate-950 text-slate-200 py-2.5 px-3 border border-slate-800 rounded-xl focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono">Assists</label>
                  <input
                    type="number"
                    value={reportAssists}
                    onChange={(e) => setReportAssists(parseInt(e.target.value))}
                    className="w-full bg-slate-950 text-slate-200 py-2.5 px-3 border border-slate-800 rounded-xl focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono">Note globale</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={reportRating}
                    onChange={(e) => setReportRating(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 text-slate-200 py-2.5 px-3 border border-slate-800 rounded-xl focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 text-slate-950 font-sans font-black tracking-wider text-xs rounded-xl hover:bg-emerald-400 active:scale-95 transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>SOUMETTRE ET ANALYSER PAR L'IA</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Matches History Column */}
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block">Historique des rencontres</span>
            
            <div className="space-y-4">
              {matches.filter(m => m.completed).length === 0 ? (
                <div className="bg-slate-900 border border-slate-850 p-8 rounded-2xl text-center text-slate-400 text-xs font-sans leading-relaxed">
                  Aucun historique de match enregistré. Remplis et valide le formulaire ci-contre pour soumettre et analyser ton tout premier match !
                </div>
              ) : (
                matches.filter(m => m.completed).map((match) => (
                  <div key={match.id} className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-3 hover:border-slate-700 transition-colors">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono text-slate-400">{match.date}</span>
                      <span className="p-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-mono font-bold uppercase">{match.type}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-sans font-black text-white text-base">vs {match.opponent}</h4>
                        <p className="text-xs text-slate-400 mt-1 font-mono">
                          {match.playedMinutes} mins | {match.stats.goals} buts | {match.stats.assists} assists
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono text-slate-500 uppercase block">NOTE IA</span>
                        <span className="text-xl font-black text-emerald-400 font-mono">{match.rating} / 10</span>
                      </div>
                    </div>

                    {match.report && (
                      <div className="bg-slate-950/20 p-3.5 rounded-xl border border-slate-850/80 text-xs text-slate-300 leading-relaxed font-sans">
                        <span className="text-cyan-400 font-bold font-mono text-[10px] uppercase block mb-1">Rapport de Match IA</span>
                        <p className="italic">"{match.report.careerImpactPhrase}"</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
