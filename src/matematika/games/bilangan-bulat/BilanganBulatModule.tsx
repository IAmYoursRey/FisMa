import React, { useState } from 'react';
import { BilanganBulatDashboard } from './BilanganBulatDashboard';
import { GameView } from './game/GameView';
import { SolverView } from './solver/SolverView';
import { GameConfig, DEFAULT_CONFIG, OperationType } from './game/GameManager';

interface BilanganBulatModuleProps {
  onBackToDashboard: () => void;
}

export const BilanganBulatModule: React.FC<BilanganBulatModuleProps> = ({
  onBackToDashboard,
}) => {
  const [view, setView] = useState<'dashboard' | 'game' | 'solver'>('dashboard');
  const [gameConfig, setGameConfig] = useState<GameConfig>(DEFAULT_CONFIG);

  const [solverQuestion, setSolverQuestion] = useState<{
    numbers: number[];
    ops: OperationType[];
  }>({ numbers: [-8, 12], ops: ['+'] });

  const handleStartGame = (config: GameConfig) => {
    setGameConfig(config);
    setView('game');
  };

  const handleOpenSolver = () => {
    setView('solver');
  };

  const handleOpenSolverWithQuestion = (
    numbers: number[],
    ops: OperationType[]
  ) => {
    setSolverQuestion({ numbers, ops });
    setView('solver');
  };

  if (view === 'game') {
    return (
      <GameView
        config={gameConfig}
        onBackToDashboard={() => setView('dashboard')}
        onOpenSolverWithQuestion={handleOpenSolverWithQuestion}
      />
    );
  }

  if (view === 'solver') {
    return (
      <SolverView
        initialNumbers={solverQuestion.numbers}
        initialOps={solverQuestion.ops}
        onBackToDashboard={() => setView('dashboard')}
        onExitModule={onBackToDashboard}
      />
    );
  }

  return (
    <BilanganBulatDashboard
      onStartGame={handleStartGame}
      onOpenSolver={handleOpenSolver}
      onBackToDashboard={onBackToDashboard}
    />
  );
};
