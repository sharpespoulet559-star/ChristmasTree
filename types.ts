import { Vector3 } from 'three';
import React from 'react';

export enum AppMode {
  TREE = 'TREE',
  GALAXY = 'GALAXY'
}

export enum ParticleType {
  SPHERE = 'SPHERE', // Now represents general geometric shapes
  EMOJI = 'EMOJI',
  IMAGE = 'IMAGE'
}

export interface ParticleData {
  id: string;
  type: ParticleType;
  content: string | number; // Emoji char or Image URL
  position: Vector3;
  targetPosition: Vector3;
  color?: string;
  scale: number;
  originalIndex: number;
  shape?: string; // 'sphere', 'cube', 'tetrahedron', 'tree'
}

export interface ImageConfig {
  url: string;
  id: string;
}

// Global JSX Intrinsic Elements Augmentation to fix missing HTML tags
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}