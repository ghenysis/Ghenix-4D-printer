export type GarmentType = 'tshirt-oversize' | 'tshirt-classic' | 'hoodie-street' | 'sweatshirt-crew';

export type PlacementPreset =
  | 'chest-center'
  | 'pocket-left'
  | 'large-front'
  | 'full-back'
  | 'back-center';

export type LightingPreset =
  | 'softbox'
  | 'warm-editorial'
  | 'clean-ecommerce'
  | 'cyber-night';

export type RenderAngle =
  | 'front'
  | 'back'
  | 'three-quarter-left'
  | 'three-quarter-right'
  | 'macro-detail';

export interface MockupConfig {
  garmentType: GarmentType;
  garmentName: string;
  colorHex: string;
  colorName: string;
  placement: PlacementPreset;
  scale: number; // 0.05 to 0.35
  offsetY: number; // -0.1 to 0.15
  offsetX: number; // -0.1 to 0.1
  rotationDeg: number;
  lighting: LightingPreset;
  uploadedImageUrl: string;
  imageName: string;
  targetSide: 'front' | 'back';
}

export interface RenderSnapshot {
  id: string;
  angle: RenderAngle;
  label: string;
  dataUrl: string;
  camera: {
    position: [number, number, number];
    fov: number;
    target?: [number, number, number];
  };
  timestamp: string;
}

export interface ApiRenderRequest {
  imageUrl: string;
  garmentType?: GarmentType;
  colorHex?: string;
  placement?: PlacementPreset;
  angles?: RenderAngle[];
  lighting?: LightingPreset;
  resolution?: 'standard' | 'hd' | '4k';
}

export interface ApiRenderResponse {
  success: boolean;
  jobId: string;
  timestamp: string;
  processingTimeMs: number;
  config: {
    garmentType: GarmentType;
    colorHex: string;
    placement: PlacementPreset;
    lighting: LightingPreset;
    imageUrl: string;
  };
  renders: {
    angle: RenderAngle;
    label: string;
    url: string;
  }[];
  interactiveViewer: {
    url: string;
    embedHtml: string;
    embedIframe: string;
  };
  meta: {
    format: string;
    dimensions: string;
    colorSpace: string;
  };
}
