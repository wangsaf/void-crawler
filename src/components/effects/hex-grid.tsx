"use client";

import { useEffect, useRef } from "react";

export function HexGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const hexSize = 30;
    const hexHeight = hexSize * Math.sqrt(3);
    let time = 0;

    const drawHex = (cx: number, cy: number, opacity: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const x = cx + hexSize * Math.cos(angle);
        const y = cy + hexSize * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.005;

      const cols = Math.ceil(canvas.width / (hexSize * 1.5)) + 1;
      const rows = Math.ceil(canvas.height / hexHeight) + 1;

      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const cx = col * hexSize * 1.5;
          const cy = row * hexHeight + (col % 2 === 0 ? 0 : hexHeight / 2);

          // Wave-like opacity based on position and time
          const wave = Math.sin(cx * 0.008 + cy * 0.006 + time * 2) * 0.5 + 0.5;
          const dist = Math.sqrt(
            Math.pow(cx - canvas.width / 2, 2) +
              Math.pow(cy - canvas.height / 2, 2)
          );
          const maxDist = Math.sqrt(
            Math.pow(canvas.width / 2, 2) + Math.pow(canvas.height / 2, 2)
          );
          const fade = 1 - dist / maxDist;
          const opacity = wave * fade * 0.08;

          if (opacity > 0.005) {
            drawHex(cx, cy, opacity);
          }
        }
      }

      requestAnimationFrame(animate);
    };

    const frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.2 }}
    />
  );
}
