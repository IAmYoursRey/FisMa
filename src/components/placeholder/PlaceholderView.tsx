import React, { useState } from 'react';
import {
  ArrowLeft,
  Atom,
  Layers,
  Sparkles,
  Construction,
  Gamepad2,
  Calculator,
  Trophy,
  CheckCircle2,
  Play,
  Puzzle,
  Zap,
  Cpu,
} from 'lucide-react';
import { useTheme } from '../../services/themeService';
import { CryptarithmGame } from '../../matematika/games/cryptarithm/CryptarithmGame';
import { BilanganBulatModule } from '../../matematika/games/bilangan-bulat/BilanganBulatModule';

interface PlaceholderViewProps {
  subject: 'fisika' | 'matematika';
  onBackToDashboard: () => void;
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({
  subject,
  onBackToDashboard,
}) => {
  const { theme } = useTheme();
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const isPhysics = subject === 'fisika';

  // Active game router
  if (activeGame === 'cryptarithm') {
    return <CryptarithmGame onBackToDashboard={() => setActiveGame(null)} />;
  }

  if (activeGame === 'bilangan-bulat') {
    return <BilanganBulatModule onBackToDashboard={() => setActiveGame(null)} />;
  }

  const details = isPhysics
    ? {
        title: 'Modul Pembelajaran Fisika',
        subtitle: 'Laboratorium & Game Edukasi Simulasi Fisika',
        icon: Atom,
        color: 'var(--primary-accent)',
        activeGames: [],
        plannedGames: [
          'Simulasi Gerak Lurus (GLB & GLBB)',
          'Hukum Newton & Gesekan',
          'Optika & Pembiasan Cahaya',
          'Termodinamika & Kalor',
          'Rangkaian Listrik Dinamis',
        ],
        plannedSolvers: [
          'Solver Vektor 2D & 3D',
          'Kalkulator Kinematika Otomatis',
          'Kalkulator Energi & Usaha',
        ],
      }
    : {
        title: 'Modul Pembelajaran Matematika',
        subtitle: 'Game Logika & Solver Aljabar Interaktif',
        icon: Layers,
        color: 'var(--primary-accent)',
        activeGames: [
          {
            id: 'cryptarithm',
            title: 'Cryptarithm Master',
            subtitle: 'Teka-Teki Logika Angka & Bot Solver Otomatis',
            icon: Puzzle,
            badge: 'READY TO PLAY',
          },
          {
            id: 'bilangan-bulat',
            title: 'Bilangan Bulat Master',
            subtitle: 'Latihan Operasi Hitung Bulat & Solver Garis Bilangan Step-by-Step',
            icon: Zap,
            badge: 'NEW GAME',
          },
        ],
        plannedGames: [
          'Teka-Teki Persamaan Kuadrat',
          'Lab Geometri & Trigonometri',
          'Petualangan Logika & Himpunan',
          'Tantangan Kalkulus Turunan',
        ],
        plannedSolvers: [
          'Step-by-Step Solver Aljabar',
          'Visualizer Grafik Fungsi',
          'Kalkulator Matriks & Determinant',
        ],
      };

  const IconComponent = details.icon;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={onBackToDashboard}
        className="fisma-btn-secondary px-4 py-2.5 rounded-xl text-sm mb-8 inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Dashboard Utama
      </button>

      {/* Header Banner */}
      <div
        className="fisma-card rounded-2xl p-8 sm:p-10 mb-8 border relative overflow-hidden"
        style={{
          background: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
        }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl"
              style={{
                background: 'var(--button-primary-bg)',
                boxShadow: 'var(--accent-glow)',
              }}
            >
              <IconComponent className="w-8 h-8 text-[var(--button-primary-text)]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                  style={{
                    background: 'var(--badge-bg)',
                    color: 'var(--badge-text)',
                  }}
                >
                  <Construction className="w-3.5 h-3.5" />
                  Modul Interaktif FisMa
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Phase 2 - Live Games & Solvers
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {details.title}
              </h1>
              <p className="text-base mt-1" style={{ color: 'var(--text-secondary)' }}>
                {details.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onBackToDashboard}
            className="fisma-btn-primary px-6 py-3 rounded-xl text-sm font-bold"
          >
            Pilih Modul Lain
          </button>
        </div>
      </div>

