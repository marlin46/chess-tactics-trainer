import { Chess, type Move, type Square } from 'chess.js';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

// Filled glyphs for both colors; color is set with text color + outline.
const GLYPHS: Record<string, string> = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };

const LIGHT = '#edf2f7';
const DARK = '#7c9ab9';

type Props = {
  fen: string;
  size: number;
  disabled?: boolean;
  lastMove?: { from: string; to: string } | null;
  onMove: (move: Move) => void;
};

export function ChessBoard({ fen, size, disabled, lastMove, onMove }: Props) {
  const [selected, setSelected] = useState<Square | null>(null);
  const game = useMemo(() => new Chess(fen), [fen]);
  const board = game.board();
  const square = size / 8;

  const targets = useMemo(() => {
    if (!selected) return new Set<string>();
    return new Set(game.moves({ square: selected, verbose: true }).map((m) => m.to));
  }, [game, selected]);

  const handlePress = (sq: Square) => {
    if (disabled) return;
    const piece = game.get(sq);

    if (selected && targets.has(sq)) {
      const next = new Chess(fen);
      const move = next.move({ from: selected, to: sq, promotion: 'q' });
      setSelected(null);
      onMove(move);
      return;
    }

    if (piece && piece.color === game.turn()) {
      setSelected(sq === selected ? null : sq);
    } else {
      setSelected(null);
    }
  };

  return (
    <View style={[styles.board, { width: size, height: size }]}>
      {RANKS.map((rank, r) => (
        <View key={rank} style={styles.row}>
          {FILES.map((file, f) => {
            const sq = `${file}${rank}` as Square;
            const piece = board[r][f];
            const isLight = (r + f) % 2 === 0;
            const isSelected = sq === selected;
            const isTarget = targets.has(sq);
            const isLast = lastMove && (lastMove.from === sq || lastMove.to === sq);

            return (
              <Pressable
                key={sq}
                onPress={() => handlePress(sq)}
                style={[
                  { width: square, height: square, backgroundColor: isLight ? LIGHT : DARK },
                  styles.square,
                ]}>
                {(isSelected || isLast) && (
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: isSelected ? 'rgba(250, 204, 21, 0.55)' : 'rgba(250, 204, 21, 0.3)' }]} />
                )}
                {f === 0 && (
                  <Text style={[styles.coord, styles.rankLabel, { color: isLight ? DARK : LIGHT }]}>{rank}</Text>
                )}
                {r === 7 && (
                  <Text style={[styles.coord, styles.fileLabel, { color: isLight ? DARK : LIGHT }]}>{file}</Text>
                )}
                {piece && (
                  <Text
                    style={[
                      styles.piece,
                      {
                        fontSize: square * 0.78,
                        lineHeight: square,
                        color: piece.color === 'w' ? '#ffffff' : '#111827',
                        textShadowColor: piece.color === 'w' ? '#111827' : '#ffffff',
                      },
                    ]}>
                    {GLYPHS[piece.type]}
                  </Text>
                )}
                {isTarget && (
                  <View
                    pointerEvents="none"
                    style={
                      piece
                        ? [StyleSheet.absoluteFill, styles.captureRing, { borderRadius: square / 2 }]
                        : [styles.dot, { width: square * 0.3, height: square * 0.3, borderRadius: square * 0.15 }]
                    }
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  square: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  piece: {
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
  coord: {
    position: 'absolute',
    fontSize: 9,
    fontWeight: '700',
  },
  rankLabel: { top: 2, left: 3 },
  fileLabel: { bottom: 1, right: 3 },
  dot: {
    position: 'absolute',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  captureRing: {
    borderWidth: 4,
    borderColor: 'rgba(15, 23, 42, 0.35)',
  },
});
