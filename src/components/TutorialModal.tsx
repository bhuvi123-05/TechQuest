import React from 'react';
import { LevelConfig, WorldInfo } from '../game/types.ts';
import { WORLDS } from '../game/levels.ts';
import {
  BookOpen,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Play,
  X,
  Keyboard,
  Target,
  Lightbulb,
} from 'lucide-react';

interface TutorialModalProps {
  level: LevelConfig;
  isOpen: boolean;
  onClose: () => void;
  onStartLevel: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  level,
  isOpen,
  onClose,
  onStartLevel,
}) => {
  if (!isOpen) return null;

  const world: WorldInfo = WORLDS[level.worldId] || WORLDS.python;
  const { tutorial } = level;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 animate-in fade-in duration-200"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="relative w-full max-w-xl bg-white border border-sky-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Banner with light theme gradient & Guide profile */}
        <div
          className="p-5 border-b border-sky-100 flex items-center justify-between"
          style={{ backgroundColor: world.accentBg }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-sky-200 flex items-center justify-center text-2xl font-black">
              🤖
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: world.textColor }}>
                {world.name} · Level {level.id} Tutorial
              </span>
              <h2 id="tutorial-modal-title" className="text-xl font-black text-slate-900">
                {tutorial.headline}
              </h2>
              <p className="text-xs text-slate-600 font-medium">Guide: {tutorial.guideName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tutorial"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/80 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-slate-700 text-sm">
          {/* Mission Objectives */}
          <div className="bg-sky-50/70 border border-sky-200/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sky-950 text-sm">
              <Target className="w-4 h-4 text-sky-600" />
              <span>Primary Mission Objectives:</span>
            </div>
            <p className="text-slate-700 text-xs leading-relaxed">{tutorial.objective}</p>
          </div>

          {/* Tech Concept Focus */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Core Concept: {tutorial.conceptTitle}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{tutorial.conceptDetails}</p>

            {/* Quick summary chips */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
              {world.conceptSummary.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 text-slate-700 rounded-lg border border-slate-200"
                >
                  ✓ {item}
                </span>
              ))}
            </div>
          </div>

          {/* Controls Guide */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
              <Keyboard className="w-4 h-4 text-slate-600" />
              <span>Game Controls:</span>
            </div>
            <p className="text-xs font-mono text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
              {tutorial.controlsGuide}
            </p>
          </div>

          {/* Pro Tip */}
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong className="font-semibold text-amber-950">Pro Tip: </strong>
              {tutorial.proTip}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            Review Later
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onStartLevel();
            }}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Got it, Let's Play!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
