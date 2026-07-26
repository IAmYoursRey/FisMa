import React from 'react';
import { Palette } from 'lucide-react';
import { useTheme } from '../../services/themeService';

interface ThemeSwitcherProps {
  onOpenModal: () => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ onOpenModal }) => {
  const { theme } = useTheme();

  return (
    <button
      onClick={onOpenModal}
      className="fixed bottom-6 right-6 z-40 p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border transition-all duration-300 hover:scale-105 active:scale-95 group fisma-glass-panel"
      style={{
        background: 'var(--glass-bg)',
        borderColor: 'var(--card-border)',
        boxShadow: 'var(--shadow-lg)',
      }}
      title={`Tema Aktif: ${theme.name}. Klik untuk mengganti.`}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12"
        style={{
          background: 'var(--button-primary-bg)',
          color: 'var(--button-primary-text)',
          boxShadow: 'var(--accent-glow)',
        }}
      >
        <Palette className="w-4 h-4" />
      </div>

      <div className="hidden sm:flex flex-col text-left pr-1">
        <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Tema Visual
        </span>
        <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
          {theme.name}
        </span>
      </div>

      <div
        className="w-3 h-3 rounded-full border border-white/20"
        style={{ backgroundColor: theme.previewColors.accent }}
      />
    </button>
  );
};
