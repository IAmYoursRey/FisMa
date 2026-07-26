import { OperationType } from '../game/GameManager';

export interface SolverStep {
  stepNumber: number;
  title: string;
  expression: string;
  explanation: string;
  highlightRule?: string;
}

export interface NumberLineState {
  startPos: number;
  movement: number; // positive = right, negative = left
  finalPos: number;
  minView: number;
  maxView: number;
}

export interface SolverResult {
  numbers: number[];
  ops: OperationType[];
  formattedExpression: string;
  result: number;
  steps: SolverStep[];
  numberLine?: NumberLineState;
  summaryRule: string;
}

function formatExpression(numbers: number[], ops: OperationType[]): string {
  const opSymbols: Record<OperationType, string> = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  let str = '';
  for (let i = 0; i < numbers.length; i++) {
    const num = numbers[i];
    str += num < 0 ? `(${num})` : `${num}`;
    if (i < ops.length) {
      str += ` ${opSymbols[ops[i]]} `;
    }
  }
  return str;
}

export function solveBilanganBulat(numbers: number[], ops: OperationType[]): SolverResult {
  if (numbers.length === 0) {
    return { numbers: [], ops: [], formattedExpression: '0', result: 0, steps: [], summaryRule: 'Kosong' };
  }
  
  if (numbers.length === 1) {
    return {
       numbers, ops,
       formattedExpression: `${numbers[0]}`,
       result: numbers[0],
       steps: [{ stepNumber: 1, title: 'Selesai', expression: `${numbers[0]}`, explanation: 'Hanya satu bilangan.'}],
       summaryRule: 'Tidak ada operasi.'
    };
  }

  if (numbers.length === 2 && ops.length === 1) {
    return solveDetailedTwoNumbers(numbers, ops);
  }

  // Multi-step solver
  const steps: SolverStep[] = [];
  let currentNums = [...numbers];
  let currentOps = [...ops];
  let stepNumber = 1;

  while (currentOps.length > 0) {
    const exprBefore = formatExpression(currentNums, currentOps);
    
    // Find next operation based on precedence (* or /)
    let opIndex = currentOps.findIndex(o => o === '*' || o === '/');
    if (opIndex === -1) {
      opIndex = 0; // fallback to left-to-right
    }

    const num1 = currentNums[opIndex];
    const op = currentOps[opIndex];
    const num2 = currentNums[opIndex + 1];

    const pairResult = solveDetailedTwoNumbers([num1, num2], [op]);
    
    steps.push({
      stepNumber: stepNumber++,
      title: `Langkah Evaluasi: ${formatExpression([num1, num2], [op])}`,
      expression: exprBefore,
      explanation: pairResult.summaryRule,
    });
    
    for (const sub of pairResult.steps) {
      steps.push({
        stepNumber: stepNumber++,
        title: `↳ ${sub.title}`,
        expression: sub.expression,
        explanation: sub.explanation,
        highlightRule: sub.highlightRule,
      });
    }

    currentNums.splice(opIndex, 2, pairResult.result);
    currentOps.splice(opIndex, 1);
  }

  return {
    numbers,
    ops,
    formattedExpression: formatExpression(numbers, ops),
    result: currentNums[0],
    steps,
    summaryRule: 'Penyelesaian multi-operasi dengan aturan urutan operasi matematika (KABATAKU).',
  };
}

