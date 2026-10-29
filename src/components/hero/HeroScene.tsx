import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const SPIN = 0.18;
const TILT = 0.35;

function ChromeX({ small }: { small: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    g.rotation.y += SPIN * dt;
    const tx = state.pointer.y * TILT;
    g.rotation.x += (tx - g.rotation.x) * (1 - Math.exp(-3 * dt));
  });
  const mat = (
    <meshPhysicalMaterial color="#d9dce1" metalness={1} roughness={0.12} clearcoat={1} clearcoatRoughness={0.08} />
  );
  return (
    <group ref={group} scale={small ? 0.75 : 1}>
      <RoundedBox args={[0.55, 3.2, 0.55]} radius={0.12} smoothness={6} rotation={[0, 0, Math.PI / 4]}>
        {mat}
      </RoundedBox>
      <RoundedBox args={[0.55, 3.2, 0.55]} radius={0.12} smoothness={6} rotation={[0, 0, -Math.PI / 4]}>
        {mat}
      </RoundedBox>
    </group>
  );
}

function Particles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2.5 + Math.random() * 3;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      a[i * 3] = r * Math.sin(p) * Math.cos(t);
      a[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
      a[i * 3 + 2] = r * Math.cos(p);
    }
    return a;
  }, [count]);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.y -= Math.min(d, 0.05) * 0.03;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#c8ccd2" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function MouseLight() {
  const light = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    light.current?.position.set(state.pointer.x * 4, state.pointer.y * 3, 3);
  });
  return <pointLight ref={light} intensity={30} color="#ffffff" distance={12} />;
}

export default function HeroScene({ small }: { small: boolean }) {
  return (
    <Canvas
      dpr={[1, small ? 1.5 : 2]}
      camera={{ position: [0, 0, 6], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => gl.domElement.parentElement?.parentElement?.setAttribute("data-scene-ready", "true")}
    >
      <ambientLight intensity={0.2} />
      <MouseLight />
      <Environment resolution={256}>
        <Lightformer intensity={3} position={[0, 5, -2]} scale={[10, 2, 1]} />
        <Lightformer intensity={1.5} position={[-5, 0, 1]} rotation-y={Math.PI / 2} scale={[10, 1, 1]} />
        <Lightformer intensity={1.5} position={[5, 0, 1]} rotation-y={-Math.PI / 2} scale={[10, 1, 1]} />
        <Lightformer intensity={0.6} position={[0, -4, 2]} rotation-x={-Math.PI / 2} scale={[10, 10, 1]} />
      </Environment>
      <ChromeX small={small} />
      <Particles count={small ? 250 : 700} />
    </Canvas>
  );
}
