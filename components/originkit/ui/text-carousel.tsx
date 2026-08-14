"use client";

import * as React from "react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";

type SplitBy = "characters" | "words" | "lines";
type StaggerFrom = "first" | "last" | "center" | "random";

type Props = {
  prefix?: string;
  texts?: string[];
  font?: React.CSSProperties;
  color?: string;
  prefixColor?: string;
  badgeBackground?: string;
  splitBy?: SplitBy;
  staggerFrom?: StaggerFrom;
  auto?: boolean;
};

const getFrom = (from: StaggerFrom) =>
  from === "first" ? "start" : from === "last" ? "end" : from;

/** Originkit Text Carousel, with the requested preview defaults. */
export default function TextCarousel({
  prefix = "Text",
  texts = ["components!", "interfaces!", "experiences!"],
  font = { fontFamily: "Inter, system-ui, sans-serif", fontSize: "120px", fontWeight: 600, letterSpacing: "0em", lineHeight: "1.1em", textAlign: "left" },
  color = "#ffffff",
  prefixColor = "#E8E8E8",
  badgeBackground = "#F9731A",
  splitBy = "characters",
  staggerFrom = "first",
  auto = true,
}: Props) {
  const [index, setIndex] = useState(0);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const animating = useRef(false);
  const current = texts[index] ?? texts[0] ?? "carousel";
  const pieces = useMemo(() => {
    if (splitBy === "lines") return current.split("\n");
    if (splitBy === "words") return current.split(" ");
    return Array.from(current);
  }, [current, splitBy]);

  useEffect(() => {
    if (!auto || texts.length < 2) return;
    const id = window.setInterval(() => {
      const chars = contentRef.current?.querySelectorAll(".char");
      if (!chars?.length || animating.current) return;
      animating.current = true;
      gsap.to(chars, { yPercent: -120, opacity: 0, duration: .45, stagger: { each: .03, from: getFrom(staggerFrom) }, ease: "power2.out", onComplete: () => setIndex(value => (value + 1) % texts.length) });
    }, 2000);
    return () => clearInterval(id);
  }, [auto, staggerFrom, texts.length]);

  useEffect(() => {
    const chars = contentRef.current?.querySelectorAll(".char");
    if (!chars?.length) return;
    gsap.fromTo(chars, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .45, stagger: { each: .03, from: getFrom(staggerFrom) }, ease: "power2.out", onComplete: () => { animating.current = false; } });
  }, [current, pieces, staggerFrom]);

  useLayoutEffect(() => {
    const badge = badgeRef.current;
    const content = contentRef.current;
    if (!badge || !content) return;
    gsap.to(badge, { width: content.scrollWidth + 32, duration: .45, ease: "power2.out" });
  }, [current, pieces]);

  return <span style={{ ...font, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
    {prefix && <span style={{ color: prefixColor }}>{prefix}</span>}
    <span ref={badgeRef} style={{ display: "inline-flex", justifyContent: "center", overflow: "hidden", padding: "4px 16px", borderRadius: 12, background: badgeBackground, color }}>
      <span ref={contentRef} aria-label={current} style={{ display: "inline-flex", whiteSpace: "pre" }}>
        {pieces.map((piece, i) => <span className="char" key={`${index}-${i}`} style={{ display: "inline-block", willChange: "transform, opacity" }}>{piece}{splitBy === "words" && i < pieces.length - 1 ? "\u00a0" : null}</span>)}
      </span>
    </span>
  </span>;
}
