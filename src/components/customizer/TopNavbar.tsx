import React from 'react';
import {
  ShoppingBag,
  Download,
  Shield,
  Search,
  Eye,
  Box,
  Bookmark
} from 'lucide-react';

interface TopNavbarProps {
  viewMode: '2d' | '3d';
  onToggleViewMode: (mode: '2d' | '3d') => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenExport: () => void;
  onOpenSave: () => void;
  onOpenAdmin: () => void;
  onOpenTracking: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  viewMode,
  onToggleViewMode,
  cartCount,
  onOpenCart,
  onOpenExport,
  onOpenSave,
  onOpenAdmin,
  onOpenTracking,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo
}) => {
  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-40 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-8">
        {/* ZONE 1: BRAND WORDMARK */}
        <a
          href="#"
          className="text-base sm:text-lg font-black tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
          <span>GHENIX ATELIER</span>
        </a>

        {/* ZONE 2: 4 CONCISE SINGLE-LINE NAV LINKS */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <button
            onClick={() => onToggleViewMode('3d')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              viewMode === '3d'
                ? 'text-slate-900 font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Studio 3D</span>
          </button>

          <button
            onClick={() => onToggleViewMode('2d')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              viewMode === '2d'
                ? 'text-slate-900 font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Éditeur 2D</span>
          </button>

          <button
            onClick={onOpenTracking}
            className="flex items-center gap-1.5 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Suivi Commande</span>
          </button>

          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Atelier Admin</span>
          </button>
        </nav>

        {/* ZONE 3: SAVE, EXPORT & PRIMARY CART ACTION */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenSave}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap"
            title="Sauvegarder ou charger un projet enregistré"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Sauvegarder</span>
          </button>

          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap"
            title="Télécharger l'aperçu HD ou les fichiers d'impression"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Export HD</span>
          </button>

          <button
            onClick={onOpenCart}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-xs whitespace-nowrap"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span>Panier</span>
            {cartCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded-full text-[10px] font-black">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
