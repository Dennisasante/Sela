import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={cn("shrink-0", className)} aria-hidden="true">
      <defs>
        <linearGradient id="sela-logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0d5fd6" />
          <stop offset="100%" stopColor="#003b8a" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill="url(#sela-logo-bg)" />
      <path
        d="M 330 165
           C 330 140, 300 122, 256 122
           C 205 122, 172 148, 172 188
           C 172 224, 198 240, 246 251
           L 276 258
           C 322 268, 344 288, 344 324
           C 344 366, 306 392, 252 392
           C 200 392, 164 370, 160 330"
        fill="none"
        stroke="#ffffff"
        strokeWidth="46"
        strokeLinecap="round"
      />
      <circle cx="388" cy="140" r="26" fill="#db1a1a" />
    </svg>
  );
}

export function Logo({
  className,
  markClassName,
  showWordmark = true,
}: {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoMark className={cn("size-8 rounded-lg", markClassName)} />
      {showWordmark && (
        <span className="text-lg font-semibold tracking-tight">Sela</span>
      )}
    </div>
  );
}
