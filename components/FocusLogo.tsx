export default function FocusLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="26" height="26" viewBox="0 0 28 28" aria-hidden="true">
        <defs>
          <radialGradient id="focus-navy" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#4A7098" />
            <stop offset="55%" stopColor="#264A70" />
            <stop offset="100%" stopColor="#122236" />
          </radialGradient>
        </defs>
        <circle cx="14" cy="14" r="13" fill="url(#focus-navy)" />
        <path
          d="M7 20.5 A 10.5 10.5 0 0 1 7 7.5"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <div className="leading-none">
        <div className="font-serif text-base font-bold tracking-wide text-brand-navy">
          Focus
        </div>
        <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-widest text-brand-grey">
          Commercial Real Estate
        </div>
      </div>
    </div>
  );
}
