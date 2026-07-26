import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Minus,
  Sparkles,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Layers,
  Clock,
  ShieldCheck,
  Target,
  CheckCircle2,
} from 'lucide-react';
import { CryptarithmConfig, MathOperation } from '../../../types/cryptarithm';

interface PuzzleBuilderProps {
  config: CryptarithmConfig;
  onChange: (newConfig: CryptarithmConfig) => void;
  onStartGame: () => void;
}

// Helper function to calculate valid min and max result digits based on operation and operands
const getResultBounds = (operands: number[], op: MathOperation) => {
  const activeOperands = (operands || []).map((d) => Math.max(1, d));
  if (!activeOperands || activeOperands.length === 0) return { min: 1, max: 4, defaultRes: 2 };

  if (op === '+') {
    // Addition: 2d + 2d max result is 3d, 1d + 1d max result is 2d
    const maxOperandDigit = Math.max(...activeOperands);
    const maxRes = maxOperandDigit + 1;
    const minRes = maxOperandDigit;
    return { min: minRes, max: maxRes, defaultRes: maxRes };
  } else if (op === '-') {
    // Subtraction: max result cannot exceed 1st operand's digits
    const firstOperandDigits = activeOperands[0] || 1;
    const maxRes = Math.max(1, firstOperandDigits);
    const minRes = 1;
    return { min: minRes, max: maxRes, defaultRes: maxRes };
  } else if (op === '*') {
    // Multiplication: 2d * 2d max result is 4d
    const sumDigits = activeOperands.reduce((sum, d) => sum + d, 0);
    const maxRes = Math.min(10, sumDigits);
    const minRes = Math.max(1, sumDigits - activeOperands.length + 1);
    return { min: minRes, max: maxRes, defaultRes: maxRes };
  }

  return { min: 1, max: 8, defaultRes: Math.max(...activeOperands) + 1 };
};

