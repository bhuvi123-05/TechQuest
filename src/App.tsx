import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TitleScreen } from './components/TitleScreen.tsx';
import { GameCanvas } from './components/GameCanvas.tsx';
import { GameHud } from './components/GameHud.tsx';
import { PuzzleModal } from './components/PuzzleModal.tsx';
import { TutorialModal } from './components/TutorialModal.tsx';
import { PauseModal, VictoryModal, GameOverModal } from './components/StatusModals.tsx';
import { LevelsModal } from './components/LevelsModal.tsx';
import { LeaderboardModal } from './components/LeaderboardModal.tsx';
import { InstructionsModal } from './components/InstructionsModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { LEVELS, DEFAULT_LEADERBOARD } from './game/levels.ts';
import { GameProgress, LeaderboardEntry } from './game/types.ts';
import { calcPlayerLevel, calculateRunScore, evaluateBadges } from './game/rules.ts';
import { sound } from './game/sound.ts';

type AppState = 'title' | 'playing' | 'paused' | 'victory' | 'gameover';

const STORAGE_KEY_PROGRESS = 'techquest_progress_v2';
const STORAGE_KEY_LEADERBOARD = 'techquest_leaderboard_v2';

export default function App() {
  // Game State Machine
  const [gameState, setGameState] = useState<AppState>('title');
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);

  // Modals state
  const [isLevelsOpen, setIsLevelsOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPuzzleOpen, setIsPuzzleOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Audio mute state
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  // HUD live state
  const [hudStats, setHudStats] = useState({
    health: 3,
    maxHealth: 3,
    lives: 3,
    score: 0,
    coins: 0,
    hasKey: false,
    interactPrompt: null as string | null,
  });

  // End of run victory stats
  const [runStats, setRunStats] = useState({
    score: 0,
    stars: 1,
    xpGained: 0,
    timeTakenSec: 0,
    coinsCollected: 0,
    totalCoins: 0,
  });

  // Saved player progress
  const [progress, setProgress] = useState<GameProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {
      unlockedLevels: [1],
      highScores: {},
      starsEarned: {},
      badges: [],
      totalXp: 0,
      level: 1,
    };
  });

  // Leaderboard data
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LEADERBOARD);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return DEFAULT_LEADERBOARD;
  });

  // External input tracking for mobile on-screen buttons
  const externalInputRef = useRef({
    left: false,
    right: false,
    jump: false,
    dash: false,
    interact: false,
  });

  const currentLevel = LEVELS.find((l) => l.id === currentLevelId) || LEVELS[0];

  // Sync dataset.state with game state
  useEffect(() => {
    let bodyState = 'title';
    if (gameState === 'playing') bodyState = 'playing';
    else if (gameState === 'paused') bodyState = 'paused';
    else if (gameState === 'victory' || gameState === 'gameover') bodyState = 'gameover';
    document.body.dataset.state = bodyState;
  }, [gameState]);

  // Check ?autostart=1 query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      setGameState('playing');
    }
  }, []);

  // Save progress changes to LocalStorage
  const saveProgress = useCallback((newProgress: GameProgress) => {
    setProgress(newProgress);
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(newProgress));
    } catch {}
  }, []);

  // Start / Play Game Handler
  const handleStartGame = useCallback((levelId?: number) => {
    const targetLvl = levelId || currentLevelId;
    setCurrentLevelId(targetLvl);
    setGameState('playing');
    setIsLevelsOpen(false);
    setIsInstructionsOpen(false);
    setIsLeaderboardOpen(false);
    setIsSettingsOpen(false);
    setIsTutorialOpen(true); // Show tutorial overlay on first level entry
  }, [currentLevelId]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // In Title screen: Enter or Space triggers Start
      if (gameState === 'title' && !isLevelsOpen && !isInstructionsOpen && !isLeaderboardOpen && !isSettingsOpen) {
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          handleStartGame();
          return;
        }
      }

      // In Playing: Esc or P pauses
      if (gameState === 'playing' && !isPuzzleOpen && !isTutorialOpen) {
        if (e.code === 'Escape' || e.code === 'KeyP') {
          e.preventDefault();
          setGameState('paused');
          return;
        }
        if (e.code === 'KeyM') {
          const next = sound.toggleMute();
          setIsMuted(next);
          return;
        }
        if (e.code === 'KeyH') {
          setIsPuzzleOpen(true);
          return;
        }
      }

      // In Paused: Esc resumes
      if (gameState === 'paused') {
        if (e.code === 'Escape' || e.code === 'KeyP') {
          e.preventDefault();
          setGameState('playing');
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [gameState, isLevelsOpen, isInstructionsOpen, isLeaderboardOpen, isSettingsOpen, isPuzzleOpen, isTutorialOpen, handleStartGame]);

  // Level Complete / Victory
  const handleLevelComplete = (stats: {
    score: number;
    coinsCollected: number;
    timeTakenSec: number;
    livesRemaining: number;
    enemiesDefeated: number;
  }) => {
    const calculated = calculateRunScore({
      coinsCollected: stats.coinsCollected,
      totalCoins: currentLevel.totalCoins,
      timeTakenSec: stats.timeTakenSec,
      timeLimitSec: currentLevel.timeLimitSec,
      puzzleSolved: true,
      puzzleAttempts: 1,
      livesRemaining: stats.livesRemaining,
      enemiesDefeated: stats.enemiesDefeated,
    });

    const finalScore = stats.score + calculated.score;
    const finalXpGained = calculated.xpGained;

    setRunStats({
      score: finalScore,
      stars: calculated.stars,
      xpGained: finalXpGained,
      timeTakenSec: stats.timeTakenSec,
      coinsCollected: stats.coinsCollected,
      totalCoins: currentLevel.totalCoins,
    });

    // Update Progress
    const nextLevelId = currentLevelId + 1;
    const nextUnlocked = Array.from(
      new Set([...progress.unlockedLevels, nextLevelId <= LEVELS.length ? nextLevelId : currentLevelId])
    );
    const newHighScores = {
      ...progress.highScores,
      [currentLevelId]: Math.max(progress.highScores[currentLevelId] || 0, finalScore),
    };
    const newStars = {
      ...progress.starsEarned,
      [currentLevelId]: Math.max(progress.starsEarned[currentLevelId] || 0, calculated.stars),
    };
    const newTotalXp = progress.totalXp + finalXpGained;
    const newPlayerLevel = calcPlayerLevel(newTotalXp);

    // Evaluate badges
    const totalStars = Object.values(newStars).reduce((a, b) => a + b, 0);
    const newBadges = evaluateBadges({
      levelsCompleted: nextUnlocked.length - (nextLevelId <= LEVELS.length ? 1 : 0),
      totalXp: newTotalXp,
      totalStars,
      perfectPuzzles: 1,
      flawlessRuns: stats.livesRemaining === 3 ? 1 : 0,
    });

    saveProgress({
      unlockedLevels: nextUnlocked,
      highScores: newHighScores,
      starsEarned: newStars,
      badges: Array.from(new Set([...progress.badges, ...newBadges])),
      totalXp: newTotalXp,
      level: newPlayerLevel,
    });

    // Update Leaderboard entry
    const newEntry: LeaderboardEntry = {
      name: 'Player',
      score: finalScore,
      xp: newTotalXp,
      world: currentLevel.title.split(':')[0],
      date: 'Today',
    };
    const updatedLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    setLeaderboard(updatedLeaderboard);
    try {
      localStorage.setItem(STORAGE_KEY_LEADERBOARD, JSON.stringify(updatedLeaderboard));
    } catch {}

    setGameState('victory');
  };

  // Game Over
  const handleGameOver = (stats: { score: number }) => {
    setRunStats((prev) => ({ ...prev, score: stats.score }));
    setGameState('gameover');
  };

  // Solve terminal puzzle
  const handleSolvePuzzle = () => {
    setIsPuzzleOpen(false);
    if ((window as any).__techquest_solve_terminal) {
      (window as any).__techquest_solve_terminal();
    }
  };

  // Reset progress from settings
  const handleResetProgress = () => {
    const cleanProgress: GameProgress = {
      unlockedLevels: [1],
      highScores: {},
      starsEarned: {},
      badges: [],
      totalXp: 0,
      level: 1,
    };
    saveProgress(cleanProgress);
  };

  return (
    <main className="w-full h-screen overflow-hidden bg-slate-50 font-sans text-slate-800 select-none">
      {/* 1. TITLE SCREEN */}
      {gameState === 'title' && (
        <TitleScreen
          progress={progress}
          onStartGame={() => handleStartGame()}
          onOpenLevels={() => setIsLevelsOpen(true)}
          onOpenInstructions={() => setIsInstructionsOpen(true)}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* 2. PLAYING / GAMEPLAY SCREEN */}
      {gameState !== 'title' && (
        <div className="relative w-full h-full">
          {/* Isolated 2D Canvas */}
          <GameCanvas
            level={currentLevel}
            isPaused={gameState === 'paused' || isPuzzleOpen || isTutorialOpen}
            onUpdateHud={(stats) => {
              setHudStats((prev) => ({
                ...prev,
                ...stats,
              }));
            }}
            onOpenTerminal={() => setIsPuzzleOpen(true)}
            onLevelComplete={handleLevelComplete}
            onGameOver={handleGameOver}
            externalInputRef={externalInputRef}
          />

          {/* Low-occlusion perimeter HUD */}
          <GameHud
            level={currentLevel}
            health={hudStats.health}
            maxHealth={hudStats.maxHealth}
            lives={hudStats.lives}
            score={hudStats.score}
            coins={hudStats.coins}
            totalCoins={currentLevel.totalCoins}
            hasKey={hudStats.hasKey}
            timeRemainingSec={Math.max(0, currentLevel.timeLimitSec)}
            currentXp={progress.totalXp}
            playerLevel={progress.level}
            isMuted={isMuted}
            interactPrompt={hudStats.interactPrompt}
            onPause={() => setGameState('paused')}
            onToggleMute={() => {
              const next = sound.toggleMute();
              setIsMuted(next);
            }}
            onOpenTutorial={() => setIsTutorialOpen(true)}
            onOpenHint={() => setIsPuzzleOpen(true)}
            onInteract={() => {
              externalInputRef.current.interact = true;
            }}
            onTouchLeft={(active) => {
              externalInputRef.current.left = active;
            }}
            onTouchRight={(active) => {
              externalInputRef.current.right = active;
            }}
            onTouchJump={() => {
              externalInputRef.current.jump = true;
            }}
            onTouchDash={() => {
              externalInputRef.current.dash = true;
            }}
          />
        </div>
      )}

      {/* 3. INTERACTIVE PUZZLE MODAL */}
      <PuzzleModal
        puzzle={currentLevel.puzzle}
        isOpen={isPuzzleOpen}
        onSolve={handleSolvePuzzle}
        onClose={() => setIsPuzzleOpen(false)}
      />

      {/* 4. LEVEL TUTORIAL OVERLAY */}
      <TutorialModal
        level={currentLevel}
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onStartLevel={() => setIsTutorialOpen(false)}
      />

      {/* 5. PAUSE MODAL */}
      <PauseModal
        isOpen={gameState === 'paused'}
        onResume={() => setGameState('playing')}
        onRestart={() => {
          setGameState('playing');
          // Re-trigger level mount
          setCurrentLevelId(currentLevelId);
        }}
        onHome={() => setGameState('title')}
      />

      {/* 6. VICTORY MODAL */}
      <VictoryModal
        isOpen={gameState === 'victory'}
        score={runStats.score}
        stars={runStats.stars}
        xpGained={runStats.xpGained}
        timeTakenSec={runStats.timeTakenSec}
        coinsCollected={runStats.coinsCollected}
        totalCoins={runStats.totalCoins}
        hasNextLevel={currentLevelId < LEVELS.length}
        onNextLevel={() => {
          const next = currentLevelId + 1;
          setCurrentLevelId(next);
          setGameState('playing');
          setIsTutorialOpen(true);
        }}
        onReplay={() => {
          setGameState('playing');
        }}
        onHome={() => setGameState('title')}
      />

      {/* 7. GAME OVER MODAL */}
      <GameOverModal
        isOpen={gameState === 'gameover'}
        score={runStats.score}
        onTryAgain={() => {
          setGameState('playing');
        }}
        onHome={() => setGameState('title')}
      />

      {/* 8. LEVELS MATRIX MODAL */}
      <LevelsModal
        isOpen={isLevelsOpen}
        progress={progress}
        onSelectLevel={(id) => handleStartGame(id)}
        onClose={() => setIsLevelsOpen(false)}
      />

      {/* 9. LEADERBOARD & BADGES MODAL */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        entries={leaderboard}
        progress={progress}
        onClose={() => setIsLeaderboardOpen(false)}
      />

      {/* 10. INSTRUCTIONS MODAL */}
      <InstructionsModal
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
      />

      {/* 11. SETTINGS MODAL */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onResetProgress={handleResetProgress}
      />
    </main>
  );
}
