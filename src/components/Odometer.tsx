"use client";

import { useEffect, useRef, useState } from "react";

interface OdometerProps {
  value: number;
  animate?: boolean;
}

function formatAmount(val: number): string {
  return val.toFixed(2);
}

function DigitRoller({ digit, animate }: { digit: string; animate: boolean }) {
  const isNum = /\d/.test(digit);
  const n = isNum ? parseInt(digit, 10) : 0;

  return (
    <span
      className="inline-block overflow-hidden relative"
      style={{ height: "1em", width: digit === "$" ? "0.55em" : digit === "." ? "0.3em" : "0.58em" }}
    >
      {isNum ? (
        <div
          className="absolute left-0 right-0"
          style={{
            transition: animate ? "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)" : "none",
            transform: `translateY(${-n}em)`,
          }}
        >
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
            <div
              key={d}
              className="text-center tabular-nums"
              style={{ height: "1em", lineHeight: "1" }}
            >
              {d}
            </div>
          ))}
        </div>
      ) : (
        <span
          className="absolute left-0 right-0 text-center"
          style={{ height: "1em", lineHeight: "1" }}
        >
          {digit}
        </span>
      )}
    </span>
  );
}

export default function Odometer({ value, animate = true }: OdometerProps) {
  const [hasInteracted, setHasInteracted] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value && !hasInteracted) {
      setHasInteracted(true);
    }
    prevValue.current = value;
  }, [value, hasInteracted]);

  const shouldAnimate = animate && hasInteracted;
  const formatted = "$" + formatAmount(value);
  const chars = formatted.split("");

  return (
    <span className="inline-flex font-[family-name:var(--font-instrument-serif)] tabular-nums leading-none">
      {chars.map((ch, i) => (
        <DigitRoller key={`${i}-${chars.length}`} digit={ch} animate={shouldAnimate} />
      ))}
    </span>
  );
}
