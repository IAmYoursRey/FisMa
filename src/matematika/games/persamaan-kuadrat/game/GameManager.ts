import { useState, useEffect, useCallback } from 'react';
import { Difficulty, generateQuestion, QuadraticEquation } from './QuestionGenerator';

export type GameMode = 'tebak-akar' | 'pilih-metode' | 'lengkapi-langkah' | 'waktu' | 'grafik';

export interface GameStats {
  score: number;
  correctCount: number;
  wrongCount: number;
  startTime: number;
  timeElapsed: number; // in seconds
}

export function useGameManager() {
  const [activeMode, setActiveMode] = useState<GameMode | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('mudah');
  
  const [currentQuestion, setCurrentQuestion] = useState<QuadraticEquation | null>(null);
  const [hintLevel, setHintLevel] = useState<number>(0);
  
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    correctCount: 0,
    wrongCount: 0,
    startTime: 0,
    timeElapsed: 0,
  });

  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // Timer effect
  useEffect(() => {
    let timer: any = null;
    if (activeMode && !isGameOver && currentQuestion) {
      timer = setInterval(() => {
        setStats(prev => ({
          ...prev,
          timeElapsed: Math.floor((Date.now() - prev.startTime) / 1000)
        }));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeMode, isGameOver, currentQuestion]);

  const startGame = useCallback((mode: GameMode, diff: Difficulty) => {
    setActiveMode(mode);
    setDifficulty(diff);
    setStats({
      score: 0,
      correctCount: 0,
      wrongCount: 0,
      startTime: Date.now(),
      timeElapsed: 0,
    });
    setHintLevel(0);
    setIsGameOver(false);
    setCurrentQuestion(generateQuestion(diff, mode === 'tebak-akar' || mode === 'waktu'));
  }, []);

  const nextQuestion = useCallback(() => {
    setCurrentQuestion(generateQuestion(difficulty, activeMode === 'tebak-akar' || activeMode === 'waktu'));
    setHintLevel(0);
  }, [difficulty, activeMode]);

  const handleCorrect = useCallback((points: number = 100) => {
    const penalty = hintLevel * 20;
    const finalPoints = Math.max(10, points - penalty);
    
    setStats(prev => ({
      ...prev,
      score: prev.score + finalPoints,
      correctCount: prev.correctCount + 1,
    }));
  }, [hintLevel]);

  const handleWrong = useCallback(() => {
    setStats(prev => ({
      ...prev,
      score: Math.max(0, prev.score - 10), // slight penalty for wrong
      wrongCount: prev.wrongCount + 1,
    }));
  }, []);

  const useHint = useCallback(() => {
    if (hintLevel < 3) {
      setHintLevel(prev => prev + 1);
    }
  }, [hintLevel]);

  const endGame = useCallback(() => {
    setIsGameOver(true);
  }, []);

  const quitGame = useCallback(() => {
    setActiveMode(null);
    setCurrentQuestion(null);
  }, []);

  return {
    activeMode,
    difficulty,
    currentQuestion,
    hintLevel,
    stats,
    isGameOver,
    startGame,
    nextQuestion,
    handleCorrect,
    handleWrong,
    useHint,
    endGame,
    quitGame
  };
}
