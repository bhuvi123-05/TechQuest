import React from 'react';
import {
  Heart,
  Trophy,
  Coins,
  Key,
  Timer,
  Lightbulb,
  Pause,
  Volume2,
  VolumeX,
  HelpCircle,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Zap,
  Terminal as TerminalIcon,
} from 'lucide-react';
import { LevelConfig, WorldInfo } from '../game/types.ts';
import { WORLDS } from '../game/levels.ts';

interface GameHudProps {
  level: LevelConfig;
  health: number;
  maxHealth: number;
  lives: number;
  score: number;
  coins: number;
  totalCoins: number;
  hasKey: boolean;
  timeRemainingSec: number;
  currentXp: number;
  playerLevel: number;
  isMuted: boolean;
  interactPrompt: string | null;
  onPause: () => void;
  onToggleMute: () => void;
  onOpenTutorial: () => void;
  onOpenHint: () => void;
  onInteract: () => void;
  // Mobile touch handlers
  onTouchLeft: (active: boolean) => void;
  onTouchRight: (active: boolean) => void;
  onTouchJump: () => void;
  onTouchDash: () => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  level,
  health,
  maxHealth,
  lives,
  score,
  coins,
  totalCoins,
  hasKey,
  timeRemainingSec,
  currentXp,
  playerLevel,
  isMuted,
  interactPrompt,
  onPause,
  onToggleMute,
  onOpenTutorial,
  onOpenHint,
  onInteract,
  onTouchLeft,
  onTouchRight,
  onTouchJump,
  onTouchDash,
}) => {
  const world: WorldInfo = WORLDS[level.worldId] || WORLDS.python;

  // Next level XP threshold
  const currentLevelBaseXp = Math.pow(playerLevel - 1, 2) * 100;
  const nextLevelXp = Math.pow(playerLevel, 2) * 100;
  const xpProgress = Math.min(
    100,
    Math.max(0, ((currentXp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp)) * 100)
  );

  return (
    <div
      className="fixed inset-0 pointer-events-none z-30 select-none flex flex-col justify-between p-3 sm:p-5"
      aria-label="Game HUD"
    >
      {/* TOP BAR CLUSTER */}
      <div className="flex flex-wrap sm:flex-nowrap items-start justify-between gap-2">
        {/* Left Cluster: Health, Lives, XP & World Indicator */}
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          {/* World Badge & Health Hearts */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/95 border border-sky-200 rounded-2xl p-1.5 sm:p-2 px-2.5 sm:px-3 shadow-md">
            <span
              className="text-[9px] sm:text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md"
              style={{ backgroundColor: world.accentBg, color: world.textColor }}
            >
              Lvl {level.id}
            </span>

            {/* Vitality Hearts */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              {Array.from({ length: maxHealth }).map((_, i) => (
                <div key={i} className="transition-all duration-200">
                  <Heart
                    className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${
                      i < health
                        ? 'text-rose-500 fill-rose-500 filter drop-shadow-xs'
                        : 'text-slate-300 fill-slate-200'
                    }`}
                  />
                </div>
              ))}
            </div>

            <div className="h-3.5 w-px bg-slate-200 mx-0.5" />

            {/* Lives counter */}
            <span className="text-[11px] sm:text-xs font-bold text-slate-600 tabular-nums">
              ×{lives}
            </span>
          </div>

          {/* XP Progress Bar */}
          <div className="bg-white/95 border border-sky-200 rounded-xl p-1.5 sm:p-2 px-2.5 sm:px-3 shadow-xs flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
            <div className="flex items-center gap-1 font-bold text-sky-700">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Lv.{playerLevel}</span>
            </div>
            <div className="w-16 sm:w-32 bg-slate-100 h-1.5 sm:h-2 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-linear-to-r from-sky-400 to-blue-600 transition-all duration-300"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <span className="text-[9px] sm:text-[10px] font-mono text-slate-500 tabular-nums">
              {currentXp} XP
            </span>
          </div>
        </div>

        {/* Center Cluster: Score, Coins, Key, Timer */}
        <div className="flex items-center gap-1 sm:gap-2 bg-white/95 border border-sky-200 rounded-2xl p-1.5 sm:p-2 px-2 sm:px-3 shadow-md pointer-events-auto order-3 sm:order-2">
          {/* Score */}
          <div className="flex items-center gap-1 px-1 sm:px-2">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-mono font-black text-slate-800 text-xs sm:text-base tabular-nums">
              {score.toLocaleString()}
            </span>
          </div>

          <div className="h-3.5 w-px bg-slate-200" />

          {/* Coins */}
          <div className="flex items-center gap-0.5 sm:gap-1 px-1 sm:px-1.5">
            <Coins className="w-3.5 h-3.5 text-yellow-500" />
            <span className="font-mono font-bold text-slate-700 text-xs sm:text-sm tabular-nums">
              {coins}/{totalCoins}
            </span>
          </div>

          <div className="h-3.5 w-px bg-slate-200" />

          {/* Key status */}
          <div className="flex items-center gap-1 px-1 sm:px-1.5">
            <Key
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                hasKey ? 'text-amber-500 fill-amber-400 animate-pulse' : 'text-slate-300'
              }`}
            />
            <span className="text-[9px] font-bold uppercase text-slate-500 hidden md:inline">
              {hasKey ? 'Key Acquired' : 'Locked'}
            </span>
          </div>

          <div className="h-3.5 w-px bg-slate-200" />

          {/* Timer */}
          <div className="flex items-center gap-1 px-1 text-[11px] sm:text-xs font-mono font-bold text-slate-700">
            <Timer className="w-3.5 h-3.5 text-teal-600" />
            <span className="tabular-nums">{timeRemainingSec}s</span>
          </div>
        </div>

        {/* Right Cluster: Utility Control Buttons */}
        <div className="flex items-center gap-1 bg-white/95 border border-sky-200 rounded-2xl p-1 sm:p-1.5 shadow-md pointer-events-auto order-2 sm:order-3">
          {/* Hint button */}
          <button
            type="button"
            onClick={onOpenHint}
            title="Ada AI Hint [H]"
            className="p-1.5 sm:p-2 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition-colors cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Tutorial / Help */}
          <button
            type="button"
            onClick={onOpenTutorial}
            title="Level Guide [?]"
            className="p-1.5 sm:p-2 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Mute toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            title="Mute Sound [M]"
            className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {/* Pause */}
          <button
            type="button"
            onClick={onPause}
            title="Pause Game [Esc / P]"
            className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* CENTER INTERACTION PROMPT */}
      {interactPrompt && (
        <div className="mx-auto pointer-events-auto animate-bounce mb-8">
          <button
            type="button"
            onClick={onInteract}
            className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm rounded-2xl shadow-xl border-2 border-white cursor-pointer transition-all active:scale-95"
          >
            <TerminalIcon className="w-4 h-4" />
            <span>{interactPrompt}</span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-mono">
              [E] or Tap
            </span>
          </button>
        </div>
      )}

      {/* BOTTOM CLUSTER: Mobile Virtual Controls */}
      <div className="flex items-end justify-between pointer-events-none pb-2 sm:pb-0">
        {/* Mobile D-Pad Left / Right */}
        <div className="flex gap-2 pointer-events-auto sm:hidden">
          <button
            type="button"
            aria-label="Move Left"
            onTouchStart={() => onTouchLeft(true)}
            onTouchEnd={() => onTouchLeft(false)}
            onMouseDown={() => onTouchLeft(true)}
            onMouseUp={() => onTouchLeft(false)}
            className="w-14 h-14 bg-white/90 active:bg-sky-100 border-2 border-sky-300 rounded-2xl shadow-lg flex items-center justify-center text-slate-700 active:scale-90 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            aria-label="Move Right"
            onTouchStart={() => onTouchRight(true)}
            onTouchEnd={() => onTouchRight(false)}
            onMouseDown={() => onTouchRight(true)}
            onMouseUp={() => onTouchRight(false)}
            className="w-14 h-14 bg-white/90 active:bg-sky-100 border-2 border-sky-300 rounded-2xl shadow-lg flex items-center justify-center text-slate-700 active:scale-90 transition-all cursor-pointer"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Action Buttons: Jump & Dash */}
        <div className="flex gap-2.5 pointer-events-auto sm:hidden">
          <button
            type="button"
            aria-label="Dash"
            onTouchStart={onTouchDash}
            onClick={onTouchDash}
            className="w-13 h-13 bg-amber-50 active:bg-amber-100 border-2 border-amber-300 rounded-2xl shadow-lg flex items-center justify-center text-amber-700 active:scale-90 transition-all cursor-pointer"
          >
            <Zap className="w-5 h-5 fill-amber-500" />
          </button>
          <button
            type="button"
            aria-label="Jump"
            onTouchStart={onTouchJump}
            onClick={onTouchJump}
            className="w-14 h-14 bg-sky-600 active:bg-sky-700 border-2 border-sky-400 rounded-2xl shadow-lg flex items-center justify-center text-white active:scale-90 transition-all cursor-pointer"
          >
            <ArrowUp className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
};
