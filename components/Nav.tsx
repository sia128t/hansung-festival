'use client';
import { useState, useEffect } from 'react';

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav id="navbar" style={{ boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.3)' : 'none' }}>
      <div className="nav-inner">
        <a className="logo" href="#">HSU FESTA</a>
        <ul className="nav-links">
          <li><a href="#timeline">타임라인</a></li>
          <li><a href="#videos">유튜브</a></li>
          <li><a href="#memory">댓글</a></li>
        </ul>
        <button className="hamburger" onClick={() => setIsOpen(v => !v)} aria-label="메뉴">
          &#9776;
        </button>
      </div>
      <ul className={`mobile-menu${isOpen ? ' open' : ''}`}>
        <li><a href="#timeline" onClick={() => setIsOpen(false)}>타임라인</a></li>
        <li><a href="#videos" onClick={() => setIsOpen(false)}>유튜브</a></li>
        <li><a href="#memory" onClick={() => setIsOpen(false)}>댓글</a></li>
      </ul>
    </nav>
  );
}
