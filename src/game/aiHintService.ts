/**
 * AI Hint and Explanation Service for TechQuest.
 * Provides progressive intelligent hints, syntax explanations,
 * and conversational tech assistance.
 */

import { LevelPuzzle } from './types.ts';

export interface AiHintResponse {
  hintLevel: number;
  maxHintLevel: number;
  text: string;
  source: 'gemini' | 'curated';
  conceptNote?: string;
}

export async function fetchAiHint(params: {
  puzzle: LevelPuzzle;
  currentAttempt: number;
  hintLevel: number;
  playerInput?: string;
}): Promise<AiHintResponse> {
  const { puzzle, hintLevel, playerInput } = params;

  // Try server proxy first if configured
  try {
    const res = await fetch('/api/ai-hint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        puzzleId: puzzle.id,
        puzzleType: puzzle.type,
        puzzleTitle: puzzle.title,
        prompt: puzzle.prompt,
        hintLevel,
        playerInput,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.hint) {
        return {
          hintLevel,
          maxHintLevel: 3,
          text: data.hint,
          source: 'gemini',
          conceptNote: data.conceptNote,
        };
      }
    }
  } catch {
    // Fallback to client curated hint
  }

  // Curated progressive hints
  const fallbackHints = puzzle.hints || [
    'Review the required syntax and parameters.',
    'Check indentation and variable names carefully.',
    'Examine the expected return type or port mapping.',
  ];

  const safeIdx = Math.min(hintLevel - 1, fallbackHints.length - 1);
  const hintText = fallbackHints[safeIdx] || fallbackHints[0];

  return {
    hintLevel,
    maxHintLevel: fallbackHints.length,
    text: hintText,
    source: 'curated',
    conceptNote: puzzle.explanation,
  };
}