      {/* ACTIVE READY GAMES SECTION (IF ANY) */}
      {!isPhysics && details.activeGames.length > 0 && (
        <div className="mb-10 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{ color: 'var(--primary-accent)' }} />
            <h2 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Game & Solver Siap Dimainkan
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {details.activeGames.map((game) => {
              const GameIcon = game.icon;
              return (
                <div
                  key={game.id}
                  onClick={() => setActiveGame(game.id)}
                  className="fisma-card rounded-2xl p-6 border cursor-pointer group relative overflow-hidden flex flex-col justify-between transition-all hover:scale-[1.02]"
                  style={{
                    background: 'var(--card-bg)',
                    borderColor: 'var(--primary-accent)',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                        style={{ background: 'var(--button-primary-bg)', color: 'var(--button-primary-text)' }}
                      >
                        <GameIcon className="w-6 h-6" />
                      </div>

                      <span
                        className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
                        style={{
                          background: 'var(--badge-bg)',
                          color: 'var(--primary-accent)',
                          border: '1px solid var(--primary-accent)',
                        }}
                      >
                        {game.badge}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>
                      {game.title}
                    </h3>
                    <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                      {game.subtitle}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="fisma-btn-primary w-full py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 mt-4"
                  >
                    <Play className="w-4 h-4 fill-current shrink-0" />
                    <span>Mainkan {game.title}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Content Roadmap Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Planned Games */}
        <div className="fisma-card p-6 rounded-2xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="p-2.5 rounded-xl"
              style={{ background: 'var(--badge-bg)', color: 'var(--badge-text)' }}
            >
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                Rencana Game Edukasi Lainnya
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Akan dibangun pada tahap berikutnya
              </p>
            </div>
          </div>

          <ul className="space-y-3">
            {details.plannedGames.map((game, idx) => (
              <li
                key={idx}
                className="p-3 rounded-xl border flex items-center justify-between text-sm"
                style={{
                  background: 'var(--glass-bg)',
                  borderColor: 'var(--glass-border)',
                }}
              >
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {game}
                </span>
                <span className="text-xs font-mono font-bold" style={{ color: 'var(--primary-accent)' }}>
                  [Planned]
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Planned Solvers */}
        <div className="fisma-card p-6 rounded-2xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="p-2.5 rounded-xl"
              style={{ background: 'var(--badge-bg)', color: 'var(--badge-text)' }}
            >
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                Rencana Solver Interaktif
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Mesin perhitungan & langkah penyelesaian
              </p>
            </div>
          </div>

          <ul className="space-y-3">
            {details.plannedSolvers.map((solver, idx) => (
              <li
                key={idx}
                className="p-3 rounded-xl border flex items-center justify-between text-sm"
                style={{
                  background: 'var(--glass-bg)',
                  borderColor: 'var(--glass-border)',
                }}
              >
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {solver}
                </span>
                <span className="text-xs font-mono font-bold" style={{ color: 'var(--primary-accent)' }}>
                  [Planned]
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Info Notice */}
      <div
        className="p-6 rounded-2xl border flex items-start gap-4"
        style={{
          background: 'var(--badge-bg)',
          borderColor: 'var(--card-border)',
        }}
      >
        <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" style={{ color: 'var(--primary-accent)' }} />
        <div className="text-sm space-y-1" style={{ color: 'var(--text-primary)' }}>
          <p className="font-bold">Game Cryptarithm Siap Dimainkan!</p>
          <p style={{ color: 'var(--text-secondary)' }}>
            Modul <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-black/20">matematika/games/cryptarithm</code> telah terintegrasi dengan Theme System FisMa, validasi angka ganda, toleransi batas kesalahan, timer waktu, serta bot solver otomatis.
          </p>
        </div>
      </div>
    </div>
  );
};
