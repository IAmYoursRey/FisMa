import { CryptarithmConfig, MathOperation, PuzzleData, SolverResult, SolverSolution } from '../../types/cryptarithm';

const ALPHABET_POOL = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

/**
 * Generates a random Cryptarithm puzzle based on dynamic row count (2 to 5 rows)
 * and dynamic digit count per row (2 to 8 digits).
 */
export function generateCryptarithmPuzzle(config: CryptarithmConfig): PuzzleData {
  const op = config.operation;
  const numOperandRows = Math.min(Math.max(config.rowCount || 2, 2), 5);
  const defaultDigit = Math.min(Math.max(config.digitCount || 3, 1), 8);

  // Prepare digit length for each operand term and the result term
  const termDigitLengths: number[] = [];
  for (let i = 0; i < numOperandRows; i++) {
    const len = config.rowDigits && config.rowDigits[i] ? config.rowDigits[i] : defaultDigit;
    termDigitLengths.push(Math.min(Math.max(len, 1), 8));
  }

  // Determine result digit length
  let resultDigitLen = config.rowDigits && config.rowDigits[numOperandRows] ? config.rowDigits[numOperandRows] : defaultDigit;
  if (op === '+') {
    const maxOperandDigit = Math.max(...termDigitLengths);
    resultDigitLen = Math.max(resultDigitLen, maxOperandDigit);
  } else if (op === '*') {
    const sumDigits = termDigitLengths.reduce((a, b) => a + b, 0);
    resultDigitLen = Math.min(Math.max(resultDigitLen, termDigitLengths[0]), sumDigits);
  } else if (op === '-') {
    resultDigitLen = Math.min(resultDigitLen, termDigitLengths[0]);
  }

  let operandNums: number[] = [];
  let resultNum = 0;
  let tries = 0;
  const maxTries = 500;

  while (tries < maxTries) {
    tries++;
    operandNums = [];

    if (op === '+') {
      let currentSum = 0;
      for (let i = 0; i < numOperandRows; i++) {
        const dLen = termDigitLengths[i];
        const minVal = Math.pow(10, dLen - 1);
        const maxVal = Math.pow(10, dLen) - 1;
        const val = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
        operandNums.push(val);
        currentSum += val;
      }
      resultNum = currentSum;
    } else if (op === '-') {
      // Subtraction works on 2 operands: term0 - term1 = result
      const d0 = termDigitLengths[0];
      const min0 = Math.pow(10, d0 - 1);
      const max0 = Math.pow(10, d0) - 1;
      const num0 = Math.floor(Math.random() * (max0 - min0 + 1)) + min0;

      const d1 = termDigitLengths[1] || d0;
      const min1 = Math.pow(10, d1 - 1);
      const max1 = Math.min(Math.pow(10, d1) - 1, num0 - 1);
      if (max1 < min1) continue;

      const num1 = Math.floor(Math.random() * (max1 - min1 + 1)) + min1;
      operandNums = [num0, num1];
      resultNum = num0 - num1;
    } else if (op === '*') {
      // Multiplication on 2 operands: term0 * term1 = result
      const d0 = termDigitLengths[0];
      const min0 = Math.pow(10, d0 - 1);
      const max0 = Math.pow(10, d0) - 1;
      const num0 = Math.floor(Math.random() * (max0 - min0 + 1)) + min0;

      const d1 = termDigitLengths[1] || 2;
      const min1 = Math.pow(10, d1 - 1);
      const max1 = Math.pow(10, d1) - 1;
      const num1 = Math.floor(Math.random() * (max1 - min1 + 1)) + min1;

      operandNums = [num0, num1];
      resultNum = num0 * num1;
    }

    if (resultNum && resultNum.toString().length === resultDigitLen) {
      break;
    }
  }

  // Fallback if loop hit limit
  if (!resultNum || resultNum <= 0) {
    operandNums = termDigitLengths.map((len) => Math.pow(10, len - 1));
    if (op === '+') {
      resultNum = operandNums.reduce((a, b) => a + b, 0);
    } else if (op === '-') {
      operandNums[0] = Math.pow(10, termDigitLengths[0] - 1) + 5;
      operandNums[1] = Math.pow(10, (termDigitLengths[1] || 2) - 1);
      resultNum = operandNums[0] - operandNums[1];
    } else {
      resultNum = operandNums.reduce((a, b) => a * b, 1);
    }
  }

  const allNumStrings = [...operandNums.map((n) => n.toString()), resultNum.toString()];
  const combinedDigitsStr = allNumStrings.join('');
  const uniqueDigits = Array.from(new Set(combinedDigitsStr.split('')));

  if (uniqueDigits.length > ALPHABET_POOL.length) {
    // Retry with a fresh seed
    return generateCryptarithmPuzzle({
      ...config,
      digitCount: Math.max(2, defaultDigit - 1),
    });
  }

  const digitToLetterMap: Record<string, string> = {};
  const letterToDigitMap: Record<string, number> = {};

  uniqueDigits.forEach((digit, idx) => {
    const letter = ALPHABET_POOL[idx];
    digitToLetterMap[digit] = letter;
    letterToDigitMap[letter] = parseInt(digit, 10);
  });

  const terms = operandNums.map((num) =>
    num
      .toString()
      .split('')
      .map((d) => digitToLetterMap[d])
      .join('')
  );

  const resultTerm = resultNum
    .toString()
    .split('')
    .map((d) => digitToLetterMap[d])
    .join('');

  return {
    terms,
    resultTerm,
    termNumbers: operandNums,
    resultNumber: resultNum,
    solutionMap: letterToDigitMap,
    operation: op,

    // Backward compatibility
    term1Str: terms[0] || '',
    term2Str: terms[1] || '',
    term3Str: resultTerm,
    num1: operandNums[0] || 0,
    num2: operandNums[1] || 0,
    num3: resultNum,
  };
}

