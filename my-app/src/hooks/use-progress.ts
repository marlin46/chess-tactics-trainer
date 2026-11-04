import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import { clampRating, DEFAULT_PROGRESS, DEFAULT_RATING, type Progress } from '@/lib/puzzles';

const STORAGE_KEY = 'chess-trainer-progress';

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(DEFAULT_PROGRESS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw);
        setProgress({
          correct: Number(parsed.correct) || 0,
          incorrect: Number(parsed.incorrect) || 0,
          streak: Number(parsed.streak) || 0,
          rating: clampRating(Number(parsed.rating) || DEFAULT_RATING),
        });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress)).catch(() => {});
  }, [progress, loaded]);

  return [progress, setProgress] as const;
}
