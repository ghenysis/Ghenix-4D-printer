export type PrintTechniqueId = 'dtg' | 'serigraphie' | 'broderie' | 'flocage';

export interface PrintTechnique {
  id: PrintTechniqueId;
  name: string;
  description: string;
  badge: string;
  minQuantity: number;
  setupCost: number; // e.g. frais techniques
  pricePerUnit: number;
  recommendedFor: string;
}

export interface GarmentColor {
  id: string;
  name: string;
  hex: string;
  textColor: string; // 'dark' | 'light' for contrast
}

export type GarmentSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL';

export interface VariantStock {
  colorId: string;
  size: GarmentSize;
  stock: number;
  available: boolean;
}

export interface PrintZone {
  widthCm: number;
  heightCm: number;
  xPercent: number; // center X (50%)
  yPercent: number; // center Y (45%)
  maxPrintWidthPx: number; // resolution target for print export (e.g. 2400)
  maxPrintHeightPx: number; // resolution target for print export (e.g. 3000)
}

export interface GarmentArticle {
  id: string;
  name: string;
  category: 'tshirt' | 'hoodie' | 'sweatshirt' | 'polo' | 'totebag';
  description: string;
  basePrice: number;
  weightGsm: number; // g/m² e.g. 180g
  material: string;
  active: boolean;
  colors: GarmentColor[];
  sizes: GarmentSize[];
  variants: VariantStock[];
  allowedTechniques: PrintTechniqueId[];
  frontPrintZone: PrintZone;
  backPrintZone: PrintZone;
  model3DType: 'tshirt' | 'hoodie' | 'sweatshirt' | 'polo' | 'totebag';
}

export type ElementType = 'text' | 'image' | 'clipart';

export interface BaseCustomElement {
  id: string;
  type: ElementType;
  x: number; // percentage (0 to 100) relative to print zone
  y: number; // percentage (0 to 100)
  width: number; // percentage (0 to 100)
  height: number; // percentage (0 to 100)
  rotation: number; // degrees (-180 to 180)
  zIndex: number;
  opacity: number; // 0 to 1
  locked?: boolean;
}

export interface TextCustomElement extends BaseCustomElement {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number; // px relative to 500px standard canvas
  color: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
  letterSpacing: number; // px
  isCurved?: boolean;
  curveRadius?: number; // radius for circular text
}

export interface ImageCustomElement extends BaseCustomElement {
  type: 'image' | 'clipart';
  url: string;
  originalName?: string;
  originalWidth: number;
  originalHeight: number;
  dpi?: number;
  aspectRatio: number;
}

export type CustomElement = TextCustomElement | ImageCustomElement;

export interface FaceDesign {
  elements: CustomElement[];
  printZone: PrintZone;
}

export interface CustomDesign {
  id: string;
  name: string;
  articleId: string;
  selectedColorId: string;
  selectedSize: GarmentSize;
  selectedTechnique: PrintTechniqueId;
  front: FaceDesign;
  back: FaceDesign;
  createdAt: string;
  updatedAt: string;
  previewThumbnail?: string;
}

export interface CartItem {
  id: string;
  article: GarmentArticle;
  design: CustomDesign;
  color: GarmentColor;
  size: GarmentSize;
  technique: PrintTechnique;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  facesUsed: ('front' | 'back')[];
  frontPreviewUrl?: string;
  backPreviewUrl?: string;
}

export type OrderStatus =
  | 'pending_confirmation'
  | 'confirmed'
  | 'in_preparation'
  | 'printing'
  | 'quality_check'
  | 'ready'
  | 'shipped'
  | 'completed'
  | 'cancelled';

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  deliveryMethod: 'workshop_pickup' | 'colissimo_standard' | 'express_carrier';
  address?: {
    street: string;
    zipCode: string;
    city: string;
    country: string;
  };
  notes?: string;
}

export interface OrderAuditEntry {
  timestamp: string;
  status: OrderStatus;
  note: string;
  author: string;
}

export interface Order {
  id: string;
  reference: string; // e.g. GHX-2026-8942
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  customer: CustomerDetails;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  history: OrderAuditEntry[];
  internalNotes?: string;
  productionFilesReady: boolean;
}
