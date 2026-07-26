export type Difficulty = 'mudah' | 'sedang' | 'sulit' | 'acak' | 'grafik';

export interface QuadraticEquation {
  a: number;
  b: number;
  c: number;
  x1: number;
  x2: number;
  D: number;
  isReal: boolean;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateQuestion(difficulty: Difficulty, requireRationalRoots: boolean = false): QuadraticEquation {
  if (difficulty === 'acak') {
    const diffs: Difficulty[] = ['mudah', 'sedang', 'sulit'];
    difficulty = diffs[randomInt(0, 2)];
  }

  let a = 1, b = 0, c = 0, x1 = 0, x2 = 0;

  if (difficulty === 'grafik') {
    // Untuk mode grafik, kita butuh parabola yang sangat bervariasi
    const aValues = [-4, -3, -2, -1, 1, 2, 3, 4];
    a = aValues[randomInt(0, aValues.length - 1)];
    
    // Pilih vertex acak (xv, yv)
    const xv = randomInt(-5, 5);
    const yv = randomInt(-10, 10);
    
    // Bentuk ulang nilai b dan c berdasarkan (xv, yv)
    b = -2 * a * xv;
    c = a * xv * xv + yv;

    const D = b * b - 4 * a * c;
    if (D < 0) {
      x1 = NaN; x2 = NaN;
    } else {
      x1 = (-b + Math.sqrt(D)) / (2 * a);
      x2 = (-b - Math.sqrt(D)) / (2 * a);
    }
    
    return { a, b, c, x1, x2, D, isReal: D >= 0 };
  }

  if (difficulty === 'mudah') {
    // a = 1. Akar-akar bulat antara -10 s/d 10 (kecuali 0)
    x1 = randomInt(-10, 10);
    x2 = randomInt(-10, 10);
    if (x1 === 0) x1 = 2;
    if (x2 === 0) x2 = 3;

    a = 1;
    b = -(x1 + x2);
    c = x1 * x2;
  } else if (difficulty === 'sedang') {
    // a > 1 (2, 3, 4, 5). Akar bisa bulat atau pecahan sederhana.
    a = randomInt(2, 5);
    // kita generate dari akar pecahan: (px - q)(rx - s) = 0
    // a = pr, b = -ps - qr, c = qs
    const p = randomInt(1, 3);
    const r = randomInt(1, 3);
    const q = randomInt(-5, 5) || 1;
    const s = randomInt(-5, 5) || -1;
    
    a = p * r;
    b = -(p * s + q * r);
    c = q * s;
    x1 = q / p;
    x2 = s / r;
  } else if (difficulty === 'sulit') {
    // Probabilitas: 30% Imajiner, 30% Akar Kembar, 40% Angka besar/irasional
    const r = Math.random();
    if (r < 0.3) {
      // Imajiner (D < 0)
      a = randomInt(2, 6);
      b = randomInt(-5, 5);
      // Agar D = b^2 - 4ac < 0, maka 4ac > b^2 => c > b^2 / 4a
      const minC = Math.floor((b * b) / (4 * a)) + 1;
      c = randomInt(minC, minC + 10);
      x1 = NaN; // Imajiner
      x2 = NaN;
    } else if (r < 0.6) {
      // Akar Kembar (D = 0 => b^2 = 4ac)
      // Misal (px - q)^2 = 0 => p^2 x^2 - 2pq x + q^2 = 0
      const p = randomInt(1, 4);
      const q = randomInt(-5, 5) || 2;
      a = p * p;
      b = -2 * p * q;
      c = q * q;
      x1 = q / p;
      x2 = q / p;
    } else {
      // Angka Besar
      if (requireRationalRoots) {
        const p = randomInt(1, 5);
        const r = randomInt(1, 5);
        const q = randomInt(-12, 12) || 2;
        const s = randomInt(-12, 12) || -2;
        a = p * r;
        b = -(p * s + q * r);
        c = q * s;
        x1 = q / p;
        x2 = s / r;
      } else {
        a = randomInt(-10, 10) || 1;
        b = randomInt(-20, 20);
        c = randomInt(-20, 20);
        
        const D = b * b - 4 * a * c;
        if (D < 0) {
          x1 = NaN;
          x2 = NaN;
        } else {
          x1 = (-b + Math.sqrt(D)) / (2 * a);
          x2 = (-b - Math.sqrt(D)) / (2 * a);
        }
      }
    }
  }

  const D = b * b - 4 * a * c;
  return { a, b, c, x1, x2, D, isReal: D >= 0 };
}
