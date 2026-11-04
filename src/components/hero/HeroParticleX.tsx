import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const BLUE = new THREE.Color("#2F6BFF");
const WHITE = new THREE.Color("#F5F5F7");

const DESKTOP_CAP = 6000;
const MOBILE_CAP = 3000;

function StaticX() {
  return (
    <div aria-hidden className="hero-poster">
      <span className="hero-poster-x">X</span>
    </div>
  );
}

function sampleGlyph(width: number, height: number, cap: number) {
  const F = Math.min(height * 0.36, width * 0.55);
  const off = document.createElement("canvas");
  off.width = width;
  off.height = height;
  const ctx = off.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 ${F}px "Inter Tight", system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("X", width / 2, height * 0.3);

  const img = ctx.getImageData(0, 0, width, height).data;
  const coverage = 0.3;
  const stride = Math.min(6, Math.max(2, Math.ceil(Math.sqrt((coverage * F * F) / cap))));
  const jitter = stride * 0.6;

  const xs: number[] = [];
  const ys: number[] = [];
  for (let y = 0; y < height; y += stride) {
    for (let x = 0; x < width; x += stride) {
      if (img[(y * width + x) * 4 + 3] > 128) {
        xs.push(x + (Math.random() - 0.5) * jitter);
        ys.push(y + (Math.random() - 0.5) * jitter);
      }
    }
  }
  let count = xs.length;
  while (count > cap) {
    const drop = Math.floor(Math.random() * count);
    xs[drop] = xs[count - 1];
    ys[drop] = ys[count - 1];
    count--;
  }
  xs.length = count;
  ys.length = count;
  return { xs, ys, F, stride };
}

