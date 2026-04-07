import { useEffect, useState } from 'react';
import { load, save } from './storage';

type Item = { id: string; url: string; caption: string };
function id() { return Math.random().toString(36).slice(2, 9); }

export function Gallery() {
  const [items, setItems] = useState<Item[]>(() => load<Item[]>('gallery', [
    { id: id(), url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1200&auto=format&fit=crop', caption: 'Birlikte gün batımı' },
    { id: id(), url: 'https://images.unsplash.com/photo-1512777576244-b846ac3d816f?q=80&w=1200&auto=format&fit=crop', caption: 'Kahve molası' },
  ]));

  const [newUrl, setNewUrl] = useState('');
  const [newCap, setNewCap] = useState('');

  useEffect(() => {
    save('gallery', items);
  }, [items]);

  const add = () => {
    if (!newUrl.trim()) return;
    setItems((arr) => [...arr, { id: id(), url: newUrl.trim(), caption: newCap.trim() }]);
    setNewUrl('');
    setNewCap('');
  };

  const remove = (i: string) => setItems((arr) => arr.filter((x) => x.id !== i));

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 border border-rose-100 shadow-lg shadow-rose-200/40">
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-pink-200/40 rounded-full blur-3xl" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-red-200/40 rounded-full blur-3xl" />

      <div className="relative flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-600 to-red-500 flex items-center justify-center shadow-md shadow-rose-300/40">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 19V5a2 2 0 0 0-2-2H5c-1.1 0-2 .9-2 2v14"/>
            <path d="M3 19l6-6 4 4 5-5 3 3v4H3z"/>
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-rose-900">Anı Galerisi</h3>
          <p className="text-sm text-rose-600">Fotoğraf linkleri ve açıklamalar</p>
        </div>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          placeholder="Görsel URL"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          className="rounded-xl border px-3 py-2 text-sm bg-white/80 border-rose-200 text-rose-900"
        />
        <input
          placeholder="Açıklama"
          value={newCap}
          onChange={(e) => setNewCap(e.target.value)}
          className="rounded-xl border px-3 py-2 text-sm bg-white/80 border-rose-200 text-rose-900"
        />
        <button onClick={add} className="rounded-xl px-3 py-2 text-sm bg-rose-600 text-white hover:bg-rose-700 transition">Ekle</button>
      </div>

      <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it) => (
          <div key={it.id} className="group relative overflow-hidden rounded-2xl border border-rose-100 bg-white/70 backdrop-blur">
            <img src={it.url} alt={it.caption || 'Anı'} className="w-full h-40 object-cover" />
            <div className="p-3 text-sm text-rose-800 flex items-center justify-between">
              <span className="truncate pr-2">{it.caption || 'Anı'}</span>
              <button onClick={() => remove(it.id)} className="opacity-70 group-hover:opacity-100 text-rose-500 hover:text-rose-700">Sil</button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-rose-500">Henüz fotoğraf yok. Yukarıdan ekle ✨</p>
        )}
      </div>
    </div>
  );
}
