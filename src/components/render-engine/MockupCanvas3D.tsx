import React, { Suspense, useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Center,
  ContactShadows,
  Decal,
  OrbitControls,
  useGLTF
} from '@react-three/drei';
import * as THREE from 'three';
import {
  MockupConfig,
  RenderAngle,
  RenderSnapshot
} from '../../types/renderEngine';

const Z_DEPTH = 0.15;

interface DecalMeshProps {
  config: MockupConfig;
  isAutoRotate: boolean;
}

function GarmentDecalMesh({ config, isAutoRotate }: DecalMeshProps) {
  const { nodes, materials } = useGLTF('/shirt_baked.glb') as unknown as {
    nodes: Record<string, THREE.Mesh>;
    materials: Record<string, THREE.Material>;
  };

  const groupRef = useRef<THREE.Group>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number>(1);

  // Load and calibrate decal texture preserving exact aspect ratio
  useEffect(() => {
    if (!config.uploadedImageUrl) {
      setTexture(null);
      return;
    }

    let isMounted = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (!isMounted) return;
      const aspect = img.naturalWidth / (img.naturalHeight || 1);
      setAspectRatio(aspect);

      const tex = new THREE.Texture(img);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 16;
      tex.needsUpdate = true;
      setTexture(tex);
    };
    img.onerror = () => {
      console.warn('Could not load image for decal projection:', config.uploadedImageUrl);
      if (isMounted) setTexture(null);
    };
    img.src = config.uploadedImageUrl;

    return () => {
      isMounted = false;
    };
  }, [config.uploadedImageUrl]);

  useFrame((_, dt) => {
    if (!groupRef.current) return;
    if (isAutoRotate) {
      groupRef.current.rotation.y += 0.015;
    }
  });

  const targetGeometry = nodes?.T_Shirt_male?.geometry;
  const targetMaterial = materials?.lambert1;

  if (!targetGeometry || !targetMaterial) {
    return null;
  }

  // Calculate decal scale vector preserving aspect ratio without stretching
  const baseScale = config.scale;
  let scaleX = baseScale;
  let scaleY = baseScale;
  if (aspectRatio > 1) {
    scaleY = baseScale / aspectRatio;
  } else if (aspectRatio < 1 && aspectRatio > 0) {
    scaleX = baseScale * aspectRatio;
  }

  const isFront = config.targetSide === 'front';
  const posX = isFront ? config.offsetX : -config.offsetX;
  const posY = config.offsetY;
  const posZ = isFront ? Z_DEPTH : -Z_DEPTH;
  const rad = (config.rotationDeg * Math.PI) / 180;
  const rotation: [number, number, number] = isFront
    ? [0, 0, rad]
    : [0, Math.PI, -rad];

  return (
    <group ref={groupRef}>
      <mesh
        geometry={targetGeometry}
        material={targetMaterial}
        material-color={config.colorHex}
        material-roughness={0.95}
        castShadow
        receiveShadow
      >
        {texture && (
          <Decal
            position={[posX, posY, posZ]}
            rotation={rotation}
            scale={[scaleX, scaleY, 0.35]}
            map={texture}
            polygonOffsetFactor={-2}
            depthTest={false}
          />
        )}
      </mesh>
    </group>
  );
}

// Lighting Rig matching the selected preset
function StudioLighting({ preset }: { preset: MockupConfig['lighting'] }) {
  if (preset === 'clean-ecommerce') {
    return (
      <>
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 5, 4]} intensity={1.5} castShadow />
        <directionalLight position={[-3, 4, -2]} intensity={1.0} />
        <directionalLight position={[0, -2, 2]} intensity={0.4} />
      </>
    );
  }

  if (preset === 'warm-editorial') {
    return (
      <>
        <ambientLight intensity={0.5} color="#FEF3C7" />
        <directionalLight position={[2.5, 4, 3]} intensity={1.8} color="#FFFBEB" castShadow />
        <directionalLight position={[-2.5, 2, -2]} intensity={0.6} color="#FDE68A" />
        <directionalLight position={[0, -1, 2]} intensity={0.2} color="#D97706" />
      </>
    );
  }

  if (preset === 'cyber-night') {
    return (
      <>
        <ambientLight intensity={0.3} color="#0F172A" />
        <directionalLight position={[3, 4, 3]} intensity={1.4} color="#38BDF8" castShadow />
        <directionalLight position={[-3, 3, -3]} intensity={1.2} color="#F43F5E" />
        <directionalLight position={[0, -2, 2]} intensity={0.3} color="#818CF8" />
      </>
    );
  }

  // Default: Softbox Studio
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[2, 5, 2]} intensity={1.4} castShadow />
      <directionalLight position={[-2, 3, -3]} intensity={0.8} />
      <directionalLight position={[0, -2, 2]} intensity={0.3} />
      <hemisphereLight intensity={0.4} color="#ffffff" groundColor="#64748B" />
    </>
  );
}

// Camera Director to position camera smoothly for angles
function CameraRig({
  controlsRef,
  activeAngle
}: {
  controlsRef: React.MutableRefObject<any>;
  activeAngle: RenderAngle | null;
}) {
  const { camera } = useThree();

  useEffect(() => {
    if (!activeAngle || !controlsRef.current) return;

    const angleConfigs: Record<RenderAngle, { pos: [number, number, number]; target: [number, number, number] }> = {
      front: { pos: [0, 0.04, 2.05], target: [0, 0.04, 0] },
      back: { pos: [0, 0.04, -2.05], target: [0, 0.04, 0] },
      'three-quarter-left': { pos: [-1.45, 0.12, 1.45], target: [0, 0.04, 0] },
      'three-quarter-right': { pos: [1.45, 0.12, 1.45], target: [0, 0.04, 0] },
      'macro-detail': { pos: [0, 0.06, 0.98], target: [0, 0.06, 0] }
    };

    const targetConfig = angleConfigs[activeAngle];
    if (targetConfig) {
      camera.position.set(...targetConfig.pos);
      controlsRef.current.target.set(...targetConfig.target);
      controlsRef.current.update();
    }
  }, [activeAngle, camera, controlsRef]);

  return null;
}

