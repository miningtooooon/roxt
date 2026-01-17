import React, { useMemo } from 'react';

export function GlowBackground() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1020] via-[#120a2a] to-[#070b16]" />
      <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl opacity-50 bg-gradient-to-r from-cyan-400/40 via-fuchsia-400/35 to-indigo-400/40" />
      <div className="absolute top-48 -left-20 h-64 w-64 rounded-full blur-3xl opacity-35 bg-gradient-to-r from-emerald-400/30 to-cyan-400/25" />
      <div className="absolute bottom-10 -right-20 h-72 w-72 rounded-full blur-3xl opacity-35 bg-gradient-to-r from-fuchsia-400/25 to-purple-400/30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.10),transparent_40%),radial-gradient(circle_at_90%_30%,rgba(255,255,255,0.06),transparent_45%)]" />
    </div>
  );
}

export function ParticlesLayer() {
  const dots = useMemo(
    () =>
      Array.from({ length: 22 }).map((_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 2 + Math.random() * 4,
        delay: Math.random() * 4,
        duration: 4 + Math.random() * 6
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 opacity-60">
      {dots.map((d) => (
        <span
          key={d.id}
          className="absolute rounded-full bg-white/70 blur-[0.5px] animate-float"
          style={{
            top: `${d.top}%`,
            left: `${d.left}%`,
            width: d.size,
            height: d.size,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
            boxShadow: '0 0 14px rgba(255,255,255,0.25)'
          }}
        />
      ))}
      <style>{`
        @keyframes floaty {
          0% { transform: translate3d(0,0,0); opacity: .55; }
          50% { transform: translate3d(0,-14px,0); opacity: .85; }
          100% { transform: translate3d(0,0,0); opacity: .55; }
        }
        .animate-float { animation-name: floaty; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
      `}</style>
    </div>
  );
}

export function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={[
      'rounded-3xl bg-white/10 border border-white/15 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.25)] p-4',
      className || ''
    ].join(' ')}>
      {children}
    </div>
  );
}

export function NeonButton({ children, onClick, className, disabled }: { children: React.ReactNode; onClick?: () => void; className?: string; disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={[
        'h-12 rounded-2xl px-4 font-semibold tracking-wide',
        'bg-gradient-to-r from-cyan-400/80 via-fuchsia-400/70 to-indigo-400/80',
        'shadow-[0_0_30px_rgba(99,102,241,0.25)]',
        'border border-white/15 hover:brightness-110 active:scale-[0.99] transition',
        disabled ? 'opacity-60 cursor-not-allowed' : '',
        className || ''
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export function BalancePill({ value }: { value: number }) {
  return (
    <div className="h-10 px-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl flex items-center gap-2 shadow-[0_0_24px_rgba(34,211,238,0.12)]">
      <span className="text-xs opacity-80">Balance</span>
      <span className="font-semibold tabular-nums">{value.toFixed(6)} TON</span>
    </div>
  );
}

export function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-12 rounded-2xl bg-white/10 border border-white/15 px-4 outline-none placeholder:text-white/40 focus:border-white/30 focus:bg-white/15 transition"
    />
  );
}
