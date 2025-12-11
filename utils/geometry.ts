import { Vector3 } from 'three';
import { AppMode, ParticleType } from '../types';
import { TREE_HEIGHT, TREE_RADIUS, GALAXY_RADIUS } from '../constants';

export const calculateTargetPosition = (
  mode: AppMode,
  index: number,
  totalParticles: number,
  type?: ParticleType
): Vector3 => {
  const vec = new Vector3();

  switch (mode) {
    case AppMode.TREE: {
      // Special logic for Images in TREE mode: Detach from tree cone
      if (type === ParticleType.IMAGE) {
        // Create a spiral/orbit effect around the tree
        // Spread from somewhat close to the tree out to the edges
        // Use a pseudo-random distribution based on index to ensure they don't clump
        const angle = (index * 137.5) * (Math.PI / 180); // Golden angle for even distribution
        
        // Radius: Start outside the tree radius (25) and go out to 65
        const minRadius = TREE_RADIUS + 10;
        const maxRadius = 70;
        const radiusStep = (maxRadius - minRadius) / (totalParticles * 0.1); // Estimate count
        // Use mod to cycle radius if many images, but keep them generally spread
        const t = (index % 20) / 20; 
        const currentRadius = minRadius + (t * (maxRadius - minRadius)) + (Math.random() * 5);

        const x = Math.cos(angle) * currentRadius;
        const z = Math.sin(angle) * currentRadius;
        
        // Y: Center around the middle of the screen/tree, not following the cone height exactly
        // Spread vertically but keep reasonably centered (-20 to 20)
        const yOffset = (Math.sin(index) * 20); 
        
        vec.set(x, yOffset, z);
      } else {
        // Standard Tree Logic for dots/emojis
        const t = index / totalParticles;
        const angle = t * Math.PI * 24;
        const radius = TREE_RADIUS * (1 - t);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = (t * TREE_HEIGHT) - (TREE_HEIGHT / 2);
        vec.set(x, y, z);
      }
      break;
    }
    case AppMode.GALAXY: {
      // Random distribution in a large volume to fill screen
      const range = GALAXY_RADIUS;
      // Use index to seed random to keep positions stable-ish during re-renders if needed
      // but simpler to just use random for Galaxy cloud effect
      const x = (Math.random() - 0.5) * range * 2.5; // Wider spread
      const y = (Math.random() - 0.5) * range * 1.5; 
      const z = (Math.random() - 0.5) * range * 1.5; 
      
      vec.set(x, y, z);
      break;
    }
  }
  return vec;
};