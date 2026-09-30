export function Contours({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={`pointer-events-none select-none ${className}`}
      viewBox="0 0 800 400"
      preserveAspectRatio="xMidYMid slice"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1">
        {Array.from({ length: 12 }).map((_, i) => (
          <path
            key={i}
            opacity={0.5 - i * 0.03}
            d={`M-40 ${70 + i * 26} C 140 ${20 + i * 24}, 300 ${150 + i * 18}, 460 ${
              90 + i * 22
            } S 720 ${40 + i * 26}, 860 ${110 + i * 20}`}
          />
        ))}
      </g>
    </svg>
  );
}
