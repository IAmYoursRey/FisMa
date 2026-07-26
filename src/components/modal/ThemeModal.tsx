import React, { useState } from 'react';
import { X, Check, Palette, Sparkles, Search, SlidersHorizontal } from 'lucide-react';
import { useTheme } from '../../services/themeService';
import { ThemeConfig, ThemeId } from '../../types/theme';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({ isOpen, onClose }) => {
  const { theme: currentTheme, allThemes, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'dark' | 'light' | 'vibrant'>('all');

  if (!isOpen) return null;

  const filteredThemes = allThemes.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectTheme = (id: ThemeId) => {
    setTheme(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="relative w-full max-w-4xl rounded-2xl p-6 sm:p-8 shadow-2xl z-10 my-auto fisma-glass-panel border transition-all duration-300"
        style={{
          background: 'var(--glass-bg)',
          borderColor: 'var(--card-border)',
          color: 'var(--text-primary)',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-6 border-b" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background: 'var(--button-primary-bg)',
                boxShadow: 'var(--accent-glow)',
              }}
            >
              <Palette className="w-6 h-6 text-[var(--button-primary-text)]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                Pilih Tema Visual Website
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: 'var(--badge-bg)',
                    color: 'var(--badge-text)',
                  }}
                >
                  {allThemes.length} Preset
                </span>
              </h3>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Ubah nuansa background, glow, shadow, glass effect, dan skema warna FisMa secara instan.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:opacity-80 transition-opacity fisma-btn-secondary"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl border w-full sm:w-auto" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            {(['all', 'dark', 'light', 'vibrant'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  selectedCategory === cat ? 'shadow' : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  background: selectedCategory === cat ? 'var(--button-primary-bg)' : 'transparent',
                  color: selectedCategory === cat ? 'var(--button-primary-text)' : 'var(--text-primary)',
                }}
              >
                {cat === 'all' ? 'Semua Tema' : cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Cari tema..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border focus:outline-none transition-colors"
              style={{
                background: 'var(--card-bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>

        {/* Grid Theme Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-1 py-2">
          {filteredThemes.map((t) => {
            const isActive = currentTheme.id === t.id;

            return (
              <button
                key={t.id}
                onClick={() => handleSelectTheme(t.id)}
                className={`relative group text-left p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between ${
                  isActive ? 'ring-2' : ''
                }`}
                style={{
                  background: t.variables['--card-bg'],
                  borderColor: isActive ? t.variables['--primary-accent'] : 'var(--card-border)',
                  outlineColor: t.variables['--primary-accent'],
                  boxShadow: isActive ? t.variables['--accent-glow'] : 'none',
                }}
              >
                <div>
                  {/* Theme Preview Swatch Bar */}
                  <div
                    className="h-16 w-full rounded-lg mb-3 p-3 flex items-end justify-between border relative overflow-hidden"
                    style={{
                      background: t.variables['--bg-gradient'],
                      borderColor: t.variables['--card-border'],
                    }}
                  >
                    {/* Decorative Glow Dot */}
                    <div
                      className="absolute top-2 right-2 w-8 h-8 rounded-full blur-md opacity-70"
                      style={{ background: t.previewColors.accent }}
                    />

                    {/* Palette Swatches */}
                    <div className="flex items-center gap-1.5 z-10">
                      <span
                        className="w-4 h-4 rounded-full border border-black/20 shadow-sm"
                        style={{ background: t.previewColors.bg }}
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-black/20 shadow-sm"
                        style={{ background: t.previewColors.accent }}
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-black/20 shadow-sm"
                        style={{ background: t.previewColors.secondary }}
                      />
                    </div>

                    {isActive && (
                      <span
                        className="z-10 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"
                        style={{
                          background: t.variables['--button-primary-bg'],
                          color: t.variables['--button-primary-text'],
                        }}
                      >
                        <Check className="w-3 h-3" />
                        Aktif
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-base tracking-tight" style={{ color: t.variables['--text-primary'] }}>
                      {t.name}
                    </h4>
                    <span
                      className="text-[10px] uppercase font-bold px-2 py-0.5 rounded"
                      style={{
                        background: t.variables['--badge-bg'],
                        color: t.variables['--badge-text'],
                      }}
                    >
                      {t.category}
                    </span>
                  </div>

                  <p className="text-xs mt-1.5 leading-relaxed line-clamp-2" style={{ color: t.variables['--text-secondary'] }}>
                    {t.description}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs font-semibold" style={{ borderColor: t.variables['--card-border'] }}>
                  <span style={{ color: t.variables['--primary-accent'] }}>
                    {isActive ? 'Tema Terpasang' : 'Klik untuk Terapkan'}
                  </span>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{
                      background: t.variables['--button-primary-bg'],
                      color: t.variables['--button-primary-text'],
                    }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--glass-border)', color: 'var(--text-muted)' }}>
          <p>Sistem menyimpan pilihan tema di LocalStorage secara otomatis.</p>
          <button
            onClick={onClose}
            className="fisma-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
