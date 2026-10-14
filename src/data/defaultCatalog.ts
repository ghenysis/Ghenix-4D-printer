import { GarmentArticle, PrintTechnique, GarmentColor, GarmentSize } from '../types';

export const PRINT_TECHNIQUES: PrintTechnique[] = [
  {
    id: 'dtg',
    name: 'Impression Numérique (DTG)',
    badge: 'Idéal Dégradés & Photos',
    description: 'Jet d’encre textile haute résolution (1200 DPI). Toucher doux, couleurs infinies, sans minimum de commande.',
    minQuantity: 1,
    setupCost: 0,
    pricePerUnit: 4.5,
    recommendedFor: 'Visuels complexes, dégradés, photos, petites séries dès 1 pièce.'
  },
  {
    id: 'serigraphie',
    name: 'Sérigraphie Artisanale',
    badge: 'Grandes Séries & Haute Durabilité',
    description: 'Encrage direct maille par maille. Opacité maximale, éclat exceptionnel et tenue extrême au lavage (+100 lavages).',
    minQuantity: 15,
    setupCost: 25,
    pricePerUnit: 2.2,
    recommendedFor: 'Commandes d’équipe, entreprises, associations, clubs dès 15 pièces.'
  },
  {
    id: 'broderie',
    name: 'Broderie Haute Définition',
    badge: 'Prestige & Relief Textile',
    description: 'Fils de qualité supérieure certifiés Oeko-Tex. Rendu premium en relief 3D, inaltérable dans le temps.',
    minQuantity: 5,
    setupCost: 35,
    pricePerUnit: 6.8,
    recommendedFor: 'Logos cœur, casquettes, sweats d’entreprise, merchandising premium.'
  },
  {
    id: 'flocage',
    name: 'Flocage / Flex Thermocollé',
    badge: 'Couleurs Pures & Numéros Sport',
    description: 'Film polyuréthane ultra-fin découpé au plotter. Rendu net, parfait pour lettrages, numéros et logos monochromes.',
    minQuantity: 1,
    setupCost: 0,
    pricePerUnit: 3.5,
    recommendedFor: 'Maillots de sport, lettrages dos, logos simples 1 à 2 couleurs.'
  }
];

export const STANDARD_COLORS: GarmentColor[] = [
  { id: 'noir', name: 'Noir Intense', hex: '#111827', textColor: 'light' },
  { id: 'blanc', name: 'Blanc Pur', hex: '#F9FAFB', textColor: 'dark' },
  { id: 'gris-chine', name: 'Gris Chiné', hex: '#9CA3AF', textColor: 'dark' },
  { id: 'bleu-marine', name: 'Bleu Marine Français', hex: '#1E293B', textColor: 'light' },
  { id: 'bleu-royal', name: 'Bleu Royal', hex: '#2563EB', textColor: 'light' },
  { id: 'vert-foret', name: 'Vert Forêt', hex: '#166534', textColor: 'light' },
  { id: 'bordeaux', name: 'Bordeaux Vintage', hex: '#881337', textColor: 'light' },
  { id: 'sable', name: 'Sable / Dune', hex: '#D6C7B2', textColor: 'dark' },
  { id: 'terracotta', name: 'Terracotta', hex: '#C25E42', textColor: 'light' }
];

const STANDARD_SIZES: GarmentSize[] = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

function generateVariants(colorIds: string[], sizes: GarmentSize[], baseStock = 45) {
  return colorIds.flatMap((colorId) =>
    sizes.map((size) => ({
      colorId,
      size,
      stock: baseStock,
      available: true
    }))
  );
}

