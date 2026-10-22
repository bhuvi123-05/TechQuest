import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkAABB,
  calcPlayerLevel,
  xpForLevel,
  calculateRunScore,
  validatePythonPuzzle,
  validateNetworkPortsPuzzle,
  validateSqlQueryPuzzle,
  validateMlWeightsPuzzle,
  evaluateBadges,
} from './rules.ts';

test('checkAABB correctly detects overlapping and non-overlapping rectangles', () => {
  const boxA = { x: 10, y: 10, w: 20, h: 20 };
  const boxB = { x: 25, y: 25, w: 20, h: 20 }; // Overlaps
  const boxC = { x: 100, y: 100, w: 20, h: 20 }; // Disjoint

  assert.equal(checkAABB(boxA, boxB), true);
  assert.equal(checkAABB(boxA, boxC), false);
  assert.equal(checkAABB(boxB, boxC), false);
});

test('calcPlayerLevel and xpForLevel correctly scale RPG progression', () => {
  assert.equal(calcPlayerLevel(0), 1);
  assert.equal(calcPlayerLevel(50), 1);
  assert.equal(calcPlayerLevel(100), 2);
  assert.equal(calcPlayerLevel(400), 3);
  assert.equal(calcPlayerLevel(900), 4);

  assert.equal(xpForLevel(1), 0);
  assert.equal(xpForLevel(2), 100);
  assert.equal(xpForLevel(3), 400);
});

test('calculateRunScore computes score, stars, and XP correctly', () => {
  const result = calculateRunScore({
    coinsCollected: 10,
    totalCoins: 10,
    timeTakenSec: 45,
    timeLimitSec: 120,
    puzzleSolved: true,
    puzzleAttempts: 1,
    livesRemaining: 3,
    enemiesDefeated: 2,
  });

  // coinScore = 10 * 100 = 1000
  // timeBonus = round((75 / 120) * 1000) = 625
  // puzzleScore = 1500
  // livesBonus = 3 * 250 = 750
  // enemyScore = 2 * 150 = 300
  // total = 1000 + 625 + 1500 + 750 + 300 = 4175
  assert.equal(result.score, 4175);
  assert.equal(result.stars, 3);
  assert.equal(result.xpGained > 1000, true);
});

test('validatePythonPuzzle enforces syntax and indentation rules', () => {
  const badCodeNoIndent = `def calculate_sum(a, b):
return a + b`;
  const resultBad = validatePythonPuzzle(badCodeNoIndent, { requiredSubstrings: ['return'] });
  assert.equal(resultBad.valid, false);
  assert.match(resultBad.message, /IndentationError/);

  const goodCode = `def calculate_sum(a, b):
    return a + b`;
  const resultGood = validatePythonPuzzle(goodCode, { requiredSubstrings: ['return'] });
  assert.equal(resultGood.valid, true);

  const missingReturn = `def calculate_sum(a, b):
    total = a + b`;
  const resultMissing = validatePythonPuzzle(missingReturn, { requiredSubstrings: ['return'] });
  assert.equal(resultMissing.valid, false);
});

test('validateNetworkPortsPuzzle verifies port mappings', () => {
  const expected = { HTTP: 80, HTTPS: 443, SSH: 22, DNS: 53 };
  const partial = { HTTP: 80, HTTPS: 443, SSH: 21, DNS: 53 };
  const full = { HTTP: 80, HTTPS: 443, SSH: 22, DNS: 53 };

  const partialRes = validateNetworkPortsPuzzle(partial, expected);
  assert.equal(partialRes.valid, false);
  assert.equal(partialRes.matchedCount, 3);

  const fullRes = validateNetworkPortsPuzzle(full, expected);
  assert.equal(fullRes.valid, true);
  assert.equal(fullRes.matchedCount, 4);
});

test('validateSqlQueryPuzzle checks table, columns, and WHERE condition', () => {
  const req = {
    selectColumns: ['id', 'username'],
    fromTable: 'users',
    whereConditions: ['active = 1'],
  };

  const validQuery = 'SELECT id, username FROM users WHERE active = 1';
  assert.equal(validateSqlQueryPuzzle(validQuery, req).valid, true);

  const missingWhere = 'SELECT id, username FROM users';
  assert.equal(validateSqlQueryPuzzle(missingWhere, req).valid, false);

  const wrongTable = 'SELECT id, username FROM accounts WHERE active = 1';
  assert.equal(validateSqlQueryPuzzle(wrongTable, req).valid, false);
});

test('validateMlWeightsPuzzle calculates accuracy on sample data', () => {
  const samples: Array<{ x1: number; x2: number; label: 0 | 1 }> = [
    { x1: 1, x2: 2, label: 1 },
    { x1: 2, x2: 2, label: 1 },
    { x1: -1, x2: -1, label: 0 },
    { x1: -2, x2: -1, label: 0 },
  ];

  // Good weights: w=1.5, bias=0, threshold=0.5
  const goodRes = validateMlWeightsPuzzle(1.5, 0, 0.5, samples);
  assert.equal(goodRes.valid, true);
  assert.equal(goodRes.accuracy, 100);

  // Bad weights: w=-2
  const badRes = validateMlWeightsPuzzle(-2, 0, 0.5, samples);
  assert.equal(badRes.valid, false);
});

test('evaluateBadges unlocks badges based on player milestones', () => {
  const badges = evaluateBadges({
    levelsCompleted: 4,
    totalXp: 2500,
    totalStars: 9,
    perfectPuzzles: 4,
    flawlessRuns: 1,
  });

  assert.equal(badges.includes('first_byte'), true);
  assert.equal(badges.includes('tech_master'), true);
  assert.equal(badges.includes('star_coder'), true);
  assert.equal(badges.includes('bug_hunter'), true);
  assert.equal(badges.includes('xp_veteran'), true);
  assert.equal(badges.includes('flawless'), true);
});
