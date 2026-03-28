import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';

function ResumeModel({ score = 50 }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  const color = score >= 80 ? '#10B981' : score >= 60 ? '#059669' : score >= 40 ? '#F59E0B' : '#EF4444';

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={1.2}>
      <group ref={meshRef}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.2, 3, 0.1]} />
          <MeshDistortMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.08}
            roughness={0.3}
            metalness={0.6}
            distort={0.12}
            speed={2}
            transparent
            opacity={0.9}
          />
        </mesh>

        <mesh position={[0, 1.1, 0.06]}>
          <boxGeometry args={[1.8, 0.2, 0.02]} />
          <meshStandardMaterial color="#111827" />
        </mesh>

        {[-0.3, -0.6, -0.9, 0.2, 0.5].map((y, i) => (
          <mesh key={i} position={[-0.15, y, 0.06]}>
            <boxGeometry args={[1.4 - i * 0.15, 0.08, 0.01]} />
            <meshStandardMaterial color="#6B7280" transparent opacity={0.5} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

export default function ResumeVisualization({ score = 50, height = 350 }) {
  return (
    <div style={{ width: '100%', height }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.9} />
        <pointLight position={[-5, -3, 3]} color="#10B981" intensity={0.4} />
        <pointLight position={[3, -2, 4]} color="#84CC16" intensity={0.3} />
        <ResumeModel score={score} />
      </Canvas>
    </div>
  );
}
