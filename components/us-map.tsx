"use client";

import { useState } from "react";
import { MAP_VIEW, STATE_PATHS } from "@/lib/map-paths";
import {
  NEUTRAL_FILL,
  formatMargin,
  genericMargin,
  getState,
  marginFill,
  matchesQuery,
  type StateRecord,
} from "@/lib/election";

export function UsMap({
  selected,
  query,
  onSelect,
}: {
  selected: string;
  query: string;
  onSelect: (abbr: string) => void;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const captionAbbr = hover ?? selected;
  const caption = captionFor(captionAbbr);

  return (
    <figure className="flex flex-col gap-3">
      <svg
        viewBox={`0 0 ${MAP_VIEW.width} ${MAP_VIEW.height}`}
        role="group"
        aria-label="United States map colored by the estimated generic congressional ballot"
        className="h-auto w-full"
      >
        {STATE_PATHS.map((shape) => {
          const state = getState(shape.abbr);
          const active = shape.abbr === selected;
          const dim = query.trim().length > 0 && !pathMatches(shape.abbr, state, query);
          const fill = fillFor(state);
          return (
            <path
              key={shape.abbr}
              d={shape.d}
              className="state-shape cursor-pointer"
              fill={fill}
              opacity={dim ? 0.28 : 1}
              stroke={active ? "#1a1714" : "rgba(26,23,20,0.45)"}
              strokeWidth={active ? 2.4 : 0.7}
              tabIndex={0}
              role="button"
              aria-pressed={active}
              aria-label={captionFor(shape.abbr)}
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
      <p className="text-sm text-muted-foreground">
        Every state is shifted by the same national change from the 2024 presidential vote. Gray is the District of Columbia, which this estimate does not cover. Senate chances are listed beside the map, not drawn on it.
      </p>
    </figure>
  );
}

function pathMatches(
  abbr: string,
  state: StateRecord | undefined,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (abbr === "DC") {
    return "district of columbia".includes(q) || q === "dc" || q === "d.c.";
  }
  return state ? matchesQuery(state, query) : false;
}

function fillFor(state: StateRecord | undefined): string {
  if (!state) return NEUTRAL_FILL;
  return marginFill(genericMargin(state.trumpMargin2024));
}

function captionFor(abbr: string): string {
  if (abbr === "DC") {
    return "District of Columbia. No Senate race, and not included in the state generic-ballot estimate.";
  }
  const state = getState(abbr);
  if (!state) return abbr;
  return `${state.name}. Generic ballot estimate ${formatMargin(genericMargin(state.trumpMargin2024))}.`;
}
