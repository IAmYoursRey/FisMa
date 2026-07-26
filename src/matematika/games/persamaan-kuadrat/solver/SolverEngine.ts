export interface StepDetail {
  title: string;
  math: string;
  explanation: string;
}

export interface SolverResult {
  persamaan: string;
  diskriminan: number;
  jenisAkar: string;
  metodeDigunakan: string;
  langkahPenyelesaian: StepDetail[];
  kesimpulan: string;
}

export function fmt(num: number): string {
  if (Number.isInteger(num)) return num.toString();
  return num.toFixed(2).replace(/\.?0+$/, '');
}

export function formatEquation(a: number, b: number, c: number): string {
  let eq = '';
  
  if (a === 1) eq += 'x²';
  else if (a === -1) eq += '-x²';
  else eq += `${a}x²`;
  
  if (b > 0) eq += ` + ${b === 1 ? 'x' : b + 'x'}`;
  else if (b < 0) eq += ` - ${Math.abs(b) === 1 ? 'x' : Math.abs(b) + 'x'}`;
  
  if (c > 0) eq += ` + ${c}`;
  else if (c < 0) eq += ` - ${Math.abs(c)}`;
  
  eq += ' = 0';
  return eq;
}

export function solveQuadratic(a: number, b: number, c: number): SolverResult[] {
  if (a === 0) {
    throw new Error("Bukan persamaan kuadrat (a tidak boleh 0).");
  }

  const D = b * b - 4 * a * c;
  let jenisAkar = '';
  if (D > 0) jenisAkar = 'Dua Akar Real Berbeda';
  else if (D === 0) jenisAkar = 'Dua Akar Real Kembar';
  else jenisAkar = 'Akar Imajiner (Kompleks)';

  const equationStr = formatEquation(a, b, c);
  const results: SolverResult[] = [];

  // 1. Coba Faktorisasi
  const factorResult = tryFactorization(a, b, c, D, equationStr, jenisAkar);
  if (factorResult) results.push(factorResult);

  // 2. Melengkapkan Kuadrat Sempurna
  results.push(solveByCompletingSquare(a, b, c, D, equationStr, jenisAkar));

  // 3. Rumus ABC (Paling Umum)
  results.push(solveByABC(a, b, c, D, equationStr, jenisAkar));

  return results;
}