export const DEFAULT_CATALOG: GarmentArticle[] = [
  {
    id: 'tshirt-bio-180g',
    name: 'T-Shirt Unisexe Premium Coton Bio 180g',
    category: 'tshirt',
    description: '100% Coton biologique peigné ring-spun 180 g/m². Coupe moderne tubulaire, col rond côtelé avec bande de propreté. Le standard d’excellence pour le prêt-à-porter et le merchandising.',
    basePrice: 16.9,
    weightGsm: 180,
    material: '100% Coton Bio Certifié GOTS & FairWear',
    active: true,
    colors: STANDARD_COLORS,
    sizes: STANDARD_SIZES,
    variants: generateVariants(STANDARD_COLORS.map(c => c.id), STANDARD_SIZES, 80),
    allowedTechniques: ['dtg', 'serigraphie', 'broderie', 'flocage'],
    frontPrintZone: {
      widthCm: 30,
      heightCm: 40,
      xPercent: 50,
      yPercent: 48,
      maxPrintWidthPx: 2400,
      maxPrintHeightPx: 3200
    },
    backPrintZone: {
      widthCm: 32,
      heightCm: 42,
      xPercent: 50,
      yPercent: 46,
      maxPrintWidthPx: 2560,
      maxPrintHeightPx: 3360
    },
    model3DType: 'tshirt'
  },
  {
    id: 'hoodie-heavy-350g',
    name: 'Sweat à Capuche Oversize Heavy 350g',
    category: 'hoodie',
    description: 'Molleton gratté 85% coton bio / 15% polyester recyclé 350 g/m². Capuche doublée avec cordons ronds épais et embouts métalliques. Poche kangourou et finitions bord-côte.',
    basePrice: 38.5,
    weightGsm: 350,
    material: '85% Coton Bio peigné, 15% Polyester Recyclé',
    active: true,
    colors: [
      STANDARD_COLORS[0], // Noir
      STANDARD_COLORS[1], // Blanc
      STANDARD_COLORS[2], // Gris
      STANDARD_COLORS[3], // Marine
      STANDARD_COLORS[5], // Vert
      STANDARD_COLORS[7]  // Sable
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    variants: generateVariants(['noir', 'blanc', 'gris-chine', 'bleu-marine', 'vert-foret', 'sable'], ['S', 'M', 'L', 'XL', '2XL'], 35),
    allowedTechniques: ['dtg', 'serigraphie', 'broderie', 'flocage'],
    frontPrintZone: {
      widthCm: 28,
      heightCm: 28,
      xPercent: 50,
      yPercent: 44,
      maxPrintWidthPx: 2240,
      maxPrintHeightPx: 2240
    },
    backPrintZone: {
      widthCm: 34,
      heightCm: 44,
      xPercent: 50,
      yPercent: 46,
      maxPrintWidthPx: 2720,
      maxPrintHeightPx: 3520
    },
    model3DType: 'hoodie'
  },
  {
    id: 'sweat-crewneck-300g',
    name: 'Sweatshirt Col Rond Heritage 300g',
    category: 'sweatshirt',
    description: 'Coupe classique intemporelle, molleton semi-brossé 300 g/m² très doux. Demi-lune à l’intérieur du col et surpiqûres flatlock.',
    basePrice: 32.0,
    weightGsm: 300,
    material: '80% Coton peigné, 20% Polyester',
    active: true,
    colors: [
      STANDARD_COLORS[0],
      STANDARD_COLORS[1],
      STANDARD_COLORS[2],
      STANDARD_COLORS[3],
      STANDARD_COLORS[6]
    ],
    sizes: STANDARD_SIZES,
    variants: generateVariants(['noir', 'blanc', 'gris-chine', 'bleu-marine', 'bordeaux'], STANDARD_SIZES, 40),
    allowedTechniques: ['dtg', 'serigraphie', 'broderie', 'flocage'],
    frontPrintZone: {
      widthCm: 30,
      heightCm: 38,
      xPercent: 50,
      yPercent: 46,
      maxPrintWidthPx: 2400,
      maxPrintHeightPx: 3040
    },
    backPrintZone: {
      widthCm: 32,
      heightCm: 40,
      xPercent: 50,
      yPercent: 46,
      maxPrintWidthPx: 2560,
      maxPrintHeightPx: 3200
    },
    model3DType: 'sweatshirt'
  },
  {
    id: 'polo-pique-220g',
    name: 'Polo Piqué Classique Manches Courtes 220g',
    category: 'polo',
    description: 'Maille piquée dense 220 g/m² 100% coton pré-rétréci. Patte de boutonnage 2 boutons ton sur ton, col et bas de manches en côte 1x1. Idéal pour broderie de prestige.',
    basePrice: 24.5,
    weightGsm: 220,
    material: '100% Coton piqué fin peigné',
    active: true,
    colors: [
      STANDARD_COLORS[0],
      STANDARD_COLORS[1],
      STANDARD_COLORS[3],
      STANDARD_COLORS[4],
      STANDARD_COLORS[5]
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    variants: generateVariants(['noir', 'blanc', 'bleu-marine', 'bleu-royal', 'vert-foret'], ['S', 'M', 'L', 'XL', '2XL'], 50),
    allowedTechniques: ['broderie', 'flocage', 'serigraphie'],
    frontPrintZone: {
      widthCm: 14,
      heightCm: 14,
      xPercent: 32,
      yPercent: 38,
      maxPrintWidthPx: 1400,
      maxPrintHeightPx: 1400
    },
    backPrintZone: {
      widthCm: 28,
      heightCm: 36,
      xPercent: 50,
      yPercent: 44,
      maxPrintWidthPx: 2240,
      maxPrintHeightPx: 2880
    },
    model3DType: 'polo'
  },
  {
    id: 'totebag-canvas-300g',
    name: 'Tote Bag Canvas Renforcé 300g',
    category: 'totebag',
    description: 'Toile canvas ultra-résistante 300 g/m² 100% coton naturel. Anses longues renforcées (point en croix). Capacité 20L, soufflet de fond spacieux.',
    basePrice: 9.9,
    weightGsm: 300,
    material: '100% Coton Canvas Lourd Écologique',
    active: true,
    colors: [
      { id: 'naturel', name: 'Écru Naturel', hex: '#EDE8D5', textColor: 'dark' },
      STANDARD_COLORS[0],
      STANDARD_COLORS[3],
      STANDARD_COLORS[5]
    ],
    sizes: ['M'],
    variants: generateVariants(['naturel', 'noir', 'bleu-marine', 'vert-foret'], ['M'], 120),
    allowedTechniques: ['serigraphie', 'dtg', 'flocage'],
    frontPrintZone: {
      widthCm: 26,
      heightCm: 30,
      xPercent: 50,
      yPercent: 50,
      maxPrintWidthPx: 2080,
      maxPrintHeightPx: 2400
    },
    backPrintZone: {
      widthCm: 26,
      heightCm: 30,
      xPercent: 50,
      yPercent: 50,
      maxPrintWidthPx: 2080,
      maxPrintHeightPx: 2400
    },
    model3DType: 'totebag'
  }
];

export const CLIPARTS_LIBRARY = [
  {
    id: 'clipart-ghenix-emblem',
    category: 'Logos & Badges',
    name: 'Ghenix Phénix Insignia',
    svgData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><path d="M100 15 C85 45 65 70 30 85 C65 95 85 125 100 185 C115 125 135 95 170 85 C135 70 115 45 100 15 Z" fill="#F59E0B"/><circle cx="100" cy="100" r="28" fill="#111827"/><path d="M100 80 L108 95 L125 97 L112 108 L116 125 L100 115 L84 125 L88 108 L75 97 L92 95 Z" fill="#F59E0B"/></svg>`
  },
  {
    id: 'clipart-urban-skull',
    category: 'Streetwear',
    name: 'Crest Urbain',
    svgData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" stroke-width="8"/><circle cx="100" cy="100" r="68" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="6 4"/><path d="M65 85 Q100 45 135 85 Q145 130 100 145 Q55 130 65 85 Z" fill="currentColor"/><circle cx="85" cy="95" r="9" fill="#FFFFFF"/><circle cx="115" cy="95" r="9" fill="#FFFFFF"/></svg>`
  },
  {
    id: 'clipart-wave-surf',
    category: 'Nature & Vintage',
    name: 'Vague Japonaise',
    svgData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><path d="M20 130 Q60 50 110 80 Q150 110 180 60 Q170 140 20 140 Z" fill="#3B82F6"/><circle cx="140" cy="55" r="24" fill="#EF4444"/><path d="M40 145 L160 145" stroke="#FFFFFF" stroke-width="4"/></svg>`
  },
  {
    id: 'clipart-vintage-shield',
    category: 'Logos & Badges',
    name: 'Blason Athlétique',
    svgData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><path d="M40 40 L160 40 L160 110 Q160 160 100 185 Q40 160 40 110 Z" fill="none" stroke="currentColor" stroke-width="8"/><text x="100" y="90" font-family="sans-serif" font-weight="900" font-size="28" text-anchor="middle" fill="currentColor">GHX</text><text x="100" y="125" font-family="sans-serif" font-weight="700" font-size="14" text-anchor="middle" fill="currentColor">ATELIER 26</text></svg>`
  },
  {
    id: 'clipart-minimal-sun',
    category: 'Nature & Vintage',
    name: 'Soleil Levant Minimal',
    svgData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><circle cx="100" cy="90" r="45" fill="#E11D48"/><path d="M30 140 L170 140 M45 155 L155 155 M65 170 L135 170" stroke="currentColor" stroke-width="6" stroke-linecap="round"/></svg>`
  },
  {
    id: 'clipart-typography-stamp',
    category: 'Streetwear',
    name: 'Tampon Authentique',
    svgData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><rect x="30" y="30" width="140" height="140" rx="12" fill="none" stroke="currentColor" stroke-width="6"/><rect x="42" y="42" width="116" height="116" rx="6" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="5 3"/><text x="100" y="85" font-family="sans-serif" font-weight="800" font-size="16" text-anchor="middle" fill="currentColor">GHENIX</text><text x="100" y="112" font-family="sans-serif" font-weight="900" font-size="20" text-anchor="middle" fill="currentColor">ORIGINAL</text><text x="100" y="132" font-family="sans-serif" font-weight="600" font-size="11" text-anchor="middle" fill="currentColor">CUSTOM ATELIER</text></svg>`
  }
];

export const AVAILABLE_FONTS = [
  { id: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans (Moderne)' },
  { id: 'Space Grotesk', name: 'Space Grotesk (Tech & Brutaliste)' },
  { id: 'Impact', name: 'Impact (Bold Athletic)' },
  { id: 'Arial Black', name: 'Heavy Sans (Streetwear)' },
  { id: 'Georgia', name: 'Georgia Serif (Élégant)' },
  { id: 'Courier New', name: 'Typewriter Mono' },
  { id: 'Trebuchet MS', name: 'Sport Clean' }
];