function solveDetailedTwoNumbers(numbers: number[], ops: OperationType[]): SolverResult {
  const num1 = numbers[0];
  const num2 = numbers[1];
  const op = ops[0];
  
  const steps: SolverStep[] = [];
  let result = 0;
  let summaryRule = '';

  const strNum1 = num1 < 0 ? `(${num1})` : `${num1}`;
  const strNum2 = num2 < 0 ? `(${num2})` : `${num2}`;

  const opSymbols: Record<OperationType, string> = {
    '+': '+',
    '-': '−',
    '*': '×',
    '/': '÷',
  };

  const formattedExpression = `${strNum1} ${opSymbols[op]} ${strNum2}`;

  if (op === '+') {
    if (num2 < 0) {
      result = num1 + num2;
      summaryRule = 'Penjumlahan dengan bilangan negatif sama dengan pengurangan.';
      steps.push({
        stepNumber: 1,
        title: 'Identifikasi Tanda Tambah Berjumpa Negatif',
        expression: `${strNum1} + (${num2})`,
        explanation: `Tanda tambah '+' bertemu dengan bilangan negatif '(${num2})' dapat disederhanakan menjadi operasi pengurangan '-'.`,
        highlightRule: '+ (−) ⇒ −',
      });
      steps.push({
        stepNumber: 2,
        title: 'Bentuk Sederhana',
        expression: `${num1} − ${Math.abs(num2)}`,
        explanation: `Sederhanakan bentuk menjadi ${num1} − ${Math.abs(num2)}.`,
      });
      steps.push({
        stepNumber: 3,
        title: 'Hasil Perhitungan',
        expression: `= ${result}`,
        explanation: `Hasil akhir dari ${num1} dikurangi ${Math.abs(num2)} adalah ${result}.`,
      });
    } else {
      result = num1 + num2;
      summaryRule = 'Penjumlahan dua bilangan bulat.';
      steps.push({
        stepNumber: 1,
        title: 'Langkah Penjumlahan Langsung',
        expression: `${num1} + ${num2}`,
        explanation: `Mulailah dari titik ${num1}, lalu bergerak ke kanan sebanyak ${num2} langkah pada garis bilangan.`,
      });
      steps.push({
        stepNumber: 2,
        title: 'Hasil Perhitungan',
        expression: `= ${result}`,
        explanation: `Posisi akhir mendarat pada angka ${result}.`,
      });
    }
  } else if (op === '-') {
    if (num2 < 0) {
      result = num1 - num2;
      summaryRule = 'Pengurangan dengan bilangan negatif berubah menjadi penjumlahan positif.';
      steps.push({
        stepNumber: 1,
        title: 'Aturan "Negatif Pertemu Negatif"',
        expression: `${strNum1} − (${num2})`,
        explanation: `Tanda kurang '−' bertemu langsung dengan negatif '(${num2})' berubah menjadi tanda tambah '+'.`,
        highlightRule: '− (−) ⇒ +',
      });
      steps.push({
        stepNumber: 2,
        title: 'Ubah Menjadi Operasi Penjumlahan',
        expression: `${num1} + ${Math.abs(num2)}`,
        explanation: `Bentuk operasi berubah menjadi ${num1} + ${Math.abs(num2)}.`,
      });
      steps.push({
        stepNumber: 3,
        title: 'Hasil Perhitungan',
        expression: `= ${result}`,
        explanation: `Hasil dari ${num1} ditambah ${Math.abs(num2)} adalah ${result}.`,
      });
    } else {
      result = num1 - num2;
      summaryRule = 'Pengurangan bilangan bulat.';
      steps.push({
        stepNumber: 1,
        title: 'Langkah Pengurangan',
        expression: `${num1} − ${num2}`,
        explanation: `Mulailah dari titik ${num1}, lalu melangkah ke kiri sejauh ${num2} langkah pada garis bilangan.`,
      });
      steps.push({
        stepNumber: 2,
        title: 'Hasil Perhitungan',
        expression: `= ${result}`,
        explanation: `Posisi akhir mendarat pada angka ${result}.`,
      });
    }
  } else if (op === '*') {
    result = num1 * num2;
    const sameSign = (num1 >= 0 && num2 >= 0) || (num1 < 0 && num2 < 0);
    summaryRule = sameSign
      ? 'Perkalian tanda sama (positif × positif ATAU negatif × negatif) menghasilkan POSITIF (+).'
      : 'Perkalian beda tanda (positif × negatif ATAU negatif × positif) menghasilkan NEGATIF (−).';

    steps.push({
      stepNumber: 1,
      title: 'Tentukan Tanda Hasil Perkalian',
      expression: `${strNum1} × ${strNum2}`,
      explanation: sameSign
        ? 'Kedua bilangan memiliki tanda yang SAMA, sehingga hasil perkalian bernilai POSITIF (+).'
        : 'Kedua bilangan memiliki tanda BEDA, sehingga hasil perkalian bernilai NEGATIF (−).',
      highlightRule: sameSign ? '(+)×(+) = (+)  |  (−)×(−) = (+)' : '(+)×(−) = (−)  |  (−)×(+) = (−)',
    });
    steps.push({
      stepNumber: 2,
      title: 'Kalikan Nilai Mutlaknya',
      expression: `${Math.abs(num1)} × ${Math.abs(num2)} = ${Math.abs(result)}`,
      explanation: `Hitung perkalian angka tanpa melihat tanda: ${Math.abs(num1)} × ${Math.abs(num2)} = ${Math.abs(result)}.`,
    });
    steps.push({
      stepNumber: 3,
      title: 'Gabungkan Tanda dan Nilai',
      expression: `= ${result}`,
      explanation: `Hasil akhir perkalian adalah ${result}.`,
    });
  } else if (op === '/') {
    result = num2 !== 0 ? Math.trunc(num1 / num2) : 0;
    const sameSign = (num1 >= 0 && num2 >= 0) || (num1 < 0 && num2 < 0);
    summaryRule = sameSign
      ? 'Pembagian tanda sama (positif ÷ positif ATAU negatif ÷ negatif) menghasilkan POSITIF (+).'
      : 'Pembagian beda tanda (positif ÷ negatif ATAU negatif ÷ positif) menghasilkan NEGATIF (−).';

    steps.push({
      stepNumber: 1,
      title: 'Tentukan Tanda Hasil Pembagian',
      expression: `${strNum1} ÷ ${strNum2}`,
      explanation: sameSign
        ? 'Kedua bilangan memiliki tanda yang SAMA, sehingga hasil pembagian bernilai POSITIF (+).'
        : 'Kedua bilangan memiliki tanda BEDA, sehingga hasil pembagian bernilai NEGATIF (−).',
      highlightRule: sameSign ? '(+)÷(+) = (+)  |  (−)÷(−) = (+)' : '(+)÷(−) = (−)  |  (−)÷(+) = (−)',
    });
    steps.push({
      stepNumber: 2,
      title: 'Bagi Nilai Mutlaknya',
      expression: `${Math.abs(num1)} ÷ ${Math.abs(num2)} = ${Math.abs(result)}`,
      explanation: `Hitung pembagian angka: ${Math.abs(num1)} ÷ ${Math.abs(num2)} = ${Math.abs(result)}.`,
    });
    steps.push({
      stepNumber: 3,
      title: 'Hasil Akhir',
      expression: `= ${result}`,
      explanation: `Hasil akhir pembagian adalah ${result}.`,
    });
  }

  const startPos = num1;
  let movement = 0;
  if (op === '+') movement = num2;
  else if (op === '-') movement = -num2;
  else movement = result - startPos;

  const finalPos = result;
  const allVals = [startPos, finalPos, 0, -5, 5];
  const minVal = Math.min(...allVals) - 3;
  const maxVal = Math.max(...allVals) + 3;

  return {
    numbers: [num1, num2],
    ops: [op],
    formattedExpression,
    result,
    steps,
    numberLine: {
      startPos,
      movement,
      finalPos,
      minView: minVal,
      maxView: maxVal,
    },
    summaryRule,
  };
}

