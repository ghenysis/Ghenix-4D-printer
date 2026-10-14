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
  FileCheck,
  Camera,
  Layers,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Info
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
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const technique =
    PRINT_TECHNIQUES.find((t) => t.id === selectedTechnique) || PRINT_TECHNIQUES[0];

  // Download helper for a canvas
  const downloadCanvasAsPng = (canvas: HTMLCanvasElement, filename: string) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // 1. Export Mockup Client (With garment background)
  const handleExportMockup = async (face: 'front' | 'back') => {
    setIsExporting(true);
    try {
      const canvas = document.createElement('canvas');
      const design = face === 'front' ? frontDesign : backDesign;

      await renderFaceToCanvas(canvas, design, {
        width: 1600,
        height: 1600,
        includeBackground: true,
        backgroundColor: color.hex,
        showPrintBoundary: false
      });

      downloadCanvasAsPng(
        canvas,
        `ghenix_mockup_${article.model3DType}_${face}_${color.id}.png`
      );
      setExportSuccess(`Aperçu ${face === 'front' ? 'Recto' : 'Verso'} téléchargé avec succès.`);
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Export Production Print File (High-Res 300 DPI Transparent PNG)
  const handleExportProductionFile = async (face: 'front' | 'back') => {
    setIsExporting(true);
    try {
      const canvas = document.createElement('canvas');
      const design = face === 'front' ? frontDesign : backDesign;
      const zone = design.printZone;

      // 300 DPI calculation:
      // Width in inches = widthCm / 2.54; px = inches * 300
      const targetWidthPx = Math.min(zone.maxPrintWidthPx || 2400, 3600);
      const targetHeightPx = Math.min(zone.maxPrintHeightPx || 3200, 4800);

      await renderFaceToCanvas(canvas, design, {
        width: targetWidthPx,
        height: targetHeightPx,
        includeBackground: false, // Transparent for printing!
        showPrintBoundary: false
      });

      downloadCanvasAsPng(
        canvas,
        `GHENIX_PRINT_300DPI_${face.toUpperCase()}_${zone.widthCm}x${zone.heightCm}cm_${article.id}.png`
      );
      setExportSuccess(
        `Fichier d'impression haute définition 300 DPI (${face.toUpperCase()}) prêt pour l'atelier.`
      );
    } finally {
      setIsExporting(false);
    }
  };

  // 3. Export 3D Viewport Snapshot
  const handleExport3DSnapshot = () => {
    if (!get3DCaptureUrl) return;
    const url = get3DCaptureUrl();
    if (!url) return;

    const link = document.createElement('a');
    link.download = `ghenix_3d_render_${article.model3DType}.png`;
    link.href = url;
    link.click();
    setExportSuccess('Capture du rendu 3D téléchargée avec succès.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Centre de Téléchargement & Fichiers d'Impression
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Exports visuels clients et fichiers techniques haute fidélité pour atelier textile.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NOTIFICATION FEEDBACK */}
        {exportSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{exportSuccess}</span>
          </div>
        )}

        {/* SECTION 1: PRODUCTION FILES (FOR PRINT SHOP) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Printer className="w-4 h-4 text-amber-600" />
              <span>Fichiers de Production Imprimerie (300 DPI Transparent)</span>
            </h4>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              Conforme Atelier
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Fichiers PNG transparents à l'échelle réelle (300 DPI) sans arrière-plan, prêts pour le flashage sérigraphique, l'impression DTG ou la broderie.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => handleExportProductionFile('front')}
              disabled={isExporting || frontDesign.elements.length === 0}
              className="flex items-center justify-between p-3.5 border border-slate-200 hover:border-slate-900 rounded-xl bg-slate-50 hover:bg-white text-left transition-all disabled:opacity-40 disabled:pointer-events-none group"
            >
              <div>
                <p className="font-bold text-xs text-slate-900">Fichier Print Recto</p>
                <p className="text-[11px] text-slate-500">
                  Zone {frontDesign.printZone.widthCm}×{frontDesign.printZone.heightCm} cm · {frontDesign.elements.length} élément(s)
                </p>
              </div>
              <Download className="w-4 h-4 text-slate-600 group-hover:text-slate-900" />
            </button>

            <button
              onClick={() => handleExportProductionFile('back')}
              disabled={isExporting || backDesign.elements.length === 0}
              className="flex items-center justify-between p-3.5 border border-slate-200 hover:border-slate-900 rounded-xl bg-slate-50 hover:bg-white text-left transition-all disabled:opacity-40 disabled:pointer-events-none group"
            >
              <div>
                <p className="font-bold text-xs text-slate-900">Fichier Print Verso</p>
                <p className="text-[11px] text-slate-500">
                  Zone {backDesign.printZone.widthCm}×{backDesign.printZone.heightCm} cm · {backDesign.elements.length} élément(s)
                </p>
              </div>
              <Download className="w-4 h-4 text-slate-600 group-hover:text-slate-900" />
            </button>
          </div>
        </div>

        {/* SECTION 2: CLIENT VISUAL MOCKUPS */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-600" />
            <span>Aperçus Visuels Clients (Mockups & Rendu 3D)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => handleExportMockup('front')}
              disabled={isExporting}
              className="p-3 border border-slate-200 hover:border-slate-800 rounded-xl text-left bg-white transition-all text-xs"
            >
              <p className="font-semibold text-slate-900">Mockup Face</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Fond {color.name}</p>
            </button>

            <button
              onClick={() => handleExportMockup('back')}
              disabled={isExporting}
              className="p-3 border border-slate-200 hover:border-slate-800 rounded-xl text-left bg-white transition-all text-xs"
            >
              <p className="font-semibold text-slate-900">Mockup Dos</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Fond {color.name}</p>
            </button>

            <button
              onClick={handleExport3DSnapshot}
              disabled={!get3DCaptureUrl}
              className="p-3 border border-slate-200 hover:border-slate-800 rounded-xl text-left bg-white transition-all text-xs"
            >
              <p className="font-semibold text-slate-900 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" />
                <span>Capture 3D</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Angle caméra actuel</p>
            </button>
          </div>
        </div>

        {/* TECHNICAL SPECS SUMMARY */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-slate-900">Spécifications de la commande :</p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>Article : <span className="text-slate-800 font-medium">{article.name}</span></div>
            <div>Technique : <span className="text-slate-800 font-medium">{technique.name}</span></div>
            <div>Coloris : <span className="text-slate-800 font-medium">{color.name} ({color.hex})</span></div>
            <div>Support : <span className="text-slate-800 font-medium">{article.weightGsm}g/m² Bio</span></div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
