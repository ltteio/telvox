import React, { useState } from 'react';
import { PlayerProfile, SkillNode, FootballDNA } from '../types';
import { 
  Trophy, Coins, Award, HelpCircle, Shield, Brain, Star, 
  CheckCircle, Lock, Sparkles, Activity, Target, Edit, AlertCircle, X, ChevronRight,
  Cpu, Zap, Check, Users, RefreshCw
} from 'lucide-react';
import { analyzeObjectives, ALL_OBJECTIVES } from '../utils/objectivesAnalyzer';

interface PlayerIdentityCardProps {
  player: PlayerProfile;
  setPlayer: React.Dispatch<React.SetStateAction<PlayerProfile>>;
  skills: SkillNode[];
  setSkills: React.Dispatch<React.SetStateAction<SkillNode[]>>;
  dna: FootballDNA;
  setDna: React.Dispatch<React.SetStateAction<FootballDNA>>;
  openWhyEngine: (topic: string, value: string, context: string) => void;
}

export default function PlayerIdentityCard({
  player,
  setPlayer,
  skills,
  setSkills,
  dna,
  setDna,
  openWhyEngine
}: PlayerIdentityCardProps) {
  const [selectedBranch, setSelectedBranch] = useState<'all' | 'Technique' | 'Physique' | 'Tactique' | 'Lifestyle'>('all');
  const [purchaseConfirmNode, setPurchaseConfirmNode] = useState<SkillNode | null>(null);

  // States for club integrations simulation
  const [syncingClubPlatform, setSyncingClubPlatform] = useState<string | null>(null);
  const [isClubSyncing, setIsClubSyncing] = useState(false);
  const [clubSyncProgress, setClubSyncProgress] = useState(0);
  const [clubSyncLogs, setClubSyncLogs] = useState<string[]>([]);
  const [clubUsername, setClubUsername] = useState('');
  const [clubPassword, setClubPassword] = useState('');
  const [clubLicense, setClubLicense] = useState('');
  const [clubSyncSuccessMsg, setClubSyncSuccessMsg] = useState<string | null>(null);

  const handleClubSyncInitiate = (platformName: string) => {
    setIsClubSyncing(true);
    setClubSyncProgress(0);
    setClubSyncLogs([`Connexion initiale à l'API passerelle de ${platformName}...`]);

    const steps = [
      { progress: 15, log: "Handshake sécurisé SSL/TLS établi." },
      { progress: 35, log: platformName === 'FFF Compétitions' ? "Recherche du numéro de licence dans la base FFF..." : "Authentification de l'identifiant joueur..." },
      { progress: 55, log: platformName === 'FFF Compétitions' ? "Licence trouvée : District Régional Actif. Récupération de la feuille d'engagement..." : "Compte vérifié. Récupération des jetons d'accès OAuth2..." },
      { progress: 75, log: "Extraction des métadonnées : calendriers d'entraînements, temps de jeu, convocations." },
      { progress: 90, log: "Analyse sémantique des commentaires de l'entraîneur par Telvox Progress Engine." },
      { progress: 100, log: "Intégration réussie ! Jumeau Numérique (Player Twin) enrichi et synchronisé." }
    ];

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length) {
        const step = steps[currentStepIdx];
        setClubSyncProgress(step.progress);
        setClubSyncLogs(prev => [...prev, step.log]);
        currentStepIdx++;
      } else {
        clearInterval(interval);
        setIsClubSyncing(false);
        setClubSyncSuccessMsg(`Synchronisation de ${platformName} finalisée !`);
        
        // Add connected club platform
        setPlayer(prev => {
          const connected = prev.connectedClubs || [];
          if (!connected.includes(platformName)) {
            return {
              ...prev,
              connectedClubs: [...connected, platformName],
              // Slightly boost performance stats or VX coins as a reward for connecting!
              coins: prev.coins + 150,
              xp: prev.xp + 300
            };
          }
          return prev;
        });
      }
    }, 700);
  };

  // States for career objectives editor
  const [isEditingObjectives, setIsEditingObjectives] = useState(false);
  const [tempObjectives, setTempObjectives] = useState<string[]>(player.selectedObjectives || []);

  const handleOpenObjectivesEditor = () => {
    setTempObjectives(player.selectedObjectives || []);
    setIsEditingObjectives(true);
  };

  const handleToggleTempObjective = (obj: string) => {
    if (tempObjectives.includes(obj)) {
      setTempObjectives(prev => prev.filter(o => o !== obj));
    } else {
      setTempObjectives(prev => [...prev, obj]);
    }
  };

  const handleSaveObjectives = () => {
    const analysis = analyzeObjectives(tempObjectives);
    
    // Update player profile
    setPlayer(prev => ({
      ...prev,
      selectedObjectives: tempObjectives,
      currentGoal: analysis.primaryGoal
    }));

    // Instantly apply DNA boosts from the new goals list
    setDna(prevDna => {
      const updatedDna = { ...prevDna };
      Object.entries(analysis.dnaAdjustments).forEach(([attr, val]) => {
        const k = attr as keyof FootballDNA;
        // Apply target adjustments
        updatedDna[k] = Math.min(98, Math.max(45, updatedDna[k] + val));
      });
      return updatedDna;
    });

    setIsEditingObjectives(false);
  };

  // Run initial or current objectives analysis for rendering on dashboard
  const currentAnalysis = analyzeObjectives(player.selectedObjectives || []);

  // Filter tree nodes based on category
  const filteredSkills = skills.filter(node => 
    selectedBranch === 'all' || node.category === selectedBranch
  );

  // Spend Coins to Unlock a Node
  const unlockSkillNode = (node: SkillNode) => {
    if (player.coins < node.cost) return;

    // Deduct coins & update player
    setPlayer(prev => ({
      ...prev,
      coins: prev.coins - node.cost,
      xp: prev.xp + 250, // grant bonus XP
      progressScore: Math.min(1000, prev.progressScore + 15),
      legacyScore: Math.min(1000, prev.legacyScore + 5)
    }));

    // Unlock skill in tree
    setSkills(prev => prev.map(s => {
      if (s.id === node.id) {
        return { ...s, unlocked: true, value: s.value + 5 }; // boost level by +5 on unlock
      }
      return s;
    }));

    setPurchaseConfirmNode(null);
  };

  // Calculate Overall Rating (OVR) of the unlocked attributes
  const unlockedSkills = skills.filter(s => s.unlocked && s.cost > 0 || s.cost === 0);
  const calculatedOvr = Math.round(unlockedSkills.reduce((acc, curr) => acc + curr.value, 0) / unlockedSkills.length);

  type Rarity = 'Bronze' | 'Argent' | 'Or' | 'Elite' | 'Wonderkid' | 'Future Star' | 'Legend' | 'GOAT';

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

  const getCardDesignClasses = (rarity: Rarity) => {
    switch (rarity) {
      case 'Bronze':
        return {
          wrapper: "bg-gradient-to-b from-amber-950 to-yellow-950 border-amber-800/80 shadow-[0_0_20px_rgba(217,119,6,0.15)]",
          badge: "bg-amber-800 text-amber-100",
          accentText: "text-amber-500",
        };
      case 'Argent':
        return {
          wrapper: "bg-gradient-to-b from-slate-800 to-slate-950 border-slate-700/80 shadow-[0_0_20px_rgba(203,213,225,0.15)]",
          badge: "bg-slate-700 text-slate-100",
          accentText: "text-cyan-400",
        };
      case 'Or':
        return {
          wrapper: "bg-gradient-to-b from-amber-400/20 via-amber-500/10 to-yellow-950 border-yellow-500 shadow-[0_0_25px_rgba(251,191,36,0.2)]",
          badge: "bg-amber-500 text-amber-950 font-black",
          accentText: "text-amber-300",
        };
      case 'Elite':
        return {
          wrapper: "bg-gradient-to-b from-red-950/40 via-slate-950 to-red-950 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.25)]",
          badge: "bg-red-600 text-white font-black animate-pulse",
          accentText: "text-red-400",
        };
      case 'Wonderkid':
        return {
          wrapper: "bg-gradient-to-br from-violet-950 via-slate-950 to-teal-950 border-teal-400 shadow-[0_0_30px_rgba(45,212,191,0.3)]",
          badge: "bg-teal-400 text-slate-950 font-bold",
          accentText: "text-teal-300",
        };
      case 'Future Star':
        return {
          wrapper: "bg-gradient-to-b from-purple-900/40 via-fuchsia-950 to-slate-950 border-fuchsia-500 shadow-[0_0_30px_rgba(217,70,239,0.3)]",
          badge: "bg-fuchsia-500 text-white font-bold",
          accentText: "text-fuchsia-300",
        };
      case 'Legend':
        return {
          wrapper: "bg-gradient-to-b from-emerald-950 via-slate-950 to-yellow-950 border-yellow-400 shadow-[0_0_35px_rgba(234,179,8,0.3)]",
          badge: "bg-yellow-400 text-emerald-950 font-black",
          accentText: "text-yellow-400",
        };
      case 'GOAT':
      default:
        return {
          wrapper: "bg-gradient-to-tr from-slate-950 via-black to-slate-900 border-white shadow-[0_0_45px_rgba(255,255,255,0.35)] ring-2 ring-white/10",
          badge: "bg-white text-black font-black",
          accentText: "text-purple-300",
        };
    }
  };

  const activeRarity = getRarityFromLevel(player.level);
  const cardDesign = getCardDesignClasses(activeRarity);

  // Radar chart metrics calculation
  const dimensions = [
    { label: 'Technique', value: Math.round(skills.filter(s => s.category === 'Technique').reduce((a,c) => a + c.value, 0) / skills.filter(s => s.category === 'Technique').length) },
    { label: 'Physique', value: Math.round(skills.filter(s => s.category === 'Physique').reduce((a,c) => a + c.value, 0) / skills.filter(s => s.category === 'Physique').length) },
    { label: 'Tactique', value: Math.round(skills.filter(s => s.category === 'Tactique').reduce((a,c) => a + c.value, 0) / skills.filter(s => s.category === 'Tactique').length) },
    { label: 'Mental', value: Math.round(skills.filter(s => s.category === 'Mental').reduce((a,c) => a + c.value, 0) / skills.filter(s => s.category === 'Mental').length) },
    { label: 'Lifestyle', value: Math.round(skills.filter(s => s.category === 'Lifestyle').reduce((a,c) => a + c.value, 0) / skills.filter(s => s.category === 'Lifestyle').length) },
    { label: 'Football IQ', value: 79 } // Fixed baseline index for simulation
  ];

  // SVG Radar generator parameters
  const centerX = 150;
  const centerY = 150;
  const radius = 100;

  const points = dimensions.map((d, i) => {
    const angle = (i * 2 * Math.PI) / dimensions.length - Math.PI / 2;
    const factor = d.value / 100;
    const x = centerX + radius * factor * Math.cos(angle);
    const y = centerY + radius * factor * Math.sin(angle);
    return { x, y, label: d.label, val: d.value, angle };
  });

  const polygonPath = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="space-y-8 animate-fade-in text-slate-100">
      
      {/* Chapter 6: The Premium Player Digital Twin Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Living Player Card (OVR 76) */}
        <div className="lg:col-span-4 flex justify-center">
          <div className={`w-full max-w-[320px] h-[460px] border-2 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between group transition-all duration-500 ${cardDesign.wrapper}`}>
            {/* Visual shine overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-cyan-500/10 opacity-30 group-hover:opacity-60 transition-opacity duration-500" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-12 -mt-12" />

            {/* OVR & Badge Header */}
            <div className="relative z-10 flex justify-between items-start">
              <div className="flex flex-col items-center">
                <span className="text-5xl font-black text-white font-mono tracking-tight">{calculatedOvr}</span>
                <span className={`text-xs font-bold font-mono uppercase tracking-widest mt-1 ${cardDesign.accentText}`}>OVR</span>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <span className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase font-black tracking-widest ${cardDesign.badge}`}>
                  {activeRarity}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Niveau {player.level}</span>
              </div>
            </div>

            {/* Player Visual Placeholder */}
            <div className="relative z-10 my-4 flex-1 flex flex-col items-center justify-center">
              <div className="w-28 h-28 rounded-full bg-slate-900 border-4 border-slate-800 flex items-center justify-center relative overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300">
                {player.photoUrl ? (
                  <img src={player.photoUrl} alt="Player portrait" className="w-full h-full object-cover object-top" referrerPolicy="no-referrer" />
                ) : (
                  <span className="font-sans font-black text-2xl text-slate-400">{player.firstName[0]}{player.lastName[0]}</span>
                )}
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight mt-4">{player.firstName} {player.lastName}</h2>
              <span className={`px-3 py-1 bg-slate-800/80 border border-slate-700/60 rounded-full text-xs font-mono mt-1 uppercase tracking-wide ${cardDesign.accentText}`}>
                {player.position}
              </span>
            </div>

            {/* Profile Footer Metrics */}
            <div className="relative z-10 border-t border-slate-800/80 pt-4 grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div>
                <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Taille</span>
                <span className="font-bold text-slate-200">{player.size} cm</span>
              </div>
              <div className="border-x border-slate-800/80">
                <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Poids</span>
                <span className="font-bold text-slate-200">{player.weight} kg</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Pied</span>
                <span className="font-bold text-slate-200">{player.preferredFoot}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Skills Radar Diagram (SVG) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
          <div className="space-y-2">
            <h3 className="text-xl font-sans font-black text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span>Graphe de Compétences Digitales</span>
            </h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Clique sur l'une des dimensions pour interroger le <span className="text-slate-200 font-medium">Why Engine</span> et obtenir une analyse instantanée des causes physiologiques ou sportives de ton niveau.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center my-6">
            
            {/* The SVG Radar Graph */}
            <div className="flex justify-center">
              <svg width="300" height="300" className="drop-shadow-2xl">
                {/* Background Grid Circles */}
                {[0.25, 0.5, 0.75, 1].map((scale, index) => {
                  const r = radius * scale;
                  return (
                    <circle
                      key={index}
                      cx={centerX}
                      cy={centerY}
                      r={r}
                      fill="none"
                      stroke="rgba(71, 85, 105, 0.3)"
                      strokeWidth="1"
                      strokeDasharray={scale === 1 ? "none" : "2,2"}
                    />
                  );
                })}

                {/* Radar Web Lines */}
                {points.map((p, i) => {
                  const xMax = centerX + radius * Math.cos(p.angle);
                  const yMax = centerY + radius * Math.sin(p.angle);
                  return (
                    <line
                      key={i}
                      x1={centerX}
                      y1={centerY}
                      x2={xMax}
                      y2={yMax}
                      stroke="rgba(71, 85, 105, 0.25)"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Plot Unlocked Skills Area Polygon */}
                <polygon
                  points={polygonPath}
                  fill="rgba(16, 185, 129, 0.15)"
                  stroke="rgba(16, 185, 129, 0.8)"
                  strokeWidth="2"
                  className="transition-all duration-500"
                />

                {/* Dot Highlights & Interactive Labels */}
                {points.map((p, i) => (
                  <g key={i} className="cursor-pointer group" onClick={() => openWhyEngine(p.label, `${p.val}/100`, `Ta note de ${p.label} de ${p.val}/100 est une moyenne dynamique de ton profil d'entraînement.`)}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4"
                      className="fill-emerald-400 stroke-slate-900 stroke-2 group-hover:scale-125 transition-transform duration-200"
                    />
                    {/* Floating Values */}
                    <text
                      x={p.x}
                      y={p.y - 8}
                      textAnchor="middle"
                      className="fill-emerald-400 font-mono font-bold text-[9px] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      {p.val}
                    </text>
                    {/* Dimension Name Labels */}
                    <text
                      x={centerX + (radius + 22) * Math.cos(p.angle)}
                      y={centerY + (radius + 15) * Math.sin(p.angle) + 4}
                      textAnchor="middle"
                      className="fill-slate-400 font-sans font-bold text-[10px] group-hover:fill-emerald-400 transition-colors duration-200"
                    >
                      {p.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            {/* DNA Metrics Sidebar */}
            <div className="space-y-4">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest font-black block">Football ADN</span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {Object.entries(dna).map(([key, val]) => (
                  <div key={key} className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80 flex justify-between items-center">
                    <span className="text-slate-400 capitalize">{key}</span>
                    <span className="font-mono font-bold text-emerald-400">{val}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* NEW: Career Objectives & AI Diagnostic Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.03),transparent_50%)] pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 relative z-10">
          <div className="space-y-1">
            <h3 className="text-xl font-sans font-black text-white flex items-center space-x-2">
              <Target className="w-5 h-5 text-emerald-400" />
              <span>Objectifs de Carrière & Diagnostic IA</span>
            </h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Gère tes ambitions et surveille les diagnostics systémiques de ton Player Twin. L'IA adapte instantanément ton programme.
            </p>
          </div>

          <button
            onClick={handleOpenObjectivesEditor}
            className="self-start sm:self-center px-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 font-mono text-xs rounded-xl flex items-center space-x-2 transition-all cursor-pointer hover:text-white"
          >
            <Edit className="w-4 h-4 text-emerald-400" />
            <span>MODIFIER MES OBJECTIFS</span>
          </button>
        </div>

        {/* Diagnostic display grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
          {/* Left Column: Primary & Secondary Goals */}
          <div className="md:col-span-6 space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Objectif Majeur Actuel</span>
              <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-2xl flex items-center space-x-3 text-emerald-200">
                <Trophy className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-sans font-black text-sm uppercase tracking-wide">{player.currentGoal || player.selectedObjectives?.[0] || 'Devenir professionnel'}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Ambitions secondaires</span>
              <div className="flex flex-wrap gap-2">
                {player.selectedObjectives?.filter(g => g !== player.currentGoal).map((goal) => (
                  <span key={goal} className="px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-300 font-medium">
                    {goal}
                  </span>
                )) || <span className="text-xs text-slate-500 italic">Aucun objectif secondaire sélectionné.</span>}
              </div>
            </div>
          </div>

          {/* Right Column: AI Analysis reports (Synergies & Conflicts) */}
          <div className="md:col-span-6 space-y-3 bg-slate-950/40 border border-slate-850 p-4 rounded-2xl max-h-[220px] overflow-y-auto custom-scrollbar">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block border-b border-slate-850 pb-1">Analyse des Synergies & Risques IA</span>
            
            <div className="space-y-2.5">
              {/* Synergies */}
              {currentAnalysis.synergies.map((syn, idx) => (
                <div key={idx} className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-400 flex items-center space-x-1 uppercase text-[9px] tracking-wider font-mono">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>SYNERGIE POSITIVE DÉTECTÉE</span>
                  </span>
                  <p className="text-slate-300 text-xs leading-relaxed">{syn}</p>
                </div>
              ))}

              {/* Conflicts */}
              {currentAnalysis.conflicts.map((conf, idx) => (
                <div key={idx} className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl space-y-1">
                  <span className="font-bold text-yellow-400 flex items-center space-x-1 uppercase text-[9px] tracking-wider font-mono">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>RISQUE DE SURCHARGE PHYSIQUE</span>
                  </span>
                  <p className="text-slate-300 text-xs leading-relaxed">{conf}</p>
                </div>
              ))}

              {currentAnalysis.conflicts.length === 0 && currentAnalysis.synergies.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-xs">
                  <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
                  <span className="font-mono uppercase tracking-wider block text-[10px]">Profil Équilibré</span>
                  <p className="text-slate-500 mt-1">Aucune contrainte athlétique ou contradiction diététique détectée.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* INLINE OBJECTIVES EDITOR MODAL */}
        {isEditingObjectives && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative text-slate-100 animate-scale-up flex flex-col max-h-[90vh]">
              
              <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
                <div className="space-y-0.5">
                  <h4 className="text-xl font-sans font-black text-white uppercase tracking-wide flex items-center space-x-2">
                    <Target className="w-5 h-5 text-emerald-400 animate-pulse" />
                    <span>Éditer mes objectifs de carrière</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono">Sélectionne autant d'objectifs que tu le souhaites</p>
                </div>
                <button
                  onClick={() => setIsEditingObjectives(false)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Checklist Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 overflow-y-auto pr-1 flex-1 custom-scrollbar max-h-[360px] pb-4">
                {ALL_OBJECTIVES.map((obj) => {
                  const isSelected = tempObjectives.includes(obj);
                  return (
                    <div
                      key={obj}
                      onClick={() => handleToggleTempObjective(obj)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between text-xs ${
                        isSelected 
                          ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-md' 
                          : 'bg-slate-950/60 border-slate-850 hover:border-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="font-bold">{obj}</span>
                      <div className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${
                        isSelected ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-800'
                      }`}>
                        {isSelected && <CheckCircle className="w-3 h-3 text-slate-950 fill-current" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-800 pt-4 mt-4 flex justify-end space-x-3 text-xs font-mono font-bold shrink-0">
                <button
                  onClick={() => setIsEditingObjectives(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl cursor-pointer"
                >
                  ANNULER
                </button>
                <button
                  disabled={tempObjectives.length === 0}
                  onClick={handleSaveObjectives}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 rounded-xl cursor-pointer hover:scale-102 active:scale-98 transition-all flex items-center space-x-1.5"
                >
                  <span>METTRE À JOUR MON TWIN</span>
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* 🏟️ Écosystème Clubs & Synchronisation en continu */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(6,182,212,0.03),transparent_50%)] pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 relative z-10">
          <div className="space-y-1">
            <h3 className="text-xl font-sans font-black text-white flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              <span>🏟️ Connexions Plateformes Clubs (SportEasy, TeamPulse...)</span>
            </h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Connecte Telvox aux outils de ton club pour importer automatiquement ton calendrier, tes convocations et tes temps de jeu sans double saisie.
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-slate-950/60 border border-slate-800/80 px-3 py-1.5 rounded-xl">
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span className="text-[10px] font-mono text-slate-300 uppercase font-black tracking-wider">Synchronisation Temps Réel</span>
          </div>
        </div>

        {/* Platforms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          {[
            {
              name: 'SportEasy',
              tag: 'Le plus populaire',
              desc: 'Calendrier, convocations & temps de jeu',
              color: 'from-blue-600/10 to-indigo-600/5 hover:border-blue-500/40 border-slate-880',
              textColor: 'text-blue-400',
              badgeColor: 'bg-blue-500/10 text-blue-300 border-blue-500/20'
            },
            {
              name: 'TeamPulse',
              tag: 'Intuitif & Simple',
              desc: 'Séances, présence & notes du coach',
              color: 'from-emerald-600/10 to-teal-600/5 hover:border-emerald-500/40 border-slate-880',
              textColor: 'text-emerald-400',
              badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
            },
            {
              name: 'BeSport',
              tag: 'Stats & Compo',
              desc: 'Stats de match, buts, passes & tactique',
              color: 'from-orange-600/10 to-red-600/5 hover:border-orange-500/40 border-slate-880',
              textColor: 'text-orange-400',
              badgeColor: 'bg-orange-500/10 text-orange-300 border-orange-500/20'
            },
            {
              name: 'FFF Compétitions',
              tag: 'Officiel & Certifié',
              desc: 'Calendrier Ligue, licences & feuilles de match',
              color: 'from-cyan-600/10 to-blue-600/5 hover:border-cyan-500/40 border-slate-880',
              textColor: 'text-cyan-400',
              badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
            }
          ].map((plat) => {
            const isConnected = (player.connectedClubs || []).includes(plat.name);
            return (
              <div
                key={plat.name}
                className={`bg-gradient-to-br ${plat.color} border p-4 rounded-2xl relative overflow-hidden transition-all flex flex-col justify-between h-40 ${isConnected ? 'ring-2 ring-emerald-500/20 border-emerald-500/50 bg-emerald-950/10' : ''}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-black uppercase font-sans tracking-wide ${plat.textColor}`}>
                      {plat.name}
                    </span>
                    {isConnected ? (
                      <span className="flex items-center space-x-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[9px] px-2 py-0.5 rounded-full font-mono uppercase font-bold">
                        ✓ Connecté
                      </span>
                    ) : (
                      <span className={`text-[8px] px-2 py-0.5 border rounded-full font-mono font-bold uppercase ${plat.badgeColor}`}>
                        {plat.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    {plat.desc}
                  </p>
                </div>

                <div className="pt-3">
                  {isConnected ? (
                    <button
                      type="button"
                      onClick={() => {
                        setPlayer(prev => ({
                          ...prev,
                          connectedClubs: (prev.connectedClubs || []).filter(c => c !== plat.name)
                        }));
                        if (syncingClubPlatform === plat.name) {
                          setSyncingClubPlatform(null);
                          setClubSyncSuccessMsg(null);
                        }
                      }}
                      className="w-full bg-slate-950 hover:bg-red-500/10 hover:text-red-400 border border-slate-800 text-[10px] font-mono py-1.5 rounded-xl uppercase tracking-wider text-slate-400 hover:border-red-500/20 transition-all cursor-pointer"
                    >
                      Déconnecter la plateforme
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
                      className={`w-full py-1.5 rounded-xl text-[10px] font-mono uppercase tracking-widest font-bold transition-all cursor-pointer ${syncingClubPlatform === plat.name ? 'bg-cyan-500 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.4)]' : 'bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300'}`}
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
        {syncingClubPlatform && !(player.connectedClubs || []).includes(syncingClubPlatform) && (
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 sm:p-5 space-y-4 relative overflow-hidden z-10">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <span className="text-xs font-mono text-cyan-400 uppercase font-black tracking-widest flex items-center space-x-2">
                <Cpu className="w-4 h-4 animate-pulse" />
                <span>Liaison sécurisée API avec {syncingClubPlatform}</span>
              </span>
              <button
                type="button"
                onClick={() => setSyncingClubPlatform(null)}
                className="text-[10px] font-mono text-slate-500 hover:text-white uppercase font-bold"
              >
                Fermer ×
              </button>
            </div>

            {!isClubSyncing ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                {syncingClubPlatform === 'FFF Compétitions' ? (
                  <div className="sm:col-span-2">
                    <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold mb-1.5">Numéro de Licence Joueur FFF (ex: 12847104)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Saisis ton numéro de licence FFF officiel..."
                        value={clubLicense}
                        onChange={e => setClubLicense(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500"
                      />
                      <div className="text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800 rounded-xl px-3 flex items-center uppercase font-bold">
                        LIGUE / DISTRICT
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold mb-1.5">Identifiant / Email {syncingClubPlatform}</label>
                      <input
                        type="email"
                        placeholder="nom@exemple.com"
                        value={clubUsername}
                        onChange={e => setClubUsername(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold mb-1.5">Mot de passe de la plateforme</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={clubPassword}
                        onChange={e => setClubPassword(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </>
                )}

                <div>
                  <button
                    type="button"
                    onClick={() => handleClubSyncInitiate(syncingClubPlatform)}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-sans font-black text-xs uppercase py-3 rounded-xl shadow-lg hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <Zap className="w-4 h-4 text-slate-950 font-black" />
                    <span>SYNCHRONISER MON COMPTE ⚡</span>
                  </button>
                </div>
              </div>
            ) : (
              // Syncloader logs terminal inside profile
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-cyan-400 font-bold uppercase animate-pulse">Liaison bidirectionnelle en cours...</span>
                  <span className="text-slate-400 font-bold">{clubSyncProgress}%</span>
                </div>
                <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-2 overflow-hidden p-0.5">
                  <div
                    className="bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${clubSyncProgress}%` }}
                  />
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl font-mono text-[10px] text-slate-400 space-y-1.5 h-28 overflow-y-auto">
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

        {/* Success Preview */}
        {clubSyncSuccessMsg && (
          <div className="bg-emerald-500/5 border border-emerald-500/25 rounded-2xl p-4 sm:p-5 space-y-4 relative overflow-hidden z-10 animate-fade-in">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="text-xs font-mono text-emerald-400 uppercase font-black tracking-widest">
                {clubSyncSuccessMsg}
              </span>
            </div>

            {/* Data points visual block */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
              {[
                { label: 'Calendriers', value: 'Auto-sync', desc: 'Entraînements & Matchs' },
                { label: 'Convocations', value: 'Actif', desc: 'Alertes directes push' },
                { label: 'Temps de jeu', value: '80 min / match', desc: 'Historique des minutes' },
                { label: 'Poste Occupé', value: 'RW (Ailier Droit)', desc: 'Vitesse explosive ciblée' },
                { label: 'Commentaires Coach', value: 'IA Interprétée', desc: 'Adaptation de charge' }
              ].map((dp, i) => (
                <div key={i} className="bg-slate-950 border border-slate-850 p-3 rounded-xl text-center">
                  <span className="block text-[9px] font-mono text-slate-500 uppercase font-semibold">{dp.label}</span>
                  <span className="block text-xs font-sans text-white font-black mt-1">{dp.value}</span>
                  <span className="block text-[8px] font-mono text-emerald-400/80 mt-1 leading-snug">{dp.desc}</span>
                </div>
              ))}
            </div>

            {/* Dynamic Coach Comment inside */}
            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-start space-x-3 mt-1.5">
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 text-cyan-400 font-black text-xs uppercase shrink-0">
                IA
              </div>
              <div>
                <span className="block text-xs font-mono text-cyan-400 uppercase font-black">Coach IA Telvox</span>
                <p className="text-xs text-slate-300 font-mono mt-1.5 leading-relaxed">
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

      {/* Chapter 11: The Interactive Career Tree Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xl font-sans font-black text-white flex items-center space-x-2">
              <Brain className="w-5 h-5 text-yellow-400" />
              <span>L'Arbre de Carrière Intellectuel (Career Tree)</span>
            </h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Chaque grande étape débloque de nouvelles spécialisations. Dépense tes <span className="text-yellow-400 font-semibold font-mono">Coins (VX)</span> gagnés à l'effort pour déverrouiller des compétences de pointe et augmenter ton OVR.
            </p>
          </div>

          {/* Filter Branches */}
          <div className="flex flex-wrap items-center gap-1 border border-slate-800 bg-slate-950/40 p-1 rounded-xl overflow-visible">
            {(['all', 'Technique', 'Physique', 'Tactique', 'Lifestyle'] as const).map((branch) => (
              <button
                key={branch}
                onClick={() => setSelectedBranch(branch)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  selectedBranch === branch 
                    ? 'bg-yellow-500 text-slate-950 font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {branch === 'all' ? 'Toutes' : branch}
              </button>
            ))}
          </div>
        </div>

        {/* Tree Nodes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {filteredSkills.map((node) => {
            const isRoot = node.cost === 0;
            const canAfford = player.coins >= node.cost;

            return (
              <div 
                key={node.id}
                className={`p-5 rounded-2xl border-2 flex flex-col justify-between transition-all duration-300 relative group overflow-hidden ${
                  node.unlocked 
                    ? 'bg-slate-950/20 border-emerald-500/30' 
                    : isRoot 
                      ? 'bg-slate-950/20 border-slate-800'
                      : canAfford 
                        ? 'bg-slate-900 border-yellow-500/20 hover:border-yellow-500/40' 
                        : 'bg-slate-950/60 border-slate-900 opacity-80'
                }`}
              >
                {/* Node overlay graphics */}
                {node.unlocked && (
                  <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/5 rounded-full blur-lg" />
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">{node.category}</span>
                    {node.unlocked ? (
                      <span className="p-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-mono font-bold flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>ACQUIS</span>
                      </span>
                    ) : isRoot ? (
                      <span className="text-[10px] text-slate-400 font-mono">Pilier</span>
                    ) : (
                      <span className="p-1 bg-yellow-500/10 text-yellow-400 rounded-lg text-[10px] font-mono font-bold flex items-center space-x-1">
                        <Lock className="w-3 h-3" />
                        <span>{node.cost} VX</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-sans font-black text-slate-100 group-hover:text-emerald-400 transition-colors">{node.name}</h4>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">{node.description}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/40 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">VALEUR ACTUELLE</span>
                    <span className="font-mono font-bold text-white text-lg">{node.value} / 100</span>
                  </div>

                  {!node.unlocked && !isRoot && (
                    <button
                      onClick={() => setPurchaseConfirmNode(node)}
                      disabled={!canAfford}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                        canAfford 
                          ? 'bg-yellow-500 text-slate-950 hover:bg-yellow-400 shadow-md shadow-yellow-500/10' 
                          : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      DÉBLOQUER
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unlock Confirmation Modal */}
      {purchaseConfirmNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-slate-100 animate-scale-up">
            <h4 className="text-xl font-sans font-black text-white mb-2 uppercase tracking-wide flex items-center space-x-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span>Acheter compétence</span>
            </h4>
            <p className="text-xs text-slate-400 mb-6 font-mono">
              Es-tu sûr de vouloir débloquer la compétence <span className="text-white font-bold font-sans">"{purchaseConfirmNode.name}"</span> pour ton Player Twin ?
            </p>

            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 space-y-3 mb-6">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Coût de déverrouillage :</span>
                <span className="font-mono font-bold text-yellow-400">{purchaseConfirmNode.cost} VX Coins</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Tes ressources actuelles :</span>
                <span className="font-mono font-bold text-slate-200">{player.coins} VX Coins</span>
              </div>
              <div className="flex justify-between text-xs border-t border-slate-800 pt-2 font-bold">
                <span className="text-emerald-400">Bonus d'acquisition :</span>
                <span className="text-emerald-400 font-mono">+5 Points de Niveau, +250 XP</span>
              </div>
            </div>

            <div className="flex space-x-3 justify-end text-xs font-mono font-bold">
              <button
                onClick={() => setPurchaseConfirmNode(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                ANNULER
              </button>
              <button
                onClick={() => {
                  if (player.coins >= purchaseConfirmNode.cost) {
                    player.coins -= purchaseConfirmNode.cost;
                    purchaseConfirmNode.unlocked = true;
                    purchaseConfirmNode.value += 5; // boosting rating
                    player.xp += 250;
                  }
                  setPurchaseConfirmNode(null);
                }}
                className="px-4 py-2 bg-yellow-500 text-slate-950 hover:bg-yellow-400 rounded-xl cursor-pointer"
              >
                CONFIRMER
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
