import { useEffect, useRef } from "react";

const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#/_";
const DURATION = 800;

export function DecodeText({ children }: { children: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const played = useRef(false);

  useEffect(() => {
    const host = ref.current;
    if (!host || played.current) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const glyphs = Array.from(host.querySelectorAll<HTMLElement>(".decode-glyph"));
    let frame = 0;
    let started = 0;
    const finish = () => {
      cancelAnimationFrame(frame);
      glyphs.forEach((glyph) => {
        glyph.textContent = glyph.dataset.final ?? "";
        glyph.classList.remove("is-scrambling");
      });
      host.dataset.decodeState = "done";
      played.current = true;
    };
    const tick = (now: number) => {
      if (!started) started = now;
      const progress = Math.min(1, (now - started) / DURATION);
      const locked = Math.floor(progress * glyphs.length);
      glyphs.forEach((glyph, index) => {
        const settled = index < locked;
        glyph.textContent = settled ? glyph.dataset.final ?? "" : CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)] ?? "#";
        glyph.classList.toggle("is-scrambling", !settled);
      });
      if (progress < 1) frame = requestAnimationFrame(tick);
      else finish();
    };
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting) || played.current) return;
      played.current = true;
      observer.disconnect();
      if (motion.matches) finish();
      else { host.dataset.decodeState = "running"; frame = requestAnimationFrame(tick); }
    }, { threshold: 0.15 });
    const onMotionChange = () => { if (motion.matches) { observer.disconnect(); finish(); } };
    if (motion.matches) finish();
    else observer.observe(host);
    motion.addEventListener("change", onMotionChange);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); motion.removeEventListener("change", onMotionChange); };
  }, [children]);

  return (
    <span ref={ref} className="decode-text" aria-label={children}>
      <span aria-hidden="true">
        {children.split(/(\s+)/).map((word, wordIndex) => /\s/.test(word) ? word : (
          <span className="decode-word" key={wordIndex}>
            {Array.from(word).map((letter, index) => (
              <span className="decode-cell" key={index}>
                <span className="decode-reserve">{letter}</span>
                <span className="decode-glyph" data-final={letter}>{letter}</span>
              </span>
            ))}
          </span>
        ))}
      </span>
    </span>
  );
}