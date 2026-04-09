"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { apiFetch } from "@/src/lib/api";
import type { Announcement, ApiResponse } from "@/src/types/domain";

export default function AnnouncementTicker() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [phase, setPhase] = useState<"intro" | "loop">("intro");
  const [sizes, setSizes] = useState({ cw: 0, sw: 0 });
  const [marqueeShiftPx, setMarqueeShiftPx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const introSpanRef = useRef<HTMLSpanElement>(null);
  const loopTrackRef = useRef<HTMLDivElement>(null);
  const sizesRef = useRef(sizes);
  sizesRef.current = sizes;

  const load = useCallback(async () => {
    try {
      const res = await apiFetch<ApiResponse<{ announcements: Announcement[] }>>(
        "/announcements",
      );
      const list = (res.data.announcements ?? []).filter((a) => a.body.trim().length > 0);
      setAnnouncements(list);
    } catch {
      setAnnouncements([]);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 120_000);
    const onFocus = () => load();
    const onRefresh = () => load();
    window.addEventListener("focus", onFocus);
    window.addEventListener("announcements:refresh", onRefresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("announcements:refresh", onRefresh);
    };
  }, [load]);

  const line = announcements.map((a) => a.body.trim()).join("  ·  ");

  useEffect(() => {
    setPhase("intro");
    setSizes({ cw: 0, sw: 0 });
    setMarqueeShiftPx(0);
  }, [line]);

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const cw = container.offsetWidth;
    if (phase !== "intro") return;
    const introEl = introSpanRef.current;
    if (!introEl) return;
    const sw = introEl.offsetWidth;
    if (cw > 0 && sw > 0) setSizes({ cw, sw });
  }, [phase]);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(() => measure());
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [measure, line, phase]);

  useLayoutEffect(() => {
    if (phase !== "loop") return;
    const track = loopTrackRef.current;
    const first = track?.querySelector("span");
    if (!first) return;
    const w = first.offsetWidth;
    if (w <= 0) return;
    setMarqueeShiftPx((prev) => (prev > 0 ? prev : w));
  }, [phase, line]);

  const handleIntroEnd = (e: React.AnimationEvent<HTMLDivElement>) => {
    if (!e.animationName.includes("announcement-intro")) return;
    const sw = sizesRef.current.sw;
    if (sw > 0) setMarqueeShiftPx(sw);
    setPhase("loop");
  };

  if (!announcements.length) return null;

  const readyIntro = phase === "intro" && sizes.cw > 0 && sizes.sw > 0;

  return (
    <div className="relative z-10 min-w-0 w-full border-b border-indigo-200/80 bg-indigo-600/90 text-white dark:border-indigo-900/60 dark:bg-indigo-950/90">
      <div ref={containerRef} className="min-w-0 w-full overflow-hidden py-2">
        {phase === "loop" ? (
          <div
            ref={loopTrackRef}
            className="announcement-loop-track"
            style={
              (marqueeShiftPx > 0
                ? { "--marquee-shift": `${marqueeShiftPx}px` }
                : {}) as React.CSSProperties
            }
          >
            {[0, 1].map((i) => (
              <span
                key={i}
                className="inline-block shrink-0 whitespace-nowrap px-6 text-sm font-medium"
                aria-hidden={i === 1 ? true : undefined}
              >
                {line}
              </span>
            ))}
          </div>
        ) : readyIntro ? (
          <div
            className="announcement-intro-track w-max"
            style={
              {
                "--cw": `${sizes.cw}px`,
                "--sw": `${sizes.sw}px`,
              } as React.CSSProperties
            }
            onAnimationEnd={handleIntroEnd}
          >
            <span
              ref={introSpanRef}
              className="inline-block shrink-0 whitespace-nowrap px-6 text-sm font-medium"
            >
              {line}
            </span>
          </div>
        ) : (
          <span
            ref={introSpanRef}
            className="inline-block whitespace-nowrap px-6 text-sm font-medium opacity-0"
            aria-hidden
          >
            {line}
          </span>
        )}
      </div>
    </div>
  );
}
