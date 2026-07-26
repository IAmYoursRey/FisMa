/**
 * Matematika Games Registry
 * Folder ini disiapkan untuk pendaftaran game edukasi matematika.
 */

export interface MathGame {
  id: string;
  title: string;
  difficulty: 'Mudah' | 'Sedang' | 'Sulit';
  category: 'Aljabar' | 'Geometri' | 'Kalkulus' | 'Logika' | 'Statistika';
}

export const mathGamesRegistry: MathGame[] = [
  {
    id: 'cryptarithm',
    title: 'Cryptarithm (Logic & Algebra)',
    difficulty: 'Sedang',
    category: 'Logika',
  },
  {
    id: 'bilangan-bulat',
    title: 'Bilangan Bulat (Operasi Hitung)',
    difficulty: 'Mudah',
    category: 'Aljabar',
  },
];

export function registerMathGame(game: MathGame): void {
  mathGamesRegistry.push(game);
}
