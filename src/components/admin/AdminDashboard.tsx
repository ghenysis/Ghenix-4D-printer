import React, { useState, useEffect, useMemo } from 'react';
import {
  GarmentArticle,
  Order,
  OrderStatus,
  GarmentColor,
  GarmentSize,
  PrintTechniqueId
} from '../../types';
import {
  getStoredCatalog,
  saveCatalog,
  getStoredOrders,
  updateOrderStatus,
  resetCatalogToDefault
} from '../../services/storage';
import { PRINT_TECHNIQUES, STANDARD_COLORS } from '../../data/defaultCatalog';
import {
  Shield,
  Package,
  ShoppingBag,
  BarChart3,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Printer,
  Truck,
  RotateCcw,
  Edit2,
  Trash2,
  Plus,
  X,
  FileText,
  Lock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Calendar,
  Layers,
  Check,
  Eye,
  Sliders,
  Building2
} from 'lucide-react';
import { UserProfile } from '../../types/auth';
import { CompanyInfoEditor } from './CompanyInfoEditor';
import { OpsAdminPanel } from '../accounts/AccountSpaces';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onCatalogUpdated: (newCatalog: GarmentArticle[]) => void;
  currentUser?: UserProfile | null;
  onOpenStudio?: () => void;
  onOpenRenderEngine?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  onCatalogUpdated,
  currentUser,
  onOpenStudio,
  onOpenRenderEngine
}) => {
  // Authentication state (Security code: "atelier2026" or "admin")
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authPin, setAuthPin] = useState('');
  const [authError, setAuthError] = useState(false);

  // Auto authenticate if current user is admin
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      setIsAuthenticated(true);
      setAuthError(false);
    }
  }, [currentUser]);

  // Active view tab: stats (KPIs), orders, catalog, company (landing dynamic info)
  const [adminTab, setAdminTab] = useState<'stats' | 'orders' | 'catalog' | 'company' | 'ops'>('stats');

  // Time filter for KPIs: 'today' | '7days' | '30days' | 'all'
  const [timeFilter, setTimeFilter] = useState<'today' | '7days' | '30days' | 'all'>('all');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchRef, setSearchRef] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusNote, setStatusNote] = useState('');
  const [showProductionTicket, setShowProductionTicket] = useState(false);

  // Catalog State
  const [catalog, setCatalog] = useState<GarmentArticle[]>([]);
  const [editingArticle, setEditingArticle] = useState<GarmentArticle | null>(null);
  const [isCreatingNewArticle, setIsCreatingNewArticle] = useState(false);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#2563EB');

  useEffect(() => {
    if (isOpen) {
      setOrders(getStoredOrders());
      setCatalog(getStoredCatalog());
    }
  }, [isOpen]);

  // Handle PIN authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authPin.trim() === 'atelier2026' || authPin.trim() === 'admin') {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  // Status badge styling helper
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending_confirmation':
        return { label: 'En attente', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'confirmed':
        return { label: 'Confirmée', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'in_preparation':
        return { label: 'En préparation', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'printing':
        return { label: 'En impression', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'quality_check':
        return { label: 'Contrôle qualité', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
      case 'ready':
        return { label: 'Prête', color: 'bg-teal-100 text-teal-800 border-teal-200' };
      case 'shipped':
        return { label: 'Expédiée / Livrée', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'completed':
        return { label: 'Terminée', color: 'bg-slate-100 text-slate-800 border-slate-200' };
      case 'cancelled':
        return { label: 'Annulée', color: 'bg-rose-100 text-rose-800 border-rose-200' };
      default:
        return { label: status, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  // KPI Calculations according to timeframe
  const kpis = useMemo(() => {
    const now = Date.now();
    const filteredByDate = orders.filter((o) => {
      if (timeFilter === 'all') return true;
      const orderDate = new Date(o.createdAt).getTime();
      const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);
      if (timeFilter === 'today') return diffDays <= 1;
      if (timeFilter === '7days') return diffDays <= 7;
      if (timeFilter === '30days') return diffDays <= 30;
      return true;
    });

    const totalCount = filteredByDate.length;
    // Commandes à traiter
    const pendingCount = filteredByDate.filter((o) =>
      o.status === 'pending_confirmation' || o.status === 'confirmed'
    ).length;
    // Commandes en production
    const inProductionCount = filteredByDate.filter((o) =>
      o.status === 'in_preparation' || o.status === 'printing' || o.status === 'quality_check'
    ).length;
    // Commandes terminées
    const completedCount = filteredByDate.filter((o) =>
      o.status === 'ready' || o.status === 'shipped' || o.status === 'completed'
    ).length;
    // Commandes annulées
    const cancelledCount = filteredByDate.filter((o) => o.status === 'cancelled').length;

    // Chiffre d'affaires valide (exclut rigoureusement les commandes annulées et les demandes non validées)
    const validOrders = filteredByDate.filter((o) => o.status !== 'cancelled' && o.status !== 'pending_confirmation');
    const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);

    // Articles disponibles et stocks
    const totalArticles = catalog.length;
    const activeArticles = catalog.filter((a) => a.active).length;
    let outOfStockVariants = 0;
    catalog.forEach((art) => {
      art.variants.forEach((v) => {
        if (!v.available || v.stock <= 0) outOfStockVariants++;
      });
    });

    return {
      totalCount,
      pendingCount,
      inProductionCount,
      completedCount,
      cancelledCount,
      totalRevenue,
      totalArticles,
      activeArticles,
      outOfStockVariants
    };
  }, [orders, catalog, timeFilter]);

  // Handle Order Status Change
  const handleChangeStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = updateOrderStatus(
      orderId,
      newStatus,
      statusNote.trim() || `Statut passé à ${getStatusBadge(newStatus).label}`,
      'Chef d’atelier Ghenix'
    );
    if (updated) {
      const refreshed = getStoredOrders();
      setOrders(refreshed);
      setSelectedOrder(updated);
      setStatusNote('');
    }
  };

  // Save Article Edits or Create New Article
  const handleSaveArticle = () => {
    if (!editingArticle) return;
    const current = getStoredCatalog();
    const idx = current.findIndex((a) => a.id === editingArticle.id);

    let updatedCatalog: GarmentArticle[];
    if (idx >= 0) {
      current[idx] = editingArticle;
      updatedCatalog = [...current];
    } else {
      updatedCatalog = [editingArticle, ...current];
    }

    saveCatalog(updatedCatalog);
    setCatalog(updatedCatalog);
    onCatalogUpdated(updatedCatalog);
    setEditingArticle(null);
    setIsCreatingNewArticle(false);
  };

  // Toggle variant availability in article
  const handleToggleVariant = (colorId: string, size: GarmentSize) => {
    if (!editingArticle) return;
    const variants = [...editingArticle.variants];
    const targetIdx = variants.findIndex((v) => v.colorId === colorId && v.size === size);

    if (targetIdx >= 0) {
      variants[targetIdx].available = !variants[targetIdx].available;
    } else {
      variants.push({ colorId, size, stock: 15, available: true });
    }

    setEditingArticle({ ...editingArticle, variants });
  };

  // Add new color to editing article
  const handleAddColor = () => {
    if (!editingArticle || !newColorName.trim()) return;
    const newColor: GarmentColor = {
      id: `col-${Date.now()}`,
      name: newColorName.trim(),
      hex: newColorHex,
      textColor: 'light'
    };

    const updatedColors = [...editingArticle.colors, newColor];
    const newVariants = editingArticle.sizes.map((size) => ({
      colorId: newColor.id,
      size,
      stock: 25,
      available: true
    }));

    setEditingArticle({
      ...editingArticle,
      colors: updatedColors,
      variants: [...editingArticle.variants, ...newVariants]
    });
    setNewColorName('');
  };

  // Initialize new blank article template
  const handleStartCreateArticle = () => {
    const newArt: GarmentArticle = {
      id: `art-${Date.now()}`,
      name: 'Nouvel Article Textile',
      category: 'tshirt',
      description: 'Description détaillée du vêtement, matière et coupe.',
      basePrice: 19.9,
      weightGsm: 180,
      material: '100% Coton peigné biologique',
      active: true,
      colors: [STANDARD_COLORS[0], STANDARD_COLORS[1]],
      sizes: ['S', 'M', 'L', 'XL'],
      variants: [
        { colorId: STANDARD_COLORS[0].id, size: 'S', stock: 50, available: true },
        { colorId: STANDARD_COLORS[0].id, size: 'M', stock: 50, available: true },
        { colorId: STANDARD_COLORS[0].id, size: 'L', stock: 50, available: true },
        { colorId: STANDARD_COLORS[0].id, size: 'XL', stock: 50, available: true },
        { colorId: STANDARD_COLORS[1].id, size: 'S', stock: 50, available: true },
        { colorId: STANDARD_COLORS[1].id, size: 'M', stock: 50, available: true },
        { colorId: STANDARD_COLORS[1].id, size: 'L', stock: 50, available: true },
        { colorId: STANDARD_COLORS[1].id, size: 'XL', stock: 50, available: true }
      ],
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
    };
    setEditingArticle(newArt);
    setIsCreatingNewArticle(true);
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchRef =
      o.reference.toLowerCase().includes(searchRef.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(searchRef.toLowerCase()) ||
      o.customer.email.toLowerCase().includes(searchRef.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchRef && matchStatus;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-white rounded-2xl max-w-6xl w-full h-[92vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* TOP ADMIN HEADER */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-xl text-slate-950 font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                GHENIX ATELIER — MODULE D'ADMINISTRATION
              </h2>
              <p className="text-xs text-slate-400">
                Supervision des commandes, fabrication textile, catalogue et gestion des stocks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                onClick={() => setIsAuthenticated(false)}
                className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors"
              >
                Déconnexion
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AUTHENTICATION GATE */}
        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
            <form
              onSubmit={handleLogin}
              className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md max-w-md w-full space-y-5 text-center"
            >
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-800">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Accès Restreint à l'Imprimerie
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Veuillez vous authentifier pour accéder à la console de gestion.
                </p>
              </div>

              <div>
                <input
                  type="password"
                  value={authPin}
                  onChange={(e) => setAuthPin(e.target.value)}
                  placeholder="Code de sécurité (ex : atelier2026)"
                  className="w-full px-4 py-2.5 text-center font-mono tracking-widest text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  autoFocus
                />
                {authError && (
                  <p className="text-xs text-rose-600 mt-2 font-medium">
                    Code d'accès incorrect. (Code : atelier2026)
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                Ouvrir la Console Atelier
              </button>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED WORKSHOP PORTAL */
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            {/* NAVIGATION TABS */}
            <div className="px-6 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAdminTab('stats')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                    adminTab === 'stats'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Tableau de Bord</span>
                </button>
                <button
                  onClick={() => setAdminTab('orders')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                    adminTab === 'orders'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Commandes ({orders.length})</span>
                </button>
                <button
                  onClick={() => setAdminTab('catalog')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                    adminTab === 'catalog'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Catalogue & Articles ({catalog.length})</span>
                </button>
                <button
                  onClick={() => setAdminTab('ops')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                    adminTab === 'ops'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Comptes & Tarifs</span>
                </button>
                <button
                  onClick={() => setAdminTab('company')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                    adminTab === 'company'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Vitrine & Entreprise</span>
                </button>
              </div>

              {/* Timeframe Filter (when in stats tab) */}
              {adminTab === 'stats' && (
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-[11px]">
                  <span className="text-slate-400 px-2 flex items-center gap-1 font-medium">
                    <Calendar className="w-3 h-3" /> Période :
                  </span>
                  {(
                    [
                      { id: 'today', label: "Aujourd'hui" },
                      { id: '7days', label: '7 jours' },
                      { id: '30days', label: '30 jours' },
                      { id: 'all', label: 'Tout' }
                    ] as const
                  ).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setTimeFilter(p.id)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                        timeFilter === p.id
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ============================================================ */}
            {/* TAB 1: KPI DASHBOARD (TABLEAU DE BORD) */}
            {/* ============================================================ */}
            {adminTab === 'stats' && (
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                {/* 6 MAIN KPI STATS CARDS */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {/* CA Réel */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 text-xs">
                      <span className="font-medium">Chiffre d'Affaires</span>
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-xl font-black font-mono text-slate-900">
                      {kpis.totalRevenue.toFixed(2)} €
                    </div>
                    <p className="text-[10px] text-slate-400">Commandes validées</p>
                  </div>

                  {/* Total Commandes */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 text-xs">
                      <span className="font-medium">Total Commandes</span>
                      <ShoppingBag className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="text-xl font-black font-mono text-slate-900">
                      {kpis.totalCount}
                    </div>
                    <p className="text-[10px] text-slate-400">Sur la période</p>
                  </div>

                  {/* À Traiter */}
                  <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-amber-700 text-xs">
                      <span className="font-bold">À Traiter</span>
                      <Clock className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-xl font-black font-mono text-amber-900">
                      {kpis.pendingCount}
                    </div>
                    <p className="text-[10px] text-amber-600">En attente / confirmées</p>
                  </div>

                  {/* En Production */}
                  <div className="bg-white p-4 rounded-2xl border border-indigo-200 bg-indigo-50/20 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-indigo-700 text-xs">
                      <span className="font-bold">En Production</span>
                      <Printer className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="text-xl font-black font-mono text-indigo-900">
                      {kpis.inProductionCount}
                    </div>
                    <p className="text-[10px] text-indigo-600">Impression / contrôle</p>
                  </div>

                  {/* Terminées / Livrées */}
                  <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-emerald-700 text-xs">
                      <span className="font-bold">Terminées</span>
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-xl font-black font-mono text-emerald-900">
                      {kpis.completedCount}
                    </div>
                    <p className="text-[10px] text-emerald-600">Prêtes & expédiées</p>
                  </div>

                  {/* Stock & Disponibilité */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 text-xs">
                      <span className="font-medium">Catalogue & Stock</span>
                      <Package className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="text-xl font-black font-mono text-slate-900">
                      {kpis.activeArticles} / {kpis.totalArticles}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {kpis.outOfStockVariants} variante(s) indispo
                    </p>
                  </div>
                </div>

                {/* QUICK ACTIONS & SHORTCUTS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Shortcut 1 */}
                  <div
                    onClick={() => {
                      setStatusFilter('pending_confirmation');
                      setAdminTab('orders');
                    }}
                    className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-400 cursor-pointer transition-all shadow-xs flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          Valider les commandes en attente
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {kpis.pendingCount} commande(s) nécessitent validation
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>

                  {/* Shortcut 2 */}
                  <div
                    onClick={() => {
                      setStatusFilter('in_preparation');
                      setAdminTab('orders');
                    }}
                    className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-400 cursor-pointer transition-all shadow-xs flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                        <Printer className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          Imprimer fiches de production
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {kpis.inProductionCount} commande(s) en atelier
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>

                  {/* Shortcut 3 */}
                  <div
                    onClick={() => {
                      handleStartCreateArticle();
                      setAdminTab('catalog');
                    }}
                    className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-400 cursor-pointer transition-all shadow-xs flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                        <Plus className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          Ajouter un nouvel article textile
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          T-shirts, polos, sweats, casquettes...
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* RECENT ORDERS TABLE OVERVIEW */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Dernières commandes reçues
                    </h4>
                    <button
                      onClick={() => setAdminTab('orders')}
                      className="text-xs font-bold text-slate-900 hover:underline"
                    >
                      Voir tout l'historique →
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-100">
                          <th className="pb-2 font-medium">Référence</th>
                          <th className="pb-2 font-medium">Date</th>
                          <th className="pb-2 font-medium">Client</th>
                          <th className="pb-2 font-medium">Articles</th>
                          <th className="pb-2 font-medium">Montant</th>
                          <th className="pb-2 font-medium">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orders.slice(0, 5).map((o) => {
                          const badge = getStatusBadge(o.status);
                          return (
                            <tr
                              key={o.id}
                              onClick={() => {
                                setSelectedOrder(o);
                                setAdminTab('orders');
                              }}
                              className="hover:bg-slate-50 cursor-pointer"
                            >
                              <td className="py-2.5 font-mono font-bold text-slate-900">
                                {o.reference}
                              </td>
                              <td className="py-2.5 text-slate-500">
                                {new Date(o.createdAt).toLocaleDateString('fr-FR')}
                              </td>
                              <td className="py-2.5 font-medium text-slate-800">
                                {o.customer.fullName}
                              </td>
                              <td className="py-2.5 text-slate-600">
                                {o.items.length} article(s)
                              </td>
                              <td className="py-2.5 font-mono font-bold text-slate-900">
                                {o.total.toFixed(2)} €
                              </td>
                              <td className="py-2.5">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.color}`}>
                                  {badge.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 2: ORDERS MANAGEMENT & WORKSHOP TICKET */}
            {/* ============================================================ */}
            {adminTab === 'orders' && (
              <div className="flex-1 flex overflow-hidden">
                {/* Orders list left pane */}
                <div className="w-full md:w-1/2 border-r border-slate-200 flex flex-col bg-white overflow-hidden">
                  {/* Search and filter bar */}
                  <div className="p-3 border-b border-slate-200 space-y-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={searchRef}
                        onChange={(e) => setSearchRef(e.target.value)}
                        placeholder="Rechercher par référence, client ou email..."
                        className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1">
                      <span className="text-[11px] text-slate-500 mr-1">Statut :</span>
                      {[
                        'all',
                        'pending_confirmation',
                        'confirmed',
                        'in_preparation',
                        'printing',
                        'quality_check',
                        'ready',
                        'shipped'
                      ].map((st) => (
                        <button
                          key={st}
                          onClick={() => setStatusFilter(st)}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap ${
                            statusFilter === st
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {st === 'all' ? 'Tous' : getStatusBadge(st as OrderStatus).label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Orders scrollable list */}
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                    {filteredOrders.length === 0 ? (
                      <p className="p-6 text-center text-xs text-slate-400">
                        Aucune commande trouvée.
                      </p>
                    ) : (
                      filteredOrders.map((ord) => {
                        const isSelected = selectedOrder?.id === ord.id;
                        const badge = getStatusBadge(ord.status);

                        return (
                          <div
                            key={ord.id}
                            onClick={() => setSelectedOrder(ord)}
                            className={`p-3.5 cursor-pointer transition-colors text-xs space-y-1 ${
                              isSelected
                                ? 'bg-amber-50/70 border-l-4 border-amber-500'
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-slate-900">
                                {ord.reference}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.color}`}>
                                {badge.label}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-slate-600">
                              <span className="font-medium text-slate-800">
                                {ord.customer.fullName}
                              </span>
                              <span className="font-mono font-bold text-slate-900">
                                {ord.total.toFixed(2)} €
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span>{ord.items.length} article(s)</span>
                              <span>{new Date(ord.createdAt).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Order Details right pane */}
                <div className="hidden md:flex flex-1 flex-col bg-slate-50 overflow-y-auto p-6 space-y-5 text-xs">
                  {selectedOrder ? (
                    <>
                      {/* Order Header & Workshop Ticket Button */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900 font-mono">
                              {selectedOrder.reference}
                            </h3>
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getStatusBadge(selectedOrder.status).color}`}>
                              {getStatusBadge(selectedOrder.status).label}
                            </span>
                          </div>
                          <p className="text-slate-500 mt-0.5">
                            Passée le {new Date(selectedOrder.createdAt).toLocaleString('fr-FR')}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setShowProductionTicket(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition-colors"
                            title="Imprimer ou exporter la fiche de fabrication"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-600" />
                            <span>Fiche Atelier</span>
                          </button>
                          <span className="text-lg font-bold font-mono text-slate-900">
                            {selectedOrder.total.toFixed(2)} € TTC
                          </span>
                        </div>
                      </div>

                      {/* Advance Production Status */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                        <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                          Faire avancer le statut de production
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {(
                            [
                              'confirmed',
                              'in_preparation',
                              'printing',
                              'quality_check',
                              'ready',
                              'shipped',
                              'completed',
                              'cancelled'
                            ] as OrderStatus[]
                          ).map((st) => (
                            <button
                              key={st}
                              onClick={() => handleChangeStatus(selectedOrder.id, st)}
                              disabled={selectedOrder.status === st}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                selectedOrder.status === st
                                  ? 'bg-slate-900 text-white'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {getStatusBadge(st).label}
                            </button>
                          ))}
                        </div>

                        <div className="flex gap-2 pt-1">
                          <input
                            type="text"
                            value={statusNote}
                            onChange={(e) => setStatusNote(e.target.value)}
                            placeholder="Note interne sur l'étape (ex : sérigraphie terminée, emballage prêt)..."
                            className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-900"
                          />
                        </div>
                      </div>

                      {/* Customer Details */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                        <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                          Coordonnées Client & Livraison
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-slate-700">
                          <div>
                            Client :{' '}
                            <span className="font-semibold text-slate-900">
                              {selectedOrder.customer.fullName}
                            </span>
                          </div>
                          <div>
                            Email :{' '}
                            <span className="font-semibold text-slate-900">
                              {selectedOrder.customer.email}
                            </span>
                          </div>
                          <div>
                            Téléphone :{' '}
                            <span className="font-semibold text-slate-900">
                              {selectedOrder.customer.phone}
                            </span>
                          </div>
                          <div>
                            Mode :{' '}
                            <span className="font-semibold text-slate-900">
                              {selectedOrder.customer.deliveryMethod === 'workshop_pickup'
                                ? 'Retrait Atelier Ghenix'
                                : 'Livraison Transporteur'}
                            </span>
                          </div>
                        </div>
                        {selectedOrder.customer.notes && (
                          <div className="p-2.5 bg-amber-50 rounded-lg text-amber-800 text-[11px] mt-2 border border-amber-200">
                            <strong>Instructions du client :</strong> {selectedOrder.customer.notes}
                          </div>
                        )}
                      </div>

                      {/* Items & Custom Design Specs */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                        <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                          Détails des articles et impression
                        </h4>
                        <div className="space-y-3">
                          {selectedOrder.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-3 border rounded-xl border-slate-200 bg-slate-50/50 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900">{item.article.name}</span>
                                <span className="font-mono font-bold">Qté : {item.quantity}</span>
                              </div>
                              <p className="text-slate-600 text-[11px]">
                                Taille {item.size} · Couleur {item.color.name} ({item.color.hex}) ·
                                Technique : <strong>{item.technique.name}</strong>
                              </p>

                              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                                <span>Recto : {item.design.front.elements.length} élément(s) · Verso : {item.design.back.elements.length} élément(s)</span>
                                <span className="font-mono font-bold text-slate-900">{item.totalPrice.toFixed(2)} €</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Audit History Log */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                        <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                          Journal d'audit de fabrication
                        </h4>
                        <div className="space-y-2">
                          {selectedOrder.history.map((hist, hIdx) => (
                            <div key={hIdx} className="text-[11px] flex items-start gap-2 text-slate-600">
                              <span className="font-mono text-slate-400 shrink-0">
                                {new Date(hist.timestamp).toLocaleTimeString('fr-FR')}
                              </span>
                              <span>
                                <strong className="text-slate-800">{hist.author}</strong> : {hist.note}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">
                      Sélectionnez une commande à gauche pour examiner les détails et le bon d'impression.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 3: CATALOG & ARTICLES MANAGEMENT */}
            {/* ============================================================ */}
            {adminTab === 'catalog' && (
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      Gestion des Articles, Catégories & Variantes
                    </h3>
                    <p className="text-xs text-slate-500">
                      Ajoutez de nouveaux articles textiles, modifiez les prix, et activez/désactivez les combinaisons couleurs/tailles.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleStartCreateArticle}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      <Plus className="w-4 h-4 text-amber-400" />
                      <span>Ajouter un article</span>
                    </button>
                    <button
                      onClick={() => {
                        const updated = resetCatalogToDefault();
                        setCatalog(updated);
                        onCatalogUpdated(updated);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded-xl hover:bg-slate-100"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Réinitialiser</span>
                    </button>
                  </div>
                </div>

                {/* ARTICLES GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catalog.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900">{item.name}</h4>
                            <span
                              className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                                item.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {item.active ? 'Actif' : 'Désactivé'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 capitalize">
                            Catégorie : <strong>{item.category}</strong> · {item.weightGsm}g/m²
                          </p>
                        </div>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {item.basePrice.toFixed(2)} €
                        </span>
                      </div>

                      {/* Swatches */}
                      <div className="flex flex-wrap gap-1 text-[11px] text-slate-600">
                        {item.colors.map((c) => (
                          <span
                            key={c.id}
                            className="inline-block w-4 h-4 rounded-full border border-black/10"
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="text-slate-500">
                          {item.variants.filter((v) => v.available).length} combinaisons actives
                        </span>
                        <button
                          onClick={() => {
                            setEditingArticle(item);
                            setIsCreatingNewArticle(false);
                          }}
                          className="flex items-center gap-1 font-bold text-slate-900 hover:text-amber-600 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Configurer</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* EDIT OR CREATE ARTICLE MODAL */}
                {editingArticle && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto text-xs">
                      <div className="flex items-center justify-between border-b pb-3">
                        <h4 className="font-bold text-base text-slate-900">
                          {isCreatingNewArticle ? 'Nouvel Article Textile' : `Modifier : ${editingArticle.name}`}
                        </h4>
                        <button
                          onClick={() => setEditingArticle(null)}
                          className="p-1.5 text-slate-400 hover:text-slate-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Basic Info */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="font-semibold block mb-1">Nom de l'article</label>
                          <input
                            type="text"
                            value={editingArticle.name}
                            onChange={(e) =>
                              setEditingArticle({ ...editingArticle, name: e.target.value })
                            }
                            className="w-full px-3 py-1.5 border rounded-lg bg-white"
                          />
                        </div>

                        <div>
                          <label className="font-semibold block mb-1">Catégorie</label>
                          <select
                            value={editingArticle.category}
                            onChange={(e) =>
                              setEditingArticle({
                                ...editingArticle,
                                category: e.target.value as any,
                                model3DType: e.target.value as any
                              })
                            }
                            className="w-full px-3 py-1.5 border rounded-lg bg-white"
                          >
                            <option value="tshirt">T-Shirt</option>
                            <option value="hoodie">Sweat à capuche (Hoodie)</option>
                            <option value="sweatshirt">Sweatshirt Col Rond</option>
                            <option value="polo">Polo</option>
                            <option value="totebag">Tote Bag</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-semibold block mb-1">Prix de Base (€ HT)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={editingArticle.basePrice}
                            onChange={(e) =>
                              setEditingArticle({
                                ...editingArticle,
                                basePrice: Number(e.target.value)
                              })
                            }
                            className="w-full px-3 py-1.5 border rounded-lg bg-white"
                          />
                        </div>

                        <div>
                          <label className="font-semibold block mb-1">Grammage Textile (g/m²)</label>
                          <input
                            type="number"
                            value={editingArticle.weightGsm}
                            onChange={(e) =>
                              setEditingArticle({
                                ...editingArticle,
                                weightGsm: Number(e.target.value)
                              })
                            }
                            className="w-full px-3 py-1.5 border rounded-lg bg-white"
                          />
                        </div>

                        <div>
                          <label className="font-semibold block mb-1">Matière</label>
                          <input
                            type="text"
                            value={editingArticle.material}
                            onChange={(e) =>
                              setEditingArticle({ ...editingArticle, material: e.target.value })
                            }
                            className="w-full px-3 py-1.5 border rounded-lg bg-white"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="font-semibold block mb-1">Description commerciale</label>
                          <textarea
                            rows={2}
                            value={editingArticle.description}
                            onChange={(e) =>
                              setEditingArticle({ ...editingArticle, description: e.target.value })
                            }
                            className="w-full px-3 py-1.5 border rounded-lg bg-white"
                          />
                        </div>

                        <div className="col-span-2 flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="art-active"
                            checked={editingArticle.active}
                            onChange={(e) =>
                              setEditingArticle({ ...editingArticle, active: e.target.checked })
                            }
                            className="rounded"
                          />
                          <label htmlFor="art-active" className="font-semibold cursor-pointer">
                            Article publié et disponible à la commande sur la boutique
                          </label>
                        </div>
                      </div>

                      {/* Add Color Form */}
                      <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                        <p className="font-bold text-slate-800">Ajouter un nouveau coloris au catalogue :</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Nom (Ex : Kaki Militaire)"
                            value={newColorName}
                            onChange={(e) => setNewColorName(e.target.value)}
                            className="flex-1 px-3 py-1.5 border rounded-lg bg-white"
                          />
                          <input
                            type="color"
                            value={newColorHex}
                            onChange={(e) => setNewColorHex(e.target.value)}
                            className="w-8 h-8 rounded border p-0 cursor-pointer"
                          />
                          <button
                            onClick={handleAddColor}
                            className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-bold"
                          >
                            Ajouter
                          </button>
                        </div>
                      </div>

                      {/* Variant Matrix (Color x Size) */}
                      <div className="space-y-2">
                        <p className="font-bold text-slate-900">
                          Disponibilités par combinaison (Cliquer pour activer/désactiver) :
                        </p>
                        <div className="max-h-52 overflow-y-auto border rounded-xl divide-y">
                          {editingArticle.colors.map((col) => (
                            <div
                              key={col.id}
                              className="p-2.5 flex items-center justify-between bg-white"
                            >
                              <div className="flex items-center gap-2 w-32">
                                <span
                                  className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                                  style={{ backgroundColor: col.hex }}
                                />
                                <span className="font-semibold truncate">{col.name}</span>
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {editingArticle.sizes.map((size) => {
                                  const v = editingArticle.variants.find(
                                    (item) => item.colorId === col.id && item.size === size
                                  );
                                  const isAvail = v ? v.available : true;

                                  return (
                                    <button
                                      key={size}
                                      onClick={() => handleToggleVariant(col.id, size)}
                                      className={`px-2 py-1 rounded text-[11px] font-bold border transition-colors ${
                                        isAvail
                                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                          : 'bg-rose-50 text-rose-400 border-rose-200 line-through'
                                      }`}
                                      title={isAvail ? 'Disponible' : 'Indisponible'}
                                    >
                                      {size}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t">
                        <button
                          onClick={() => setEditingArticle(null)}
                          className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={handleSaveArticle}
                          className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800"
                        >
                          Enregistrer l'article
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {adminTab === 'ops' && (
              <OpsAdminPanel
                onCatalogPricesChanged={() => {
                  const next = getStoredCatalog();
                  setCatalog(next);
                  onCatalogUpdated(next);
                }}
              />
            )}

            {/* TAB 4: INFORMATIONS ENTREPRISE & VITRINE D'ACCUEIL */}
            {adminTab === 'company' && (
              <CompanyInfoEditor
                onPreviewVitrine={onClose}
              />
            )}
          </div>
        )}
      </div>

      {/* PRINTABLE WORKSHOP PRODUCTION TICKET MODAL */}
      {showProductionTicket && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl space-y-6 text-xs text-slate-900 print:m-0 print:p-0">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">
                  FICHE DE FABRICATION ATELIER
                </h2>
                <p className="text-slate-500 font-mono mt-0.5">
                  COMMANDE #{selectedOrder.reference} · GHENIX ATELIER
                </p>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900 block">
                  Date : {new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR')}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(selectedOrder.status).color}`}>
                  {getStatusBadge(selectedOrder.status).label}
                </span>
              </div>
            </div>

            {/* Customer & Shipping */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="font-bold text-slate-800">CLIENT :</p>
                <p>{selectedOrder.customer.fullName}</p>
                <p>{selectedOrder.customer.phone}</p>
                <p>{selectedOrder.customer.email}</p>
              </div>
              <div>
                <p className="font-bold text-slate-800">EXPÉDITION / RETRAIT :</p>
                <p>
                  {selectedOrder.customer.deliveryMethod === 'workshop_pickup'
                    ? 'Retrait sur place (Atelier Ghenix)'
                    : 'Colissimo / Livraison'}
                </p>
                {selectedOrder.customer.notes && (
                  <p className="text-amber-800 font-medium mt-1">Note : {selectedOrder.customer.notes}</p>
                )}
              </div>
            </div>

            {/* Production Items */}
            <div className="space-y-3">
              <p className="font-bold text-slate-900 uppercase tracking-wider">
                ARTICLES À IMPRIMER ({selectedOrder.items.length}) :
              </p>
              <div className="border rounded-xl divide-y">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{item.article.name}</span>
                      <span className="font-mono font-bold bg-slate-100 px-2.5 py-1 rounded-lg">
                        QUANTITÉ : {item.quantity} pièces
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-slate-700">
                      <div>Taille : <strong>{item.size}</strong></div>
                      <div>Couleur : <strong>{item.color.name}</strong> ({item.color.hex})</div>
                      <div>Technique : <strong>{item.technique.name}</strong></div>
                    </div>
                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg">
                      Marquage : {item.design.front.elements.length} élément(s) devant · {item.design.back.elements.length} élément(s) dos
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Print & Close Controls */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t print:hidden">
              <button
                onClick={() => setShowProductionTicket(false)}
                className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900"
              >
                Fermer
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer la fiche atelier</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
