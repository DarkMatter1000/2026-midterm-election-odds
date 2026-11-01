"use client";

import { useState } from "react";
import { MAP_VIEW, STATE_PATHS } from "@/lib/map-paths";
import { NEUTRAL_FILL, formatMargin, getState, marginFill } from "@/lib/election";

export function GovernorMap({
  selected,
  margins,
  onSelect,
}: {
  selected: string;
  /** Projected Democratic margin, in points, for states that elect a governor in 2026. */
  margins: Record<string, number>;
  onSelect: (abbr: string) => void;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const captionAbbr = hover ?? selected;
  const caption = captionFor(captionAbbr, margins);

  return (
    <figure className="flex min-w-0 flex-col gap-3">
      <svg
        viewBox={`0 0 ${MAP_VIEW.width} ${MAP_VIEW.height}`}
        role="group"
        aria-label="United States map. States electing a governor in 2026 are colored by the projected margin. Other states are not colored as a race."
        className="h-auto w-full max-w-full"
      >
        {STATE_PATHS.map((shape) => {
          const active = shape.abbr === selected;
          const racing = margins[shape.abbr] !== undefined;
          const fill = racing ? marginFill(margins[shape.abbr]) : NEUTRAL_FILL;
          return (
            <path
              key={shape.abbr}
              d={shape.d}
              data-testid={`governor-state-${shape.abbr}`}
              data-race={racing ? "yes" : "no"}
              data-margin={racing ? margins[shape.abbr] : undefined}
              className="state-shape cursor-pointer"
              fill={fill}
              stroke={active ? "#1a1714" : "rgba(26,23,20,0.45)"}
              strokeWidth={active ? 2.4 : 0.7}
              tabIndex={0}
              role="button"
              aria-pressed={active}
              aria-label={captionFor(shape.abbr, margins)}
              onMouseEnter={() => setHover(shape.abbr)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(shape.abbr)}
              onBlur={() => setHover(null)}
              onClick={() => onSelect(shape.abbr)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(shape.abbr);
                }
              }}
            />
          );
        })}
      </svg>
      <figcaption className="min-h-6 text-sm text-foreground">{caption}</figcaption>
      <div className="flex items-center gap-3 text-xs tracking-wide text-muted-foreground uppercase">
        <span>R+28</span>
        <div
          className="h-2 flex-1 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${marginFill(-28)}, ${marginFill(0)}, ${marginFill(28)})`,
          }}
          aria-hidden
        />
        <span>D+28</span>
      </div>
      <p className="text-sm leading-6 text-muted-foreground">
        Color is the projected margin for the 36 states that elect a governor in 2026, the same
        margin as the dossier. Gray states have no 2026 governor race. Alaska and Hawaii are inset.
      </p>
    </figure>
  );
}

function captionFor(abbr: string, margins: Record<string, number>): string {
  const state = getState(abbr);
  const name = state?.name ?? (abbr === "DC" ? "District of Columbia" : abbr);
  if (margins[abbr] === undefined) {
    return `${name}. No 2026 governor election.`;
  }
  return `${name}. Projected margin ${formatMargin(margins[abbr])}.`;
}