function tryFactorization(a: number, b: number, c: number, D: number, eqStr: string, jenisAkar: string): SolverResult | null {
  // Hanya bisa difaktorisasi rasional jika D adalah bilangan kuadrat sempurna (dan a,b,c rasional, di sini kita asumsikan integer)
  if (D < 0) return null; // Tidak bisa difaktorisasi di real bulat
  const sqrtD = Math.sqrt(D);
  if (!Number.isInteger(sqrtD)) return null; // Akarnya irasional, sulit difaktorisasi dengan angka bulat

  const langkah: StepDetail[] = [];
  
  langkah.push({
    title: "1. Identifikasi Koefisien",
    math: `a = ${a}, b = ${b}, c = ${c}`,
    explanation: "Pertama, kita identifikasi nilai a, b, dan c dari persamaan."
  });

  langkah.push({
    title: "2. Cari Pasangan Angka",
    math: `? \\times ? = ${a * c} \\\\ ? + ? = ${b}`,
    explanation: `Kita mencari dua bilangan yang jika dikalikan hasilnya ${a * c} (dari a × c) dan jika dijumlahkan hasilnya ${b} (dari b).`
  });

  // Cari p dan q
  let p = 0, q = 0;
  const ac = a * c;
  let found = false;
  for (let i = -Math.abs(ac); i <= Math.abs(ac); i++) {
    if (i === 0) continue;
    if (ac % i === 0) {
      let j = ac / i;
      if (i + j === b) {
        p = i;
        q = j;
        found = true;
        break;
      }
    }
  }
  
  // Jika c=0, ac=0. Loop di atas diskip. Handle c=0 khusus:
  if (c === 0) {
    p = 0;
    q = b;
    found = true;
  }

  if (!found) return null; // Gagal (failsafe)

  langkah.push({
    title: "3. Angka Ditemukan",
    math: `${p} \\times ${q} = ${ac} \\\\ ${p} + (${q}) = ${b}`,
    explanation: `Karena ${p} × ${q} = ${ac} dan ${p} + ${q} = ${b}, maka pasangan bilangannya adalah ${p} dan ${q}.`
  });

  let akar1Str = "", akar2Str = "";
  if (a === 1) {
    langkah.push({
      title: "4. Masukkan ke Bentuk Faktor",
      math: `(x ${p >= 0 ? '+ ' + p : '- ' + Math.abs(p)})(x ${q >= 0 ? '+ ' + q : '- ' + Math.abs(q)}) = 0`,
      explanation: "Karena a = 1, kita bisa langsung memasukkan p dan q ke dalam kurung faktor."
    });
    
    akar1Str = (-p).toString();
    akar2Str = (-q).toString();
  } else {
    langkah.push({
      title: "4. Pecah Suku Tengah",
      math: `${a}x^2 ${p >= 0 ? '+ ' + p : '- ' + Math.abs(p)}x ${q >= 0 ? '+ ' + q : '- ' + Math.abs(q)}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)} = 0`,
      explanation: "Karena a ≠ 1, kita pecah suku 'bx' menjadi 'px + qx', lalu faktorkan dengan pengelompokan."
    });
    // Simplified explanation for a!=1
    akar1Str = `${-p}/${a}`;
    if (Number.isInteger(-p / a)) akar1Str = (-p / a).toString();
    akar2Str = `${-q}/${a}`;
    if (Number.isInteger(-q / a)) akar2Str = (-q / a).toString();
  }

  langkah.push({
    title: "5. Selesaikan Persamaan",
    math: `x_1 = ${akar1Str} \\text{ atau } x_2 = ${akar2Str}`,
    explanation: "Kita dapat memisahkan faktor menjadi dua persamaan untuk mendapatkan nilai x."
  });

  return {
    persamaan: eqStr,
    diskriminan: D,
    jenisAkar,
    metodeDigunakan: "Faktorisasi",
    langkahPenyelesaian: langkah,
    kesimpulan: `Akar dari persamaan ini adalah x₁ = ${akar1Str} dan x₂ = ${akar2Str}. Kita bisa menggunakan metode faktorisasi karena nilai a, b, dan c membentuk kuadrat sempurna pada Diskriminannya.`
  };
}

function solveByCompletingSquare(a: number, b: number, c: number, D: number, eqStr: string, jenisAkar: string): SolverResult {
  const langkah: StepDetail[] = [];

  langkah.push({
    title: "1. Pindahkan Konstanta",
    math: `${formatEquation(a, b, 0).replace(' = 0', '')} = ${-c}`,
    explanation: "Langkah pertama adalah memindahkan konstanta c ke ruas kanan."
  });

  let currentEqLeft = `${formatEquation(a, b, 0).replace(' = 0', '')}`;
  let currentEqRight = -c;

  if (a !== 1) {
    currentEqRight = currentEqRight / a;
    langkah.push({
      title: "2. Bagi dengan a",
      math: `x^2 ${b/a >= 0 ? '+' : '-'} ${fmt(Math.abs(b/a))}x = ${fmt(currentEqRight)}`,
      explanation: `Bagi seluruh persamaan dengan a (${a}) agar koefisien x² menjadi 1.`
    });
  }

  const b_over_a = b / a;
  const half_b = b_over_a / 2;
  const half_b_sq = half_b * half_b;
  const right_side = currentEqRight + half_b_sq;

  langkah.push({
    title: "3. Tambahkan Kuadrat Setengah b",
    math: `x^2 ${b_over_a >= 0 ? '+' : '-'} ${fmt(Math.abs(b_over_a))}x + (${fmt(half_b)})^2 = ${fmt(currentEqRight)} + (${fmt(half_b)})^2`,
    explanation: `Kita harus melengkapi kuadrat dengan menambahkan kuadrat dari setengah koefisien x ke kedua ruas. Setengah dari ${fmt(b_over_a)} adalah ${fmt(half_b)}.`
  });

  langkah.push({
    title: "4. Ubah Jadi Kuadrat Sempurna",
    math: `(x ${half_b >= 0 ? '+' : '-'} ${fmt(Math.abs(half_b))})^2 = ${fmt(right_side)}`,
    explanation: "Ruas kiri sekarang merupakan bentuk kuadrat sempurna, dan ruas kanan disederhanakan."
  });

  if (right_side < 0) {
    langkah.push({
      title: "5. Akar Imajiner",
      math: `x ${half_b >= 0 ? '+' : '-'} ${fmt(Math.abs(half_b))} = \\pm \\sqrt{${fmt(right_side)}}`,
      explanation: "Karena nilai di ruas kanan negatif, akarnya bersifat imajiner (tidak ada solusi bilangan real)."
    });
  } else {
    langkah.push({
      title: "5. Akar Kuadrat",
      math: `x ${half_b >= 0 ? '+' : '-'} ${fmt(Math.abs(half_b))} = \\pm ${fmt(Math.sqrt(right_side))}`,
      explanation: "Tarik akar kuadrat di kedua ruas. Jangan lupa tambahkan tanda ± di ruas kanan."
    });
  }

  return {
    persamaan: eqStr,
    diskriminan: D,
    jenisAkar,
    metodeDigunakan: "Melengkapkan Kuadrat Sempurna",
    langkahPenyelesaian: langkah,
    kesimpulan: "Metode melengkapkan kuadrat selalu bisa digunakan untuk persamaan apa pun, meski melibatkan langkah pembagian yang kadang menghasilkan pecahan."
  };
}

