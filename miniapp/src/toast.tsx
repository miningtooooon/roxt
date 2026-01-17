import React, { useEffect, useState } from 'react';

let pushToast: ((msg: string) => void) | null = null;
export function toast(msg: string) {
  pushToast?.(msg);
}

export function ToastViewport() {
  const [items, setItems] = useState<{ id: number; msg: string }[]>([]);

  useEffect(() => {
    pushToast = (msg) => {
      const id = Date.now();
      setItems((x) => [...x, { id, msg }]);
      setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 2400);
    };
    return () => {
      pushToast = null;
    };
  }, []);

  return (
    <div className="fixed top-3 left-0 right-0 z-50">
      <div className="mx-auto max-w-md px-4 space-y-2">
        {items.map((t) => (
          <div
            key={t.id}
            className="rounded-2xl bg-white/12 border border-white/15 backdrop-blur-xl px-4 py-3 shadow-[0_0_30px_rgba(255,255,255,0.08)]"
          >
            <div className="text-sm">{t.msg}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
