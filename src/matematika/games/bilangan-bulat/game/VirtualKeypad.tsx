import React from 'react';
import { Delete, Check, RotateCcw } from 'lucide-react';

interface VirtualKeypadProps {
  onAppend: (digit: string) => void;
  onDelete: () => void;
  onClear: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export const VirtualKeypad: React.FC<VirtualKeypadProps> = ({
  onAppend,
  onDelete,
  onClear,
  onSubmit,
  disabled = false,
}) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '0'];

  return (
    <div className="w-full max-w-sm mx-auto space-y-2 select-none">
      <div className="grid grid-cols-3 gap-2">
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            disabled={disabled}
            onClick={() => onAppend(key)}
            className="py-3 sm:py-3.5 rounded-xl font-mono text-xl sm:text-2xl font-black border transition-all active:scale-95 flex items-center justify-center min-h-[48px] sm:min-h-[52px]"
            style={{
              background: key === '-' ? 'var(--badge-bg)' : 'var(--glass-bg)',
              borderColor: 'var(--card-border)',
              color: key === '-' ? 'var(--primary-accent)' : 'var(--text-primary)',
            }}
          >
            {key}
          </button>
        ))}

        {/* Backspace Delete Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={onDelete}
          className="py-3 sm:py-3.5 rounded-xl font-bold text-sm border transition-all active:scale-95 flex items-center justify-center min-h-[48px] sm:min-h-[52px]"
          style={{
            background: 'var(--badge-bg)',
            borderColor: 'var(--card-border)',
            color: '#f59e0b',
          }}
          title="Hapus Satu Karakter"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 pt-1">
        {/* Clear Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={onClear}
          className="col-span-1 py-3 rounded-xl font-bold text-xs sm:text-sm border transition-all active:scale-95 flex items-center justify-center gap-1 min-h-[44px]"
          style={{
            background: 'var(--glass-bg)',
            borderColor: 'var(--card-border)',
            color: 'var(--text-muted)',
          }}
          title="Bersihkan Input"
        >
          <RotateCcw className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        {/* Submit Answer Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={onSubmit}
          className="col-span-3 fisma-btn-primary py-3 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all min-h-[44px]"
        >
          <Check className="w-5 h-5 shrink-0" />
          <span>Jawab / Kirim</span>
        </button>
      </div>
    </div>
  );
};
