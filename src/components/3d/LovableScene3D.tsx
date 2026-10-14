import React, { Suspense, useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import {
  Center,
  ContactShadows,
  Decal,
  OrbitControls,
  useGLTF
} from '@react-three/drei';
import * as THREE from 'three';
import { useConfigurator, type Side } from '../../store/useConfigurator';
import {
  Wind,
  RotateCcw,
  Compass,
  ZoomIn,
  ZoomOut,
  Move,
  Maximize2,
  Minimize2
} from 'lucide-react';

const Z = 0.15;

function PrintDecal({
  url,
  position,
  rotation,
  scale,
  offset
}: {
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number | [number, number, number];
  offset: number;
}) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!url) {
      setTexture(null);
      return;
    }
    let isMounted = true;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(
      url,
      (tex) => {
        if (!isMounted) {
          tex.dispose();
          return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 16;
        tex.needsUpdate = true;
        setTexture(tex);
      },
      undefined,
      (err) => {
        console.warn('Three.js texture load notice, attempting image fallback:', url, err);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (!isMounted) return;
          const fallbackTex = new THREE.Texture(img);
          fallbackTex.colorSpace = THREE.SRGBColorSpace;
          fallbackTex.anisotropy = 16;
          fallbackTex.needsUpdate = true;
          setTexture(fallbackTex);
        };
        img.onerror = () => {
          // If still failing, create an HTML5 canvas texture as graceful fallback
          if (!isMounted) return;
          setTexture(null);
        };
        img.src = url;
      }
    );

    return () => {
      isMounted = false;
    };
  }, [url]);

  if (!texture) return null;

  return (
    <Decal
      position={position}
      rotation={rotation}
      scale={scale}
      map={texture}
      polygonOffsetFactor={offset}
      depthTest={false}
    />
  );
}

const sideOf = (z: number): Side => (z >= 0 ? 'front' : 'back');
const rot = (s: Side, rotDeg = 0): [number, number, number] => {
  const rad = (rotDeg * Math.PI) / 180;
  return s === 'front' ? [0, 0, rad] : [0, Math.PI, -rad];
};
// On the back, the decal is mirrored in X when seen from behind.
const toLocalX = (s: Side, x: number) => (s === 'front' ? x : -x);

