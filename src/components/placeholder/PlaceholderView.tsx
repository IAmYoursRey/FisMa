import React, { useState } from 'react';
import {
  ArrowLeft,
  Atom,
  Layers,
  Sparkles,
  Gamepad2,
  Calculator,
  Play,
  Puzzle,
  Zap,
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

  if (activeGame === 'cryptarithm') {
    return <CryptarithmGame onBackToDashboard={() => setActiveGame(null)} />;
  }

  if (activeGame === 'bilangan-bulat') {
    return <BilanganBulatModule onBackToDashboard={() => setActiveGame(null)} />;
  }

  const details = isPhysics
    ? {
        title: 'Fisika',
        subtitle: 'Laboratorium & Simulasi',
        icon: Atom,
        activeGames: [],
        plannedGames: [
          'Gerak Lurus (GLB & GLBB)',
          'Hukum Newton',
          'Optika & Cahaya',
          'Termodinamika',
        ],
        plannedSolvers: [
          'Vektor 2D & 3D',
          'Kalkulator Kinematika',
        ],
      }
    : {
        title: 'Matematika',
        subtitle: 'Game Logika & Solver',
        icon: Layers,
        activeGames: [
          {
            id: 'cryptarithm',
            title: 'Cryptarithm',
            subtitle: 'Teka-Teki Logika Angka',
            icon: Puzzle,
            badge: 'Live',
          },
          {
            id: 'bilangan-bulat',
            title: 'Bilangan Bulat',
            subtitle: 'Latihan Operasi Hitung',
            icon: Zap,
            badge: 'Preview',
          },
        ],
        plannedGames: [
          'Persamaan Kuadrat',
          'Lab Geometri',
          'Logika & Himpunan',
        ],
        plannedSolvers: [
          'Step-by-Step Aljabar',
          'Visualizer Grafik',
        ],
      };

  const IconComponent = details.icon;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fade-in">
      <button
        onClick={onBackToDashboard}
        className="px-4 py-3 min-h-[48px] rounded-xl text-sm mb-8 inline-flex items-center gap-2 font-bold transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] active:scale-95"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 mb-10 sm:mb-12">
        <div
          className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl flex items-center justify-center shadow-sm border border-[var(--card-border)] bg-[var(--bg-secondary)]"
        >
          <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 text-[var(--primary-accent)]" />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)]">
            {details.title}
          </h1>
          <p className="text-base sm:text-lg font-medium text-[var(--text-secondary)] mt-1">
            {details.subtitle}
          </p>
        </div>
      </div>

      {/* Active Games */}
      {!isPhysics && details.activeGames.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Game & Solver
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {details.activeGames.map((game) => {
              const GameIcon = game.icon;
              return (
                <div
                  key={game.id}
                  onClick={() => setActiveGame(game.id)}
                  className="group p-6 rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-[var(--primary-accent)]/50"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--bg-secondary)] text-[var(--primary-accent)]">
                      <GameIcon className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--primary-accent)]/10 text-[var(--primary-accent)]">
                      {game.badge}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black mb-2 text-[var(--text-primary)]">
                    {game.title}
                  </h3>
                  <p className="text-sm font-medium text-[var(--text-secondary)] mb-6 sm:mb-8">
                    {game.subtitle}
                  </p>
                  <button className="w-full py-3.5 min-h-[48px] rounded-xl text-sm font-bold bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] flex items-center justify-center gap-2 transition-transform group-hover:scale-[1.02] active:scale-95">
                    <Play className="w-4 h-4" />
                    Mainkan
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Planned Roadmap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-[var(--text-secondary)] mb-4">
            <Gamepad2 className="w-4 h-4" /> Segera Hadir: Game
          </h3>
          <ul className="space-y-2">
            {details.plannedGames.map((game, idx) => (
              <li key={idx} className="px-4 py-3 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-sm font-medium text-[var(--text-primary)]">
                {game}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-[var(--text-secondary)] mb-4">
            <Calculator className="w-4 h-4" /> Segera Hadir: Solver
          </h3>
          <ul className="space-y-2">
            {details.plannedSolvers.map((solver, idx) => (
              <li key={idx} className="px-4 py-3 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-sm font-medium text-[var(--text-primary)]">
                {solver}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
