"use client";

import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  style?: React.CSSProperties;
  reverse?: boolean;
  borderWidth?: number;
}

export const BorderBeam = ({
  className,
  size = 200,
  duration = 15,
  delay = 0,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  style,
  reverse = false,
  borderWidth = 1,
}: BorderBeamProps) => {
  return (
    <div
      style={
        {
          "--size": size,
          "--duration": duration,
          "--delay": delay,
          "--color-from": colorFrom,
          "--color-to": colorTo,
          "--border-width": borderWidth,
          ...style,
        } as React.CSSProperties
      }
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--border-width)*1px)_solid_transparent]",
        "[background:linear-gradient(90deg,var(--color-from),var(--color-to),var(--color-from))_border-box]",
        "[mask:linear-gradient(#fff_0_0)_padding-box,linear-gradient(#fff_0_0)]",
        "[mask-composite:subtract]",
        className
      )}
    >
      <div
        className={cn(
          "absolute aspect-square w-[calc(var(--size)*1px)] animate-border-beam",
          "[animation-delay:var(--delay)] [animation-duration:calc(var(--duration)*1s)]",
          "[background:linear-gradient(90deg,var(--color-from),var(--color-to),var(--color-from))]",
          reverse ? "[animation-direction:reverse]" : ""
        )}
      />
    </div>
  );
};