const VERT = /* glsl */ `
attribute float aSeed;
attribute float aSparkle;
attribute float aWave;
uniform float uTime;
uniform float uSize;
uniform float uDrift;
varying float vSparkle;
varying float vGlow;
void main() {
  vec3 p = position;
  p.x += sin(uTime * 0.7 + aSeed * 6.2831) * uDrift;
  p.y += cos(uTime * 0.6 + aSeed * 4.7124) * uDrift;
  float wave = pow(max(sin(uTime * 1.1 - aWave * 5.0), 0.0), 6.0);
  vGlow = 1.0 + wave * 1.1;
  vSparkle = aSparkle;
  gl_PointSize = uSize * (aSparkle > 0.5 ? 1.7 : 1.0) * (1.0 + wave * 0.35);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

const FRAG = /* glsl */ `
precision mediump float;
varying float vSparkle;
varying float vGlow;
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float alpha = smoothstep(0.5, 0.12, d);
  vec3 col = mix(vec3(${BLUE.r.toFixed(3)}, ${BLUE.g.toFixed(3)}, ${BLUE.b.toFixed(3)}),
                 vec3(${WHITE.r.toFixed(3)}, ${WHITE.g.toFixed(3)}, ${WHITE.b.toFixed(3)}), vSparkle);
  gl_FragColor = vec4(col * vGlow, alpha * 0.9);
}
`;

export default function HeroParticleX() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const probe = document.createElement("canvas");
    const hasWebGL = !!(probe.getContext("webgl") || probe.getContext("experimental-webgl"));
    if (reduce || !hasWebGL || !hostRef.current) {
      setFallback(true);
      return;
    }

    const host = hostRef.current;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      setFallback(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.style.pointerEvents = "none";
    host.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);

    const state = {
      pos: new Float32Array(0),
      vel: new Float32Array(0),
      target: new Float32Array(0),
      speed: new Float32Array(0),
      count: 0,
      F: 0,
      width: 0,
      height: 0,
      geometry: null as THREE.BufferGeometry | null,
      material: null as THREE.ShaderMaterial | null,
      points: null as THREE.Points | null,
    };

    const pointer = { x: 0, y: 0, active: false };

    function build(width: number, height: number) {
      const sampled = sampleGlyph(width, height, window.innerWidth < 768 ? MOBILE_CAP : DESKTOP_CAP);
      if (!sampled) return;
      const { xs, ys, F, stride } = sampled;
      const n = xs.length;

      const pos = new Float32Array(n * 2);
      const target = new Float32Array(n * 2);
      const vel = new Float32Array(n * 2);
      const seeds = new Float32Array(n);
      const sparkle = new Float32Array(n);
      const wave = new Float32Array(n);
      const speed = new Float32Array(n);
      const scatter = Math.max(width, height) * 0.4;

      for (let i = 0; i < n; i++) {
        const wx = xs[i]! - width / 2;
        const wy = height / 2 - ys[i]!;
        target[i * 2] = wx;
        target[i * 2 + 1] = wy;
        const a = Math.random() * Math.PI * 2;
        const r = scatter * (0.4 + Math.random() * 0.8);
        pos[i * 2] = wx + Math.cos(a) * r;
        pos[i * 2 + 1] = wy + Math.sin(a) * r;
        seeds[i] = Math.random();
        sparkle[i] = Math.random() < 0.04 ? 1 : 0;
        wave[i] = ((xs[i] - ys[i]) / F + 1) / 2;
        speed[i] = 0.7 + Math.random() * 0.6;
      }

      state.pos = pos;
      state.vel = vel;
      state.target = target;
      state.speed = speed;
      state.count = n;
      state.F = F;
      state.width = width;
      state.height = height;

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 2));
      geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
      geo.setAttribute("aSparkle", new THREE.BufferAttribute(sparkle, 1));
      geo.setAttribute("aWave", new THREE.BufferAttribute(wave, 1));

      if (state.material) state.material.dispose();
      if (state.geometry) state.geometry.dispose();
      if (state.points) scene.remove(state.points);

      const mat = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: Math.max(1.8, stride * 0.95) * renderer.getPixelRatio() },
          uDrift: { value: Math.max(1.2, F * 0.006) },
        },
      });
      const points = new THREE.Points(geo, mat);
      points.frustumCulled = false;
      scene.add(points);
      state.geometry = geo;
      state.material = mat;
      state.points = points;
    }

    function resize() {
      const rect = host.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      renderer.setSize(width, height, false);
      camera.left = -width / 2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = -height / 2;
      camera.updateProjectionMatrix();
      build(width, height);
    }

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 200);
    };

    const setPointerFromEvent = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer.x = e.clientX - rect.left - rect.width / 2;
      pointer.y = rect.height / 2 - (e.clientY - rect.top);
      pointer.active = true;
    };
    const onPointerMove = (e: PointerEvent) => setPointerFromEvent(e);
    const onPointerLeave = () => {
      pointer.active = false;
    };

    let raf = 0;
    let visible = true;
    let onScreen = true;
    let ready = false;

    const STIFF = 34;
    const DAMPING = 4.2;
    const KICK = 1400;

    function tick(t: number) {
      raf = requestAnimationFrame(tick);
      if (!visible || !onScreen || !state.material) return;
      const dt = Math.min((t - last) / 1000 || 0.016, 0.05);
      last = t;
      const { pos, vel, target, speed, count } = state;
      const R = Math.max(60, state.F * 0.28);
      const R2 = R * R;
      const damp = Math.exp(-DAMPING * dt);
      const px = pointer.active ? pointer.x : -1e9;
      const py = pointer.active ? pointer.y : -1e9;
      for (let i = 0; i < count; i++) {
        const ix = i * 2;
        const iy = ix + 1;
        const tx = target[ix]!;
        const ty = target[iy]!;
        const x0 = pos[ix]!;
        const y0 = pos[iy]!;
        const v0x = vel[ix]!;
        const v0y = vel[iy]!;
        const k = STIFF * speed[i]!;
        let vx = (v0x + (tx - x0) * k * dt) * damp;
        let vy = (v0y + (ty - y0) * k * dt) * damp;
        if (pointer.active) {
          const rx = x0 - px;
          const ry = y0 - py;
          const d2 = rx * rx + ry * ry;
          if (d2 < R2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = ((1 - d / R) * KICK * dt) / d;
            vx += rx * f;
            vy += ry * f;
          }
        }
        vel[ix] = vx;
        vel[iy] = vy;
        pos[ix] = x0 + vx * dt;
        pos[iy] = y0 + vy * dt;
      }
      const posAttr = state.geometry!.attributes["position"] as THREE.BufferAttribute;
      posAttr.needsUpdate = true;
      state.material.uniforms["uTime"]!.value = t / 1000;
      renderer.render(scene, camera);
      if (!ready) {
        ready = true;
        host.setAttribute("data-scene-ready", "true");
      }
    }
    let last = 0;

    const onVisibility = () => {
      visible = document.visibilityState === "visible";
    };
    const io = new IntersectionObserver((entries) => {
      onScreen = entries[0]?.isIntersecting ?? onScreen;
    });
    io.observe(host);

    let cancelled = false;
    document.fonts
      .load('700 100px "Inter Tight"')
      .catch(() => undefined)
      .then(() => {
        if (cancelled) return;
        resize();
        window.addEventListener("resize", onResize);
        window.addEventListener("pointermove", onPointerMove, { passive: true });
        window.addEventListener("pointerdown", onPointerMove, { passive: true });
        window.addEventListener("pointerleave", onPointerLeave, { passive: true });
        document.addEventListener("visibilitychange", onVisibility);
        last = performance.now();
        raf = requestAnimationFrame(tick);
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
      state.geometry?.dispose();
      state.material?.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  if (fallback) return <StaticX />;

  return (
    <div ref={hostRef} role="img" aria-label="X" className="absolute inset-0">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: "min(60vh, 90vw)",
          aspectRatio: "1",
          background: "radial-gradient(circle, oklch(0.6 0.2 262 / 12%) 0%, transparent 65%)",
        }}
      />
      <span className="sr-only">X</span>
    </div>
  );
}