function solveByABC(a: number, b: number, c: number, D: number, eqStr: string, jenisAkar: string): SolverResult {
  const langkah: StepDetail[] = [];

  langkah.push({
    title: "1. Identifikasi Koefisien",
    math: `a = ${a}, b = ${b}, c = ${c}`,
    explanation: "Identifikasi terlebih dahulu koefisien-koefisien dari persamaan kuadrat."
  });

  langkah.push({
    title: "2. Rumus Kuadratik (ABC)",
    math: `x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}`,
    explanation: "Tuliskan rumus abc (rumus kuadratik) yang merupakan rumus pasti pencarian akar."
  });

  langkah.push({
    title: "3. Substitusi Nilai",
    math: `x = \\frac{-(${b}) \\pm \\sqrt{(${b})^2 - 4(${a})(${c})}}{2(${a})}`,
    explanation: "Masukkan nilai a, b, dan c ke dalam rumus."
  });

  langkah.push({
    title: "4. Hitung Diskriminan (D)",
    math: `D = ${b*b} - ${4*a*c} = ${D}`,
    explanation: `Diskriminan (D = b²-4ac) bernilai ${D}. Karena D ${D > 0 ? '> 0' : D === 0 ? '= 0' : '< 0'}, maka persamaan ini memiliki ${jenisAkar.toLowerCase()}.`
  });

  if (D >= 0) {
    const sqrtD = Math.sqrt(D);
    langkah.push({
      title: "5. Hitung Nilai X",
      math: `x = \\frac{${-b} \\pm ${fmt(sqrtD)}}{${2*a}}`,
      explanation: `Karena akar dari ${D} adalah ${fmt(sqrtD)}, kita bisa mencari dua kemungkinan nilai x.`
    });
    
    const x1 = (-b + sqrtD) / (2 * a);
    const x2 = (-b - sqrtD) / (2 * a);

    langkah.push({
      title: "6. Hasil Akhir",
      math: `x_1 = ${fmt(x1)} \\text{ dan } x_2 = ${fmt(x2)}`,
      explanation: `Pisahkan operasi '+' dan '-' untuk mendapatkan hasil akhirnya.`
    });
  } else {
    langkah.push({
      title: "5. Nilai Imajinari",
      math: `x = \\frac{${-b} \\pm i\\sqrt{${Math.abs(D)}}}{${2*a}}`,
      explanation: `Karena akar negatif tidak dapat didefinisikan dalam bilangan real, kita menggunakan imajiner 'i'.`
    });
  }

  return {
    persamaan: eqStr,
    diskriminan: D,
    jenisAkar,
    metodeDigunakan: "Rumus ABC",
    langkahPenyelesaian: langkah,
    kesimpulan: "Rumus ABC adalah metode paling universal yang bisa menemukan akar bagaimanapun bentuk dan angkanya."
  };
}
