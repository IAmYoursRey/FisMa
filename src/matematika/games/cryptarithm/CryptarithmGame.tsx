import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Gamepad2,
  Cpu,
  RotateCcw,
  Sparkles,
  SkipForward,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Trophy,
  Settings,
  Play,
  Check,
  Hash,
  Plus,
  Minus,
  Layers,
} from 'lucide-react';
import {
  CryptarithmConfig,
  GameStats,
  MathOperation,
  PuzzleData,
  SolverResult,
} from '../../../types/cryptarithm';
import {
  generateCryptarithmPuzzle,
  validateAnswer,
  solveCryptarithmEquation,
} from '../../control/cryptarithmEngine';
import { PuzzleBuilder } from './PuzzleBuilder';
import { useTheme } from '../../../services/themeService';

interface CryptarithmGameProps {
  onBackToDashboard: () => void;
}

const STORAGE_KEY_CONFIG = 'fisma_cryptarithm_config_v2';

export const CryptarithmGame: React.FC<CryptarithmGameProps> = ({ onBackToDashboard }) => {
  const { theme } = useTheme();

  // Active Tab: 'game' or 'solver'
  const [activeTab, setActiveTab] = useState<'game' | 'solver'>('game');

  // Game Sub-view: 'setup' | 'play' | 'result'
  const [gameView, setGameView] = useState<'setup' | 'play' | 'result'>('setup');

  // Configuration State (Dynamic Rows & Digits)
  const [config, setConfig] = useState<CryptarithmConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return {
      operation: '+',
      rowCount: 2, // 2 to 5 rows
      digitCount: 3, // 2 to 8 digits
      rowDigits: [3, 3, 3], // [term1, term2, ..., resultTerm]
      mode: 'fixed',
      targetQuestions: 1,
      timerSec: 0,
      toleranceEnabled: false,
      maxTolerance: 1,
    };
  });

  // Game Progress State
  const [stats, setStats] = useState<GameStats>({
    currentQuestionIndex: 0,
    score: 0,
    correctCount: 0,
    wrongCount: 0,
    currentAttempts: 0,
  });

  // Active Puzzle Data
  const [currentPuzzle, setCurrentPuzzle] = useState<PuzzleData | null>(null);

  // User Answer Assignments for active puzzle
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});

  // Feedback Message
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'warning' | null;
    message: string;
  }>({ type: null, message: '' });

  // Timer State
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // High Score State
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('fisma_cryptarithm_highscore');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Update High Score whenever game ends or score changes
  useEffect(() => {
    if (stats.score > highScore) {
      setHighScore(stats.score);
      try {
        localStorage.setItem('fisma_cryptarithm_highscore', stats.score.toString());
      } catch {}
    }
  }, [stats.score, highScore]);

  // Input Refs for smooth auto-focus navigation
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const solverInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // BOT SOLVER DYNAMIC STATES
  const [solverRowCount, setSolverRowCount] = useState<number>(2); // 2 to 5 rows
  const [solverDigitCount, setSolverDigitCount] = useState<number>(3); // 2 to 8 digits
  const [solverTerms, setSolverTerms] = useState<string[]>(['SEND', 'MORE']);
  const [solverResultTerm, setSolverResultTerm] = useState<string>('MONEY');
  const [solverOp, setSolverOp] = useState<MathOperation>('+');
  const [solverResult, setSolverResult] = useState<SolverResult | null>(null);

  // Sync rowDigits when rowCount or digitCount changes
  const updateDigitsConfig = (newRowCount: number, newDigitCount: number) => {
    const newRowDigits = Array(newRowCount + 1).fill(newDigitCount);
    if (config.operation === '+') {
      newRowDigits[newRowCount] = newDigitCount + 1; // Result row gets 1 extra digit capability
    }
    setConfig((prev) => ({
      ...prev,
      rowCount: newRowCount,
      digitCount: newDigitCount,
      rowDigits: newRowDigits,
    }));
  };

  // Save config changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    } catch {
      // Storage error
    }
  }, [config]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer Timeout Handler
  const handleTimeout = useCallback(() => {
    setFeedback({
      type: 'error',
      message: 'Waktu Habis! Poin tidak bertambah. Melanjutkan ke soal berikutnya...',
    });
    setStats((prev) => ({ ...prev, wrongCount: prev.wrongCount + 1 }));

    setTimeout(() => {
      loadNextQuestion();
    }, 2200);
  }, []);

  const startTimer = useCallback(
    (duration: number) => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (duration <= 0) return;

      setTimeLeft(duration);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [handleTimeout]
  );

  // Load Next Question
  const loadNextQuestion = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    setStats((prev) => {
      const nextIdx = prev.currentQuestionIndex + 1;

      // Check fixed mode limit
      if (config.mode === 'fixed' && nextIdx > config.targetQuestions) {
        setGameView('result');
        return prev;
      }

      const puzzle = generateCryptarithmPuzzle(config);
      setCurrentPuzzle(puzzle);

      // Initialize user inputs
      const initialInputs: Record<string, string> = {};
      Object.keys(puzzle.solutionMap).forEach((letter) => {
        initialInputs[letter] = '';
      });
      setUserInputs(initialInputs);
      setFeedback({ type: null, message: '' });

      if (config.timerSec > 0) {
        startTimer(config.timerSec);
      }

      return {
        ...prev,
        currentQuestionIndex: nextIdx,
        currentAttempts: 0,
      };
    });
  }, [config, startTimer]);

  // Start Game
  const handleStartGame = () => {
    setStats({
      currentQuestionIndex: 0,
      score: 0,
      correctCount: 0,
      wrongCount: 0,
      currentAttempts: 0,
    });
    setGameView('play');
    setTimeout(() => {
      loadNextQuestion();
    }, 100);
  };

  // Check Answer
  const handleCheckAnswer = () => {
    if (!currentPuzzle) return;

    // Convert string inputs to numbers
    const parsedMap: Record<string, number | undefined> = {};
    Object.keys(userInputs).forEach((k) => {
      const v = userInputs[k].trim();
      parsedMap[k] = v === '' ? undefined : parseInt(v, 10);
    });

    const validation = validateAnswer(currentPuzzle, parsedMap);

    if (!validation.isValid) {
      setStats((prev) => {
        const attempts = prev.currentAttempts + 1;

        if (config.toleranceEnabled) {
          const remaining = config.maxTolerance - attempts;
          if (remaining > 0) {
            setFeedback({
              type: 'warning',
              message: `${validation.message} (Sisa Kesempatan: ${remaining}x)`,
            });
            return { ...prev, currentAttempts: attempts };
          } else {
            // Max tolerance reached
            if (timerRef.current) clearInterval(timerRef.current);
            const solutionText = Object.entries(currentPuzzle.solutionMap)
              .map(([k, v]) => `${k}=${v}`)
              .join(', ');

            setFeedback({
              type: 'error',
              message: `Batas percobaan (${config.maxTolerance}x) habis. Salah satu solusi benar: ${solutionText}`,
            });

            setTimeout(() => {
              loadNextQuestion();
            }, 2600);

            return {
              ...prev,
              wrongCount: prev.wrongCount + 1,
              currentAttempts: attempts,
            };
          }
        } else {
          setFeedback({ type: 'warning', message: validation.message });
          return prev;
        }
      });
      return;
    }

    // Correct Answer
    if (timerRef.current) clearInterval(timerRef.current);
    setStats((prev) => ({
      ...prev,
      score: prev.score + 100,
      correctCount: prev.correctCount + 1,
    }));

    setFeedback({
      type: 'success',
      message: validation.message,
    });

    setTimeout(() => {
      loadNextQuestion();
    }, 2000);
  };

  // Give Hint (-50 Score)
  const handleGiveHint = () => {
    if (!currentPuzzle) return;

    if (stats.score < 50) {
      setFeedback({
        type: 'warning',
        message: 'Poin tidak cukup untuk meminta petunjuk! Membutuhkan minimal 50 poin.',
      });
      return;
    }

    const letters = Object.keys(currentPuzzle.solutionMap);
    const unassigned = letters.filter(
      (l) => userInputs[l] !== currentPuzzle.solutionMap[l].toString()
    );

    if (unassigned.length === 0) {
      setFeedback({
        type: 'warning',
        message: 'Semua huruf sudah terisi dengan benar!',
      });
      return;
    }

    const randomLetter = unassigned[Math.floor(Math.random() * unassigned.length)];
    const correctVal = currentPuzzle.solutionMap[randomLetter].toString();

    setUserInputs((prev) => ({ ...prev, [randomLetter]: correctVal }));
    setStats((prev) => ({ ...prev, score: Math.max(0, prev.score - 50) }));

    setFeedback({
      type: 'warning',
      message: `Petunjuk: Huruf ${randomLetter} = ${correctVal} (-50 Poin)`,
    });
  };

  // Skip Question
  const handleSkipQuestion = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStats((prev) => ({ ...prev, wrongCount: prev.wrongCount + 1 }));
    loadNextQuestion();
  };

  // Handle Input Digit Change for Game
  const handleInputChange = (letter: string, val: string) => {
    const digitOnly = val.replace(/[^0-9]/g, '').slice(-1);
    setUserInputs((prev) => ({ ...prev, [letter]: digitOnly }));

    // Auto focus next input
    if (digitOnly && currentPuzzle) {
      const letters = Object.keys(currentPuzzle.solutionMap).sort();
      const currIdx = letters.indexOf(letter);
      if (currIdx >= 0 && currIdx < letters.length - 1) {
        const nextLetter = letters[currIdx + 1];
        inputRefs.current[nextLetter]?.focus();
      }
    }
  };

  // BOT SOLVER CELL LETTER HANDLERS
  const handleSolverCellLetterChange = (
    type: 'operand' | 'result',
    rIdx: number,
    cIdx: number,
    val: string
  ) => {
    const cleanChar = val.toUpperCase().replace(/[^A-Z]/g, '').slice(-1);

    if (type === 'operand') {
      setSolverTerms((prev) => {
        const updated = [...prev];
        const currentTerm = updated[rIdx] || '';
        const chars = Array.from({ length: solverDigitCount }, (_, i) => currentTerm[i] || ' ');
        chars[cIdx] = cleanChar || ' ';
        updated[rIdx] = chars.join('');
        return updated;
      });

      if (cleanChar) {
        if (cIdx + 1 < solverDigitCount) {
          solverInputRefs.current[`op-${rIdx}-${cIdx + 1}`]?.focus();
        } else if (rIdx + 1 < solverRowCount) {
          solverInputRefs.current[`op-${rIdx + 1}-0`]?.focus();
        } else {
          solverInputRefs.current[`res-0`]?.focus();
        }
      }
    } else {
      setSolverResultTerm((prev) => {
        const chars = Array.from({ length: solverDigitCount }, (_, i) => prev[i] || ' ');
        chars[cIdx] = cleanChar || ' ';
        return chars.join('');
      });

      if (cleanChar) {
        if (cIdx + 1 < solverDigitCount) {
          solverInputRefs.current[`res-${cIdx + 1}`]?.focus();
        }
      }
    }
  };

  const handleSolverCellKeyDown = (
    type: 'operand' | 'result',
    rIdx: number,
    cIdx: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const currentTerm = type === 'operand' ? solverTerms[rIdx] || '' : solverResultTerm;
    const char = currentTerm[cIdx] || '';

    if (e.key === 'Backspace' && (!char || char === ' ')) {
      e.preventDefault();
      if (type === 'operand') {
        if (cIdx > 0) {
          solverInputRefs.current[`op-${rIdx}-${cIdx - 1}`]?.focus();
        } else if (rIdx > 0) {
          solverInputRefs.current[`op-${rIdx - 1}-${solverDigitCount - 1}`]?.focus();
        }
      } else {
        if (cIdx > 0) {
          solverInputRefs.current[`res-${cIdx - 1}`]?.focus();
        } else {
          solverInputRefs.current[`op-${solverRowCount - 1}-${solverDigitCount - 1}`]?.focus();
        }
      }
    }
  };

  const handleRunSolver = () => {
    const cleanTerms = solverTerms.map((t) => t.replace(/[^A-Z]/g, ''));
    const cleanResult = solverResultTerm.replace(/[^A-Z]/g, '');
    const res = solveCryptarithmEquation(cleanTerms, cleanResult, solverOp);
    setSolverResult(res);
  };

  const handleLoadSolverPreset = (preset: 'SEND_MORE' | 'THREE_ROWS' | 'CLEAR') => {
    if (preset === 'CLEAR') {
      setSolverTerms(Array(solverRowCount).fill(''));
      setSolverResultTerm('');
      setSolverResult(null);
      return;
    }

    if (preset === 'SEND_MORE') {
      setSolverRowCount(2);
      setSolverDigitCount(5);
      setSolverTerms([' SEND', ' MORE']);
      setSolverResultTerm('MONEY');
      setSolverOp('+');
    } else if (preset === 'THREE_ROWS') {
      setSolverRowCount(3);
      setSolverDigitCount(4);
      setSolverTerms([' ABC', ' DEF', ' GHI']);
      setSolverResultTerm('JKLM');
      setSolverOp('+');
    }

    setSolverResult(null);
  };

  // Helper to calculate responsive typography class based on max digit length
  const getMaxDigitLen = () => {
    if (!currentPuzzle) return 3;
    const allLengths = [...currentPuzzle.terms.map((t) => t.length), currentPuzzle.resultTerm.length];
    return Math.max(...allLengths);
  };

  const maxDigitLen = getMaxDigitLen();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fade-in space-y-8">
      {/* Top Header Navigation */}
      <div
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 border-b"
        style={{ borderColor: 'var(--glass-border)' }}
      >
        <button
          onClick={onBackToDashboard}
          className="fisma-btn-secondary px-4 py-3 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center sm:justify-start gap-2 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Kembali ke Dashboard</span>
        </button>

        {/* Tab Selector */}
        <div
          className="p-1 rounded-2xl border flex items-center justify-center gap-1 w-full sm:w-auto"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        >
          <button
            onClick={() => setActiveTab('game')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 min-h-[42px] rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'game' ? 'shadow-md' : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              background: activeTab === 'game' ? 'var(--button-primary-bg)' : 'transparent',
              color: activeTab === 'game' ? 'var(--button-primary-text)' : 'var(--text-primary)',
            }}
          >
            <Gamepad2 className="w-4 h-4 shrink-0" />
            <span>Game Cryptarithm</span>
          </button>

          <button
            onClick={() => setActiveTab('solver')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 min-h-[42px] rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'solver' ? 'shadow-md' : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              background: activeTab === 'solver' ? 'var(--button-primary-bg)' : 'transparent',
              color: activeTab === 'solver' ? 'var(--button-primary-text)' : 'var(--text-primary)',
            }}
          >
            <Cpu className="w-4 h-4 shrink-0" />
            <span>Bot Solver</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INTERACTIVE GAME CRYPTARITHM */}
      {/* ========================================================================= */}
      {activeTab === 'game' && (
        <div>
          {/* SUB-VIEW 1: SETUP SCREEN (PUZZLE BUILDER) */}
          {gameView === 'setup' && (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* High Score Banner */}
              <div
                className="fisma-card p-4 rounded-2xl border flex items-center justify-center gap-3 shadow-sm"
                style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'var(--badge-bg)', color: 'var(--primary-accent)' }}
                >
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold block" style={{ color: 'var(--text-muted)' }}>
                    Skor Tertinggi Lokal
                  </span>
                  <span className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
                    {highScore} Poin
                  </span>
                </div>
              </div>

              <PuzzleBuilder
                config={config}
                onChange={setConfig}
                onStartGame={handleStartGame}
              />
            </div>
          )}

          {/* SUB-VIEW 2: PLAY SCREEN */}
          {gameView === 'play' && currentPuzzle && (
            <div className="space-y-6">
              {/* HUD BAR */}
              <div
                className="fisma-card p-4 sm:p-5 rounded-2xl border flex flex-wrap items-center justify-between gap-4"
                style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}
              >
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4" style={{ color: 'var(--primary-accent)' }} />
                  <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Soal:</span>
                  <span className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>
                    {config.mode === 'fixed'
                      ? `${stats.currentQuestionIndex} / ${config.targetQuestions}`
                      : `#${stats.currentQuestionIndex}`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" style={{ color: 'var(--primary-accent)' }} />
                  <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Skor:</span>
                  <span className="text-lg font-black" style={{ color: 'var(--primary-accent)' }}>
                    {stats.score}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" style={{ color: 'var(--primary-accent)' }} />
                  <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Waktu:</span>
                  <span
                    className={`text-sm font-extrabold font-mono ${
                      timeLeft > 0 && timeLeft <= 10 ? 'text-red-400 animate-pulse' : ''
                    }`}
                    style={{ color: timeLeft === 0 ? 'var(--text-muted)' : 'var(--text-primary)' }}
                  >
                    {config.timerSec > 0 ? `${timeLeft}s` : '∞ Nonaktif'}
                  </span>
                </div>

                <button
                  onClick={() => setGameView('setup')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border hover:opacity-80 transition-opacity"
                  style={{
                    background: 'var(--badge-bg)',
                    borderColor: 'var(--card-border)',
                    color: 'var(--badge-text)',
                  }}
                >
                  Ubah Pengaturan
                </button>
              </div>

              {/* DYNAMIC PUZZLE BOARD & INPUTS */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Vertical Math Display (Dynamic for 2 to 5 rows & 2 to 8 digits) */}
                <div className="md:col-span-5 flex justify-center">
                  <div
                    className="fisma-card p-6 sm:p-8 rounded-3xl border w-full max-w-sm flex flex-col items-end shadow-2xl relative overflow-x-auto"
                    style={{
                      background: 'var(--card-bg)',
                      borderColor: 'var(--card-border)',
                      boxShadow: 'var(--shadow-lg)',
                    }}
                  >
                    <div
                      className="absolute -top-12 -left-12 w-32 h-32 rounded-full blur-2xl opacity-20"
                      style={{ background: 'var(--primary-accent)' }}
                    />

                    {/* Render N Operand Terms */}
                    {currentPuzzle.terms.map((term, idx) => {
                      const isLastOperand = idx === currentPuzzle.terms.length - 1;
                      const opSym = currentPuzzle.operation === '*' ? '×' : currentPuzzle.operation;

                      return (
                        <div
                          key={idx}
                          className={`font-mono font-black tracking-widest text-right flex items-center justify-end gap-3 mb-1 ${
                            maxDigitLen >= 6 ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
                          }`}
                        >
                          {isLastOperand && (
                            <span className="text-lg sm:text-xl font-black" style={{ color: 'var(--primary-accent)' }}>
                              {opSym}
                            </span>
                          )}
                          <span style={{ color: 'var(--text-primary)' }}>
                            {term.split('').map((char, cIdx) => {
                              const val = userInputs[char];
                              const isFilled = val !== undefined && val !== '';
                              return (
                                <span
                                  key={cIdx}
                                  className={isFilled ? 'text-amber-400 font-extrabold underline decoration-amber-400/50' : ''}
                                  style={{
                                    color: isFilled ? 'var(--primary-accent)' : 'var(--text-primary)',
                                  }}
                                >
                                  {isFilled ? val : char}
                                </span>
                              );
                            })}
                          </span>
                        </div>
                      );
                    })}

                    {/* Math Divider Line */}
                    <div className="w-full h-1 my-2 rounded-full" style={{ background: 'var(--primary-accent)' }} />

                    {/* Result Term */}
                    <div
                      className={`font-mono font-black tracking-widest text-right ${
                        maxDigitLen >= 6 ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'
                      }`}
                      style={{ color: 'var(--primary-accent)' }}
                    >
                      {currentPuzzle.resultTerm.split('').map((char, cIdx) => {
                        const val = userInputs[char];
                        const isFilled = val !== undefined && val !== '';
                        return (
                          <span
                            key={cIdx}
                            className={isFilled ? 'text-amber-400 font-extrabold underline decoration-amber-400/50' : ''}
                            style={{
                              color: isFilled ? 'var(--primary-accent)' : 'var(--text-primary)',
                            }}
                          >
                            {isFilled ? val : char}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Letter Inputs Section */}
                <div className="md:col-span-7 space-y-6">
                  <div
                    className="fisma-card p-6 rounded-3xl border space-y-4"
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                        Masukkan Digit Angka (0 - 9) untuk Setiap Huruf:
                      </h3>
                      <span className="text-xs font-mono font-extrabold" style={{ color: 'var(--primary-accent)' }}>
                        {Object.keys(currentPuzzle.solutionMap).length} Huruf
                      </span>
                    </div>

                    {/* Dynamically Rendered Letter Cards Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.keys(currentPuzzle.solutionMap)
                        .sort()
                        .map((letter) => (
                          <div
                            key={letter}
                            className="p-3 rounded-2xl border flex items-center justify-between gap-2"
                            style={{
                              background: 'var(--glass-bg)',
                              borderColor: 'var(--glass-border)',
                            }}
                          >
                            <label className="text-lg font-black font-mono" style={{ color: 'var(--primary-accent)' }}>
                              {letter} =
                            </label>
                            <input
                              ref={(el) => {
                                inputRefs.current[letter] = el;
                              }}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={userInputs[letter] || ''}
                              onChange={(e) => handleInputChange(letter, e.target.value)}
                              onFocus={(e) => e.target.select()}
                              className="w-12 h-12 rounded-xl text-center font-mono font-black text-xl border focus:outline-none transition-all"
                              style={{
                                background: 'var(--card-bg)',
                                borderColor: 'var(--card-border)',
                                color: 'var(--text-primary)',
                              }}
                            />
                          </div>
                        ))}
                    </div>

                    {/* Feedback Alert Box */}
                    {feedback.message && (
                      <div
                        className={`p-4 rounded-2xl border text-xs font-bold flex items-start gap-3 animate-fade-in ${
                          feedback.type === 'success'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : feedback.type === 'error'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {feedback.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                        {feedback.type === 'error' && <XCircle className="w-5 h-5 shrink-0" />}
                        {feedback.type === 'warning' && <AlertTriangle className="w-5 h-5 shrink-0" />}
                        <p className="leading-relaxed">{feedback.message}</p>
                      </div>
                    )}

                    {/* Gameplay Action Controls */}
                    <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <button
                        type="button"
                        onClick={handleCheckAnswer}
                        className="fisma-btn-primary py-3 px-3 min-h-[46px] rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                      >
                        <Check className="w-4 h-4 shrink-0" />
                        <span>Periksa</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleGiveHint}
                        disabled={stats.score < 50}
                        className={`fisma-btn-secondary py-3 px-3 min-h-[46px] rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                          stats.score < 50 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
                        }`}
                        title={stats.score < 50 ? 'Poin tidak cukup (butuh 50 poin)' : 'Minta Petunjuk (-50 Poin)'}
                      >
                        <Sparkles className="w-4 h-4 shrink-0" style={{ color: 'var(--primary-accent)' }} />
                        <span>Hint (-50)</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSkipQuestion}
                        className="fisma-btn-secondary py-3 px-3 min-h-[46px] rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        <SkipForward className="w-4 h-4 shrink-0" />
                        <span>Lewati</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setGameView('result')}
                        className="py-3 px-3 min-h-[46px] rounded-xl text-xs sm:text-sm font-bold border border-red-500/30 text-red-400 hover:bg-red-500/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <span>Selesai</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* SUB-VIEW 3: RESULT SUMMARY SCREEN */}
          {gameView === 'result' && (
            <div
              className="fisma-card rounded-3xl p-8 sm:p-12 border max-w-2xl mx-auto text-center space-y-8"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
            >
              <div>
                <div
                  className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl"
                  style={{ background: 'var(--button-primary-bg)', color: 'var(--button-primary-text)' }}
                >
                  <Trophy className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  Sesi Permainan Selesai!
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Ringkasan pencapaian ({config.rowCount} Baris, {config.digitCount} Digit).
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl border text-center" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
                  <span className="text-[10px] font-bold uppercase block mb-1" style={{ color: 'var(--text-muted)' }}>
                    Skor Akhir
                  </span>
                  <span className="text-2xl font-black" style={{ color: 'var(--primary-accent)' }}>
                    {stats.score}
                  </span>
                </div>

                <div className="p-4 rounded-2xl border text-center" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
                  <span className="text-[10px] font-bold uppercase block mb-1" style={{ color: 'var(--text-muted)' }}>
                    Akurasi
                  </span>
                  <span className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                    {stats.correctCount + stats.wrongCount > 0
                      ? `${Math.round((stats.correctCount / (stats.correctCount + stats.wrongCount)) * 100)}%`
                      : '0%'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl border text-center" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
                  <span className="text-[10px] font-bold uppercase block mb-1" style={{ color: 'var(--text-muted)' }}>
                    Soal Benar
                  </span>
                  <span className="text-2xl font-black text-emerald-400">{stats.correctCount}</span>
                </div>

                <div className="p-4 rounded-2xl border text-center" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
                  <span className="text-[10px] font-bold uppercase block mb-1" style={{ color: 'var(--text-muted)' }}>
                    Salah / Lewat
                  </span>
                  <span className="text-2xl font-black text-red-400">{stats.wrongCount}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleStartGame}
                  className="fisma-btn-primary px-8 py-4 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Main Lagi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGameView('setup')}
                  className="fisma-btn-secondary px-8 py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <Settings className="w-5 h-5" />
                  <span>Pengaturan</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BOT SOLVER CRYPTARITHM (DYNAMIC ROWS & DIGITS) */}
      {/* ========================================================================= */}
      {activeTab === 'solver' && (
        <div
          className="fisma-card rounded-3xl p-6 sm:p-10 border max-w-4xl mx-auto space-y-8"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'var(--button-primary-bg)', color: 'var(--button-primary-text)' }}
              >
                <Cpu className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Bot Solver Dynamic Cryptarithm
              </h2>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Mendukung konfigurasi dinamis N Baris Operan & N Digit secara otomatis.
            </p>
          </div>

          {/* Dynamic Row, Digit, and Operation Controls for Bot Solver */}
          <div
            className="p-4 rounded-2xl border space-y-4"
            style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}
          >
            <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
              Pengaturan Grid Matrix Pertanyaan Bot Solver:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              {/* 1. Baris Operan */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold block" style={{ color: 'var(--text-primary)' }}>
                  Baris Operan:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newCount = Math.max(2, solverRowCount - 1);
                      setSolverRowCount(newCount);
                      setSolverTerms((prev) => prev.slice(0, newCount));
                    }}
                    className="w-9 h-9 rounded-xl border font-bold flex items-center justify-center hover:scale-105 transition-all"
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text-primary)' }}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-extrabold px-2 font-mono flex-1 text-center" style={{ color: 'var(--primary-accent)' }}>
                    {solverRowCount} Baris
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const newCount = Math.min(5, solverRowCount + 1);
                      setSolverRowCount(newCount);
                      setSolverTerms((prev) => {
                        const updated = [...prev];
                        while (updated.length < newCount) updated.push('');
                        return updated;
                      });
                    }}
                    className="w-9 h-9 rounded-xl border font-bold flex items-center justify-center hover:scale-105 transition-all"
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text-primary)' }}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 2. Jumlah Digit */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold block" style={{ color: 'var(--text-primary)' }}>
                  Jumlah Kolom Digit:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSolverDigitCount((prev) => Math.max(2, prev - 1))}
                    className="w-9 h-9 rounded-xl border font-bold flex items-center justify-center hover:scale-105 transition-all"
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text-primary)' }}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-extrabold px-2 font-mono flex-1 text-center" style={{ color: 'var(--primary-accent)' }}>
                    {solverDigitCount} Digit
                  </span>
                  <button
                    type="button"
                    onClick={() => setSolverDigitCount((prev) => Math.min(8, prev + 1))}
                    className="w-9 h-9 rounded-xl border font-bold flex items-center justify-center hover:scale-105 transition-all"
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text-primary)' }}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 3. Operasi Matematika */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold block" style={{ color: 'var(--text-primary)' }}>
                  Operasi:
                </span>
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                  {[
                    { op: '+', label: '+' },
                    { op: '-', label: '-' },
                    { op: '*', label: '×' },
                  ].map((item) => (
                    <button
                      key={item.op}
                      type="button"
                      onClick={() => setSolverOp(item.op as MathOperation)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
                        solverOp === item.op ? 'shadow-md scale-105' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{
                        background: solverOp === item.op ? 'var(--button-primary-bg)' : 'transparent',
                        color: solverOp === item.op ? 'var(--button-primary-text)' : 'var(--text-primary)',
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Presets Row */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t flex-wrap" style={{ borderColor: 'var(--card-border)' }}>
              <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                Contoh Preset:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleLoadSolverPreset('SEND_MORE')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border hover:scale-105 transition-all"
                  style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text-primary)' }}
                >
                  SEND+MORE
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSolverPreset('THREE_ROWS')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border hover:scale-105 transition-all"
                  style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text-primary)' }}
                >
                  3 Baris (ABC+DEF)
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSolverPreset('CLEAR')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                >
                  Reset Kosong
                </button>
              </div>
            </div>
          </div>

          {/* VISUAL MATRIX LETTER BOXES CONTAINER (KOTAK KOSONG UNTUK ISIAN HURUF) */}
          <div
            className="relative w-full py-8 my-4 rounded-3xl border overflow-x-auto select-none transition-colors flex flex-col items-center justify-center min-h-[340px]"
            style={{
              background: 'var(--glass-bg)',
              borderColor: 'var(--glass-border)',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.04)',
            }}
          >
            {/* Dot Pattern Background */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle, var(--text-primary) 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            />

            {/* LETTER GRID MATRIX */}
            <div className="relative z-10 flex flex-col items-end justify-center gap-4 my-auto shrink-0 px-4">
              {/* OPERAND ROWS */}
              {Array.from({ length: solverRowCount }).map((_, rIdx) => {
                const termStr = solverTerms[rIdx] || '';
                const isLastOperand = rIdx === solverRowCount - 1;

                return (
                  <div key={rIdx} className="w-full flex items-center justify-end gap-3">
                    {/* Operator Sign on Last Operand */}
                    <div className="w-8 flex items-center justify-center">
                      {isLastOperand ? (
                        <span className="text-2xl font-black font-mono" style={{ color: 'var(--primary-accent)' }}>
                          {solverOp === '*' ? '×' : solverOp}
                        </span>
                      ) : null}
                    </div>

                    {/* Letter Input Boxes Row */}
                    <div className="flex items-center gap-2">
                      {Array.from({ length: solverDigitCount }).map((_, cIdx) => {
                        const char = termStr[cIdx] || '';
                        const inputKey = `op-${rIdx}-${cIdx}`;
                        const isFilled = char !== '' && char !== ' ';

                        return (
                          <input
                            key={cIdx}
                            ref={(el) => { solverInputRefs.current[inputKey] = el; }}
                            type="text"
                            maxLength={2}
                            value={char === ' ' ? '' : char}
                            onFocus={(e) => e.target.select()}
                            onClick={(e) => e.currentTarget.select()}
                            onChange={(e) => handleSolverCellLetterChange('operand', rIdx, cIdx, e.target.value)}
                            onKeyDown={(e) => handleSolverCellKeyDown('operand', rIdx, cIdx, e)}
                            placeholder="-"
                            className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl border text-center font-mono font-black text-xl sm:text-2xl uppercase transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 focus:scale-105"
                            style={{
                              background: isFilled ? 'var(--badge-bg)' : 'var(--card-bg)',
                              borderColor: isFilled ? 'var(--primary-accent)' : 'var(--card-border)',
                              color: isFilled ? 'var(--primary-accent)' : 'var(--text-primary)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* OPERATOR LINE DIVIDER */}
              <div className="w-full flex items-center justify-end gap-3 my-1">
                <div className="w-8" />
                <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--primary-accent)' }} />
              </div>

              {/* RESULT ROW */}
              <div className="w-full flex items-center justify-end gap-3">
                <div className="w-8 flex items-center justify-center">
                  <span className="text-xs font-bold uppercase font-mono" style={{ color: 'var(--text-muted)' }}>
                    =
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {Array.from({ length: solverDigitCount }).map((_, cIdx) => {
                        const char = solverResultTerm[cIdx] || '';
                        const inputKey = `res-${cIdx}`;
                        const isFilled = char !== '' && char !== ' ';

                        return (
                          <input
                            key={cIdx}
                            ref={(el) => { solverInputRefs.current[inputKey] = el; }}
                            type="text"
                            maxLength={2}
                            value={char === ' ' ? '' : char}
                            onFocus={(e) => e.target.select()}
                            onClick={(e) => e.currentTarget.select()}
                            onChange={(e) => handleSolverCellLetterChange('result', 0, cIdx, e.target.value)}
                            onKeyDown={(e) => handleSolverCellKeyDown('result', 0, cIdx, e)}
                            placeholder="-"
                            className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl border text-center font-mono font-black text-xl sm:text-2xl uppercase transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:scale-105"
                            style={{
                              background: isFilled ? 'rgba(16, 185, 129, 0.15)' : 'var(--card-bg)',
                              borderColor: isFilled ? '#10b981' : 'var(--card-border)',
                              color: isFilled ? '#10b981' : 'var(--text-primary)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
            </div>
          </div>

          {/* Action Button Generate */}
          <button
            type="button"
            onClick={handleRunSolver}
            className="fisma-btn-primary w-full py-3.5 sm:py-4 px-5 sm:px-6 rounded-xl sm:rounded-2xl text-sm sm:text-base font-extrabold flex items-center justify-center gap-2.5 sm:gap-3 shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all min-h-[48px]"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span>Generate Solusi Otomatis</span>
          </button>

          {/* Solver Result Section */}
          {solverResult && (
            <div
              className="p-6 rounded-2xl border space-y-6 animate-fade-in"
              style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}
            >
              {solverResult.error ? (
                <div className="p-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-3">
                  <XCircle className="w-5 h-5 shrink-0" />
                  <span>{solverResult.error}</span>
                </div>
              ) : solverResult.solutions.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                  <h3 className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>
                    Tidak Ada Solusi Ditemukan
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Persamaan{' '}
                    <strong>
                      {solverResult.terms.join(` ${solverResult.operation} `)} = {solverResult.resultTerm}
                    </strong>{' '}
                    tidak memiliki pemetaan angka unik (0-9) yang sah.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base font-black" style={{ color: 'var(--text-primary)' }}>
                      Ditemukan {solverResult.solutions.length} Solusi Valid!
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {solverResult.solutions.map((sol, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl border space-y-3"
                        style={{ background: 'var(--card-bg)', borderColor: 'var(--primary-accent)' }}
                      >
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase"
                          style={{ background: 'var(--badge-bg)', color: 'var(--primary-accent)' }}
                        >
                          Solusi #{idx + 1}
                        </span>

                        <div className="text-xs font-mono leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          <strong>Pemetaan: </strong>
                          {Object.entries(sol.assignment)
                            .map(([k, v]) => `${k}=${v}`)
                            .join(', ')}
                        </div>

                        {/* Equation Vertical Visualizer */}
                        <div
                          className="p-4 rounded-xl border font-mono font-bold text-right flex flex-col items-end"
                          style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}
                        >
                          {sol.termNumbers.map((num, nIdx) => (
                            <div key={nIdx} className="text-sm" style={{ color: 'var(--text-primary)' }}>
                              {nIdx === sol.termNumbers.length - 1 && (
                                <span className="mr-2" style={{ color: 'var(--primary-accent)' }}>
                                  {solverResult.operation === '*' ? '×' : solverResult.operation}
                                </span>
                              )}
                              <span>{num}</span>
                            </div>
                          ))}
                          <div className="w-full h-0.5 my-1" style={{ background: 'var(--primary-accent)' }} />
                          <div className="text-base font-extrabold text-emerald-400">{sol.resultNumber}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
