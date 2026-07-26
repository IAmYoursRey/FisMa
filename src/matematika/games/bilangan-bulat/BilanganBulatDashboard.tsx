import React, { useState } from 'react';
import {
  ArrowLeft,
  Play,
  Cpu,
  Trophy,
  Zap,
  BookOpen,
  HelpCircle,
  Sliders,
  Check,
  Layers,
  Sparkles,
  Plus,
  Minus,
} from 'lucide-react';
import { GameConfig, DEFAULT_CONFIG, loadSavedStats, OperationType } from './game/GameManager';

interface BilanganBulatDashboardProps {
  onStartGame: (config: GameConfig) => void;
  onOpenSolver: () => void;
  onBackToDashboard: () => void;
}

export const BilanganBulatDashboard: React.FC<BilanganBulatDashboardProps> = ({
  onStartGame,
  onOpenSolver,
  onBackToDashboard,
}) => {
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
  const [difficulty, setDifficulty] = useState<'mudah' | 'sedang' | 'sulit' | 'custom'>(
    'mudah'
  );
  const [savedStats] = useState(() => loadSavedStats());

  const handleDifficultyPreset = (preset: 'mudah' | 'sedang' | 'sulit' | 'custom') => {
    setDifficulty(preset);
    let min = -10;
    let max = 10;
    if (preset === 'sedang') {
      min = -50;
      max = 50;
    } else if (preset === 'sulit') {
      min = -100;
      max = 100;
    }
    if (preset !== 'custom') {
      setConfig((prev) => ({
        ...prev,
        useMinRange: true,
        minRange: min,
        useMaxRange: true,
        maxRange: max,
        boxes: (prev.boxes || []).map((b) => ({ ...b, minRange: min, maxRange: max })),
      }));
    }
  };

  const handleAddBox = () => {
    setDifficulty('custom');
    setConfig((prev) => {
      const currentBoxes = prev.boxes || [];
      if (currentBoxes.length >= 6) return prev; // limit max 6 boxes
      const nextChar = String.fromCharCode(65 + currentBoxes.length); // 'A', 'B', 'C', 'D'...
      const newBox = {
        id: nextChar,
        label: `Kotak ${nextChar}`,
        enabled: true,
        minRange: -10,
        maxRange: 10,
      };
      return { ...prev, boxes: [...currentBoxes, newBox] };
    });
  };

  const handleRemoveBox = () => {
    setDifficulty('custom');
    setConfig((prev) => {
      const currentBoxes = prev.boxes || [];
      if (currentBoxes.length <= 2) return prev; // min 2 boxes
      return { ...prev, boxes: currentBoxes.slice(0, -1) };
    });
  };

  const handleToggleBox = (boxId: string) => {
    setDifficulty('custom');
    setConfig((prev) => {
      const updated = prev.boxes.map((b) => {
        if (b.id === boxId) return { ...b, enabled: !b.enabled };
        return b;
      });
      return { ...prev, boxes: updated };
    });
  };

  const handleBoxRangeChange = (boxId: string, field: 'minRange' | 'maxRange', value: number) => {
    setDifficulty('custom');
    setConfig((prev) => {
      const updated = prev.boxes.map((b) => {
        if (b.id === boxId) {
          let newValue = value;
          if (field === 'minRange') {
            newValue = Math.min(newValue, 0);
          } else {
            newValue = Math.max(newValue, 0);
          }
          return { ...b, [field]: newValue };
        }
        return b;
      });
      return { ...prev, boxes: updated };
    });
  };

  const handleToggleOperation = (op: OperationType) => {
    setConfig((prev) => {
      const exists = prev.operations.includes(op);
      let updated = exists
        ? prev.operations.filter((o) => o !== op)
        : [...prev.operations, op];

      if (updated.length === 0) updated = ['+']; // Keep at least one
      return { ...prev, operations: updated };
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-8 animate-fade-in">
      {/* Top Header Navigation */}
      <div
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 border-b"
        style={{ borderColor: 'var(--glass-border)' }}
      >
        <button
          onClick={onBackToDashboard}
          className="fisma-btn-secondary px-4 py-3 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center sm:justify-start gap-2 shadow-sm transition-transform active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Kembali</span>
        </button>

        {/* Tab Selector */}
        <div
          className="p-1 rounded-2xl border flex items-center justify-center gap-1 w-full sm:w-auto"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        >
          <button
            className={`flex-1 sm:flex-initial px-4 py-2.5 min-h-[42px] rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md scale-[1.02]`}
            style={{
              background: 'var(--button-primary-bg)',
              color: 'var(--button-primary-text)',
            }}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Game</span>
          </button>

          <button
            onClick={onOpenSolver}
            className={`flex-1 sm:flex-initial px-4 py-2.5 min-h-[42px] rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5`}
            style={{
              background: 'transparent',
              color: 'var(--text-primary)',
            }}
          >
            <Cpu className="w-4 h-4 shrink-0" />
            <span>Solver</span>
          </button>
        </div>
      </div>

      {/* Stats Summary & Rules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Stat Card 1 */}
        <div
          className="fisma-card p-5 rounded-2xl border flex items-center gap-4"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'var(--badge-bg)', color: 'var(--primary-accent)' }}
          >
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold block" style={{ color: 'var(--text-muted)' }}>
              Skor Tertinggi
            </span>
            <span className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
              {savedStats.highScore} Poin
            </span>
          </div>
        </div>


      </div>

      {/* Game Configuration Form */}
      <div
        className="fisma-card p-6 sm:p-8 rounded-3xl border space-y-6 shadow-xl"
        style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      >
        <div className="flex items-center gap-3 border-b pb-4" style={{ borderColor: 'var(--glass-border)' }}>
          <Sliders className="w-5 h-5" style={{ color: 'var(--primary-accent)' }} />
          <h2 className="text-lg sm:text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            Pengaturan Permainan
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Tingkat Kesulitan Preset & Custom Rentang Kotak (a v a v a...) */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs sm:text-sm font-bold block" style={{ color: 'var(--text-primary)' }}>
                  Rentang Angka & Kotak:
                </label>
                <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  Sesuaikan batas kotak angka.
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                {/* Preset Kesulitan */}
                <div
                  className="grid grid-cols-4 gap-1 p-1 rounded-2xl border min-h-[40px] w-full sm:w-auto shrink-0"
                  style={{ background: 'var(--glass-bg)', borderColor: 'var(--card-border)' }}
                >
                  {[
                    { id: 'mudah', label: 'Mudah' },
                    { id: 'sedang', label: 'Sedang' },
                    { id: 'sulit', label: 'Sulit' },
                    { id: 'custom', label: 'Custom' },
                  ].map((item) => {
                    const isSelected = difficulty === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleDifficultyPreset(item.id as any)}
                        className={`py-1 px-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center ${
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

                {/* Tombol Tambah / Hapus Kotak (a) */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleAddBox}
                    disabled={(config.boxes || []).length >= 6}
                    className="p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-40 min-h-[40px] shadow-sm hover:scale-105"
                    style={{
                      background: 'var(--button-primary-bg)',
                      borderColor: 'var(--card-border)',
                      color: 'var(--button-primary-text)',
                    }}
                    title="Tambah Kotak Angka"
                  >
                    <Plus className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">Tambah</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveBox}
                    disabled={(config.boxes || []).length <= 2}
                    className="p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-40 min-h-[40px] opacity-80 hover:opacity-100"
                    style={{
                      background: 'var(--glass-bg)',
                      borderColor: 'var(--card-border)',
                      color: 'var(--text-primary)',
                    }}
                    title="Hapus Kotak Angka Terakhir"
                  >
                    <Minus className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">Hapus</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Visual Formula Chain Display */}
            <div
              className="p-4 rounded-3xl border shadow-inner space-y-4"
              style={{ background: 'var(--glass-bg)', borderColor: 'var(--card-border)' }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                <span className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <span>Jumlah Operasi:</span>
                  <span className="px-2 py-0.5 rounded-md font-mono text-[11px]" style={{ background: 'var(--badge-bg)', color: 'var(--primary-accent)' }}>
                    {(config.boxes || []).length} Term Aktif
                  </span>
                </span>
                
                <div className="flex items-center gap-1 font-mono text-xs overflow-x-auto py-1">
                  {(config.boxes || []).map((box, idx) => {
                    const isLast = idx === (config.boxes || []).length - 1;
                    return (
                      <React.Fragment key={box.id}>
                        <span
                          className="px-2 py-1 rounded-lg border font-bold transition-all shadow-sm"
                          style={{
                            background: 'var(--card-bg)',
                            borderColor: 'var(--primary-accent)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          [{idx + 1}]
                        </span>
                        {!isLast && (
                          <span className="font-black px-1" style={{ color: 'var(--primary-accent)' }}>
                            {config.operations.length > 1 ? '±' : config.operations[0]}
                          </span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Boxes Row (Horizontal Scrollable Side-by-Side) */}
              <div className="relative">
                <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 px-1 custom-scrollbar scroll-smooth">
                  {(config.boxes || []).map((box, idx) => {
                    const isLast = idx === (config.boxes || []).length - 1;
                    return (
                      <React.Fragment key={box.id}>
                        {/* Single Box Card */}
                        <div
                          className="min-w-[170px] max-w-[190px] shrink-0 p-3 rounded-2xl border transition-all space-y-3 relative shadow-md"
                          style={{
                            background: 'var(--card-bg)',
                            borderColor: 'var(--primary-accent)',
                          }}
                        >
                          <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--glass-border)' }}>
                            <span className="text-xs font-black uppercase tracking-wide" style={{ color: 'var(--primary-accent)' }}>
                              Kotak {idx + 1}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400/20 text-amber-400 border border-amber-400/30">
                              Aktif
                            </span>
                          </div>

                          <div className="space-y-3">
                            {/* Batas Min Position */}
                            <div className="flex flex-col">
                              <label className="text-[10px] font-bold block mb-1" style={{ color: 'var(--text-secondary)' }}>
                                Batas Negatif (-)
                              </label>
                              <div
                                className="flex items-center w-full rounded-xl border p-1"
                                style={{ background: 'var(--glass-bg)', borderColor: 'var(--card-border)' }}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleBoxRangeChange(box.id, 'minRange', box.minRange - 1)}
                                  className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center font-black text-sm transition-all shadow-sm active:scale-95"
                                  style={{ background: 'var(--button-primary-bg)', color: 'var(--button-primary-text)' }}
                                  title="Kurangi Batas Min"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  value={box.minRange}
                                  onChange={(e) =>
                                    handleBoxRangeChange(box.id, 'minRange', parseInt(e.target.value, 10) || 0)
                                  }
                                  className="w-full min-w-0 text-center font-extrabold text-sm bg-transparent focus:outline-none px-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  style={{ color: 'var(--text-primary)' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleBoxRangeChange(box.id, 'minRange', box.minRange + 1)}
                                  className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center font-black text-sm transition-all shadow-sm active:scale-95"
                                  style={{ background: 'var(--button-primary-bg)', color: 'var(--button-primary-text)' }}
                                  title="Tambah Batas Min"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Batas Max Position */}
                            <div className="flex flex-col">
                              <label className="text-[10px] font-bold block mb-1" style={{ color: 'var(--text-secondary)' }}>
                                Batas Positif (+)
                              </label>
                              <div
                                className="flex items-center w-full rounded-xl border p-1"
                                style={{ background: 'var(--glass-bg)', borderColor: 'var(--card-border)' }}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleBoxRangeChange(box.id, 'maxRange', box.maxRange - 1)}
                                  className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center font-black text-sm transition-all shadow-sm active:scale-95"
                                  style={{ background: 'var(--button-primary-bg)', color: 'var(--button-primary-text)' }}
                                  title="Kurangi Batas Max"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  value={box.maxRange}
                                  onChange={(e) =>
                                    handleBoxRangeChange(box.id, 'maxRange', parseInt(e.target.value, 10) || 0)
                                  }
                                  className="w-full min-w-0 text-center font-extrabold text-sm bg-transparent focus:outline-none px-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  style={{ color: 'var(--text-primary)' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleBoxRangeChange(box.id, 'maxRange', box.maxRange + 1)}
                                  className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center font-black text-sm transition-all shadow-sm active:scale-95"
                                  style={{ background: 'var(--button-primary-bg)', color: 'var(--button-primary-text)' }}
                                  title="Tambah Batas Max"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Inter-Box Operator Badge */}
                        {!isLast && (
                          <div className="shrink-0 flex flex-col items-center justify-center px-1">
                            <div
                              className="w-9 h-9 rounded-xl border flex items-center justify-center font-mono font-black text-base shadow-sm animate-pulse"
                              style={{
                                background: 'var(--button-primary-bg)',
                                borderColor: 'var(--card-border)',
                                color: 'var(--button-primary-text)',
                              }}
                              title="Operasi di antara kotak"
                            >
                              {config.operations.length > 1
                                ? '±'
                                : config.operations[0] === '+'
                                ? '+'
                                : config.operations[0] === '-'
                                ? '−'
                                : config.operations[0] === '*'
                                ? '×'
                                : '÷'}
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
                <div className="text-[10px] text-right font-medium italic mt-1" style={{ color: 'var(--text-muted)' }}>
                  ↔ Geser ke samping untuk melihat / mengatur kotak lainnya
                </div>
              </div>
            </div>
          </div>

          {/* 2. Operasi Matematika */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-bold block" style={{ color: 'var(--text-primary)' }}>
              Operasi Matematika:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { op: '+', label: '+ Tambah' },
                { op: '-', label: '− Kurang' },
                { op: '*', label: '× Kali' },
                { op: '/', label: '÷ Bagi' },
              ].map((item) => {
                const isChecked = config.operations.includes(item.op as OperationType);
                return (
                  <button
                    key={item.op}
                    type="button"
                    onClick={() => handleToggleOperation(item.op as OperationType)}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1.5 min-h-[42px] ${
                      isChecked ? 'shadow-md scale-[1.02]' : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{
                      background: isChecked ? 'var(--badge-bg)' : 'var(--glass-bg)',
                      borderColor: isChecked ? 'var(--primary-accent)' : 'var(--card-border)',
                      color: isChecked ? 'var(--primary-accent)' : 'var(--text-primary)',
                    }}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 shrink-0" />}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Target Jumlah Soal */}
          <div className="space-y-2 md:col-span-1">
            <label className="text-xs sm:text-sm font-bold block" style={{ color: 'var(--text-primary)' }}>
              Target Jumlah Soal:
            </label>
            <div
              className="flex rounded-2xl p-1 border gap-1 min-h-[44px]"
              style={{ background: 'var(--glass-bg)', borderColor: 'var(--card-border)' }}
            >
              <button
                type="button"
                onClick={() => setConfig((prev) => ({ ...prev, questionCountMode: 'endless' }))}
                className={`flex-1 py-2 px-2 sm:px-3 rounded-xl text-[10px] sm:text-sm font-bold transition-all text-center min-h-[38px] flex items-center justify-center ${
                  config.questionCountMode === 'endless' ? 'shadow-md' : 'opacity-70'
                }`}
                style={{
                  background: config.questionCountMode === 'endless' ? 'var(--button-primary-bg)' : 'transparent',
                  color: config.questionCountMode === 'endless' ? 'var(--button-primary-text)' : 'var(--text-primary)',
                }}
              >
                Tanpa Batas
              </button>
              <button
                type="button"
                onClick={() =>
                  setConfig((prev) => ({
                    ...prev,
                    questionCountMode: 'fixed',
                    targetQuestions: prev.targetQuestions || 1,
                  }))
                }
                className={`flex-1 py-2 px-2 sm:px-3 rounded-xl text-[10px] sm:text-sm font-bold transition-all text-center min-h-[38px] flex items-center justify-center ${
                  config.questionCountMode === 'fixed' ? 'shadow-md' : 'opacity-70'
                }`}
                style={{
                  background: config.questionCountMode === 'fixed' ? 'var(--button-primary-bg)' : 'transparent',
                  color: config.questionCountMode === 'fixed' ? 'var(--button-primary-text)' : 'var(--text-primary)',
                }}
              >
                Custom
              </button>
            </div>

            {config.questionCountMode === 'fixed' && (
              <div className="pt-2 space-y-1">
                <label className="text-[11px] font-semibold block" style={{ color: 'var(--text-secondary)' }}>
                  Jumlah Soal:
                </label>
                <div
                  className="flex items-center w-full rounded-xl border p-1"
                  style={{ background: 'var(--glass-bg)', borderColor: 'var(--card-border)' }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        targetQuestions: Math.max(1, (prev.targetQuestions || 1) - 1),
                      }))
                    }
                    className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center font-black text-base transition-all hover:scale-105 active:scale-95"
                    style={{ background: 'var(--button-primary-bg)', color: 'var(--button-primary-text)' }}
                    title="Kurangi Soal"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={config.targetQuestions || 1}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setConfig((prev) => ({
                        ...prev,
                        targetQuestions: isNaN(val) || val < 1 ? 1 : val,
                      }));
                    }}
                    className="w-full text-center font-extrabold text-sm bg-transparent focus:outline-none px-2 min-h-[36px]"
                    style={{ color: 'var(--text-primary)' }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        targetQuestions: (prev.targetQuestions || 1) + 1,
                      }))
                    }
                    className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center font-black text-base transition-all hover:scale-105 active:scale-95"
                    style={{ background: 'var(--button-primary-bg)', color: 'var(--button-primary-text)' }}
                    title="Tambah Soal"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. Timer Per Soal */}
          <div className="space-y-2 md:col-span-1">
            <label className="text-xs sm:text-sm font-bold block" style={{ color: 'var(--text-primary)' }}>
              Timer Per Soal:
            </label>

            <div
              className="flex rounded-2xl p-1 border gap-1 min-h-[44px]"
              style={{ background: 'var(--glass-bg)', borderColor: 'var(--card-border)' }}
            >
              <button
                type="button"
                onClick={() => setConfig((prev) => ({ ...prev, useTimeLimit: false, timeLimitSec: 0 }))}
                className={`flex-1 py-2 px-2 sm:px-3 rounded-xl text-[10px] sm:text-sm font-bold transition-all text-center min-h-[38px] flex items-center justify-center ${
                  !config.useTimeLimit || config.timeLimitSec === 0 ? 'shadow-md' : 'opacity-70'
                }`}
                style={{
                  background: !config.useTimeLimit || config.timeLimitSec === 0 ? 'var(--button-primary-bg)' : 'transparent',
                  color: !config.useTimeLimit || config.timeLimitSec === 0 ? 'var(--button-primary-text)' : 'var(--text-primary)',
                }}
              >
                Tanpa Timer
              </button>
              <button
                type="button"
                onClick={() =>
                  setConfig((prev) => ({
                    ...prev,
                    useTimeLimit: true,
                    timeLimitSec: prev.timeLimitSec > 0 ? prev.timeLimitSec : 1,
                  }))
                }
                className={`flex-1 py-2 px-2 sm:px-3 rounded-xl text-[10px] sm:text-sm font-bold transition-all text-center min-h-[38px] flex items-center justify-center ${
                  config.useTimeLimit && config.timeLimitSec > 0 ? 'shadow-md' : 'opacity-70'
                }`}
                style={{
                  background: config.useTimeLimit && config.timeLimitSec > 0 ? 'var(--button-primary-bg)' : 'transparent',
                  color: config.useTimeLimit && config.timeLimitSec > 0 ? 'var(--button-primary-text)' : 'var(--text-primary)',
                }}
              >
                Custom
              </button>
            </div>

            {config.useTimeLimit && config.timeLimitSec > 0 && (
              <div className="pt-2 space-y-1">
                <label className="text-[11px] font-semibold block" style={{ color: 'var(--text-secondary)' }}>
                  Durasi (Detik):
                </label>
                <div
                  className="flex items-center w-full rounded-xl border p-1"
                  style={{ background: 'var(--glass-bg)', borderColor: 'var(--card-border)' }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        timeLimitSec: Math.max(1, prev.timeLimitSec - 1),
                      }))
                    }
                    className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center font-black text-base transition-all hover:scale-105 active:scale-95"
                    style={{ background: 'var(--button-primary-bg)', color: 'var(--button-primary-text)' }}
                    title="Kurangi Detik"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={3600}
                    value={config.timeLimitSec || 1}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setConfig((prev) => ({
                        ...prev,
                        timeLimitSec: isNaN(val) || val < 1 ? 1 : val,
                      }));
                    }}
                    className="w-full text-center font-extrabold text-sm bg-transparent focus:outline-none px-2 min-h-[36px]"
                    style={{ color: 'var(--text-primary)' }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        timeLimitSec: prev.timeLimitSec + 1,
                      }))
                    }
                    className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center font-black text-base transition-all hover:scale-105 active:scale-95"
                    style={{ background: 'var(--button-primary-bg)', color: 'var(--button-primary-text)' }}
                    title="Tambah Detik"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Start Game Action Button */}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => onStartGame(config)}
            className="fisma-btn-primary w-full py-3.5 sm:py-4 px-6 rounded-xl sm:rounded-2xl text-sm sm:text-base font-extrabold flex items-center justify-center gap-3 shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all min-h-[48px]"
          >
            <Play className="w-5 h-5 fill-current shrink-0" />
            <span>Mulai Permainan</span>
          </button>
        </div>
      </div>

      {/* Cara Bermain Guidance */}
      <div
        className="p-6 rounded-3xl border space-y-3"
        style={{ background: 'var(--badge-bg)', borderColor: 'var(--card-border)' }}
      >
        <h3 className="text-sm font-extrabold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Aturan & Petunjuk Bermain:</span>
        </h3>
        <ul className="text-xs space-y-2 list-disc list-inside" style={{ color: 'var(--text-secondary)' }}>
          <li>
            <b>Input Jawaban:</b> Gunakan Virtual Keypad di layar HP/Tablet atau tombol keyboard angka pada PC/Laptop.
          </li>
          <li>
            <b>Tanda Negatif (−):</b> Tekan tombol <code className="px-1.5 py-0.5 rounded bg-black/20 font-bold text-amber-400">-</code> untuk memasukkan nilai negatif.
          </li>
          <li>
            <b>Streak Bonus:</b> Menjawab berturut-turut tanpa salah memberikan multiplier skor ekstra!
          </li>
          <li>
            <b>Bot Solver:</b> Jika ragu dengan konsep perkalian/pengurangan negatif, buka menu Bot Solver untuk melihat diagram Garis Bilangan & penjelasan tiap langkah.
          </li>
        </ul>
      </div>
    </div>
  );
};
