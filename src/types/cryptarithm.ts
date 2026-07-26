export type MathOperation = '+' | '-' | '*';

export interface CryptarithmConfig {
  operation: MathOperation;
  rowCount: number; // Number of operand rows (2 to 5)
  digitCount: number; // Digits per operand row (2 to 8)
  rowDigits: number[]; // Digit length for each row [row1, row2, ..., resultRow]
  mode: 'fixed' | 'endless';
  targetQuestions: number;
  timerSec: number; // 0 for infinite
  toleranceEnabled: boolean;
  maxTolerance: number;
}

export interface PuzzleData {
  terms: string[]; // Operand terms, e.g. ['SEND', 'MORE'] or ['ABC', 'DEF', 'GHI']
  resultTerm: string; // Result term, e.g. 'MONEY' or 'JKLM'
  termNumbers: number[]; // Numbers for each operand term
  resultNumber: number; // Number for the result term
  solutionMap: Record<string, number>; // Alphabet to digit mapping
  operation: MathOperation;
  // Backward compatibility fields
  term1Str: string;
  term2Str: string;
  term3Str: string;
  num1: number;
  num2: number;
  num3: number;
}

export interface GameStats {
  currentQuestionIndex: number;
  score: number;
  correctCount: number;
  wrongCount: number;
  currentAttempts: number;
}

export interface SolverSolution {
  assignment: Record<string, number>;
  termNumbers: number[];
  resultNumber: number;
  // Backward compatibility fields
  num1?: number;
  num2?: number;
  num3?: number;
}

export interface SolverResult {
  solutions: SolverSolution[];
  terms: string[];
  resultTerm: string;
  operation: MathOperation;
  error?: string;
}
