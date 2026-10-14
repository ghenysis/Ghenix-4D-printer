import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MockupConfig,
  RenderAngle,
  RenderSnapshot
} from '../../types/renderEngine';
import { DEFAULT_MOCKUP_CONFIG } from '../../services/mockupApi';
import { createSampleGraphic } from '../../data/sampleMockupArtworks';
import { MockupCanvas3D, MockupCanvas3DRef } from './MockupCanvas3D';
import { RenderControlsPanel } from './RenderControlsPanel';
import { MultiAngleGallery } from './MultiAngleGallery';
import { ApiConsole } from './ApiConsole';
import {
  RotateCcw,
  Compass,
  ArrowLeft,
  Camera,
  Layers,
  Terminal,
  Maximize2,
  Home
} from 'lucide-react';

interface RenderEngineViewProps {
  onBackToAtelier: () => void;
  onBackToLanding?: () => void;
  initialArtworkUrl?: string;
  initialColorHex?: string;
}

export const RenderEngineView: React.FC<RenderEngineViewProps> = ({
  onBackToAtelier,
  onBackToLanding,
  initialArtworkUrl,
  initialColorHex
}) => {
  const [config, setConfig] = useState<MockupConfig>(() => ({
    ...DEFAULT_MOCKUP_CONFIG,
    colorHex: initialColorHex || DEFAULT_MOCKUP_CONFIG.colorHex,
    uploadedImageUrl: initialArtworkUrl || createSampleGraphic('tokyo'),
    imageName: initialArtworkUrl ? 'motif-atelier.png' : 'tokyo_street_2026.png'
  }));

  const [isAutoRotate, setIsAutoRotate] = useState(false);
  const [activeAngle, setActiveAngle] = useState<RenderAngle | null>('front');
  const [snapshots, setSnapshots] = useState<RenderSnapshot[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSection, setActiveSection] = useState<'studio' | 'api'>('studio');

  const canvasRefApi = useRef<MockupCanvas3DRef | null>(null);

  // Auto-generate initial set of multi-angles once canvas is ready
  const handleCanvasReady = useCallback((api: MockupCanvas3DRef) => {
    canvasRefApi.current = api;
  }, []);

  const handleGeneratePack = async () => {
    if (!canvasRefApi.current) return;
    setIsGenerating(true);
    try {
      const results = await canvasRefApi.current.captureAllAngles();
      setSnapshots(results);
    } catch (err) {
      console.error('Error generating mockup pack:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Initial pack generation after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (canvasRefApi.current && snapshots.length === 0) {
        handleGeneratePack();
      }
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handleDownloadAll = () => {
    snapshots.forEach((snap, idx) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.download = `ghenix-mockup-${snap.angle}.png`;
        link.href = snap.dataUrl;
        link.click();
      }, idx * 180);
    });
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 flex flex-col font-sans select-none">
      {/* 1. TOP BAR INDÉPENDANTE */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 h-12 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Revenir à la page d'accueil vitrine"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Accueil Vitrine</span>
            </button>
          )}
          <button
            onClick={onBackToAtelier}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Revenir au configurateur principal"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Retour Atelier</span>
          </button>
          <div className="w-[1px] h-5 bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <h1 className="text-xs sm:text-sm font-black tracking-tight text-slate-900 uppercase">
              Moteur de Rendu 3D & Studio Mockup
            </h1>
          </div>
        </div>

        {/* View Switcher: Studio 3D vs Console API */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 text-xs font-bold">
          <button
            onClick={() => setActiveSection('studio')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSection === 'studio'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Studio 360°</span>
          </button>
          <button
            onClick={() => setActiveSection('api')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSection === 'api'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3 h-3 text-amber-400" />
            <span>Accès API & Embed</span>
          </button>
        </div>
      </header>

      {/* 2. CONTENU PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-5">
        {activeSection === 'studio' ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* LEFT COLUMN: CONTROLS & UPLOAD (4 COLS) */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <RenderControlsPanel
                  config={config}
                  onChangeConfig={setConfig}
                  onGeneratePack={handleGeneratePack}
                  isGenerating={isGenerating}
                />
              </div>

              {/* RIGHT COLUMN: 3D 360° VIEWPORT (7 COLS) */}
              <div className="lg:col-span-7 flex flex-col gap-4 sticky top-16">
                <div className="relative w-full h-[520px] rounded-2xl overflow-hidden shadow-sm">
                  <MockupCanvas3D
                    config={config}
                    isAutoRotate={isAutoRotate}
                    activeAngle={activeAngle}
                    onCanvasRefReady={handleCanvasReady}
                  />

                  {/* FLOATING 3D CONTROLS BAR */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
                    {/* Quick Angle Presets */}
                    <div className="pointer-events-auto flex items-center bg-white/95 backdrop-blur-md rounded-xl p-0.5 border border-slate-200/90 shadow-sm text-[11px] font-bold">
                      {(
                        [
                          { id: 'front', label: 'Face' },
                          { id: 'three-quarter-left', label: '3/4 G' },
                          { id: 'back', label: 'Dos' },
                          { id: 'three-quarter-right', label: '3/4 D' },
                          { id: 'macro-detail', label: 'Macro' }
                        ] as const
                      ).map((a) => (
                        <button
                          key={a.id}
                          onClick={() => {
                            setIsAutoRotate(false);
                            setActiveAngle(a.id);
                          }}
                          className={`px-2.5 py-1 rounded-lg transition-all ${
                            activeAngle === a.id
                              ? 'bg-slate-900 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>

                    {/* Turntable 360 Auto-Rotate Toggle */}
                    <button
                      onClick={() => setIsAutoRotate(!isAutoRotate)}
                      className={`pointer-events-auto flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold transition-all shadow-sm border ${
                        isAutoRotate
                          ? 'bg-amber-500 text-slate-950 border-amber-600 ring-2 ring-amber-500/30'
                          : 'bg-white/95 text-slate-700 hover:text-slate-900 border-slate-200/90'
                      }`}
                    >
                      <RotateCcw className={`w-3 h-3 ${isAutoRotate ? 'animate-spin' : ''}`} />
                      <span>360° Turntable</span>
                    </button>
                  </div>

                  {/* Bottom Helper Hint */}
                  <div className="absolute bottom-3 inset-x-3 pointer-events-none flex justify-center">
                    <span className="px-3 py-1 rounded-full bg-slate-900/60 backdrop-blur-md text-[10px] font-semibold text-white/90">
                      Glissez pour faire pivoter à 360° • Molette pour zoomer
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* MULTI-ANGLE GALLERY PACK */}
            <section className="mt-2">
              <MultiAngleGallery
                snapshots={snapshots}
                activeAngle={activeAngle}
                onSelectAngle={(angle) => {
                  setIsAutoRotate(false);
                  setActiveAngle(angle);
                }}
                onDownloadAll={handleDownloadAll}
                isGenerating={isGenerating}
              />
            </section>

            {/* QUICK API PREVIEW BANNER */}
            <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider">
                    Intégration API & Export Webhook
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Connectez ce moteur de rendu 3D à votre boutique ou CRM via notre endpoint POST standardisé.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveSection('api')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-xs whitespace-nowrap"
              >
                Ouvrir la Console API
              </button>
            </div>
          </>
        ) : (
          /* CONSOLE API & EMBED VIEW */
          <div className="flex flex-col gap-5">
            <ApiConsole config={config} snapshots={snapshots} />
          </div>
        )}
      </main>
    </div>
  );
};
