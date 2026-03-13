"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type TextHoverEffectProps = {
  text: string;
  hoverFadeDuration?: number;
};

export const TextHoverEffect = ({ text, hoverFadeDuration = 0.3 }: TextHoverEffectProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  // Default off-screen so the gradient is not pre-revealed before the first hover
  const [maskPosition, setMaskPosition] = useState({ cx: -9999, cy: -9999 });
  const shouldReduceMotion = useReducedMotion();

  // Use stable unique IDs to prevent collisions if the component renders more than once
  const gradientId = useId();
  const maskGradientId = useId();
  const maskId = useId();
  const filterId = useId();

  // Only recalculate mask position while the cursor is inside the SVG
  useEffect(() => {
    if (!hovered || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setMaskPosition({
      cx: ((cursor.x - rect.left) / rect.width) * 800,
      cy: ((cursor.y - rect.top) / rect.height) * 160,
    });
  }, [cursor, hovered]);

  const sharedTextProps = {
    x: "50%",
    y: "65%",
    textAnchor: "middle" as const,
    dominantBaseline: "middle" as const,
    style: { fontFamily: "Helvetica, Arial, sans-serif", fontSize: "10rem", fontWeight: 700 },
  };

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 800 160"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      style={{ pointerEvents: "auto", cursor: "default" }}
    >
      <defs>
        {/*
          gradientUnits="userSpaceOnUse" with x1=0 x2=800 spans the full viewBox width
          so amber appears at both text edges, not just relative to the text bounding box.
        */}
        <linearGradient
          id={gradientId}
          x1="0"
          y1="0"
          x2="800"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>

        {/*
          cx/cy/r are raw SVG user-space units (viewBox: 0 0 800 160).
          Default cx/cy is off-screen so nothing is revealed before the first hover.
        */}
        <radialGradient
          id={maskGradientId}
          gradientUnits="userSpaceOnUse"
          r="220"
          cx={maskPosition.cx}
          cy={maskPosition.cy}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </radialGradient>

        <mask id={maskId}>
          <rect x="0" y="0" width="100%" height="100%" fill={`url(#${maskGradientId})`} />
        </mask>

        {/* Neon bloom — gaussian blur stacked twice for a soft halo */}
        <filter id={filterId} x="-20%" y="-60%" width="140%" height="220%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Base stroke — dash-draw on mount, always visible, very subtle */}
      <motion.text
        {...sharedTextProps}
        fill="transparent"
        stroke="currentColor"
        strokeWidth="0.4"
        strokeOpacity={0.07}
        className="select-none"
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{ strokeDashoffset: 0, strokeDasharray: 1000 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 3, ease: "easeInOut" }}
      >
        {text}
      </motion.text>

      {/* Bloom layer — blurred copy, fades in on hover, revealed by radial mask */}
      <text
        {...sharedTextProps}
        fill="transparent"
        stroke={`url(#${gradientId})`}
        strokeWidth="1"
        className="select-none"
        mask={`url(#${maskId})`}
        filter={`url(#${filterId})`}
        style={{
          ...sharedTextProps.style,
          opacity: hovered ? 1 : 0,
          transition: `opacity ${hoverFadeDuration}s ease`,
        }}
      >
        {text}
      </text>

      {/* Sharp gradient stroke — always rendered, revealed only under cursor */}
      <text
        {...sharedTextProps}
        fill="transparent"
        stroke={`url(#${gradientId})`}
        strokeWidth="0.4"
        className="select-none"
        mask={`url(#${maskId})`}
      >
        {text}
      </text>
    </svg>
  );
};