export const PuzzleBuilder: React.FC<PuzzleBuilderProps> = ({
  config,
  onChange,
  onStartGame,
}) => {
  // Number of operand rows (2 to 5)
  const rowCount = config.rowCount || 2;

  // Active digit counts for operands
  const initialRowDigits = config.rowDigits && config.rowDigits.length >= rowCount + 1
    ? config.rowDigits
    : [2, 2, 3];

  const [operandActiveCounts, setOperandActiveCounts] = useState<number[]>(() => {
    return Array.from({ length: rowCount }, (_, idx) =>
      initialRowDigits[idx] !== undefined ? initialRowDigits[idx] : 2
    );
  });

  // User explicit column width
  const [userGridCols, setUserGridCols] = useState<number>(() => {
    return Math.max(config.digitCount || 3, ...operandActiveCounts, 2);
  });

  // Calculate valid bounds for result row
  const initialBounds = getResultBounds(operandActiveCounts, config.operation);

  const [resultActiveCount, setResultActiveCount] = useState<number>(() => {
    const rawVal = initialRowDigits[rowCount] || initialBounds.defaultRes;
    return Math.max(initialBounds.min, Math.min(initialBounds.max, rawVal));
  });

  // Automatically adjust resultActiveCount when operands or operation change
  useEffect(() => {
    const bounds = getResultBounds(operandActiveCounts, config.operation);
    setResultActiveCount((prev) => {
      if (prev < bounds.min) return bounds.min;
      if (prev > bounds.max) return bounds.max;
      return prev;
    });
  }, [operandActiveCounts, config.operation]);

  // Synchronized Grid Column Width across ALL rows (operands + result)
  const gridCols = Math.max(
    userGridCols,
    ...operandActiveCounts,
    resultActiveCount,
    2
  );

  // Custom Timer Form State
  const [timerMode, setTimerMode] = useState<'off' | 'custom'>(() => {
    return config.timerSec === 0 ? 'off' : 'custom';
  });
  const [customTimerVal, setCustomTimerVal] = useState<number>(
    config.timerSec > 0 ? config.timerSec : 1
  );

  // Sync operand active counts length when rowCount changes
  useEffect(() => {
    setOperandActiveCounts((prev) => {
      if (prev.length === rowCount) return prev;
      if (prev.length < rowCount) {
        // New row starts with 0 active digits (all cells in new row start OFF / Mati!)
        const added = Array(rowCount - prev.length).fill(0);
        return [...prev, ...added];
      }
      return prev.slice(0, rowCount);
    });
  }, [rowCount]);

  // Sync state back to parent config
  useEffect(() => {
    const updatedRowDigits = [...operandActiveCounts, resultActiveCount];
    onChange({
      ...config,
      rowCount,
      digitCount: gridCols,
      rowDigits: updatedRowDigits,
    });
  }, [operandActiveCounts, resultActiveCount, rowCount, gridCols, config.operation]);

  // Click handler for operand row box at column cIdx
  const handleOperandCellClick = (rIdx: number, cIdx: number) => {
    setOperandActiveCounts((prev) => {
      const currentActive = prev[rIdx] ?? 0;
      const targetActive = cIdx + 1;

      let newActive: number;
      if (currentActive === targetActive) {
        // If clicking the last active box, turn off 1 box (can go down to 0)
        newActive = Math.max(0, targetActive - 1);
      } else {
        // Set active count to targetActive
        newActive = targetActive;
      }

      const next = [...prev];
      next[rIdx] = newActive;
      return next;
    });
  };

  // Click handler for result row box at column cIdx (bounded mathematically by operation)
  const handleResultCellClick = (cIdx: number) => {
    const bounds = getResultBounds(operandActiveCounts, config.operation);
    setResultActiveCount((currentActive) => {
      const targetActive = cIdx + 1;
      let newActive: number;
      if (currentActive === targetActive) {
        newActive = targetActive - 1;
      } else {
        newActive = targetActive;
      }
      return Math.max(bounds.min, Math.min(bounds.max, newActive));
    });
  };

  // Add row (+ Tambah Baris)
  const handleAddRow = () => {
    if (rowCount >= 5) return;
    onChange({
      ...config,
      rowCount: rowCount + 1,
    });
  };

  // Remove row (- Hapus Baris)
  const handleRemoveRow = () => {
    if (rowCount <= 2) return;
    onChange({
      ...config,
      rowCount: rowCount - 1,
    });
  };

  // Add column (+ Tambah Digit / Kolom Grid)
  const handleAddColumn = () => {
    if (gridCols >= 8) return;
    setUserGridCols((prev) => Math.min(8, Math.max(prev, gridCols) + 1));
  };

  // Remove column (- Kurangi Digit / Kolom Grid)
  const handleRemoveColumn = () => {
    if (gridCols <= 1) return;
    const newCols = gridCols - 1;
    setUserGridCols(newCols);
    setOperandActiveCounts((prev) => prev.map((count) => Math.min(count, newCols)));
    setResultActiveCount((prev) => Math.min(prev, newCols));
  };

  // Quick Preset Layouts
  const handleLoadPreset = (preset: 'standard' | 'stair' | 'pyramid' | 'single') => {
    if (preset === 'single') {
      setOperandActiveCounts([1, 2, 3]);
      setResultActiveCount(3);
      setUserGridCols(3);
      onChange({
        ...config,
        rowCount: 3,
        digitCount: 3,
        rowDigits: [1, 2, 3, 3],
      });
    } else if (preset === 'stair') {
      setOperandActiveCounts([1, 2, 3, 4]);
      setResultActiveCount(4);
      setUserGridCols(4);
      onChange({
        ...config,
        rowCount: 4,
        digitCount: 4,
        rowDigits: [1, 2, 3, 4, 4],
      });
    } else if (preset === 'pyramid') {
      setOperandActiveCounts([4, 2, 4]);
      setResultActiveCount(5);
      setUserGridCols(5);
      onChange({
        ...config,
        rowCount: 3,
        digitCount: 5,
        rowDigits: [4, 2, 4, 5],
      });
    } else if (preset === 'standard') {
      setOperandActiveCounts([2, 2]);
      setResultActiveCount(3);
      setUserGridCols(3);
      onChange({
        ...config,
        rowCount: 2,
        digitCount: 3,
        rowDigits: [2, 2, 3],
      });
    }
  };

  // Timer option selection handler
  const handleTimerChange = (mode: 'off' | 'custom') => {
    setTimerMode(mode);
    if (mode === 'off') {
      onChange({ ...config, timerSec: 0 });
    } else if (mode === 'custom') {
      const val = customTimerVal > 0 ? customTimerVal : 1;
      setCustomTimerVal(val);
      onChange({ ...config, timerSec: val });
    }
  };

  const handleCustomTimerInput = (val: number) => {
    const clamped = Math.max(1, Math.min(3600, val));
    setCustomTimerVal(clamped);
    if (timerMode === 'custom') {
      onChange({ ...config, timerSec: clamped });
    }
  };

  const opSymbol = config.operation === '*' ? '×' : config.operation;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* MAIN VISUAL EDITOR CARD */}
      <div
        className="fisma-card rounded-3xl p-5 sm:p-8 border shadow-2xl relative overflow-hidden"
        style={{
          background: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Subtle Ambient Glow */}
        <div
          className="absolute -top-24 -right-24 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: 'var(--primary-accent)' }}
        />

        {/* Card Header */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b"
          style={{ borderColor: 'var(--glass-border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
              style={{
                background: 'var(--button-primary-bg)',
                color: 'var(--button-primary-text)',
              }}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2
                className="text-xl sm:text-2xl font-black tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                Editor Puzzle
              </h2>
              <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                Klik kotak untuk mengaktifkan (<span className="text-emerald-400 font-bold">nyala</span>/
                <span className="opacity-50">mati</span>) digit angka puzzle.
              </p>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase mr-1" style={{ color: 'var(--text-muted)' }}>
              Preset:
            </span>
            <button
              type="button"
              onClick={() => handleLoadPreset('standard')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold border hover:scale-105 transition-all opacity-80 hover:opacity-100"
              style={{ background: 'var(--glass-bg)', borderColor: 'var(--card-border)', color: 'var(--text-primary)' }}
            >
              3x3 Standard
            </button>
            <button
              type="button"
              onClick={() => handleLoadPreset('single')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold border hover:scale-105 transition-all opacity-80 hover:opacity-100"
              style={{ background: 'var(--glass-bg)', borderColor: 'var(--card-border)', color: 'var(--text-primary)' }}
            >
              1-2-3 Digit
            </button>
            <button
              type="button"
              onClick={() => handleLoadPreset('stair')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold border hover:scale-105 transition-all opacity-80 hover:opacity-100"
              style={{ background: 'var(--glass-bg)', borderColor: 'var(--card-border)', color: 'var(--text-primary)' }}
            >
              Tangga
            </button>
          </div>
        </div>

        {/* EDITOR GRID TOOLBAR */}
        <div className="pt-4 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              style={{ color: 'var(--text-muted)' }}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Grid Matrix ({gridCols} Kolom x {rowCount} Baris)</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Operator Switcher */}
            <div
              className="flex items-center gap-1 p-1 rounded-xl border"
              style={{ background: 'var(--glass-bg)', borderColor: 'var(--card-border)' }}
            >
              {[
                { op: '+', label: '➕' },
                { op: '-', label: '➖' },
                { op: '*', label: '✖️' },
              ].map((item) => {
                const isSelected = config.operation === item.op;
                return (
                  <button
                    key={item.op}
                    type="button"
                    onClick={() => {
                      const newOp = item.op as MathOperation;
                      onChange({ ...config, operation: newOp });
                    }}
                    className={`px-2 py-1 rounded-lg font-black text-xs transition-all ${
                      isSelected ? 'shadow-md scale-105 ring-1' : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{
                      background: isSelected ? 'var(--button-primary-bg)' : 'transparent',
                      color: isSelected ? 'var(--button-primary-text)' : 'var(--text-primary)',
                      borderColor: isSelected ? 'var(--primary-accent)' : 'transparent',
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* STATIC DISPLAY CONTAINER FOR PUZZLE MATRIX */}
        <div
          className="relative w-full py-8 my-4 rounded-3xl border overflow-x-auto select-none transition-colors flex items-center justify-center min-h-[380px]"
          style={{
            background: 'var(--glass-bg)',
            borderColor: 'var(--glass-border)',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.04)',
          }}
        >
          {/* Subtle Grid Dot Pattern Background */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle, var(--text-primary) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* PUZZLE CONTENT BLOCK (CENTERED HORIZONTALLY) */}
          <div className="relative z-10 flex flex-col items-center justify-center gap-4 my-auto shrink-0 px-4">
              {/* OPERAND ROWS MATRIX */}
              <AnimatePresence>
                {operandActiveCounts.map((activeCount, rIdx) => {
                  const isLastOperand = rIdx === rowCount - 1;

                  return (
                    <motion.div
                      key={`row-${rIdx}`}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-center gap-3 shrink-0"
                    >
                      {/* Operator Symbol on Left of Last Operand */}
                      {isLastOperand ? (
                        <span
                          className="text-2xl font-black font-mono shrink-0 w-8 text-right"
                          style={{ color: 'var(--primary-accent)' }}
                        >
                          {opSymbol}
                        </span>
                      ) : (
                        <div className="w-8 shrink-0" />
                      )}

                      {/* Row Label Indicator */}
                      <span className="text-xs font-mono font-bold opacity-40 shrink-0 w-6">
                        #{rIdx + 1}
                      </span>

                      {/* Visual Cell Grid (Synchronized gridCols wide) */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        <AnimatePresence>
                          {Array.from({ length: gridCols }).map((_, cIdx) => {
                            const isActive = cIdx < activeCount;

                            return (
                              <motion.button
                                key={`cell-${rIdx}-${cIdx}`}
                                type="button"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.18 }}
                                onClick={() => handleOperandCellClick(rIdx, cIdx)}
                                className={`w-[56px] h-[56px] rounded-2xl border flex flex-col items-center justify-center font-mono font-extrabold text-xl transition-all duration-200 cursor-pointer shrink-0 ${
                                  isActive
                                    ? 'ring-2 ring-offset-2 scale-105 shadow-xl'
                                    : 'opacity-40 hover:opacity-80 hover:scale-105'
                                }`}
                                style={{
                                  background: isActive
                                    ? 'var(--badge-bg)'
                                    : 'var(--card-bg)',
                                  borderColor: isActive
                                    ? 'var(--primary-accent)'
                                    : 'var(--card-border)',
                                  boxShadow: isActive
                                    ? '0 0 20px var(--primary-accent)'
                                    : 'var(--shadow-sm)',
                                  color: isActive
                                    ? 'var(--primary-accent)'
                                    : 'var(--text-muted)',
                                }}
                                title={isActive ? 'Kotak Nyala (Terpilih)' : 'Kotak Mati (Klik untuk Nyala)'}
                              >
                                <span>{isActive ? 'a' : 'b'}</span>
                                <span className="text-[9px] font-sans opacity-60 font-semibold uppercase -mt-1">
                                  {isActive ? 'Nyala' : 'Mati'}
                                </span>
                              </motion.button>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Math Divider Line */}
              <div
                className="w-full h-1 my-1 rounded-full shadow-sm"
                style={{ background: 'var(--primary-accent)' }}
              />

              {/* RESULT ROW DISPLAY */}
              <div className="flex items-center justify-center gap-3 shrink-0">
                <div className="w-8 shrink-0" />
                <span className="text-xs font-mono font-bold opacity-40 shrink-0 w-6">
                  Hasil
                </span>

                <div className="flex items-center gap-2.5 shrink-0">
                  <AnimatePresence>
                    {Array.from({ length: gridCols }).map((_, cIdx) => {
                      const isActive = cIdx < resultActiveCount;

                      return (
                        <motion.button
                          key={`res-cell-${cIdx}`}
                          type="button"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.18 }}
                          onClick={() => handleResultCellClick(cIdx)}
                          className={`w-[56px] h-[56px] rounded-2xl border flex flex-col items-center justify-center font-mono font-black text-xl transition-all duration-200 cursor-pointer shrink-0 ${
                            isActive
                              ? 'ring-2 ring-offset-2 scale-105 shadow-xl'
                              : 'opacity-40 hover:opacity-80 hover:scale-105'
                          }`}
                          style={{
                            background: isActive
                              ? 'var(--badge-bg)'
                              : 'var(--card-bg)',
                            borderColor: isActive
                              ? 'var(--primary-accent)'
                              : 'var(--card-border)',
                            boxShadow: isActive
                              ? '0 0 20px var(--primary-accent)'
                              : 'var(--shadow-sm)',
                            color: isActive
                              ? 'var(--primary-accent)'
                              : 'var(--text-muted)',
                          }}
                          title={isActive ? 'Hasil Nyala' : 'Hasil Mati'}
                        >
                          <span>{isActive ? 'a' : 'b'}</span>
                          <span className="text-[9px] font-sans opacity-60 font-semibold uppercase -mt-1">
                            {isActive ? 'Nyala' : 'Mati'}
                          </span>
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

        {/* OUTSIDE CONTROL BUTTONS (BARIS & DIGIT) */}
        <div className="p-4 rounded-2xl border space-y-3" style={{ background: 'var(--glass-bg)', borderColor: 'var(--card-border)' }}>
          <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
            Pengaturan Grid:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Control Group 1: BARIS OPERAN */}
            <div className="flex items-center justify-between p-3 rounded-xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <div>
                <span className="text-xs font-bold block" style={{ color: 'var(--text-primary)' }}>
                  Jumlah Baris Operan
                </span>
                <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  {rowCount} Baris ({operandActiveCounts.join('-')} Digit)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleRemoveRow}
                  disabled={rowCount <= 2}
                  className="w-9 h-9 rounded-xl border font-black text-xs flex items-center justify-center transition-all disabled:opacity-30 hover:scale-105 active:scale-95"
                  style={{
                    background: 'var(--glass-bg)',
                    borderColor: 'var(--card-border)',
                    color: 'var(--text-primary)',
                  }}
                  title="Hapus Baris terakhir"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleAddRow}
                  disabled={rowCount >= 5}
                  className="w-9 h-9 rounded-xl border font-black text-xs flex items-center justify-center transition-all disabled:opacity-30 hover:scale-105 active:scale-95"
                  style={{
                    background: 'var(--badge-bg)',
                    borderColor: 'var(--primary-accent)',
                    color: 'var(--primary-accent)',
                  }}
                  title="Tambah Baris baru"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Control Group 2: DIGIT / KOLOM GRID */}
            <div className="flex items-center justify-between p-3 rounded-xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <div>
                <span className="text-xs font-bold block" style={{ color: 'var(--text-primary)' }}>
                  Lebar Kolom Digit Matrix
                </span>
                <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  {gridCols} Kolom Digit
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleRemoveColumn}
                  disabled={gridCols <= 1}
                  className="w-9 h-9 rounded-xl border font-black text-xs flex items-center justify-center transition-all disabled:opacity-30 hover:scale-105 active:scale-95"
                  style={{
                    background: 'var(--glass-bg)',
                    borderColor: 'var(--card-border)',
                    color: 'var(--text-primary)',
                  }}
                  title="Kurangi Kolom Digit"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleAddColumn}
                  disabled={gridCols >= 8}
                  className="w-9 h-9 rounded-xl border font-black text-xs flex items-center justify-center transition-all disabled:opacity-30 hover:scale-105 active:scale-95"
                  style={{
                    background: 'var(--badge-bg)',
                    borderColor: 'var(--primary-accent)',
                    color: 'var(--primary-accent)',
                  }}
                  title="Tambah Kolom Digit"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FULL GAMEPLAY OPTIONS (MODE PERMAINAN, TARGET SOAL, TOLERANSI, TIMER) */}
        <div
          className="pt-6 mt-6 border-t space-y-6"
          style={{ borderColor: 'var(--glass-border)' }}
        >
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
            Aturan Permainan:
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. MODE / JUMLAH SOAL */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold block" style={{ color: 'var(--text-primary)' }}>
                Jumlah Soal:
              </label>
              <div className="flex rounded-2xl p-1 border gap-1 min-h-[44px]" style={{ background: 'var(--glass-bg)', borderColor: 'var(--card-border)' }}>
                <button
                  type="button"
                  onClick={() => onChange({ ...config, mode: 'endless' })}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-center min-h-[38px] flex items-center justify-center ${
                    config.mode === 'endless' ? 'shadow-md' : 'opacity-70'
                  }`}
                  style={{
                    background: config.mode === 'endless' ? 'var(--button-primary-bg)' : 'transparent',
                    color: config.mode === 'endless' ? 'var(--button-primary-text)' : 'var(--text-primary)',
                  }}
                >
                  Tanpa Batas
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...config, mode: 'fixed', targetQuestions: config.targetQuestions || 1 })}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-center min-h-[38px] flex items-center justify-center ${
                    config.mode === 'fixed' ? 'shadow-md' : 'opacity-70'
                  }`}
                  style={{
                    background: config.mode === 'fixed' ? 'var(--button-primary-bg)' : 'transparent',
                    color: config.mode === 'fixed' ? 'var(--button-primary-text)' : 'var(--text-primary)',
                  }}
                >
                  Custom
                </button>
              </div>

              {config.mode === 'fixed' && (
                <div className="pt-1.5 space-y-1">
                  <label className="text-[11px] sm:text-xs font-semibold block" style={{ color: 'var(--text-secondary)' }}>
                    Target Jumlah Soal:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={config.targetQuestions || 1}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      onChange({ ...config, targetQuestions: isNaN(val) || val < 1 ? 1 : val });
                    }}
                    className="w-full p-3 rounded-xl text-xs sm:text-sm font-bold border focus:outline-none min-h-[44px]"
                    placeholder="Masukkan jumlah soal (misal: 1)"
                    style={{
                      background: 'var(--glass-bg)',
                      borderColor: 'var(--card-border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              )}
            </div>

            {/* 2. BATAS TOLERANSI KESALAHAN */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold block" style={{ color: 'var(--text-primary)' }}>
                Batas Toleransi Kesalahan:
              </label>
              <div className="flex rounded-2xl p-1 border gap-1 min-h-[44px]" style={{ background: 'var(--glass-bg)', borderColor: 'var(--card-border)' }}>
                <button
                  type="button"
                  onClick={() => onChange({ ...config, toleranceEnabled: false })}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-center min-h-[38px] flex items-center justify-center ${
                    !config.toleranceEnabled ? 'shadow-md' : 'opacity-70'
                  }`}
                  style={{
                    background: !config.toleranceEnabled ? 'var(--button-primary-bg)' : 'transparent',
                    color: !config.toleranceEnabled ? 'var(--button-primary-text)' : 'var(--text-primary)',
                  }}
                >
                  Tanpa Batas
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...config, toleranceEnabled: true, maxTolerance: config.maxTolerance || 1 })}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-center min-h-[38px] flex items-center justify-center ${
                    config.toleranceEnabled ? 'shadow-md' : 'opacity-70'
                  }`}
                  style={{
                    background: config.toleranceEnabled ? 'var(--button-primary-bg)' : 'transparent',
                    color: config.toleranceEnabled ? 'var(--button-primary-text)' : 'var(--text-primary)',
                  }}
                >
                  Custom
                </button>
              </div>

              {config.toleranceEnabled && (
                <div className="pt-1.5 space-y-1">
                  <label className="text-[11px] sm:text-xs font-semibold block" style={{ color: 'var(--text-secondary)' }}>
                    Maksimal Kesalahan:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={config.maxTolerance || 1}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      onChange({ ...config, maxTolerance: isNaN(val) || val < 1 ? 1 : val });
                    }}
                    className="w-full p-3 rounded-xl text-xs sm:text-sm font-bold border focus:outline-none min-h-[44px]"
                    placeholder="Masukkan toleransi gagal (misal: 1)"
                    style={{
                      background: 'var(--glass-bg)',
                      borderColor: 'var(--card-border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              )}
            </div>

            {/* 3. TIMER WAKTU PER SOAL */}
            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <label className="text-xs sm:text-sm font-bold block" style={{ color: 'var(--text-primary)' }}>
                Timer Waktu:
              </label>

              <div className="grid grid-cols-2 gap-2 max-w-md">
                {[
                  { id: 'off', label: 'Tanpa Timer' },
                  { id: 'custom', label: 'Custom' },
                ].map((item) => {
                  const isSelected = timerMode === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleTimerChange(item.id as any)}
                      className={`py-3 px-4 rounded-2xl border text-center font-bold text-xs sm:text-sm transition-all min-h-[44px] flex items-center justify-center ${
                        isSelected ? 'ring-2 scale-[1.02] shadow-sm' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{
                        background: isSelected ? 'var(--badge-bg)' : 'var(--glass-bg)',
                        borderColor: isSelected ? 'var(--primary-accent)' : 'var(--card-border)',
                        color: isSelected ? 'var(--primary-accent)' : 'var(--text-primary)',
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {timerMode === 'custom' && (
                <div className="pt-2 max-w-xs space-y-1">
                  <label className="text-[11px] sm:text-xs font-semibold block" style={{ color: 'var(--text-secondary)' }}>
                    Durasi Timer (Detik):
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={3600}
                    value={customTimerVal || 1}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      handleCustomTimerInput(isNaN(val) || val < 1 ? 1 : val);
                    }}
                    className="w-full p-3 rounded-xl text-xs sm:text-sm font-bold border focus:outline-none min-h-[44px]"
                    placeholder="Contoh: 1"
                    style={{
                      background: 'var(--glass-bg)',
                      borderColor: 'var(--card-border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* START GAME ACTION BUTTON */}
        <div className="pt-6 sm:pt-8">
          <button
            type="button"
            onClick={onStartGame}
            className="fisma-btn-primary w-full py-3.5 sm:py-4 px-5 sm:px-6 rounded-xl sm:rounded-2xl text-sm sm:text-base font-extrabold flex items-center justify-center gap-2.5 sm:gap-3 shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all min-h-[48px]"
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current shrink-0" />
            <span>Mulai Permainan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
