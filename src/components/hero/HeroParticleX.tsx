import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const DESKTOP_CAP = 14000;
const MOBILE_CAP = 7000;
const TILT_RESPONSE = 5;
const POINTER_TILT = 0.42;

function StaticX() {
  return <div aria-hidden className="hero-poster"><span className="hero-poster-x">X</span></div>;
}

// Read the same semantic palette as the static chrome fallback.
function tokenColor(name: string) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Color();
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  ctx.fillRect(0, 0, 1, 1);
  const pixel = ctx.getImageData(0, 0, 1, 1).data;
  return new THREE.Color().setRGB((pixel[0] ?? 0) / 255, (pixel[1] ?? 0) / 255, (pixel[2] ?? 0) / 255, THREE.SRGBColorSpace);
}

function sampleGlyph(size: number, cap: number) {
  const canvas = document.createElement("canvas");
  const dim = Math.ceil(size * 1.4);
  canvas.width = canvas.height = dim;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.fillStyle = "white";
  ctx.font = `800 ${size}px "Inter Tight", system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("X", dim / 2, dim / 2);
  const data = ctx.getImageData(0, 0, dim, dim).data;
  const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < dim && y < dim && (data[(Math.floor(y) * dim + Math.floor(x)) * 4 + 3] ?? 0) > 128;
  const step = Math.max(1.7, size / (cap === MOBILE_CAP ? 105 : 150));
  const depth = size * 0.14;
  const bevel = size * 0.035;
  const positions: number[] = [];
  const normals: number[] = [];
  const seeds: number[] = [];
  function add(x: number, y: number, z: number, nx: number, ny: number, nz: number) {
    if (seeds.length >= cap) return;
    positions.push(x - dim / 2, dim / 2 - y, z);
    const n = new THREE.Vector3(nx, ny, nz).normalize();
    normals.push(n.x, n.y, n.z);
    seeds.push(Math.random());
  }
  for (let y = 0; y < dim; y += step) {
    for (let x = 0; x < dim; x += step) {
      if (!inside(x, y)) continue;
      const nx = Number(inside(x - bevel, y)) - Number(inside(x + bevel, y));
      const ny = Number(inside(x, y + bevel)) - Number(inside(x, y - bevel));
      const edge = nx !== 0 || ny !== 0;
      const jitterX = x + (Math.random() - 0.5) * step * 0.55;
      const jitterY = y + (Math.random() - 0.5) * step * 0.55;
      add(jitterX, jitterY, depth / 2 - (edge ? bevel * 0.35 : 0), nx * 0.8, ny * 0.8, 1);
      add(jitterX, jitterY, -depth / 2, nx * 0.5, ny * 0.5, -1);
      if (edge && (!inside(x + step, y) || !inside(x - step, y) || !inside(x, y + step) || !inside(x, y - step))) {
        for (let z = -depth / 2; z < depth / 2; z += step) add(jitterX, jitterY, z, nx, ny, 0);
      }
    }
  }
  return { positions, normals, seeds, step };
}

const VERT = /* glsl */ `
attribute float aSeed;
uniform float uTime;
uniform float uSize;
uniform float uRadius;
uniform vec2 uPointer;
uniform float uActive;
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vPosition;
varying float vSeed;
void main() {
  vec3 p = position;
  float distanceToPointer = length(p.xy - uPointer);
  float influence = (1.0 - smoothstep(0.0, uRadius, distanceToPointer)) * uActive;
  p.z += influence * sin(aSeed * 30.0 + uTime * 2.0) * uRadius * 0.045;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = normalize(-mv.xyz);
  vPosition = mv.xyz;
  vSeed = aSeed;
  gl_PointSize = uSize * (0.85 + aSeed * 0.3) * clamp(1000.0 / -mv.z, 0.65, 2.0);
  gl_Position = projectionMatrix * mv;
}
`;
const FRAG = /* glsl */ `
uniform vec3 uMetal;
uniform vec3 uSilver;
uniform vec3 uLight;
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vPosition;
varying float vSeed;
void main() {
  vec2 uv = gl_PointCoord * 2.0 - 1.0;
  float d = dot(uv, uv);
  if (d > 1.0) discard;
  // Each particle is a tiny metallic grain on the extruded letter surface.
  vec3 grain = vec3(uv * 0.28, sqrt(max(0.0, 1.0 - d)) * 0.22);
  vec3 n = normalize(vNormal + grain);
  vec3 light = normalize(uLight);
  vec3 halfVector = normalize(light + vView);
  float spec = pow(max(dot(n, halfVector), 0.0), 42.0);
  float rim = pow(1.0 - abs(dot(n, vView)), 2.2);
  float strip = pow(max(0.0, 1.0 - abs(dot(reflect(-vView, n), normalize(vec3(-0.6, 0.8, 0.4))))), 14.0);
  float diffuse = max(dot(n, light), 0.0);
  vec3 col = uMetal * (0.65 + diffuse * 0.6) + uSilver * (spec * 1.1 + rim * 0.55 + strip * 0.75 + 0.035);
  col *= 0.8 + vSeed * 0.35;
  gl_FragColor = vec4(col, smoothstep(1.0, 0.72, d));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export default function HeroParticleX() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    const host = hostRef.current;
    if (!host || window.matchMedia("(prefers-reduced-motion: reduce)").matches || (navigator.hardwareConcurrency ?? 8) <= 2) {
      setFallback(true);
      return;
    }
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      setFallback(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearAlpha(0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const canvas = renderer.domElement;
    canvas.className = "hero-particle-canvas";
    host.appendChild(canvas);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 1, 10000);
    const group = new THREE.Group();
    scene.add(group);
    const material = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: true,
      uniforms: {
        uTime: { value: 0 }, uSize: { value: 3 }, uRadius: { value: 80 },
        uPointer: { value: new THREE.Vector2() }, uActive: { value: 0 },
        uMetal: { value: tokenColor("--hero-metal") }, uSilver: { value: tokenColor("--silver-light") },
        uLight: { value: new THREE.Vector3(-0.6, 0.8, 1) },
      },
    });
    let geometry: THREE.BufferGeometry | undefined;
    let points: THREE.Points | undefined;
    let width = 1;
    let height = 1;
    let cancelled = false;
    let ready = false;
    let raf = 0;
    let resizeTimer = 0;
    let last = performance.now();
    let elapsed = 0;
    let visible = true;
    let onScreen = true;
    const pointer = { x: 0, y: 0, active: false };
    const resize = () => {
      const rect = host.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = height / (2 * Math.tan(THREE.MathUtils.degToRad(17.5)));
      camera.updateProjectionMatrix();
      const size = Math.min(height * 0.4, width * 0.62);
      const sampled = sampleGlyph(size, width < 768 ? MOBILE_CAP : DESKTOP_CAP);
      if (!sampled) { setFallback(true); return; }
      if (points) group.remove(points);
      geometry?.dispose();
      geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(sampled.positions, 3));
      geometry.setAttribute("normal", new THREE.Float32BufferAttribute(sampled.normals, 3));
      geometry.setAttribute("aSeed", new THREE.Float32BufferAttribute(sampled.seeds, 1));
      geometry.computeBoundingSphere();
      points = new THREE.Points(geometry, material);
      group.add(points);
      group.position.y = height * 0.23;
      material.uniforms.uSize.value = sampled.step * 1.1 * renderer.getPixelRatio() * camera.position.z / 1000;
      material.uniforms.uRadius.value = size * 0.35;
    };
    const onResize = () => { window.clearTimeout(resizeTimer); resizeTimer = window.setTimeout(resize, 150); };
    const onMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer.x = (event.clientX - rect.left) / width * 2 - 1;
      pointer.y = (event.clientY - rect.top) / height * 2 - 1;
      pointer.active = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    };
    const onLeave = () => { pointer.active = false; };
    const onVisibility = () => { visible = document.visibilityState === "visible"; };
    const observer = new IntersectionObserver(([entry]) => { onScreen = entry?.isIntersecting ?? true; });
    observer.observe(host);
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!visible || !onScreen) return;
      elapsed += dt;
      const blend = 1 - Math.exp(-TILT_RESPONSE * dt);
      const targetY = -0.3 + (pointer.active ? pointer.x * POINTER_TILT : Math.sin(elapsed * 0.35) * 0.1);
      const targetX = 0.12 + (pointer.active ? pointer.y * 0.22 : Math.cos(elapsed * 0.3) * 0.045);
      group.rotation.y += (targetY - group.rotation.y) * blend;
      group.rotation.x += (targetX - group.rotation.x) * blend;
      material.uniforms.uTime.value = elapsed;
      material.uniforms.uActive.value += ((pointer.active ? 1 : 0) - material.uniforms.uActive.value) * blend;
      material.uniforms.uPointer.value.set(pointer.x * width / 2, -pointer.y * height / 2 - group.position.y);
      material.uniforms.uLight.value.set(-0.6 + pointer.x * 0.8, 0.8 - pointer.y * 0.5, 1);
      renderer.render(scene, camera);
      if (!ready && points) { ready = true; host.setAttribute("data-scene-ready", "true"); }
    };
    group.rotation.set(0.12, -0.3, -0.035);
    document.fonts.load('800 100px "Inter Tight"').catch(() => undefined).then(() => {
      if (cancelled) return;
      resize();
      window.addEventListener("resize", onResize);
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      document.addEventListener("visibilitychange", onVisibility);
      raf = requestAnimationFrame(tick);
    });
    const onContextLost = (event: Event) => { event.preventDefault(); setFallback(true); };
    canvas.addEventListener("webglcontextlost", onContextLost);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      observer.disconnect();
      geometry?.dispose();
      material.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, []);
  if (fallback) return <StaticX />;
  return <div ref={hostRef} role="img" aria-label="Dark metallic three-dimensional particle X" className="pointer-events-none absolute inset-0" />;
}
