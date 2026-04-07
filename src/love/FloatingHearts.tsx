import { useEffect, useMemo, useState } from 'react';

const HEARTS = ['❤️','💖','💘','💕','💗','💓','💞'];

type H = { id: number; x: number; size: number; delay: number; duration: number; emoji: string };

export function FloatingHearts() {
  const [enabled, setEnabled] = useState(true);
  const hearts = useMemo<H[]>(() => {
    const arr: H[] = [];
    for (let i = 0; i < 18; i++) {
      arr.push({
        id: i,
        x: Math.random() * 100,
        size: 16 + Math.random() * 26,
        delay: Math.random() * 6,
        duration: 8 + Math.random() * 8,
        emoji: HEARTS[Math.floor(Math.random() * HEARTS.length)],
      });
    }
    return arr;
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setEnabled(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {enabled && hearts.map((h) => (
        <span
          key={h.id}
          style={{
            left: `${h.x}%`,
            fontSize: `${h.size}px`,
            animation: `floatUp ${h.duration}s linear ${h.delay}s infinite`,
          }}
          className="absolute bottom-[-10%] select-none opacity-70"
        >
          {h.emoji}
        </span>
      ))}
    </div>
  );
}
