import React, { useState, useEffect, useRef } from 'react';
import { QuadraticEquation, generateQuestion } from '../QuestionGenerator';
import { formatEquation } from '../../solver/SolverEngine';
import { Timer, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  onFinishTimeAttack: (score: number, correct: number, wrong: number) => void;
}

export const TantanganWaktuMode: React.FC<Props> = ({ onFinishTimeAttack }) => {
  const [timeLeft, setTimeLeft] = useState<number>(60); // 1 minute
  const [isActive, setIsActive] = useState<boolean>(false);
  
  const [question, setQuestion] = useState<QuadraticEquation>(generateQuestion('mudah'));
  const [ans1, setAns1] = useState<string>('');
  const [ans2, setAns2] = useState<string>('');
  
  const [score, setScore] = useState<number>(0);
  const [correct, setCorrect] = useState<number>(0);
  const [wrong, setWrong] = useState<number>(0);
  const [feedback, setFeedback] = useState<'benar' | 'salah' | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isActive) {
      inputRef.current?.focus();
    }
  }, [question, isActive]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } 
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (isActive && timeLeft === 0) {
      setIsActive(false);
      onFinishTimeAttack(score, correct, wrong);
    }
  }, [timeLeft, isActive, score, correct, wrong, onFinishTimeAttack]);

  const startChallenge = () => {
    setIsActive(true);
    setScore(0);
    setCorrect(0);
    setWrong(0);
    setTimeLeft(60);
    setQuestion(generateQuestion('mudah')); // Start easy
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isActive) return;

    let isMatch = false;
    
    if (!question.isReal) {
      if (ans1.toLowerCase() === 'imajiner' || ans2.toLowerCase() === 'imajiner') {
        isMatch = true;
      }
    } else {
      const val1 = parseFloat(ans1);
      const val2 = parseFloat(ans2);
      isMatch = (Math.abs(val1 - question.x1) < 0.01 && Math.abs(val2 - question.x2) < 0.01) ||
                (Math.abs(val1 - question.x2) < 0.01 && Math.abs(val2 - question.x1) < 0.01);
    }

    if (isMatch) {
      setScore(s => s + 50);
      setCorrect(c => c + 1);
      setFeedback('benar');
      // Naikkan tingkat kesulitan sedikit-sedikit
      setQuestion(generateQuestion(correct > 5 ? 'sedang' : 'mudah'));
    } else {
      setScore(s => Math.max(0, s - 10));
      setWrong(w => w + 1);
      setFeedback('salah');
      setQuestion(generateQuestion('mudah'));
    }
    
    setAns1('');
    setAns2('');
    setTimeout(() => setFeedback(null), 500);
  };

  if (!isActive && timeLeft === 60) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl max-w-xl mx-auto mt-8">
        <Timer className="w-16 h-16 text-[var(--primary-accent)] mb-4" />
        <h2 className="text-3xl font-black text-[var(--text-primary)] mb-2">Tantangan Waktu 1 Menit</h2>
        <p className="text-[var(--text-secondary)] mb-8">Jawab sebanyak mungkin soal dengan cepat. Jika imajiner, ketik "imajiner".</p>
        <button onClick={startChallenge} className="fisma-btn-primary px-8 py-4 rounded-xl text-lg w-full">Mulai Sekarang</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-xl flex items-center justify-between mb-6 px-4">
        <div className="flex items-center gap-2">
          <Timer className={`w-6 h-6 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-[var(--primary-accent)]'}`} />
          <span className={`text-2xl font-black ${timeLeft <= 10 ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>
            00:{timeLeft.toString().padStart(2, '0')}
          </span>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-[var(--text-secondary)] block">Skor: {score}</span>
          <span className="text-xs text-emerald-500">{correct} Benar</span>
          <span className="text-xs text-red-500 ml-2">{wrong} Salah</span>
        </div>
      </div>

      <div className={`bg-[var(--card-bg)] border-2 ${feedback === 'benar' ? 'border-emerald-500 bg-emerald-500/10' : feedback === 'salah' ? 'border-red-500 bg-red-500/10' : 'border-[var(--card-border)]'} rounded-3xl p-8 w-full max-w-xl text-center mb-8 shadow-sm transition-colors duration-200`}>
        <p className="text-4xl font-black text-[var(--text-primary)] font-mono py-4">
          {formatEquation(question.a, question.b, question.c)}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xl">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <input 
            ref={inputRef}
            type="text" 
            value={ans1} 
            onChange={(e) => setAns1(e.target.value)}
            placeholder="Akar 1"
            className="w-full text-center text-2xl font-black bg-[var(--bg-secondary)] border-2 border-[var(--card-border)] rounded-2xl p-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-accent)]"
            autoFocus
          />
          <input 
            type="text" 
            value={ans2} 
            onChange={(e) => setAns2(e.target.value)}
            placeholder="Akar 2"
            className="w-full text-center text-2xl font-black bg-[var(--bg-secondary)] border-2 border-[var(--card-border)] rounded-2xl p-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-accent)]"
          />
        </div>
        <button type="submit" className="fisma-btn-primary w-full py-4 rounded-xl text-lg">Jawab</button>
      </form>
    </div>
  );
};
