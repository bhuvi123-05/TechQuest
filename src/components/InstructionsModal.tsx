import React from 'react';
import {
  BookOpen,
  Keyboard,
  Target,
  Sparkles,
  Zap,
  HelpCircle,
  X,
  Code2,
  Network,
  Database,
  Cpu,
} from 'lucide-react';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="instructions-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="relative w-full max-w-2xl bg-white border border-sky-200 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-sky-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-xs border border-sky-100">
              <BookOpen className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                Player Field Manual
              </span>
              <h2 id="instructions-modal-title" className="text-xl font-black text-slate-900">
                How to Play TechQuest
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close instructions"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Manual Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-slate-700 text-xs sm:text-sm">
          {/* Mission Overview */}
          <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl space-y-1.5">
            <h3 className="font-extrabold text-sky-950 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>The Mission</span>
            </h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Step into the shoes of a Cyber Engineer and restore balance across the 4 core pillars of computing:
              <strong> Python Programming</strong>, <strong>Computer Networking</strong>, <strong>Databases</strong>, and <strong>Machine Learning</strong>.
              Dodge glitches, squash software bugs, harvest data packets, and decrypt the security terminals to unlock the exit portals!
            </p>
          </div>

          {/* Key Controls Table */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-slate-600" />
              <span>Keyboard & Game Controls</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="block font-mono font-bold text-sky-700 mb-0.5">A / D or ← / →</span>
                <span className="text-slate-500 text-[11px]">Run Left / Right</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="block font-mono font-bold text-sky-700 mb-0.5">W / Space / ↑</span>
                <span className="text-slate-500 text-[11px]">Jump / Double Jump</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="block font-mono font-bold text-sky-700 mb-0.5">E or Click</span>
                <span className="text-slate-500 text-[11px]">Interact with Terminal</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="block font-mono font-bold text-sky-700 mb-0.5">Shift / K</span>
                <span className="text-slate-500 text-[11px]">Quick Cyber Dash</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              Esc / P pauses the game · M toggles sound · H opens Ada AI Hints · On mobile, on-screen touch controls are enabled automatically!
            </p>
          </div>

          {/* The 4 Technology Worlds */}
          <div className="space-y-2.5">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span>The 4 Technology Realms</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white border border-sky-200 rounded-xl shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-sky-700">
                  <Code2 className="w-4 h-4" />
                  <span>1. Python Realm</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Syntax trees, 4-space indentation discipline, for/while loops, and function return values.
                </p>
              </div>

              <div className="p-3 bg-white border border-teal-200 rounded-xl shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-teal-700">
                  <Network className="w-4 h-4" />
                  <span>2. Network Nexus</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Routing packets, avoiding packet drops, and mapping protocols (HTTP, HTTPS, SSH, DNS) to port numbers.
                </p>
              </div>

              <div className="p-3 bg-white border border-indigo-200 rounded-xl shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-indigo-700">
                  <Database className="w-4 h-4" />
                  <span>3. Database Depths</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Relational table structures, primary/foreign keys, and constructing SQL SELECT queries with filters.
                </p>
              </div>

              <div className="p-3 bg-white border border-purple-200 rounded-xl shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-purple-700">
                  <Cpu className="w-4 h-4" />
                  <span>4. Neural Citadel</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Perceptrons, tuning synaptic weights and bias parameters, and fitting decision boundaries with high accuracy.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Ready to Venture!
          </button>
        </div>
      </div>
    </div>
  );
};
