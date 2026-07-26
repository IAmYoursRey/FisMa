export type OperationType = '+' | '-' | '*' | '/';

export interface BoxConfig {
  id: string; // 'A', 'B', 'C', 'D', 'E', 'F'
  label: string; // 'Kotak A', 'Kotak B', etc.
  enabled: boolean;
  minRange: number;
  maxRange: number;
}

export interface GameConfig {
  boxes: BoxConfig[];
  useMinRange: boolean;
  minRange: number;
  useMaxRange: boolean;
  maxRange: number;
  useTimeLimit: boolean;
  timeLimitSec: number; // 0 for no timer
  operations: OperationType[];
  questionCountMode: 'fixed' | 'endless';
  targetQuestions: number;
}

export interface QuestionItem {
  id: string;
  numbers: number[];
  ops: OperationType[];
  questionText: string;
  correctAnswer: number;
  num1: number;
  num2: number;
  op: OperationType;
}

export interface GameStats {
  score: number;
  correctCount: number;
  wrongCount: number;
  totalPlayed: number;
  currentStreak: number;
  maxStreak: number;
  history: Array<{
    question: string;
    userAnswer: number | string;
    correctAnswer: number;
    isCorrect: boolean;
  }>;
}

export const DEFAULT_CONFIG: GameConfig = {
  boxes: [
    { id: 'A', label: 'Kotak A', enabled: true, minRange: -10, maxRange: 10 },
    { id: 'B', label: 'Kotak B', enabled: true, minRange: -10, maxRange: 10 },
  ],
  useMinRange: true,
  minRange: -10,
  useMaxRange: true,
  maxRange: 10,
  useTimeLimit: false,
  timeLimitSec: 0,
  operations: ['+', '-'],
  questionCountMode: 'endless',
  targetQuestions: 1,
};

export function evaluateExpression(numbers: number[], ops: OperationType[]): number {
  if (numbers.length === 0) return 0;
  if (numbers.length === 1) return numbers[0];

  // First pass: handle * and /
  const nums: number[] = [numbers[0]];
  const nextOps: OperationType[] = [];

  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    const nextNum = numbers[i + 1];

    if (op === '*') {
      const prev = nums.pop()!;
      nums.push(prev * nextNum);
    } else if (op === '/') {
      const prev = nums.pop()!;
      nums.push(nextNum !== 0 ? Math.trunc(prev / nextNum) : 0);
    } else {
      nextOps.push(op);
      nums.push(nextNum);
    }
  }

  // Second pass: handle + and -
  let total = nums[0];
  for (let i = 0; i < nextOps.length; i++) {
    const op = nextOps[i];
    const nextNum = nums[i + 1];
    if (op === '+') {
      total += nextNum;
    } else if (op === '-') {
      total -= nextNum;
    }
  }

  return total;
}

export function generateQuestion(config: GameConfig): QuestionItem {
  const opsList: OperationType[] = config.operations.length > 0 ? config.operations : ['+', '-'];

  // Determine active boxes
  const boxes = config.boxes && config.boxes.length >= 2 ? config.boxes : [
    { id: 'A', label: 'Kotak A', enabled: true, minRange: config.minRange ?? -10, maxRange: config.maxRange ?? 10 },
    { id: 'B', label: 'Kotak B', enabled: true, minRange: config.minRange ?? -10, maxRange: config.maxRange ?? 10 },
  ];

  let activeBoxes = boxes.filter((b) => b.enabled);
  if (activeBoxes.length < 2) {
    // Fallback: at least 2 active boxes
    activeBoxes = boxes.slice(0, 2);
  }

  const numbers: number[] = [];
  const chosenOps: OperationType[] = [];

  for (let i = 0; i < activeBoxes.length; i++) {
    const box = activeBoxes[i];
    let min = Math.min(box.minRange, box.maxRange);
    let max = Math.max(box.minRange, box.maxRange);

    if (min === max) {
      if (min === 0) {
        min = -10;
        max = 10;
      } else {
        max = min + 10;
      }
    }

    const val = Math.floor(Math.random() * (max - min + 1)) + min;
    numbers.push(val);

    if (i < activeBoxes.length - 1) {
      const randomOp = opsList[Math.floor(Math.random() * opsList.length)];
      chosenOps.push(randomOp);
    }
  }

  // Handle division clean integer factors
  for (let i = 0; i < chosenOps.length; i++) {
    if (chosenOps[i] === '/') {
      if (numbers[i + 1] === 0) numbers[i + 1] = 1;
      const factor = Math.floor(Math.random() * 21) - 10; // -10 to 10
      const finalFactor = factor === 0 ? 1 : factor;
      numbers[i] = numbers[i + 1] * finalFactor;
    }
  }

  const correctAnswer = evaluateExpression(numbers, chosenOps);

  const opSymbolMap: Record<OperationType, string> = {
    '+': '+',
    '-': '−',
    '*': '×',
    '/': '÷',
  };

  let questionText = '';
  for (let i = 0; i < numbers.length; i++) {
    const num = numbers[i];
    const strNum = num < 0 ? `(${num})` : `${num}`;
    if (i === 0) {
      questionText = strNum;
    } else {
      questionText += ` ${opSymbolMap[chosenOps[i - 1]]} ${strNum}`;
    }
  }

  return {
    id: Math.random().toString(36).substring(2, 9),
    numbers,
    ops: chosenOps,
    questionText,
    correctAnswer,
    num1: numbers[0],
    num2: numbers[1] ?? 0,
    op: chosenOps[0] ?? '+',
  };
}

const STORAGE_KEY = 'fisma_bilangan_bulat_stats_v1';

export function loadSavedStats(): { highScore: number; totalGames: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load stats', e);
  }
  return { highScore: 0, totalGames: 0 };
}

export function saveStats(highScore: number, totalGames: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ highScore, totalGames }));
  } catch (e) {
    console.error('Failed to save stats', e);
  }
}
