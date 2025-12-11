import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const SnowBackground: React.FC = () => {
  const ref = useRef<THREE.Points>(null);
  
  const count = 3000;
  // Initialize random positions
  const initialPositions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 120;     // X: Wide range
      pos[i * 3 + 1] = (Math.random() - 0.5) * 120; // Y: Tall range
      pos[i * 3 + 2] = (Math.random() - 0.5) * 120; // Z: Deep range
    }
    return pos;
  }, []);

  // Store speeds for each flake
  const speeds = useMemo(() => {
      const s = new Float32Array(count);
      for(let i=0; i<count; i++) {
          s[i] = 0.05 + Math.random() * 0.1; // Random fall speed
      }
      return s;
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      // 5. 背景改成小雪花由上而下缓慢飘落
      const positions = ref.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < count; i++) {
        // Update Y position
        positions[i * 3 + 1] -= speeds[i];

        // Reset if goes below -60
        if (positions[i * 3 + 1] < -60) {
           positions[i * 3 + 1] = 60;
           // Randomize X and Z slightly when recycling to prevent static patterns
           positions[i * 3] = (Math.random() - 0.5) * 120;
           positions[i * 3 + 2] = (Math.random() - 0.5) * 120;
        }
      }
      
      ref.current.geometry.attributes.position.needsUpdate = true;
      
      // Gentle global rotation for wind effect
      ref.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group>
      <Points ref={ref} positions={initialPositions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.4}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.7}
        />
      </Points>
    </group>
  );
};

export default SnowBackground;