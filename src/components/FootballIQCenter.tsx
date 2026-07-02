import React, { useState } from 'react';
import { PlayerProfile, FootballIQVideo } from '../types';
import { Play, Award, CheckCircle2, AlertTriangle, ArrowRight, BookOpen, Brain, Youtube, HelpCircle, Trophy } from 'lucide-react';

interface FootballIQCenterProps {
  player: PlayerProfile;
  setPlayer: React.Dispatch<React.SetStateAction<PlayerProfile>>;
  setSkills: React.Dispatch<React.SetStateAction<any[]>>;
}

// Curated mock videos based on positions/skills
const FOOTBALL_IQ_LIBRARY: FootballIQVideo[] = [
  {
    id: "viq_1",
    title: "Le Déplacement Tactique de l'Ailier Moderne (Zone d'Ombre)",
    youtubeUrl: "https://www.youtube.com/embed/z9G8P7k_t3I", // Educational demonstration placeholder / link
    category: "Déplacements & Appels",
    description: "Analyse du timing de démarquage dans le dos du latéral adverse, et occupation des demi-espaces (half-spaces) sous pression.",
    quizQuestions: [
      {
        question: "Quand l'ailier doit-il déclencher son appel diagonal vers l'intérieur ?",
        options: [
          "Dès que le milieu de terrain lève la tête et que le ballon est contrôlé orienté vers l'avant",
          "Dès que le défenseur central adverse a le ballon",
          "Uniquement après le franchissement de la ligne médiane, peu importe l'orientation du porteur",
          "Quand le latéral adverse est aligné de face"
        ],
        correctIndex: 0,
        explanation: "Le timing de l'appel dépend de l'orientation du corps du porteur. S'il lève la tête et oriente ses épaules, l'espace se libère et l'appel devient synchrone."
      },
      {
        question: "Qu'est-ce qu'une 'zone d'ombre' (blind side) pour un défenseur latéral ?",
        options: [
          "La zone située directement entre les deux défenseurs centraux",
          "La zone située derrière son épaule extérieure, hors de son champ de vision direct",
          "L'espace situé devant lui où il peut facilement intercepter",
          "Le poteau de corner adverse"
        ],
        correctIndex: 1,
        explanation: "Se situer dans la zone d'ombre force le défenseur à tourner la tête pour vous repérer, ce qui l'empêche de suivre simultanément la balle des yeux."
      },
      {
        question: "Pour un ailier droit gaucher (ailier inversé), quel est l'avantage de rentrer à l'intérieur ?",
        options: [
          "Centrer immédiatement du pied droit en bout de course",
          "S'ouvrir l'angle de tir ou de passe enroulée du pied gauche, et libérer le couloir pour le latéral",
          "Gagner du temps pour ralentir le jeu collectif",
          "Forcer le milieu défensif à s'excentrer"
        ],
        correctIndex: 1,
        explanation: "Rentrer à l'intérieur crée une incertitude, permet de frapper du pied fort ou de délivrer une passe clé diagonale vers l'opposé, tout en libérant le couloir extérieur pour l'appel du latéral."
      }
    ],
    completed: false
  },
  {
    id: "viq_2",
    title: "La Prise d'Information Périphérique (Scan) - Analyse Xavi / De Bruyne",
    youtubeUrl: "https://www.youtube.com/embed/D3hOnkMv9Rk",
    category: "Prise d'Information",
    description: "Comment augmenter sa fréquence de scan visuel de 0.5 à 2.0 scans par seconde pour anticiper toutes les transmissions.",
    quizQuestions: [
      {
        question: "À quel moment précis le joueur élite effectue-t-il son scan visuel majeur ?",
        options: [
          "Pendant que le ballon est en mouvement entre deux joueurs",
          "Au moment exact où il contrôle le ballon",
          "Uniquement lorsque le ballon est arrêté",
          "Pendant qu'il sprinte à pleine vitesse"
        ],
        correctIndex: 0,
        explanation: "Scanner lorsque le ballon circule permet de capter les positions adverses sans perdre le contrôle de la balle à la réception."
      },
      {
        question: "Quel est le nombre moyen de scans visuels recommandés par seconde avant de recevoir la balle ?",
        options: [
          "Au moins 3 à 4 scans dans les 10 secondes précédant le contrôle",
          "Zéro scan, il faut fixer le ballon des yeux",
          "1 scan toutes les 3 minutes",
          "Uniquement lors des coups de pied arrêtés"
        ],
        correctIndex: 0,
        explanation: "Les meilleurs milieux et ailiers effectuent entre 3 et 5 balayages visuels complets de l'environnement immédiat avant de contrôler."
      },
      {
        question: "En recevant la balle dos au jeu, quel est l'indice prioritaire à scanner ?",
        options: [
          "Le placement de l'arbitre central",
          "La distance et la vitesse de charge du défenseur direct dans votre dos",
          "La hauteur de l'herbe sur le côté opposé",
          "La position des supporters dans les gradins"
        ],
        correctIndex: 1,
        explanation: "Savoir si le défenseur colle, recule ou sort à l'anticipation dicte instantanément si vous devez jouer en une touche, vous retourner ou protéger votre balle."
      }
    ],
    completed: false
  }
];

