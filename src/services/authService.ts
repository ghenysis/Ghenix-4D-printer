import { UserProfile, UserRole } from '../types/auth';

const STORAGE_KEY_AUTH = 'ghenix_auth_user_v2';

export const DEMO_USERS: Record<UserRole, UserProfile> = {
  client: {
    id: 'usr-client-demo',
    name: 'Alexandre Dumas',
    email: 'alexandre.dumas@example.com',
    role: 'client',
    phone: '06 12 34 56 78',
    company: 'Studio Pulse Textile',
    createdAt: new Date().toISOString()
  },
  admin: {
    id: 'usr-admin-demo',
    name: 'Marc Delorme (Chef d\'Atelier)',
    email: 'admin@ghenix-atelier.fr',
    role: 'admin',
    phone: '01 42 68 55 00',
    company: 'Ghenix Atelier SARL',
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

export function loginQuick(role: UserRole): UserProfile {
  const user = DEMO_USERS[role];
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
  const user: UserProfile = {
    id: `usr-${Date.now()}`,
    name: name.trim() || (role === 'admin' ? 'Administrateur' : 'Client Atelier'),
    email: email.trim() || 'utilisateur@example.com',
    role,
    company: company?.trim() || undefined,
    phone: phone?.trim() || undefined,
    createdAt: new Date().toISOString()
  };
  setCurrentUser(user);
  return user;
}

export function logout(): void {
  setCurrentUser(null);
}
