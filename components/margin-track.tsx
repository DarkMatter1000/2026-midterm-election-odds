import { formatMargin } from "@/lib/election";

export function MarginTrack({
  marginD,
  label,
}: {
  marginD: number;
  label: string;
}) {
  const clamped = Math.max(-40, Math.min(40, marginD));
  const end = ((clamped + 40) / 80) * 100;
  const left = Math.min(50, end);
  const width = Math.abs(end - 50);

  return (
    <div className="grid grid-cols-[7.5rem_1fr_4.5rem] items-center gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div
        className="relative h-3 rounded-full bg-muted"
        role="img"
        aria-label={`${label} ${formatMargin(marginD)}`}
      >
        <div className="absolute inset-y-0 left-1/2 w-px bg-foreground/30" />
        <div
          className="absolute inset-y-0 rounded-full"
          style={{
            left: `${left}%`,
            width: `${Math.max(width, 0.8)}%`,
            background: marginD >= 0 ? "#1e4f8f" : "#8f2d2d",
          }}
        />
      </div>
      <span className="text-right font-medium tabular-nums">{formatMargin(marginD)}</span>
    </div>
  );
}
