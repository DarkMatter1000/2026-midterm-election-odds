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

type Layer = "ballot" | "senate";

export function UsMap({
  layer,
  selected,
  query,
  onSelect,
}: {
  layer: Layer;
  selected: string;
  query: string;
  onSelect: (abbr: string) => void;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const captionAbbr = hover ?? selected;
  const caption = captionFor(captionAbbr, layer);

  return (
    <figure className="flex flex-col gap-3">
      <svg
        viewBox={`0 0 ${MAP_VIEW.width} ${MAP_VIEW.height}`}
        role="group"
        aria-label={
          layer === "ballot"
            ? "United States map colored by the estimated generic congressional ballot"
            : "United States map colored by the Senate forecast margin"
        }
        className="h-auto w-full"
      >
        {STATE_PATHS.map((shape) => {
          const state = getState(shape.abbr);
          const active = shape.abbr === selected;
          const dim = query.trim().length > 0 && !pathMatches(shape.abbr, state, query);
          const fill = fillFor(shape.abbr, state, layer);
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
              aria-label={captionFor(shape.abbr, layer)}
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
        {layer === "ballot"
          ? "Every state is shifted by the same national change from the 2024 presidential vote. Gray is the District of Columbia, which this estimate does not cover."
          : "Color is the Senate forecast margin. Gray states, and the District of Columbia, have no Senate race on November 3."}
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

function fillFor(
  abbr: string,
  state: StateRecord | undefined,
  layer: Layer,
): string {
  if (!state) return NEUTRAL_FILL;
  if (layer === "ballot") return marginFill(genericMargin(state.trumpMargin2024));
  if (!state.senate) return NEUTRAL_FILL;
  return marginFill(state.senate.marginD);
}

function captionFor(abbr: string, layer: Layer): string {
  if (abbr === "DC") {
    return "District of Columbia. No Senate race, and not included in the state generic-ballot estimate.";
  }
  const state = getState(abbr);
  if (!state) return abbr;
  if (layer === "ballot") {
    return `${state.name}. Generic ballot estimate ${formatMargin(genericMargin(state.trumpMargin2024))}.`;
  }
  if (!state.senate) return `${state.name}. No Senate race in 2026.`;
  return `${state.name} Senate. ${state.senate.rating}, forecast ${formatMargin(state.senate.marginD)}.`;
}
