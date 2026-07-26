import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Calculator, Info, LineChart } from 'lucide-react';
import { solveQuadratic, SolverResult } from './SolverEngine';
import { GraphicVisualizer } from './GraphicVisualizer';

interface Props {
  onBack: () => void;
}

export const SolverView: React.FC<Props> = ({ onBack }) => {
  const [a, setA] = useState<number>(1);
  const [b, setB] = useState<number>(-5);
  const [c, setC] = useState<number>(6);
  
  const [results, setResults] = useState<SolverResult[] | null>(null);
  const [activeMethodIdx, setActiveMethodIdx] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>('');

  React.useEffect(() => {
    try {
      setErrorMsg('');
      const res = solveQuadratic(a, b, c);
      setResults(res);
      setActiveMethodIdx(prev => res[prev] ? prev : 0);
    } catch (e: any) {
      setErrorMsg(e.message);
      setResults(null);
    }
  }, [a, b, c]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fade-in min-w-0">
      <button
        onClick={onBack}
        className="px-4 py-3 min-h-[48px] rounded-xl text-sm mb-6 inline-flex items-center gap-2 font-bold transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] active:scale-95"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Input & Grafik */}
        <div className="lg:col-span-1 space-y-6">
          <div className="fisma-card rounded-3xl p-6 border">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
              <Calculator className="w-5 h-5 text-[var(--primary-accent)]" />
              Input Nilai
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Nilai a</label>
                <input 
                  type="number" 
                  value={a} 
                  onChange={(e) => setA(Number(e.target.value))}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-accent)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Nilai b</label>
                <input 
                  type="number" 
                  value={b} 
                  onChange={(e) => setB(Number(e.target.value))}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-accent)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Nilai c</label>
                <input 
                  type="number" 
                  value={c} 
                  onChange={(e) => setC(Number(e.target.value))}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-accent)] transition-colors"
                />
              </div>

              {errorMsg && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold">
                  {errorMsg}
                </div>
              )}
            </div>
          </div>

          <div className="fisma-card rounded-3xl p-6 border">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
              <LineChart className="w-5 h-5 text-[var(--primary-accent)]" />
              Grafik Parabola
            </h2>
            <GraphicVisualizer a={a} b={b} c={c} />
            <p className="text-xs text-[var(--text-muted)] mt-4 text-center">
              Visualisasi bentuk kurva dari nilai a, b, dan c di atas.
            </p>
          </div>
        </div>

        {/* Kolom Kanan: Output Virtual Teacher */}
        <div className="lg:col-span-2">
          {results ? (
            <div className="fisma-card rounded-3xl p-6 sm:p-8 border min-h-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--card-border)] pb-6 mb-6">
                <div>
                  <h2 className="text-2xl font-black text-[var(--text-primary)] mb-1">Penyelesaian</h2>
                  <p className="text-[var(--text-secondary)] font-medium">Persamaan: <span className="font-mono bg-[var(--bg-secondary)] px-2 py-0.5 rounded text-[var(--primary-accent)]">{results[0].persamaan}</span></p>
                </div>
                <div className="flex gap-2 bg-[var(--bg-secondary)] p-1 rounded-xl overflow-x-auto border border-[var(--card-border)]">
                  {results.map((res, idx) => (
                    <button
                      key={res.metodeDigunakan}
                      onClick={() => setActiveMethodIdx(idx)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                        activeMethodIdx === idx 
                          ? 'bg-[var(--primary-accent)] text-[var(--button-primary-text)] shadow-md' 
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-bg)]'
                      }`}
                    >
                      {res.metodeDigunakan}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 mb-8 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--card-border)]">
                <Info className="w-5 h-5 text-[var(--primary-accent)] shrink-0" />
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  <span className="text-[var(--text-muted)]">Diskriminan:</span> {results[activeMethodIdx].diskriminan} &nbsp;&bull;&nbsp; 
                  <span className="text-[var(--text-muted)]">Sifat:</span> {results[activeMethodIdx].jenisAkar}
                </p>
              </div>

              <div className="space-y-6">
                {results[activeMethodIdx].langkahPenyelesaian.map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-[var(--primary-accent)]/10 text-[var(--primary-accent)] flex items-center justify-center font-black text-sm shrink-0 border border-[var(--primary-accent)]/20">
                        {idx + 1}
                      </div>
                      {idx !== results[activeMethodIdx].langkahPenyelesaian.length - 1 && (
                        <div className="w-0.5 h-full bg-[var(--card-border)] my-2"></div>
                      )}
                    </div>
                    <div className="pt-1 pb-6 w-full">
                      <h4 className="text-base font-bold text-[var(--text-primary)] mb-2">{step.title}</h4>
                      <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
                        {step.explanation}
                      </p>
                      <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--card-border)] overflow-x-auto">
                        {/* Render simple math string (using pre or basic parsing for superscripts) */}
                        <div 
                          className="font-mono text-base text-[var(--primary-accent)] text-center w-full min-w-max whitespace-pre-wrap leading-loose"
                          dangerouslySetInnerHTML={{
                            __html: step.math
                              .replace(/\^2/g, '²')
                              .replace(/\\frac{(.*?)}{(.*?)}/g, '<span class="inline-block align-middle text-center"><span class="block border-b border-current pb-0.5 px-2">$1</span><span class="block pt-0.5 px-2">$2</span></span>')
                              .replace(/\\pm/g, '±')
                              .replace(/\\sqrt{(.*?)}/g, '√($1)')
                              .replace(/\\text{(.*?)}/g, '$1')
                              .replace(/\\times/g, '×')
                              .replace(/\\\\/g, '<br/>')
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 rounded-2xl bg-[var(--primary-accent)]/5 border border-[var(--primary-accent)]/20 flex gap-4 items-start">
                <BookOpen className="w-6 h-6 text-[var(--primary-accent)] shrink-0" />
                <div>
                  <h4 className="font-bold text-[var(--text-primary)] mb-1">Kesimpulan Guru Virtual</h4>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {results[activeMethodIdx].kesimpulan}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="fisma-card rounded-3xl p-8 border h-full flex flex-col items-center justify-center text-center">
              <Calculator className="w-16 h-16 text-[var(--text-muted)] mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Virtual Teacher Siap Membantu</h3>
              <p className="text-sm text-[var(--text-secondary)] max-w-sm">
                Masukkan nilai a, b, dan c di panel kiri. Saya akan menjelaskan langkah penyelesaiannya secara otomatis di sini.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