/**
 * Validates user's letter assignment inputs across N terms.
 */
export function validateAnswer(
  puzzle: PuzzleData,
  userMap: Record<string, number | undefined>
): {
  isValid: boolean;
  message: string;
  evaluatedNums?: { operandNums: number[]; resultNum: number };
} {
  const letters = Object.keys(puzzle.solutionMap);

  // 1. Check completeness
  for (const letter of letters) {
    if (userMap[letter] === undefined || isNaN(userMap[letter] as number)) {
      return { isValid: false, message: 'Harap isi nilai angka untuk semua huruf!' };
    }
  }

  const userDigits = letters.map((l) => userMap[l] as number);

  // 2. Check for duplicate digits
  const uniqueUserDigits = new Set(userDigits);
  if (userDigits.length !== uniqueUserDigits.size) {
    return {
      isValid: false,
      message: 'Setiap huruf harus memiliki angka yang berbeda (tidak boleh ganda)!',
    };
  }

  // 3. Leading zero check
  const evaluatedOperandStrings = puzzle.terms.map((term) =>
    term
      .split('')
      .map((ch) => userMap[ch])
      .join('')
  );
  const evaluatedResultString = puzzle.resultTerm
    .split('')
    .map((ch) => userMap[ch])
    .join('');

  const allStrings = [...evaluatedOperandStrings, evaluatedResultString];
  for (const str of allStrings) {
    if (str.length > 1 && str[0] === '0') {
      return {
        isValid: false,
        message: 'Angka pertama pada kata/baris tidak boleh 0!',
      };
    }
  }

  const evaluatedOperandNums = evaluatedOperandStrings.map((s) => parseInt(s, 10));
  const evaluatedResultNum = parseInt(evaluatedResultString, 10);

  let isCorrect = false;
  if (puzzle.operation === '+') {
    const sum = evaluatedOperandNums.reduce((a, b) => a + b, 0);
    isCorrect = sum === evaluatedResultNum;
  } else if (puzzle.operation === '-') {
    isCorrect = evaluatedOperandNums[0] - evaluatedOperandNums[1] === evaluatedResultNum;
  } else if (puzzle.operation === '*') {
    const prod = evaluatedOperandNums.reduce((a, b) => a * b, 1);
    isCorrect = prod === evaluatedResultNum;
  }

  if (isCorrect) {
    const opSym = puzzle.operation === '*' ? '×' : puzzle.operation;
    const equationStr = `${evaluatedOperandNums.join(` ${opSym} `)} = ${evaluatedResultNum}`;
    return {
      isValid: true,
      message: `Benar! Persamaan Valid: ${equationStr}`,
      evaluatedNums: { operandNums: evaluatedOperandNums, resultNum: evaluatedResultNum },
    };
  }

  return {
    isValid: false,
    message: 'Jawaban kurang tepat. Periksa kembali kombinasi angka Anda!',
  };
}

