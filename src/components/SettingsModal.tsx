import React, { useState } from 'react';
import { Settings, Volume2, VolumeX, RotateCcw, X, ShieldAlert } from 'lucide-react';
import { sound } from '../game/sound.ts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetProgress: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onResetProgress,
}) => {
  if (!isOpen) return null;

  const [volume, setVolumeState] = useState<number>(Math.round(sound.getVolume() * 100));
  const [isMuted, setIsMutedState] = useState<boolean>(sound.getMuted());
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  const handleVolumeChange = (v: number) => {
    setVolumeState(v);
    sound.setVolume(v / 100);
    if (v > 0 && isMuted) {
      sound.setMuted(false);
      setIsMutedState(false);
    }
  };

  const handleToggleMute = () => {
    const next = sound.toggleMute();
    setIsMutedState(next);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="relative w-full max-w-md bg-white border border-sky-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-sky-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-xs border border-sky-100">
              <Settings className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                Preferences
              </span>
              <h2 id="settings-modal-title" className="text-xl font-black text-slate-900">
                Game Settings
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 space-y-6">
          {/* Audio Settings */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Audio & Procedural Synth
            </h3>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">Mute All Audio</span>
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer flex items-center gap-2 text-xs font-bold ${
                    isMuted
                      ? 'bg-rose-50 border-rose-300 text-rose-700'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  }`}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isMuted ? 'Muted' : 'Enabled'}</span>
                </button>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                  <span>Master Volume</span>
                  <span className="font-mono">{volume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
                  className="w-full accent-sky-600 cursor-pointer"
                  aria-label="Adjust Master Volume"
                />
              </div>
            </div>
          </div>

          {/* Progress Reset */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Data Management
            </h3>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Resetting progress clears your high scores, unlocked levels, and acquired badges stored in local memory.
              </p>

              {confirmReset ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onResetProgress();
                      setConfirmReset(false);
                      onClose();
                    }}
                    className="flex-1 py-2 px-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer"
                  >
                    Confirm Clear All
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="py-2 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="w-full py-2.5 px-3 text-xs font-bold text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Saved Progress</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
