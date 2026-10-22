import { CartItem, Order } from '../types';
import { UserProfile, UserRole } from '../types/auth';
import { addOrder, getStoredCatalog, getStoredOrders, saveCatalog, saveOrders } from './storage';

const USERS_KEY = 'ghenix_users_v1';
const PRICING_KEY = 'ghenix_pricing_v1';

export type PrepStatus = 'received' | 'printing' | 'ready';
export type FulfillmentKind = 'delivery' | 'pickup';
export type DeliveryTaskStatus =
  | 'waiting'
  | 'assigned'
  | 'en_route'
  | 'delivered'
  | 'ready_pickup'
  | 'picked_up';

export interface ExtraFee {
  id: string;
  label: string;
  amount: number;
}

export interface PricingConfig {
  vatRate: number;
  deliveryStandard: number;
  deliveryExpress: number;
  extraFees: ExtraFee[];
  updatedAt: string;
}

export const DEFAULT_PRICING: PricingConfig = {
  vatRate: 0.2,
  deliveryStandard: 7.9,
  deliveryExpress: 14.5,
  extraFees: [],
  updatedAt: new Date().toISOString()
};

export function fulfillmentOf(order: Order): FulfillmentKind {
  return order.customer.deliveryMethod === 'workshop_pickup' ? 'pickup' : 'delivery';
}

export function prepOf(order: Order): PrepStatus {
  if (order.prepStatus) return order.prepStatus;
  if (order.status === 'printing') return 'printing';
  if (order.status === 'ready' || order.status === 'shipped' || order.status === 'completed') return 'ready';
  return 'received';
}

export function deliveryOf(order: Order): DeliveryTaskStatus {
  if (order.deliveryStatus) return order.deliveryStatus;
  if (fulfillmentOf(order) === 'pickup') {
    return prepOf(order) === 'ready' ? 'ready_pickup' : 'waiting';
  }
  if (order.driverId) return 'assigned';
  if (order.status === 'shipped' || order.status === 'completed') return 'delivered';
  return 'waiting';
}

