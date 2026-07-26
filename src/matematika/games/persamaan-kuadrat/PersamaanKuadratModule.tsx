import React, { useState } from 'react';
import { PersamaanKuadratDashboard } from './PersamaanKuadratDashboard';
import { GameView } from './game/GameView';
import { SolverView } from './solver/SolverView';

interface Props {
  onBackToDashboard: () => void;
}

type ViewState = 'dashboard' | 'game' | 'solver';

export const PersamaanKuadratModule: React.FC<Props> = ({ onBackToDashboard }) => {
  const [activeView, setActiveView] = useState<ViewState>('dashboard');

  if (activeView === 'game') {
    return <GameView onBack={() => setActiveView('dashboard')} />;
  }

  if (activeView === 'solver') {
    return <SolverView onBack={() => setActiveView('dashboard')} />;
  }

  return (
    <PersamaanKuadratDashboard 
      onBack={onBackToDashboard}
      onStartGame={() => setActiveView('game')}
      onOpenSolver={() => setActiveView('solver')}
    />
  );
};
