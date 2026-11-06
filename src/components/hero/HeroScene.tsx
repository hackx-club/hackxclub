import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { DottedX } from "./DottedX";

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
    // Fixed dot positions form a volumetric X; only the whole group moves.
    const geometry = new THREE.SphereGeometry(0.013, 6, 3);
    const material = new THREE.MeshPhysicalMaterial({ color: silver, metalness: 1, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.08 });
    const group = new THREE.Group();
    const nodes: THREE.Vector3[] = [];
    for (let layer = -1; layer <= 1; layer += 2) {
      for (let row = -30; row <= 30; row++) {
        for (let col = -30; col <= 30; col++) {
          if (Math.min(Math.abs(col - row), Math.abs(col + row)) <= 6) {
            nodes.push(new THREE.Vector3(col * 0.045, row * 0.045, layer * 0.12));
          }
        }
      }
    }
    const dots = new THREE.InstancedMesh(geometry, material, nodes.length);
    const matrix = new THREE.Matrix4();
    nodes.forEach((point, index) => {
      matrix.makeTranslation(point.x, point.y, point.z);
      dots.setMatrixAt(index, matrix);
    });
    dots.instanceMatrix.needsUpdate = true;
    group.add(dots);
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
      const scale = Math.min(height * 0.24, width * 0.42) / (height * 0.64);
      group.scale.setScalar(scale);
      group.position.y = 1.05;
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
      // A bounded shared sway keeps the X legible instead of turning edge-on.
      group.rotation.y = Math.sin(now / 1000 * SPIN) * 0.42 + pointer.x * 0.12;
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
      dots.dispose();
      material.dispose();
      lightGeometry.dispose();
      lightMaterials.forEach((item) => item.dispose());
      renderer.dispose();
      canvas.remove();
    };
  }, []);
  if (fallback) return <DottedX />;
  return <div ref={hostRef} role="img" aria-label="Metallic dotted X moving together as one shape" className="pointer-events-none absolute inset-0" />;
}