function TShirtMesh({ isWindActive, isAutoRotate }: { isWindActive: boolean; isAutoRotate: boolean }) {
  const { nodes, materials } = useGLTF('/shirt_baked.glb') as unknown as {
    nodes: Record<string, THREE.Mesh>;
    materials: Record<string, THREE.Material>;
  };
  const {
    color,
    logos,
    side,
    updateLogo,
    setDraggingLogo,
    setHoverLogo,
    setSelectedMotifSide,
    selectedMotifSide,
    hoverLogo,
    draggingLogo,
    interactionPriority
  } = useConfigurator();

  const group = useRef<THREE.Group>(null);

  // Type-safe drag state for moving OR directly resizing on the article
  type DragState =
    | { side: Side; type: 'move'; dx: number; dy: number }
    | { side: Side; type: 'resize'; initialDist: number; initialScale: number }
    | null;

  const drag = useRef<DragState>(null);

  // Visual selection box decal texture (rendered directly on the article around the active logo)
  const selectionBoxUrl = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Dotted selection outline
    ctx.strokeStyle = '#F59E0B'; // amber
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(16, 16, 224, 224);

    // 4 Corner resize handles
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    const corners = [
      [16, 16],
      [240, 16],
      [240, 240],
      [16, 240]
    ];
    for (const [cx, cy] of corners) {
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    return canvas.toDataURL('image/png');
  }, []);

  useFrame((state, dt) => {
    if (!group.current) return;

    if (isAutoRotate) {
      group.current.rotation.y += 0.012;
    } else {
      const target = side === 'front' ? 0 : Math.PI;
      group.current.rotation.y = THREE.MathUtils.damp(
        group.current.rotation.y,
        target,
        6,
        dt
      );
    }

    // Effet de vent (Simulation fluide du tissu)
    if (isWindActive) {
      const t = state.clock.getElapsedTime();
      group.current.rotation.z = Math.sin(t * 3.5) * 0.022;
      group.current.position.y = Math.sin(t * 2.8) * 0.01;
      group.current.position.x = Math.cos(t * 2.2) * 0.008;
    } else {
      group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, 0, 8, dt);
      group.current.position.y = THREE.MathUtils.damp(group.current.position.y, 0, 8, dt);
      group.current.position.x = THREE.MathUtils.damp(group.current.position.x, 0, 8, dt);
    }
  });

  const local = (e: ThreeEvent<PointerEvent | WheelEvent>) =>
    e.object.worldToLocal(e.point.clone());

  // Hit-test distinguishes inner area (MOVE) from outer edge/corners (RESIZE)
  const getLogoHit = (p: THREE.Vector3) => {
    if (isAutoRotate) return null; // Disabled during 360° auto-rotate
    const s = sideOf(p.z);
    const l = logos[s];
    if (!l) return null;
    const lx = toLocalX(s, l.x);
    const dx = p.x - lx;
    const dy = p.y - l.y;
    const dist = Math.hypot(dx, dy);
    const maxRadius = l.scale * 0.78;
    if (dist > maxRadius) return null;

    // If near the outer perimeter, user is grabbing the resize handle directly on the shirt!
    const isResize = dist > l.scale * 0.35;
    return { side: s, isResize, dist, logo: l };
  };

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    if (isAutoRotate) return; // Strict disable during 360° auto-rotate
    const p = local(e);
    const hit = getLogoHit(p);
    if (!hit) {
      // Clicked on the t-shirt outside the motif (void): dismiss palette
      setSelectedMotifSide(null);
      return;
    }

    e.stopPropagation();
    setSelectedMotifSide(hit.side);
    setDraggingLogo(true);
    (e.target as Element)?.setPointerCapture?.(e.pointerId);

    if (hit.isResize) {
      // RESIZE directly on the article
      drag.current = {
        side: hit.side,
        type: 'resize',
        initialDist: Math.max(0.015, hit.dist),
        initialScale: hit.logo.scale
      };
    } else {
      // MOVE directly on the article
      drag.current = {
        side: hit.side,
        type: 'move',
        dx: p.x - toLocalX(hit.side, hit.logo.x),
        dy: p.y - hit.logo.y
      };
    }
  };

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    if (isAutoRotate) {
      if (drag.current) {
        drag.current = null;
        setDraggingLogo(false);
      }
      return;
    }

    const p = local(e);

    if (drag.current) {
      e.stopPropagation();
      const d = drag.current;

      if (d.type === 'move') {
        // Move logo on article
        updateLogo(d.side, { x: toLocalX(d.side, p.x - d.dx), y: p.y - d.dy });
      } else if (d.type === 'resize') {
        // Resize directly on article
        const l = logos[d.side];
        if (l) {
          const lx = toLocalX(d.side, l.x);
          const currentDist = Math.hypot(p.x - lx, p.y - l.y);
          const ratio = currentDist / d.initialDist;
          const newScale = Math.max(0.04, Math.min(0.35, d.initialScale * ratio));
          updateLogo(d.side, { scale: Math.round(newScale * 1000) / 1000 });
        }
      }
      return;
    }

    const hit = getLogoHit(p);
    if (hit) {
      if (!hoverLogo) setHoverLogo(true);
      document.body.style.cursor = hit.isResize ? 'nwse-resize' : 'grab';
    } else {
      if (hoverLogo) setHoverLogo(false);
      document.body.style.cursor = '';
    }
  };

  const onUp = () => {
    if (drag.current) {
      drag.current = null;
      setDraggingLogo(false);
    }
  };

  const onWheel = (e: ThreeEvent<WheelEvent>) => {
    // If interaction priority is motif and cursor is specifically over the motif, allow wheel resize
    if (interactionPriority === 'motif' && !isAutoRotate) {
      const hit = getLogoHit(local(e));
      if (hit) {
        e.stopPropagation();
        const l = hit.logo;
        updateLogo(hit.side, {
          scale: Math.max(0.04, Math.min(0.35, l.scale * (e.nativeEvent.deltaY < 0 ? 1.08 : 0.92)))
        });
        return;
      }
    }
    // In all other cases, wheel zooms the 3D scene smoothly!
  };

  const targetGeometry = nodes?.T_Shirt_male?.geometry;
  const targetMaterial = materials?.lambert1;

  if (!targetGeometry || !targetMaterial) {
    return null;
  }

  return (
    <group ref={group} scale={[1.0, 1.0, 1.0]}>
      <mesh
        geometry={targetGeometry}
        material={targetMaterial}
        material-color={color}
        material-roughness={1}
        castShadow
        receiveShadow
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={() => {
          if (!drag.current) {
            setHoverLogo(false);
            document.body.style.cursor = '';
          }
        }}
        onWheel={onWheel}
      >
        {/* Interactive logo decals */}
        {(['front', 'back'] as Side[]).map((s) => {
          const l = logos[s];
          return l ? (
            <React.Fragment key={s + l.url}>
              {/* Logo Decal */}
              <PrintDecal
                url={l.url}
                position={[toLocalX(s, l.x), l.y, s === 'front' ? Z : -Z]}
                rotation={rot(s, l.rotation || 0)}
                scale={l.scale}
                offset={-2}
              />

              {/* Direct on-article selection & resize handles frame (hidden during 360 auto-rotate or when deselected/dragging) */}
              {!isAutoRotate && side === s && selectionBoxUrl && selectedMotifSide === s && !draggingLogo && (
                <PrintDecal
                  url={selectionBoxUrl}
                  position={[toLocalX(s, l.x), l.y, s === 'front' ? Z : -Z]}
                  rotation={rot(s, l.rotation || 0)}
                  scale={l.scale * 1.14}
                  offset={-3}
                />
              )}
            </React.Fragment>
          ) : null;
        })}
      </mesh>
    </group>
  );
}

