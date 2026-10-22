import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CartItem, CustomerDetails, Order } from '../../types';
import { generateOrderReference } from '../../services/storage';
import { placeLinkedOrder, quoteTotals } from '../../services/accountOps';
import { setCurrentUser } from '../../services/authService';
import { UserProfile } from '../../types/auth';
import {
  X,
  CheckCircle2,
  Truck,
  Building2,
  Phone,
  Mail,
  User,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  FileText,
  Clock,
  Printer,
  Sparkles
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderSuccess: (order: Order) => void;
  currentUser?: UserProfile | null;
  onRequestAuth?: (reason: 'order') => void;
}

type CheckoutStep = 'review' | 'details' | 'shipping' | 'confirmation';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onOrderSuccess,
  currentUser,
  onRequestAuth
}) => {
  const [step, setStep] = useState<CheckoutStep>('review');
  const [customer, setCustomer] = useState<CustomerDetails>({
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    company: currentUser?.company || '',
    deliveryMethod: 'workshop_pickup',
    address: {
      street: '',
      zipCode: '',
      city: '',
      country: 'France'
    },
    notes: ''
  });

  // Auto populate customer details when user logs in
  useEffect(() => {
    if (currentUser) {
      setCustomer((prev) => ({
        ...prev,
        fullName: prev.fullName || currentUser.name,
        email: prev.email || currentUser.email,
        phone: prev.phone || currentUser.phone || '',
        company: prev.company || currentUser.company || ''
      }));
    }
  }, [currentUser, isOpen]);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const quote = quoteTotals(cartItems, customer.deliveryMethod);
  const { subtotal, shippingCost, extras, tax, total, vatRate } = quote;

  // Validation
  const validateDetails = () => {
    if (!customer.fullName.trim() || !customer.email.trim() || !customer.phone.trim()) {
      setErrorMsg('Veuillez renseigner votre nom, email et numéro de téléphone.');
      return false;
    }
    if (customer.deliveryMethod !== 'workshop_pickup') {
      if (!customer.address?.street || !customer.address?.zipCode || !customer.address?.city) {
        setErrorMsg('Veuillez renseigner l’adresse complète de livraison.');
        return false;
      }
    }
    setErrorMsg(null);
    return true;
  };

  const handleConfirmOrder = () => {
    if (!validateDetails()) return;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      reference: generateOrderReference(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending_confirmation',
      customer,
      items: [...cartItems],
      subtotal,
      shippingCost,
      tax,
      total,
      history: [
        {
          timestamp: new Date().toISOString(),
          status: 'pending_confirmation',
          note: 'Commande transmise avec succès à l’atelier d’impression textile.',
          author: 'Client (Web)'
        }
      ],
      internalNotes: customer.notes || '',
      productionFilesReady: true
    };

    const { order: saved, user } = placeLinkedOrder(newOrder, customer);
    if (!currentUser || currentUser.role !== 'admin') {
      setCurrentUser(user.role === 'admin' ? currentUser || user : user);
    }
    setConfirmedOrder(saved);
    setStep('confirmation');
    onOrderSuccess(saved);

    // Fire celebratory confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Commande Directe Atelier Textile
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Étape {step === 'review' ? '1/3 : Panier' : step === 'details' ? '2/3 : Coordonnées' : step === 'shipping' ? '3/3 : Validation' : 'Confirmée'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ERROR NOTICE */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
            {errorMsg}
          </div>
        )}

        {/* STEP BODY */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {/* --- STEP 1: REVIEW --- */}
          {step === 'review' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Récapitulatif des pièces à confectionner ({cartItems.length})
              </h4>
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{item.article.name}</p>
                      <p className="text-slate-500 text-[11px]">
                        Taille {item.size} · Couleur {item.color.name} · {item.technique.name} · Qté : {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900 font-mono text-sm">
                      {item.totalPrice.toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
                <Printer className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  Chaque pièce sera vérifiée par notre équipe de sérigraphes et préparateurs avant lancement en machine.
                </span>
              </div>
            </div>
          )}

          {/* --- STEP 2: CUSTOMER DETAILS --- */}
          {step === 'details' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Vos Coordonnées Professionnelles ou Particulier
                </h4>
                {!currentUser && onRequestAuth && (
                  <button
                    type="button"
                    onClick={() => onRequestAuth('order')}
                    className="text-[11px] text-amber-700 bg-amber-50 hover:bg-amber-100 font-bold px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Connexion rapide (1-clic)</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Nom & Prénom *
                  </label>
                  <input
                    type="text"
                    value={customer.fullName}
                    onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    placeholder="Ex: Camille Dubois"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Société / Club (Optionnel)
                  </label>
                  <input
                    type="text"
                    value={customer.company}
                    onChange={(e) => setCustomer({ ...customer, company: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    placeholder="Ex: Agence Horizon"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Adresse Email *
                  </label>
                  <input
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    placeholder="camille@exemple.com"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    placeholder="06 00 00 00 00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Consignes d'impression ou instructions atelier
                </label>
                <textarea
                  value={customer.notes}
                  onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  placeholder="Ex : Centrage logo 5cm sous le col, date limite souhaitée..."
                />
              </div>
            </div>
          )}

          {/* --- STEP 3: SHIPPING & FINAL VERIFICATION --- */}
          {step === 'shipping' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Mode de Réception
              </h4>

              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all hover:bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      checked={customer.deliveryMethod === 'workshop_pickup'}
                      onChange={() => setCustomer({ ...customer, deliveryMethod: 'workshop_pickup' })}
                      className="accent-slate-900"
                    />
                    <div>
                      <p className="font-bold text-slate-900">Retrait à l'Atelier Ghenix</p>
                      <p className="text-slate-500 text-[11px]">Disponible sous 2 à 4 jours ouvrés dès impression</p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-700">GRATUIT</span>
                </label>

                <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all hover:bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      checked={customer.deliveryMethod === 'colissimo_standard'}
                      onChange={() => setCustomer({ ...customer, deliveryMethod: 'colissimo_standard' })}
                      className="accent-slate-900"
                    />
                    <div>
                      <p className="font-bold text-slate-900">Livraison Colissimo Suivi</p>
                      <p className="text-slate-500 text-[11px]">Livraison à domicile avec suivi 48h</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 font-mono">7.90 €</span>
                </label>

                <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all hover:bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      checked={customer.deliveryMethod === 'express_carrier'}
                      onChange={() => setCustomer({ ...customer, deliveryMethod: 'express_carrier' })}
                      className="accent-slate-900"
                    />
                    <div>
                      <p className="font-bold text-slate-900">Transporteur Express 24h</p>
                      <p className="text-slate-500 text-[11px]">Livraison prioritaire garantie</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 font-mono">14.50 €</span>
                </label>
              </div>

              {/* Delivery Address fields if not pickup */}
              {customer.deliveryMethod !== 'workshop_pickup' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <p className="font-bold text-slate-800">Adresse de Livraison :</p>
                  <input
                    type="text"
                    placeholder="Rue et numéro"
                    value={customer.address?.street || ''}
                    onChange={(e) =>
                      setCustomer({
                        ...customer,
                        address: { ...customer.address!, street: e.target.value }
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Code Postal"
                      value={customer.address?.zipCode || ''}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          address: { ...customer.address!, zipCode: e.target.value }
                        })
                      }
                      className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Ville"
                      value={customer.address?.city || ''}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          address: { ...customer.address!, city: e.target.value }
                        })
                      }
                      className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                </div>
              )}

              {/* TOTALS RECAP */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-1.5">
                <div className="flex justify-between text-slate-300">
                  <span>Sous-total HT</span>
                  <span className="font-mono">{subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Livraison</span>
                  <span className="font-mono">{shippingCost.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Frais</span>
                  <span className="font-mono">{extras.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>TVA ({Math.round(vatRate * 100)}%)</span>
                  <span className="font-mono">{tax.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between font-bold text-base text-white pt-2 border-t border-white/20">
                  <span>Total TTC à régler</span>
                  <span className="font-mono text-amber-400">{total.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          )}

          {/* --- STEP 4: ORDER CONFIRMED --- */}
          {step === 'confirmation' && confirmedOrder && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-lg font-extrabold text-slate-900">
                  Commande Transmise à l'Atelier !
                </h4>
                <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                  Votre compte reprend cette commande, l'historique et le suivi (préparation, livraison ou retrait magasin).
                </p>
              </div>

              <div className="inline-block p-3 px-6 bg-slate-100 rounded-xl border border-slate-200 font-mono text-base font-black text-slate-900 tracking-wider">
                {confirmedOrder.reference}
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 max-w-md mx-auto text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Statut initial :</span>
                  <span className="font-bold text-amber-700">En attente de confirmation</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Client :</span>
                  <span className="font-medium text-slate-800">{confirmedOrder.customer.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Montant :</span>
                  <span className="font-bold font-mono text-slate-900">{confirmedOrder.total.toFixed(2)} € TTC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Réception :</span>
                  <span className="text-slate-800">
                    {confirmedOrder.customer.deliveryMethod === 'workshop_pickup' ? 'Retrait atelier' : 'Livraison'}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                Vous recevrez une confirmation et pourrez suivre l'avancement via l'onglet « Suivi Commande ».
              </p>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
          {step === 'review' && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900"
              >
                Retour
              </button>
              <button
                onClick={() => setStep('details')}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-xs"
              >
                <span>Étape suivante : Coordonnées</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 'details' && (
            <>
              <button
                onClick={() => setStep('review')}
                className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Panier</span>
              </button>
              <button
                onClick={() => {
                  if (validateDetails()) setStep('shipping');
                }}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-xs"
              >
                <span>Étape suivante : Livraison</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 'shipping' && (
            <>
              <button
                onClick={() => setStep('details')}
                className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Coordonnées</span>
              </button>
              <button
                onClick={handleConfirmOrder}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmer et transmettre la commande</span>
              </button>
            </>
          )}

          {step === 'confirmation' && (
            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
            >
              Terminer et revenir au configurateur
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
