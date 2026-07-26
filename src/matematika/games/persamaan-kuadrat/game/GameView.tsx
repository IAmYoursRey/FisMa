import React from 'react';
import { ArrowLeft, ArrowRight, Swords, BrainCircuit, Flag, LineChart, Target } from 'lucide-react';
import { useGameManager, GameMode } from './GameManager';
import { Difficulty } from './QuestionGenerator';

import { TebakAkarMode } from './modes/TebakAkarMode';
import { PilihMetodeMode } from './modes/PilihMetodeMode';
import { LengkapiLangkahMode } from './modes/LengkapiLangkahMode';
import { TantanganWaktuMode } from './modes/TantanganWaktuMode';
import { AnalisisGrafikMode } from './modes/AnalisisGrafikMode';

interface Props {
  onBack: () => void;
}

export const GameView: React.FC<Props> = ({ onBack }) => {
  const gm = useGameManager();

  const handleFinishTimeAttack = (score: number, correct: number, wrong: number) => {
    // Di sini bisa merangkum hasilnya
    gm.endGame();
  };

  // 1. Tampilan Pilih Mode & Kesulitan
  if (!gm.activeMode) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fade-in min-w-0">
        <button onClick={onBack} className="px-4 py-3 rounded-xl text-sm mb-6 inline-flex items-center gap-2 font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </button>
        <h2 className="text-3xl font-black mb-8 text-[var(--text-primary)]">Pilih Mode Latihan</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ModeCard 
            title="Tebak Akar" 
            desc="Cari nilai akar x₁ dan x₂ dari sebuah persamaan." 
            icon={<Target className="w-6 h-6" />} 
            onClick={() => gm.startGame('tebak-akar', 'mudah')} 
          />
          <ModeCard 
            title="Pilih Metode" 
            desc="Analisis mana metode (Faktorisasi/ABC) yang paling efisien." 
            icon={<BrainCircuit className="w-6 h-6" />} 
            onClick={() => gm.startGame('pilih-metode', 'sedang')} 
          />
          <ModeCard 
            title="Lengkapi Langkah" 
            desc="Isi bagian kosong dari penjabaran rumus panjang." 
            icon={<Flag className="w-6 h-6" />} 
            onClick={() => gm.startGame('lengkapi-langkah', 'sulit')} 
          />
          <ModeCard 
            title="Analisis Grafik" 
            desc="Pahami kurva parabola tanpa menghafal rumus." 
            icon={<LineChart className="w-6 h-6" />} 
            onClick={() => gm.startGame('grafik', 'grafik')} 
          />
          <ModeCard 
            title="Tantangan Waktu" 
            desc="Jawab sebanyak-banyaknya dalam 1 menit." 
            icon={<Swords className="w-6 h-6" />} 
            onClick={() => gm.startGame('waktu', 'mudah')} 
          />
        </div>
      </div>
    );
  }

  // Tampilan Game Over (Time Attack)
  if (gm.isGameOver) {
    return (
      <div className="w-full max-w-xl mx-auto text-center px-4 py-10 animate-fade-in">
        <h2 className="text-4xl font-black mb-4 text-[var(--text-primary)]">Waktu Habis!</h2>
        <div className="fisma-card rounded-3xl p-8 mb-8 border border-[var(--card-border)]">
          <p className="text-6xl font-black text-[var(--primary-accent)] mb-4">{gm.stats.score}</p>
          <div className="flex justify-center gap-6 text-sm font-bold">
            <span className="text-emerald-500">{gm.stats.correctCount} Benar</span>
            <span className="text-red-500">{gm.stats.wrongCount} Salah</span>
          </div>
        </div>
        <button onClick={gm.quitGame} className="fisma-btn-primary px-8 py-4 rounded-xl w-full text-lg">
          Selesai & Kembali
        </button>
      </div>
    );
  }

  // 2. Tampilan Game Aktif
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fade-in min-w-0">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <button onClick={gm.quitGame} className="px-4 py-2 rounded-xl text-sm inline-flex items-center gap-2 font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] border border-transparent hover:border-[var(--card-border)]">
          <ArrowLeft className="w-4 h-4" /> Keluar Latihan
        </button>
        {gm.activeMode !== 'waktu' && (
          <div className="flex items-center gap-4 bg-[var(--bg-secondary)] px-4 py-2 rounded-2xl border border-[var(--card-border)]">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Skor</span>
              <span className="text-lg font-black text-[var(--primary-accent)]">{gm.stats.score}</span>
            </div>
            <div className="w-px h-8 bg-[var(--card-border)]"></div>
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Benar</span>
              <span className="text-lg font-black text-emerald-500">{gm.stats.correctCount}</span>
            </div>
          </div>
        )}
      </div>

      {gm.currentQuestion && (
        <>
          {gm.activeMode === 'tebak-akar' && <TebakAkarMode question={gm.currentQuestion} onCorrect={gm.handleCorrect} onWrong={gm.handleWrong} hintLevel={gm.hintLevel} onUseHint={gm.useHint} />}
          {gm.activeMode === 'pilih-metode' && <PilihMetodeMode question={gm.currentQuestion} onCorrect={gm.handleCorrect} onWrong={gm.handleWrong} />}
          {gm.activeMode === 'lengkapi-langkah' && <LengkapiLangkahMode question={gm.currentQuestion} onCorrect={gm.handleCorrect} onWrong={gm.handleWrong} />}
          {gm.activeMode === 'grafik' && <AnalisisGrafikMode question={gm.currentQuestion} onCorrect={gm.handleCorrect} onWrong={gm.handleWrong} />}
          {gm.activeMode === 'waktu' && <TantanganWaktuMode onFinishTimeAttack={handleFinishTimeAttack} />}
        </>
      )}

      {/* Button Next Question (Khusus bukan Time Attack) */}
      {gm.activeMode !== 'waktu' && (
        <div className="mt-8 flex justify-center">
          <button onClick={gm.nextQuestion} className="fisma-btn-secondary px-8 py-4 rounded-xl flex items-center gap-2 text-lg">
            Soal Selanjutnya <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

// Komponen Pembantu Render Card Mode
const ModeCard = ({ title, desc, icon, onClick }: { title: string, desc: string, icon: React.ReactNode, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="fisma-card text-left p-6 rounded-3xl border border-[var(--card-border)] group hover:border-[var(--primary-accent)] transition-all hover:-translate-y-1"
  >
    <div className="w-12 h-12 bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center text-[var(--primary-accent)] mb-4 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{title}</h3>
    <p className="text-sm font-medium text-[var(--text-secondary)]">{desc}</p>
  </button>
);
