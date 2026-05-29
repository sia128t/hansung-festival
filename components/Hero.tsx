'use client';
import { useEffect, useRef } from 'react';

type Particle = {
  x: number; y: number; r: number; speed: number;
  drift: number; alpha: number; color: string; twinkle: number;
};

const COLORS = [
  'rgba(129,140,248,VAL)',
  'rgba(245,158,11,VAL)',
  'rgba(236,72,153,VAL)',
  'rgba(96,165,250,VAL)',
  'rgba(255,255,255,VAL)',
];

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      canvas!.width = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function makeParticle(): Particle {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      return {
        x: Math.random() * canvas!.width,
        y: canvas!.height + Math.random() * 60,
        r: Math.random() * 2 + 0.8,
        speed: Math.random() * 0.6 + 0.3,
        drift: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.5 + 0.3,
        color,
        twinkle: Math.random() * Math.PI * 2,
      };
    }

    const particles: Particle[] = Array.from({ length: 90 }, () => {
      const p = makeParticle();
      p.y = Math.random() * canvas.height;
      return p;
    });

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      const now = Date.now() / 1000;

      particles.forEach((p, i) => {
        p.y -= p.speed;
        p.x += Math.sin(now * 0.8 + p.twinkle) * p.drift;

        const flicker = 0.25 * Math.sin(now * 2.5 + p.twinkle);
        const alpha = Math.max(0, Math.min(1, p.alpha + flicker));
        const fillColor = p.color.replace('VAL', alpha.toFixed(2));

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = fillColor;
        ctx!.shadowColor = fillColor;
        ctx!.shadowBlur = p.r * 4;
        ctx!.fill();
        ctx!.shadowBlur = 0;

        if (p.y < -10) particles[i] = makeParticle();
      });

      animFrameRef.current = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  useEffect(() => {
    const content = contentRef.current;
    const hero = heroRef.current;
    if (!content || !hero) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroH = hero.offsetHeight;
      if (scrollY > heroH) return;
      const ratio = scrollY / heroH;
      content.style.transform = `translateY(${scrollY * 0.4}px)`;
      content.style.opacity = Math.max(0, 1 - ratio * 2).toFixed(2);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="hero" ref={heroRef}>
      <canvas id="heroCanvas" ref={canvasRef} />
      <div className="hero-bg" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />
      <div className="hero-content" ref={contentRef}>
        <p className="hero-sub">한성대학교 대동제</p>
        <h1 className="hero-title">대동제<br /><span>타임라인</span></h1>
        <p className="hero-desc">한성대 대동제 타임라인 시각화 프로젝트</p>
        <div className="hero-btns">
          <a href="#timeline" className="btn btn-primary">역사 탐방</a>
          <a href="#memory" className="btn btn-outline">추억 남기기</a>
        </div>
      </div>
      <div className="hero-scroll">
        <div className="scroll-line" />
      </div>
    </header>
  );
}
