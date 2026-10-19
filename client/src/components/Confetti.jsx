import { useEffect, useRef } from 'react';

const COLORS = ['#6d4aff', '#a64bf4', '#ff4fa3', '#ffb938', '#2dd4a7'];

/** A short celebration burst (used when a student scores 80%+). */
export default function Confetti() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = Array.from({ length: 140 }, () => ({
      x: canvas.width / 2, y: canvas.height * 0.35,
      vx: (Math.random() - 0.5) * 16, vy: Math.random() * -14 - 4,
      size: Math.random() * 7 + 5, color: COLORS[Math.floor(Math.random() * COLORS.length)],
      spin: Math.random() * 6, turn: (Math.random() - 0.5) * 0.3,
    }));

    let frame;
    const started = performance.now();
    const draw = (now) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.spin += p.turn;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.spin);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      });
      if (now - started < 2600) frame = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  return <canvas ref={canvasRef} className="confetti" aria-hidden="true" />;
}
