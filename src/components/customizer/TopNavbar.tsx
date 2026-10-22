import React from 'react';
import {
  ShoppingBag,
  Download,
  Shield,
  Search,
  Eye,
  Box,
  Bookmark,
  Sparkles,
  Home,
  User,
  LogOut
} from 'lucide-react';
import { UserProfile } from '../../types/auth';
import { logout } from '../../services/authService';

interface TopNavbarProps {
  viewMode: '2d' | '3d';
  onToggleViewMode: (mode: '2d' | '3d') => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenExport: () => void;
  onOpenSave: () => void;
  onOpenAdmin: () => void;
  onOpenTracking: () => void;
  onOpenSpace?: () => void;
  onOpenRenderEngine?: () => void;
  onBackToLanding?: () => void;
  currentUser?: UserProfile | null;
  onOpenAuth?: (reason?: any) => void;
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
  onOpenSpace,
  onOpenRenderEngine,
  onBackToLanding,
  currentUser,
  onOpenAuth,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo
}) => {
  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 h-11 sm:h-12 flex items-center justify-between gap-2 sm:gap-4">
        {/* ZONE 1: BRAND WORDMARK & MOBILE 3D/2D SWITCHER */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onBackToLanding}
            className="text-xs sm:text-sm font-black tracking-tight text-slate-900 whitespace-nowrap flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            title="Retour à la page d'accueil"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span className="hidden xs:inline tracking-wider">GHENIX ATELIER</span>
            <span className="xs:hidden tracking-wider">GHENIX</span>
          </button>

          {/* MOBILE 3D / 2D TOGGLE (Visible on small screens) */}
          <div className="flex md:hidden items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 text-[10px] font-bold">
            <button
              onClick={() => onToggleViewMode('3d')}
              className={`px-1.5 py-0.5 rounded-md transition-all flex items-center gap-1 ${
                viewMode === '3d'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Box className="w-2.5 h-2.5" />
              <span>3D</span>
            </button>
            <button
              onClick={() => onToggleViewMode('2d')}
              className={`px-1.5 py-0.5 rounded-md transition-all flex items-center gap-1 ${
                viewMode === '2d'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-2.5 h-2.5" />
              <span>2D</span>
            </button>
          </div>
        </div>

        {/* ZONE 2: DESKTOP NAV LINKS */}
        <nav className="hidden md:flex items-center gap-3.5 text-[11px] font-semibold text-slate-600">
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-1 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 text-slate-600"
            >
              <Home className="w-3 h-3 text-slate-400" />
              <span>Accueil</span>
            </button>
          )}

          <button
            onClick={() => onToggleViewMode('3d')}
            className={`flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 ${
              viewMode === '3d'
                ? 'text-slate-900 font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <Box className="w-3 h-3" />
            <span>Studio 3D</span>
          </button>

          <button
            onClick={() => onToggleViewMode('2d')}
            className={`flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 ${
              viewMode === '2d'
                ? 'text-slate-900 font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Éditeur 2D</span>
          </button>

          <button
            onClick={onOpenSpace}
            className="flex items-center gap-1 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            <User className="w-3 h-3" />
            <span>
              {currentUser?.role === 'livreur'
                ? 'Livraisons'
                : currentUser?.role === 'admin'
                ? 'Espace'
                : 'Mes commandes'}
            </span>
          </button>

          <button
            onClick={onOpenTracking}
            className="flex items-center gap-1 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            <Search className="w-3 h-3" />
            <span>Suivi</span>
          </button>

          {/* Admin link - highlights if admin */}
          <button
            onClick={onOpenAdmin}
            className={`flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 ${
              currentUser?.role === 'admin'
                ? 'text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200'
                : 'hover:text-slate-900'
            }`}
          >
            <Shield className="w-3 h-3 text-amber-500" />
            <span>Atelier Admin</span>
          </button>

          {onOpenRenderEngine && (
            <button
              onClick={onOpenRenderEngine}
              className="flex items-center gap-1.5 text-slate-800 hover:text-slate-900 transition-all whitespace-nowrap shrink-0 font-bold bg-amber-500/15 hover:bg-amber-500/25 px-2.5 py-1 rounded-lg border border-amber-500/40 text-[11px]"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Moteur 3D & API</span>
            </button>
          )}
        </nav>

        {/* ZONE 3: ACTIONS (PROFILE, SAVE, EXPORT, CART) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenRenderEngine && (
            <button
              onClick={onOpenRenderEngine}
              className="md:hidden flex items-center p-1.5 text-slate-800 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg border border-amber-500/40"
              title="Moteur 3D & API"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </button>
          )}

          {/* USER ACCOUNT PILL */}
          {currentUser ? (
            <div className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200/80 px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-800 transition-colors border border-slate-200/60">
              <span className={`w-2 h-2 rounded-full ${currentUser.role === 'admin' ? 'bg-amber-500' : currentUser.role === 'livreur' ? 'bg-sky-500' : 'bg-slate-900'}`} />
              <span className="hidden sm:inline line-clamp-1 max-w-[90px]">
                {currentUser.name.split(' ')[0]}
              </span>
              <button
                onClick={() => logout()}
                className="text-slate-400 hover:text-rose-600 ml-0.5"
                title="Se déconnecter"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            onOpenAuth && (
              <button
                onClick={() => onOpenAuth('general')}
                className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
                title="Se connecter"
              >
                <User className="w-3 h-3 text-slate-500" />
                <span className="hidden sm:inline">Connexion</span>
              </button>
            )
          )}

          <button
            onClick={onOpenSave}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            title="Sauvegarder ou charger un projet"
          >
            <Bookmark className="w-3 h-3 text-amber-500" />
            <span className="hidden sm:inline">Sauvegarder</span>
          </button>

          <button
            onClick={onOpenExport}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            title="Télécharger l'aperçu ou fichiers d'impression"
          >
            <Download className="w-3 h-3 text-slate-600" />
            <span className="hidden sm:inline">Export HD</span>
          </button>

          <button
            onClick={onOpenCart}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs whitespace-nowrap"
          >
            <ShoppingBag className="w-3 h-3 text-amber-400" />
            <span className="hidden xs:inline">Panier</span>
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


