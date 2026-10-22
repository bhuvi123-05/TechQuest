import React from 'react';
import { LevelConfig, GameProgress } from '../game/types.ts';
import { LEVELS, WORLDS } from '../game/levels.ts';
import {
  Lock,
  Star,
  Play,
  X,
  Trophy,
  CheckCircle2,
  Code2,
  Network,
  Database,
  Cpu,
} from 'lucide-react';
import { sound } from '../game/sound.ts';

interface LevelsModalProps {
  isOpen: boolean;
  progress: GameProgress;
  onSelectLevel: (levelId: number) => void;
  onClose: () => void;
}

export const LevelsModal: React.FC<LevelsModalProps> = ({
  isOpen,
  progress,
  onSelectLevel,
  onClose,
}) => {
  if (!isOpen) return null;

  const getWorldIcon = (worldId: string) => {
    switch (worldId) {
      case 'python':
        return <Code2 className="w-5 h-5 text-sky-600" />;
      case 'networking':
        return <Network className="w-5 h-5 text-teal-600" />;
      case 'database':
        return <Database className="w-5 h-5 text-indigo-600" />;
      case 'ml':
        return <Cpu className="w-5 h-5 text-purple-600" />;
      default:
        return <Code2 className="w-5 h-5 text-sky-600" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="levels-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="relative w-full max-w-2xl bg-white border border-sky-200 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-sky-50/70">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
              Technology Realm Matrix
            </span>
            <h2 id="levels-modal-title" className="text-xl font-black text-slate-900">
              Select World Level
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close levels screen"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LEVELS.map((lvl) => {
              const world = WORLDS[lvl.worldId];
              const isUnlocked = progress.unlockedLevels.includes(lvl.id);
              const stars = progress.starsEarned[lvl.id] || 0;
              const highScore = progress.highScores[lvl.id] || 0;

              return (
                <div
                  key={lvl.id}
                  className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                    isUnlocked
                      ? 'bg-white border-slate-200 hover:border-sky-300 hover:shadow-md'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="p-2 rounded-xl shadow-2xs border"
                          style={{
                            backgroundColor: world.accentBg,
                            borderColor: world.borderColor,
                          }}
                        >
                          {getWorldIcon(lvl.worldId)}
                        </div>
                        <div>
                          <span
                            className="text-[11px] font-bold uppercase tracking-wider block"
                            style={{ color: world.textColor }}
                          >
                            World {lvl.id} · {world.name}
                          </span>
                          <h3 className="font-extrabold text-slate-800 text-sm leading-tight">
                            {lvl.title}
                          </h3>
                        </div>
                      </div>

                      {/* Difficulty Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          lvl.difficulty === 'Easy'
                            ? 'bg-emerald-100 text-emerald-800'
                            : lvl.difficulty === 'Medium'
                            ? 'bg-sky-100 text-sky-800'
                            : lvl.difficulty === 'Hard'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {lvl.difficulty}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2">{lvl.subtitle}</p>
                  </div>

                  {/* Level Bottom Stats & Action */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs">
                      {/* Stars */}
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= stars
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200 fill-slate-200'
                            }`}
                          />
                        ))}
                      </div>

                      {highScore > 0 && (
                        <span className="text-[11px] font-mono text-slate-500">
                          Best: {highScore.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={!isUnlocked}
                      onClick={() => {
                        sound.playCheckpoint();
                        onSelectLevel(lvl.id);
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isUnlocked
                          ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {isUnlocked ? (
                        <>
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Play</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Locked</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
