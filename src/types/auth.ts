export type UserRole = 'client' | 'admin' | 'livreur';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  company?: string;
  avatarUrl?: string;
  createdAt: string;
  /** Identifiant lisible du compte, ex. ADM-0001 */
  accountCode?: string;
  active?: boolean;
}

export interface CompanyCommitment {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface CompanyStat {
  id: string;
  label: string;
  value: string;
  helper: string;
}

export interface CompanyContact {
  email: string;
  phone: string;
  address: string;
  city: string;
  hours: string;
}

export interface CompanyAnnouncement {
  enabled: boolean;
  badge: string;
  text: string;
  actionLabel?: string;
}

export interface CompanyInfo {
  name: string;
  tagline: string;
  badge: string;
  description: string;
  aboutTitle: string;
  aboutParagraph1: string;
  aboutParagraph2: string;
  commitments: CompanyCommitment[];
  stats: CompanyStat[];
  contact: CompanyContact;
  announcement: CompanyAnnouncement;
  updatedAt: string;
}
