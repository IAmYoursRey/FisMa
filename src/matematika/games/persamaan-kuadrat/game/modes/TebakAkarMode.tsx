import React, { useState, useEffect, useRef } from 'react';
import { QuadraticEquation } from '../QuestionGenerator';
import { formatEquation, solveQuadratic } from '../../solver/SolverEngine';
import { CheckCircle2, XCircle, Lightbulb } from 'lucide-react';

interface Props {
  question: QuadraticEquation;
  onCorrect: () => void;
  onWrong: () => void;
  hintLevel: number;
  onUseHint: () => void;
}

export const TebakAkarMode: React.FC<Props> = ({ question, onCorrect, onWrong, hintLevel, onUseHint }) => {
  const [ans1, setAns1] = useState<string>('');
  const [ans2, setAns2] = useState<string>('');
  const [feedback, setFeedback] = useState<{isCorrect: boolean; msg: string} | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAns1('');
    setAns2('');
    setFeedback(null);
    inputRef.current?.focus();
  }, [question]);

  const handleSubmit = () => {
    // Validasi Imajiner
    if (!question.isReal) {
      if (ans1.toLowerCase() === 'imajiner' || ans2.toLowerCase() === 'imajiner') {
        setFeedback({ isCorrect: true, msg: "Tepat sekali! Persamaan ini memiliki diskriminan negatif sehingga akarnya imajiner." });
        onCorrect();
        return;
      } else {
        setFeedback({ isCorrect: false, msg: "Coba cek nilai diskriminan (b² - 4ac). Jika negatif, akarnya bersifat imajiner." });
        onWrong();
        return;
      }
    }

    const val1 = parseFloat(ans1);
    const val2 = parseFloat(ans2);
    
    if (isNaN(val1) || isNaN(val2)) {
      setFeedback({ isCorrect: false, msg: "Harap masukkan angka yang valid." });
      return;
    }

    // Karena x1 dan x2 bisa terbalik urutannya
    const isMatch = (Math.abs(val1 - question.x1) < 0.01 && Math.abs(val2 - question.x2) < 0.01) ||
                    (Math.abs(val1 - question.x2) < 0.01 && Math.abs(val2 - question.x1) < 0.01);
                    
    if (isMatch) {
      setFeedback({ isCorrect: true, msg: "Luar Biasa! Jawabanmu benar." });
      onCorrect();
    } else {
      // Pembahasan kesalahan
      const sum = val1 + val2;
      const prod = val1 * val2;
      const expectedSum = -question.b / question.a;
      const expectedProd = question.c / question.a;
      
      let msg = "Jawaban masih keliru.";
      if (Math.abs(sum - expectedSum) < 0.01 && Math.abs(prod - expectedProd) > 0.01) {
         msg = `Jumlah kedua akar (x₁+x₂) sudah benar ${expectedSum}, tetapi hasil kalinya salah (seharusnya ${expectedProd}).`;
      } else if (Math.abs(prod - expectedProd) < 0.01 && Math.abs(sum - expectedSum) > 0.01) {
         msg = `Hasil kali kedua akar (x₁·x₂) sudah benar ${expectedProd}, tetapi hasil jumlahnya salah (seharusnya ${expectedSum}).`;
      }
      
      setFeedback({ isCorrect: false, msg });
      onWrong();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-8 w-full max-w-xl text-center mb-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--primary-accent)]"></div>
        <h3 className="text-[var(--text-secondary)] text-sm font-bold uppercase tracking-wider mb-2">Persamaan</h3>
        <p className="text-4xl font-black text-[var(--text-primary)] font-mono py-4">
          {formatEquation(question.a, question.b, question.c)}
        </p>
        <p className="text-sm text-[var(--text-secondary)] mt-4 bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--card-border)]">
          <strong>Instruksi:</strong> Carilah dua nilai <span className="font-mono text-[var(--primary-accent)]">x</span> yang jika dimasukkan ke dalam persamaan akan menghasilkan 0. Kamu bisa menggunakan kertas coretan untuk menghitung menggunakan <strong>Pemfaktoran</strong> atau <strong>Rumus ABC</strong>.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-xl mb-6">
        <div>
          <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 text-center">Akar 1 (x₁)</label>
          <input 
            ref={inputRef}
            type="text" 
            value={ans1} 
            onChange={(e) => setAns1(e.target.value)}
            placeholder={!question.isReal ? "imajiner?" : "0"}
            className="w-full text-center text-2xl font-black bg-[var(--bg-secondary)] border-2 border-[var(--card-border)] rounded-2xl p-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-accent)]"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 text-center">Akar 2 (x₂)</label>
          <input 
            type="text" 
            value={ans2} 
            onChange={(e) => setAns2(e.target.value)}
            placeholder={!question.isReal ? "imajiner?" : "0"}
            className="w-full text-center text-2xl font-black bg-[var(--bg-secondary)] border-2 border-[var(--card-border)] rounded-2xl p-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-accent)]"
          />
        </div>
      </div>

      <button onClick={handleSubmit} className="fisma-btn-primary w-full max-w-xl py-4 rounded-xl text-lg mb-6">
        Periksa Jawaban
      </button>

      <div className="w-full max-w-xl flex justify-between items-center px-2">
        <button onClick={onUseHint} disabled={hintLevel >= 3} className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary-accent)] disabled:opacity-50 text-sm font-bold transition-colors">
          <Lightbulb className="w-4 h-4" />
          Gunakan Hint ({3 - hintLevel} tersisa)
        </button>
      </div>

      {/* Hint Box */}
      {hintLevel > 0 && (
        <div className="w-full max-w-xl mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-600 dark:text-yellow-400 text-sm font-medium">
          <p className="font-bold mb-1">Hint Level {hintLevel}:</p>
          {hintLevel === 1 && <p>Ingat aturan Viete: <span className="font-mono bg-yellow-500/20 px-1 rounded">x₁ + x₂ = -b/a</span> dan <span className="font-mono bg-yellow-500/20 px-1 rounded">x₁ · x₂ = c/a</span></p>}
          {hintLevel === 2 && <p>Jumlah akar haruslah <b>{-question.b/question.a}</b>, sedangkan hasil kalinya <b>{question.c/question.a}</b>.</p>}
          {hintLevel === 3 && <p>Nilai Diskriminannya adalah <b>{question.D}</b>.</p>}
        </div>
      )}

      {/* Feedback Box */}
      {feedback && (
        <div className={`w-full max-w-xl mt-6 p-6 rounded-2xl border flex items-start gap-4 ${feedback.isCorrect ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'}`}>
          {feedback.isCorrect ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <XCircle className="w-6 h-6 shrink-0" />}
          <div>
            <h4 className="font-bold text-lg mb-1">{feedback.isCorrect ? 'Benar!' : 'Belum Tepat'}</h4>
            <p className="font-medium text-sm leading-relaxed">{feedback.msg}</p>
          </div>
        </div>
      )}
    </div>
  );
};