export interface MockupCanvas3DRef {
  captureCurrentView: () => string;
  capturePresetAngle: (angle: RenderAngle) => Promise<string>;
  captureAllAngles: () => Promise<RenderSnapshot[]>;
}

interface MockupCanvas3DProps {
  config: MockupConfig;
  isAutoRotate: boolean;
  activeAngle: RenderAngle | null;
  onAngleChange?: (angle: RenderAngle) => void;
  onCanvasRefReady?: (api: MockupCanvas3DRef) => void;
}

export function MockupCanvas3D({
  config,
  isAutoRotate,
  activeAngle,
  onCanvasRefReady
}: MockupCanvas3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const controlsRef = useRef<any>(null);

  const captureCurrentView = useCallback((): string => {
    if (!canvasRef.current) return '';
    return canvasRef.current.toDataURL('image/png');
  }, []);

  const capturePresetAngle = useCallback(async (angle: RenderAngle): Promise<string> => {
    if (!canvasRef.current || !controlsRef.current) return '';
    const camera = controlsRef.current.object as THREE.PerspectiveCamera;
    if (!camera) return '';

    const angleConfigs: Record<RenderAngle, { pos: [number, number, number]; target: [number, number, number] }> = {
      front: { pos: [0, 0.04, 2.05], target: [0, 0.04, 0] },
      back: { pos: [0, 0.04, -2.05], target: [0, 0.04, 0] },
      'three-quarter-left': { pos: [-1.45, 0.12, 1.45], target: [0, 0.04, 0] },
      'three-quarter-right': { pos: [1.45, 0.12, 1.45], target: [0, 0.04, 0] },
      'macro-detail': { pos: [0, 0.06, 0.98], target: [0, 0.06, 0] }
    };

    const targetConfig = angleConfigs[angle];
    camera.position.set(...targetConfig.pos);
    controlsRef.current.target.set(...targetConfig.target);
    controlsRef.current.update();

    // Small delay to allow Three.js render cycle to present the new frame
    await new Promise((r) => setTimeout(r, 80));
    return canvasRef.current.toDataURL('image/png');
  }, []);

  const captureAllAngles = useCallback(async (): Promise<RenderSnapshot[]> => {
    const angles: { angle: RenderAngle; label: string }[] = [
      { angle: 'front', label: 'Vue de Face (Packshot)' },
      { angle: 'back', label: 'Vue de Dos' },
      { angle: 'three-quarter-left', label: 'Perspective 3/4 Gauche' },
      { angle: 'three-quarter-right', label: 'Perspective 3/4 Droit' },
      { angle: 'macro-detail', label: 'Gros Plan Macro Texture' }
    ];

    const results: RenderSnapshot[] = [];
    const prevPos = controlsRef.current?.object?.position?.clone();
    const prevTarget = controlsRef.current?.target?.clone();

    for (const item of angles) {
      const dataUrl = await capturePresetAngle(item.angle);
      results.push({
        id: `snap-${item.angle}-${Date.now()}`,
        angle: item.angle,
        label: item.label,
        dataUrl,
        camera: {
          position: [0, 0, 0],
          fov: 28
        },
        timestamp: new Date().toISOString()
      });
    }

    // Restore camera
    if (prevPos && prevTarget && controlsRef.current) {
      controlsRef.current.object.position.copy(prevPos);
      controlsRef.current.target.copy(prevTarget);
      controlsRef.current.update();
    }

    return results;
  }, [capturePresetAngle]);

  useEffect(() => {
    if (onCanvasRefReady) {
      onCanvasRefReady({
        captureCurrentView,
        capturePresetAngle,
        captureAllAngles
      });
    }
  }, [onCanvasRefReady, captureCurrentView, capturePresetAngle, captureAllAngles]);

  return (
    <div className="relative w-full h-full min-h-[480px] bg-gradient-to-b from-slate-100 via-slate-50 to-slate-200/90 select-none overflow-hidden rounded-2xl border border-slate-200/80 shadow-inner">
      <Canvas
        ref={canvasRef}
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0.04, 2.05], fov: 28 }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        className="w-full h-full block"
      >
        <StudioLighting preset={config.lighting} />
        <Suspense fallback={null}>
          <Center position={[0, 0.04, 0]}>
            <GarmentDecalMesh config={config} isAutoRotate={isAutoRotate} />
          </Center>
        </Suspense>
        <ContactShadows position={[0, -0.42, 0]} opacity={0.45} blur={2.2} scale={2} />
        <OrbitControls
          ref={controlsRef}
          enableZoom={true}
          zoomSpeed={1.0}
          enablePan={true}
          panSpeed={0.8}
          minDistance={0.8}
          maxDistance={3.8}
          minPolarAngle={Math.PI / 3.4}
          maxPolarAngle={Math.PI / 1.7}
        />
        <CameraRig controlsRef={controlsRef} activeAngle={activeAngle} />
      </Canvas>
    </div>
  );
}
