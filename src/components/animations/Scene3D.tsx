import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const AnimatedShape = () => {
  const sphereRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock, pointer }) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = clock.getElapsedTime() * 0.2;
      sphereRef.current.rotation.y = clock.getElapsedTime() * 0.3;
      
      // Gentle mouse interaction
      sphereRef.current.position.x = THREE.MathUtils.lerp(sphereRef.current.position.x, pointer.x * 2, 0.05);
      sphereRef.current.position.y = THREE.MathUtils.lerp(sphereRef.current.position.y, pointer.y * 2, 0.05);
    }
  });

  return (
    <Sphere ref={sphereRef} args={[1, 64, 64]} scale={2}>
      <MeshDistortMaterial
        color="#14b8a6"
        attach="material"
        distort={0.5} // Amount of distortion
        speed={2} // Speed of the distortion animation
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
};

const Scene3D: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="city" />
        <AnimatedShape />
      </Canvas>
    </div>
  );
};

export default Scene3D;
