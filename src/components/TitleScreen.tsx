import React from 'react';
import {
  Play,
  Layers,
  BookOpen,
  Trophy,
  Settings,
  Sparkles,
  Code2,
  Network,
  Database,
  Cpu,
  Shield,
  Star,
} from 'lucide-react';
import { GameProgress } from '../game/types.ts';
import { WORLDS } from '../game/levels.ts';

interface TitleScreenProps {
  progress: GameProgress;
  onStartGame: () => void;
  onOpenLevels: () => void;
  onOpenInstructions: () => void;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  progress,
  onStartGame,
  onOpenLevels,
  onOpenInstructions,
  onOpenLeaderboard,
  onOpenSettings,
}) => {
  return (
    <div
      className="relative w-full h-full min-h-screen flex flex-col justify-between items-center p-6 sm:p-10 select-none overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%)',
      }}
    >
      {/* Subtle geometric tech grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 30%, rgba(2, 132, 199, 0.12) 0%, transparent 60%),
            linear-gradient(to right, #e2e8f0 1px, transparent 1px),
            linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 40px 40px, 40px 40px',
        }}
      />

      {/* Top Header Badge */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between">
        <div className="flex items-center gap-2 bg-white/90 border border-sky-200 px-3.5 py-1.5 rounded-2xl shadow-xs">
          <Sparkles className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-bold text-slate-700">
            TechQuest v2.5 · 2D Puzzle Adventure
          </span>
        </div>

        {/* Player Profile Quick Stat */}
        <div className="flex items-center gap-3 bg-white/90 border border-sky-200 px-4 py-1.5 rounded-2xl shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700">
            <span>Level {progress.level}</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-mono tabular-nums">{progress.totalXp} XP</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span className="tabular-nums">
              {Object.values(progress.starsEarned).reduce((a, b) => a + b, 0)} Stars
            </span>
          </div>
        </div>
      </div>

      {/* Center Hero Lockup & SVG Title */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl my-auto py-8">
        {/* Animated Cyber Crest SVG */}
        <div className="relative mb-4">
          <svg
            className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-lg animate-pulse"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="15" y="15" width="70" height="70" rx="20" fill="#0284c7" fillOpacity="0.1" stroke="#0284c7" strokeWidth="4" />
            <path d="M30 50L45 65L70 35" stroke="#0284c7" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="50" cy="20" r="4" fill="#38bdf8" />
            <circle cx="80" cy="50" r="4" fill="#38bdf8" />
            <circle cx="50" cy="80" r="4" fill="#38bdf8" />
            <circle cx="20" cy="50" r="4" fill="#38bdf8" />
          </svg>
        </div>

        {/* Bespoke Title Lockup */}
        <div className="space-y-1">
          <span className="text-xs sm:text-sm font-extrabold tracking-widest uppercase text-sky-600">
            The Interactive Coding Odyssey
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
            <span>TECH</span>
            <span className="text-sky-600">QUEST</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto font-medium leading-relaxed pt-1">
            Conquer four technology worlds with 2D platforming, interactive code debugging, network routing, and machine learning challenges.
          </p>
        </div>

        {/* 4 World Previews Ribbon */}
        <div className="flex flex-wrap items-center justify-center gap-2 my-6">
          <span className="px-3 py-1 bg-white border border-sky-200 rounded-xl text-xs font-bold text-sky-800 flex items-center gap-1.5 shadow-2xs">
            <Code2 className="w-3.5 h-3.5 text-sky-600" /> Python Realm
          </span>
          <span className="px-3 py-1 bg-white border border-teal-200 rounded-xl text-xs font-bold text-teal-800 flex items-center gap-1.5 shadow-2xs">
            <Network className="w-3.5 h-3.5 text-teal-600" /> Network Nexus
          </span>
          <span className="px-3 py-1 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-indigo-800 flex items-center gap-1.5 shadow-2xs">
            <Database className="w-3.5 h-3.5 text-indigo-600" /> Database Depths
          </span>
          <span className="px-3 py-1 bg-white border border-purple-200 rounded-xl text-xs font-bold text-purple-800 flex items-center gap-1.5 shadow-2xs">
            <Cpu className="w-3.5 h-3.5 text-purple-600" /> Neural Citadel
          </span>
        </div>

        {/* Primary Start CTA Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md justify-center">
          <button
            type="button"
            data-start="true"
            onClick={onStartGame}
            className="w-full sm:w-auto flex-1 py-4 px-8 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-base font-extrabold rounded-2xl shadow-xl hover:shadow-sky-400/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Play Quest</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-lg font-mono">
              Enter / Space
            </span>
          </button>
        </div>

        {/* Secondary Menu Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
          <button
            type="button"
            onClick={onOpenLevels}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer hover:border-sky-300"
          >
            <Layers className="w-3.5 h-3.5 text-sky-600" />
            <span>Worlds & Levels</span>
          </button>

          <button
            type="button"
            onClick={onOpenInstructions}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer hover:border-sky-300"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>How to Play</span>
          </button>

          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer hover:border-sky-300"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Leaderboard</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer hover:border-sky-300"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Flat borderless control hint line in safe margin */}
      <div className="relative z-10 text-[11px] font-mono text-slate-500 tracking-wide text-center">
        WASD or Arrows Move · Space Jump · E Interact · Shift Dash · Esc Pause · Light Theme
      </div>
    </div>
  );
};
