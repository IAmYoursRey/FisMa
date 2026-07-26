import React from 'react';
import { Atom, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../services/themeService';

export const Footer: React.FC = () => {
  const { theme } = useTheme();

  return (
    <footer className="w-full py-12 transition-all duration-300 relative border-t mt-auto" style={{
      borderColor: 'var(--card-border)',
      background: 'var(--bg-primary)'
    }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
                style={{
                  background: 'var(--button-primary-bg)',
                }}
              >
                <Atom className="w-4 h-4 text-[var(--button-primary-text)]" />
              </div>
              <span className="text-lg font-black tracking-tight text-[var(--text-primary)]">
                FisMa
              </span>
            </div>
            <p className="text-sm font-medium text-[var(--text-secondary)] text-center md:text-left">
              Edukasi Interaktif Fisika & Matematika.
            </p>
          </div>

          {/* Theme & Status */}
          <div className="flex items-center gap-4 text-xs font-bold text-[var(--text-secondary)]">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--card-border)] bg-[var(--bg-secondary)]">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Tema: {theme.name}</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-[var(--text-tertiary)]" style={{ borderColor: 'var(--card-border)' }}>
          <p>© {new Date().getFullYear()} FisMa.</p>
          <div className="flex items-center gap-3">
            <span className="hover:text-[var(--text-primary)] cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-[var(--text-primary)] cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
