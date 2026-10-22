import { UserProfile, UserRole } from '../types/auth';
import { ensureDemoAccounts, findUserByCode, findUserByEmail, upsertUser } from './accountOps';

const STORAGE_KEY_AUTH = 'ghenix_auth_user_v2';

export const DEMO_USERS: Record<UserRole, UserProfile> = {
  client: {
    id: 'usr-client-demo',
    name: 'Alexandre Dumas',
    email: 'alexandre.dumas@example.com',
    role: 'client',
    phone: '06 12 34 56 78',
    company: 'Studio Pulse Textile',
    accountCode: 'CLI-0001',
    active: true,
    createdAt: new Date().toISOString()
  },
  admin: {
    id: 'usr-admin-demo',
    name: 'Marc Delorme (Chef d\'Atelier)',
    email: 'admin@ghenix-atelier.fr',
    role: 'admin',
    phone: '01 42 68 55 00',
    company: 'Ghenix Atelier SARL',
    accountCode: 'ADM-0001',
    active: true,
    createdAt: new Date().toISOString()
  },
  livreur: {
    id: 'usr-driver-demo',
    name: 'Léa Martin',
    email: 'livreur@ghenix-atelier.fr',
    role: 'livreur',
    phone: '06 98 76 54 32',
    company: 'Ghenix Livraison',
    accountCode: 'LIV-0001',
    active: true,
    createdAt: new Date().toISOString()
  }
};

type AuthListener = (user: UserProfile | null) => void;
const listeners: Set<AuthListener> = new Set();

export function subscribeToAuth(listener: AuthListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(user: UserProfile | null) {
  listeners.forEach((cb) => {
    try {
      cb(user);
    } catch (err) {
      console.error('Error in auth listener:', err);
    }
  });
}

export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: UserProfile | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY_AUTH);
  }
  notifyListeners(user);
}

export const ADMIN_ACCOUNT_CODE = 'ADM-0001';
export const ADMIN_PIN = 'atelier2026';

export function seedAccounts(): void {
  ensureDemoAccounts(Object.values(DEMO_USERS));
}

export function loginWithIdentifier(identifier: string, pin?: string): UserProfile {
  seedAccounts();
  const key = identifier.trim();
  const byCode = findUserByCode(key);
  const byEmail = findUserByEmail(key);
  const known = byCode || byEmail;
  if (!known) {
    throw new Error('Identifiant inconnu.');
  }
  if (known.active === false) {
    throw new Error('Ce compte est désactivé.');
  }
  if (known.role === 'admin' && pin?.trim() !== ADMIN_PIN && pin?.trim() !== 'admin') {
    throw new Error('Code administrateur incorrect.');
  }
  setCurrentUser(known);
  return known;
}

export function loginQuick(role: UserRole): UserProfile {
  const user = upsertUser(DEMO_USERS[role]);
  setCurrentUser(user);
  return user;
}

export function loginWithCredentials(
  name: string,
  email: string,
  role: UserRole,
  company?: string,
  phone?: string
): UserProfile {
  const known = findUserByEmail(email);
  if (known && role !== 'admin') {
    setCurrentUser(known);
    return known;
  }
  const user: UserProfile = {
    id: `usr-${Date.now()}`,
    name: name.trim() || (role === 'admin' ? 'Administrateur' : role === 'livreur' ? 'Livreur' : 'Client Atelier'),
    email: email.trim() || 'utilisateur@example.com',
    role,
    company: company?.trim() || undefined,
    phone: phone?.trim() || undefined,
    createdAt: new Date().toISOString()
  };
  upsertUser(user);
  setCurrentUser(user);
  return user;
}

export function logout(): void {
  setCurrentUser(null);
}
