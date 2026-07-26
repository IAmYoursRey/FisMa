/**
 * Matematika Control Module Entry Point
 * Folder ini disiapkan untuk menyimpan engine matematika, evaluator ekspresi,
 * matrix solver, dan visualizer fungsi.
 */

export interface MathEngineConfig {
  precision: number;
  angleMode: 'rad' | 'deg';
}

export const defaultMathConfig: MathEngineConfig = {
  precision: 4,
  angleMode: 'deg',
};

export function initializeMathEngine(config: Partial<MathEngineConfig> = {}) {
  return {
    ...defaultMathConfig,
    ...config,
    status: 'initialized',
  };
}
