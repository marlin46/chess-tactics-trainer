import { useEffect, useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

const STORAGE_KEY = 'chess-trainer-progress';
const DEFAULT_RATING = 1200;

const PUZZLES = [
  {
    name: 'Mate in 1',
    fen: '6k1/5ppp/8/8/8/8/5PPP/6K1 w - - 0 1',
    solution: 'Qd8#',
    description: 'White to move and deliver checkmate.'
  },
  {
    name: 'Fork',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq - 0 1',
    solution: 'Nxe5',
    description: 'Find the tactical fork.'
  },
  {
    name: 'Skewer',
    fen: '6k1/5ppp/8/8/8/3Q4/5PPP/6K1 w - - 0 1',
    solution: 'Qd8+',
    description: 'Use a skewer to win material.'
  },
  {
    name: 'Pin',
    fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
    solution: 'Bxf7+',
    description: 'The king is exposed; take advantage of the pin.'
  },
  {
    name: 'Discovered Attack',
    fen: '8/8/8/8/8/8/5k2/4K3 w - - 0 1',
    solution: 'Kf2',
    description: 'A quiet move creates a strong attack.'
  }
];

function clampRating(value) {
  return Math.max(800, Math.min(2000, value));
}

function getRandomPuzzle() {
  const index = Math.floor(Math.random() * PUZZLES.length);
  return PUZZLES[index];
}

function App() {
  const [progress, setProgress] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { correct: 0, incorrect: 0, streak: 0, rating: DEFAULT_RATING };
      const parsed = JSON.parse(raw);
      return {
        correct: Number(parsed.correct) || 0,
        incorrect: Number(parsed.incorrect) || 0,
        streak: Number(parsed.streak) || 0,
        rating: clampRating(Number(parsed.rating) || DEFAULT_RATING)
      };
    } catch {
      return { correct: 0, incorrect: 0, streak: 0, rating: DEFAULT_RATING };
    }
  });

  const [puzzle, setPuzzle] = useState(() => getRandomPuzzle());
  const [boardState, setBoardState] = useState(() => {
    const game = new Chess();
    game.load(puzzle.fen);
    return game.fen();
  });
  const [message, setMessage] = useState('Choose the best move!');
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    const game = new Chess();
    game.load(puzzle.fen);
    setBoardState(game.fen());
    setShowSolution(false);
    setMessage('Choose the best move!');
  }, [puzzle]);

  const ratingLabel = useMemo(() => {
    if (progress.rating < 1000) return 'Beginner';
    if (progress.rating < 1400) return 'Club Player';
    if (progress.rating < 1700) return 'Candidate Master';
    if (progress.rating < 1900) return 'Expert';
    return 'Master';
  }, [progress.rating]);

  const handleRandomPuzzle = () => {
    setPuzzle(getRandomPuzzle());
  };

  const handleMove = (sourceSquare, targetSquare) => {
    const game = new Chess(boardState);
    try {
      const move = game.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
      if (!move) {
        setMessage('Illegal move — try again.');
        return false;
      }

      const isCorrect = move.san === puzzle.solution || move.san === puzzle.solution.replace('#', '') || move.san === puzzle.solution.replace('+', '');
      if (isCorrect) {
        const nextCorrect = progress.correct + 1;
        const nextStreak = progress.streak + 1;
        const nextRating = clampRating(progress.rating + 20 + nextStreak * 5);
        setProgress({
          correct: nextCorrect,
          incorrect: progress.incorrect,
          streak: nextStreak,
          rating: nextRating
        });
        setMessage(`Correct! ${puzzle.name} solved.`);
        setShowSolution(true);
        return true;
      }

      const nextIncorrect = progress.incorrect + 1;
      const nextStreak = 0;
      const nextRating = clampRating(progress.rating - 25);
      setProgress({
        correct: progress.correct,
        incorrect: nextIncorrect,
        streak: nextStreak,
        rating: nextRating
      });
      setMessage(`Not quite. The best move was ${puzzle.solution}.`);
      setShowSolution(true);
      return false;
    } catch {
      setMessage('Illegal move — try again.');
      return false;
    }
  };

  return (
    <div className="page-shell">
      <div className="app-card">
        <header className="topbar">
          <div>
            <p className="eyebrow">Chess Tactics Trainer</p>
            <h1>Pattern Practice</h1>
          </div>
          <button className="primary-button" onClick={handleRandomPuzzle}>
            Random puzzle
          </button>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <span>Correct</span>
            <strong>{progress.correct}</strong>
          </div>
          <div className="stat-card">
            <span>Incorrect</span>
            <strong>{progress.incorrect}</strong>
          </div>
          <div className="stat-card">
            <span>Streak</span>
            <strong>{progress.streak}</strong>
          </div>
          <div className="stat-card rating-card">
            <span>Rating</span>
            <strong>{progress.rating}</strong>
            <small>{ratingLabel}</small>
          </div>
        </section>

        <div className="board-panel">
          <div className="board-wrap">
            <Chessboard
              id="trainer-board"
              position={boardState}
              onPieceDrop={handleMove}
              boardOrientation="white"
              customDarkSquare="#7c9ab9"
              customLightSquare="#edf2f7"
              customBoardStyle={{ borderRadius: '18px', boxShadow: '0 18px 40px rgba(15, 23, 42, 0.18)' }}
            />
          </div>

          <aside className="side-panel">
            <div className="puzzle-box">
              <p className="label">Puzzle</p>
              <h2>{puzzle.name}</h2>
              <p>{puzzle.description}</p>
            </div>

            <div className="status-box">
              <p className="label">Status</p>
              <p className={showSolution ? 'status-message solved' : 'status-message'}>{message}</p>
              {showSolution && (
                <div className="solution-box">
                  <span>Solution</span>
                  <strong>{puzzle.solution}</strong>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default App;
