import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Image, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { ParticleData, ParticleType, AppMode } from '../types';
import { calculateTargetPosition } from '../utils/geometry';

interface ParticleItemProps {
  data: ParticleData;
  mode: AppMode;
  totalParticles: number;
  onHover: (active: boolean) => void;
  onSelect: (data: ParticleData) => void;
}

const ParticleItem: React.FC<ParticleItemProps> = ({ data, mode, totalParticles, onHover, onSelect }) => {
  const groupRef = useRef<THREE.Group>(null);
  const imageGroupRef = useRef<THREE.Group>(null);
  
  const [hovered, setHovered] = useState(false);

  // Calculate target position locally
  const targetPosition = useMemo(() => {
    return calculateTargetPosition(mode, data.originalIndex, totalParticles, data.type);
  }, [mode, data.originalIndex, totalParticles, data.type]);

  // Use array for initial position
  const initialPosition = useMemo(() => [data.position.x, data.position.y, data.position.z] as [number, number, number], []);

  // Frame Logic: Movement & Animation
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Standard Mode: Lerp to target position
      groupRef.current.position.lerp(targetPosition, delta * 2.0);
      
      // Rotation logic
      if (data.type === ParticleType.SPHERE || data.type === ParticleType.EMOJI) {
         // Rotate the object itself slightly
         groupRef.current.rotation.y += delta * 0.5;
         groupRef.current.rotation.x += delta * 0.2; 
         
         // Slight bobbing for 3D feel
         groupRef.current.position.y += Math.sin(state.clock.elapsedTime + data.originalIndex) * 0.005;
      }
    }
    
    // Pulse effect for photos (Applied to the whole group)
    if (data.type === ParticleType.IMAGE && imageGroupRef.current) {
        // Base size logic
        let baseScale = data.scale * 1.2; 
        
        // Galaxy Mode - Larger but not too huge
        if (mode === AppMode.GALAXY) {
            baseScale = data.scale * 2.5; 
        }

        const targetScaleFactor = hovered ? 1.2 : 1.0; 
        const finalScale = baseScale * targetScaleFactor;
        
        // Smooth scaling
        const current = imageGroupRef.current.scale.x;
        const next = THREE.MathUtils.lerp(current, finalScale, delta * 8); 
        imageGroupRef.current.scale.set(next, next, next);
    }
  });

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    if (data.type === ParticleType.IMAGE) {
      setHovered(true);
      onHover(true);
      document.body.style.cursor = 'pointer';
    }
  };

  const handlePointerOut = (e: any) => {
    if (data.type === ParticleType.IMAGE) {
      setHovered(false);
      onHover(false);
      document.body.style.cursor = 'auto';
    }
  };

  // 1. Hide images in TREE mode (Only show in Galaxy mode)
  if (mode === AppMode.TREE && data.type === ParticleType.IMAGE) {
    return null;
  }

  // Shiny material for geometric shapes
  const shinyMaterial = (
      <meshStandardMaterial
        color={data.color || 'white'}
        roughness={0.15}   
        metalness={0.9}   
        envMapIntensity={2.0} 
      />
  );

  // Helper to render specific shape based on configuration
  const renderGeometry = () => {
    switch (data.shape) {
      case 'cube':
        return <boxGeometry args={[0.7, 0.7, 0.7] as [number, number, number]} />;
      case 'tetrahedron':
        return <tetrahedronGeometry args={[0.6] as [number]} />;
      case 'tree':
        return <coneGeometry args={[0.4, 0.9, 8] as [number, number, number]} />;
      case 'sphere':
      default:
        return <sphereGeometry args={[0.5, 32, 32] as [number, number, number]} />;
    }
  };

  return (
    <group ref={groupRef} position={initialPosition}>
      {/* GEOMETRIC SHAPES (Spheres, Cubes, etc.) */}
      {data.type === ParticleType.SPHERE && (
        <mesh scale={data.scale * 0.8}>
          {renderGeometry()}
          {shinyMaterial}
        </mesh>
      )}

      {/* EMOJIS - Floating colored text */}
      {data.type === ParticleType.EMOJI && (
        <group scale={data.scale}>
           <Billboard>
              <Text
                fontSize={1.2}
                color={data.color} 
                anchorX="center"
                anchorY="middle"
                material-toneMapped={false} 
              >
                {data.content}
              </Text>
           </Billboard>
        </group>
      )}

      {/* IMAGES (PHOTOS) - No Border */}
      {data.type === ParticleType.IMAGE && (
        <Billboard>
            {/* Group wrapper for Image to scale together */}
            <group ref={imageGroupRef}>
                {/* 2. Border removed */}

                {/* The Image Content */}
                <Image 
                    url={data.content as string} 
                    transparent 
                    // Relative scale inside the group is 1, group handles actual size
                    scale={[1, 1, 1] as [number, number, number]}
                    toneMapped={false} 
                    onPointerOver={handlePointerOver} 
                    onPointerOut={handlePointerOut} 
                    onClick={(e) => { e.stopPropagation(); onSelect(data); }}
                />
            </group>
        </Billboard>
      )}
    </group>
  );
};

export default ParticleItem;