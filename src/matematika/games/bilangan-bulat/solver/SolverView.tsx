import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const updateCoords = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const top = rect.bottom + 6;
      const left = rect.left + rect.width / 2;
      setCoords({ top, left });
      if (dropdownRef.current) {
        dropdownRef.current.style.top = `${top}px`;
        dropdownRef.current.style.left = `${left}px`;
      }
    }
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      updateCoords();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    updateCoords();

    const handleClickOutside = (event: MouseEvent) => {
      const targetNode = event.target instanceof Node ? event.target : null;
      if (
        dropdownRef.current &&
        targetNode &&
        !dropdownRef.current.contains(targetNode) &&
        buttonRef.current &&
        !buttonRef.current.contains(targetNode)
      ) {
        setIsOpen(false);
      }
    };

    const handleUpdatePos = (e: Event) => {
      // If scrolling inside the dropdown menu itself, do nothing
      if (
        dropdownRef.current &&
        e.target instanceof Node &&
        dropdownRef.current.contains(e.target)
      ) {
        return;
      }
      // Update DOM styles directly for instantaneous sync without React state delay
      if (buttonRef.current && dropdownRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        dropdownRef.current.style.top = `${rect.bottom + 6}px`;
        dropdownRef.current.style.left = `${rect.left + rect.width / 2}px`;
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleUpdatePos, true);
    window.addEventListener('resize', handleUpdatePos);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleUpdatePos, true);
      window.removeEventListener('resize', handleUpdatePos);
    };
  }, [isOpen, updateCoords]);

  const items: { op: OperationType; label: string }[] = [
    { op: '+', label: '+' },
    { op: '-', label: '−' },
    { op: '*', label: '×' },
    { op: '/', label: '÷' },
  ];

  const currentItem = items.find((i) => i.op === value) || items[0];

  return (
    <div className="relative shrink-0">
      {/* Default button showing active operator */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="px-3.5 py-2.5 rounded-2xl text-xl font-black border transition-all flex items-center justify-center gap-1.5 min-w-[54px] min-h-[52px] shadow-md hover:scale-105 active:scale-95 cursor-pointer"
        style={{
          background: 'var(--button-primary-bg)',
          color: 'var(--button-primary-text)',
          borderColor: 'var(--card-border)',
        }}
        title="Klik untuk memilih operator (+, −, ×, ÷)"
      >
        <span>{currentItem.label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Outer Dropdown Popup Box (1 kotak panjang tepat di bawah tombol) via Portal */}
      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[9999] p-1.5 rounded-2xl border shadow-2xl min-w-[72px] animate-in fade-in slide-in-from-top-2 duration-150"
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: 'translateX(-50%)',
              background: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Inner Scrollable Box (+ - x bagi yang bisa digeser) */}
            <div
              className="flex flex-col gap-1 max-h-36 overflow-y-auto overflow-x-hidden p-1 rounded-xl"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'var(--primary-accent) transparent',
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
                    className={`w-full py-2 px-3 rounded-xl text-lg font-black transition-all flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'shadow-md ring-2 ring-amber-400 scale-102'
                        : 'opacity-80 hover:opacity-100 hover:bg-white/10'
                    }`}
                    style={{
                      background: isSelected ? 'var(--button-primary-bg)' : 'transparent',
                      color: isSelected ? 'var(--button-primary-text)' : 'var(--text-primary)',
                    }}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
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

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [solution, setSolution] = useState<SolverResult | null>(() =>
    solveBilanganBulat(numbers, ops)
  );

  const handleCalculate = () => {
    setSolution(solveBilanganBulat(numbers, ops));
  };

  const handleAddTerm = () => {
    setNumbers([...numbers, 0]);
    setOps([...ops, '+']);
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          left: scrollContainerRef.current.scrollWidth,
          behavior: 'smooth',
        });
      }
    }, 60);
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
          className="fisma-btn-secondary w-full sm:w-auto px-4 py-3 min-h-[48px] sm:min-h-[44px] rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center sm:justify-start gap-2 shadow-sm active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Kembali</span>
        </button>

        {/* Tab Selector */}
        <div
          className="p-1 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-1 w-full sm:w-auto"
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
        className="fisma-card p-4 sm:p-6 md:p-8 rounded-3xl border space-y-6 shadow-xl"
        style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center shadow-md"
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
          
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
             <button
                type="button"
                onClick={handleAddTerm}
                className="flex-1 sm:flex-initial p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all min-h-[40px] shadow-sm hover:scale-105"
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
                className="flex-1 sm:flex-initial p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all disabled:opacity-40 min-h-[40px] opacity-80 hover:opacity-100"
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

        {/* Dynamic Form Inputs Container - Horizontal Layout & Scrollable */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex items-end gap-3 sm:gap-4 overflow-x-auto overflow-y-hidden pb-2 pt-2 px-1 rounded-2xl transition-all scroll-smooth custom-scrollbar"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'var(--primary-accent) transparent',
            }}
          >
            {numbers.map((num, idx) => (
              <React.Fragment key={idx}>
                {/* Number Input Box */}
                <div className="space-y-1 shrink-0 w-28 sm:w-36">
                  <label className="text-xs font-bold block" style={{ color: 'var(--text-secondary)' }}>
                    Bilangan {idx + 1}:
                  </label>
                  <input
                    type="number"
                    value={num}
                    onChange={(e) => updateNumber(idx, parseInt(e.target.value, 10) || 0)}
                    className="w-full p-3 rounded-2xl border font-mono font-black text-center text-xl focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-[52px] shadow-inner"
                    style={{
                      background: 'var(--glass-bg)',
                      borderColor: 'var(--card-border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                {/* Operator Select (Dropdown Menu Kebawah) */}
                {idx < ops.length && (
                  <div className="space-y-1 shrink-0 self-end">
                    <label className="text-xs font-bold block text-center opacity-0 select-none">Op</label>
                    <OperatorDropdown
                      value={ops[idx]}
                      onChange={(newOp) => updateOp(idx, newOp)}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Horizontal Scroll Indicator / Counter */}
          {numbers.length > 3 && (
            <div className="flex items-center justify-between text-[11px] font-bold px-2 pt-1" style={{ color: 'var(--text-muted)' }}>
              <span>👈 Geser ke samping untuk melihat semua bilangan 👉</span>
              <span>Total: {numbers.length} Bilangan</span>
            </div>
          )}
        </div>

        {/* Calculate Action */}
        <button
          type="button"
          onClick={handleCalculate}
          className="fisma-btn-primary w-full py-3.5 sm:py-4 px-4 sm:px-6 rounded-2xl text-xs sm:text-base font-extrabold flex flex-wrap items-center justify-center gap-2 shadow-lg active:scale-98 transition-all min-h-[48px] text-center whitespace-normal"
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
            className="fisma-card p-4 sm:p-6 rounded-3xl border text-center space-y-2 relative overflow-hidden shadow-lg"
            style={{
              background: 'var(--card-bg)',
              borderColor: 'var(--primary-accent)',
            }}
          >
            <span className="text-xs font-extrabold uppercase tracking-widest block" style={{ color: 'var(--text-muted)' }}>
              Persamaan & Hasil Akhir:
            </span>
            <div
              className="py-2 px-1 text-2xl sm:text-4xl lg:text-5xl font-black font-mono overflow-x-auto whitespace-nowrap custom-scrollbar w-full text-center"
              style={{
                color: 'var(--text-primary)',
              }}
            >
              <span className="leading-tight">{solution.formattedExpression}</span>
              <span className="leading-tight mx-2 sm:mx-4">=</span>
              <span className="leading-tight" style={{ color: 'var(--primary-accent)' }}>{solution.result}</span>
            </div>
            <p className="text-xs font-medium pt-1" style={{ color: 'var(--text-secondary)' }}>
              💡 Kesimpulan: {solution.summaryRule}
            </p>
          </div>

          {/* Number Line Visualizer Card (Only if exactly 1 add/sub operation) */}
          {solution.numberLine && (
            <div
              className="fisma-card p-4 sm:p-6 rounded-3xl border space-y-3"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
            >
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
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
            className="fisma-card p-4 sm:p-6 md:p-8 rounded-3xl border space-y-5"
            style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
          >
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
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
                  <div className="flex flex-wrap items-center justify-between gap-2">
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

                  <div className="p-3 rounded-xl bg-black/10 dark:bg-black/30 font-mono text-base font-bold overflow-x-auto whitespace-nowrap custom-scrollbar" style={{ color: 'var(--primary-accent)' }}>
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
            className="p-4 sm:p-6 rounded-3xl border space-y-3"
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
