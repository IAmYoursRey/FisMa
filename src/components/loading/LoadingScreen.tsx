import React from 'react';
import { Atom, Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Memuat Fondasi FisMa Platform...',
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 fisma-nav backdrop-blur-xl">
      <div className="relative flex items-center justify-center">
        {/* Outer Orbit Ring */}
        <div
          className="w-24 h-24 rounded-full border-2 border-dashed animate-spin-slow"
          style={{ borderColor: 'var(--primary-accent)', opacity: 0.4 }}
        />
        {/* Inner Glowing Core */}
        <div
          className="absolute w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse"
          style={{
            background: 'var(--button-primary-bg)',
            boxShadow: 'var(--accent-glow)',
          }}
        >
          <Atom className="w-8 h-8 text-[var(--button-primary-text)] animate-spin" />
        </div>
      </div>

      <div className="mt-8 text-center space-y-2">
        <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Fis<span style={{ color: 'var(--primary-accent)' }}>Ma</span>
        </h2>
        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {message}
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <span className="w-2 h-2 rounded-full animate-ping" style={{ background: 'var(--primary-accent)' }} />
          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            Initialising Themes & Modules...
          </span>
        </div>
      </div>
    </div>
  );
};
