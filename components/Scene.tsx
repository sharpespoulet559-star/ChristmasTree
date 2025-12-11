import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { AppMode, ParticleData, ParticleType } from '../types';
import ParticleItem from './ParticleItem';
import SnowBackground from './SnowBackground';
import { EMOJIS, PARTICLE_COUNT, COLORS, GEOMETRY_SHAPES } from '../constants';

interface SceneProps {
  mode: AppMode;
  userImages: string[];
  onSelectPhoto: (data: ParticleData) => void;
}

const ParticleContainer: React.FC<SceneProps> = ({ mode, userImages, onSelectPhoto }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [particles, setParticles] = useState<ParticleData[]>([]);
  const [isHoveringImage, setIsHoveringImage] = useState(false);

  // Helper to validate image URLs
  const validateImage = async (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
    });
  };

  // Initialize Particles
  useEffect(() => {
    const initParticles = async () => {
        // Preload and Filter Images
        const validImages: string[] = [];
        for (const url of userImages) {
            const isValid = await validateImage(url);
            if (isValid) validImages.push(url);
        }

        const tempParticles: ParticleData[] = [];
        const indices = Array.from({ length: PARTICLE_COUNT }, (_, i) => i);
        
        // Shuffle indices to randomly scatter images
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }

        // Keep images relatively rare to stay special
        const maxImageSlots = Math.floor(PARTICLE_COUNT * 0.08); 
        const imageCount = Math.min(validImages.length, maxImageSlots);
        
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const isImageSlot = indices.indexOf(i) < imageCount;

            let pType = ParticleType.SPHERE;
            let content: string | number = '';
            let color = COLORS[Math.floor(Math.random() * COLORS.length)];
            let shape = 'sphere';
            
            // Large particles
            let scale = Math.random() * 1.0 + 1.5; 

            if (isImageSlot && validImages.length > 0) {
                pType = ParticleType.IMAGE;
                const imgIdx = indices.indexOf(i);
                content = validImages[imgIdx]; 
                scale = 3.5; // Significantly increased scale for images to make them pop
            } else {
                // Mix of Emojis and Geometric Shapes
                // 60% chance for Emoji
                if (Math.random() > 0.4) {
                    pType = ParticleType.EMOJI;
                    content = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
                    color = COLORS[Math.floor(Math.random() * COLORS.length)]; 
                } else {
                    // Geometric Shape
                    pType = ParticleType.SPHERE;
                    color = COLORS[Math.floor(Math.random() * COLORS.length)]; 
                    shape = GEOMETRY_SHAPES[Math.floor(Math.random() * GEOMETRY_SHAPES.length)];
                }
            }

            tempParticles.push({
                id: `p-${i}`,
                type: pType,
                content,
                // Initial random spread (wide)
                position: new THREE.Vector3((Math.random()-0.5)*120, (Math.random()-0.5)*120, (Math.random()-0.5)*120), 
                targetPosition: new THREE.Vector3(),
                scale,
                color,
                originalIndex: i,
                shape
            });
        }

        setParticles(tempParticles);
    };

    initParticles();
  }, [userImages]);

  // Scene Rotation Logic
  useFrame((state, delta) => {
    if (groupRef.current && !isHoveringImage) {
      let rotationSpeed = 0;
      
      if (mode === AppMode.TREE) rotationSpeed = 0.3;
      if (mode === AppMode.GALAXY) rotationSpeed = 0.05; 

      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Enhanced Tree Topper Light */}
      {mode === AppMode.TREE && (
        <group position={[0, 26, 0] as [number, number, number]}> 
           <pointLight intensity={5} distance={30} color="#ffdd00" decay={1} />
           <mesh>
             <sphereGeometry args={[1.5, 32, 32] as [number, number, number]} />
             <meshStandardMaterial 
                color="#ffdd00" 
                emissive="#ffaa00" 
                emissiveIntensity={3} 
                toneMapped={false}
             />
           </mesh>
           <Sparkles count={50} scale={8} size={10} speed={0.4} opacity={1} color="#ffff00" />
        </group>
      )}

      {particles.map((p) => (
        <ParticleItem 
          key={p.id} 
          data={p} 
          mode={mode}
          totalParticles={particles.length}
          onHover={setIsHoveringImage}
          onSelect={onSelectPhoto}
        />
      ))}
    </group>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 5, 80], fov: 60 }} dpr={[1, 2]}>
        <color attach="background" args={['#02020a'] as [string]} />
        <fog attach="fog" args={['#02020a', 40, 150] as [string, number, number]} />
        
        {/* Lighting Setup */}
        <ambientLight intensity={0.5} />
        <pointLight position={[20, 20, 20] as [number, number, number]} intensity={2} color="#fff" />
        <pointLight position={[-20, -10, -20] as [number, number, number]} intensity={1} color="#9090ff" />
        <spotLight position={[0, 100, 0] as [number, number, number]} intensity={2} angle={0.6} penumbra={0.5} castShadow />
        
        {/* Environment for reflections */}
        <Environment preset="city" blur={0.5} background={false} />

        {/* Background Elements */}
        <Stars radius={200} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <SnowBackground />
        
        <ParticleContainer {...props} />
        
        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          minDistance={10} 
          maxDistance={150}
          autoRotate={false} 
        />
      </Canvas>
    </div>
  );
};

export default Scene;