import React, { useState, useEffect } from 'react';
import { LevelPuzzle } from '../game/types.ts';
import {
  validatePythonPuzzle,
  validateNetworkPortsPuzzle,
  validateSqlQueryPuzzle,
  validateMlWeightsPuzzle,
} from '../game/rules.ts';
import { fetchAiHint, AiHintResponse } from '../game/aiHintService.ts';
import { sound } from '../game/sound.ts';
import {
  Code2,
  Network,
  Database,
  Cpu,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Play,
  Lightbulb,
  X,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

interface PuzzleModalProps {
  puzzle: LevelPuzzle;
  isOpen: boolean;
  onSolve: () => void;
  onClose: () => void;
}

export const PuzzleModal: React.FC<PuzzleModalProps> = ({
  puzzle,
  isOpen,
  onSolve,
  onClose,
}) => {
  if (!isOpen) return null;

  const [attempts, setAttempts] = useState(1);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [hintData, setHintData] = useState<AiHintResponse | null>(null);
  const [hintLevel, setHintLevel] = useState(1);
  const [isHintLoading, setIsHintLoading] = useState(false);

  // Puzzle specific state
  const [code, setCode] = useState<string>(
    typeof puzzle.initialState === 'string' ? puzzle.initialState : ''
  );

  // Network ports state
  const [portsMapping, setPortsMapping] = useState<Record<string, number | null>>(
    puzzle.type === 'network_ports' ? { ...puzzle.initialState } : {}
  );

  // SQL Query state
  const [sqlQuery, setSqlQuery] = useState<string>(
    puzzle.type === 'sql_query' ? puzzle.initialState : ''
  );

  // ML Weights state
  const [weight, setWeight] = useState<number>(0.2);
  const [bias, setBias] = useState<number>(-0.5);
  const [threshold] = useState<number>(0.5);

  useEffect(() => {
    // Reset state when puzzle changes
    setFeedback(null);
    setHintData(null);
    setHintLevel(1);
    if (typeof puzzle.initialState === 'string') {
      setCode(puzzle.initialState);
      setSqlQuery(puzzle.initialState);
    }
    if (puzzle.type === 'network_ports') {
      setPortsMapping({ ...puzzle.initialState });
    }
  }, [puzzle]);

  const handleRequestHint = async () => {
    setIsHintLoading(true);
    sound.playCheckpoint();
    try {
      const hint = await fetchAiHint({
        puzzle,
        currentAttempt: attempts,
        hintLevel,
        playerInput: puzzle.type === 'code_debug' ? code : sqlQuery,
      });
      setHintData(hint);
      setHintLevel((prev) => Math.min(prev + 1, 3));
    } finally {
      setIsHintLoading(false);
    }
  };

  const handleVerify = () => {
    setAttempts((prev) => prev + 1);

    if (puzzle.type === 'code_debug') {
      const res = validatePythonPuzzle(code, puzzle.solution);
      if (res.valid) {
        sound.playPuzzleSolve();
        setFeedback({ success: true, message: res.message });
        setTimeout(() => onSolve(), 1000);
      } else {
        sound.playPuzzleFail();
        setFeedback({ success: false, message: res.message });
      }
    } else if (puzzle.type === 'network_ports') {
      const res = validateNetworkPortsPuzzle(portsMapping, puzzle.solution);
      if (res.valid) {
        sound.playPuzzleSolve();
        setFeedback({ success: true, message: res.message });
        setTimeout(() => onSolve(), 1000);
      } else {
        sound.playPuzzleFail();
        setFeedback({ success: false, message: res.message });
      }
    } else if (puzzle.type === 'sql_query') {
      const res = validateSqlQueryPuzzle(sqlQuery, puzzle.solution);
      if (res.valid) {
        sound.playPuzzleSolve();
        setFeedback({ success: true, message: res.message });
        setTimeout(() => onSolve(), 1000);
      } else {
        sound.playPuzzleFail();
        setFeedback({ success: false, message: res.message });
      }
    } else if (puzzle.type === 'ml_weights') {
      const res = validateMlWeightsPuzzle(weight, bias, threshold, puzzle.solution.samples);
      if (res.valid) {
        sound.playPuzzleSolve();
        setFeedback({ success: true, message: res.message });
        setTimeout(() => onSolve(), 1000);
      } else {
        sound.playPuzzleFail();
        setFeedback({ success: false, message: res.message });
      }
    }
  };

  const handleReset = () => {
    setFeedback(null);
    if (typeof puzzle.initialState === 'string') {
      setCode(puzzle.initialState);
      setSqlQuery(puzzle.initialState);
    }
    if (puzzle.type === 'network_ports') {
      setPortsMapping({ ...puzzle.initialState });
    }
    if (puzzle.type === 'ml_weights') {
      setWeight(0.2);
      setBias(-0.5);
    }
  };

  const getIcon = () => {
    switch (puzzle.type) {
      case 'code_debug':
        return <Code2 className="w-5 h-5 text-sky-600" />;
      case 'network_ports':
        return <Network className="w-5 h-5 text-teal-600" />;
      case 'sql_query':
        return <Database className="w-5 h-5 text-indigo-600" />;
      case 'ml_weights':
        return <Cpu className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="puzzle-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="relative w-full max-w-2xl bg-white border border-sky-200 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-sky-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-xs border border-sky-100">
              {getIcon()}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                Interactive Tech Challenge
              </span>
              <h2 id="puzzle-modal-title" className="text-lg font-extrabold text-slate-800">
                {puzzle.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close puzzle"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Objective Callout */}
          <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-xl text-sm text-slate-700 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 mb-0.5">{puzzle.prompt}</p>
              <p className="text-xs text-blue-800/80 whitespace-pre-line">{puzzle.instructions}</p>
            </div>
          </div>

          {/* PUZZLE TYPE 1: PYTHON CODE DEBUG */}
          {puzzle.type === 'code_debug' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>python_script.py</span>
                <span>4 spaces = 1 indent</span>
              </div>
              <div className="relative border border-slate-300 rounded-xl overflow-hidden shadow-inner bg-slate-900">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows={6}
                  aria-label="Python code editor"
                  className="w-full p-4 font-mono text-sm text-sky-300 bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-sky-500"
                  spellCheck={false}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCode('def unlock_firewall(core_energy, boost):\n    total_power = core_energy * 2 + boost\n    return total_power')}
                  className="text-xs text-sky-600 hover:text-sky-700 font-medium px-2 py-1 bg-sky-50 hover:bg-sky-100 rounded border border-sky-200 transition-colors cursor-pointer"
                >
                  Quick Format (Auto Indent)
                </button>
              </div>
            </div>
          )}

          {/* PUZZLE TYPE 2: NETWORK PORTS ROUTER */}
          {puzzle.type === 'network_ports' && (
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Route Incoming Protocols to Target Ports:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.keys(puzzle.solution).map((proto) => {
                  const currentPort = portsMapping[proto];
                  const options = [80, 443, 22, 53, 21, 3306];
                  return (
                    <div
                      key={proto}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800 text-sm">
                          {proto}
                        </span>
                        <span className="text-xs text-slate-500">
                          {proto === 'HTTP' && '(Insecure Web)'}
                          {proto === 'HTTPS' && '(Secure Web)'}
                          {proto === 'SSH' && '(Secure Shell)'}
                          {proto === 'DNS' && '(Domain Name)'}
                        </span>
                      </div>
                      <select
                        aria-label={`Select port for ${proto}`}
                        value={currentPort !== null ? String(currentPort) : ''}
                        onChange={(e) => {
                          const val = e.target.value ? parseInt(e.target.value, 10) : null;
                          setPortsMapping((prev) => ({ ...prev, [proto]: val }));
                        }}
                        className="px-3 py-1.5 text-xs font-mono font-bold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-xs focus:ring-2 focus:ring-teal-500 cursor-pointer"
                      >
                        <option value="">Select Port...</option>
                        {options.map((opt) => (
                          <option key={opt} value={opt}>
                            Port {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PUZZLE TYPE 3: SQL QUERY BUILDER */}
          {puzzle.type === 'sql_query' && (
            <div className="space-y-4">
              {/* Schema Table Preview */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                  Table Schema: users
                </span>
                <div className="grid grid-cols-4 gap-2 text-xs font-mono">
                  <div className="p-1.5 bg-white border border-slate-200 rounded text-center">id (INT)</div>
                  <div className="p-1.5 bg-sky-100 border border-sky-300 rounded text-center font-bold text-sky-800">username (VARCHAR)</div>
                  <div className="p-1.5 bg-sky-100 border border-sky-300 rounded text-center font-bold text-sky-800">role (VARCHAR)</div>
                  <div className="p-1.5 bg-amber-100 border border-amber-300 rounded text-center font-bold text-amber-800">active (TINYINT)</div>
                </div>
              </div>

              {/* Quick Tokens */}
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-slate-500">Insert SQL Tokens:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'SELECT username, role FROM users WHERE active = 1',
                    'username, role',
                    'FROM users',
                    'WHERE active = 1',
                  ].map((tok) => (
                    <button
                      key={tok}
                      type="button"
                      onClick={() => setSqlQuery(tok)}
                      className="px-2.5 py-1 text-xs font-mono bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
                    >
                      {tok}
                    </button>
                  ))}
                </div>
              </div>

              {/* SQL Text Area */}
              <div className="border border-slate-300 rounded-xl overflow-hidden bg-slate-900 shadow-inner">
                <textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  rows={3}
                  aria-label="SQL query editor"
                  className="w-full p-3 font-mono text-sm text-emerald-400 bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  spellCheck={false}
                />
              </div>
            </div>
          )}

          {/* PUZZLE TYPE 4: MACHINE LEARNING WEIGHTS */}
          {puzzle.type === 'ml_weights' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sliders */}
                <div className="space-y-4 bg-slate-50 p-4 border border-slate-200 rounded-xl">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Weight (w1): {weight.toFixed(1)}</span>
                      <span className="text-purple-600">Target: ~1.4</span>
                    </div>
                    <input
                      type="range"
                      min="-2.0"
                      max="3.0"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(parseFloat(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                      aria-label="Adjust Weight w1"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Bias (b): {bias.toFixed(1)}</span>
                      <span className="text-purple-600">Target: ~0.0</span>
                    </div>
                    <input
                      type="range"
                      min="-2.0"
                      max="2.0"
                      step="0.1"
                      value={bias}
                      onChange={(e) => setBias(parseFloat(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                      aria-label="Adjust Bias b"
                    />
                  </div>

                  <div className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                    <p className="font-semibold text-slate-800">Decision Rule:</p>
                    <code className="text-purple-700 font-mono">
                      Output = ({weight.toFixed(1)} · x1 + 0.5 · x2 + {bias.toFixed(1)}) ≥ 0.5
                    </code>
                  </div>
                </div>

                {/* Live Accuracy Meter */}
                <div className="bg-purple-50/60 border border-purple-200 p-4 rounded-xl flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-700 block mb-1">
                      Classification Accuracy
                    </span>
                    {(() => {
                      const res = validateMlWeightsPuzzle(weight, bias, threshold, puzzle.solution.samples);
                      return (
                        <div className="space-y-2 mt-2">
                          <div className="text-3xl font-black text-purple-900 tabular-nums">
                            {res.accuracy}%
                          </div>
                          <div className="w-full bg-purple-200 h-2.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                res.valid ? 'bg-emerald-500' : 'bg-purple-600'
                              }`}
                              style={{ width: `${res.accuracy}%` }}
                            />
                          </div>
                          <p className="text-xs text-purple-800 mt-1">
                            {res.valid ? '✅ Pass threshold (≥ 88%) reached!' : '⚠️ Adjust weight slider until accuracy reaches 88%+'}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feedback Message */}
          {feedback && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                feedback.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-rose-50 border-rose-300 text-rose-800'
              }`}
            >
              {feedback.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="text-sm">
                <p className="font-bold">{feedback.success ? 'Success!' : 'Verification Error'}</p>
                <p className="text-xs mt-0.5 whitespace-pre-line">{feedback.message}</p>
              </div>
            </div>
          )}

          {/* AI Hint Box */}
          {hintData && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-1.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 font-bold text-amber-800">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Ada AI Hint (Level {hintData.hintLevel} of {hintData.maxHintLevel}):</span>
              </div>
              <p className="text-slate-800 font-medium pl-5">{hintData.text}</p>
              {hintData.conceptNote && (
                <p className="text-slate-600 italic text-[11px] pl-5 border-t border-amber-200/60 pt-1">
                  Concept: {hintData.conceptNote}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRequestHint}
              disabled={isHintLoading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 rounded-xl border border-amber-300 transition-colors cursor-pointer"
            >
              <Lightbulb className="w-4 h-4" />
              <span>{isHintLoading ? 'Consulting AI...' : 'AI Hint'}</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              Exit Terminal
            </button>
            <button
              type="button"
              onClick={handleVerify}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Run & Verify</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
