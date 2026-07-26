import React, { useState } from 'react';
import { QuadraticEquation } from '../QuestionGenerator';
import { GraphicVisualizer } from '../../solver/GraphicVisualizer';
import { formatEquation } from '../../solver/SolverEngine';
import { CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  question: QuadraticEquation;
  onCorrect: () => void;
  onWrong: () => void;
}

export const AnalisisGrafikMode: React.FC<Props> = ({ question, onCorrect, onWrong }) => {
  const [ans, setAns] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{isCorrect: boolean; msg: string} | null>(null);

  // Soal acak berdasarkan grafik:
  // 1: Terbuka ke atas atau ke bawah?
  // 2: Memotong sumbu x di berapa titik?
  const [questionType, setQuestionType] = useState<number>(Math.random() > 0.5 ? 1 : 2);

  React.useEffect(() => {
    setAns(null);
    setFeedback(null);
    setQuestionType(Math.random() > 0.5 ? 1 : 2);
  }, [question]);

  const handleAnswer = (val: string) => {
    setAns(val);
    let isCorrect = false;
    let msg = "";

    if (questionType === 1) {
      const expected = question.a > 0 ? 'atas' : 'bawah';
      isCorrect = val === expected;
      msg = isCorrect 
        ? `Benar! Parabola dengan nilai a = ${question.a} (positif/negatif) akan terbuka ke ${expected}.`
        : `Salah. Lihat nilai a = ${question.a}. Jika a > 0, kurva terbuka ke atas (senyum). Jika a < 0, kurva terbuka ke bawah (cemberut).`;
    } else {
      let expected = '0';
      if (question.D > 0) expected = '2';
      else if (question.D === 0) expected = '1';

      isCorrect = val === expected;
      msg = isCorrect 
        ? `Tepat sekali! Diskriminan (D) bernilai ${question.D}, sehingga grafik memotong sumbu X di ${expected} titik.`
        : `Salah. Nilai Diskriminan (D = b² - 4ac) adalah ${question.D}. Karena D ${question.D > 0 ? '> 0' : question.D === 0 ? '= 0' : '< 0'}, grafik ${question.D > 0 ? 'memotong di 2 Titik' : question.D === 0 ? 'menyinggung di 1 Titik' : 'tidak memotong sumbu X (0 Titik)'}.`;
    }

    setFeedback({ isCorrect, msg });
    if (isCorrect) onCorrect();
    else onWrong();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-xl mb-8">
        <GraphicVisualizer a={question.a} b={question.b} c={question.c} />
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 w-full max-w-xl text-center mb-6 shadow-sm">
        <p className="text-xl font-bold text-[var(--text-primary)]">
          {questionType === 1 ? "Berdasarkan grafik di atas, apakah parabola terbuka ke arah mana?" : "Berapa banyak titik potong grafik dengan sumbu X?"}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-xl mb-6">
        {questionType === 1 ? (
          <>
            <button onClick={() => !feedback && handleAnswer('atas')} className="fisma-btn-secondary py-4 rounded-xl font-bold">Terbuka ke Atas</button>
            <button onClick={() => !feedback && handleAnswer('bawah')} className="fisma-btn-secondary py-4 rounded-xl font-bold">Terbuka ke Bawah</button>
          </>
        ) : (
          <>
            <button onClick={() => !feedback && handleAnswer('0')} className="fisma-btn-secondary py-4 rounded-xl font-bold">0 Titik (Tidak memotong)</button>
            <button onClick={() => !feedback && handleAnswer('1')} className="fisma-btn-secondary py-4 rounded-xl font-bold">1 Titik (Menyinggung)</button>
            <button onClick={() => !feedback && handleAnswer('2')} className="fisma-btn-secondary py-4 rounded-xl font-bold">2 Titik</button>
          </>
        )}
      </div>

      {feedback && (
        <div className={`w-full max-w-xl p-6 rounded-2xl border flex items-start gap-4 ${feedback.isCorrect ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'}`}>
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
