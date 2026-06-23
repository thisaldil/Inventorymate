import { Boxes, Loader2 } from 'lucide-react';

type LoadingScreenProps = {
  label?: string;
};

export function LoadingScreen({ label = 'Loading ULSS Inventories' }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-hidden bg-ulss-black text-white">
      {/* Ambient glow layers */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.14)_0%,rgba(10,10,10,0)_45%)]" />
      <div className="absolute -top-1/4 left-1/2 h-[60vh] w-[60vh] -translate-x-1/2 rounded-full bg-ulss-gold/10 blur-[120px]" />

      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(circle at center, black 0%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 0%, transparent 70%)',
        }}
      />

      {/* Horizontal accent line */}
      <div className="absolute inset-x-0 h-px top-1/2 bg-gradient-to-r from-transparent via-ulss-gold/25 to-transparent" />

      <div className="relative flex flex-col items-center w-full max-w-sm px-6 text-center">
        {/* Logo with concentric animated rings */}
        <div className="relative flex items-center justify-center mb-9 h-28 w-28">
          {/* Pulsing halo */}
          <div className="absolute inset-0 rounded-full bg-ulss-gold/15 blur-xl animate-pulse" />

          {/* Static guide rings */}
          <div className="absolute inset-0 border rounded-full border-ulss-gold/20" />
          <div className="absolute border rounded-full inset-3 border-white/10" />

          {/* Spinning arcs (different speeds + directions for depth) */}
          <div className="absolute inset-0 rounded-full border-t-2 border-ulss-gold animate-spin [animation-duration:1.2s]" />
          <div className="absolute inset-1.5 rounded-full border-b border-ulss-gold/40 animate-spin [animation-duration:2.4s] [animation-direction:reverse]" />

          {/* Icon badge */}
          <div className="relative flex items-center justify-center w-16 h-16 border shadow-2xl rounded-2xl border-ulss-gold/25 bg-gradient-to-br from-ulss-gold/15 to-ulss-gold/5 text-ulss-gold shadow-ulss-gold/20 backdrop-blur-sm">
            <Boxes size={30} className="drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
          </div>
        </div>

        {/* Brand */}
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-ulss-gold/70">
          Inventorymate
        </p>
        <h1 className="text-2xl font-bold text-white mb-7 font-display">
          {label}
        </h1>

        {/* Status row */}
        <div className="flex items-center gap-2.5 text-sm text-white/50">
          <Loader2 size={16} className="animate-spin text-ulss-gold" />
          <span className="loading-dots">Preparing workspace</span>
        </div>

        {/* Indeterminate progress bar */}
        <div className="w-full h-1 mt-8 overflow-hidden rounded-full bg-white/10">
          <div className="w-2/5 h-full rounded-full bg-gradient-to-r from-ulss-gold/40 via-ulss-gold to-ulss-gold/40 loading-screen-bar" />
        </div>
      </div>
    </div>
  );
}