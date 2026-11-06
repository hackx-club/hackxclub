import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const SPIN = 0.18;
const TILT = 0.35;

function palette(name: string) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.Color();
  context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  context.fillRect(0, 0, 1, 1);
  const pixel = context.getImageData(0, 0, 1, 1).data;
  return new THREE.Color().setRGB((pixel[0] ?? 0) / 255, (pixel[1] ?? 0) / 255, (pixel[2] ?? 0) / 255, THREE.SRGBColorSpace);
}

export default function HeroScene() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      setFallback(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearAlpha(0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    const canvas = renderer.domElement;
    canvas.className = "hero-particle-canvas";
    host.appendChild(canvas);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.z = 6;
    const silver = palette("--silver");
    const lightColor = palette("--silver-light");
    // Local studio reflections: the original four softboxes, without remote assets.
    const studio = new THREE.Scene();
    const lightGeometry = new THREE.PlaneGeometry(1, 1);
    const lightMaterials: THREE.MeshBasicMaterial[] = [];
    const softbox = (intensity: number, position: [number, number, number], scale: [number, number, number], rotation: [number, number, number]) => {
      const material = new THREE.MeshBasicMaterial({ color: lightColor.clone().multiplyScalar(intensity), side: THREE.DoubleSide });
      lightMaterials.push(material);
      const mesh = new THREE.Mesh(lightGeometry, material);
      mesh.position.set(...position);
      mesh.scale.set(...scale);
      mesh.rotation.set(...rotation);
      studio.add(mesh);
    };
    softbox(3, [0, 5, -2], [10, 2, 1], [0, 0, 0]);
    softbox(1.5, [-5, 0, 1], [10, 1, 1], [0, Math.PI / 2, 0]);
    softbox(1.5, [5, 0, 1], [10, 1, 1], [0, -Math.PI / 2, 0]);
    softbox(0.6, [0, -4, 2], [10, 10, 1], [-Math.PI / 2, 0, 0]);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(studio, 0.05);
    scene.environment = environment.texture;
    pmrem.dispose();
    // Connected dots: chrome nodes on a loose sphere, joined to their nearest neighbours.
    const geometry = new THREE.SphereGeometry(0.16, 32, 24);
    const material = new THREE.MeshPhysicalMaterial({ color: silver, metalness: 1, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.08 });
    const linkGeometry = new THREE.CylinderGeometry(0.025, 0.025, 1, 10);
    const group = new THREE.Group();
    const nodes: THREE.Vector3[] = [];
    const COUNT = 16;
    for (let i = 0; i < COUNT; i++) {
      const y = 1 - (i / (COUNT - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const t = i * 2.399963;
      nodes.push(new THREE.Vector3(Math.cos(t) * r, y, Math.sin(t) * r).multiplyScalar(1.5 + (i % 3) * 0.12));
    }
    nodes.forEach((p, i) => {
      const dot = new THREE.Mesh(geometry, material);
      dot.position.copy(p);
      dot.scale.setScalar(i % 4 === 0 ? 1.5 : 1);
      group.add(dot);
    });
    const done = new Set<string>();
    const up = new THREE.Vector3(0, 1, 0);
    nodes.forEach((a, i) => {
      nodes.map((b, j) => ({ j, d: a.distanceTo(b) })).filter((o) => o.j !== i).sort((x, y) => x.d - y.d).slice(0, 3).forEach(({ j, d }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (done.has(key)) return;
        done.add(key);
        const link = new THREE.Mesh(linkGeometry, material);
        link.position.copy(a).add(nodes[j]!).multiplyScalar(0.5);
        link.scale.y = d;
        link.quaternion.setFromUnitVectors(up, nodes[j]!.clone().sub(a).normalize());
        group.add(link);
      });
    });
    scene.add(group);
    scene.add(new THREE.AmbientLight(lightColor, 0.2));
    const mouseLight = new THREE.PointLight(lightColor, 30, 12);
    mouseLight.position.set(0, 0, 3);
    scene.add(mouseLight);
    const pointer = { x: 0, y: 0 };
    let width = 1;
    let height = 1;
    let raf = 0;
    let last = performance.now();
    let visible = true;
    let onScreen = true;
    let ready = false;
    const resize = () => {
      const rect = host.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      // Preserve the current page copy; restore only the original solid X artwork.
      const scale = Math.min(height * 0.22, width * 0.34) / (height * 0.64);
      group.scale.setScalar(scale);
      group.position.y = 1.25;
    };
    const onMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer.x = THREE.MathUtils.clamp((event.clientX - rect.left) / width * 2 - 1, -1, 1);
      pointer.y = THREE.MathUtils.clamp(1 - (event.clientY - rect.top) / height * 2, -1, 1);
    };
    const onLeave = () => { pointer.x = pointer.y = 0; };
    const onVisibility = () => { visible = document.visibilityState === "visible"; };
    const observer = new IntersectionObserver(([entry]) => { onScreen = entry?.isIntersecting ?? true; });
    observer.observe(host);
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!visible || !onScreen) return;
      group.rotation.y += SPIN * dt;
      group.rotation.x += (pointer.y * TILT - group.rotation.x) * (1 - Math.exp(-3 * dt));
      mouseLight.position.set(pointer.x * 4, pointer.y * 3, 3);
      renderer.render(scene, camera);
      if (!ready) { ready = true; host.setAttribute("data-scene-ready", "true"); }
    };
    const contextLost = (event: Event) => { event.preventDefault(); setFallback(true); };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", contextLost);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", contextLost);
      environment.dispose();
      geometry.dispose();
      linkGeometry.dispose();
      material.dispose();
      lightGeometry.dispose();
      lightMaterials.forEach((item) => item.dispose());
      renderer.dispose();
      canvas.remove();
    };
  }, []);
  if (fallback) return <div aria-hidden className="hero-poster"><span className="hero-poster-x">X</span></div>;
  return <div ref={hostRef} role="img" aria-label="Spinning network of connected chrome dots" className="pointer-events-none absolute inset-0" />;
}
