export type Puzzle = {
  name: string;
  fen: string;
  solution: string;
  description: string;
};

export type Progress = {
  correct: number;
  incorrect: number;
  streak: number;
  rating: number;
};

export const DEFAULT_RATING = 1200;
export const DEFAULT_PROGRESS: Progress = { correct: 0, incorrect: 0, streak: 0, rating: DEFAULT_RATING };

export const PUZZLES: Puzzle[] = [
  {
    name: 'Mate in 1',
    fen: '6k1/5ppp/8/8/8/8/5PPP/3Q2K1 w - - 0 1',
    solution: 'Qd8#',
    description: 'White to move and deliver checkmate.',
  },
  {
    name: 'Fork',
    fen: 'r3k3/8/8/3N4/8/8/8/4K3 w - - 0 1',
    solution: 'Nc7+',
    description: 'Attack two pieces at once with your knight.',
  },
  {
    name: 'Skewer',
    fen: '8/3k3q/8/8/8/8/8/R5K1 w - - 0 1',
    solution: 'Ra7+',
    description: 'Check the king and win the piece behind it.',
  },
  {
    name: 'Pin',
    fen: '6k1/8/8/3q4/8/1P6/8/4KB2 w - - 0 1',
    solution: 'Bc4',
    description: 'Pin the queen to the king.',
  },
  {
    name: 'Discovered Attack',
    fen: '4k3/8/q7/8/4B3/8/8/4R1K1 w - - 0 1',
    solution: 'Bd3+',
    description: 'Move one piece to unleash another and win material.',
  },
];

export function clampRating(value: number) {
  return Math.max(800, Math.min(2000, value));
}

export function getRandomPuzzle(exclude?: Puzzle): Puzzle {
  const pool = exclude ? PUZZLES.filter((p) => p !== exclude) : PUZZLES;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function ratingLabel(rating: number) {
  if (rating < 1000) return 'Beginner';
  if (rating < 1400) return 'Club Player';
  if (rating < 1700) return 'Candidate Master';
  if (rating < 1900) return 'Expert';
  return 'Master';
}

const stripCheck = (san: string) => san.replace(/[+#]/g, '');

export function isCorrectMove(san: string, puzzle: Puzzle) {
  return stripCheck(san) === stripCheck(puzzle.solution);
}

export function applyResult(progress: Progress, correct: boolean): Progress {
  if (correct) {
    const streak = progress.streak + 1;
    return {
      ...progress,
      correct: progress.correct + 1,
      streak,
      rating: clampRating(progress.rating + 20 + streak * 5),
    };
  }
  return {
    ...progress,
    incorrect: progress.incorrect + 1,
    streak: 0,
    rating: clampRating(progress.rating - 25),
  };
}
