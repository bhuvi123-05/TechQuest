import React from 'react';
import {
  Trophy,
  Star,
  RotateCcw,
  Play,
  Home,
  CheckCircle,
  Skull,
  Award,
  Sparkles,
  Timer,
  Coins,
} from 'lucide-react';
import { sound } from '../game/sound.ts';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestart,
  onHome,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="w-full max-w-sm bg-white border border-sky-200 rounded-2xl shadow-2xl p-6 text-center space-y-5 animate-in zoom-in-95 duration-150">
        <div className="w-14 h-14 bg-sky-100 border border-sky-300 rounded-2xl flex items-center justify-center mx-auto text-sky-600">
          <Play className="w-7 h-7 fill-sky-600" />
        </div>

        <div>
          <h2 id="pause-modal-title" className="text-xl font-black text-slate-800">
            Game Paused
          </h2>
          <p className="text-xs text-slate-500 mt-1">Take a breath or tweak your strategy.</p>
        </div>

        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={onResume}
            className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Resume Quest</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playCheckpoint();
              onRestart();
            }}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Level</span>
          </button>

          <button
            type="button"
            onClick={onHome}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-600 font-semibold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface VictoryModalProps {
  isOpen: boolean;
  score: number;
  stars: number;
  xpGained: number;
  timeTakenSec: number;
  coinsCollected: number;
  totalCoins: number;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onHome: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  score,
  stars,
  xpGained,
  timeTakenSec,
  coinsCollected,
  totalCoins,
  hasNextLevel,
  onNextLevel,
  onReplay,
  onHome,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="w-full max-w-md bg-white border border-sky-300 rounded-3xl shadow-2xl p-6 text-center space-y-6 animate-in zoom-in-95 duration-200">
        {/* Star Rating Header */}
        <div className="space-y-2">
          <div className="flex justify-center items-center gap-2">
            {[1, 2, 3].map((starIdx) => (
              <div
                key={starIdx}
                className={`transition-all duration-300 transform ${
                  starIdx <= stars
                    ? 'text-amber-400 scale-110'
                    : 'text-slate-200 scale-90'
                }`}
              >
                <Star
                  className={`w-9 h-9 ${
                    starIdx <= stars ? 'fill-amber-400 drop-shadow-md' : 'fill-slate-200'
                  }`}
                />
              </div>
            ))}
          </div>

          <h2 id="victory-modal-title" className="text-2xl font-black text-slate-900 tracking-tight">
            Stage Cleared!
          </h2>
          <p className="text-xs text-sky-700 font-semibold uppercase tracking-wider">
            Portal Unlocked & Challenge Conquered
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 bg-sky-50/60 p-4 rounded-2xl border border-sky-100">
          <div className="p-2.5 bg-white rounded-xl border border-sky-100 shadow-xs">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Final Score</span>
            </div>
            <div className="text-xl font-black text-slate-800 tabular-nums">
              {score.toLocaleString()}
            </div>
          </div>

          <div className="p-2.5 bg-white rounded-xl border border-sky-100 shadow-xs">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span>XP Earned</span>
            </div>
            <div className="text-xl font-black text-sky-600 tabular-nums">
              +{xpGained} XP
            </div>
          </div>

          <div className="p-2.5 bg-white rounded-xl border border-sky-100 shadow-xs">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
              <Timer className="w-3.5 h-3.5 text-teal-500" />
              <span>Time Taken</span>
            </div>
            <div className="text-lg font-black text-slate-800 tabular-nums">
              {timeTakenSec}s
            </div>
          </div>

          <div className="p-2.5 bg-white rounded-xl border border-sky-100 shadow-xs">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
              <Coins className="w-3.5 h-3.5 text-yellow-500" />
              <span>Data Coins</span>
            </div>
            <div className="text-lg font-black text-slate-800 tabular-nums">
              {coinsCollected} / {totalCoins}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {hasNextLevel ? (
            <button
              type="button"
              data-start="true"
              onClick={onNextLevel}
              className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Continue to Next Level</span>
            </button>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-bold">
              🏆 Master of All Worlds! All levels cleared!
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onReplay}
              className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 text-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay</span>
            </button>
            <button
              type="button"
              onClick={onHome}
              className="flex-1 py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-600 font-semibold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 text-xs cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Main Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  onTryAgain: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  score,
  onTryAgain,
  onHome,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gameover-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="w-full max-w-sm bg-white border border-rose-200 rounded-3xl shadow-2xl p-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
        <div className="w-14 h-14 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center mx-auto text-rose-500">
          <Skull className="w-7 h-7" />
        </div>

        <div>
          <h2 id="gameover-modal-title" className="text-2xl font-black text-slate-900">
            System Crash
          </h2>
          <p className="text-xs text-rose-600 font-semibold mt-1">
            Ran out of hearts or life cycles!
          </p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <span className="text-xs text-slate-500 font-medium">Score Achieved:</span>
          <div className="text-xl font-black text-slate-800 tabular-nums">
            {score.toLocaleString()}
          </div>
        </div>

        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            data-start="true"
            onClick={onTryAgain}
            className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <button
            type="button"
            onClick={onHome}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-600 font-semibold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
