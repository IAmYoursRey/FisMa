import React, { useState } from 'react';
import { QuadraticEquation } from '../QuestionGenerator';
import { formatEquation } from '../../solver/SolverEngine';
import { CheckCircle2, XCircle, MousePointerClick } from 'lucide-react';

interface Props {
  question: QuadraticEquation;
  onCorrect: () => void;
  onWrong: () => void;
}

export const PilihMetodeMode: React.FC<Props> = ({ question, onCorrect, onWrong }) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{isCorrect: boolean; msg: string} | null>(null);

  React.useEffect(() => {
    setSelectedMethod(null);
    setFeedback(null);
  }, [question]);

  const methods = [
    { id: 'faktorisasi', label: 'Faktorisasi' },
    { id: 'kuadrat-sempurna', label: 'Melengkapkan Kuadrat' },
    { id: 'rumus-abc', label: 'Rumus ABC' },
  ];

  const handleSelect = (id: string) => {
    setSelectedMethod(id);
    
    // Logika kebenaran (sederhana)
    // Jika a=1 dan Diskriminan kuadrat sempurna -> Faktorisasi paling tepat.
    // Jika D < 0 -> Rumus ABC paling aman.
    
    const isPerfectSquareD = question.D >= 0 && Number.isInteger(Math.sqrt(question.D));
    let bestMethod = 'rumus-abc';

    if (isPerfectSquareD) {
      bestMethod = 'faktorisasi'; // Faktorisasi paling efisien jika akar rasional
    } else if (question.a === 1 && question.b % 2 === 0 && question.D >= 0) {
      bestMethod = 'kuadrat-sempurna'; // Menghindari pecahan saat tidak bisa difaktorkan
    } else {
      bestMethod = 'rumus-abc'; // Paling universal untuk akar irasional atau imajiner
    }
    
    if (id === bestMethod) {
      setFeedback({
        isCorrect: true, 
        msg: `Benar! Metode ${id} adalah metode paling efisien karena ${
          bestMethod === 'faktorisasi' ? 'akar-akarnya adalah bilangan rasional (Diskriminan kuadrat sempurna)' : 
          bestMethod === 'kuadrat-sempurna' ? 'nilai a=1 dan b genap, sehingga mudah dilengkapkan kuadratnya' : 
          'koefisien tidak mudah difaktorkan dan akar-akarnya irasional/imajiner'
        }.`
      });
      onCorrect();
    } else {
      if (id === 'rumus-abc' && bestMethod === 'faktorisasi') {
        setFeedback({
          isCorrect: true, 
          msg: `Benar! Rumus ABC dapat digunakan pada soal ini, meski metode Faktorisasi jauh lebih cepat karena akarnya adalah bilangan rasional.`
        });
        onCorrect();
      } else {
        setFeedback({
          isCorrect: false,
          msg: `Kurang efisien. Diskriminannya adalah ${question.D}. Sebaiknya gunakan metode ${
            bestMethod === 'faktorisasi' ? 'Faktorisasi' : 
            bestMethod === 'kuadrat-sempurna' ? 'Melengkapkan Kuadrat Sempurna' : 
            'Rumus ABC'
          }.`
        });
        onWrong();
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-8 w-full max-w-xl text-center mb-8 shadow-sm">
        <h3 className="text-[var(--text-secondary)] text-sm font-bold uppercase tracking-wider mb-4">Pilih Metode Paling Efisien</h3>
        <p className="text-3xl font-black text-[var(--text-primary)] font-mono py-4">
          {formatEquation(question.a, question.b, question.c)}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-8">
        {methods.map(m => (
          <button 
            key={m.id}
            onClick={() => !feedback && handleSelect(m.id)}
            className={`p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all ${
              selectedMethod === m.id 
                ? 'bg-[var(--primary-accent)]/20 border-[var(--primary-accent)] text-[var(--primary-accent)]' 
                : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-secondary)] hover:border-[var(--primary-accent)] hover:text-[var(--primary-accent)]'
            }`}
          >
            <MousePointerClick className="w-6 h-6" />
            <span className="font-bold text-sm text-center">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Feedback Box */}
      {feedback && (
        <div className={`w-full max-w-2xl p-6 rounded-2xl border flex items-start gap-4 ${feedback.isCorrect ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400'}`}>
          {feedback.isCorrect ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <XCircle className="w-6 h-6 shrink-0" />}
          <div>
            <h4 className="font-bold text-lg mb-1">{feedback.isCorrect ? 'Tepat Sekali!' : 'Ada Metode Lain yang Lebih Baik'}</h4>
            <p className="font-medium text-sm leading-relaxed">{feedback.msg}</p>
          </div>
        </div>
      )}
    </div>
  );
};