export default function FootballIQCenter({ player, setPlayer, setSkills }: FootballIQCenterProps) {
  const [videos, setVideos] = useState<FootballIQVideo[]>(() => {
    const stored = localStorage.getItem('football_ai_iq_videos');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return FOOTBALL_IQ_LIBRARY;
  });

  const [activeVideo, setActiveVideo] = useState<FootballIQVideo>(videos[0]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(-1); // -1: not started, 0+: question index, 99: result
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  const saveVideos = (newVideos: FootballIQVideo[]) => {
    setVideos(newVideos);
    localStorage.setItem('football_ai_iq_videos', JSON.stringify(newVideos));
  };

  const handleStartQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedAnswers([]);
    setQuizScore(0);
    setShowExplanation(false);
  };

  const handleAnswerSelect = (optionIdx: number) => {
    if (showExplanation) return;
    const isCorrect = optionIdx === activeVideo.quizQuestions[currentQuizIndex].correctIndex;
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }
    
    setSelectedAnswers(prev => [...prev, optionIdx]);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
    if (currentQuizIndex < activeVideo.quizQuestions.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      // Quiz finished !
      setCurrentQuizIndex(99);
      
      // Update video completion in state
      const updated = videos.map(v => {
        if (v.id === activeVideo.id) {
          return { ...v, completed: true, quizPassed: quizScore >= 2 };
        }
        return v;
      });
      saveVideos(updated);

      // Reward player on successful pass
      if (quizScore >= 2) {
        setPlayer(prev => ({
          ...prev,
          xp: prev.xp + 400,
          coins: prev.coins + 100,
          level: prev.xp + 400 >= prev.xpNextLevel ? prev.level + 1 : prev.level,
          xpNextLevel: prev.xp + 400 >= prev.xpNextLevel ? prev.xpNextLevel + 1000 : prev.xpNextLevel,
          progressScore: Math.min(1000, prev.progressScore + 25)
        }));

        // Upgrade Football IQ rating node specifically
        setSkills(prev => prev.map(s => {
          if (s.id === 'tact_2' || s.name.includes('Prise d\'information') || s.id === 'tact_root') {
            return { ...s, value: Math.min(99, s.value + 4), unlocked: true };
          }
          return s;
        }));
      }
    }
  };

  const currentQuestion = currentQuizIndex >= 0 && currentQuizIndex < 99 ? activeVideo.quizQuestions[currentQuizIndex] : null;

  return (
    <div className="space-y-8 animate-fade-in text-slate-100">
      
      {/* Title */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-sans font-black text-white uppercase tracking-wide">Football IQ Room</h2>
            <p className="text-xs text-slate-400">Développe ton intelligence de jeu en analysant des vidéos de niveau élite.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Videos list left sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest block">Séances Planifiées</span>
          
          <div className="space-y-3">
            {videos.map(video => {
              const isActive = activeVideo.id === video.id;
              return (
                <button
                  key={video.id}
                  onClick={() => {
                    setActiveVideo(video);
                    setCurrentQuizIndex(-1);
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start space-x-3.5 cursor-pointer ${
                    isActive 
                      ? 'bg-violet-950/20 border-violet-500/40 text-white shadow-md' 
                      : 'bg-slate-900/60 border-slate-850 hover:border-slate-800 text-slate-300'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${isActive ? 'bg-violet-500/20 text-violet-400' : 'bg-slate-950/40 text-slate-500'}`}>
                    <Play className="w-4 h-4 fill-current" />
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    <span className="text-[9px] font-mono font-bold text-violet-400 uppercase tracking-widest block">{video.category}</span>
                    <h4 className="font-sans font-bold text-sm truncate leading-snug">{video.title}</h4>
                    <div className="flex items-center space-x-2 pt-1">
                      {video.completed ? (
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${video.quizPassed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {video.quizPassed ? 'ACQUIS' : 'ÉCHEC QUIZ'}
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-slate-500 uppercase font-medium">NON VISIONNÉ</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="bg-gradient-to-tr from-violet-500/10 to-transparent p-5 rounded-2xl border border-violet-500/15 space-y-3">
            <span className="text-xs font-mono font-black text-violet-400 uppercase tracking-widest block">Metrique Tactique</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-mono font-black text-white">Niveau Tactique :</span>
              <span className="text-2xl font-mono font-black text-violet-400">Ailier Élite</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              Progresse en validant tes quiz pour débloquer le niveau supérieur d'intelligence collective requis par le jumeau tactique pro.
            </p>
          </div>
        </div>

        {/* Video Player + Quiz main body */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Mock Video visualizer frame */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl relative">
            <div className="bg-slate-950/80 p-4 border-b border-slate-850 flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400 uppercase font-semibold">Visionneuse Analytique</span>
              <span className="text-violet-400 flex items-center space-x-1.5 font-bold">
                <Youtube className="w-4 h-4 text-rose-500 fill-current animate-pulse" />
                <span>COACHING AUDIO ACTIF</span>
              </span>
            </div>

            <div className="aspect-video bg-black flex items-center justify-center relative">
              <iframe
                title={activeVideo.title}
                src={activeVideo.youtubeUrl}
                className="w-full h-full border-0 absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="no-referrer"
                allowFullScreen
              />
            </div>

            <div className="p-5 sm:p-6 space-y-2 bg-slate-950/30">
              <span className="text-[9px] font-mono text-violet-400 uppercase tracking-widest block font-bold">{activeVideo.category}</span>
              <h3 className="text-lg font-sans font-black text-white tracking-wide">{activeVideo.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">{activeVideo.description}</p>
            </div>
          </div>

          {/* Interactive Quiz Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />

            {currentQuizIndex === -1 && (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                  <HelpCircle className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-sans font-black text-white uppercase tracking-wider">Test de Football IQ</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    Après avoir regardé le clip ci-dessus, réponds au quiz préparé par le coach pour valider tes connaissances. Score requis : 2/3.
                  </p>
                </div>
                <button
                  onClick={handleStartQuiz}
                  className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-400 hover:to-indigo-400 text-white font-sans font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Démarrer le Quiz Tactique
                </button>
              </div>
            )}

            {currentQuizIndex >= 0 && currentQuizIndex < 99 && currentQuestion && (
              <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-slate-850 pb-3 text-xs font-mono">
                  <span className="text-violet-400 font-bold uppercase tracking-wider">Question {currentQuizIndex + 1} de {activeVideo.quizQuestions.length}</span>
                  <span className="text-slate-500">Football IQ Quiz</span>
                </div>

                <h4 className="text-sm sm:text-base font-sans font-bold text-white leading-snug">{currentQuestion.question}</h4>

                <div className="space-y-2.5 pt-2">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedAnswers[currentQuizIndex] === idx;
                    const isCorrect = idx === currentQuestion.correctIndex;
                    let optionClass = "bg-slate-950/40 border-slate-850 text-slate-300 hover:border-slate-800";

                    if (showExplanation) {
                      if (isCorrect) {
                        optionClass = "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-medium";
                      } else if (isSelected) {
                        optionClass = "bg-rose-500/10 border-rose-500/40 text-rose-400";
                      } else {
                        optionClass = "bg-slate-950/20 border-slate-900 text-slate-500 cursor-not-allowed";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswerSelect(idx)}
                        disabled={showExplanation}
                        className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all text-xs flex justify-between items-center cursor-pointer ${optionClass}`}
                      >
                        <span className="flex-1 leading-normal pr-4">{option}</span>
                        {showExplanation && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        {showExplanation && isSelected && !isCorrect && (
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {showExplanation && (
                  <div className="p-4 bg-slate-950/50 border border-slate-850 rounded-2xl space-y-3 animate-fade-in text-xs font-sans leading-relaxed">
                    <p className="text-slate-400">
                      <span className="text-violet-400 font-bold font-mono uppercase tracking-wider block mb-1">Analyse du Coach :</span>
                      {currentQuestion.explanation}
                    </p>
                    <button
                      onClick={handleNextQuestion}
                      className="ml-auto bg-violet-500 hover:bg-violet-400 text-white font-sans py-1.5 px-4 rounded-lg font-bold flex items-center space-x-1.5 transition-all text-[11px] uppercase tracking-wider cursor-pointer shadow"
                    >
                      <span>Continuer</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {currentQuizIndex === 99 && (
              <div className="text-center py-6 space-y-5 animate-fade-in">
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow">
                  <Trophy className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-lg font-sans font-black text-white uppercase tracking-wider">Quiz Terminé !</h4>
                  <p className="text-sm font-sans font-bold text-slate-200">
                    Ton Score : <span className="text-emerald-400 font-mono text-base">{quizScore} / 3</span> corrects
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed pt-1">
                    {quizScore >= 2 
                      ? "Félicitations, tu as assimilé la leçon tactique ! Les connaissances sont assimilées dans ton Player Profile." 
                      : "Tu n'as pas obtenu le score minimum de 2/3. Re-visionne attentivement la vidéo tactique et retente le quiz."
                    }
                  </p>
                </div>

                <div className="flex justify-center space-x-3 pt-2">
                  <button
                    onClick={() => setCurrentQuizIndex(-1)}
                    className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                  >
                    Retour aux séances
                  </button>
                  {quizScore < 2 && (
                    <button
                      onClick={handleStartQuiz}
                      className="px-5 py-2.5 bg-violet-500 hover:bg-violet-400 text-white font-sans font-black text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                    >
                      Recommencer
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
