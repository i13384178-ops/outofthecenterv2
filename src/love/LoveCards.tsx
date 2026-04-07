import { useEffect, useState } from 'react';
import { load, save } from './storage';
import { cn } from '@/utils/cn';

type Card = { id: string; title: string; message: string; emoji: string };

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

export function LoveCards() {
  const [cards, setCards] = useState<Card[]>(() =>
    load<Card[]>('cards', [
      { id: makeId(), title: 'İlk Buluşma', message: 'O gün gözlerin parlıyordu ✨', emoji: '💫' },
      { id: makeId(), title: 'Favori Özelliğin', message: 'Gülüşün dünyamı aydınlatıyor', emoji: '😊' },
      { id: makeId(), title: 'Hedefimiz', message: 'Birlikte daha çok anı biriktirmek', emoji: '🎯' },
    ])
  );

  useEffect(() => {
    save('cards', cards);
  }, [cards]);

  const addCard = () => {
    setCards((c) => [
      ...c,
      { id: makeId(), title: 'Yeni Not', message: 'Seni seviyorum 💖', emoji: '💖' },
    ]);
  };

  const removeCard = (id: string) => setCards((c) => c.filter((x) => x.id !== id));

  const move = (i: number, dir: -1 | 1) => {
    setCards((c) => {
      const arr = [...c];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return arr;
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
      return arr;
    });
  };

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-rose-50 via-amber-50 to-pink-50 border border-rose-100 shadow-lg shadow-rose-200/40">
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-200/40 rounded-full blur-3xl" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-rose-200/40 rounded-full blur-3xl" />

      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shadow-md shadow-rose-300/40">
            <span className="text-white text-lg">💌</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-rose-900">Aşk Kartları</h3>
            <p className="text-sm text-rose-600">Küçük notlar ve anılar</p>
          </div>
        </div>
        <button
          onClick={addCard}
          className={cn(
            'inline-flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl',
            'bg-rose-600 text-white hover:bg-rose-700 transition'
          )}
        >
          Ekle
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((c, i) => (
          <div key={c.id} className="relative rounded-2xl p-4 bg-white/80 backdrop-blur border border-rose-100">
            <div className="absolute right-2 top-2 flex gap-1">
              <button onClick={() => move(i, -1)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500" aria-label="Yukarı">
                ↑
              </button>
              <button onClick={() => move(i, 1)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500" aria-label="Aşağı">
                ↓
              </button>
              <button onClick={() => removeCard(c.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500" aria-label="Sil">
                ✕
              </button>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <input
                value={c.emoji}
                onChange={(e) => {
                  const v = e.target.value || '❤️';
                  setCards((arr) => arr.map((x) => (x.id === c.id ? { ...x, emoji: v } : x)));
                }}
                className="w-12 text-center rounded-xl border bg-white border-rose-200 text-xl"
              />
              <input
                value={c.title}
                onChange={(e) => setCards((arr) => arr.map((x) => (x.id === c.id ? { ...x, title: e.target.value } : x)))}
                className="flex-1 rounded-xl border px-3 py-2 text-sm bg-white border-rose-200 text-rose-900"
              />
            </div>
            <textarea
              rows={3}
              value={c.message}
              onChange={(e) => setCards((arr) => arr.map((x) => (x.id === c.id ? { ...x, message: e.target.value } : x)))}
              className="w-full rounded-xl border px-3 py-2 text-sm bg-white border-rose-200 text-rose-800"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
