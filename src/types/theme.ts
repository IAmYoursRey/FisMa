export type ThemeId =
  | 'midnight-black'
  | 'snow-white'
  | 'royal-purple'
  | 'emerald-green'
  | 'ocean-blue'
  | 'ruby-red'
  | 'sakura-pink'
  | 'graphite-gray'
  | 'sunset-orange'
  | 'golden-yellow';

export interface ThemeVariables {
  '--bg-gradient': string;
  '--primary-accent': string;
  '--primary-accent-hover': string;
  '--accent-glow': string;
  '--text-primary': string;
  '--text-secondary': string;
  '--text-muted': string;
  '--card-bg': string;
  '--card-border': string;
  '--card-hover-bg': string;
  '--glass-bg': string;
  '--glass-border': string;
  '--nav-bg': string;
  '--footer-bg': string;
  '--button-primary-bg': string;
  '--button-primary-text': string;
  '--shadow-sm': string;
  '--shadow-lg': string;
  '--badge-bg': string;
  '--badge-text': string;
}

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  category: 'dark' | 'light' | 'vibrant';
  previewColors: {
    bg: string;
    accent: string;
    secondary: string;
  };
  variables: ThemeVariables;
}
