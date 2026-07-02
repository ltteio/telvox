import React, { useState, useEffect, useRef } from 'react';
import { PlayerProfile, CoachPersonality, CoachMessage, FootballDNA } from '../types';
import { MessageSquare, Sparkles, Send, Brain, Bot, User, Trash2, ArrowRight, HelpCircle } from 'lucide-react';

interface AICoachChatProps {
  player: PlayerProfile;
  dna: FootballDNA;
  coachMessages: CoachMessage[];
  setCoachMessages: React.Dispatch<React.SetStateAction<CoachMessage[]>>;
  personality: CoachPersonality;
  setPersonality: (p: CoachPersonality) => void;
  onExecuteCommand?: (command: { action: string, payload: any }) => void;
}

export default function AICoachChat({
  player,
  dna,
  coachMessages,
  setCoachMessages,
  personality,
  setPersonality,
  onExecuteCommand
}: AICoachChatProps) {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [coachMessages, loading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: CoachMessage = {
      id: "msg_" + Date.now(),
      sender: 'player',
      text: text,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    setCoachMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...coachMessages, userMsg],
          personality,
          playerProfile: player,
          footballDna: dna
        })
      });

      const data = await response.json();
      
      const coachMsg: CoachMessage = {
        id: "msg_coach_" + Date.now(),
        sender: 'coach',
        text: data.text || `Désolé ${player.firstName || 'Joueur'}, je n'ai pas pu joindre le Progress Engine pour le moment. Reste régulier à l'entraînement !`,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };

      setCoachMessages(prev => [...prev, coachMsg]);

      // Execute AI-driven state modification commands
      if (data.commands && Array.isArray(data.commands) && onExecuteCommand) {
        data.commands.forEach((cmd: any) => {
          onExecuteCommand(cmd);
        });
      }
    } catch (err) {
      console.error(err);
      const errMsg: CoachMessage = {
        id: "msg_err_" + Date.now(),
        sender: 'coach',
        text: "Une erreur réseau est survenue. Reste concentré sur tes objectifs physiques, nous reprendrons l'analyse dès que la connexion sera rétablie.",
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      setCoachMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setCoachMessages([
      {
        id: "welcome",
        sender: 'coach',
        text: `Bonjour ${player.firstName || 'Joueur'}. Je suis ton Progress Engine, ton coach IA personnel. Prêt à analyser tes performances ou à programmer ta journée de travail ?`,
        timestamp: "10:00"
      }
    ]);
  };

  const prebuiltPrompts = [
    { label: "Pourquoi mon explosivité baisse ?", query: "Explique-moi pourquoi ma statistique d'explosivité ou d'accélération pourrait baisser d'après mon profil ?" },
    { label: "Comment préparer mon match de samedi ?", query: "Quel plan d'action nutritionnel et de récupération devrais-je suivre d'ici mon match de ce samedi ?" },
    { label: "Que faire si je n'ai que 20 minutes ?", query: "Donne-moi une séance technique ultra-courte de 20 minutes pour travailler ma première touche du pied gauche." }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl h-[640px] flex flex-col justify-between shadow-2xl relative overflow-hidden text-slate-100">
      
      {/* Dynamic Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest font-black block">Conseil de Spécialistes IA</span>
            <h3 className="text-base font-sans font-black text-white uppercase tracking-wide">Progress Engine Coach</h3>
          </div>
        </div>

        {/* Personality Selector Dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Style du coach :</span>
          <select
            value={personality}
            onChange={(e) => setPersonality(e.target.value as CoachPersonality)}
            className="bg-slate-900 text-slate-200 text-xs font-mono py-1.5 px-3 border border-slate-850 rounded-lg focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="pedagogue">Pédagogue</option>
            <option value="exigeant">Exigeant</option>
            <option value="motivant">Motivant</option>
            <option value="professionnel">Professionnel</option>
          </select>
          <button 
            onClick={clearChat}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-rose-400 cursor-pointer transition-colors"
            title="Réinitialiser la conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Chat Message Scroll Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar bg-slate-950/20">
        {coachMessages.map((msg) => {
          const isCoach = msg.sender === 'coach';
          return (
            <div 
              key={msg.id}
              className={`flex items-start space-x-3 max-w-[85%] ${isCoach ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right space-x-reverse'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isCoach ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-slate-800 text-slate-300'}`}>
                {isCoach ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
              </div>
              
              <div className="space-y-1">
                <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${isCoach ? 'bg-slate-900 text-slate-100 border border-slate-850' : 'bg-cyan-500 text-slate-950 font-medium'}`}>
                  {msg.text}
                </div>
                <span className="text-[10px] font-mono text-slate-500 block px-1">{msg.timestamp}</span>
              </div>
            </div>
          );
        })}

        {/* Loading Bubble Indicator */}
        {loading && (
          <div className="flex items-start space-x-3 max-w-[85%] mr-auto">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <Bot className="w-4.5 h-4.5" />
            </div>
            <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Queries Prompt bar */}
      {coachMessages.length === 1 && !loading && (
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/10 relative z-10 space-y-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Suggestions de questions</span>
          <div className="flex flex-wrap gap-2">
            {prebuiltPrompts.map((p) => (
              <button
                key={p.label}
                onClick={() => handleSendMessage(p.query)}
                className="px-3 py-2 bg-slate-900 border border-slate-850 text-[11px] font-medium text-slate-300 hover:text-white rounded-xl hover:border-slate-700 transition-colors cursor-pointer text-left flex items-center space-x-1"
              >
                <span>{p.label}</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input controls form */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 relative z-10">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="flex items-center space-x-3"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={loading}
            placeholder={loading ? "Le Coach prépare sa réponse..." : "Pose ta question au coach (ex: comment optimiser mes accélérations...)"}
            className="flex-1 bg-slate-950 text-slate-200 text-xs py-3.5 px-4 border border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            className={`p-3.5 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
              loading || !inputValue.trim()
                ? 'bg-slate-800 text-slate-600'
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/10 active:scale-95'
            }`}
          >
            <Send className="w-4 h-4 fill-current" />
          </button>
        </form>
      </div>

    </div>
  );
}
