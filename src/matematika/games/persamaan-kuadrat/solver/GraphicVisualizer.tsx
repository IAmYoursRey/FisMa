import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../../../services/themeService';

interface GraphicProps {
  a: number;
  b: number;
  c: number;
  width?: number;
  height?: number;
}

export const GraphicVisualizer: React.FC<GraphicProps> = ({ a, b, c, width = 400, height = 300 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Bersihkan canvas
    ctx.clearRect(0, 0, width, height);

    // Dapatkan warna dari variabel CSS FisMa
    const computedStyle = getComputedStyle(document.body);
    const gridColor = computedStyle.getPropertyValue('--card-border') || '#334155';
    const axisColor = computedStyle.getPropertyValue('--text-primary') || '#94a3b8';
    const curveColor = computedStyle.getPropertyValue('--primary-accent') || '#3b82f6';
    
    // 1. Perhitungan Batas Matematis Dinamis
    const D = b * b - 4 * a * c;
    const xv = -b / (2 * a);
    const yv = c - (b * b) / (4 * a);

    // Hitung jarak x yang perlu ditampilkan (ke akar jika ada, minimal 5)
    const rootDist = D >= 0 ? Math.sqrt(D) / (2 * Math.abs(a)) : 0;
    const rangeX = Math.max(rootDist * 1.5, 5);
    
    // Hitung jarak y yang perlu ditampilkan (dari puncak ke sumbu X)
    const yMax = Math.max(0, yv);
    const yMin = Math.min(0, yv);
    const rangeY = Math.max((yMax - yMin) / 2 + 2, 5);

    // Pusat Kamera
    const xc = xv;
    const yc = (yMax + yMin) / 2;

    // Skala (Pixel per Unit), gunakan rasio yang sama untuk X dan Y agar kurva tidak distorsi
    const scaleX = (width / 2) / rangeX;
    const scaleY = (height / 2) / rangeY;
    const scale = Math.min(scaleX, scaleY, 40); // Max zoom adalah 40

    // Helper konversi ke Pixel
    const toPixelX = (x: number) => (width / 2) + (x - xc) * scale;
    const toPixelY = (y: number) => (height / 2) - (y - yc) * scale;

    // 2. Perhitungan Interval Grid Dinamis
    const steps = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
    let gridInterval = 1;
    for (const step of steps) {
      if (step * scale >= 30) {
        gridInterval = step;
        break;
      }
    }

    const startX = Math.floor((xc - (width / 2) / scale) / gridInterval) * gridInterval;
    const endX = xc + (width / 2) / scale;
    const startY = Math.floor((yc - (height / 2) / scale) / gridInterval) * gridInterval;
    const endY = yc + (height / 2) / scale;

    // 3. Gambar Grid
    ctx.strokeStyle = gridColor.trim();
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = startX; x <= endX; x += gridInterval) {
      const px = toPixelX(x);
      ctx.moveTo(px, 0); ctx.lineTo(px, height);
    }
    for (let y = startY; y <= endY; y += gridInterval) {
      const py = toPixelY(y);
      ctx.moveTo(0, py); ctx.lineTo(width, py);
    }
    ctx.stroke();

    // 4. Gambar Sumbu Koordinat (Hanya jika masuk dalam layar)
    ctx.strokeStyle = axisColor.trim();
    ctx.lineWidth = 2;
    ctx.beginPath();
    const originX = toPixelX(0);
    const originY = toPixelY(0);
    
    if (originY >= 0 && originY <= height) {
      ctx.moveTo(0, originY); ctx.lineTo(width, originY); // Sumbu X
    }
    if (originX >= 0 && originX <= width) {
      ctx.moveTo(originX, 0); ctx.lineTo(originX, height); // Sumbu Y
    }
    ctx.stroke();

    // 5. Gambar Kurva Parabola
    ctx.strokeStyle = curveColor.trim();
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    let first = true;
    for (let px = 0; px <= width; px += 2) {
      const mathX = xc + (px - width / 2) / scale;
      const mathY = a * mathX * mathX + b * mathX + c;
      const py = toPixelY(mathY);
      
      if (first) {
        ctx.moveTo(px, py);
        first = false;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    // 6. Tandai Titik Puncak (Vertex)
    const pVertexX = toPixelX(xv);
    const pVertexY = toPixelY(yv);
    ctx.fillStyle = curveColor.trim();
    ctx.beginPath();
    ctx.arc(pVertexX, pVertexY, 5, 0, Math.PI * 2);
    ctx.fill();

    // 7. Tandai Akar (Jika ada)
    if (D >= 0) {
      const x1 = (-b + Math.sqrt(D)) / (2 * a);
      const x2 = (-b - Math.sqrt(D)) / (2 * a);
      ctx.fillStyle = '#10b981'; // Emerald 500
      ctx.beginPath();
      ctx.arc(toPixelX(x1), toPixelY(0), 4, 0, Math.PI * 2);
      ctx.arc(toPixelX(x2), toPixelY(0), 4, 0, Math.PI * 2);
      ctx.fill();
    }

  }, [a, b, c, width, height, theme]);

  return (
    <div className="flex items-center justify-center p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--card-border)] w-full">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="max-w-full h-auto bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] shadow-inner"
      />
    </div>
  );
};
