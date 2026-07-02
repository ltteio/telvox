import React, { useState } from 'react';
import { PlayerProfile } from '../types';
import { Flame, Coins, Trophy, Dumbbell, Calendar, Heart, Shield, Sparkles, RotateCcw, Users, Brain, Cloud, CloudOff, QrCode } from 'lucide-react';
import PWAShareModal from './PWAShareModal';

interface HeaderProps {
  player: PlayerProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onReset?: () => void;
  user?: any;
  syncStatus?: 'synced' | 'syncing' | 'error' | 'local';
  onAuthClick?: () => void;
}

export default function Header({ 
  player, 
  activeTab, 
  setActiveTab, 
  onReset,
  user,
  syncStatus = 'local',
  onAuthClick
}: HeaderProps) {
  const [isPWAModalOpen, setIsPWAModalOpen] = useState(false);
  const xpPercent = Math.min(100, Math.floor((player.xp / player.xpNextLevel) * 100));

  const navItems = [
    { id: 'mission', label: 'Mission Control', icon: Shield },
    { id: 'calendar', label: 'Mission Calendar', icon: Calendar },
    { id: 'player_os', label: 'Player OS & ADN', icon: Trophy },
    { id: 'training', label: 'Training Center', icon: Dumbbell },
    { id: 'phys_prep', label: 'Prep Physique', icon: Flame },
    { id: 'match', label: 'Match Center', icon: Users },
    { id: 'football_iq', label: 'Football IQ', icon: Brain },
    { id: 'lab', label: 'Performance Lab', icon: Heart },
    { id: 'nutrition', label: 'Nutrition', icon: Sparkles },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('mission')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="font-sans font-black text-xl text-slate-950">VX</span>
            </div>
            <div>
              <span className="font-sans font-black text-2xl tracking-wider text-white">TELVOX</span>
              <span className="text-[10px] block font-mono text-emerald-400 tracking-widest uppercase">Progress OS</span>
            </div>
          </div>

          {/* Player stats indicators */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Level & XP */}
            <div className="flex flex-col">
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>NIVEAU {player.level}</span>
                <span>{player.xp} / {player.xpNextLevel} XP</span>
              </div>
              <div className="w-40 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700/50">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>

            {/* Streak */}
            <div className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg text-amber-400 font-mono text-sm shadow-sm" title="Jours de régularité consécutifs">
              <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
              <span className="font-bold">{player.streak} Jours</span>
            </div>

            {/* Coins */}
            <div className="flex items-center space-x-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-lg text-yellow-400 font-mono text-sm shadow-sm" title="VX Coins de récompense">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="font-bold">{player.coins} VX</span>
            </div>

            {/* Scores */}
            <div className="flex items-center space-x-4 border-l border-slate-800 pl-6">
              <div className="text-center">
                <span className="text-[10px] block text-slate-400 font-mono tracking-wider">PROGRESS SCORE</span>
                <span className="text-lg font-black text-emerald-400 font-mono">{player.progressScore}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] block text-slate-400 font-mono tracking-wider">LEGACY SCORE</span>
                <span className="text-lg font-black text-cyan-400 font-mono">{player.legacyScore}</span>
              </div>
            </div>

            {/* Reset Onboarding Button */}
            {onReset && (
              <button
                onClick={onReset}
                className="ml-2 px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-400 transition-all cursor-pointer flex items-center space-x-1.5 rounded-xl font-mono text-[10px] font-black tracking-wide"
                title="Réinitialiser mon jumeau et l'onboarding"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RÉINITIALISER</span>
              </button>
            )}
          </div>

          {/* Quick Profile Mobile */}
          <div className="flex items-center space-x-3">
            {/* PWA QR Code & Install Button */}
            <button 
              onClick={() => setIsPWAModalOpen(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all text-xs font-mono font-bold cursor-pointer"
              title="Scanner le QR Code ou Installer la PWA"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px]">INSTALLER APP</span>
            </button>

            {/* Cloud Sync Status Badge */}
            <button 
              onClick={onAuthClick}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border transition-all text-xs font-mono font-bold cursor-pointer ${
                syncStatus === 'synced' 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  : syncStatus === 'syncing'
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 animate-pulse'
                    : syncStatus === 'error'
                      ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
              title={user ? "Connecté au cloud. Cliquez pour gérer votre compte." : "Mode local. Cliquez pour activer la synchronisation cloud."}
            >
              {syncStatus === 'synced' ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline text-[10px]">SYNCED</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                </>
              ) : syncStatus === 'syncing' ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
                  <span className="hidden sm:inline text-[10px]">SYNC...</span>
                </>
              ) : syncStatus === 'error' ? (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-red-400" />
                  <span className="hidden sm:inline text-[10px]">ERR</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline text-[10px]">LOCAL</span>
                </>
              )}
            </button>

            <div className="text-right hidden sm:block">
              <span className="font-medium text-sm text-slate-200 block leading-tight">{player.firstName} {player.lastName}</span>
              <span className="text-xs text-emerald-400 block font-mono">{player.position}</span>
            </div>
            <div className="relative cursor-pointer" onClick={onAuthClick}>
              <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-emerald-500 flex items-center justify-center font-sans font-bold text-sm text-emerald-400 overflow-hidden shadow-inner">
                {player.firstName[0]}{player.lastName[0]}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-mono font-black text-[10px] flex items-center justify-center border-2 border-slate-900 shadow">
                {player.level}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex flex-nowrap overflow-x-auto no-scrollbar md:flex-wrap md:overflow-visible gap-1.5 pb-2 scroll-smooth">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`tab-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 py-2.5 px-3.5 text-xs sm:text-sm font-medium border rounded-xl tracking-wide transition-all duration-200 shrink-0 ${
                  active 
                    ? 'border-emerald-500 text-emerald-400 bg-slate-800/40' 
                    : 'border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-800/20 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      <PWAShareModal isOpen={isPWAModalOpen} onClose={() => setIsPWAModalOpen(false)} />
    </header>
  );
}
