import React, { useState } from 'react';
import {
  Save,
  RotateCcw,
  CheckCircle2,
  Building2,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Clock,
  Megaphone,
  BarChart3,
  ShieldCheck,
  Plus,
  Trash2,
  Eye
} from 'lucide-react';
import { CompanyInfo } from '../../types/auth';
import { getCompanyInfo, saveCompanyInfo, resetCompanyInfo } from '../../services/companyService';

interface CompanyInfoEditorProps {
  onSavedNotification?: () => void;
  onPreviewVitrine?: () => void;
}

export const CompanyInfoEditor: React.FC<CompanyInfoEditorProps> = ({
  onSavedNotification,
  onPreviewVitrine
}) => {
  const [info, setInfo] = useState<CompanyInfo>(getCompanyInfo);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveCompanyInfo(info);
    setSavedSuccess(true);
    if (onSavedNotification) onSavedNotification();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Voulez-vous réinitialiser les informations de la vitrine aux valeurs d\'origine ?')) {
      const reset = resetCompanyInfo();
      setInfo(reset);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const handleStatChange = (id: string, field: 'label' | 'value' | 'helper', val: string) => {
    setInfo((prev) => ({
      ...prev,
      stats: prev.stats.map((s) => (s.id === id ? { ...s, [field]: val } : s))
    }));
  };

  const handleCommitmentChange = (id: string, field: 'title' | 'description', val: string) => {
    setInfo((prev) => ({
      ...prev,
      commitments: prev.commitments.map((c) => (c.id === id ? { ...c, [field]: val } : c))
    }));
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[10px] uppercase tracking-wider">
              Gestion Dynamique Sans Code
            </span>
            <span className="text-xs text-slate-400">
              Dernière mise à jour : {new Date(info.updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <h3 className="text-lg font-black text-slate-900 mt-1">
            Informations d'Entreprise & Vitrine d'Accueil
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Modifiez ici les textes, contacts, statistiques et annonces de la page d'accueil sans toucher au code source.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onPreviewVitrine && (
            <button
              type="button"
              onClick={onPreviewVitrine}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-4 h-4 text-slate-600" />
              <span>Voir la Vitrine</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors"
            title="Rétablir les valeurs par défaut"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Réinitialiser</span>
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors shadow-xs"
          >
            <Save className="w-3.5 h-3.5 text-amber-400" />
            <span>Enregistrer les Modifications</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Informations de l'entreprise et vitrine d'accueil mises à jour en direct avec succès !</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: IDENTITÉ & ACCROCHE VITRINE */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-slate-800" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              1. Identité de l'Atelier & Accroche Principale
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Nom de l'entreprise / Atelier :
              </label>
              <input
                type="text"
                value={info.name}
                onChange={(e) => setInfo({ ...info, name: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Badge d'en-tête (pill) :
              </label>
              <input
                type="text"
                value={info.badge}
                onChange={(e) => setInfo({ ...info, badge: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Slogan / Tagline :
              </label>
              <input
                type="text"
                value={info.tagline}
                onChange={(e) => setInfo({ ...info, tagline: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none font-medium"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Description de présentation (Hero) :
              </label>
              <textarea
                rows={3}
                value={info.description}
                onChange={(e) => setInfo({ ...info, description: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none leading-relaxed"
                required
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: BANDEAU PROMOTIONNEL / ACTUALITÉ */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                2. Bandeau d'Annonce & Actualité (En-tête vitrine)
              </h4>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={info.announcement.enabled}
                onChange={(e) =>
                  setInfo({
                    ...info,
                    announcement: { ...info.announcement, enabled: e.target.checked }
                  })
                }
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-4 h-4"
              />
              <span className="text-xs font-bold text-slate-800">
                {info.announcement.enabled ? 'Bandeau Actif' : 'Bandeau Masqué'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Badge d'alerte :
              </label>
              <input
                type="text"
                value={info.announcement.badge}
                onChange={(e) =>
                  setInfo({
                    ...info,
                    announcement: { ...info.announcement, badge: e.target.value }
                  })
                }
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Message d'annonce :
              </label>
              <input
                type="text"
                value={info.announcement.text}
                onChange={(e) =>
                  setInfo({
                    ...info,
                    announcement: { ...info.announcement, text: e.target.value }
                  })
                }
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: QUI SOMMES-NOUS & HISTOIRE */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              3. Présentation de l'Atelier "Qui Sommes-Nous"
            </h4>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Titre de la section :
              </label>
              <input
                type="text"
                value={info.aboutTitle}
                onChange={(e) => setInfo({ ...info, aboutTitle: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Premier paragraphe (Histoire & Valeurs) :
              </label>
              <textarea
                rows={3}
                value={info.aboutParagraph1}
                onChange={(e) => setInfo({ ...info, aboutParagraph1: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none leading-relaxed"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Deuxième paragraphe (Parc machines & Matières) :
              </label>
              <textarea
                rows={3}
                value={info.aboutParagraph2}
                onChange={(e) => setInfo({ ...info, aboutParagraph2: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none leading-relaxed"
                required
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: ENGAGEMENTS QUALITÉ */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              4. Engagements & Atouts de Confection (4 Blocs)
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {info.commitments.map((com, idx) => (
              <div key={com.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Engagement #{idx + 1}
                  </span>
                </div>
                <input
                  type="text"
                  value={com.title}
                  onChange={(e) => handleCommitmentChange(com.id, 'title', e.target.value)}
                  placeholder="Titre de l'engagement"
                  className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 bg-white"
                />
                <textarea
                  rows={2}
                  value={com.description}
                  onChange={(e) => handleCommitmentChange(com.id, 'description', e.target.value)}
                  placeholder="Description détaillée"
                  className="w-full px-2.5 py-1.5 text-[11px] border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 bg-white"
                />
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 5: STATISTIQUES CLÉS DE L'ATELIER */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <BarChart3 className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              5. Chiffres Clés & Statistiques Dynamiques (Affichés en vitrine)
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {info.stats.map((stat) => (
              <div key={stat.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Valeur :</label>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => handleStatChange(stat.id, 'value', e.target.value)}
                    className="w-full px-2 py-1 text-sm font-black text-slate-900 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Libellé :</label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => handleStatChange(stat.id, 'label', e.target.value)}
                    className="w-full px-2 py-1 text-xs font-bold text-slate-700 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Complément :</label>
                  <input
                    type="text"
                    value={stat.helper}
                    onChange={(e) => handleStatChange(stat.id, 'helper', e.target.value)}
                    className="w-full px-2 py-1 text-[11px] text-slate-500 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 6: COORDONNÉES DE CONTACT & HORAIRES */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="w-4 h-4 text-rose-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              6. Coordonnées de Contact & Horaires d'Ouverture
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Adresse Email :</span>
              </label>
              <input
                type="email"
                value={info.contact.email}
                onChange={(e) =>
                  setInfo({
                    ...info,
                    contact: { ...info.contact, email: e.target.value }
                  })
                }
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Numéro de Téléphone :</span>
              </label>
              <input
                type="text"
                value={info.contact.phone}
                onChange={(e) =>
                  setInfo({
                    ...info,
                    contact: { ...info.contact, phone: e.target.value }
                  })
                }
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Adresse de l'Atelier :</span>
              </label>
              <input
                type="text"
                value={info.contact.address}
                onChange={(e) =>
                  setInfo({
                    ...info,
                    contact: { ...info.contact, address: e.target.value }
                  })
                }
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Code Postal & Ville :</span>
              </label>
              <input
                type="text"
                value={info.contact.city}
                onChange={(e) =>
                  setInfo({
                    ...info,
                    contact: { ...info.contact, city: e.target.value }
                  })
                }
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Horaires d'Ouverture :</span>
              </label>
              <input
                type="text"
                value={info.contact.hours}
                onChange={(e) =>
                  setInfo({
                    ...info,
                    contact: { ...info.contact, hours: e.target.value }
                  })
                }
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* BOTTOM SAVE BAR */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors"
          >
            Annuler / Rétablir
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>Enregistrer toutes les modifications</span>
          </button>
        </div>
      </form>
    </div>
  );
};
