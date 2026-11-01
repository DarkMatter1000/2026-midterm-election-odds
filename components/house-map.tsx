"use client";

import { useState } from "react";
import {
  DISTRICT_BOUNDARY_VINTAGE,
  DISTRICT_MAP_VIEW,
  DISTRICT_PATHS,
  NEWER_THAN_CENSUS,
  type DistrictPath,
} from "@/lib/district-paths";
import { formatMargin, getState, marginFill, NEUTRAL_FILL } from "@/lib/election";

const NEWER = new Set<string>(NEWER_THAN_CENSUS);

export function HouseMap({
  margins,
  selected,
  onSelect,
}: {
  margins: Record<string, number>;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const captionId = hover ?? selected;
  const caption = captionId ? districtCaption(captionId, margins) : "Select a district.";

  return (
    <figure className="flex min-w-0 flex-col gap-3">
      <svg
        viewBox={`0 0 ${DISTRICT_MAP_VIEW.width} ${DISTRICT_MAP_VIEW.height}`}
        role="group"
        aria-label="United States House districts, each outlined with its Census boundary and colored by that state’s generic-ballot estimate"
        className="h-auto w-full max-w-full"
      >
        {DISTRICT_PATHS.map((shape) => {
          const active = shape.id === selected;
          const margin = margins[shape.abbr];
          return (
            <path
              key={shape.id}
              d={shape.d}
              data-testid={`district-${shape.id}`}
              className="state-shape cursor-pointer"
              fill={margin === undefined ? NEUTRAL_FILL : marginFill(margin)}
              stroke={active ? "#1a1714" : "rgba(26,23,20,0.75)"}
              strokeWidth={active ? 2.5 : 0.85}
              vectorEffect="non-scaling-stroke"
              tabIndex={0}
              role="button"
              aria-pressed={active}
              aria-label={districtCaption(shape.id, margins)}
              onMouseEnter={() => setHover(shape.id)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(shape.id)}
              onBlur={() => setHover(null)}
              onClick={() => onSelect(shape.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(shape.id);
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
      <p className="text-sm leading-6 text-muted-foreground" data-testid="house-vintage">
        {DISTRICT_BOUNDARY_VINTAGE} Alaska and Hawaii are inset. The District of Columbia is not drawn.
      </p>
    </figure>
  );
}

export function districtById(id: string): DistrictPath | undefined {
  return DISTRICT_PATHS.find((shape) => shape.id === id);
}

export function isNewerThanCensus(abbr: string): boolean {
  return NEWER.has(abbr);
}

export function districtTitle(abbr: string, district: string): string {
  const state = getState(abbr);
  const name = state?.name ?? abbr;
  if (district === "AL") return `${name}, at-large`;
  return `${name}, ${ordinal(district)} district`;
}

function ordinal(district: string): string {
  const n = Number(district);
  const mod100 = n % 100;
  const teen = mod100 >= 11 && mod100 <= 13;
  const last = n % 10;
  const suffix = teen ? "th" : last === 1 ? "st" : last === 2 ? "nd" : last === 3 ? "rd" : "th";
  return `${n}${suffix}`;
}

function districtCaption(id: string, margins: Record<string, number>): string {
  const shape = districtById(id);
  if (!shape) return id;
  const margin = margins[shape.abbr];
  const title = districtTitle(shape.abbr, shape.district);
  if (margin === undefined) return title;
  return `${title}. Generic ballot estimate ${formatMargin(margin)}.`;
}
