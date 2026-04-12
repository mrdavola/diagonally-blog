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

const PARTICLE_COUNT_DESKTOP = 90;
const PARTICLE_COUNT_MOBILE = 60;
const CONNECTION_DISTANCE = 120;
const CONNECTION_DISTANCE_SQ = CONNECTION_DISTANCE * CONNECTION_DISTANCE;
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

    // Check prefers-reduced-motion
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const parent = canvas.parentElement;

    // Size canvas to its parent
    const resize = () => {
      const w = parent ? parent.clientWidth : window.innerWidth;
      const h = parent ? parent.clientHeight : window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      const count = w < 768 ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;
      particlesRef.current = Array.from({ length: count }, () =>
        createParticle(w, h)
      );
    };

    resize();

    // Draw static frame (used for reduced-motion and first paint)
    const drawStatic = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const grd = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.min(w, h) * 0.5);
      grd.addColorStop(0, "rgba(96, 165, 250, 0.05)");
      grd.addColorStop(1, "rgba(96, 165, 250, 0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
      }

      drawConnections(particles, w, h);
    };

    // Spatial-hash connection drawing: only check particles in adjacent cells
    const drawConnections = (particles: Particle[], w: number, h: number) => {
      const cellSize = CONNECTION_DISTANCE;
      const cols = Math.ceil(w / cellSize) + 1;

      // Build grid: map cell index -> particle indices
      const grid = new Map<number, number[]>();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const col = Math.floor(p.x / cellSize);
        const row = Math.floor(p.y / cellSize);
        const key = row * cols + col;
        let cell = grid.get(key);
        if (!cell) { cell = []; grid.set(key, cell); }
        cell.push(i);
      }

      // For each particle, only check particles in the same + right/below cells
      // (upper-triangular traversal to avoid duplicate pairs)
      const checked = new Uint8Array(particles.length * particles.length);

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        const col = Math.floor(a.x / cellSize);
        const row = Math.floor(a.y / cellSize);

        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = row + dr;
            const nc = col + dc;
            if (nr < 0 || nc < 0) continue;
            const key = nr * cols + nc;
            const cell = grid.get(key);
            if (!cell) continue;

            for (let ci = 0; ci < cell.length; ci++) {
              const j = cell[ci];
              if (j <= i) continue; // upper-triangular only
              if (checked[i * particles.length + j]) continue;
              checked[i * particles.length + j] = 1;

              const b = particles[j];
              const dx = a.x - b.x;
              const dy = a.y - b.y;
              const distSq = dx * dx + dy * dy;

              if (distSq < CONNECTION_DISTANCE_SQ) {
                const dist = Math.sqrt(distSq);
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
        }
      }
    };

    if (reducedMotion) {
      drawStatic();
      // Still observe resize for static render
      const resizeObserver = new ResizeObserver(resize);
      if (parent) resizeObserver.observe(parent);
      else resizeObserver.observe(canvas);
      const handleResize = () => drawStatic();
      const ro = new ResizeObserver(() => { resize(); drawStatic(); });
      if (parent) ro.observe(parent);
      else ro.observe(canvas);
      resizeObserver.disconnect();
      return () => ro.disconnect();
    }

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

      // Draw connections using spatial hashing
      drawConnections(particles, w, h);

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
