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
  ShoppingBag,
  User,
  LogOut,
  Palette,
  Printer,
  ChevronRight,
  Search,
  ExternalLink,
  Sliders,
  Camera,
  Code
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* 1. DYNAMIC TOP ANNOUNCEMENT BANNER */}
      {company.announcement.enabled && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-inner">
          <span className="px-1.5 py-0.5 bg-slate-950 text-amber-300 rounded text-[10px] uppercase tracking-wider font-black">
            {company.announcement.badge || 'INFO'}
          </span>
          <span className="line-clamp-1">{company.announcement.text}</span>
          <button
            onClick={onOpenRenderEngine}
            className="hidden sm:inline-flex items-center gap-1 underline underline-offset-2 hover:opacity-80 transition-opacity ml-1"
          >
            <span>{company.announcement.actionLabel || 'Tester maintenant'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* 2. MAIN NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* LOGO & TITLE */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 group text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              G
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight text-white uppercase group-hover:text-amber-400 transition-colors">
                  {company.name}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-1 hidden xs:block">
                Studio de Personnalisation & Rendu 3D
              </p>
            </div>
          </button>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-300">
          <a href="#solutions" className="hover:text-white transition-colors">
            Fonctionnalités
          </a>
          <a href="#about" className="hover:text-white transition-colors">
            Qui Sommes-Nous
          </a>
          <a href="#stats" className="hover:text-white transition-colors">
            Chiffres Clés
          </a>
          <a href="#contact" className="hover:text-white transition-colors">
            Contact
          </a>
          <button
            onClick={onOpenTracking}
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <Search className="w-3 h-3 text-slate-400" />
            <span>Suivi Commande</span>
          </button>
        </nav>

        {/* AUTHENTICATION & QUICK ROLE ACTIONS */}
        <div className="flex items-center gap-2.5">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1 pr-3">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                  currentUser.role === 'admin'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {currentUser.role === 'admin' ? (
                  <Shield className="w-3.5 h-3.5" />
                ) : (
                  <User className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-white line-clamp-1">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-slate-400">
                  {currentUser.role === 'admin' ? 'Chef d\'Atelier' : 'Compte Client'}
                </p>
              </div>

              {currentUser.role === 'admin' ? (
                <button
                  onClick={onOpenAdmin}
                  className="ml-2 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Shield className="w-3 h-3" />
                  <span className="hidden md:inline">Console Admin</span>
                </button>
              ) : (
                <button
                  onClick={onOpenStudio}
                  className="ml-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <Box className="w-3 h-3 text-blue-400" />
                  <span className="hidden md:inline">Mon Studio</span>
                </button>
              )}

              <button
                onClick={() => logout()}
                className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                title="Déconnexion"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth('general')}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
            >
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>Connexion / Inscription</span>
            </button>
          )}

          {/* STUDIO LAUNCH BUTTON */}
          <button
            onClick={onOpenStudio}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 active:scale-95"
          >
            <Box className="w-3.5 h-3.5" />
            <span>Ouvrir l'Atelier</span>
          </button>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative px-4 sm:px-8 pt-12 pb-20 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* HERO LEFT TEXT */}
        <div className="flex-1 space-y-6 z-10 text-center lg:text-left">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-amber-400 text-xs font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>{company.badge}</span>
          </div>

          {/* Main Title & Tagline */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              {company.name}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 text-2xl sm:text-4xl lg:text-5xl font-extrabold mt-2">
                {company.tagline}
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              {company.description}
            </p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <button
              onClick={onOpenStudio}
              className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm rounded-xl flex items-center gap-2.5 transition-all shadow-xl shadow-amber-500/25 active:scale-95"
            >
              <Box className="w-4 h-4" />
              <span>Lancer le Studio Créatif (Atelier 3D)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenRenderEngine}
              className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-400/50 text-white font-bold text-sm rounded-xl flex items-center gap-2 transition-all shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Moteur de Rendu 3D & Mockups API</span>
            </button>

            {currentUser?.role === 'admin' ? (
              <button
                onClick={onOpenAdmin}
                className="px-4 py-3.5 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-600/50 text-amber-300 font-bold text-sm rounded-xl flex items-center gap-2 transition-all"
              >
                <Shield className="w-4 h-4" />
                <span>Console de Gestion Admin</span>
              </button>
            ) : (
              <button
                onClick={() => onOpenAuth('admin')}
                className="px-4 py-3.5 text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Espace Administrateur</span>
              </button>
            )}
          </div>

          {/* TRUST BADGES */}
          <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zéro minimum de commande</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Rendu 3D temps réel 360°</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Cotons Biologiques Certifiés GOTS</span>
            </div>
          </div>
        </div>

        {/* HERO RIGHT: INTERACTIVE PREVIEW TEASER CARD */}
        <div className="w-full max-w-md lg:max-w-none lg:w-[460px] z-10">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-mono text-slate-500 ml-2">ghenix-studio-3d</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px]">
                360° DYNAMIQUE
              </span>
            </div>

            {/* Visual mock stage */}
            <div className="py-8 flex flex-col items-center justify-center relative">
              <div className="w-44 h-52 bg-slate-800/80 rounded-2xl border border-slate-700 flex flex-col items-center justify-center shadow-inner relative group-hover:scale-105 transition-transform duration-500">
                {/* Silhouette T-shirt icon / representation */}
                <div className="w-28 h-36 bg-gradient-to-b from-slate-700 to-slate-800 rounded-lg flex flex-col items-center justify-center relative p-3 border border-slate-600/50 shadow-lg">
                  <div className="w-12 h-2.5 bg-slate-900 rounded-b-full mb-2" />
                  <div className="w-16 h-12 border-2 border-dashed border-amber-400/80 rounded flex items-center justify-center bg-amber-400/10">
                    <span className="text-[10px] font-black tracking-wider text-amber-300">
                      GHENIX
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-400 mt-2 font-mono">Heavyweight 240g</div>
                </div>

                {/* Floating Badges */}
                <div className="absolute -top-3 -right-3 px-2 py-1 bg-amber-500 text-slate-950 rounded-lg text-[10px] font-extrabold shadow-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>DTG 300 DPI</span>
                </div>
                <div className="absolute -bottom-3 -left-3 px-2 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold shadow-lg flex items-center gap-1">
                  <Box className="w-3 h-3" />
                  <span>3D Manipulation</span>
                </div>
              </div>
            </div>

            {/* Action Buttons inside Card */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <button
                onClick={onOpenStudio}
                className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-950 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Accéder au Configurateur Visuel</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenRenderEngine}
                className="w-full py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>Tester le Studio Mockup Multi-Angles</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION: LES 4 SOLUTIONS & UTILITÉ DE L'APPLICATION */}
      <section id="solutions" className="px-4 sm:px-8 py-16 bg-slate-900 border-t border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider">
              Une Plateforme Complète
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              L'Utilité & Les Outils de l'Atelier
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Du prototypage visuel 3D immédiat à la livraison de vos textiles brodés et imprimés avec précision artisanale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Studio 2D / 3D */}
            <div
              onClick={onOpenStudio}
              className="bg-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-amber-400/50 transition-all cursor-pointer group flex flex-col justify-between shadow-lg"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <Box className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                  Studio Créatif 3D
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Positionnez vos logos, typographies et designs au millimètre. Aperçu 3D temps réel avec effet de vent, rotation libre et contrôle des faces recto/verso.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-1 text-xs font-bold text-amber-400">
                <span>Ouvrir l'éditeur</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 2. Moteur Mockup & API */}
            <div
              onClick={onOpenRenderEngine}
              className="bg-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-blue-400/50 transition-all cursor-pointer group flex flex-col justify-between shadow-lg"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                  Moteur de Rendu & API
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Uploadez une image et obtenez instantanément 5 angles de mockups studio (Face, Dos, 3/4, Macro) avec console API et code embed 360° pour vos sites.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-1 text-xs font-bold text-blue-400">
                <span>Tester le moteur 3D</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 3. Impression Industrielle & Broderie */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-lg">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                  <Printer className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">
                  Marquage & Broderie
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Impression numérique directe (DTG) haute résolution, broderie de précision, sérigraphie textile et flex thermocollant. Rendu durable et fidèle.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-1 text-xs font-semibold text-emerald-400">
                <span>Atelier Français certifié</span>
              </div>
            </div>

            {/* 4. Suivi d'Atelier Transparent */}
            <div
              onClick={onOpenTracking}
              className="bg-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-purple-400/50 transition-all cursor-pointer group flex flex-col justify-between shadow-lg"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">
                  Suivi de Commande
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Suivez en direct chaque étape de la fabrication : préparation du fichier, impression en atelier, contrôle qualité et expédition sécurisée.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-1 text-xs font-bold text-purple-400">
                <span>Consulter une commande</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION: QUI SOMMES-NOUS (100% DYNAMIQUE GÉRÉE PAR L'ADMIN) */}
      <section id="about" className="px-4 sm:px-8 py-20 max-w-7xl mx-auto w-full space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-5">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider">
              Qui Sommes-Nous
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {company.aboutTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {company.aboutParagraph1}
            </p>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {company.aboutParagraph2}
            </p>

            <div className="pt-2">
              <button
                onClick={onOpenStudio}
                className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors shadow-xs"
              >
                <span>Créer Votre Premier Projet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 4 DYNAMIC COMMITMENTS */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {company.commitments.map((com) => (
              <div
                key={com.id}
                className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">{com.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {com.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SECTION: STATISTIQUES CLÉS DE L'ATELIER (100% DYNAMIQUE) */}
      <section id="stats" className="px-4 sm:px-8 py-14 bg-slate-900 border-t border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {company.stats.map((stat) => (
              <div key={stat.id} className="space-y-1">
                <p className="text-2xl sm:text-4xl font-black text-amber-400 tracking-tight">
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
      <section id="contact" className="px-4 sm:px-8 py-16 max-w-7xl mx-auto w-full">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-[11px] font-bold uppercase tracking-wider">
              Atelier & Visites
            </span>
            <h3 className="text-xl sm:text-3xl font-black text-white">
              Une Question ou Un Projet Sur Mesure ?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Nos artisans et techniciens textiles sont à votre écoute pour vous conseiller sur les meilleures techniques de marquage et les grammages adaptés à votre marque.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{company.contact.address}, {company.contact.city}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{company.contact.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{company.contact.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{company.contact.hours}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={onOpenStudio}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <Box className="w-4 h-4" />
              <span>Démarrer une Création</span>
            </button>

            <button
              onClick={onOpenRenderEngine}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Camera className="w-4 h-4 text-blue-400" />
              <span>Studio Mockup 3D</span>
            </button>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="mt-auto bg-slate-950 border-t border-slate-900 px-4 sm:px-8 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">{company.name}</span>
            <span>—</span>
            <span>Tous droits réservés &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={onOpenStudio} className="hover:text-slate-300 transition-colors">
              Studio Créatif
            </button>
            <button onClick={onOpenRenderEngine} className="hover:text-slate-300 transition-colors">
              Moteur 3D
            </button>
            <button onClick={onOpenTracking} className="hover:text-slate-300 transition-colors">
              Suivi
            </button>
            {currentUser?.role === 'admin' ? (
              <button onClick={onOpenAdmin} className="text-amber-400 font-bold hover:underline">
                Administration
              </button>
            ) : (
              <button onClick={() => onOpenAuth('admin')} className="hover:text-slate-300 transition-colors">
                Accès Admin
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
