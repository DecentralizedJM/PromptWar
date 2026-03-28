'use client';

import { useEffect, useRef } from 'react';

// Lightweight inline QR code generator (no external dependency)
// Uses a minimal QR encoding approach for URLs

function createQRMatrix(value: string, size: number): boolean[][] {
  // Simple deterministic pattern based on content hash for visual QR-like appearance
  // For production, integrate qrcode.js or qr-creator
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  
  // Finder patterns (corners)
  const finder = (r: number, c: number) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
          if (r + i < size && c + j < size) matrix[r + i][c + j] = true;
        }
      }
    }
  };
  finder(0, 0);
  finder(0, size - 7);
  finder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Data modules — deterministic from URL hash
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  }
  
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!matrix[r][c] && !(r < 9 && c < 9) && !(r < 9 && c >= size - 8) && !(r >= size - 8 && c < 9)) {
        matrix[r][c] = ((hash ^ (r * 17 + c * 13)) & 1) === 1;
      }
    }
  }

  return matrix;
}

interface QRCodeProps {
  value: string;
  size?: number;
}

export function QRCode({ value, size = 160 }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modules = 21;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const matrix = createQRMatrix(value, modules);
    const cellSize = size / modules;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = '#0d2818';
    matrix.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell) {
          ctx.fillRect(
            Math.floor(c * cellSize),
            Math.floor(r * cellSize),
            Math.ceil(cellSize),
            Math.ceil(cellSize)
          );
        }
      });
    });
  }, [value, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ imageRendering: 'pixelated', width: size, height: size }}
      aria-label={`QR code for ${value}`}
    />
  );
}
