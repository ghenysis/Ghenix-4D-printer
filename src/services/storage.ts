import {
  GarmentArticle,
  CustomDesign,
  CartItem,
  Order,
  OrderStatus,
  PrintTechniqueId,
  GarmentColor,
  GarmentSize
} from '../types';
import { DEFAULT_CATALOG, PRINT_TECHNIQUES } from '../data/defaultCatalog';

const STORAGE_KEYS = {
  CATALOG: 'ghenix_catalog_v1',
  ORDERS: 'ghenix_orders_v1',
  SAVED_DESIGNS: 'ghenix_saved_designs_v1',
  CART: 'ghenix_cart_v1',
  ADMIN_AUTH: 'ghenix_admin_auth_v1'
};

// --- CATALOG STORAGE ---
export function getStoredCatalog(): GarmentArticle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATALOG);
    if (!raw) {
      saveCatalog(DEFAULT_CATALOG);
      return DEFAULT_CATALOG;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CATALOG;
  } catch {
    return DEFAULT_CATALOG;
  }
}

export function saveCatalog(catalog: GarmentArticle[]): void {
  localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(catalog));
}

export function resetCatalogToDefault(): GarmentArticle[] {
  saveCatalog(DEFAULT_CATALOG);
  return DEFAULT_CATALOG;
}

// --- ORDERS STORAGE ---
export const SAMPLE_ORDERS: Order[] = [
  {
    id: 'ord-sample-01',
    reference: 'GHX-2026-1042',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    status: 'in_preparation',
    customer: {
      fullName: 'Thomas Mercier',
      email: 'thomas.m@example.com',
      phone: '06 12 34 56 78',
      company: 'Studio Pulse',
      deliveryMethod: 'workshop_pickup',
      notes: 'Besoin pour l’événement de samedi matin si possible.'
    },
    items: [
      {
        id: 'item-01',
        article: DEFAULT_CATALOG[0],
        design: {
          id: 'des-01',
          name: 'T-Shirt Pulse Crew',
          articleId: DEFAULT_CATALOG[0].id,
          selectedColorId: 'noir',
          selectedSize: 'L',
          selectedTechnique: 'dtg',
          front: {
            printZone: DEFAULT_CATALOG[0].frontPrintZone,
            elements: [
              {
                id: 'el-01',
                type: 'text',
                x: 50,
                y: 35,
                width: 70,
                height: 25,
                rotation: 0,
                zIndex: 1,
                opacity: 1,
                text: 'PULSE CREW',
                fontFamily: 'Space Grotesk',
                fontSize: 38,
                color: '#F9FAFB',
                fontWeight: 'bold',
                fontStyle: 'normal',
                textAlign: 'center',
                letterSpacing: 2
              }
            ]
          },
          back: {
            printZone: DEFAULT_CATALOG[0].backPrintZone,
            elements: []
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        color: DEFAULT_CATALOG[0].colors[0],
        size: 'L',
        technique: PRINT_TECHNIQUES[0],
        quantity: 12,
        unitPrice: 21.4,
        totalPrice: 256.8,
        facesUsed: ['front']
      }
    ],
    subtotal: 256.8,
    shippingCost: 0,
    tax: 51.36,
    total: 308.16,
    history: [
      {
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        status: 'confirmed',
        note: 'Commande reçue et validée par le client.',
        author: 'Système Ghenix'
      },
      {
        timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
        status: 'in_preparation',
        note: 'Textiles sortis de stock. Fichiers DTG 300 DPI vérifiés.',
        author: 'Atelier Print'
      }
    ],
    internalNotes: 'Client habitué, vérifier le calage du blanc de soutien sur noir.',
    productionFilesReady: true
  }
];

export function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      saveOrders(SAMPLE_ORDERS);
      return SAMPLE_ORDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SAMPLE_ORDERS;
  } catch {
    return SAMPLE_ORDERS;
  }
}

export function saveOrders(orders: Order[]): void {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

export function addOrder(order: Order): void {
  const current = getStoredOrders();
  const updated = [order, ...current];
  saveOrders(updated);
}

export function updateOrderStatus(orderId: string, newStatus: OrderStatus, note: string, author = 'Administrateur'): Order | null {
  const current = getStoredOrders();
  const index = current.findIndex(o => o.id === orderId);
  if (index === -1) return null;

  const target = current[index];
  const updatedOrder: Order = {
    ...target,
    status: newStatus,
    updatedAt: new Date().toISOString(),
    history: [
      ...target.history,
      {
        timestamp: new Date().toISOString(),
        status: newStatus,
        note,
        author
      }
    ]
  };

  current[index] = updatedOrder;
  saveOrders(current);
  return updatedOrder;
}

// --- SAVED DESIGNS ---
export function getStoredDesigns(): CustomDesign[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_DESIGNS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDesign(design: CustomDesign): void {
  const designs = getStoredDesigns();
  const existingIndex = designs.findIndex(d => d.id === design.id);
  const now = new Date().toISOString();
  const designToSave = {
    ...design,
    updatedAt: now,
    createdAt: design.createdAt || now
  };

  if (existingIndex >= 0) {
    designs[existingIndex] = designToSave;
  } else {
    designs.unshift(designToSave);
  }

  localStorage.setItem(STORAGE_KEYS.SAVED_DESIGNS, JSON.stringify(designs));
}

export function deleteSavedDesign(id: string): void {
  const designs = getStoredDesigns().filter(d => d.id !== id);
  localStorage.setItem(STORAGE_KEYS.SAVED_DESIGNS, JSON.stringify(designs));
}

// --- CART STORAGE ---
export function getStoredCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CART);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(cart: CartItem[]): void {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
}

// --- PRICING ENGINE ---
export function calculateItemPrice(
  article: GarmentArticle,
  techniqueId: PrintTechniqueId,
  facesCount: number,
  quantity: number
): { unitPrice: number; totalPrice: number; discountPercent: number } {
  const technique = PRINT_TECHNIQUES.find(t => t.id === techniqueId) || PRINT_TECHNIQUES[0];
  let unit = article.basePrice;

  // Add technique unit cost
  unit += technique.pricePerUnit;

  // Additional face supplement (if back is also customized)
  if (facesCount > 1) {
    unit += 4.5; // Impression 2ème face
  }

  // Volume discount tiers
  let discountPercent = 0;
  if (quantity >= 50) {
    discountPercent = 25;
  } else if (quantity >= 25) {
    discountPercent = 18;
  } else if (quantity >= 10) {
    discountPercent = 10;
  } else if (quantity >= 5) {
    discountPercent = 5;
  }

  const discountedUnit = Math.round(unit * (1 - discountPercent / 100) * 100) / 100;
  const total = Math.round(discountedUnit * quantity * 100) / 100;

  return {
    unitPrice: discountedUnit,
    totalPrice: total,
    discountPercent
  };
}

// Generate unique order reference e.g. GHX-2026-4921
export function generateOrderReference(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `GHX-${year}-${rand}`;
}
