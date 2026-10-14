import { CompanyInfo } from '../types/auth';

const STORAGE_KEY_COMPANY = 'ghenix_company_info_v2';

export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: 'Ghenix Atelier',
  tagline: 'L\'Excellence du Marquage Textile & Studio 3D Temps Réel',
  badge: 'Atelier de Fabrication & Impression Directe France',
  description:
    'Conception numérique, rendu 3D haute fidélité et impression industrielle sur textiles éco-responsables de premier choix. De la pièce unique aux séries créateur pour marques, studios et entreprises.',
  aboutTitle: 'Notre Savoir-Faire & Confection Éthique',
  aboutParagraph1:
    'Implanté au cœur de la tradition textile française, Ghenix Atelier combine l\'artisanat du vêtement lourd et les technologies numériques 3D les plus avancées pour donner vie à vos créations sans compromis sur la qualité.',
  aboutParagraph2:
    'Chaque pièce (T-shirt heavyweight 240g, Hoodie brossé 400g, Sweatshirt col rond) est rigoureusement sélectionnée pour sa tenue et sa longévité. Nos ateliers sont équipés de parcs d\'impression numérique textile (DTG) dernière génération, de broderie multi-fils et de presses sérigraphiques haute précision.',
  commitments: [
    {
      id: 'com-1',
      title: 'Cotons Biologiques & Matières GOTS',
      description: 'Fibres naturelles certifiées respectueuses de la peau et de l\'environnement, traçabilité totale.',
      iconName: 'ShieldCheck'
    },
    {
      id: 'com-2',
      title: 'Impression 300 DPI & Rendu 3D Réel',
      description: 'Visualisation 360° ultra-fidèle et restitution millimétrique des couleurs et détails graphiques.',
      iconName: 'Sparkles'
    },
    {
      id: 'com-3',
      title: 'Contrôle Qualité Artisanal Français',
      description: 'Chaque vêtement subit une vérification manuelle approfondie avant conditionnement soigné.',
      iconName: 'CheckCircle2'
    },
    {
      id: 'com-4',
      title: 'Expédition Rapide & Suivi Transparent',
      description: 'Fabrication optimisée sous 48 à 72h avec notifications d\'avancement en temps réel.',
      iconName: 'Truck'
    }
  ],
  stats: [
    {
      id: 'stat-1',
      label: 'Pièces façonnées',
      value: '24 800+',
      helper: 'depuis l\'ouverture'
    },
    {
      id: 'stat-2',
      label: 'Satisfaction client',
      value: '99.8%',
      helper: 'avis certifiés'
    },
    {
      id: 'stat-3',
      label: 'Délai d\'expédition',
      value: '48h - 72h',
      helper: 'express disponible'
    },
    {
      id: 'stat-4',
      label: 'Encres écologiques',
      value: '100% Oeko-Tex',
      helper: 'sans solvants nocifs'
    }
  ],
  contact: {
    email: 'contact@ghenix-atelier.fr',
    phone: '+33 (0)1 42 68 55 00',
    address: '14 Rue des Créateurs Textiles',
    city: '75011 Paris, France',
    hours: 'Du Lundi au Vendredi, 8h30 - 18h30'
  },
  announcement: {
    enabled: true,
    badge: 'NOUVEAU',
    text: '🚀 Studio de Mockups 3D Automatisé & Remise de -15% dès 25 pièces personnalisées !',
    actionLabel: 'Découvrir le Moteur 3D'
  },
  updatedAt: new Date().toISOString()
};

type CompanyListener = (info: CompanyInfo) => void;
const companyListeners: Set<CompanyListener> = new Set();

export function subscribeToCompanyInfo(listener: CompanyListener): () => void {
  companyListeners.add(listener);
  return () => {
    companyListeners.delete(listener);
  };
}

function notifyCompanyListeners(info: CompanyInfo) {
  companyListeners.forEach((cb) => {
    try {
      cb(info);
    } catch (err) {
      console.error('Error in company listener:', err);
    }
  });
}

export function getCompanyInfo(): CompanyInfo {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMPANY);
    if (!raw) {
      saveCompanyInfo(DEFAULT_COMPANY_INFO);
      return DEFAULT_COMPANY_INFO;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_COMPANY_INFO, ...parsed };
  } catch {
    return DEFAULT_COMPANY_INFO;
  }
}

export function saveCompanyInfo(info: CompanyInfo): void {
  const updated = {
    ...info,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY_COMPANY, JSON.stringify(updated));
  notifyCompanyListeners(updated);
}

export function resetCompanyInfo(): CompanyInfo {
  saveCompanyInfo(DEFAULT_COMPANY_INFO);
  return DEFAULT_COMPANY_INFO;
}
