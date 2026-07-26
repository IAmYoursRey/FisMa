/**
 * Fisika Games Registry
 * Folder ini disiapkan untuk pendaftaran game edukasi fisika.
 */

export interface PhysicsGame {
  id: string;
  title: string;
  difficulty: 'Mudah' | 'Sedang' | 'Sulit';
  category: 'Kinematika' | 'Dinamika' | 'Optika' | 'Termodinamika' | 'Listrik';
}

export const physicsGamesRegistry: PhysicsGame[] = [];

export function registerPhysicsGame(game: PhysicsGame): void {
  physicsGamesRegistry.push(game);
}
