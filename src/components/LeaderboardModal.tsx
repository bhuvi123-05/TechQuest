import React, { useState } from 'react';
import { LeaderboardEntry, GameProgress } from '../game/types.ts';
import { BADGES } from '../game/levels.ts';
import {
  Trophy,
  Award,
  Medal,
  Star,
  CheckCircle,
  Lock,
  X,
  Sparkles,
  Zap,
  ShieldCheck,
} from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  entries: LeaderboardEntry[];
  progress: GameProgress;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  entries,
  progress,
  onClose,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'leaderboard' | 'badges'>('leaderboard');

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'zap':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'shield-check':
        return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
      case 'star':
        return <Star className="w-5 h-5 text-yellow-500" />;
      case 'trophy':
        return <Trophy className="w-5 h-5 text-indigo-500" />;
      case 'sparkles':
        return <Sparkles className="w-5 h-5 text-sky-500" />;
      default:
        return <Award className="w-5 h-5 text-purple-500" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="leaderboard-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="relative w-full max-w-xl bg-white border border-sky-200 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-sky-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-xs border border-sky-100">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                Hall of Champions
              </span>
              <h2 id="leaderboard-modal-title" className="text-xl font-black text-slate-900">
                Rankings & Badges
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-100 px-6 bg-slate-50">
          <button
            type="button"
            onClick={() => setActiveTab('leaderboard')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'leaderboard'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Top Scores</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('badges')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'badges'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Badges ({progress.badges.length}/{BADGES.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'leaderboard' && (
            <div className="space-y-3">
              <div className="grid grid-cols-12 text-[11px] font-bold uppercase text-slate-400 px-3 py-1">
                <span className="col-span-1">#</span>
                <span className="col-span-4">Player</span>
                <span className="col-span-3">Realm</span>
                <span className="col-span-2 text-right">XP</span>
                <span className="col-span-2 text-right">Score</span>
              </div>

              {entries.map((entry, idx) => {
                const rank = entry.rank || idx + 1;
                return (
                  <div
                    key={idx}
                    className={`grid grid-cols-12 items-center p-3 rounded-xl border text-xs font-medium transition-colors ${
                      rank === 1
                        ? 'bg-amber-50/70 border-amber-200 text-amber-950 font-bold'
                        : rank === 2
                        ? 'bg-slate-100 border-slate-300 text-slate-800'
                        : rank === 3
                        ? 'bg-orange-50 border-orange-200 text-orange-950'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="col-span-1 font-bold">
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                    </span>
                    <span className="col-span-4 font-mono font-bold truncate">
                      {entry.name}
                    </span>
                    <span className="col-span-3 text-slate-500 text-[11px] truncate">
                      {entry.world}
                    </span>
                    <span className="col-span-2 text-right text-sky-600 font-mono font-bold tabular-nums">
                      {entry.xp}
                    </span>
                    <span className="col-span-2 text-right text-slate-900 font-mono font-black tabular-nums">
                      {entry.score.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BADGES.map((b) => {
                const isUnlocked = progress.badges.includes(b.id);
                return (
                  <div
                    key={b.id}
                    className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                      isUnlocked
                        ? 'bg-white border-sky-200 shadow-xs'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl border ${
                        isUnlocked
                          ? 'bg-sky-50 border-sky-100'
                          : 'bg-slate-100 border-slate-200'
                      }`}
                    >
                      {isUnlocked ? getBadgeIcon(b.icon) : <Lock className="w-5 h-5 text-slate-400" />}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-slate-800 text-xs">{b.name}</h4>
                        {isUnlocked && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            Unlocked
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">{b.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
