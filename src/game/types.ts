/**
 * Core game types for TechQuest 2D Puzzle Adventure
 */

export type WorldId = 'python' | 'networking' | 'database' | 'ml';

export interface WorldInfo {
  id: WorldId;
  name: string;
  subtitle: string;
  color: string;
  accentBg: string;
  borderColor: string;
  textColor: string;
  icon: string;
  description: string;
  conceptSummary: string[];
}

export interface LevelConfig {
  id: number;
  worldId: WorldId;
  title: string;
  subtitle: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  targetXp: number;
  totalCoins: number;
  totalKeys: number;
  timeLimitSec: number;
  tutorial: {
    guideName: string;
    headline: string;
    objective: string;
    conceptTitle: string;
    conceptDetails: string;
    controlsGuide: string;
    proTip: string;
  };
  puzzle: LevelPuzzle;
  worldWidth: number;
  worldHeight: number;
  spawnPoint: { x: number; y: number };
  portalPoint: { x: number; y: number };
  platforms: PlatformDef[];
  hazards: HazardDef[];
  enemies: EnemyDef[];
  coins: CoinDef[];
  keys: KeyDef[];
  terminals: TerminalDef[];
  checkpoints: CheckpointDef[];
}

export type PuzzleType = 'code_debug' | 'network_ports' | 'sql_query' | 'ml_weights';

export interface LevelPuzzle {
  id: string;
  type: PuzzleType;
  title: string;
  prompt: string;
  instructions: string;
  initialState: any;
  solution: any;
  hints: string[];
  explanation: string;
}

export interface PlatformDef {
  x: number;
  y: number;
  w: number;
  h: number;
  type?: 'solid' | 'glass' | 'moving' | 'bounce';
  moveRange?: { minX?: number; maxX?: number; minY?: number; maxY?: number };
  speed?: number;
}

export interface HazardDef {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'spikes' | 'laser' | 'firewall';
  active?: boolean;
  cycleSec?: number;
}

export interface EnemyDef {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'syntax_bug' | 'packet_dropper' | 'null_pointer' | 'overfitter';
  patrolMinX: number;
  patrolMaxX: number;
  speed: number;
  hp: number;
  maxHp: number;
}

export interface CoinDef {
  id: string;
  x: number;
  y: number;
  collected?: boolean;
  type?: 'coin' | 'gem' | 'packet';
  value: number;
}

export interface KeyDef {
  id: string;
  x: number;
  y: number;
  collected?: boolean;
  name: string;
}

export interface TerminalDef {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  solved?: boolean;
  label: string;
}

export interface CheckpointDef {
  id: string;
  x: number;
  y: number;
  active?: boolean;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  facing: 1 | -1;
  isGrounded: boolean;
  jumpCount: number;
  coyoteTimer: number;
  jumpBufferTimer: number;
  health: number;
  maxHealth: number;
  lives: number;
  invulnerableTimer: number;
  squashX: number;
  squashY: number;
  isDashing: boolean;
  dashTimer: number;
  dashCooldown: number;
}

export interface GameProgress {
  unlockedLevels: number[];
  highScores: Record<number, number>;
  starsEarned: Record<number, number>;
  badges: string[];
  totalXp: number;
  level: number;
}

export interface LeaderboardEntry {
  rank?: number;
  name: string;
  score: number;
  xp: number;
  world: string;
  date: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}
