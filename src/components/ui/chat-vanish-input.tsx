"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";

export interface ChatVanishInputHandle {
  submit: () => void;
}

type Props = {
  placeholders: string[];
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export const ChatVanishInput = forwardRef<ChatVanishInputHandle, Props>(
  function ChatVanishInputInner({ placeholders, value, onChange, onSubmit, disabled }, ref) {
    const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
    const [animating, setAnimating] = useState(false);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const newDataRef = useRef<{ x: number; y: number; r: number; color: string }[]>([]);

    const startAnimation = () => {
      intervalRef.current = setInterval(() => {
        setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
      }, 3000);
    };

    useEffect(() => {
      startAnimation();
      const handleVisibility = () => {
        if (document.visibilityState !== "visible" && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        } else if (document.visibilityState === "visible") {
          startAnimation();
        }
      };
      document.addEventListener("visibilitychange", handleVisibility);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        document.removeEventListener("visibilitychange", handleVisibility);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [placeholders]);

    const draw = useCallback(() => {
      if (!inputRef.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = 800;
      canvas.height = 800;
      ctx.clearRect(0, 0, 800, 800);

      const computedStyles = getComputedStyle(inputRef.current);
      const fontSize = parseFloat(computedStyles.getPropertyValue("font-size"));
      ctx.font = `${fontSize * 2}px ${computedStyles.fontFamily}`;
      ctx.fillStyle = "#FFF";
      ctx.fillText(value, 16, 40);

      const imageData = ctx.getImageData(0, 0, 800, 800);
      const pixelData = imageData.data;
      const newData: { x: number; y: number; color: [number, number, number, number] }[] = [];

      for (let t = 0; t < 800; t++) {
        const i = 4 * t * 800;
        for (let n = 0; n < 800; n++) {
          const e = i + 4 * n;
          if (pixelData[e] !== 0 && pixelData[e + 1] !== 0 && pixelData[e + 2] !== 0) {
            newData.push({
              x: n,
              y: t,
              color: [pixelData[e], pixelData[e + 1], pixelData[e + 2], pixelData[e + 3]],
            });
          }
        }
      }

      newDataRef.current = newData.map(({ x, y, color }) => ({
        x,
        y,
        r: 1,
        color: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`,
      }));
    }, [value]);

    useEffect(() => {
      draw();
    }, [value, draw]);

    const animate = (start: number) => {
      const animateFrame = (pos = 0) => {
        requestAnimationFrame(() => {
          const newArr: typeof newDataRef.current = [];
          for (const current of newDataRef.current) {
            if (current.x < pos) {
              newArr.push(current);
            } else {
              if (current.r <= 0) continue;
              current.x += Math.random() > 0.5 ? 1 : -1;
              current.y += Math.random() > 0.5 ? 1 : -1;
              current.r -= 0.05 * Math.random();
              newArr.push(current);
            }
          }
          newDataRef.current = newArr;
          const ctx = canvasRef.current?.getContext("2d");
          if (ctx) {
            ctx.clearRect(pos, 0, 800, 800);
            for (const { x: n, y: i, r: s, color } of newDataRef.current) {
              if (n > pos) {
                ctx.beginPath();
                ctx.rect(n, i, s, s);
                ctx.fillStyle = color;
                ctx.strokeStyle = color;
                ctx.stroke();
              }
            }
          }
          if (newDataRef.current.length > 0) {
            animateFrame(pos - 8);
          } else {
            setAnimating(false);
            onSubmit();
          }
        });
      };
      animateFrame(start);
    };

    const vanishAndSubmit = () => {
      if (!value.trim() || animating || disabled) return;
      setAnimating(true);
      draw();
      const maxX = newDataRef.current.reduce((prev, cur) => (cur.x > prev ? cur.x : prev), 0);
      animate(maxX);
    };

    // Expose submit via ref so the parent toolbar can call it
    useImperativeHandle(ref, () => ({ submit: vanishAndSubmit }));

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !animating) {
        e.preventDefault();
        vanishAndSubmit();
      }
    };

    return (
      <div className="relative min-h-[60px] overflow-hidden">
        <canvas
          ref={canvasRef}
          className={cn(
            "pointer-events-none absolute top-[20%] left-2 origin-top-left scale-50 pr-20",
            "filter invert dark:invert-0",
            animating ? "opacity-100" : "opacity-0",
          )}
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            if (!animating) onChange(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder=""
          className={cn(
            "relative z-10 h-full min-h-[60px] w-full bg-transparent px-4 py-3 text-sm",
            "dark:text-white/90 text-foreground/90",
            "border-none outline-none focus:outline-none focus:ring-0",
            "disabled:cursor-not-allowed disabled:opacity-50",
            animating && "text-transparent dark:text-transparent",
          )}
        />
        {!value && (
          <div className="pointer-events-none absolute inset-0 flex items-center px-4">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentPlaceholder}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: "linear" }}
                className="truncate text-sm dark:text-white/20 text-foreground/30"
              >
                {placeholders[currentPlaceholder]}
              </motion.span>
            </AnimatePresence>
          </div>
        )}
      </div>
    );
  },
);
