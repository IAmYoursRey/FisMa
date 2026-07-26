import React, { useState, useEffect } from 'react';
import {
  Atom,
  Layers,
  Palette,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  BarChart3,
  Terminal,
  Zap,
  BookOpen,
  CheckCircle2,
  Cpu,
  Boxes,
  Code2,
} from 'lucide-react';
import { Navbar } from './components/navbar/Navbar';
import { Footer } from './components/footer/Footer';
import { ThemeModal } from './components/modal/ThemeModal';
import { ThemeSwitcher } from './components/theme-switcher/ThemeSwitcher';
import { PlaceholderView } from './components/placeholder/PlaceholderView';
import { LoadingScreen } from './components/loading/LoadingScreen';
import { useTheme } from './services/themeService';

export default function App() {
  const { theme } = useTheme();
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<'home' | 'fisika' | 'matematika'>('home');
  const [isLoading, setIsLoading] = useState(true);

  // Initial boot simulation for smooth presentation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigateSubject = (subject: 'fisika' | 'matematika' | 'home') => {
    setActiveView(subject);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSubjectSection = () => {
    const section = document.getElementById('pilihan-mata-pelajaran');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Memuat Dashboard Utama FisMa..." />;
  }

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-[var(--primary-accent)] selection:text-black">
      {/* Background Decorative Ambient Glow Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-[120px] opacity-30 animate-pulse"
          style={{ background: 'var(--primary-accent)' }}
        />
        <div
          className="absolute top-1/2 -right-40 w-96 h-96 rounded-full blur-[140px] opacity-25 animate-float"
          style={{ background: 'var(--primary-accent)' }}
        />
      </div>

      {/* Navigation Header */}
      <Navbar
        onOpenThemeModal={() => setThemeModalOpen(true)}
        onNavigateSubject={handleNavigateSubject}
        activeSubject={activeView}
      />

      {/* Main Content Area */}
      <main className="flex-1 z-10">
        {activeView !== 'home' ? (
          <PlaceholderView
            subject={activeView}
            onBackToDashboard={() => setActiveView('home')}
          />
        ) : (
          <div className="space-y-24 pb-12">
            
            {/* HERO SECTION */}
            <section className="relative pt-12 sm:pt-20 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-4xl mx-auto space-y-8">
                
                {/* Platform Badge */}
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold tracking-wide transition-transform hover:scale-105"
                  style={{
                    background: 'var(--badge-bg)',
                    borderColor: 'var(--card-border)',
                    color: 'var(--badge-text)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Platform Pembelajaran Interaktif Masa Depan</span>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--primary-accent)' }} />
                  <span className="font-mono text-[10px]">Phase 1: Architecture</span>
                </div>

                {/* Main Hero Title */}
                <div className="space-y-4">
                  <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.1]" style={{ color: 'var(--text-primary)' }}>
                    Fis<span style={{ color: 'var(--primary-accent)' }}>Ma</span>
                  </h1>
                  <p className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--text-secondary)' }}>
                    Platform Pembelajaran Interaktif Fisika & Matematika
                  </p>
                </div>

                {/* Hero Description */}
                <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Pusat navigasi game edukasi, simulator visual, solver otomatis, dan pelacakan progress belajar interaktif dengan sistem tema visual yang sepenuhnya adaptif.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                  <button
                    onClick={scrollToSubjectSection}
                    className="fisma-btn-primary px-8 py-4 rounded-xl text-base font-bold flex items-center justify-center gap-3 w-full sm:w-auto"
                  >
                    <BookOpen className="w-5 h-5" />
                    <span>Mulai Belajar</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setThemeModalOpen(true)}
                    className="fisma-btn-secondary px-8 py-4 rounded-xl text-base font-bold flex items-center justify-center gap-3 w-full sm:w-auto"
                  >
                    <Palette className="w-5 h-5" style={{ color: 'var(--primary-accent)' }} />
                    <span>Pilih Tema ({theme.name})</span>
                  </button>
                </div>

                {/* Hero Stats Pill */}
                <div
                  className="pt-6 border-t inline-flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold"
                  style={{ borderColor: 'var(--glass-border)', color: 'var(--text-muted)' }}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--primary-accent)' }} />
                    <span>10 Presets Tema Adaptif</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--primary-accent)' }} />
                    <span>LocalStorage Retention</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--primary-accent)' }} />
                    <span>Arsitektur Modular Clean</span>
                  </div>
                </div>

              </div>
            </section>

            {/* SUBJECT SELECTION (PILIHAN MATA PELAJARAN) */}
            <section id="pilihan-mata-pelajaran" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
                <span
                  className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border"
                  style={{
                    background: 'var(--badge-bg)',
                    color: 'var(--badge-text)',
                    borderColor: 'var(--card-border)',
                  }}
                >
                  Modul Utama
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  Pilihan Mata Pelajaran
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Pilih bidang studi untuk menjelajahi rencana simulator, game edukasi, dan solver interaktif.
                </p>
              </div>

              {/* Subject Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* FISIKA CARD */}
                <div
                  onClick={() => handleNavigateSubject('fisika')}
                  className="fisma-card rounded-2xl p-8 cursor-pointer group relative overflow-hidden border flex flex-col justify-between"
                  style={{
                    background: 'var(--card-bg)',
                    borderColor: 'var(--card-border)',
                  }}
                >
                  {/* Card Background Glow */}
                  <div
                    className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-3xl opacity-20 transition-all group-hover:scale-125"
                    style={{ background: 'var(--primary-accent)' }}
                  />

                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{
                          background: 'var(--button-primary-bg)',
                          boxShadow: 'var(--accent-glow)',
                        }}
                      >
                        <Atom className="w-7 h-7 text-[var(--button-primary-text)] animate-spin-slow" />
                      </div>

                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                        style={{
                          background: 'var(--badge-bg)',
                          color: 'var(--badge-text)',
                          border: '1px solid var(--card-border)',
                        }}
                      >
                        Frontend Dev
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-2xl font-black mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      Fisika
                      <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" style={{ color: 'var(--primary-accent)' }} />
                    </h3>
                    <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                      Eksplorasi fenomena alam, gerak, gaya, optika, listrik, dan termodinamika melalui simulasi laboratorium interaktif dan game tantangan.
                    </p>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="p-3 rounded-xl border text-center" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
                        <span className="block text-lg font-black" style={{ color: 'var(--primary-accent)' }}>0</span>
                        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Game</span>
                      </div>
                      <div className="p-3 rounded-xl border text-center" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
                        <span className="block text-lg font-black" style={{ color: 'var(--primary-accent)' }}>0</span>
                        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Solver</span>
                      </div>
                      <div className="p-3 rounded-xl border text-center" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
                        <span className="block text-xs font-bold truncate mt-1" style={{ color: 'var(--text-primary)' }}>Modular</span>
                        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Status</span>
                      </div>
                    </div>

                    {/* Topics Tags */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Cakupan Topik Rencana:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {['Kinematika', 'Dinamika', 'Optika', 'Termodinamika', 'Listrik'].map((topic) => (
                          <span
                            key={topic}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium border"
                            style={{
                              background: 'var(--glass-bg)',
                              borderColor: 'var(--glass-border)',
                              color: 'var(--text-primary)',
                            }}
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Action */}
                  <div className="mt-8 pt-4 border-t flex items-center justify-between text-xs font-bold" style={{ borderColor: 'var(--glass-border)' }}>
                    <span style={{ color: 'var(--primary-accent)' }}>Buka Modul Fisika</span>
                    <span className="group-hover:underline">Masuk Placeholder &rarr;</span>
                  </div>
                </div>

                {/* MATEMATIKA CARD */}
                <div
                  onClick={() => handleNavigateSubject('matematika')}
                  className="fisma-card rounded-2xl p-8 cursor-pointer group relative overflow-hidden border flex flex-col justify-between"
                  style={{
                    background: 'var(--card-bg)',
                    borderColor: 'var(--card-border)',
                  }}
                >
                  {/* Card Background Glow */}
                  <div
                    className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-3xl opacity-20 transition-all group-hover:scale-125"
                    style={{ background: 'var(--primary-accent)' }}
                  />

                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{
                          background: 'var(--button-primary-bg)',
                          boxShadow: 'var(--accent-glow)',
                        }}
                      >
                        <Layers className="w-7 h-7 text-[var(--button-primary-text)]" />
                      </div>

                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                        style={{
                          background: 'var(--badge-bg)',
                          color: 'var(--badge-text)',
                          border: '1px solid var(--card-border)',
                        }}
                      >
                        Frontend Dev
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-2xl font-black mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      Matematika
                      <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" style={{ color: 'var(--primary-accent)' }} />
                    </h3>
                    <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                      Asah pola pikir analitis, penalaran logika, aljabar, geometri, dan kalkulus melalui game teka-teki serta mesin langkah solver otomatis.
                    </p>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="p-3 rounded-xl border text-center" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
                        <span className="block text-lg font-black" style={{ color: 'var(--primary-accent)' }}>1</span>
                        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Game</span>
                      </div>
                      <div className="p-3 rounded-xl border text-center" style={{ background: 'var(--glass-bg)', borderColor: 'var(--primary-accent)' }}>
                        <span className="block text-lg font-black" style={{ color: 'var(--primary-accent)' }}>1</span>
                        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Solver</span>
                      </div>
                      <div className="p-3 rounded-xl border text-center" style={{ background: 'var(--badge-bg)', borderColor: 'var(--card-border)' }}>
                        <span className="block text-xs font-bold truncate mt-1 text-emerald-400">Live</span>
                        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Status</span>
                      </div>
                    </div>

                    {/* Topics Tags */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Cakupan Topik Rencana:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {['Aljabar', 'Geometri', 'Trigonometri', 'Kalkulus', 'Logika'].map((topic) => (
                          <span
                            key={topic}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium border"
                            style={{
                              background: 'var(--glass-bg)',
                              borderColor: 'var(--glass-border)',
                              color: 'var(--text-primary)',
                            }}
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Action */}
                  <div className="mt-8 pt-4 border-t flex items-center justify-between text-xs font-bold" style={{ borderColor: 'var(--glass-border)' }}>
                    <span style={{ color: 'var(--primary-accent)' }}>Buka Modul Matematika</span>
                    <span className="group-hover:underline">Masuk Placeholder &rarr;</span>
                  </div>
                </div>

              </div>
            </section>

            {/* REALTIME PLATFORM STATISTICS */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="fisma-card rounded-3xl p-8 sm:p-10 border" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 border-b pb-6" style={{ borderColor: 'var(--glass-border)' }}>
                  <div>
                    <h3 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <BarChart3 className="w-6 h-6" style={{ color: 'var(--primary-accent)' }} />
                      Statistik Platform FisMa
                    </h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                      Metrik status pengembang frontend dan fondasi sistem yang sedang berjalan.
                    </p>
                  </div>

                  <span
                    className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold border"
                    style={{
                      background: 'var(--badge-bg)',
                      borderColor: 'var(--card-border)',
                      color: 'var(--badge-text)',
                    }}
                  >
                    STATUS: FRONTEND DEVELOPMENT
                  </span>
                </div>

                {/* 4 Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  
                  <div className="p-5 rounded-2xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                    <span className="text-xs uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      Mata Pelajaran
                    </span>
                    <div className="text-4xl font-black mt-2" style={{ color: 'var(--primary-accent)' }}>
                      2
                    </div>
                    <span className="text-xs mt-1 block" style={{ color: 'var(--text-secondary)' }}>
                      Fisika & Matematika
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                    <span className="text-xs uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      Game Edukasi
                    </span>
                    <div className="text-4xl font-black mt-2" style={{ color: 'var(--text-primary)' }}>
                      0
                    </div>
                    <span className="text-xs mt-1 block" style={{ color: 'var(--text-muted)' }}>
                      Siap Dikembangkan
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                    <span className="text-xs uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      Solver Interaktif
                    </span>
                    <div className="text-4xl font-black mt-2" style={{ color: 'var(--text-primary)' }}>
                      0
                    </div>
                    <span className="text-xs mt-1 block" style={{ color: 'var(--text-muted)' }}>
                      Siap Dikembangkan
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                    <span className="text-xs uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      Sistem Tema
                    </span>
                    <div className="text-xl font-bold mt-2 truncate" style={{ color: 'var(--primary-accent)' }}>
                      {theme.name}
                    </div>
                    <span className="text-xs mt-1 block" style={{ color: 'var(--text-secondary)' }}>
                      10 Presets Tersedia
                    </span>
                  </div>

                </div>
              </div>
            </section>

            {/* THEME SHOWCASE BANNER */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div
                className="rounded-3xl p-8 sm:p-12 border relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8"
                style={{
                  background: 'var(--button-primary-bg)',
                  borderColor: 'var(--card-border)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                <div className="space-y-3 max-w-xl z-10" style={{ color: 'var(--button-primary-text)' }}>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-black/20 text-current inline-block">
                    Feature Highlight: Theme Engine
                  </span>
                  <h3 className="text-3xl font-black tracking-tight">
                    Ekspresikan Suasana Belajar dengan 10 Tema Warna
                  </h3>
                  <p className="text-sm font-medium opacity-90 leading-relaxed">
                    Setiap tema tidak sekadar mengubah warna background, melainkan menyesuaikan seluruh efek visual seperti gradient, glow neon, shadow depth, glassmorphism, dan nuansa button.
                  </p>
                </div>

                <button
                  onClick={() => setThemeModalOpen(true)}
                  className="px-8 py-4 rounded-2xl font-black text-sm bg-black/90 hover:bg-black text-white shadow-2xl transition-all duration-300 hover:scale-105 shrink-0 z-10 flex items-center gap-3"
                >
                  <Palette className="w-5 h-5" style={{ color: 'var(--primary-accent)' }} />
                  <span>Buka Theme Panel</span>
                </button>
              </div>
            </section>

          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Theme Switcher Trigger */}
      <ThemeSwitcher onOpenModal={() => setThemeModalOpen(true)} />

      {/* Theme Selection Modal */}
      <ThemeModal
        isOpen={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
      />
    </div>
  );
}