interface LovableScene3DProps {
  className?: string;
  onCaptureRef?: (fn: () => string) => void;
  isWindActive: boolean;
  onToggleWind: () => void;
  isAutoRotate: boolean;
  onToggleAutoRotate: () => void;
  isZenMode?: boolean;
  onToggleZenMode?: () => void;
  onDeselectElement?: () => void;
}

export function LovableScene3D({
  className = '',
  onCaptureRef,
  isWindActive,
  onToggleWind,
  isAutoRotate,
  onToggleAutoRotate,
  isZenMode: externalZenMode,
  onToggleZenMode,
  onDeselectElement
}: LovableScene3DProps) {
  const [internalZenMode, setInternalZenMode] = useState(false);
  const zenMode = externalZenMode ?? internalZenMode;
  const toggleZen = onToggleZenMode ?? (() => setInternalZenMode(!internalZenMode));

  const {
    draggingLogo,
    side,
    setSide,
    setSelectedMotifSide
  } = useConfigurator();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (onCaptureRef) {
      onCaptureRef(() => {
        if (!canvasRef.current) return '';
        return canvasRef.current.toDataURL('image/png');
      });
    }
  }, [onCaptureRef]);

  // Reset view to default camera angle and front side
  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
    setSide('front');
  };

  // CAMERA ORBIT CONTROLS:
  // Active whenever not dragging the motif decal
  const isOrbitControlsActive = !draggingLogo;

  return (
    <div
      className={`relative w-full h-full min-h-[560px] bg-gradient-to-b from-slate-100 via-slate-50 to-slate-200/80 overflow-hidden select-none ${className}`}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) {
          setSelectedMotifSide(null);
          onDeselectElement?.();
        }
      }}
    >
      <Canvas
        ref={canvasRef}
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0.04, 2.05], fov: 28 }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        className="w-full h-full block"
        onPointerMissed={() => {
          // Clicked on empty space / void outside the garment!
          setSelectedMotifSide(null);
          onDeselectElement?.();
        }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 5, 2]} intensity={1.4} castShadow />
        <directionalLight position={[-2, 3, -3]} intensity={0.8} />
        <directionalLight position={[0, -2, 2]} intensity={0.3} />
        <hemisphereLight intensity={0.4} color="#ffffff" groundColor="#475569" />
        <Suspense fallback={null}>
          <Center position={[0, 0.04, 0]}>
            <TShirtMesh isWindActive={isWindActive} isAutoRotate={isAutoRotate} />
          </Center>
        </Suspense>
        <ContactShadows position={[0, -0.42, 0]} opacity={0.4} blur={2.2} scale={2} />
        <OrbitControls
          ref={controlsRef}
          enabled={isOrbitControlsActive}
          enableZoom={!draggingLogo}
          zoomSpeed={1.0}
          enablePan={!draggingLogo}
          panSpeed={0.8}
          minDistance={1.1}
          maxDistance={3.6}
          minPolarAngle={Math.PI / 3.4}
          maxPolarAngle={Math.PI / 1.72}
        />
      </Canvas>

      {/* COMPACT SINGLE-LINE VISUALIZATION TOOLBAR */}
      <div className="absolute top-4 inset-x-2 sm:inset-x-4 z-20 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 p-1 bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/90 max-w-[calc(100vw-20px)] overflow-x-auto no-scrollbar text-xs">
          {/* Face switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl shrink-0">
            <button
              onClick={() => setSide('front')}
              disabled={isAutoRotate}
              className={`px-2.5 sm:px-3 py-1 text-xs font-bold rounded-lg transition-all disabled:opacity-40 ${
                side === 'front'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Devant
            </button>
            <button
              onClick={() => setSide('back')}
              disabled={isAutoRotate}
              className={`px-2.5 sm:px-3 py-1 text-xs font-bold rounded-lg transition-all disabled:opacity-40 ${
                side === 'back'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dos
            </button>
          </div>

          <div className="w-[1px] h-5 bg-slate-200 shrink-0" />

          {/* 360 Auto-Rotate */}
          <button
            onClick={onToggleAutoRotate}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-bold rounded-xl transition-all shadow-2xs whitespace-nowrap shrink-0 ${
              isAutoRotate
                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400/50'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title={isAutoRotate ? 'Arrêter la rotation 360°' : 'Lancer la rotation 360°'}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isAutoRotate ? 'animate-spin' : ''}`} />
            <span>360°</span>
          </button>

          {/* Wind Effect */}
          <button
            onClick={onToggleWind}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-xl transition-all shadow-2xs whitespace-nowrap shrink-0 ${
              isWindActive
                ? 'bg-slate-900 text-amber-400'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Activer la simulation textile de vent"
          >
            <Wind className={`w-3.5 h-3.5 ${isWindActive ? 'animate-pulse text-amber-400' : 'text-slate-500'}`} />
            <span>Vent</span>
          </button>

          {/* Reset Camera View */}
          <button
            onClick={handleResetView}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all whitespace-nowrap shrink-0"
            title="Réinitialiser la caméra et la vue"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Recentrer</span>
          </button>

          <div className="w-[1px] h-5 bg-slate-200 shrink-0" />

          {/* Zen / Full Preview Mode */}
          <button
            onClick={toggleZen}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-medium rounded-xl transition-all whitespace-nowrap shrink-0 ${
              zenMode
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
            }`}
            title={zenMode ? 'Quitter le mode aperçu' : 'Aperçu plein écran sans outils'}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{zenMode ? 'Normal' : 'Aperçu'}</span>
          </button>
        </div>
      </div>

      {/* BOTTOM-RIGHT QUICK NAVIGATION TOOLBAR (ZOOM / PAN HELPER) */}
      <div className="absolute bottom-28 sm:bottom-24 md:bottom-20 right-3 sm:right-5 z-20 flex flex-col items-end gap-1.5 pointer-events-none">
        <div className="pointer-events-auto flex items-center bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/80 p-0.5 sm:p-1 gap-0.5">
          <button
            onClick={() => {
              const canvas = canvasRef.current;
              if (canvas) {
                // Dispatch wheel event to zoom in
                canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: -120, bubbles: true }));
              }
            }}
            className="p-1.5 sm:p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-all"
            title="Zoom avant"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-slate-200" />
          <button
            onClick={() => {
              const canvas = canvasRef.current;
              if (canvas) {
                // Dispatch wheel event to zoom out
                canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: 120, bubbles: true }));
              }
            }}
            className="p-1.5 sm:p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-all"
            title="Zoom arrière"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
        <div className="hidden sm:block px-2.5 py-1 bg-slate-900/60 backdrop-blur-md text-white/90 text-[10px] font-medium rounded-full shadow-xs">
          Molette : zoomer • Clic droit : déplacer • Clic gauche : pivoter
        </div>
      </div>
    </div>
  );
}

useGLTF.preload('/shirt_baked.glb');
