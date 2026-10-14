import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Box,
  Layers,
  Shield,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  LogOut,
  Printer,
  ChevronRight,
  Search,
  Camera
} from 'lucide-react';
import { UserProfile } from '../../types/auth';
import { CompanyInfo } from '../../types/auth';
import { getCompanyInfo, subscribeToCompanyInfo } from '../../services/companyService';
import { logout } from '../../services/authService';

interface LandingPageProps {
  currentUser: UserProfile | null;
  onOpenStudio: () => void;
  onOpenRenderEngine: () => void;
  onOpenAdmin: () => void;
  onOpenAuth: (reason?: 'general' | 'admin' | 'order' | 'download') => void;
  onOpenTracking: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  currentUser,
  onOpenStudio,
  onOpenRenderEngine,
  onOpenAdmin,
  onOpenAuth,
  onOpenTracking
}) => {
  const [company, setCompany] = useState<CompanyInfo>(getCompanyInfo);

  useEffect(() => {
    const unsubscribe = subscribeToCompanyInfo((newInfo) => {
      setCompany(newInfo);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      {/* 1. DYNAMIC TOP ANNOUNCEMENT BANNER */}
      {company.announcement.enabled && (
        <div className="bg-slate-900 text-white px-4 py-2 text-xs font-medium text-center flex items-center justify-center gap-2 border-b border-slate-800">
          <span className="px-2 py-0.5 bg-amber-500 text-slate-950 rounded text-[10px] uppercase tracking-wider font-extrabold shrink-0">
            {company.announcement.badge || 'INFO'}
          </span>
          <span className="line-clamp-1 text-slate-200">{company.announcement.text}</span>
          <button
            onClick={onOpenRenderEngine}
            className="hidden sm:inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold ml-1 transition-colors"
          >
            <span>{company.announcement.actionLabel || 'Tester maintenant'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* 2. MAIN NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* LOGO & TITLE */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 text-left hover:opacity-85 transition-opacity"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm sm:text-base tracking-tight text-slate-900 uppercase">
                  {company.name}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-1 hidden xs:block font-medium">
                Studio de Personnalisation Textile & Rendu 3D
              </p>
            </div>
          </button>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-600">
          <a href="#solutions" className="hover:text-slate-900 transition-colors">
            Fonctionnalités
          </a>
          <a href="#about" className="hover:text-slate-900 transition-colors">
            Qui Sommes-Nous
          </a>
          <a href="#stats" className="hover:text-slate-900 transition-colors">
            Chiffres Clés
          </a>
          <a href="#contact" className="hover:text-slate-900 transition-colors">
            Contact
          </a>
          <button
            onClick={onOpenTracking}
            className="flex items-center gap-1 hover:text-slate-900 transition-colors"
          >
            <Search className="w-3 h-3 text-slate-400" />
            <span>Suivi Commande</span>
          </button>
        </nav>

        {/* AUTHENTICATION & QUICK ROLE ACTIONS */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl p-1 pr-2.5">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                  currentUser.role === 'admin'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-900 text-white'
                }`}
              >
                {currentUser.role === 'admin' ? (
                  <Shield className="w-3.5 h-3.5" />
                ) : (
                  <User className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-900 line-clamp-1">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-slate-500">
                  {currentUser.role === 'admin' ? 'Chef d\'Atelier' : 'Client Atelier'}
                </p>
              </div>

              {currentUser.role === 'admin' ? (
                <button
                  onClick={onOpenAdmin}
                  className="ml-1.5 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 shadow-xs"
                >
                  <Shield className="w-3 h-3" />
                  <span className="hidden md:inline">Console Admin</span>
                </button>
              ) : (
                <button
                  onClick={onOpenStudio}
                  className="ml-1.5 px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <Box className="w-3 h-3 text-amber-500" />
                  <span className="hidden md:inline">Mon Studio</span>
                </button>
              )}

              <button
                onClick={() => logout()}
                className="p-1 text-slate-400 hover:text-rose-600 transition-colors ml-0.5"
                title="Déconnexion"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth('general')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Connexion</span>
            </button>
          )}

          {/* STUDIO LAUNCH BUTTON */}
          <button
            onClick={onOpenStudio}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs active:scale-95"
          >
            <Box className="w-3.5 h-3.5 text-amber-400" />
            <span>Ouvrir l'Atelier</span>
          </button>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative px-4 sm:px-8 pt-12 pb-16 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-10">
        {/* HERO LEFT TEXT */}
        <div className="flex-1 space-y-5 z-10 text-center lg:text-left">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>{company.badge}</span>
          </div>

          {/* Main Title & Tagline */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
              {company.name}
            </h1>
            <p className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-slate-800 leading-snug">
              {company.tagline}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed pt-1">
              {company.description}
            </p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <button
              onClick={onOpenStudio}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors shadow-xs active:scale-95"
            >
              <Box className="w-4 h-4 text-amber-400" />
              <span>Lancer le Studio Créatif (Atelier 3D)</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={onOpenRenderEngine}
              className="px-4 py-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Moteur de Rendu 3D & Mockups API</span>
            </button>

            {currentUser?.role === 'admin' ? (
              <button
                onClick={onOpenAdmin}
                className="px-4 py-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors"
              >
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Console de Gestion Admin</span>
              </button>
            ) : (
              <button
                onClick={() => onOpenAuth('admin')}
                className="px-3.5 py-3 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>Espace Administrateur</span>
              </button>
            )}
          </div>

          {/* TRUST BADGES */}
          <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Zéro minimum de commande</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Rendu 3D temps réel 360°</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Cotons Biologiques Certifiés GOTS</span>
            </div>
          </div>
        </div>

        {/* HERO RIGHT: TEASER CARD */}
        <div className="w-full max-w-md lg:max-w-none lg:w-[420px] z-10 shrink-0">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                <span className="text-[11px] font-mono text-slate-400 ml-1.5">atelier-ghenix-3d</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold text-[10px] border border-amber-200">
                360° DYNAMIQUE
              </span>
            </div>

            {/* Visual mock stage */}
            <div className="py-6 flex flex-col items-center justify-center relative">
              <div className="w-44 h-48 bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center relative shadow-inner">
                {/* Silhouette T-shirt icon / representation */}
                <div className="w-28 h-32 bg-white rounded-lg flex flex-col items-center justify-center relative p-3 border border-slate-200 shadow-xs">
                  <div className="w-10 h-2 bg-slate-200 rounded-b-full mb-2" />
                  <div className="w-16 h-10 border border-dashed border-amber-500/80 rounded flex items-center justify-center bg-amber-50/50">
                    <span className="text-[10px] font-black tracking-wider text-slate-900">
                      GHENIX
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-500 mt-2 font-mono">Heavyweight 240g</div>
                </div>

                {/* Floating Badges */}
                <div className="absolute -top-2 -right-2 px-2 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-extrabold shadow-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>DTG 300 DPI</span>
                </div>
                <div className="absolute -bottom-2 -left-2 px-2 py-1 bg-amber-500 text-slate-950 rounded-lg text-[10px] font-black shadow-xs flex items-center gap-1">
                  <Box className="w-3 h-3" />
                  <span>Studio 360°</span>
                </div>
              </div>
            </div>

            {/* Action Buttons inside Card */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                onClick={onOpenStudio}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Accéder au Configurateur Visuel</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={onOpenRenderEngine}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5 text-slate-600" />
                <span>Tester le Studio Mockup Multi-Angles</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION: LES 4 SOLUTIONS & UTILITÉ DE L'APPLICATION */}
      <section id="solutions" className="px-4 sm:px-8 py-16 bg-white border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider">
              Une Plateforme Complète
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              L'Utilité & Les Outils de l'Atelier
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Du prototypage visuel 3D immédiat à la livraison de vos textiles brodés et imprimés avec précision artisanale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Studio 2D / 3D */}
            <div
              onClick={onOpenStudio}
              className="bg-slate-50 hover:bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-900 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
                  <Box className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                  Studio Créatif 3D
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Positionnez vos logos, typographies et designs au millimètre. Aperçu 3D temps réel avec effet de vent, rotation libre et contrôle des faces recto/verso.
                </p>
              </div>
              <div className="pt-3 flex items-center gap-1 text-xs font-bold text-slate-900 group-hover:text-amber-600">
                <span>Ouvrir l'éditeur</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 2. Moteur Mockup & API */}
            <div
              onClick={onOpenRenderEngine}
              className="bg-slate-50 hover:bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-900 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                  Moteur de Rendu & API
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Uploadez une image et obtenez instantanément 5 angles de mockups studio (Face, Dos, 3/4, Macro) avec console API et code embed 360° pour vos sites.
                </p>
              </div>
              <div className="pt-3 flex items-center gap-1 text-xs font-bold text-slate-900 group-hover:text-amber-600">
                <span>Tester le moteur 3D</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 3. Impression Industrielle & Broderie */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-900 flex items-center justify-center font-bold shadow-2xs">
                  <Printer className="w-5 h-5 text-slate-800" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Marquage & Broderie
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Impression numérique directe (DTG) haute résolution, broderie de précision, sérigraphie textile et flex thermocollant. Rendu durable et fidèle.
                </p>
              </div>
              <div className="pt-3 flex items-center gap-1 text-xs font-semibold text-emerald-700">
                <span>Atelier Français certifié</span>
              </div>
            </div>

            {/* 4. Suivi d'Atelier Transparent */}
            <div
              onClick={onOpenTracking}
              className="bg-slate-50 hover:bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-900 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5 text-slate-800" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                  Suivi de Commande
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Suivez en direct chaque étape de la fabrication : préparation du fichier, impression en atelier, contrôle qualité et expédition sécurisée.
                </p>
              </div>
              <div className="pt-3 flex items-center gap-1 text-xs font-bold text-slate-900 group-hover:text-amber-600">
                <span>Consulter une commande</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION: QUI SOMMES-NOUS (100% DYNAMIQUE GÉRÉE PAR L'ADMIN) */}
      <section id="about" className="px-4 sm:px-8 py-16 max-w-7xl mx-auto w-full space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold uppercase tracking-wider">
              Qui Sommes-Nous
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {company.aboutTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {company.aboutParagraph1}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {company.aboutParagraph2}
            </p>

            <div className="pt-1">
              <button
                onClick={onOpenStudio}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors shadow-xs"
              >
                <span>Créer Votre Premier Projet</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* 4 DYNAMIC COMMITMENTS */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {company.commitments.map((com) => (
              <div
                key={com.id}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-2 shadow-2xs hover:shadow-sm transition-shadow"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">{com.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {com.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SECTION: STATISTIQUES CLÉS DE L'ATELIER (100% DYNAMIQUE) */}
      <section id="stats" className="px-4 sm:px-8 py-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {company.stats.map((stat) => (
              <div key={stat.id} className="space-y-1">
                <p className="text-2xl sm:text-4xl font-black text-amber-400 tracking-tight font-mono">
                  {stat.value}
                </p>
                <p className="text-xs font-bold text-white">{stat.label}</p>
                <p className="text-[11px] text-slate-400">{stat.helper}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. SECTION: COORDONNÉES DE L'ATELIER (100% DYNAMIQUE) */}
      <section id="contact" className="px-4 sm:px-8 py-14 max-w-7xl mx-auto w-full">
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider">
              Atelier & Visites
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Une Question ou Un Projet Sur Mesure ?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Nos artisans et techniciens textiles sont à votre écoute pour vous conseiller sur les meilleures techniques de marquage et les grammages adaptés à votre marque.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700 pt-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{company.contact.address}, {company.contact.city}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{company.contact.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{company.contact.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{company.contact.hours}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full sm:w-auto shrink-0">
            <button
              onClick={onOpenStudio}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Box className="w-3.5 h-3.5 text-amber-400" />
              <span>Démarrer une Création</span>
            </button>

            <button
              onClick={onOpenRenderEngine}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-slate-600" />
              <span>Studio Mockup 3D</span>
            </button>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="mt-auto bg-white border-t border-slate-200 px-4 sm:px-8 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="font-bold text-slate-900">{company.name}</span>
            <span>—</span>
            <span>Atelier de Confection Textile & Rendu 3D &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-600">
            <button onClick={onOpenStudio} className="hover:text-slate-900 transition-colors">
              Studio Créatif
            </button>
            <button onClick={onOpenRenderEngine} className="hover:text-slate-900 transition-colors">
              Moteur 3D
            </button>
            <button onClick={onOpenTracking} className="hover:text-slate-900 transition-colors">
              Suivi
            </button>
            {currentUser?.role === 'admin' ? (
              <button onClick={onOpenAdmin} className="text-amber-700 font-bold hover:underline">
                Administration
              </button>
            ) : (
              <button onClick={() => onOpenAuth('admin')} className="hover:text-slate-900 transition-colors">
                Accès Admin
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
