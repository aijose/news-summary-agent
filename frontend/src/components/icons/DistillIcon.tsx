interface DistillIconProps {
  className?: string
}

export function DistillIcon({ className = "h-6 w-6" }: DistillIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Funnel shape representing refinement/distillation */}
      <defs>
        <linearGradient id="distill-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* Top wide opening (multiple sources) */}
      <path
        d="M4 6 L20 6 L16 12 L8 12 Z"
        fill="url(#distill-gradient)"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Middle narrowing section */}
      <path
        d="M8 12 L10 16 L14 16 L16 12"
        fill="url(#distill-gradient)"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Bottom refined output (single drop) */}
      <circle
        cx="12"
        cy="19"
        r="1.5"
        fill="currentColor"
        opacity="0.9"
      />

      {/* Subtle accent lines showing flow */}
      <path
        d="M7 8 L8.5 10.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        d="M17 8 L15.5 10.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  )
}
