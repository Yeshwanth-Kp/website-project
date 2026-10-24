import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface StarsProps {
  value: number;
  className?: string;
  size?: "xs" | "sm" | "md";
  /** Rounds the displayed value when true, useful for averages like 4.4 */
  rounded?: boolean;
}

const SIZES = {
  xs: "h-3 w-3",
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
} as const;

export function Stars({ value, className, size = "sm", rounded = false }: StarsProps) {
  const filled = rounded ? Math.round(value) : Math.floor(value);

  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${value.toFixed(1)} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          aria-hidden="true"
          className={cn(
            SIZES[size],
            star <= filled
              ? "fill-primary text-primary"
              : "fill-transparent text-muted-foreground/35",
          )}
          strokeWidth={1.6}
        />
      ))}
    </span>
  );
}
