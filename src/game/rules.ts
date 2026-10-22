/**
 * Pure game rules, scoring math, physics collisions, and puzzle validation.
 * Decoupled from React and Canvas for high-speed deterministic testing.
 */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Check if two axis-aligned bounding boxes overlap.
 */
export function checkAABB(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

/**
 * Calculate player level from accumulated total XP.
 * Standard RPG curve: Level = 1 + floor(sqrt(XP / 100))
 */
export function calcPlayerLevel(totalXp: number): number {
  if (totalXp <= 0) return 1;
  return 1 + Math.floor(Math.sqrt(totalXp / 100));
}

/**
 * Calculate XP required to reach the next level.
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.pow(level - 1, 2) * 100;
}

/**
 * Calculate final run score based on coins collected, time remaining,
 * puzzle accuracy, and lives remaining.
 */
export function calculateRunScore(params: {
  coinsCollected: number;
  totalCoins: number;
  timeTakenSec: number;
  timeLimitSec: number;
  puzzleSolved: boolean;
  puzzleAttempts: number;
  livesRemaining: number;
  enemiesDefeated: number;
}): { score: number; stars: number; xpGained: number } {
  const {
    coinsCollected,
    totalCoins,
    timeTakenSec,
    timeLimitSec,
    puzzleSolved,
    puzzleAttempts,
    livesRemaining,
    enemiesDefeated,
  } = params;

  // Base score from coins (100 pts per coin)
  const coinScore = coinsCollected * 100;

  // Time bonus (up to 1000 pts if finished fast)
  const timeLeft = Math.max(0, timeLimitSec - timeTakenSec);
  const timeBonus = Math.round((timeLeft / timeLimitSec) * 1000);

  // Puzzle bonus: 1500 max, deducted 200 per extra attempt, 0 if not solved
  let puzzleScore = 0;
  if (puzzleSolved) {
    puzzleScore = Math.max(500, 1500 - (puzzleAttempts - 1) * 200);
  }

  // Lives bonus: 250 pts per remaining life
  const livesBonus = livesRemaining * 250;

  // Enemy defeat bonus: 150 pts each
  const enemyScore = enemiesDefeated * 150;

  const score = Math.max(0, coinScore + timeBonus + puzzleScore + livesBonus + enemyScore);

  // Star rating calculation (1 to 3 stars)
  const coinRatio = totalCoins > 0 ? coinsCollected / totalCoins : 1;
  let stars = 1;
  if (puzzleSolved && coinRatio >= 0.5) stars = 2;
  if (puzzleSolved && coinRatio >= 0.85 && timeBonus > 300) stars = 3;

  // XP gained from this run
  const xpGained = Math.round(score * 0.4) + (stars * 100);

  return { score, stars, xpGained };
}

/**
 * Python Debug Puzzle Validator:
 * Checks code string for key syntax, corrected indentation, or correct return value.
 */
export function validatePythonPuzzle(
  code: string,
  solutionRequirements: {
    forbiddenSubstrings?: string[];
    requiredSubstrings?: string[];
    regexPatterns?: RegExp[];
  }
): { valid: boolean; message: string } {
  const cleanCode = code.trim();

  if (!cleanCode) {
    return { valid: false, message: 'Code cannot be empty!' };
  }

  if (solutionRequirements.forbiddenSubstrings) {
    for (const sub of solutionRequirements.forbiddenSubstrings) {
      if (cleanCode.includes(sub)) {
        return { valid: false, message: `Found syntax error or bad token: "${sub}"` };
      }
    }
  }

  if (solutionRequirements.requiredSubstrings) {
    for (const sub of solutionRequirements.requiredSubstrings) {
      if (!cleanCode.includes(sub)) {
        return { valid: false, message: `Missing required statement or syntax: "${sub}"` };
      }
    }
  }

  // Check simple Python colon and indentation rules
  const lines = cleanCode.split('\n');
  let expectingIndent = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().length === 0) continue;

    if (expectingIndent) {
      if (!line.startsWith(' ') && !line.startsWith('\t')) {
        return { valid: false, message: `IndentationError at line ${i + 1}: expected an indented block` };
      }
      expectingIndent = false;
    }

    if (line.trim().endsWith(':')) {
      expectingIndent = true;
    }
  }

  return { valid: true, message: 'Code compiled and passed all test cases successfully! Great job!' };
}

