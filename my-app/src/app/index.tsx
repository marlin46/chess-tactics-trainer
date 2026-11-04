import type { Move } from 'chess.js';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChessBoard } from '@/components/chess-board';
import { useProgress } from '@/hooks/use-progress';
import { applyResult, getRandomPuzzle, isCorrectMove, ratingLabel } from '@/lib/puzzles';

export default function TrainerScreen() {
  const { width } = useWindowDimensions();
  const boardSize = Math.min(width - 32, 520);

  const [progress, setProgress] = useProgress();
  const [puzzle, setPuzzle] = useState(() => getRandomPuzzle());
  const [fen, setFen] = useState(puzzle.fen);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [message, setMessage] = useState('Tap a piece, then tap where to move it.');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);

  const nextPuzzle = () => {
    const next = getRandomPuzzle(puzzle);
    setPuzzle(next);
    setFen(next.fen);
    setLastMove(null);
    setResult(null);
    setMessage('Tap a piece, then tap where to move it.');
  };

  const handleMove = (move: Move) => {
    setFen(move.after);
    setLastMove({ from: move.from, to: move.to });
    const correct = isCorrectMove(move.san, puzzle);
    setProgress((p) => applyResult(p, correct));
    setResult(correct ? 'correct' : 'wrong');
    setMessage(correct ? `Correct! ${puzzle.name} solved.` : `Not quite. The best move was ${puzzle.solution}.`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topbar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>CHESS TACTICS TRAINER</Text>
            <Text style={styles.title}>Pattern Practice</Text>
          </View>
          <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={nextPuzzle}>
            <Text style={styles.buttonText}>{result ? 'Next puzzle' : 'Random puzzle'}</Text>
          </Pressable>
        </View>

        <View style={styles.statsGrid}>
          <Stat label="Correct" value={progress.correct} />
          <Stat label="Incorrect" value={progress.incorrect} />
          <Stat label="Streak" value={progress.streak} />
          <Stat label="Rating" value={progress.rating} sub={ratingLabel(progress.rating)} blue />
        </View>

        <View style={styles.boardWrap}>
          <ChessBoard
            key={puzzle.fen}
            fen={fen}
            size={boardSize}
            disabled={result !== null}
            lastMove={lastMove}
            onMove={handleMove}
          />
        </View>

        <View style={styles.box}>
          <Text style={styles.label}>PUZZLE</Text>
          <Text style={styles.puzzleName}>{puzzle.name}</Text>
          <Text style={styles.puzzleDesc}>{puzzle.description}</Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.label}>STATUS</Text>
          <Text
            style={[
              styles.status,
              result === 'correct' && { color: '#86efac' },
              result === 'wrong' && { color: '#fca5a5' },
            ]}>
            {message}
          </Text>
          {result && (
            <View style={styles.solution}>
              <Text style={styles.solutionLabel}>SOLUTION</Text>
              <Text style={styles.solutionMove}>{puzzle.solution}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value, sub, blue }: { label: string; value: number; sub?: string; blue?: boolean }) {
  return (
    <View style={[styles.stat, blue && styles.statBlue]}>
      <Text style={styles.statLabel}>{label.toUpperCase()}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {sub && <Text style={styles.statSub}>{sub}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  topbar: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  eyebrow: { color: '#7dd3fc', fontSize: 11, letterSpacing: 1.6, fontWeight: '600' },
  title: { color: '#e2e8f0', fontSize: 28, fontWeight: '800', marginTop: 4 },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  buttonText: { color: 'white', fontWeight: '700' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stat: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: 'rgba(15, 118, 110, 0.16)',
    borderColor: 'rgba(94, 234, 212, 0.2)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 2,
  },
  statBlue: { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(147, 197, 253, 0.2)' },
  statLabel: { color: '#cbd5e1', fontSize: 11, letterSpacing: 1.2 },
  statValue: { color: '#f8fafc', fontSize: 28, fontWeight: '800' },
  statSub: { color: '#bfdbfe', fontSize: 12 },
  boardWrap: { alignItems: 'center' },
  box: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderColor: 'rgba(148, 163, 184, 0.16)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  label: { color: '#93c5fd', fontSize: 11, letterSpacing: 1.4, marginBottom: 8 },
  puzzleName: { color: '#f8fafc', fontSize: 20, fontWeight: '700', marginBottom: 6 },
  puzzleDesc: { color: '#dbeafe', fontSize: 15 },
  status: { color: '#f8fafc', fontSize: 15 },
  solution: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.16)',
    gap: 4,
  },
  solutionLabel: { color: '#cbd5e1', fontSize: 11, letterSpacing: 1 },
  solutionMove: { color: '#fbbf24', fontSize: 24, fontWeight: '800' },
});
