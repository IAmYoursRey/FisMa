import React, { useState, useEffect } from 'react';
import { QuadraticEquation } from '../QuestionGenerator';
import { formatEquation } from '../../solver/SolverEngine';
import { CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  question: QuadraticEquation;
  onCorrect: () => void;
  onWrong: () => void;
}

export const LengkapiLangkahMode: React.FC<Props> = ({ question, onCorrect, onWrong }) => {
  const [ansA, setAnsA] = useState<string>('');
  const [ansB, setAnsB] = useState<string>('');
  const [ansC, setAnsC] = useState<string>('');
  const [ansD, setAnsD] = useState<string>('');
  const [ansX1, setAnsX1] = useState<string>('');
  const [ansX2, setAnsX2] = useState<string>('');
  const [step, setStep] = useState<number>(0); // 0: identifikasi abc, 1: hitung D, 2: hitung x
  const [feedback, setFeedback] = useState<{isCorrect: boolean; msg: string} | null>(null);

  useEffect(() => {
    setAnsA(''); setAnsB(''); setAnsC('');
    setAnsD('');
    setAnsX1(''); setAnsX2('');
    setStep(0);
    setFeedback(null);
  }, [question]);

  const handleSubmit = () => {
    if (step === 0) {
      const valA = parseFloat(ansA);
      const valB = parseFloat(ansB);
      const valC = parseFloat(ansC);

      if (isNaN(valA) || isNaN(valB) || isNaN(valC)) {
        setFeedback({ isCorrect: false, msg: "Lengkapi semua nilai a, b, dan c terlebih dahulu." });
        return;
      }

      if (valA === question.a && valB === question.b && valC === question.c) {
        setFeedback({ isCorrect: true, msg: "Tepat sekali! Kamu sudah mengenali nilai a, b, dan c. Sekarang lanjutkan ke langkah Diskriminan." });
        setStep(1);
      } else {
        setFeedback({ isCorrect: false, msg: "Ada nilai yang masih keliru. Ingat bentuk umum persamaan kuadrat adalah ax² + bx + c = 0." });
        onWrong();
      }
      return;
    }

    if (step === 1) {
      const valD = parseFloat(ansD);

      if (isNaN(valD)) {
        setFeedback({ isCorrect: false, msg: "Masukkan nilai Diskriminan." });
        return;
      }

      if (valD === question.D) {
        if (question.D < 0) {
          setFeedback({ isCorrect: true, msg: "Luar biasa! Karena D < 0, persamaan ini tidak memiliki akar real (imajiner). Kamu telah menyelesaikan soal ini!" });
          onCorrect();
        } else {
          setFeedback({ isCorrect: true, msg: "Diskriminan benar! Sekarang gunakan Rumus ABC untuk mencari nilai x₁ dan x₂." });
          setStep(2);
        }
      } else {
        setFeedback({ isCorrect: false, msg: `Nilai Diskriminan salah. Coba hitung lagi: D = (${question.b})² - 4(${question.a})(${question.c}).` });
        onWrong();
      }
      return;
    }

    if (step === 2) {
      const valX1 = parseFloat(ansX1);
      const valX2 = parseFloat(ansX2);

      if (isNaN(valX1) || isNaN(valX2)) {
        setFeedback({ isCorrect: false, msg: "Lengkapi nilai x₁ dan x₂." });
        return;
      }

      const isMatch = (Math.abs(valX1 - question.x1) < 0.01 && Math.abs(valX2 - question.x2) < 0.01) ||
                      (Math.abs(valX1 - question.x2) < 0.01 && Math.abs(valX2 - question.x1) < 0.01);
                      
      if (isMatch) {
        setFeedback({ isCorrect: true, msg: "Luar biasa! Kamu berhasil melengkapi seluruh langkah perhitungan dan menemukan akarnya." });
        onCorrect();
      } else {
        setFeedback({ isCorrect: false, msg: "Nilai x masih keliru. Periksa kembali hitunganmu: x = (-b ± √D) / 2a." });
        onWrong();
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-8 w-full max-w-xl text-center mb-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--primary-accent)]"></div>
        <h3 className="text-[var(--text-secondary)] text-sm font-bold uppercase tracking-wider mb-2">Lengkapi Langkah Penyelesaian</h3>
        <p className="text-3xl font-black text-[var(--text-primary)] font-mono py-4">
          {formatEquation(question.a, question.b, question.c)}
        </p>
      </div>

      <div className="w-full max-w-xl space-y-6 mb-8">
        
        {/* Tahap 1: Identifikasi a, b, c */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-2xl p-6">
          <h4 className="font-bold text-[var(--text-primary)] mb-4">Langkah 1: Identifikasi Koefisien</h4>
          <p className="text-sm text-[var(--text-secondary)] text-center mb-4">Tentukan nilai a, b, dan c dari persamaan di atas.</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl text-[var(--text-primary)]">a = </span>
              <input 
                type="text" 
                value={ansA} 
                onChange={(e) => setAnsA(e.target.value)}
                disabled={step > 0}
                placeholder="0"
                className="w-16 text-center text-xl font-black bg-[var(--card-bg)] border-2 border-[var(--card-border)] rounded-xl p-2 text-[var(--primary-accent)] focus:outline-none focus:border-[var(--primary-accent)] disabled:opacity-50"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl text-[var(--text-primary)]">b = </span>
              <input 
                type="text" 
                value={ansB} 
                onChange={(e) => setAnsB(e.target.value)}
                disabled={step > 0}
                placeholder="0"
                className="w-16 text-center text-xl font-black bg-[var(--card-bg)] border-2 border-[var(--card-border)] rounded-xl p-2 text-[var(--primary-accent)] focus:outline-none focus:border-[var(--primary-accent)] disabled:opacity-50"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl text-[var(--text-primary)]">c = </span>
              <input 
                type="text" 
                value={ansC} 
                onChange={(e) => setAnsC(e.target.value)}
                disabled={step > 0}
                placeholder="0"
                className="w-16 text-center text-xl font-black bg-[var(--card-bg)] border-2 border-[var(--card-border)] rounded-xl p-2 text-[var(--primary-accent)] focus:outline-none focus:border-[var(--primary-accent)] disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Tahap 2: Diskriminan */}
        {step >= 1 && (
          <div className="bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-2xl p-6 animate-fade-in">
            <h4 className="font-bold text-[var(--text-primary)] mb-4">Langkah 2: Hitung Diskriminan</h4>
            <div className="font-mono text-[var(--text-secondary)] space-y-2 mb-4 text-center text-sm sm:text-base">
              <p>D = b² - 4ac</p>
              <p>D = ({question.b})² - 4({question.a})({question.c})</p>
            </div>
            <div className="flex items-center justify-center gap-4">
              <span className="font-bold text-xl text-[var(--text-primary)]">D = </span>
              <input 
                type="text" 
                value={ansD} 
                onChange={(e) => setAnsD(e.target.value)}
                disabled={step > 1}
                placeholder="..."
                className="w-24 text-center text-xl font-black bg-[var(--card-bg)] border-2 border-[var(--card-border)] rounded-xl p-2 text-[var(--primary-accent)] focus:outline-none focus:border-[var(--primary-accent)] disabled:opacity-50"
              />
            </div>
          </div>
        )}

        {/* Tahap 3: Akar */}
        {step >= 2 && question.D >= 0 && (
          <div className="bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-2xl p-6 animate-fade-in">
            <h4 className="font-bold text-[var(--text-primary)] mb-4">Langkah 3: Hitung Akar</h4>
            <div className="font-mono text-[var(--text-secondary)] space-y-2 mb-4 text-center text-sm sm:text-base">
              <p>x = (-b ± √D) / 2a</p>
              <p>x = ({-question.b} ± √{question.D}) / {2 * question.a}</p>
            </div>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl text-[var(--text-primary)]">x₁ = </span>
                <input 
                  type="text" 
                  value={ansX1} 
                  onChange={(e) => setAnsX1(e.target.value)}
                  placeholder="..."
                  className="w-24 text-center text-xl font-black bg-[var(--card-bg)] border-2 border-[var(--card-border)] rounded-xl p-2 text-[var(--primary-accent)] focus:outline-none focus:border-[var(--primary-accent)]"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl text-[var(--text-primary)]">x₂ = </span>
                <input 
                  type="text" 
                  value={ansX2} 
                  onChange={(e) => setAnsX2(e.target.value)}
                  placeholder="..."
                  className="w-24 text-center text-xl font-black bg-[var(--card-bg)] border-2 border-[var(--card-border)] rounded-xl p-2 text-[var(--primary-accent)] focus:outline-none focus:border-[var(--primary-accent)]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {step <= 2 && !(step === 2 && feedback?.isCorrect) && (
        <button onClick={handleSubmit} className="fisma-btn-primary w-full max-w-xl py-4 rounded-xl text-lg mb-6 shadow-sm">
          Periksa Langkah {step + 1}
        </button>
      )}

      {feedback && (
        <div className={`w-full max-w-xl p-6 rounded-2xl border flex items-start gap-4 shadow-sm ${feedback.isCorrect ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'}`}>
          {feedback.isCorrect ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <XCircle className="w-6 h-6 shrink-0" />}
          <div>
            <h4 className="font-bold text-lg mb-1">{feedback.isCorrect ? 'Kerja Bagus!' : 'Belum Tepat'}</h4>
            <p className="font-medium text-sm leading-relaxed">{feedback.msg}</p>
          </div>
        </div>
      )}
    </div>
  );
};
