"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const SIZES = {
  sm: "h-5 w-5",
  md: "h-7 w-7",
  lg: "h-10 w-10",
} as const;

export interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  size?: keyof typeof SIZES;
  disabled?: boolean;
  invalid?: boolean;
  label?: string;
  className?: string;
}

/**
 * Accessible radiogroup: arrow keys move between stars, Home/End jump to the
 * edges, and the selected star is the single tab stop.
 */
export function StarRating({
  value,
  onChange,
  size = "md",
  disabled = false,
  invalid = false,
  label = "Star rating",
  className,
}: StarRatingProps) {
  const [hovered, setHovered] = React.useState(0);
  const reduceMotion = useReducedMotion();
  const refs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const active = hovered || value;

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, star: number) {
    let next = star;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        next = Math.min(5, star + 1);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        next = Math.max(1, star - 1);
        break;
      case "Home":
        next = 1;
        break;
      case "End":
        next = 5;
        break;
      default:
        return;
    }

    event.preventDefault();
    onChange(next);
    refs.current[next - 1]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-invalid={invalid || undefined}
      className={cn("flex items-center gap-1", className)}
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const checked = star === value;
        const filled = star <= active;

        return (
          <button
            key={star}
            ref={(node) => {
              refs.current[star - 1] = node;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
            tabIndex={value === 0 ? (star === 1 ? 0 : -1) : checked ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onFocus={() => setHovered(star)}
            onBlur={() => setHovered(0)}
            onKeyDown={(event) => handleKeyDown(event, star)}
            className={cn(
              "focus-ring rounded-md p-0.5 transition-colors disabled:cursor-not-allowed disabled:opacity-60",
              filled ? "text-primary" : "text-muted-foreground/35 hover:text-primary/60",
            )}
          >
            <motion.span
              className="block"
              animate={reduceMotion ? undefined : { scale: checked ? 1.08 : 1 }}
              whileTap={reduceMotion ? undefined : { scale: 0.9 }}
              transition={{ type: "spring", stiffness: 480, damping: 22 }}
            >
              <Star
                aria-hidden="true"
                className={cn(
                  SIZES[size],
                  "transition-colors",
                  filled ? "fill-current" : "fill-transparent",
                )}
                strokeWidth={1.5}
              />
            </motion.span>
          </button>
        );
      })}
    </div>
  );
}
