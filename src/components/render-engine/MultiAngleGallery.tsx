import React from 'react';
import {
  Download,
  CheckCircle,
  Eye,
  Camera,
  Layers
} from 'lucide-react';
import { RenderSnapshot, RenderAngle } from '../../types/renderEngine';

interface MultiAngleGalleryProps {
  snapshots: RenderSnapshot[];
  activeAngle: RenderAngle | null;
  onSelectAngle: (angle: RenderAngle) => void;
  onDownloadAll: () => void;
  isGenerating: boolean;
}

export const MultiAngleGallery: React.FC<MultiAngleGalleryProps> = ({
  snapshots,
  activeAngle,
  onSelectAngle,
  onDownloadAll,
  isGenerating
}) => {
  const downloadSingleSnapshot = (snapshot: RenderSnapshot) => {
    const link = document.createElement('a');
    link.download = `mockup-3d-${snapshot.angle}-${Date.now()}.png`;
    link.href = snapshot.dataUrl;
    link.click();
  };

  if (snapshots.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 text-center">
        <div className="flex flex-col items-center justify-center py-6 gap-2 text-slate-400">
          <Camera className="w-8 h-8 text-slate-300" />
          <p className="text-xs font-bold text-slate-700">
            Aucun pack de mockups généré pour l'instant
          </p>
          <p className="text-[11px] text-slate-500 max-w-sm">
            Cliquez sur « Générer le Pack 3D Multi-Angles » pour capturer automatiquement les 5 vues studio haute définition.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Pack de Mockups 3D Multi-Angles ({snapshots.length} Vues HD)
          </h3>
        </div>
        <button
          onClick={onDownloadAll}
          disabled={isGenerating}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>Télécharger Tout le Pack</span>
        </button>
      </div>

      {/* Snapshot Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {snapshots.map((snap) => {
          const isSelected = activeAngle === snap.angle;
          return (
            <div
              key={snap.id}
              className={`group relative rounded-xl border overflow-hidden transition-all bg-slate-50 flex flex-col ${
                isSelected
                  ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Thumbnail */}
              <div
                onClick={() => onSelectAngle(snap.angle)}
                className="relative aspect-square w-full bg-slate-100 flex items-center justify-center cursor-pointer overflow-hidden"
              >
                <img
                  src={snap.dataUrl}
                  alt={snap.label}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                />
                {/* Active Indicator Overlay */}
                {isSelected && (
                  <div className="absolute top-1.5 left-1.5 bg-amber-500 text-white p-0.5 rounded-md shadow-xs">
                    <CheckCircle className="w-3 h-3" />
                  </div>
                )}
                {/* Hover Quick Action */}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAngle(snap.angle);
                    }}
                    className="p-1.5 rounded-lg bg-white/90 text-slate-900 hover:bg-white text-xs font-bold shadow-md"
                    title="Orienter la caméra 3D sur cet angle"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadSingleSnapshot(snap);
                    }}
                    className="p-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 text-xs font-bold shadow-md"
                    title="Télécharger cette image en HD"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Caption */}
              <div className="p-2 bg-white flex items-center justify-between border-t border-slate-100">
                <div className="min-w-0 pr-1">
                  <p className="text-[11px] font-bold text-slate-800 truncate">
                    {snap.label}
                  </p>
                  <p className="text-[9px] text-slate-400 font-medium uppercase">
                    PNG HD
                  </p>
                </div>
                <button
                  onClick={() => downloadSingleSnapshot(snap)}
                  className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors"
                  title="Télécharger"
                >
                  <Download className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
