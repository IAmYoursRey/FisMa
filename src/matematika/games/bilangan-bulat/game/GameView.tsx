import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Timer,
  Trophy,
  Zap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Play,
  Award,
  Sparkles,
  ChevronRight,
  BarChart2,
} from 'lucide-react';
import {
  GameConfig,
  QuestionItem,
  GameStats,
  generateQuestion,
  loadSavedStats,
  saveStats,
} from './GameManager';
import { VirtualKeypad } from './VirtualKeypad';

interface GameViewProps {
  config: GameConfig;
  onBackToDashboard: () => void;
  onOpenSolverWithQuestion?: (numbers: number[], ops: OperationType[]) => void;
}

export const GameView: React.FC<GameViewProps> = ({
  config,
  onBackToDashboard,
  onOpenSolverWithQuestion,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<QuestionItem>(() =>
    generateQuestion(config)
  );
  const [userInput, setUserInput] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(config.timeLimitSec);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    type: 'correct' | 'wrong' | 'timeout' | null;
    message: string;
  }>({ type: null, message: '' });

  const [stats, setStats] = useState<GameStats>({
    score: 0,
    correctCount: 0,
    wrongCount: 0,
    totalPlayed: 0,
    currentStreak: 0,
    maxStreak: 0,
    history: [],
  });

  const [savedData, setSavedData] = useState(() => loadSavedStats());
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on initial mount & question change
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentQuestion]);

  // Countdown timer logic
  useEffect(() => {
    if (isGameOver || !config.useTimeLimit || config.timeLimitSec <= 0 || feedback.type !== null) return;

    setTimeLeft(config.timeLimitSec);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestion, feedback.type, isGameOver, config.timeLimitSec, config.useTimeLimit]);

  // Handle timeout when time runs out
  const handleTimeout = () => {
    const isEnd =
      config.questionCountMode === 'fixed' &&
      stats.totalPlayed + 1 >= config.targetQuestions;

    setFeedback({
      type: 'timeout',
      message: `Waktu Habis! Jawaban yang benar adalah ${currentQuestion.correctAnswer}`,
    });

    setStats((prev) => {
      const newWrong = prev.wrongCount + 1;
      const newTotal = prev.totalPlayed + 1;
      const updatedStats = {
        ...prev,
        wrongCount: newWrong,
        totalPlayed: newTotal,
        currentStreak: 0,
        history: [
          ...prev.history,
          {
            question: currentQuestion.questionText,
            userAnswer: 'Waktu Habis',
            correctAnswer: currentQuestion.correctAnswer,
            isCorrect: false,
          },
        ],
      };
      return updatedStats;
    });

    setTimeout(() => {
      if (isEnd) {
        finishGame();
      } else {
        nextQuestion();
      }
    }, 1500);
  };

  const nextQuestion = () => {
    setUserInput('');
    setFeedback({ type: null, message: '' });
    setCurrentQuestion(generateQuestion(config));
  };

  const handleSubmitAnswer = () => {
    if (feedback.type !== null || isGameOver) return;
    if (userInput.trim() === '' || userInput === '-') return;

    const val = parseInt(userInput, 10);
    const isCorrect = val === currentQuestion.correctAnswer;

    const isEnd =
      config.questionCountMode === 'fixed' &&
      stats.totalPlayed + 1 >= config.targetQuestions;

    if (isCorrect) {
      const addedPoints = 10 + stats.currentStreak * 2;
      setFeedback({
        type: 'correct',
        message: `Benar! (+${addedPoints} Poin)`,
      });

      setStats((prev) => {
        const newScore = prev.score + addedPoints;
        const newCorrect = prev.correctCount + 1;
        const newTotal = prev.totalPlayed + 1;
        const newStreak = prev.currentStreak + 1;
        const newMaxStreak = Math.max(prev.maxStreak, newStreak);

        return {
          ...prev,
          score: newScore,
          correctCount: newCorrect,
          totalPlayed: newTotal,
          currentStreak: newStreak,
          maxStreak: newMaxStreak,
          history: [
            ...prev.history,
            {
              question: currentQuestion.questionText,
              userAnswer: val,
              correctAnswer: currentQuestion.correctAnswer,
              isCorrect: true,
            },
          ],
        };
      });
    } else {
      setFeedback({
        type: 'wrong',
        message: `Salah! Jawaban yang benar adalah ${currentQuestion.correctAnswer}`,
      });

      setStats((prev) => {
        const newWrong = prev.wrongCount + 1;
        const newTotal = prev.totalPlayed + 1;

        return {
          ...prev,
          wrongCount: newWrong,
          totalPlayed: newTotal,
          currentStreak: 0,
          history: [
            ...prev.history,
            {
              question: currentQuestion.questionText,
              userAnswer: val,
              correctAnswer: currentQuestion.correctAnswer,
              isCorrect: false,
            },
          ],
        };
      });
    }

    setTimeout(() => {
      if (isEnd) {
        finishGame();
      } else {
        nextQuestion();
      }
    }, 1200);
  };

  const finishGame = () => {
    setIsGameOver(true);
    setStats((prev) => {
      const finalHighScore = Math.max(savedData.highScore, prev.score);
      const finalTotalGames = savedData.totalGames + 1;
      saveStats(finalHighScore, finalTotalGames);
      setSavedData({ highScore: finalHighScore, totalGames: finalTotalGames });
      return prev;
    });
  };

  const handleKeypadAppend = (char: string) => {
    if (feedback.type !== null || isGameOver) return;
    if (char === '-') {
      if (userInput === '') {
        setUserInput('-');
      } else if (userInput === '-') {
        setUserInput('');
      }
      return;
    }
    setUserInput((prev) => prev + char);
  };

  const handleKeypadDelete = () => {
    if (feedback.type !== null || isGameOver) return;
    setUserInput((prev) => prev.slice(0, -1));
  };

  const handleKeypadClear = () => {
    if (feedback.type !== null || isGameOver) return;
    setUserInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmitAnswer();
    }
  };

  const restartGame = () => {
    setIsGameOver(false);
    setUserInput('');
    setFeedback({ type: null, message: '' });
    setStats({
      score: 0,
      correctCount: 0,
      wrongCount: 0,
      totalPlayed: 0,
      currentStreak: 0,
      maxStreak: 0,
      history: [],
    });
    setCurrentQuestion(generateQuestion(config));
  };

  // GAMEOVER / RESULT VIEW
  if (isGameOver) {
    const accuracy =
      stats.totalPlayed > 0
        ? Math.round((stats.correctCount / stats.totalPlayed) * 100)
        : 0;

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
        <div
          className="fisma-card p-6 sm:p-8 rounded-3xl border space-y-6 text-center relative overflow-hidden"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        >
          {/* Trophy Icon */}
          <div
            className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-2xl animate-bounce"
            style={{
              background: 'var(--button-primary-bg)',
              boxShadow: 'var(--accent-glow)',
            }}
          >
            <Trophy className="w-10 h-10 text-[var(--button-primary-text)]" />
          </div>

          <div>
            <span
              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{ background: 'var(--badge-bg)', color: 'var(--badge-text)' }}
            >
              Sesi Permainan Selesai
            </span>
            <h2 className="text-3xl font-black mt-2" style={{ color: 'var(--text-primary)' }}>
              Hasil Akhir Kamu
            </h2>
          </div>

          {/* Stat Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              className="p-3.5 rounded-2xl border text-center"
              style={{ background: 'var(--glass-bg)', borderColor: 'var(--card-border)' }}
            >
              <span className="text-xs font-semibold block" style={{ color: 'var(--text-muted)' }}>
                Total Skor
              </span>
              <span className="text-2xl font-black" style={{ color: 'var(--primary-accent)' }}>
                {stats.score}
              </span>
            </div>

            <div
              className="p-3.5 rounded-2xl border text-center"
              style={{ background: 'var(--glass-bg)', borderColor: 'var(--card-border)' }}
            >
              <span className="text-xs font-semibold block" style={{ color: 'var(--text-muted)' }}>
                Akurasi
              </span>
              <span className="text-2xl font-black text-emerald-400">
                {accuracy}%
              </span>
            </div>

            <div
              className="p-3.5 rounded-2xl border text-center"
              style={{ background: 'var(--glass-bg)', borderColor: 'var(--card-border)' }}
            >
              <span className="text-xs font-semibold block" style={{ color: 'var(--text-muted)' }}>
                Benar / Salah
              </span>
              <span className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                {stats.correctCount} / {stats.wrongCount}
              </span>
            </div>

            <div
              className="p-3.5 rounded-2xl border text-center"
              style={{ background: 'var(--glass-bg)', borderColor: 'var(--card-border)' }}
            >
              <span className="text-xs font-semibold block" style={{ color: 'var(--text-muted)' }}>
                Streak Maks
              </span>
              <span className="text-2xl font-black text-amber-400">
                🔥 {stats.maxStreak}
              </span>
            </div>
          </div>

          {/* Question History */}
          <div className="text-left space-y-2 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Riwayat Soal:
            </h3>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {stats.history.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl border flex items-center justify-between text-xs sm:text-sm"
                  style={{
                    background: item.isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    borderColor: item.isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                    {idx + 1}. {item.question} = <span className="underline">{item.correctAnswer}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">
                      Jawab: {item.userAnswer}
                    </span>
                    {item.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={restartGame}
              className="fisma-btn-primary flex-1 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Main Lagi
            </button>
            <button
              onClick={onBackToDashboard}
              className="fisma-btn-secondary flex-1 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE GAMEPLAY VIEW
  const timerPercentage =
    config.timeLimitSec > 0 ? (timeLeft / config.timeLimitSec) * 100 : 100;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-6 animate-fade-in">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBackToDashboard}
          className="fisma-btn-secondary px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow-sm min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Streak indicator */}
          {stats.currentStreak > 1 && (
            <div
              className="px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1 animate-pulse"
              style={{
                background: 'rgba(245, 158, 11, 0.15)',
                borderColor: '#f59e0b',
                color: '#f59e0b',
              }}
            >
              <span>🔥 {stats.currentStreak}x Streak</span>
            </div>
          )}

          <div
            className="px-4 py-2 rounded-xl border text-xs font-extrabold flex items-center gap-2 min-h-[44px]"
            style={{
              background: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
              color: 'var(--primary-accent)',
            }}
          >
            <Trophy className="w-4 h-4 shrink-0" />
            <span>Skor: {stats.score}</span>
          </div>
        </div>
      </div>

      {/* Main Gameplay Board Card */}
      <div
        className="fisma-card p-6 sm:p-8 rounded-3xl border space-y-6 relative overflow-hidden shadow-xl"
        style={{
          background: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
        }}
      >
        {/* Progress bar / Timer bar */}
        {config.timeLimitSec > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <Timer className="w-3.5 h-3.5" />
                Waktu Sisa:
              </span>
              <span
                className={`font-mono text-sm font-black ${
                  timeLeft <= 3 ? 'text-red-400 animate-ping' : ''
                }`}
                style={{ color: timeLeft <= 3 ? '#ef4444' : 'var(--text-primary)' }}
              >
                {timeLeft}s
              </span>
            </div>
            <div
              className="w-full h-2 rounded-full overflow-hidden"
              style={{ background: 'var(--glass-bg)' }}
            >
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${timerPercentage}%`,
                  background:
                    timeLeft <= 3
                      ? '#ef4444'
                      : 'var(--button-primary-bg)',
                }}
              />
            </div>
          </div>
        )}

        {/* Question Counter */}
        <div className="flex items-center justify-between text-xs font-bold">
          <span
            className="px-3 py-1 rounded-full uppercase tracking-wider"
            style={{ background: 'var(--badge-bg)', color: 'var(--badge-text)' }}
          >
            {config.questionCountMode === 'fixed'
              ? `Soal ${stats.totalPlayed + 1} dari ${config.targetQuestions}`
              : `Soal #${stats.totalPlayed + 1} (Endless)`}
          </span>

          <span className="text-xs font-mono font-semibold" style={{ color: 'var(--text-muted)' }}>
            {(config.boxes || []).filter((b) => b.enabled).length > 0
              ? `${(config.boxes || []).filter((b) => b.enabled).length} Term`
              : `Rentang: [${config.useMinRange ? config.minRange : 0} s/d ${config.useMaxRange ? config.maxRange : 0}]`}
          </span>
        </div>

        {/* Big Math Question Display (Strictly Horizontal / Kanan-Kiri with Scroll & Scaled Bounds) */}
        {(() => {
          const textLength = currentQuestion.questionText ? currentQuestion.questionText.length : 10;
          let fontSizeClass = 'text-3xl sm:text-4xl lg:text-5xl';
          if (textLength > 28) {
            fontSizeClass = 'text-lg sm:text-xl'; // Minimum readable font size limit
          } else if (textLength > 16) {
            fontSizeClass = 'text-xl sm:text-2xl lg:text-3xl';
          }

          const opSymbolMap: Record<string, string> = {
            '+': '+',
            '-': '−',
            '*': '×',
            '/': '÷',
          };

          return (
            <div className="py-5 px-3 sm:px-4 text-center bg-black/10 dark:bg-black/20 rounded-2xl border border-white/5 space-y-2 relative overflow-hidden">
              <span className="text-[11px] font-bold uppercase tracking-widest block" style={{ color: 'var(--text-muted)' }}>
                Hitung Nilai Operasi:
              </span>

              {/* Scrollable Horizontal Container */}
              <div className="w-full overflow-x-auto custom-scrollbar py-2 px-1 text-center">
                <div
                  className={`mx-auto font-black font-mono tracking-wide whitespace-nowrap inline-flex items-center justify-center gap-2 sm:gap-3 shrink-0 ${fontSizeClass}`}
                  style={{ color: 'var(--text-primary)', width: 'max-content' }}
                >
                  {currentQuestion.numbers && currentQuestion.numbers.length > 0 ? (
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      {currentQuestion.numbers.map((num, idx) => {
                        const strNum = num < 0 ? `(${num})` : `${num}`;
                        const rawOp = currentQuestion.ops && idx < currentQuestion.ops.length ? currentQuestion.ops[idx] : null;
                        const opSymbol = rawOp ? opSymbolMap[rawOp] || rawOp : null;

                        return (
                          <React.Fragment key={idx}>
                            <span
                              className="px-2.5 py-1 sm:px-3 sm:py-1 rounded-xl border font-extrabold shadow-sm transition-all"
                              style={{
                                background: 'var(--card-bg)',
                                borderColor: 'var(--primary-accent)',
                                color: 'var(--text-primary)',
                              }}
                            >
                              {strNum}
                            </span>
                            {opSymbol && (
                              <span
                                className="font-black px-0.5 sm:px-1"
                                style={{ color: 'var(--primary-accent)' }}
                              >
                                {opSymbol}
                              </span>
                            )}
                          </React.Fragment>
                        );
                      })}
                      <span className="font-black text-amber-400 font-sans ml-1">= ?</span>
                    </div>
                  ) : (
                    <span>{currentQuestion.questionText} = ?</span>
                  )}
                </div>
              </div>

              {textLength > 20 && (
                <div className="text-[10px] font-semibold italic text-right pr-2" style={{ color: 'var(--text-muted)' }}>
                  ↔ Geser ke samping jika soal panjang
                </div>
              )}
            </div>
          );
        })()}

        {/* Interactive Answer Field */}
        <div className="space-y-3">
          <div className="relative max-w-sm mx-auto">
            <input
              ref={inputRef}
              type="text"
              inputMode="none" // Controlled via virtual keypad & physical keyboard
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik / Tekan Angka..."
              disabled={feedback.type !== null}
              className="w-full py-3.5 px-4 rounded-2xl border text-center font-mono font-black text-2xl sm:text-3xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all shadow-inner"
              style={{
                background:
                  feedback.type === 'correct'
                    ? 'rgba(16, 185, 129, 0.15)'
                    : feedback.type === 'wrong' || feedback.type === 'timeout'
                    ? 'rgba(239, 68, 68, 0.15)'
                    : 'var(--glass-bg)',
                borderColor:
                  feedback.type === 'correct'
                    ? '#10b981'
                    : feedback.type === 'wrong' || feedback.type === 'timeout'
                    ? '#ef4444'
                    : 'var(--card-border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Feedback Overlay Message */}
          {feedback.type !== null && (
            <div
              className={`p-3 rounded-xl text-center text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 animate-bounce ${
                feedback.type === 'correct'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {feedback.type === 'correct' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}
        </div>

        {/* Virtual Keypad */}
        <VirtualKeypad
          onAppend={handleKeypadAppend}
          onDelete={handleKeypadDelete}
          onClear={handleKeypadClear}
          onSubmit={handleSubmitAnswer}
          disabled={feedback.type !== null}
        />

        {/* Open Solver Quick Link */}
        {onOpenSolverWithQuestion && (
          <div className="pt-2 text-center border-t" style={{ borderColor: 'var(--glass-border)' }}>
            <button
              type="button"
              onClick={() =>
                onOpenSolverWithQuestion(
                  currentQuestion.numbers,
                  currentQuestion.ops
                )
              }
              className="text-xs font-bold hover:underline inline-flex items-center gap-1.5"
              style={{ color: 'var(--primary-accent)' }}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Bingung? Buka Bot Solver untuk Soal Ini</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
