import React from 'react';
import { Atom, Heart, Code2, ShieldCheck, Sparkles, Cpu } from 'lucide-react';
import { useTheme } from '../../services/themeService';

export const Footer: React.FC = () => {
  const { theme } = useTheme();

  return (
    <footer className="w-full fisma-footer py-12 mt-20 transition-all duration-300 relative overflow-hidden">
      {/* Decorative Glow Line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background: `linear-gradient(90deg, transparent 0%, var(--primary-accent) 50%, transparent 100%)`,
          opacity: 0.5,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{
                  background: 'var(--button-primary-bg)',
                  boxShadow: 'var(--accent-glow)',
                }}
              >
                <Atom className="w-5 h-5 text-[var(--button-primary-text)]" />
              </div>
              <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Fis<span style={{ color: 'var(--primary-accent)' }}>Ma</span> Platform
              </span>
            </div>
            <p className="text-sm max-w-md leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Platform pembelajaran interaktif Fisika & Matematika berbasis Web dengan arsitektur frontend modular, sistem tema adaptif, game edukasi, dan solver berorientasi masa depan.
            </p>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <ShieldCheck className="w-4 h-4" style={{ color: 'var(--primary-accent)' }} />
              <span>Tema Aktif: <strong style={{ color: 'var(--text-primary)' }}>{theme.name}</strong></span>
            </div>
          </div>

          {/* Architecture Stack */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Code2 className="w-4 h-4" style={{ color: 'var(--primary-accent)' }} />
              Arsitektur Frontend
            </h4>
            <ul className="text-xs space-y-2" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--primary-accent)' }}></span>
                React 19 & TypeScript Engine
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--primary-accent)' }}></span>
                CSS Variables & Dynamic Theme Manager
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--primary-accent)' }}></span>
                Tailwind CSS v4 Utility System
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--primary-accent)' }}></span>
                Motion Animation Framework
              </li>
            </ul>
          </div>

          {/* System Status */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Cpu className="w-4 h-4" style={{ color: 'var(--primary-accent)' }} />
              Status Fondasi
            </h4>
            <div
              className="p-3 rounded-xl border text-xs space-y-2"
              style={{
                background: 'var(--card-bg)',
                borderColor: 'var(--card-border)',
              }}
            >
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Fase Project:</span>
                <span className="font-bold px-2 py-0.5 rounded text-[10px]" style={{ background: 'var(--badge-bg)', color: 'var(--badge-text)' }}>
                  Frontend Foundation
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Storage Theme:</span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>LocalStorage Persisted</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Jumlah Tema:</span>
                <span className="font-bold" style={{ color: 'var(--primary-accent)' }}>10 Preset Aktif</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div
          className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
          style={{ borderColor: 'var(--glass-border)', color: 'var(--text-muted)' }}
        >
          <p>© {new Date().getFullYear()} FisMa (Fisika & Matematika). Built for scalable educational excellence.</p>
          <div className="flex items-center gap-1">
            <span>Dirancang dengan kepatuhan Clean Code & Modular Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
