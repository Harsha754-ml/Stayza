import React, { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PresentationControls, Edges, Box, Environment, SoftShadows } from '@react-three/drei';
import * as THREE from 'three';

// Procedural Hostel Building Component
const HostelBuilding = ({ scrollY }: { scrollY: React.MutableRefObject<number> }) => {
  const buildingRef = useRef<THREE.Group>(null);
  const glowMaterialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (!buildingRef.current) return;
    
    // Parallax effect based on pointer
    const targetRotX = (state.pointer.y * Math.PI) / 10;
    const targetRotY = (state.pointer.x * Math.PI) / 10;
    
    buildingRef.current.rotation.x = THREE.MathUtils.lerp(buildingRef.current.rotation.x, targetRotX, 0.05);
    buildingRef.current.rotation.y = THREE.MathUtils.lerp(buildingRef.current.rotation.y, targetRotY, 0.05);

    // Scroll-based animations
    // Scroll ranges from 0 to something like 1000px
    const scrollVal = scrollY.current;
    
    // Zoom in on scroll (adjust Z position of the camera or scale of the building)
    const zoomFactor = Math.min(scrollVal / 500, 1); // 0 to 1
    state.camera.position.z = THREE.MathUtils.lerp(5, 3, zoomFactor);
    state.camera.lookAt(0, 0, 0);

    // Intensify glow on scroll
    if (glowMaterialRef.current) {
      glowMaterialRef.current.emissiveIntensity = 2 + (zoomFactor * 3);
    }
  });

  const neonBlue = "#00D1FF";
  
  // Base building material (dark/white theme)
  const baseMaterial = new THREE.MeshStandardMaterial({ 
    color: '#050505', 
    roughness: 0.2, 
    metalness: 0.8 
  });

  return (
    <group ref={buildingRef} position={[0, -1, 0]}>
      {/* Main Core Structure */}
      <Box args={[2, 4, 1.5]} castShadow receiveShadow>
        <primitive object={baseMaterial} attach="material" />
        <Edges color={neonBlue} scale={1.001} threshold={15} />
      </Box>

      {/* Balconies / Floors */}
      {[0, 1, 2, 3].map((floor) => (
        <group key={floor} position={[0, -1.5 + floor * 1.1, 0.8]}>
          <Box args={[1.8, 0.1, 0.4]} castShadow receiveShadow>
            <primitive object={baseMaterial} attach="material" />
            <Edges color={neonBlue} scale={1.01} />
          </Box>
          {/* Neon Window Glows */}
          <Box args={[1.4, 0.6, 0.1]} position={[0, 0.4, -0.1]}>
            <meshStandardMaterial 
              ref={floor === 0 ? glowMaterialRef : null}
              color="#ffffff" 
              emissive={neonBlue} 
              emissiveIntensity={2} 
              toneMapped={false} 
            />
          </Box>
        </group>
      ))}

      {/* Rooftop Element */}
      <Box args={[1, 0.5, 1]} position={[0, 2.25, 0]} castShadow>
        <primitive object={baseMaterial} attach="material" />
        <Edges color={neonBlue} scale={1.01} />
      </Box>
    </group>
  );
};

const Hero3D: React.FC = () => {
  const scrollY = useRef(0);

  // Sync native scroll to ref for use in useFrame
  React.useEffect(() => {
    const handleScroll = () => {
      scrollY.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 2, 5], fov: 45 }} shadows dpr={[1, 2]}>
        <SoftShadows size={20} samples={10} focus={0.5} />
        
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <directionalLight 
          position={[5, 10, 5]} 
          intensity={1} 
          castShadow 
          shadow-mapSize={1024}
        />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#00D1FF" />
        
        {/* Environment for reflections */}
        <Environment preset="city" />

        <PresentationControls 
          global 
          config={{ mass: 2, tension: 500 }} 
          snap={{ mass: 4, tension: 1500 }} 
          rotation={[0, -Math.PI / 4, 0]} 
          polar={[-Math.PI / 3, Math.PI / 3]} 
          azimuth={[-Math.PI / 1.4, Math.PI / 2]}
        >
          <HostelBuilding scrollY={scrollY} />
        </PresentationControls>
      </Canvas>
    </div>
  );
};

export default Hero3D;