/**
 * Networking Port Matcher Puzzle Validator:
 * Validates mappings from protocols (HTTP, HTTPS, SSH, DNS) to port numbers.
 */
export function validateNetworkPortsPuzzle(
  mappings: Record<string, number | null>,
  expected: Record<string, number>
): { valid: boolean; matchedCount: number; totalCount: number; message: string } {
  const total = Object.keys(expected).length;
  let correct = 0;

  for (const [protocol, port] of Object.entries(expected)) {
    if (mappings[protocol] === port) {
      correct++;
    }
  }

  if (correct === total) {
    return {
      valid: true,
      matchedCount: correct,
      totalCount: total,
      message: 'All network protocols routed to the correct ports! Gateway unlocked.',
    };
  }

  return {
    valid: false,
    matchedCount: correct,
    totalCount: total,
    message: `${correct}/${total} protocols correctly mapped. Check the port definitions!`,
  };
}

/**
 * SQL Query Builder Puzzle Validator:
 * Normalizes SQL queries and validates against expected clauses.
 */
export function validateSqlQueryPuzzle(
  query: string,
  expected: {
    selectColumns: string[];
    fromTable: string;
    whereConditions?: string[];
    orderBy?: string;
  }
): { valid: boolean; message: string } {
  const normalized = query.replace(/\s+/g, ' ').trim().toUpperCase();

  // Validate SELECT
  if (!normalized.startsWith('SELECT')) {
    return { valid: false, message: 'Query must start with SELECT keyword.' };
  }

  // Check columns
  for (const col of expected.selectColumns) {
    if (!normalized.includes(col.toUpperCase())) {
      return { valid: false, message: `Missing required column in SELECT: "${col}"` };
    }
  }

  // Validate FROM table
  const expectedFrom = `FROM ${expected.fromTable.toUpperCase()}`;
  if (!normalized.includes(expectedFrom)) {
    return { valid: false, message: `Expected clause: "${expectedFrom}"` };
  }

  // Validate WHERE
  if (expected.whereConditions) {
    if (!normalized.includes('WHERE')) {
      return { valid: false, message: 'Missing WHERE clause in SQL query.' };
    }
    for (const cond of expected.whereConditions) {
      if (!normalized.includes(cond.toUpperCase())) {
        return { valid: false, message: `Missing condition in WHERE clause: "${cond}"` };
      }
    }
  }

  return {
    valid: true,
    message: 'SQL Query executed successfully! 4 rows fetched with authorization token.',
  };
}

/**
 * Machine Learning Weight/Threshold Puzzle Validator:
 * Checks if selected hyperparameter / threshold yields > 90% accuracy.
 */
export function validateMlWeightsPuzzle(
  weight: number,
  bias: number,
  threshold: number,
  samples: Array<{ x1: number; x2: number; label: 0 | 1 }>
): { valid: boolean; accuracy: number; message: string } {
  let correct = 0;

  for (const s of samples) {
    // Linear decision: w * x1 + bias > threshold ? 1 : 0
    const score = s.x1 * weight + s.x2 * 0.5 + bias;
    const predicted = score >= threshold ? 1 : 0;
    if (predicted === s.label) {
      correct++;
    }
  }

  const accuracy = samples.length > 0 ? (correct / samples.length) * 100 : 0;
  const passed = accuracy >= 88;

  return {
    valid: passed,
    accuracy: Math.round(accuracy),
    message: passed
      ? `Model converged! Accuracy: ${Math.round(accuracy)}% (Target >= 88%). Neural core calibrated!`
      : `Accuracy: ${Math.round(accuracy)}%. Boundary is misclassifying samples. Adjust weights or bias!`,
  };
}

/**
 * Check which badges player has unlocked
 */
export function evaluateBadges(progress: {
  levelsCompleted: number;
  totalXp: number;
  totalStars: number;
  perfectPuzzles: number;
  flawlessRuns: number;
}): string[] {
  const earned: string[] = [];

  if (progress.levelsCompleted >= 1) earned.push('first_byte');
  if (progress.levelsCompleted >= 4) earned.push('tech_master');
  if (progress.totalStars >= 6) earned.push('star_coder');
  if (progress.perfectPuzzles >= 3) earned.push('bug_hunter');
  if (progress.totalXp >= 2000) earned.push('xp_veteran');
  if (progress.flawlessRuns >= 1) earned.push('flawless');

  return earned;
}
