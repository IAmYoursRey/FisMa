import React from 'react';
import { NumberLineState } from './SolverEngine';

interface NumberLineVisualizerProps {
  state: NumberLineState;
}

export const NumberLineVisualizer: React.FC<NumberLineVisualizerProps> = ({ state }) => {
  const { startPos, movement, finalPos, minView, maxView } = state;

  // Determine raw min and max
  const maxAbs = Math.max(Math.abs(startPos), Math.abs(finalPos), 15);

  // Determine step size to ensure exactly 15 ticks on left and right
  let step = 1;
  if (maxAbs > 15) {
    const possibleSteps = [2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000, 10000];
    for (const s of possibleSteps) {
      if (15 * s >= maxAbs) {
        step = s;
        break;
      }
    }
    // Fallback if still too large
    if (step === 1) step = Math.ceil(maxAbs / 15);
  }

  // Snap to step multiples symmetrically
  const rangeMin = -15 * step;
  const rangeMax = 15 * step;

  const ticks: number[] = [];
  for (let i = rangeMin; i <= rangeMax; i += step) {
    ticks.push(i);
  }

  // Ensure startPos, finalPos, and 0 are included for rendering pins/labels
  if (!ticks.includes(0)) ticks.push(0);
  if (!ticks.includes(startPos)) ticks.push(startPos);
  if (!ticks.includes(finalPos)) ticks.push(finalPos);

  ticks.sort((a, b) => a - b);

  // Dynamic SVG width based on number of ticks to allow horizontal scrolling
  const svgWidth = Math.max(800, ticks.length * 55);
  const svgHeight = 180;
  const paddingX = 50;
  const lineY = 100;

  const getX = (val: number) => {
    const norm = (val - rangeMin) / (rangeMax - rangeMin);
    return paddingX + norm * (svgWidth - 2 * paddingX);
  };

  const startX = getX(startPos);
  const finalX = getX(finalPos);
  const zeroX = getX(0);

  const arcHeight = Math.min(60, Math.abs(finalX - startX) * 0.3 + 20);
  const isRight = movement >= 0;

  return (
    <div className="w-full overflow-x-auto p-2 custom-scrollbar">
      <div className="min-w-[600px] text-center">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto select-none"
        >
          <defs>
            <marker
              id="arrowhead-right"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="var(--primary-accent)" />
            </marker>
            <marker
              id="arrowhead-left"
              markerWidth="8"
              markerHeight="6"
              refX="1"
              refY="3"
              orient="auto"
            >
              <polygon points="8 0, 0 3, 8 6" fill="var(--primary-accent)" />
            </marker>
          </defs>

          {/* Main Axis Line */}
          <line
            x1={paddingX - 15}
            y1={lineY}
            x2={svgWidth - paddingX + 15}
            y2={lineY}
            stroke="var(--card-border)"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Zero Marker Highlight */}
          <line
            x1={zeroX}
            y1={lineY - 12}
            x2={zeroX}
            y2={lineY + 12}
            stroke="var(--text-muted)"
            strokeWidth="3"
          />
          <text
            x={zeroX}
            y={lineY + 30}
            fill="var(--text-muted)"
            fontSize="14"
            fontWeight="bold"
            textAnchor="middle"
          >
            0
          </text>

          {/* Ticks and Numbers */}
          {ticks.map((tick) => {
            if (tick === 0) return null; // handled above
            const tx = getX(tick);
            const isKey = tick === startPos || tick === finalPos;

            return (
              <g key={tick}>
                <line
                  x1={tx}
                  y1={lineY - 6}
                  x2={tx}
                  y2={lineY + 6}
                  stroke={isKey ? 'var(--primary-accent)' : 'var(--glass-border)'}
                  strokeWidth={isKey ? '3' : '2'}
                />
                <text
                  x={tx}
                  y={lineY + (isKey ? 32 : 28)}
                  fill={isKey ? 'var(--text-primary)' : 'var(--text-secondary)'}
                  fontSize={isKey ? '20' : '12'}
                  fontWeight={isKey ? '900' : 'normal'}
                  textAnchor="middle"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Jump Arc / Arrow */}
          {movement !== 0 && (
            <g>
              <path
                d={`M ${startX} ${lineY - 15} Q ${(startX + finalX) / 2} ${
                  lineY - 15 - arcHeight
                } ${finalX} ${lineY - 15}`}
                fill="none"
                stroke="var(--primary-accent)"
                strokeWidth="3"
                strokeDasharray="5 3"
                markerEnd={isRight ? 'url(#arrowhead-right)' : 'url(#arrowhead-left)'}
              />
              <text
                x={(startX + finalX) / 2}
                y={lineY - 24 - arcHeight / 2}
                fill="var(--primary-accent)"
                fontSize="20"
                fontWeight="900"
                textAnchor="middle"
              >
                {movement > 0 ? `+${movement} (Kanan)` : `${movement} (Kiri)`}
              </text>
            </g>
          )}

          {/* Start Point Pin */}
          <circle
            cx={startX}
            cy={lineY}
            r="8"
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth="2.5"
          />

          {/* Final Landing Pin */}
          <circle
            cx={finalX}
            cy={lineY}
            r="9"
            fill="#10b981"
            stroke="#ffffff"
            strokeWidth="2.5"
          />
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-center gap-8 mt-2 text-sm font-bold">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500 shadow-sm" />
            <span style={{ color: 'var(--text-secondary)' }}>Titik Awal ({startPos})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-sm" />
            <span style={{ color: 'var(--text-secondary)' }}>Hasil Akhir ({finalPos})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
