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
  const imageRef = useRef<THREE.Mesh>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  
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
         groupRef.current.rotation.x += delta * 0.2; // Add some random tumble for shapes
         
         // Slight bobbing for 3D feel
         groupRef.current.position.y += Math.sin(state.clock.elapsedTime + data.originalIndex) * 0.005;
      }
    }
    
    // Pulse effect for photos & Ring Animation
    if (data.type === ParticleType.IMAGE) {
        // Image Pulse
        if (imageRef.current) {
            let baseSize = data.scale * 1.5; 
            
            // 2. Button 2 (Galaxy Mode) - Enlarge images significantly
            if (mode === AppMode.GALAXY) {
                baseSize = data.scale * 4.0; // Much bigger in Galaxy mode
            }

            const targetScale = hovered ? 1.2 : 1.0; 
            const targetSize = baseSize * targetScale;
            
            const current = imageRef.current.scale.x;
            const next = THREE.MathUtils.lerp(current, targetSize, delta * 8); 
            imageRef.current.scale.set(next, next, 1);
        }

        // Ring Animation - Silky Smooth Rotation
        const time = state.clock.elapsedTime;
        if (ringRef1.current) {
            // Ring 1: Rotates around Z and slightly tumbles on X
            ringRef1.current.rotation.z = time * 0.4;
            ringRef1.current.rotation.x = Math.sin(time * 0.5) * 0.3;
        }
        if (ringRef2.current) {
            // Ring 2: Counter-rotates on Y and Z
            ringRef2.current.rotation.y = time * 0.3;
            ringRef2.current.rotation.z = -time * 0.2 + 1; // Offset
        }
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

  // Shiny material for geometric shapes
  const shinyMaterial = (
      <meshStandardMaterial
        color={data.color || 'white'}
        roughness={0.15}   
        metalness={0.9}   
        envMapIntensity={2.0} 
      />
  );

  const initialImageSize = data.scale * 1.5; 
  // Radius needs to be larger than half-diagonal of square to enclose corners.
  const ringRadius = initialImageSize * 0.85; 

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

      {/* EMOJIS - Floating colored text, NO backing sphere */}
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

      {/* IMAGES (PHOTOS) - Clean Metallic Border, NO Sparkles/Glow */}
      {data.type === ParticleType.IMAGE && (
        <Billboard>
            {/* 1. Sparkles removed as requested */}

            {/* 2. Outer Rotating Gold Ring - Non-Emissive (No Glow) */}
             <mesh ref={ringRef1} position={[0, 0, -0.05] as [number, number, number]}>
                <torusGeometry args={[ringRadius, 0.03, 16, 100] as [number, number, number, number]} />
                <meshPhysicalMaterial 
                  color="#FFD700" 
                  metalness={1.0} 
                  roughness={0.2}
                  clearcoat={1.0}
                  clearcoatRoughness={0.1}
                  // Removed emissive to stop glowing
                  toneMapped={false}
                />
             </mesh>

            {/* 3. Inner Intersecting Silver/Gold Ring - Non-Emissive */}
             <mesh ref={ringRef2} position={[0, 0, -0.05] as [number, number, number]}>
                <torusGeometry args={[ringRadius * 0.85, 0.02, 16, 100] as [number, number, number, number]} />
                <meshPhysicalMaterial 
                  color="#FFFFFF" 
                  metalness={0.9} 
                  roughness={0.2}
                  // Removed emissive
                  toneMapped={false}
                />
             </mesh>

            {/* Image Component */}
             <Image 
               ref={imageRef as any}
               url={data.content as string} 
               transparent 
               scale={[initialImageSize, initialImageSize, 1] as [number, number, number]}
               toneMapped={false} 
               onPointerOver={handlePointerOver} 
               onPointerOut={handlePointerOut} 
               onClick={(e) => { e.stopPropagation(); onSelect(data); }}
             />
        </Billboard>
      )}
    </group>
  );
};

export default ParticleItem;