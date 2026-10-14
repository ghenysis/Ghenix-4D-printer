import React, { useRef, useState, useEffect } from 'react';
import {
  GarmentArticle,
  GarmentColor,
  FaceDesign,
  CustomElement,
  TextCustomElement,
  ImageCustomElement
} from '../../types';
import {
  RotateCw,
  Trash2,
  Copy,
  AlignCenter,
  AlignVerticalSpaceAround,
  AlertTriangle,
  Move,
  Layers,
  CheckCircle2,
  Maximize2
} from 'lucide-react';

interface CanvasEditor2DProps {
  article: GarmentArticle;
  color: GarmentColor;
  faceDesign: FaceDesign;
  faceName: 'front' | 'back';
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (updated: CustomElement) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onFaceChange: (face: 'front' | 'back') => void;
  className?: string;
}

export const CanvasEditor2D: React.FC<CanvasEditor2DProps> = ({
  article,
  color,
  faceDesign,
  faceName,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onFaceChange,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const printZoneRef = useRef<HTMLDivElement>(null);

  // Dragging and resizing interaction states
  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState<'nw' | 'ne' | 'se' | 'sw' | 'rotate' | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialElemState, setInitialElemState] = useState<CustomElement | null>(null);
  const [showRuler, setShowRuler] = useState(true);

  const selectedElement = faceDesign.elements.find(el => el.id === selectedElementId) || null;
  const printZone = faceDesign.printZone;

  // Check if any element exceeds the safe printable zone
  const outOfBoundsElements = faceDesign.elements.filter(el => {
    const left = el.x - el.width / 2;
    const right = el.x + el.width / 2;
    const top = el.y - el.height / 2;
    const bottom = el.y + el.height / 2;
    return left < 0 || right > 100 || top < 0 || bottom > 100;
  });

  const hasOutOfBounds = outOfBoundsElements.length > 0;

  // Handle Drag / Resize / Rotate
  const handlePointerDown = (e: React.PointerEvent, el: CustomElement, handleType?: 'nw' | 'ne' | 'se' | 'sw' | 'rotate') => {
    e.stopPropagation();
    onSelectElement(el.id);

    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialElemState({ ...el });

    if (handleType) {
      setActiveHandle(handleType);
    } else {
      setIsDragging(true);
    }
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!initialElemState || !printZoneRef.current) return;
      const rect = printZoneRef.current.getBoundingClientRect();
      const deltaXPercent = ((e.clientX - dragStart.x) / rect.width) * 100;
      const deltaYPercent = ((e.clientY - dragStart.y) / rect.height) * 100;

      if (isDragging) {
        // Move element
        const newX = Math.round((initialElemState.x + deltaXPercent) * 10) / 10;
        const newY = Math.round((initialElemState.y + deltaYPercent) * 10) / 10;
        onUpdateElement({
          ...initialElemState,
          x: newX,
          y: newY
        });
      } else if (activeHandle === 'rotate') {
        // Rotate element relative to its center in pixels
        const elemCenterPxX = rect.left + (initialElemState.x / 100) * rect.width;
        const elemCenterPxY = rect.top + (initialElemState.y / 100) * rect.height;
        const rad = Math.atan2(e.clientY - elemCenterPxY, e.clientX - elemCenterPxX);
        let deg = Math.round((rad * 180) / Math.PI) - 90; // offset so handle is top
        if (deg < -180) deg += 360;
        if (deg > 180) deg -= 360;

        onUpdateElement({
          ...initialElemState,
          rotation: deg
        });
      } else if (activeHandle) {
        // Scale element symmetrically or proportionally
        const scaleFactor = Math.abs(deltaXPercent) > Math.abs(deltaYPercent) ? deltaXPercent : deltaYPercent;
        const multiplier = activeHandle === 'se' || activeHandle === 'ne' ? 1 : -1;
        const newWidth = Math.max(10, Math.min(100, initialElemState.width + scaleFactor * 1.5 * multiplier));
        const aspect = initialElemState.width / initialElemState.height || 1;
        const newHeight = newWidth / aspect;

        onUpdateElement({
          ...initialElemState,
          width: Math.round(newWidth * 10) / 10,
          height: Math.round(newHeight * 10) / 10
        });
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setActiveHandle(null);
      setInitialElemState(null);
    };

    if (isDragging || activeHandle) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, activeHandle, dragStart, initialElemState, onUpdateElement]);

  // Center alignment helpers
  const centerHorizontal = () => {
    if (!selectedElement) return;
    onUpdateElement({ ...selectedElement, x: 50 });
  };

  const centerVertical = () => {
    if (!selectedElement) return;
    onUpdateElement({ ...selectedElement, y: 50 });
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[480px] bg-slate-100 rounded-2xl overflow-hidden select-none border border-slate-200/80 shadow-sm flex flex-col ${className}`}
      onClick={() => onSelectElement(null)}
    >
      {/* TOP CONTROLS BAR */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-md border-b border-slate-200 text-xs z-20">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => onFaceChange('front')}
            className={`px-3 py-1 font-medium rounded-md transition-all ${
              faceName === 'front'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Recto (Face)
          </button>
          <button
            onClick={() => onFaceChange('back')}
            className={`px-3 py-1 font-medium rounded-md transition-all ${
              faceName === 'back'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Verso (Dos)
          </button>
        </div>

        {/* Selected Element Quick Action Shortcuts (hidden during drag to avoid blocking view) */}
        {selectedElement && !isDragging && (
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 animate-fade-in">
            <button
              onClick={(e) => {
                e.stopPropagation();
                centerHorizontal();
              }}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors"
              title="Centrer horizontalement"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                centerVertical();
              }}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors"
              title="Centrer verticalement"
            >
              <AlignVerticalSpaceAround className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicateElement(selectedElement.id);
              }}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors"
              title="Dupliquer"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteElement(selectedElement.id);
              }}
              className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
              title="Supprimer l'élément"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 text-slate-500">
          <span>Dimensions : {printZone.widthCm} × {printZone.heightCm} cm</span>
        </div>
      </div>

      {/* OUT OF BOUNDS WARNING BANNER */}
      {hasOutOfBounds && (
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Attention : Un ou plusieurs éléments dépassent de la zone d'impression maximale ({printZone.widthCm} × {printZone.heightCm} cm).
          </span>
        </div>
      )}

      {/* MAIN 2D WORKSPACE CANVAS */}
      <div className="relative flex-1 flex items-center justify-center p-6 overflow-hidden">
        {/* Realistic SVG Garment Silhouette Container */}
        <div
          className="relative w-full max-w-[460px] aspect-[4/5] flex items-center justify-center rounded-2xl shadow-sm transition-colors duration-300 overflow-hidden"
          style={{ backgroundColor: color.hex }}
        >
          {/* Subtle Fabric Grain Overlay */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage:
                'radial-gradient(#000000 1px, transparent 1px), radial-gradient(#ffffff 1px, transparent 1px)',
              backgroundSize: '8px 8px',
              backgroundPosition: '0 0, 4px 4px'
            }}
          />

          {/* Garment Silhouette Stitching & Neckline Graphic */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none stroke-current opacity-25"
            style={{ color: color.textColor === 'dark' ? '#000000' : '#ffffff' }}
            viewBox="0 0 400 500"
            fill="none"
          >
            {/* Collar line */}
            <path d="M 150 20 Q 200 65 250 20" strokeWidth="4" strokeLinecap="round" />
            {faceName === 'front' && (
              <path d="M 160 30 Q 200 85 240 30" strokeWidth="2" strokeDasharray="4 4" />
            )}
            {/* Shoulder stitches */}
            <path d="M 60 70 L 150 20" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M 340 70 L 250 20" strokeWidth="2" strokeDasharray="4 4" />
            {/* Sleeves */}
            <path d="M 60 70 L 20 160 L 70 180 L 95 140" strokeWidth="2" strokeLinejoin="round" />
            <path d="M 340 70 L 380 160 L 330 180 L 305 140" strokeWidth="2" strokeLinejoin="round" />
            {/* Hem */}
            <line x1="95" y1="480" x2="305" y2="480" strokeWidth="3" strokeDasharray="6 4" />
          </svg>

          {/* PRINTABLE ZONE BOUNDARY BOX */}
          <div
            ref={printZoneRef}
            className="relative w-[68%] h-[68%] rounded-lg border-2 border-dashed border-amber-500/60 bg-white/5 backdrop-blur-[1px] shadow-inner transition-all group"
          >
            {/* Safe Zone Watermark & Labels */}
            <div className="absolute top-1 left-2 pointer-events-none text-[10px] font-mono tracking-wider text-amber-500/80">
              Zone Imprimable ({printZone.widthCm}×{printZone.heightCm} cm)
            </div>

            {/* Elements Rendered On Top */}
            {faceDesign.elements.map((el) => {
              const isSelected = el.id === selectedElementId;
              const isOutOfBounds =
                el.x - el.width / 2 < 0 ||
                el.x + el.width / 2 > 100 ||
                el.y - el.height / 2 < 0 ||
                el.y + el.height / 2 > 100;

              return (
                <div
                  key={el.id}
                  onPointerDown={(e) => handlePointerDown(e, el)}
                  className={`absolute cursor-move select-none transition-shadow ${
                    isSelected ? 'ring-2 ring-amber-500 ring-offset-1 z-30' : 'hover:ring-1 hover:ring-amber-400/50'
                  } ${isOutOfBounds ? 'outline-2 outline-dashed outline-rose-500' : ''}`}
                  style={{
                    left: `${el.x}%`,
                    top: `${el.y}%`,
                    width: `${el.width}%`,
                    height: `${el.height}%`,
                    transform: `translate(-50%, -50%) rotate(${el.rotation}deg)`,
                    opacity: el.opacity ?? 1,
                    zIndex: el.zIndex
                  }}
                >
                  {/* Element Content */}
                  {el.type === 'text' && (
                    <div
                      className="w-full h-full flex items-center justify-center whitespace-pre-wrap leading-tight"
                      style={{
                        fontFamily: el.fontFamily,
                        fontSize: `${(el.fontSize / 500) * 280}%`,
                        color: el.color,
                        fontWeight: el.fontWeight,
                        fontStyle: el.fontStyle,
                        textAlign: el.textAlign,
                        letterSpacing: `${el.letterSpacing}px`
                      }}
                    >
                      {el.text}
                    </div>
                  )}

                  {(el.type === 'image' || el.type === 'clipart') && (
                    <img
                      src={el.url}
                      alt="Custom graphic"
                      className="w-full h-full object-contain pointer-events-none"
                    />
                  )}

                  {/* SELECTION RESIZE & ROTATE HANDLES */}
                  {isSelected && (
                    <>
                      {/* Rotation Pin on Top */}
                      <div
                        onPointerDown={(e) => handlePointerDown(e, el, 'rotate')}
                        className="absolute -top-7 left-1/2 -translate-x-1/2 w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-md cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                        title="Faire pivoter l'élément"
                      >
                        <RotateCw className="w-3 h-3" />
                      </div>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[1px] h-3 bg-amber-500" />

                      {/* Four Corner Scale Handles */}
                      <div
                        onPointerDown={(e) => handlePointerDown(e, el, 'nw')}
                        className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-amber-500 rounded-sm cursor-nwse-resize shadow-xs"
                      />
                      <div
                        onPointerDown={(e) => handlePointerDown(e, el, 'ne')}
                        className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-amber-500 rounded-sm cursor-nesw-resize shadow-xs"
                      />
                      <div
                        onPointerDown={(e) => handlePointerDown(e, el, 'se')}
                        className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-amber-500 rounded-sm cursor-nwse-resize shadow-xs"
                      />
                      <div
                        onPointerDown={(e) => handlePointerDown(e, el, 'sw')}
                        className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-amber-500 rounded-sm cursor-nesw-resize shadow-xs"
                      />
                    </>
                  )}
                </div>
              );
            })}

            {/* Empty State in Print Zone */}
            {faceDesign.elements.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center pointer-events-none">
                <p className="text-xs font-medium text-slate-500/80">
                  Zone vierge pour {faceName === 'front' ? 'le recto' : 'le verso'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Ajoutez un texte ou un visuel depuis le menu latéral
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER HELPER */}
      <div className="px-4 py-2 bg-white/70 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Glisser pour déplacer · Poignée ronde supérieure pour pivoter</span>
        <span>{faceDesign.elements.length} élément(s) sur ce côté</span>
      </div>
    </div>
  );
};
