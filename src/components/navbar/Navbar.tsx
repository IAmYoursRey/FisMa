import React, { useState } from 'react';
import { Atom, Palette, Menu, X, Sparkles, Activity, Layers } from 'lucide-react';
import { useTheme } from '../../services/themeService';

interface NavbarProps {
  onOpenThemeModal: () => void;
  onNavigateSubject: (subject: 'fisika' | 'matematika' | 'home') => void;
  activeSubject: 'fisika' | 'matematika' | 'home';
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenThemeModal,
  onNavigateSubject,
  activeSubject,
}) => {
  const { theme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full fisma-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <button
          onClick={() => onNavigateSubject('home')}
          className="flex items-center gap-3 group text-left focus:outline-none"
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
            style={{
              background: 'var(--button-primary-bg)',
              boxShadow: 'var(--accent-glow)',
            }}
          >
            <Atom className="w-6 h-6 text-[var(--button-primary-text)] animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Fis<span style={{ color: 'var(--primary-accent)' }}>Ma</span>
              </span>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                style={{
                  background: 'var(--badge-bg)',
                  color: 'var(--badge-text)',
                  border: '1px solid var(--card-border)',
                }}
              >
                v1.0
              </span>
            </div>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              Fisika & Matematika
            </p>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <button
            onClick={() => onNavigateSubject('home')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeSubject === 'home'
                ? 'shadow-sm'
                : 'opacity-80 hover:opacity-100'
            }`}
            style={{
              background: activeSubject === 'home' ? 'var(--badge-bg)' : 'transparent',
              color: activeSubject === 'home' ? 'var(--primary-accent)' : 'var(--text-primary)',
              border: activeSubject === 'home' ? '1px solid var(--card-border)' : '1px solid transparent',
            }}
          >
            Dashboard
          </button>

          <button
            onClick={() => onNavigateSubject('fisika')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeSubject === 'fisika'
                ? 'shadow-sm'
                : 'opacity-80 hover:opacity-100'
            }`}
            style={{
              background: activeSubject === 'fisika' ? 'var(--badge-bg)' : 'transparent',
              color: activeSubject === 'fisika' ? 'var(--primary-accent)' : 'var(--text-primary)',
              border: activeSubject === 'fisika' ? '1px solid var(--card-border)' : '1px solid transparent',
            }}
          >
            <Atom className="w-4 h-4" />
            Fisika
          </button>

          <button
            onClick={() => onNavigateSubject('matematika')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeSubject === 'matematika'
                ? 'shadow-sm'
                : 'opacity-80 hover:opacity-100'
            }`}
            style={{
              background: activeSubject === 'matematika' ? 'var(--badge-bg)' : 'transparent',
              color: activeSubject === 'matematika' ? 'var(--primary-accent)' : 'var(--text-primary)',
              border: activeSubject === 'matematika' ? '1px solid var(--card-border)' : '1px solid transparent',
            }}
          >
            <Layers className="w-4 h-4" />
            Matematika
          </button>
        </nav>

        {/* Action Controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Status Indicator */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border"
            style={{
              background: 'var(--glass-bg)',
              borderColor: 'var(--card-border)',
              color: 'var(--text-secondary)',
            }}
          >
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ background: 'var(--primary-accent)' }}
              ></span>
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ background: 'var(--primary-accent)' }}
              ></span>
            </span>
            <span>Frontend Architecture</span>
          </div>

          {/* Theme Selector Button */}
          <button
            onClick={onOpenThemeModal}
            className="fisma-btn-secondary px-4 py-2 rounded-xl text-sm flex items-center gap-2.5"
            title="Ubah Tema Website"
          >
            <Palette className="w-4 h-4" style={{ color: 'var(--primary-accent)' }} />
            <span>Tema: <strong>{theme.name}</strong></span>
            <span
              className="w-3 h-3 rounded-full border border-white/20"
              style={{ backgroundColor: theme.previewColors.accent }}
            />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onOpenThemeModal}
            className="p-2 rounded-lg fisma-btn-secondary"
            aria-label="Pilih Tema"
          >
            <Palette className="w-5 h-5" style={{ color: 'var(--primary-accent)' }} />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gray-300 hover:text-white"
            style={{ color: 'var(--text-primary)' }}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          className="md:hidden px-4 pt-2 pb-6 border-t flex flex-col gap-3"
          style={{
            background: 'var(--nav-bg)',
            borderColor: 'var(--glass-border)',
          }}
        >
          <button
            onClick={() => {
              onNavigateSubject('home');
              setMobileMenuOpen(false);
            }}
            className="px-4 py-3 rounded-lg text-left text-sm font-semibold flex items-center gap-3"
            style={{
              background: activeSubject === 'home' ? 'var(--badge-bg)' : 'transparent',
              color: activeSubject === 'home' ? 'var(--primary-accent)' : 'var(--text-primary)',
            }}
          >
            <Sparkles className="w-4 h-4" />
            Dashboard Utama
          </button>

          <button
            onClick={() => {
              onNavigateSubject('fisika');
              setMobileMenuOpen(false);
            }}
            className="px-4 py-3 rounded-lg text-left text-sm font-semibold flex items-center gap-3"
            style={{
              background: activeSubject === 'fisika' ? 'var(--badge-bg)' : 'transparent',
              color: activeSubject === 'fisika' ? 'var(--primary-accent)' : 'var(--text-primary)',
            }}
          >
            <Atom className="w-4 h-4" />
            Modul Fisika
          </button>

          <button
            onClick={() => {
              onNavigateSubject('matematika');
              setMobileMenuOpen(false);
            }}
            className="px-4 py-3 rounded-lg text-left text-sm font-semibold flex items-center gap-3"
            style={{
              background: activeSubject === 'matematika' ? 'var(--badge-bg)' : 'transparent',
              color: activeSubject === 'matematika' ? 'var(--primary-accent)' : 'var(--text-primary)',
            }}
          >
            <Layers className="w-4 h-4" />
            Modul Matematika
          </button>

          <button
            onClick={() => {
              onOpenThemeModal();
              setMobileMenuOpen(false);
            }}
            className="mt-2 w-full fisma-btn-primary py-3 rounded-xl text-sm flex items-center justify-center gap-2"
          >
            <Palette className="w-4 h-4" />
            Ganti Tema ({theme.name})
          </button>
        </div>
      )}
    </header>
  );
};