export function getUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as UserProfile[]) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: UserProfile[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

const CODE_PREFIX: Record<UserRole, string> = {
  admin: 'ADM',
  client: 'CLI',
  livreur: 'LIV'
};

export function allocateAccountCode(role: UserRole, users = getUsers()): string {
  const prefix = CODE_PREFIX[role];
  const max = users.reduce((n, u) => {
    const m = u.accountCode?.match(new RegExp(`^${prefix}-(\\d+)$`));
    return m ? Math.max(n, Number(m[1])) : n;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(4, '0')}`;
}

export function upsertUser(user: UserProfile): UserProfile {
  const users = getUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase() || u.id === user.id);
  const withCode: UserProfile = {
    ...user,
    accountCode: user.accountCode || (idx >= 0 ? users[idx].accountCode : undefined) || allocateAccountCode(user.role, users),
    active: user.active !== undefined ? user.active : idx >= 0 ? users[idx].active !== false : true
  };
  if (idx >= 0) users[idx] = { ...users[idx], ...withCode };
  else users.unshift(withCode);
  saveUsers(users);
  return idx >= 0 ? users[idx] : withCode;
}

export function updateAccount(
  id: string,
  patch: Partial<Pick<UserProfile, 'name' | 'phone' | 'company' | 'role' | 'active'>>
): UserProfile | null {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx < 0) return null;
  const next = { ...users[idx], ...patch };
  if (patch.role && patch.role !== users[idx].role) {
    next.accountCode = allocateAccountCode(patch.role, users.filter((u) => u.id !== id));
  }
  users[idx] = next;
  saveUsers(users);
  return next;
}

export function findUserByEmail(email: string): UserProfile | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

export function listByRole(role: UserRole): UserProfile[] {
  return getUsers().filter((u) => u.role === role);
}

export function getPricing(): PricingConfig {
  try {
    const raw = localStorage.getItem(PRICING_KEY);
    if (!raw) return DEFAULT_PRICING;
    return { ...DEFAULT_PRICING, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PRICING;
  }
}

export function savePricing(next: PricingConfig): PricingConfig {
  const saved = { ...next, updatedAt: new Date().toISOString() };
  localStorage.setItem(PRICING_KEY, JSON.stringify(saved));
  return saved;
}

export function quoteTotals(
  items: CartItem[],
  deliveryMethod: Order['customer']['deliveryMethod']
) {
  const pricing = getPricing();
  const subtotal = Math.round(items.reduce((acc, item) => acc + item.totalPrice, 0) * 100) / 100;
  const shippingCost =
    deliveryMethod === 'workshop_pickup'
      ? 0
      : deliveryMethod === 'express_carrier'
      ? pricing.deliveryExpress
      : pricing.deliveryStandard;
  const extras = pricing.extraFees.reduce((s, f) => s + (Number(f.amount) || 0), 0);
  const tax = Math.round((subtotal + shippingCost + extras) * pricing.vatRate * 100) / 100;
  const total = Math.round((subtotal + shippingCost + extras + tax) * 100) / 100;
  return { subtotal, shippingCost, extras, tax, total, vatRate: pricing.vatRate };
}

export function ensureClientFromCheckout(customer: Order['customer']): UserProfile {
  const existing = findUserByEmail(customer.email);
  if (existing) {
    const merged: UserProfile = {
      ...existing,
      name: customer.fullName || existing.name,
      phone: customer.phone || existing.phone,
      company: customer.company || existing.company
    };
    upsertUser(merged);
    return merged;
  }
  const created: UserProfile = {
    id: `usr-${Date.now()}`,
    name: customer.fullName.trim(),
    email: customer.email.trim(),
    role: 'client',
    phone: customer.phone,
    company: customer.company,
    createdAt: new Date().toISOString()
  };
  upsertUser(created);
  return created;
}

export function placeLinkedOrder(order: Order, customer: Order['customer']): { order: Order; user: UserProfile } {
  const user = ensureClientFromCheckout(customer);
  const linked: Order = {
    ...order,
    userId: user.id,
    prepStatus: 'received',
    deliveryStatus: 'waiting'
  };
  addOrder(linked);
  return { order: linked, user };
}

export function ordersForUser(user: UserProfile | null): Order[] {
  if (!user) return [];
  return getStoredOrders().filter((o) => {
    if (o.userId && o.userId === user.id) return true;
    return o.customer.email.toLowerCase() === user.email.toLowerCase();
  });
}

export function ordersForDriver(user: UserProfile | null): Order[] {
  if (!user || user.role !== 'livreur') return [];
  return getStoredOrders().filter((o) => o.driverId === user.id && fulfillmentOf(o) === 'delivery');
}

function patchOrder(orderId: string, patch: Partial<Order>, note: string, author: string): Order | null {
  const orders = getStoredOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index < 0) return null;
  const prev = orders[index];
  const next: Order = {
    ...prev,
    ...patch,
    updatedAt: new Date().toISOString(),
    history: [
      ...prev.history,
      {
        timestamp: new Date().toISOString(),
        status: patch.status || prev.status,
        note,
        author
      }
    ]
  };
  orders[index] = next;
  saveOrders(orders);
  return next;
}

export function setPrepStatus(orderId: string, prep: PrepStatus, author = 'Atelier'): Order | null {
  const status =
    prep === 'printing' ? 'printing' : prep === 'ready' ? 'ready' : 'in_preparation';
  return patchOrder(orderId, { prepStatus: prep, status }, `Préparation : ${prep}`, author);
}

export function createDriver(input: { name: string; email: string; phone?: string }): UserProfile {
  const existing = findUserByEmail(input.email);
  const user: UserProfile = {
    id: existing?.id || `drv-${Date.now()}`,
    name: input.name.trim(),
    email: input.email.trim(),
    role: 'livreur',
    phone: input.phone?.trim(),
    company: 'Ghenix Livraison',
    createdAt: existing?.createdAt || new Date().toISOString()
  };
  return upsertUser(user);
}

export function assignDriver(orderId: string, driverId: string): Order | null {
  const driver = getUsers().find((u) => u.id === driverId && u.role === 'livreur');
  if (!driver) return null;
  return patchOrder(
    orderId,
    { driverId: driver.id, driverName: driver.name, deliveryStatus: 'assigned', status: 'confirmed' },
    `Livraison attribuée à ${driver.name}`,
    'Administrateur'
  );
}

export function setDeliveryTask(orderId: string, status: DeliveryTaskStatus, author: string): Order | null {
  const orderStatus =
    status === 'delivered' || status === 'picked_up'
      ? 'completed'
      : status === 'en_route'
      ? 'shipped'
      : status === 'ready_pickup'
      ? 'ready'
      : undefined;
  return patchOrder(
    orderId,
    { deliveryStatus: status, ...(orderStatus ? { status: orderStatus } : {}) },
    `Remise : ${status}`,
    author
  );
}

export function setArticleBasePrice(articleId: string, basePrice: number): void {
  const catalog = getStoredCatalog().map((a) => (a.id === articleId ? { ...a, basePrice } : a));
  saveCatalog(catalog);
}
