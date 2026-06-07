"use client";

import { useEffect, useRef } from "react";

type Point = {
  x: number;
  y: number;
};

type StringCursorProps = {
  color?: string;
  activeColor?: string;
  trailLength?: number;
};

const INTERACTIVE_SELECTOR =
  "a, button, input, textarea, select, summary, [role='button'], [data-cursor-active]";

export function StringCursor({
  color = "#ff5caf",
  activeColor = "#B8FF28",
  trailLength = 22,
}: StringCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<Point>({ x: 0, y: 0 });
  const pointsRef = useRef<Point[]>([]);
  const frameRef = useRef<number>(0);
  const hasMovedRef = useRef(false);
  const activeRef = useRef(false);

  useEffect(() => {
    const canUseCursor =
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!canUseCursor) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    document.documentElement.classList.add("string-cursor-enabled");

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    const resetPoints = (x: number, y: number) => {
      pointsRef.current = Array.from({ length: trailLength }, () => ({ x, y }));
    };

    const handleMove = (event: MouseEvent) => {
      mouseRef.current.x = event.clientX;
      mouseRef.current.y = event.clientY;

      if (!hasMovedRef.current) {
        resetPoints(event.clientX, event.clientY);
        hasMovedRef.current = true;
      }

      const target = event.target;
      activeRef.current =
        target instanceof Element &&
        Boolean(target.closest(INTERACTIVE_SELECTOR));
    };

    const handleLeave = () => {
      hasMovedRef.current = false;
      activeRef.current = false;
    };

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const points = pointsRef.current;
      if (points.length === 0) {
        frameRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      points[0].x = mouseRef.current.x;
      points[0].y = mouseRef.current.y;

      for (let index = 1; index < points.length; index += 1) {
        points[index].x += (points[index - 1].x - points[index].x) * 0.38;
        points[index].y += (points[index - 1].y - points[index].y) * 0.38;
      }

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(points[0].x * dpr, points[0].y * dpr);

      for (let index = 1; index < points.length - 1; index += 1) {
        const midX = ((points[index].x + points[index + 1].x) / 2) * dpr;
        const midY = ((points[index].y + points[index + 1].y) / 2) * dpr;
        ctx.quadraticCurveTo(points[index].x * dpr, points[index].y * dpr, midX, midY);
      }

      ctx.shadowColor = "rgba(17, 17, 17, 0.28)";
      const isActive = activeRef.current;

      ctx.shadowBlur = isActive ? 10 * dpr : 6 * dpr;
      ctx.strokeStyle = "#111111";
      ctx.lineWidth = isActive ? 8 * dpr : 6 * dpr;
      ctx.stroke();

      ctx.shadowColor = isActive ? "rgba(184, 255, 40, 0.5)" : "rgba(255, 92, 175, 0.45)";
      ctx.shadowBlur = isActive ? 12 * dpr : 8 * dpr;
      ctx.strokeStyle = isActive ? activeColor : color;
      ctx.lineWidth = isActive ? 3.2 * dpr : 2.2 * dpr;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(points[0].x * dpr, points[0].y * dpr, (isActive ? 6 : 5) * dpr, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? activeColor : color;
      ctx.fill();
      ctx.lineWidth = 3 * dpr;
      ctx.strokeStyle = "#111111";
      ctx.stroke();

      frameRef.current = requestAnimationFrame(draw);
    };

    resize();
    resetPoints(window.innerWidth / 2, window.innerHeight / 2);
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);
    frameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameRef.current);
      document.documentElement.classList.remove("string-cursor-enabled");
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, [activeColor, color, trailLength]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[9999]" />;
}
