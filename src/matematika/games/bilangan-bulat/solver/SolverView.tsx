import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Cpu,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  Calculator,
  Plus,
  Minus,
  ChevronDown,
} from 'lucide-react';
import { OperationType } from '../game/GameManager';
import { solveBilanganBulat, SolverResult } from './SolverEngine';
import { NumberLineVisualizer } from './NumberLineVisualizer';

interface SolverViewProps {
  initialNumbers?: number[];
  initialOps?: OperationType[];
  // Backwards compatibility
  initialNum1?: number;
  initialOp?: OperationType;
  initialNum2?: number;
  onBackToDashboard: () => void;
  onExitModule?: () => void;
}

const OperatorDropdown: React.FC<{
  value: OperationType;
  onChange: (newOp: OperationType) => void;
}> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const items: { op: OperationType; label: string }[] = [
    { op: '+', label: '+' },
    { op: '-', label: '−' },
    { op: '*', label: '×' },
    { op: '/', label: '÷' },
  ];

  const currentLabel = items.find((i) => i.op === value)?.label || value;

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3.5 py-2.5 rounded-xl text-lg font-black border transition-all flex items-center justify-center gap-1.5 min-h-[48px] shadow-sm hover:scale-105 active:scale-95"
        style={{
          background: 'var(--button-primary-bg)',
          color: 'var(--button-primary-text)',
          borderColor: 'var(--card-border)',
        }}
        title="Pilih Operasi"
      >
        <span>{currentLabel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 z-50 p-1.5 rounded-2xl border shadow-xl flex flex-col gap-1 min-w-[56px] animate-in fade-in zoom-in-95 duration-150"
          style={{
            background: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
          }}
        >
          {items.map((item) => {
            const isSelected = value === item.op;
            return (
              <button
                key={item.op}
                type="button"
                onClick={() => {
                  onChange(item.op);
                  setIsOpen(false);
                }}
                className={`w-11 h-11 rounded-xl text-lg font-black transition-all flex items-center justify-center ${
                  isSelected ? 'shadow-md scale-105' : 'opacity-80 hover:opacity-100 hover:bg-white/10'
                }`}
                style={{
                  background: isSelected ? 'var(--button-primary-bg)' : 'transparent',
                  color: isSelected ? 'var(--button-primary-text)' : 'var(--text-primary)',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const SolverView: React.FC<SolverViewProps> = ({
  initialNumbers,
  initialOps,
  initialNum1 = -8,
  initialOp = '+',
  initialNum2 = 12,
  onBackToDashboard,
  onExitModule,
}) => {
  const [numbers, setNumbers] = useState<number[]>(
    initialNumbers ?? [initialNum1, initialNum2]
  );
  const [ops, setOps] = useState<OperationType[]>(
    initialOps ?? [initialOp]
  );

  const [solution, setSolution] = useState<SolverResult | null>(() =>
    solveBilanganBulat(numbers, ops)
  );

  const handleCalculate = () => {
    setSolution(solveBilanganBulat(numbers, ops));
  };

  const handleAddTerm = () => {
    setNumbers([...numbers, 0]);
    setOps([...ops, '+']);
  };

  const handleRemoveTerm = () => {
    if (numbers.length <= 2) return;
    setNumbers(numbers.slice(0, -1));
    setOps(ops.slice(0, -1));
  };

  const updateNumber = (index: number, value: number) => {
    const newNums = [...numbers];
    newNums[index] = value;
    setNumbers(newNums);
  };

  const updateOp = (index: number, newOp: OperationType) => {
    const newOps = [...ops];
    newOps[index] = newOp;
    setOps(newOps);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6 animate-fade-in">
      {/* Top Header Navigation */}
      <div
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 border-b"
        style={{ borderColor: 'var(--glass-border)' }}
      >
        <button
          onClick={onExitModule || onBackToDashboard}
          className="fisma-btn-secondary px-4 py-3 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center sm:justify-start gap-2 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Kembali ke Dashboard Utama</span>
        </button>

        {/* Tab Selector */}
        <div
          className="p-1 rounded-2xl border flex items-center justify-center gap-1 w-full sm:w-auto"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        >
          <button
            onClick={onBackToDashboard}
            className={`flex-1 sm:flex-initial px-4 py-2.5 min-h-[42px] rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all opacity-70 hover:opacity-100`}
            style={{
              background: 'transparent',
              color: 'var(--text-primary)',
            }}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Game Edukasi</span>
          </button>

          <button
            className={`flex-1 sm:flex-initial px-4 py-2.5 min-h-[42px] rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md`}
            style={{
              background: 'var(--button-primary-bg)',
              color: 'var(--button-primary-text)',
            }}
          >
            <Cpu className="w-4 h-4 shrink-0" />
            <span>Bot Solver</span>
          </button>
        </div>
      </div>

      {/* Solver Main Input Panel */}
      <div
        className="fisma-card p-6 sm:p-8 rounded-3xl border space-y-6 shadow-xl"
        style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md"
              style={{ background: 'var(--button-primary-bg)', color: 'var(--button-primary-text)' }}
            >
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                Input Persamaan Operasi
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Masukkan bilangan bulat dan operasinya. Kamu bisa menambah jumlah bilangan tanpa batas.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <button
                type="button"
                onClick={handleAddTerm}
                className="p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all min-h-[40px] shadow-sm hover:scale-105"
                style={{
                  background: 'var(--button-primary-bg)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--button-primary-text)',
                }}
                title="Tambah Bilangan"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Tambah</span>
              </button>
              <button
                type="button"
                onClick={handleRemoveTerm}
                disabled={numbers.length <= 2}
                className="p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-40 min-h-[40px] opacity-80 hover:opacity-100"
                style={{
                  background: 'var(--glass-bg)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--text-primary)',
                }}
                title="Hapus Bilangan Terakhir"
              >
                <Minus className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Hapus</span>
              </button>
          </div>
        </div>

        {/* Dynamic Form Inputs Grid */}
        <div className="flex flex-wrap items-center gap-3">
          {numbers.map((num, idx) => (
            <React.Fragment key={idx}>
              {/* Number Input */}
              <div className="space-y-1 shrink-0 w-24 sm:w-32">
                <label className="text-xs font-bold block" style={{ color: 'var(--text-secondary)' }}>
                  Bilangan {idx + 1}:
                </label>
                <input
                  type="number"
                  value={num}
                  onChange={(e) => updateNumber(idx, parseInt(e.target.value, 10) || 0)}
                  className="w-full p-3 rounded-xl border font-mono font-black text-center text-lg focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-[48px]"
                  style={{
                    background: 'var(--glass-bg)',
                    borderColor: 'var(--card-border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* Operator Select */}
              {idx < ops.length && (
                <div className="space-y-1 shrink-0">
                  <label className="text-xs font-bold block text-center opacity-0">Op</label>
                  <div
                    className="flex gap-1 p-1 rounded-2xl border min-h-[48px]"
                    style={{ background: 'var(--glass-bg)', borderColor: 'var(--card-border)' }}
                  >
                    {[
                      { op: '+', label: '+' },
                      { op: '-', label: '−' },
                      { op: '*', label: '×' },
                      { op: '/', label: '÷' },
                    ].map((item) => {
                      const isSelected = ops[idx] === item.op;
                      return (
                        <button
                          key={item.op}
                          type="button"
                          onClick={() => updateOp(idx, item.op as OperationType)}
                          className={`w-10 rounded-xl text-lg font-black transition-all flex items-center justify-center min-h-[40px] ${
                            isSelected ? 'shadow-md scale-105' : 'opacity-70 hover:opacity-100'
                          }`}
                          style={{
                            background: isSelected ? 'var(--button-primary-bg)' : 'transparent',
                            color: isSelected ? 'var(--button-primary-text)' : 'var(--text-primary)',
                          }}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Calculate Action */}
        <button
          type="button"
          onClick={handleCalculate}
          className="fisma-btn-primary w-full py-3.5 sm:py-4 px-6 rounded-2xl text-sm sm:text-base font-extrabold flex items-center justify-center gap-2.5 shadow-lg active:scale-98 transition-all min-h-[48px]"
        >
          <Sparkles className="w-5 h-5 shrink-0" />
          <span>Selesaikan & Jelaskan Langkahnya</span>
        </button>
      </div>

      {/* Solver Result Display */}
      {solution && (
        <div className="space-y-6">
          {/* Main Answer Card */}
          <div
            className="fisma-card p-6 rounded-3xl border text-center space-y-2 relative overflow-hidden shadow-lg"
            style={{
              background: 'var(--card-bg)',
              borderColor: 'var(--primary-accent)',
            }}
          >
            <span className="text-xs font-extrabold uppercase tracking-widest block" style={{ color: 'var(--text-muted)' }}>
              Persamaan & Hasil Akhir:
            </span>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono" style={{ color: 'var(--text-primary)' }}>
              {solution.formattedExpression} ={' '}
              <span style={{ color: 'var(--primary-accent)' }}>{solution.result}</span>
            </div>
            <p className="text-xs font-medium pt-1" style={{ color: 'var(--text-secondary)' }}>
              💡 Kesimpulan: {solution.summaryRule}
            </p>
          </div>

          {/* Number Line Visualizer Card (Only if exactly 1 add/sub operation) */}
          {solution.numberLine && (
            <div
              className="fisma-card p-6 rounded-3xl border space-y-3"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                <h3 className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>
                  Visualisasi Garis Bilangan (Number Line)
                </h3>
              </div>
              <NumberLineVisualizer state={solution.numberLine} />
            </div>
          )}

          {/* Step By Step Explanation */}
          <div
            className="fisma-card p-6 sm:p-8 rounded-3xl border space-y-5"
            style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" style={{ color: 'var(--primary-accent)' }} />
              <h3 className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>
                Langkah Demi Langkah Penyelesaian:
              </h3>
            </div>

            <div className="space-y-4">
              {solution.steps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-4 sm:p-5 rounded-2xl border space-y-2 relative transition-all"
                  style={{
                    background: 'var(--glass-bg)',
                    borderColor: 'var(--glass-border)',
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
                      style={{ background: 'var(--badge-bg)', color: 'var(--badge-text)' }}
                    >
                      Langkah {step.stepNumber}
                    </span>

                    {step.highlightRule && (
                      <span className="text-xs font-mono font-extrabold px-2.5 py-0.5 rounded bg-amber-400/20 text-amber-400 border border-amber-400/30">
                        Rumus: {step.highlightRule}
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-black" style={{ color: 'var(--text-primary)' }}>
                    {step.title}
                  </h4>

                  <div className="p-3 rounded-xl bg-black/10 dark:bg-black/30 font-mono text-base font-bold" style={{ color: 'var(--primary-accent)' }}>
                    {step.expression}
                  </div>

                  <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {step.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Integer Rules Cheatsheet */}
          <div
            className="p-6 rounded-3xl border space-y-3"
            style={{ background: 'var(--badge-bg)', borderColor: 'var(--card-border)' }}
          >
            <h4 className="text-sm font-extrabold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Panduan Ringkas Tanda Operasi Bilangan Bulat</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <div className="p-3 rounded-xl bg-black/10 dark:bg-black/20 space-y-1">
                <span className="font-bold block text-white/90">Penjumlahan & Pengurangan:</span>
                <p>• Tanda <code className="text-amber-400">+ (−)</code> disederhanakan jadi <code className="text-amber-400">−</code></p>
                <p>• Tanda <code className="text-amber-400">− (−)</code> disederhanakan jadi <code className="text-amber-400">+</code></p>
              </div>
              <div className="p-3 rounded-xl bg-black/10 dark:bg-black/20 space-y-1">
                <span className="font-bold block text-white/90">Perkalian & Pembagian:</span>
                <p>• SAMA TANDA <code className="text-emerald-400">(+) × (+)</code> atau <code className="text-emerald-400">(−) × (−)</code> = <b className="text-emerald-400">POSITIF (+)</b></p>
                <p>• BEDA TANDA <code className="text-red-400">(+) × (−)</code> atau <code className="text-red-400">(−) × (+)</code> = <b className="text-red-400">NEGATIF (−)</b></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
