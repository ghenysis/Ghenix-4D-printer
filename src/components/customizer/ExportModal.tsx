import React, { useState } from 'react';
import {
  GarmentArticle,
  GarmentColor,
  FaceDesign,
  PrintTechniqueId
} from '../../types';
import { PRINT_TECHNIQUES } from '../../data/defaultCatalog';
import { renderFaceToCanvas } from '../../utils/canvasRenderer';
import {
  X,
  Download,
  Camera,
  Layers,
  Printer,
  CheckCircle2,
  FileCode,
  FileText,
  Sliders,
  Sparkles,
  Shirt,
  Info,
  Check,
  ChevronRight,
  Maximize2,
  ShieldCheck,
  Package
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: GarmentArticle;
  color: GarmentColor;
  frontDesign: FaceDesign;
  backDesign: FaceDesign;
  selectedTechnique: PrintTechniqueId;
  get3DCaptureUrl?: () => string;
}

type TabType = 'pack' | 'production' | 'mockups' | 'datasheet';
type FormatType = 'png' | 'webp';

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  article,
  color,
  frontDesign,
  backDesign,
  selectedTechnique,
  get3DCaptureUrl
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('pack');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  // Settings
  const [includePrintZoneGuide, setIncludePrintZoneGuide] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<FormatType>('png');
  const [resolutionMultiplier, setResolutionMultiplier] = useState<number>(1); // 1 = standard 300 DPI, 1.5 = Ultra HD

  if (!isOpen) return null;

  const technique =
    PRINT_TECHNIQUES.find((t) => t.id === selectedTechnique) || PRINT_TECHNIQUES[0];

  const frontCount = frontDesign.elements.length;
  const backCount = backDesign.elements.length;
  const totalElements = frontCount + backCount;

  // Helper download canvas
  const downloadCanvas = (
    canvas: HTMLCanvasElement,
    filename: string,
    format: FormatType = 'png'
  ) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href =
      format === 'webp'
        ? canvas.toDataURL('image/webp', 0.95)
        : canvas.toDataURL('image/png');
    link.click();
  };

  // Helper generate production canvas
  const generateProductionCanvas = async (face: 'front' | 'back'): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement('canvas');
    const design = face === 'front' ? frontDesign : backDesign;
    const zone = design.printZone;

    const baseWidth = Math.min(zone.maxPrintWidthPx || 2400, 3600);
    const baseHeight = Math.min(zone.maxPrintHeightPx || 3200, 4800);
    const targetW = Math.round(baseWidth * resolutionMultiplier);
    const targetH = Math.round(baseHeight * resolutionMultiplier);

    await renderFaceToCanvas(canvas, design, {
      width: targetW,
      height: targetH,
      includeBackground: false,
      showPrintBoundary: includePrintZoneGuide
    });

    return canvas;
  };

  // Helper generate mockup canvas
  const generateMockupCanvas = async (face: 'front' | 'back'): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement('canvas');
    const design = face === 'front' ? frontDesign : backDesign;

    await renderFaceToCanvas(canvas, design, {
      width: 1600,
      height: 1600,
      includeBackground: true,
      backgroundColor: color.hex,
      showPrintBoundary: includePrintZoneGuide
    });

    return canvas;
  };

  // 1. Export individual production file
  const handleExportProduction = async (face: 'front' | 'back') => {
    setIsExporting(true);
    setExportProgress(`Génération du fichier d'impression ${face === 'front' ? 'Recto' : 'Verso'}...`);
    try {
      const canvas = await generateProductionCanvas(face);
      const zone = (face === 'front' ? frontDesign : backDesign).printZone;
      const dpiLabel = resolutionMultiplier > 1 ? '450DPI' : '300DPI';
      const ext = selectedFormat;
      const filename = `GHENIX_PRINT_${dpiLabel}_${face.toUpperCase()}_${zone.widthCm}x${zone.heightCm}cm_${article.model3DType}.${ext}`;

      downloadCanvas(canvas, filename, selectedFormat);
      setExportSuccess(
        `Fichier d'impression ${face.toUpperCase()} (${dpiLabel} Transparent) exporté.`
      );
    } catch {
      setExportSuccess('Erreur lors de la génération du fichier.');
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  // 2. Export individual mockup
  const handleExportMockup = async (face: 'front' | 'back') => {
    setIsExporting(true);
    setExportProgress(`Rendu du mockup client ${face === 'front' ? 'Face' : 'Dos'}...`);
    try {
      const canvas = await generateMockupCanvas(face);
      const ext = selectedFormat;
      const filename = `GHENIX_MOCKUP_${article.model3DType}_${face.toUpperCase()}_${color.id}.${ext}`;

      downloadCanvas(canvas, filename, selectedFormat);
      setExportSuccess(`Mockup ${face === 'front' ? 'Face' : 'Dos'} téléchargé.`);
    } catch {
      setExportSuccess('Erreur lors de la génération du mockup.');
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  // 3. Export 3D Snapshot
  const handleExport3DSnapshot = () => {
    if (!get3DCaptureUrl) return;
    try {
      const url = get3DCaptureUrl();
      if (!url) return;

      const link = document.createElement('a');
      link.download = `GHENIX_3D_STUDIO_${article.model3DType}_${color.id}.png`;
      link.href = url;
      link.click();
      setExportSuccess('Capture instantanée du studio 3D téléchargée.');
    } catch {
      setExportSuccess('Impossible de capturer la vue 3D.');
    }
  };

  // 4. Export JSON Tech Spec
  const handleExportTechSpecJSON = () => {
    const techData = {
      project: 'GHENIX ATELIER - Production Textile',
      date: new Date().toISOString(),
      article: {
        id: article.id,
        name: article.name,
        category: article.category,
        model3D: article.model3DType,
        fabricWeight: `${article.weightGsm}g/m²`,
        composition: '100% Coton Biologique Peigné Ring-Spun'
      },
      color: {
        name: color.name,
        hex: color.hex,
        id: color.id
      },
      printTechnique: {
        id: technique.id,
        name: technique.name,
        description: technique.description,
        setupFee: `${technique.setupCost} €`,
        pricePerUnit: `${technique.pricePerUnit} €`,
        recommendedDPI: 300,
        colorSpace: 'sRGB / CMJN Fogra39'
      },
      designs: {
        front: {
          elementCount: frontDesign.elements.length,
          printZoneCm: `${frontDesign.printZone.widthCm} x ${frontDesign.printZone.heightCm} cm`,
          positionYPercent: `${frontDesign.printZone.yPercent}%`,
          elements: frontDesign.elements.map((el) => ({
            id: el.id,
            type: el.type,
            centerPercent: { x: el.x, y: el.y },
            sizePercent: { width: el.width, height: el.height },
            rotationDeg: el.rotation || 0,
            opacity: el.opacity ?? 1,
            ...(el.type === 'text'
              ? {
                  text: el.text,
                  fontFamily: el.fontFamily,
                  fontSize: el.fontSize,
                  textColor: el.color,
                  fontWeight: el.fontWeight,
                  textAlign: el.textAlign
                }
              : {
                  urlOrName: el.originalName || 'Asset graphique'
                })
          }))
        },
        back: {
          elementCount: backDesign.elements.length,
          printZoneCm: `${backDesign.printZone.widthCm} x ${backDesign.printZone.heightCm} cm`,
          positionYPercent: `${backDesign.printZone.yPercent}%`,
          elements: backDesign.elements.map((el) => ({
            id: el.id,
            type: el.type,
            centerPercent: { x: el.x, y: el.y },
            sizePercent: { width: el.width, height: el.height },
            rotationDeg: el.rotation || 0,
            opacity: el.opacity ?? 1,
            ...(el.type === 'text'
              ? {
                  text: el.text,
                  fontFamily: el.fontFamily,
                  fontSize: el.fontSize,
                  textColor: el.color,
                  fontWeight: el.fontWeight,
                  textAlign: el.textAlign
                }
              : {
                  urlOrName: el.originalName || 'Asset graphique'
                })
          }))
        }
      }
    };

    const blob = new Blob([JSON.stringify(techData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `GHENIX_TECH_SPEC_${article.id}_${color.id}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    setExportSuccess('Fiche technique JSON générée avec succès.');
  };

  // 5. Complete Production Bundle (Pack 1-Click)
  const handleExportCompleteBundle = async () => {
    setIsExporting(true);
    setExportProgress("Préparation de l'ensemble du dossier de fabrication...");

    try {
      // 1. Front print
      if (frontCount > 0) {
        setExportProgress("Export du fichier d'impression Recto 300 DPI...");
        const canvasFront = await generateProductionCanvas('front');
        downloadCanvas(
          canvasFront,
          `1_PRINT_RECTO_300DPI_${article.model3DType}.png`
        );
        await new Promise((r) => setTimeout(r, 400));
      }

      // 2. Back print
      if (backCount > 0) {
        setExportProgress("Export du fichier d'impression Verso 300 DPI...");
        const canvasBack = await generateProductionCanvas('back');
        downloadCanvas(
          canvasBack,
          `2_PRINT_VERSO_300DPI_${article.model3DType}.png`
        );
        await new Promise((r) => setTimeout(r, 400));
      }

      // 3. Mockup Front
      setExportProgress('Export du mockup Face...');
      const mockupFront = await generateMockupCanvas('front');
      downloadCanvas(mockupFront, `3_MOCKUP_FACE_${article.model3DType}_${color.id}.png`);
      await new Promise((r) => setTimeout(r, 400));

      // 4. Mockup Back
      setExportProgress('Export du mockup Dos...');
      const mockupBack = await generateMockupCanvas('back');
      downloadCanvas(mockupBack, `4_MOCKUP_DOS_${article.model3DType}_${color.id}.png`);
      await new Promise((r) => setTimeout(r, 400));

      // 5. 3D Capture
      if (get3DCaptureUrl) {
        setExportProgress('Capture du rendu 3D studio...');
        const url = get3DCaptureUrl();
        if (url) {
          const link = document.createElement('a');
          link.download = `5_STUDIO_3D_${article.model3DType}.png`;
          link.href = url;
          link.click();
          await new Promise((r) => setTimeout(r, 300));
        }
      }

      // 6. JSON Spec
      handleExportTechSpecJSON();

      setExportSuccess(
        'Pack complet exporté avec succès (fichiers 300 DPI, mockups HD, 3D et fiche technique).'
      );
    } catch {
      setExportSuccess("Une erreur est survenue lors de l'export du pack.");
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/65 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[92vh]">
        {/* MODAL HEADER */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-xs">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Centre de Téléchargement & Export</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Atelier HD
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Fichiers d'impression 300 DPI conformes imprimerie, mockups commerciaux et dossiers techniques.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NOTIFICATION FEEDBACK */}
        {exportProgress && (
          <div className="mx-5 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900 animate-pulse">
            <div className="w-3 h-3 rounded-full border-2 border-amber-600 border-t-transparent animate-spin shrink-0" />
            <span className="font-medium">{exportProgress}</span>
          </div>
        )}

        {exportSuccess && !exportProgress && (
          <div className="mx-5 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{exportSuccess}</span>
          </div>
        )}

        {/* TABS NAVIGATION */}
        <div className="px-5 pt-3 border-b border-slate-200 bg-white flex items-center gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('pack')}
            className={`flex items-center gap-2 px-3.5 py-2.5 font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'pack'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4 text-amber-500" />
            <span>Pack Atelier 1-Clic</span>
          </button>

          <button
            onClick={() => setActiveTab('production')}
            className={`flex items-center gap-2 px-3.5 py-2.5 font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'production'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Printer className="w-4 h-4 text-amber-600" />
            <span>Fichiers Print 300 DPI</span>
            {totalElements > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-slate-100 text-slate-700 font-bold">
                {totalElements}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('mockups')}
            className={`flex items-center gap-2 px-3.5 py-2.5 font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'mockups'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-blue-500" />
            <span>Mockups & Rendu 3D</span>
          </button>

          <button
            onClick={() => setActiveTab('datasheet')}
            className={`flex items-center gap-2 px-3.5 py-2.5 font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'datasheet'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 text-violet-500" />
            <span>Fiche Technique</span>
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: PACK ATELIER 1-CLIC */}
          {activeTab === 'pack' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10 space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-bold border border-amber-500/30">
                    <Sparkles className="w-3 h-3" />
                    <span>Dossier Complet Prêt pour Production</span>
                  </div>
                  <h4 className="text-base font-bold text-white">
                    Télécharger le Pack Complet du Projet
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-lg">
                    Télécharge en une seule commande tous les assets indispensables : les fichiers
                    haute résolution 300 DPI transparents pour l'impression, les visuels mockups
                    clients (fond {color.name}), la capture de l'angle 3D actuel et la fiche technique
                    d'atelier.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleExportCompleteBundle}
                      disabled={isExporting}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Download className="w-4 h-4 text-slate-950" />
                      <span>Télécharger Tout le Pack</span>
                    </button>
                    <span className="text-[11px] text-slate-300">
                      Inclut : Print Recto/Verso + Mockups HD + 3D + JSON
                    </span>
                  </div>
                </div>

                {/* Decorative background textile motif */}
                <Shirt className="absolute -bottom-8 -right-8 w-44 h-44 text-white/5 pointer-events-none" />
              </div>

              {/* QUICK CHECKLIST OF ASSETS INCLUDED */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">Norme Atelier Textile</p>
                    <p className="text-slate-500 text-[11px]">
                      Images détourées transparentes à 300 DPI sans aplat de couleur textile, adaptées à la sérigraphie et au DTG.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-start gap-2.5">
                  <Camera className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">Vues Commerciales</p>
                    <p className="text-slate-500 text-[11px]">
                      Aperçus photo réalistes pour validation client, bon à tirer (BAT) ou mise en vente e-commerce.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTION FILES (HIGH-RES 300 DPI) */}
          {activeTab === 'production' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Printer className="w-4 h-4 text-amber-600" />
                    <span>Fichiers de Marquage Transparent (300 DPI)</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Exports haute résolution sans fond pour DTG, DTF, Sérigraphie, Flocage ou Broderie.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  <span className="text-[11px] text-slate-500 px-1">DPI :</span>
                  <button
                    onClick={() => setResolutionMultiplier(1)}
                    className={`px-2 py-0.5 rounded-lg transition-colors ${
                      resolutionMultiplier === 1
                        ? 'bg-white shadow-2xs font-bold text-slate-900'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    300 DPI
                  </button>
                  <button
                    onClick={() => setResolutionMultiplier(1.5)}
                    className={`px-2 py-0.5 rounded-lg transition-colors ${
                      resolutionMultiplier === 1.5
                        ? 'bg-white shadow-2xs font-bold text-slate-900'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    450 DPI (Ultra)
                  </button>
                </div>
              </div>

              {/* ACTION CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* RECTO */}
                <div className="p-4 border border-slate-200 rounded-2xl bg-white flex flex-col justify-between hover:border-slate-800 transition-all group">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">
                        Marquage Recto (Face)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                        {frontCount} élément(s)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Zone d'impression : {frontDesign.printZone.widthCm} × {frontDesign.printZone.heightCm} cm
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Alignement vertical : {frontDesign.printZone.yPercent}% (Centre poitrine)
                    </p>
                  </div>

                  <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">
                      {Math.round(2400 * resolutionMultiplier)} × {Math.round(3200 * resolutionMultiplier)} px
                    </span>
                    <button
                      onClick={() => handleExportProduction('front')}
                      disabled={isExporting || frontCount === 0}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Télécharger</span>
                    </button>
                  </div>
                </div>

                {/* VERSO */}
                <div className="p-4 border border-slate-200 rounded-2xl bg-white flex flex-col justify-between hover:border-slate-800 transition-all group">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">
                        Marquage Verso (Dos)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                        {backCount} élément(s)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Zone d'impression : {backDesign.printZone.widthCm} × {backDesign.printZone.heightCm} cm
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Alignement vertical : {backDesign.printZone.yPercent}% (Haut du dos)
                    </p>
                  </div>

                  <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">
                      {Math.round(2400 * resolutionMultiplier)} × {Math.round(3200 * resolutionMultiplier)} px
                    </span>
                    <button
                      onClick={() => handleExportProduction('back')}
                      disabled={isExporting || backCount === 0}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Télécharger</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* OPTIONS TOGGLE */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-slate-600" />
                  <span className="text-slate-700 font-medium">
                    Inclure le cadre pointillé du gabarit d'impression (Repères de calage)
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={includePrintZoneGuide}
                  onChange={(e) => setIncludePrintZoneGuide(e.target.checked)}
                  className="rounded text-slate-900 focus:ring-0 cursor-pointer w-4 h-4"
                />
              </div>
            </div>
          )}

          {/* TAB 3: CLIENT MOCKUPS & 3D */}
          {activeTab === 'mockups' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-500" />
                  <span>Aperçus Visuels Clients & Rendu Studio</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Images haute définition prêtes pour le catalogue, les présentations clients ou le bon à tirer.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* MOCKUP FRONT */}
                <div className="p-3.5 border border-slate-200 rounded-2xl bg-white space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="w-full h-24 rounded-xl flex items-center justify-center border border-slate-100 relative overflow-hidden" style={{ backgroundColor: color.hex }}>
                      <Shirt className="w-12 h-12 text-white/30" />
                      <span className="absolute bottom-1 right-2 text-[10px] font-bold px-1.5 py-0.5 bg-black/40 text-white rounded">
                        Face
                      </span>
                    </div>
                    <p className="font-bold text-xs text-slate-900 mt-2">Mockup Face</p>
                    <p className="text-[11px] text-slate-500">Fond {color.name}</p>
                  </div>
                  <button
                    onClick={() => handleExportMockup('front')}
                    disabled={isExporting}
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Télécharger</span>
                  </button>
                </div>

                {/* MOCKUP BACK */}
                <div className="p-3.5 border border-slate-200 rounded-2xl bg-white space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="w-full h-24 rounded-xl flex items-center justify-center border border-slate-100 relative overflow-hidden" style={{ backgroundColor: color.hex }}>
                      <Shirt className="w-12 h-12 text-white/30" />
                      <span className="absolute bottom-1 right-2 text-[10px] font-bold px-1.5 py-0.5 bg-black/40 text-white rounded">
                        Dos
                      </span>
                    </div>
                    <p className="font-bold text-xs text-slate-900 mt-2">Mockup Dos</p>
                    <p className="text-[11px] text-slate-500">Fond {color.name}</p>
                  </div>
                  <button
                    onClick={() => handleExportMockup('back')}
                    disabled={isExporting}
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Télécharger</span>
                  </button>
                </div>

                {/* 3D SNAPSHOT */}
                <div className="p-3.5 border border-slate-200 rounded-2xl bg-white space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="w-full h-24 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 relative overflow-hidden">
                      <Camera className="w-8 h-8 text-amber-400" />
                      <span className="absolute bottom-1 right-2 text-[10px] font-bold px-1.5 py-0.5 bg-white/20 text-white rounded">
                        Angle 3D
                      </span>
                    </div>
                    <p className="font-bold text-xs text-slate-900 mt-2">Capture Studio 3D</p>
                    <p className="text-[11px] text-slate-500">Orientation caméra active</p>
                  </div>
                  <button
                    onClick={handleExport3DSnapshot}
                    disabled={!get3DCaptureUrl || isExporting}
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors disabled:opacity-40"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Capturer</span>
                  </button>
                </div>
              </div>

              {/* FORMAT SELECTOR */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-slate-600 font-medium">Format de fichier d'image :</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedFormat('png')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      selectedFormat === 'png'
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    PNG HD
                  </button>
                  <button
                    onClick={() => setSelectedFormat('webp')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      selectedFormat === 'webp'
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    WebP (Léger)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FICHE TECHNIQUE & SPECS */}
          {activeTab === 'datasheet' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-violet-500" />
                    <span>Fiche Technique & Instructions d'Atelier</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Détail complet des gabarits, techniques de marquage et calages pour les opérateurs d'impression.
                  </p>
                </div>
                <button
                  onClick={handleExportTechSpecJSON}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                >
                  <FileCode className="w-3.5 h-3.5 text-amber-400" />
                  <span>Exporter JSON</span>
                </button>
              </div>

              {/* SPECIFICATION SHEET PREVIEW */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] pb-3 border-b border-slate-200/80">
                  <div>
                    <span className="text-slate-400 block">Modèle textile</span>
                    <span className="font-bold text-slate-900">{article.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Coloris sélectionné</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name} ({color.hex})</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Grammage & Tissu</span>
                    <span className="font-bold text-slate-900">{article.weightGsm} g/m² Bio</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Technique recommandée</span>
                    <span className="font-bold text-slate-900">{technique.name}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900 mb-1 flex items-center justify-between">
                      <span>Face Recto</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {frontDesign.printZone.widthCm} × {frontDesign.printZone.heightCm} cm
                      </span>
                    </p>
                    <p className="text-slate-600 text-[11px]">
                      Éléments : {frontDesign.elements.length}
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Axe vertical : {frontDesign.printZone.yPercent}%
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900 mb-1 flex items-center justify-between">
                      <span>Face Verso</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {backDesign.printZone.widthCm} × {backDesign.printZone.heightCm} cm
                      </span>
                    </p>
                    <p className="text-slate-600 text-[11px]">
                      Éléments : {backDesign.elements.length}
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Axe vertical : {backDesign.printZone.yPercent}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Tous les fichiers générés respectent les gabarits GHENIX ATELIER.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
