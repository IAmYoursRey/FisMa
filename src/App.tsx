import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  BrainCircuit, 
  Sparkles, 
  Code,
  WifiOff,
  Gamepad2,
  Bot
} from 'lucide-react';
import { Navbar } from './components/navbar/Navbar';
import { Footer } from './components/footer/Footer';
import { PlaceholderView } from './components/placeholder/PlaceholderView';
import { ThemeModal } from './components/modal/ThemeModal';
import { ThemeSwitcher } from './components/theme-switcher/ThemeSwitcher';

function App() {
  const [mounted, setMounted] = useState(false);
  const [activeSubject, setActiveSubject] = useState<'fisika' | 'matematika' | 'home'>('home');
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const modules = [
    {
      id: 'fisika' as const,
      title: 'Fisika',
      description: 'Belajar lewat Simulasi.',
      icon: <Rocket className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--primary-accent)] drop-shadow-sm" />,
      status: 'Coming Soon',
      statusClass: 'bg-[var(--primary-accent)]/10 text-[var(--primary-accent)] border-[var(--primary-accent)]/20',
      tags: ['Mekanika', 'Termodinamika', 'Optika'],
      stats: { games: 0, solvers: 0 },
      hoverClass: 'hover:border-[var(--primary-accent)]/40 hover:shadow-[var(--primary-accent)]/10'
    },
    {
      id: 'matematika' as const,
      title: 'Matematika',
      description: 'Belajar lewat Game & Solver.',
      icon: <BrainCircuit className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--primary-accent)] drop-shadow-sm" />,
      status: 'Live',
      statusClass: 'bg-[var(--primary-accent)]/10 text-[var(--primary-accent)] border-[var(--primary-accent)]/20',
      tags: ['Aljabar', 'Geometri', 'Logika'],
      stats: { games: 1, solvers: 1 },
      hoverClass: 'hover:border-[var(--primary-accent)]/40 hover:shadow-[var(--primary-accent)]/10'
    }
  ];

  return (
    <div className="min-h-screen transition-colors duration-300 flex flex-col" style={{ 
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)'
    }}>
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full opacity-20 blur-[100px] bg-blue-500"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full opacity-20 blur-[100px] bg-emerald-500"></div>
        <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] rounded-full opacity-10 blur-[80px] bg-purple-500"></div>
        
        {/* Subtle Grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]" 
          style={{ 
            backgroundImage: `linear-gradient(to right, var(--text-primary) 1px, transparent 1px), linear-gradient(to bottom, var(--text-primary) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        ></div>
      </div>

      <Navbar
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onNavigateSubject={setActiveSubject}
        activeSubject={activeSubject}
      />

      <div className="relative z-10 flex flex-col flex-grow">
        <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6">
          <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
            
            {activeSubject === 'home' ? (
              <>
                {/* HERO SECTION */}
                <div className="text-center mb-12 sm:mb-16">
                  <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border mb-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500"
                       style={{
                         background: 'var(--card-bg)',
                         borderColor: 'var(--card-border)',
                       }}>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-xs sm:text-sm font-bold tracking-wide text-[var(--text-primary)]">
                      FisMa
                    </span>
                  </div>
                  
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 leading-tight">
                    Belajar Fisika & Matematika
                  </h1>
                  
                  <p className="text-base sm:text-lg md:text-xl max-w-xl mx-auto font-medium animate-in fade-in slide-in-from-bottom-8 duration-700 leading-relaxed text-[var(--text-secondary)]">
                    Belajar Lebih Interaktif melalui Game, Solver, dan Simulasi.
                  </p>
                </div>

                {/* MODULES GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full mb-12 sm:mb-16">
                  {modules.map((module, index) => (
                    <div 
                      key={module.id}
                      onClick={() => setActiveSubject(module.id)}
                      className={`group relative flex flex-col p-6 sm:p-8 rounded-[2rem] border transition-all duration-200 cursor-pointer overflow-hidden animate-in fade-in slide-in-from-bottom-8 bg-[var(--card-bg)] border-[var(--card-border)] hover:-translate-y-1.5 shadow-sm hover:shadow-xl ${module.hoverClass}`}
                      style={{
                        animationDelay: `${(index + 1) * 150}ms`
                      }}
                    >
                      {/* Header: Icon & Status */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="p-3 sm:p-3.5 rounded-2xl bg-white/5 dark:bg-white/10 border border-black/5 dark:border-white/10 shadow-sm">
                          {module.icon}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm ${module.statusClass}`}>
                          {module.status}
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h2 className="text-2xl sm:text-3xl font-black mb-2 text-[var(--text-primary)] tracking-tight">
                        {module.title}
                      </h2>
                      <p className="text-base sm:text-lg font-medium text-[var(--text-secondary)] mb-8">
                        {module.description}
                      </p>

                      {/* Stats & Tags (Pushed to bottom) */}
                      <div className="flex flex-col gap-5 mt-auto">
                        {/* Stats */}
                        <div className="flex items-center gap-5 text-sm font-bold text-[var(--text-secondary)]">
                          <span className="flex items-center gap-1.5">
                            <Gamepad2 className="w-4 h-4" /> {module.stats.games} Game
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Bot className="w-4 h-4" /> {module.stats.solvers} Solver
                          </span>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {module.tags.map((tag) => (
                            <span 
                              key={tag} 
                              className="text-xs font-bold px-2.5 py-1 rounded-lg border bg-[var(--bg-secondary)] border-[var(--card-border)] text-[var(--text-tertiary)]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-8">
                        <button 
                          className="w-full py-3.5 sm:py-4 rounded-xl text-sm font-black transition-all duration-200 bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] group-hover:scale-[1.02] active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
                        >
                          Masuk
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* QUICK INFO (Simplified) */}
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700" style={{ animationDelay: '450ms' }}>
                  <div className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl border bg-white/5 backdrop-blur-sm transition-colors border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] cursor-default">
                    <Code className="w-4 h-4" />
                    <span className="text-xs sm:text-sm font-bold">
                      Open Source
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl border bg-white/5 backdrop-blur-sm transition-colors border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] cursor-default">
                    <WifiOff className="w-4 h-4" />
                    <span className="text-xs sm:text-sm font-bold">
                      Offline Support
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <PlaceholderView 
                subject={activeSubject} 
                onBackToDashboard={() => setActiveSubject('home')} 
              />
            )}

          </div>
        </main>
        
        <Footer />
      </div>

      <ThemeSwitcher onOpenModal={() => setIsThemeModalOpen(true)} />
      <ThemeModal isOpen={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} />
    </div>
  );
}

export default App;
