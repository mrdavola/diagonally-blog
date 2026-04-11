"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

interface ConstellationProps {
  className?: string;
}

const PARTICLE_COUNT = 90;
const CONNECTION_DISTANCE = 120;
const MAX_LINE_OPACITY = 0.15;

function createParticle(width: number, height: number): Particle {
  const speed = () => (Math.random() * 0.2 + 0.1) * (Math.random() < 0.5 ? 1 : -1);
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: speed(),
    vy: speed(),
    radius: Math.random() * 1 + 1,
    opacity: Math.random() * 0.4 + 0.3,
  };
}

export function Constellation({ className = "" }: ConstellationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const visibleRef = useRef<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;

    // Size canvas to its parent
    const resize = () => {
      const w = parent ? parent.clientWidth : window.innerWidth;
      const h = parent ? parent.clientHeight : window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      // Reinitialize particles on resize
      particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () =>
        createParticle(w, h)
      );
    };

    resize();

    // Animation loop
    const draw = (timestamp: number) => {
      if (!visibleRef.current) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const delta = lastTimeRef.current ? Math.min((timestamp - lastTimeRef.current) / 16.67, 3) : 1;
      lastTimeRef.current = timestamp;

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Radial gradient center glow
      const grd = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.min(w, h) * 0.5);
      grd.addColorStop(0, "rgba(96, 165, 250, 0.05)");
      grd.addColorStop(1, "rgba(96, 165, 250, 0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      const particles = particlesRef.current;

      // Update + draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx * delta;
        p.y += p.vy * delta;

        // Wrap edges
        if (p.x < -5) p.x = w + 5;
        else if (p.x > w + 5) p.x = -5;
        if (p.y < -5) p.y = h + 5;
        else if (p.y > h + 5) p.y = -5;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE) {
            const lineOpacity = (1 - dist / CONNECTION_DISTANCE) * MAX_LINE_OPACITY;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${lineOpacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    // IntersectionObserver to pause when off screen
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(canvas);

    // ResizeObserver
    const resizeObserver = new ResizeObserver(resize);
    if (parent) resizeObserver.observe(parent);
    else resizeObserver.observe(canvas);

    return () => {
      cancelAnimationFrame(rafRef.current);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
}

export default Constellation;