/**
 * Solves an arbitrary N-term Cryptarithm equation using backtracking permutation.
 */
export function solveCryptarithmEquation(
  operandTerms: string[],
  resultTerm: string,
  operation: MathOperation
): SolverResult {
  const cleanOperandTerms = operandTerms
    .map((t) => t.trim().toUpperCase())
    .filter((t) => t.length > 0);
  const cleanResultTerm = resultTerm.trim().toUpperCase();

  if (cleanOperandTerms.length < 2 || !cleanResultTerm) {
    return {
      solutions: [],
      terms: cleanOperandTerms,
      resultTerm: cleanResultTerm,
      operation,
      error: 'Harap isi huruf pada minimal 2 baris operan dan 1 baris hasil!',
    };
  }

  const fullStr = [...cleanOperandTerms, cleanResultTerm].join('');
  const letters = Array.from(new Set(fullStr.split('')));

  if (letters.length > 10) {
    return {
      solutions: [],
      terms: cleanOperandTerms,
      resultTerm: cleanResultTerm,
      operation,
      error: 'Terlalu banyak huruf unik (Maksimal 10 huruf unik untuk angka 0-9).',
    };
  }

  const leadingLetters = new Set<string>();
  cleanOperandTerms.forEach((t) => {
    if (t.length > 1) leadingLetters.add(t[0]);
  });
  if (cleanResultTerm.length > 1) leadingLetters.add(cleanResultTerm[0]);

  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const solutions: SolverSolution[] = [];

  function permute(
    letterIndex: number,
    currentAssignment: Record<string, number>,
    usedDigits: Set<number>
  ) {
    if (letterIndex === letters.length) {
      const nums = cleanOperandTerms.map((t) =>
        parseInt(
          t
            .split('')
            .map((ch) => currentAssignment[ch])
            .join(''),
          10
        )
      );
      const resNum = parseInt(
        cleanResultTerm
          .split('')
          .map((ch) => currentAssignment[ch])
          .join(''),
        10
      );

      let isMatch = false;
      if (operation === '+') {
        const sum = nums.reduce((a, b) => a + b, 0);
        if (sum === resNum) isMatch = true;
      } else if (operation === '-') {
        if (nums[0] - nums[1] === resNum) isMatch = true;
      } else if (operation === '*') {
        const prod = nums.reduce((a, b) => a * b, 1);
        if (prod === resNum) isMatch = true;
      }

      if (isMatch) {
        solutions.push({
          assignment: { ...currentAssignment },
          termNumbers: nums,
          resultNumber: resNum,
          num1: nums[0],
          num2: nums[1],
          num3: resNum,
        });
      }
      return;
    }

    const currentLetter = letters[letterIndex];

    for (const d of digits) {
      if (usedDigits.has(d)) continue;
      if (d === 0 && leadingLetters.has(currentLetter)) continue;

      currentAssignment[currentLetter] = d;
      usedDigits.add(d);

      permute(letterIndex + 1, currentAssignment, usedDigits);

      usedDigits.delete(d);
      delete currentAssignment[currentLetter];
    }
  }

  permute(0, {}, new Set<number>());

  return {
    solutions,
    terms: cleanOperandTerms,
    resultTerm: cleanResultTerm,
    operation,
  };
}
