import { create } from 'zustand';

export type Side = 'front' | 'back';

export interface Logo {
  url: string;
  x: number;
  y: number;
  scale: number;
  rotation?: number; // degrees
}

export interface ConfiguratorState {
  color: string;
  side: Side;
  textures: {
    front?: string;
    back?: string;
  };
  logos: {
    front?: Logo | null;
    back?: Logo | null;
  };
  draggingLogo: boolean;
  hoverLogo: boolean;
  selectedMotifSide: Side | null;
  interactionPriority: 'motif' | 'camera';
  isWindActive: boolean;
  isAutoRotate: boolean;

  // Actions
  setColor: (color: string) => void;
  setSide: (side: Side) => void;
  setTextures: (textures: Partial<{ front: string; back: string }>) => void;
  setLogo: (side: Side, logo: Logo | null) => void;
  updateLogo: (side: Side, partial: Partial<Logo>) => void;
  setDraggingLogo: (dragging: boolean) => void;
  setHoverLogo: (hover: boolean) => void;
  setSelectedMotifSide: (side: Side | null) => void;
  setInteractionPriority: (priority: 'motif' | 'camera') => void;
  deleteMotif: (side: Side) => void;
  scaleMotif: (side: Side, delta: number) => void;
  rotateMotif: (side: Side, deg: number) => void;
  centerMotif: (side: Side) => void;
  setWindActive: (active: boolean) => void;
  setAutoRotate: (auto: boolean) => void;
}

export const useConfigurator = create<ConfiguratorState>((set) => ({
  color: '#111827',
  side: 'front',
  textures: {
    front: undefined,
    back: undefined
  },
  logos: {
    front: null,
    back: null
  },
  draggingLogo: false,
  hoverLogo: false,
  selectedMotifSide: null,
  interactionPriority: 'motif',
  isWindActive: false,
  isAutoRotate: false,

  setColor: (color) => set({ color }),
  setSide: (side) => set({ side, selectedMotifSide: null }),
  setTextures: (tex) =>
    set((state) => ({ textures: { ...state.textures, ...tex } })),
  setLogo: (side, logo) =>
    set((state) => ({
      logos: { ...state.logos, [side]: logo },
      selectedMotifSide: logo ? side : null
    })),
  updateLogo: (side, partial) =>
    set((state) => {
      const current = state.logos[side];
      if (!current) return state;
      return {
        logos: {
          ...state.logos,
          [side]: { ...current, ...partial }
        }
      };
    }),
  setDraggingLogo: (draggingLogo) => set({ draggingLogo }),
  setHoverLogo: (hoverLogo) => set({ hoverLogo }),
  setSelectedMotifSide: (selectedMotifSide) => set({ selectedMotifSide }),
  setInteractionPriority: (interactionPriority) => set({ interactionPriority }),

  deleteMotif: (side) =>
    set((state) => ({
      logos: { ...state.logos, [side]: null },
      textures: { ...state.textures, [side]: undefined },
      selectedMotifSide: null,
      hoverLogo: false,
      draggingLogo: false
    })),

  scaleMotif: (side, delta) =>
    set((state) => {
      const current = state.logos[side];
      if (!current) return state;
      const newScale = Math.max(0.04, Math.min(0.35, current.scale + delta));
      return {
        logos: {
          ...state.logos,
          [side]: { ...current, scale: Math.round(newScale * 1000) / 1000 }
        }
      };
    }),

  rotateMotif: (side, deg) =>
    set((state) => {
      const current = state.logos[side];
      if (!current) return state;
      const newRot = ((current.rotation || 0) + deg) % 360;
      return {
        logos: {
          ...state.logos,
          [side]: { ...current, rotation: newRot }
        }
      };
    }),

  centerMotif: (side) =>
    set((state) => {
      const current = state.logos[side];
      if (!current) return state;
      return {
        logos: {
          ...state.logos,
          [side]: { ...current, x: 0, y: side === 'front' ? 0.04 : 0.06 }
        }
      };
    }),

  setWindActive: (isWindActive) => set({ isWindActive }),
  setAutoRotate: (isAutoRotate) => set({ isAutoRotate })
}));

// DRAWING CANVAS ENGINE
class DrawingEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1200;
    this.canvas.height = 1200;
    this.ctx = this.canvas.getContext('2d')!;
  }

  getCanvas() {
    return this.canvas;
  }

  addText(text: string, fontFamily = 'Space Grotesk', color = '#ffffff') {
    const side = useConfigurator.getState().side;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Subtle drop glow
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    this.ctx.shadowBlur = 8;
    this.ctx.shadowOffsetY = 4;

    this.ctx.font = `bold 82px "${fontFamily}", sans-serif`;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);

    const dataUrl = this.canvas.toDataURL('image/png');
    useConfigurator.getState().setLogo(side, {
      url: dataUrl,
      x: 0,
      y: side === 'front' ? 0.04 : 0.06,
      scale: 0.16,
      rotation: 0
    });
  }

  async addImage(file: File) {
    const side = useConfigurator.getState().side;
    const url = URL.createObjectURL(file);
    useConfigurator.getState().setLogo(side, {
      url,
      x: 0,
      y: side === 'front' ? 0.04 : 0.06,
      scale: 0.18,
      rotation: 0
    });
  }

  applyGenerated(url: string, target: Side) {
    useConfigurator.getState().setLogo(target, {
      url,
      x: 0,
      y: target === 'front' ? 0.04 : 0.06,
      scale: 0.18,
      rotation: 0
    });
  }

  clear() {
    const side = useConfigurator.getState().side;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    useConfigurator.getState().deleteMotif(side);
  }

  download() {
    const { textures, side } = useConfigurator.getState();
    const current = textures[side];
    if (!current) return;
    const a = document.createElement('a');
    a.href = current;
    a.download = `ghenix_design_${side}_hd.png`;
    a.click();
  }
}

export const drawing = new DrawingEngine();
