import React from 'react';
import { ArrowLeft, Play, Calculator, Target, Trophy, Clock, Sigma } from 'lucide-react';

interface Props {
  onBack: () => void;
  onStartGame: () => void;
  onOpenSolver: () => void;
}

export const PersamaanKuadratDashboard: React.FC<Props> = ({
  onBack,
  onStartGame,
  onOpenSolver,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fade-in min-w-0">
      <button
        onClick={onBack}
        className="px-4 py-3 min-h-[48px] rounded-xl text-sm mb-6 inline-flex items-center gap-2 font-bold transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] active:scale-95"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Matematika
      </button>

      {/* Banner Area */}
      <div className="fisma-card rounded-3xl p-6 sm:p-10 mb-8 relative overflow-hidden border">
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none" style={{ background: 'var(--primary-accent)' }} />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--primary-accent)]/10">
                <Sigma className="w-6 h-6 text-[var(--primary-accent)]" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider border bg-[var(--badge-bg)] text-[var(--badge-text)] border-[var(--card-border)] uppercase">
                Modul Matematika
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black mb-4 text-[var(--text-primary)] tracking-tight">
              Persamaan <span className="text-[var(--primary-accent)]">Kuadrat</span>
            </h1>
            <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-xl leading-relaxed">
              Kuasai analisis kurva parabola, rumus ABC, faktorisasi, dan nilai diskriminan melalui mode latihan adaptif dan solver pintar (Virtual Teacher).
            </p>
          </div>

          <div className="flex flex-col w-full md:w-auto gap-3 shrink-0">
            <button
              onClick={onStartGame}
              className="fisma-btn-primary px-8 py-4 min-h-[56px] rounded-2xl flex items-center justify-center gap-3 w-full sm:w-auto transition-transform hover:scale-105"
            >
              <Play className="w-5 h-5 fill-current" />
              <span className="text-base">Mulai Latihan</span>
            </button>
            <button
              onClick={onOpenSolver}
              className="fisma-btn-secondary px-8 py-4 min-h-[56px] rounded-2xl flex items-center justify-center gap-3 w-full sm:w-auto transition-transform hover:scale-105"
            >
              <Calculator className="w-5 h-5" />
              <span className="text-base">Buka Virtual Solver</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Statistik */}
        <div className="fisma-card rounded-2xl p-6 border flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center shrink-0">
            <Target className="w-5 h-5 text-[var(--primary-accent)]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-secondary)]">Akurasi Rata-rata</h3>
            <p className="text-2xl font-black text-[var(--text-primary)] mt-1">0%</p>
          </div>
        </div>

        <div className="fisma-card rounded-2xl p-6 border flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-[var(--primary-accent)]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-secondary)]">Soal Terjawab</h3>
            <p className="text-2xl font-black text-[var(--text-primary)] mt-1">0 <span className="text-sm font-medium text-[var(--text-secondary)]">Benar</span></p>
          </div>
        </div>

        <div className="fisma-card rounded-2xl p-6 border flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-[var(--primary-accent)]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-secondary)]">Waktu Terbaik</h3>
            <p className="text-2xl font-black text-[var(--text-primary)] mt-1">--:--</p>
          </div>
        </div>
      </div>

      <div className="fisma-card rounded-3xl p-8 border">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[var(--text-primary)]">
          Cara Bermain & Fitur
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="font-bold text-[var(--primary-accent)]">5 Mode Permainan</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Tebak Akar, Pilih Metode, Lengkapi Langkah, Tantangan Waktu, dan Analisis Grafik. Dirancang otomatis dengan ribuan variasi soal.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-[var(--primary-accent)]">Virtual Teacher (Solver)</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Bukan sekadar kalkulator. Solver menjelaskan langkah demi langkah (faktorisasi, rumus ABC, diskriminan) dengan narasi mudah dipahami.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
