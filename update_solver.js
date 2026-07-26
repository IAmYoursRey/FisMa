const fs = require('fs');
let content = fs.readFileSync('src/matematika/games/bilangan-bulat/solver/SolverView.tsx', 'utf-8');

// 1. Fix Tab Selector (make it stack on very small screens, or at least wrap)
content = content.replace(
  'className="p-1 rounded-2xl border flex items-center justify-center gap-1 w-full sm:w-auto"',
  'className="p-1 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-1 w-full sm:w-auto"'
);

// 2. Fix Input Header icon shrink
content = content.replace(
  'className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md"',
  'className="w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center shadow-md"'
);

// 3. Fix Add/Remove buttons wrapper
content = content.replace(
  '<div className="flex items-center gap-2">',
  '<div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">'
);

// 4. Fix Add/Remove buttons themselves
content = content.replace(
  'className="p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all min-h-[40px] shadow-sm hover:scale-105"',
  'className="flex-1 sm:flex-initial p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all min-h-[40px] shadow-sm hover:scale-105"'
);
content = content.replace(
  'className="p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-40 min-h-[40px] opacity-80 hover:opacity-100"',
  'className="flex-1 sm:flex-initial p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all disabled:opacity-40 min-h-[40px] opacity-80 hover:opacity-100"'
);

// 5. Fix Result container to actually scroll horizontally
content = content.replace(
  'className="py-2 px-1 text-xl sm:text-4xl lg:text-5xl font-black font-mono flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center"',
  'className="py-2 px-1 text-2xl sm:text-4xl lg:text-5xl font-black font-mono overflow-x-auto whitespace-nowrap custom-scrollbar w-full"'
);
content = content.replace(
  '<span className="break-all leading-tight">{solution.formattedExpression}</span>',
  '<span className="leading-tight">{solution.formattedExpression}</span>'
);
content = content.replace(
  '<span className="leading-tight">=</span>',
  '<span className="leading-tight mx-2 sm:mx-4">=</span>'
);
content = content.replace(
  '<span className="break-all leading-tight" style={{ color: \'var(--primary-accent)\' }}>{solution.result}</span>',
  '<span className="leading-tight" style={{ color: \'var(--primary-accent)\' }}>{solution.result}</span>'
);

// 6. Fix "Selesaikan & Jelaskan Langkahnya" button text wrapping
content = content.replace(
  'className="fisma-btn-primary w-full py-3.5 sm:py-4 px-6 rounded-2xl text-sm sm:text-base font-extrabold flex items-center justify-center gap-2.5 shadow-lg active:scale-98 transition-all min-h-[48px]"',
  'className="fisma-btn-primary w-full py-3.5 sm:py-4 px-4 sm:px-6 rounded-2xl text-xs sm:text-base font-extrabold flex items-center justify-center gap-2 sm:gap-2.5 shadow-lg active:scale-98 transition-all min-h-[48px] text-center whitespace-normal"'
);


fs.writeFileSync('src/matematika/games/bilangan-bulat/solver/SolverView.tsx', content);
