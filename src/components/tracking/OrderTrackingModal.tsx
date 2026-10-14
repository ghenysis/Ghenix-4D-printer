import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types';
import { getStoredOrders } from '../../services/storage';
import {
  X,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  Package,
  Truck,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose
}) => {
  const [refInput, setRefInput] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = refInput.trim().toUpperCase();
    if (!clean) return;

    const orders = getStoredOrders();
    const match = orders.find(
      (o) => o.reference.toUpperCase() === clean || o.id.toUpperCase() === clean
    );

    if (match) {
      setSearchedOrder(match);
      setNotFound(false);
    } else {
      setSearchedOrder(null);
      setNotFound(true);
    }
  };

  const STEPS: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
    { status: 'pending_confirmation', label: 'Enregistrée', icon: Clock },
    { status: 'confirmed', label: 'Validée PAO', icon: ShieldCheck },
    { status: 'in_preparation', label: 'Préparation textile', icon: Package },
    { status: 'printing', label: 'Impression en atelier', icon: Printer },
    { status: 'quality_check', label: 'Contrôle qualité', icon: CheckCircle2 },
    { status: 'ready', label: 'Prête', icon: Package },
    { status: 'shipped', label: 'Expédiée / Retrait', icon: Truck }
  ];

  const getStepIndex = (status: OrderStatus) => {
    const idx = STEPS.findIndex((s) => s.status === status);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Suivi d'Avancement de Production Textile
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Consultez en temps réel l'état de fabrication de vos vêtements imprimés.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SEARCH FORM */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
              placeholder="Réf. commande (ex: GHX-2026-1042)"
              className="w-full pl-9 pr-3 py-2 text-xs font-mono uppercase border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shrink-0 shadow-xs"
          >
            Rechercher
          </button>
        </form>

        {notFound && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Aucune commande ne correspond à cette référence. Vérifiez la saisie.</span>
          </div>
        )}

        {/* ORDER DETAILS & TIMELINE */}
        {searchedOrder && (
          <div className="space-y-4 pt-2 border-t border-slate-100 text-xs">
            {/* Summary strip */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {searchedOrder.reference}
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Client : {searchedOrder.customer.fullName} · {searchedOrder.items.length} article(s)
                </p>
              </div>
              <span className="font-mono font-bold text-slate-900">
                {searchedOrder.total.toFixed(2)} € TTC
              </span>
            </div>

            {/* Production Progress Timeline */}
            <div className="py-2 space-y-3">
              <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Statut de fabrication à l'atelier
              </p>

              <div className="space-y-2">
                {STEPS.map((step, idx) => {
                  const currentIdx = getStepIndex(searchedOrder.status);
                  const isDone = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;
                  const Icon = step.icon as React.ComponentType<{ className?: string }>;

                  return (
                    <div
                      key={step.status}
                      className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
                        isCurrent
                          ? 'bg-amber-500/10 border border-amber-500/30 font-bold text-amber-900'
                          : isDone
                          ? 'text-slate-800'
                          : 'text-slate-400 opacity-60'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isDone
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <span className="text-xs">{step.label}</span>
                      </div>
                      {isCurrent && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-500 text-slate-950 rounded-md">
                          En cours
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery / Reception Note */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[11px]">
              {searchedOrder.customer.deliveryMethod === 'workshop_pickup' ? (
                <span>
                  Mode de retrait : À l'Atelier Ghenix. Vous recevrez une notification dès que la commande sera marquée « Prête ».
                </span>
              ) : (
                <span>
                  Mode d'expédition : Livraison à domicile. Le numéro de suivi transporteur sera transmis dès l'expédition.
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
