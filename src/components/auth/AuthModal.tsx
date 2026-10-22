import React, { useState } from 'react';
import {
  X,
  User,
  Shield,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  Building2,
  CheckCircle2,
  Download,
  Bookmark,
  ShoppingBag
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types/auth';
import { loginQuick, loginWithCredentials } from '../../services/authService';

export type AuthReason = 'download' | 'save' | 'order' | 'admin' | 'general';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: AuthReason;
  onSuccess?: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  reason = 'general',
  onSuccess
}) => {
  const [tab, setTab] = useState<'quick' | 'form'>('quick');
  const [role, setRole] = useState<UserRole>(reason === 'admin' ? 'admin' : 'client');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickLogin = (selectedRole: UserRole) => {
    const user = loginQuick(selectedRole);
    if (onSuccess) onSuccess(user);
    onClose();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (role === 'admin' && adminPin.trim() !== 'atelier2026' && adminPin.trim() !== 'admin') {
      setErrorMsg('Code de sécurité administrateur incorrect (code : atelier2026)');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Veuillez saisir une adresse email valide.');
      return;
    }

    const user = loginWithCredentials(
      name || (role === 'admin' ? 'Administrateur Atelier' : 'Client Atelier'),
      email,
      role,
      company
    );
    if (onSuccess) onSuccess(user);
    onClose();
  };

  const getReasonBadge = () => {
    switch (reason) {
      case 'download':
        return {
          icon: <Download className="w-4 h-4 text-blue-500" />,
          title: 'Téléchargement de vos fichiers',
          desc: 'Connectez-vous pour exporter vos fichiers d\'impression 300 DPI et vos rendus 3D.'
        };
      case 'save':
        return {
          icon: <Bookmark className="w-4 h-4 text-amber-500" />,
          title: 'Sauvegarde de votre création',
          desc: 'Identifiez-vous pour conserver votre projet textile dans votre espace personnel.'
        };
      case 'order':
        return {
          icon: <ShoppingBag className="w-4 h-4 text-emerald-500" />,
          title: 'Finalisation de votre commande',
          desc: 'Accédez à votre compte pour préremplir vos coordonnées et suivre votre colis.'
        };
      case 'admin':
        return {
          icon: <Shield className="w-4 h-4 text-amber-500" />,
          title: 'Accès Console Administration',
          desc: 'Veuillez vous authentifier en tant que gestionnaire ou chef d\'atelier.'
        };
      default:
        return {
          icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
          title: 'Espace Compte Ghenix Atelier',
          desc: 'Accédez à l\'ensemble des outils de création, mockups 3D et suivi de production.'
        };
    }
  };

  const badgeInfo = getReasonBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <h3 className="font-bold text-sm tracking-tight">GHENIX ATELIER — AUTHENTIFICATION</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CONTEXT REASON BANNER */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-start gap-3">
          <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200 shrink-0">
            {badgeInfo.icon}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">{badgeInfo.title}</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{badgeInfo.desc}</p>
          </div>
        </div>

        {/* TABS */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTab('quick')}
              className={`py-2 rounded-lg transition-all ${
                tab === 'quick'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Connexion Rapide (1-Clic)
            </button>
            <button
              type="button"
              onClick={() => setTab('form')}
              className={`py-2 rounded-lg transition-all ${
                tab === 'form'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Saisie personnalisée
            </button>
          </div>

          {tab === 'quick' ? (
            /* QUICK 1-CLICK DEMO LOGIN */
            <div className="space-y-3">
              <p className="text-[11px] text-slate-500 text-center">
                Choisissez un profil pour continuer instantanément sans saisie :
              </p>

              {/* CLIENT OPTION */}
              <button
                type="button"
                onClick={() => handleQuickLogin('client')}
                className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-slate-800 hover:bg-slate-50 transition-all flex items-center justify-between group shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                    <User className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">Compte Client</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.2 rounded-full border border-slate-200">
                        Client Particulier & Pro
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Alexandre Dumas (Studio Pulse Textile)
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* ADMIN OPTION */}
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="w-full text-left p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/30 hover:border-amber-400 hover:bg-amber-50/70 transition-all flex items-center justify-between group shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                    <Shield className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">Chef d'Atelier (Admin)</span>
                      <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.2 rounded-full border border-amber-200">
                        Gestion complète
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Marc Delorme • Accès commandes & vitrine
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-700 group-hover:text-amber-900 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('livreur')}
                className="w-full text-left p-3.5 rounded-xl border border-sky-200 hover:border-sky-500 hover:bg-sky-50 transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900">Livreur</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Léa Martin · tournées attribuées</p>
                </div>
                <ArrowRight className="w-4 h-4 text-sky-600" />
              </button>
            </div>
          ) : (
            /* MANUAL FORM */
            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Type de profil :
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('client')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      role === 'client'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Compte Client</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      role === 'admin'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>Administrateur</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('livreur')}
                    className={`py-2 px-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                      role === 'livreur'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Livreur</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nom complet :
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex : Sarah Laurent"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Adresse Email :
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@exemple.com"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  required
                />
              </div>

              {role === 'client' && (
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Entreprise ou Marque (facultatif) :
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Ex : Pulse Studio"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              )}

              {role === 'admin' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-900 mb-1">
                    Code d'accès administrateur :
                  </label>
                  <input
                    type="password"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    placeholder="Code atelier (ex : atelier2026)"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Code atelier démo : atelier2026</p>
                </div>
              )}

              {errorMsg && (
                <p className="text-xs text-rose-600 font-semibold mt-2">{errorMsg}</p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs mt-3"
              >
                Valider & Continuer
              </button>
            </form>
          )}

          <div className="pt-2 text-center border-t border-slate-100">
            <p className="text-[10px] text-slate-400">
              Ghenix Atelier garantit la protection de vos données et le respect de votre vie privée.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
