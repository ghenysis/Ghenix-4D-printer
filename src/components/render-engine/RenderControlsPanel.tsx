import React, { useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Sparkles,
  Sliders,
  Sun,
  Palette,
  Layers,
  RotateCw,
  Maximize2
} from 'lucide-react';
import {
  MockupConfig,
  GarmentType,
  PlacementPreset,
  LightingPreset
} from '../../types/renderEngine';
import { SAMPLE_ARTWORKS, createSampleGraphic } from '../../data/sampleMockupArtworks';

interface RenderControlsPanelProps {
  config: MockupConfig;
  onChangeConfig: (newConfig: MockupConfig) => void;
  onGeneratePack: () => void;
  isGenerating: boolean;
}

const GARMENTS: { id: GarmentType; name: string; tag: string }[] = [
  { id: 'tshirt-oversize', name: 'T-Shirt Oversize 240g', tag: 'Boxy Fit' },
  { id: 'tshirt-classic', name: 'T-Shirt Regular Cut', tag: 'Classic' },
  { id: 'hoodie-street', name: 'Hoodie Molleton Lourd', tag: 'Streetwear' },
  { id: 'sweatshirt-crew', name: 'Sweatshirt Col Rond', tag: 'Minimal' }
];

const COLORS = [
  { hex: '#18181B', name: 'Noir Brut' },
  { hex: '#F8FAFC', name: 'Blanc Pur' },
  { hex: '#2B392F', name: 'Kaki Vintage' },
  { hex: '#1E293B', name: 'Bleu Minuit' },
  { hex: '#C29B7F', name: 'Sable Chaud' },
  { hex: '#7C2D12', name: 'Terracotta' }
];

const PLACEMENTS: { id: PlacementPreset; name: string; side: 'front' | 'back' }[] = [
  { id: 'chest-center', name: 'Poitrine Centre', side: 'front' },
  { id: 'pocket-left', name: 'Poche Cœur', side: 'front' },
  { id: 'large-front', name: 'Grand Format', side: 'front' },
  { id: 'back-center', name: 'Centre Dos', side: 'back' },
  { id: 'full-back', name: 'Dos Plein Format', side: 'back' }
];

const LIGHTING_PRESETS: { id: LightingPreset; name: string; desc: string }[] = [
  { id: 'softbox', name: 'Studio Softbox', desc: 'Lumière diffuse neutre' },
  { id: 'warm-editorial', name: 'Warm Editorial', desc: 'Chaleur & contrastes' },
  { id: 'clean-ecommerce', name: 'Clean E-Commerce', desc: 'Haute clarté packshot' },
  { id: 'cyber-night', name: 'Cyber Night', desc: 'Reflets d’ambiance' }
];

export const RenderControlsPanel: React.FC<RenderControlsPanelProps> = ({
  config,
  onChangeConfig,
  onGeneratePack,
  isGenerating
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onChangeConfig({
          ...config,
          uploadedImageUrl: result,
          imageName: file.name
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_ARTWORKS[0]) => {
    const dataUrl = createSampleGraphic(sample.type);
    onChangeConfig({
      ...config,
      uploadedImageUrl: dataUrl,
      imageName: `${sample.name}.png`
    });
  };

  const handlePlacementChange = (preset: PlacementPreset) => {
    let side: 'front' | 'back' = 'front';
    let scale = 0.17;
    let offsetY = 0.04;
    let offsetX = 0;

    if (preset === 'pocket-left') {
      side = 'front';
      scale = 0.08;
      offsetY = 0.08;
      offsetX = 0.07;
    } else if (preset === 'large-front') {
      side = 'front';
      scale = 0.26;
      offsetY = 0.02;
      offsetX = 0;
    } else if (preset === 'back-center') {
      side = 'back';
      scale = 0.18;
      offsetY = 0.06;
      offsetX = 0;
    } else if (preset === 'full-back') {
      side = 'back';
      scale = 0.28;
      offsetY = 0.02;
      offsetX = 0;
    }

    onChangeConfig({
      ...config,
      placement: preset,
      targetSide: side,
      scale,
      offsetY,
      offsetX
    });
  };

  return (
    <div className="flex flex-col gap-5 text-slate-800">
      {/* 1. UPLOAD IMAGE & SAMPLES */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Image Source / Motif
            </h3>
          </div>
          {config.uploadedImageUrl && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 underline"
            >
              Changer l'image
            </button>
          )}
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
            config.uploadedImageUrl
              ? 'border-emerald-300 bg-emerald-50/20 hover:bg-emerald-50/40'
              : 'border-slate-200 bg-slate-50 hover:border-amber-400 hover:bg-amber-50/20'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />

          {config.uploadedImageUrl ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-slate-900/5 p-1 border border-slate-200 shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src={config.uploadedImageUrl}
                  alt={config.imageName}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {config.imageName}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  Prêt pour plaquage 3D immédiat
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-2">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Glissez votre image ou cliquez pour parcourir
              </p>
              <p className="text-[10px] text-slate-500">
                PNG transparent, JPG ou WebP haute résolution
              </p>
            </div>
          )}
        </div>

        {/* Quick Sample Library */}
        <div className="mt-3">
          <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Ou tester avec un exemple studio</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {SAMPLE_ARTWORKS.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:border-amber-400 text-left transition-all text-xs"
              >
                <div className="w-6 h-6 rounded bg-slate-200 shrink-0 flex items-center justify-center overflow-hidden">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-slate-800 truncate">
                    {sample.name}
                  </p>
                  <p className="text-[9px] text-slate-400 font-medium">
                    {sample.tag}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. VÊTEMENT & COULEUR */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            2. Vêtement & Matière
          </h3>
        </div>

        {/* Garment Selector */}
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          {GARMENTS.map((g) => (
            <button
              key={g.id}
              onClick={() =>
                onChangeConfig({
                  ...config,
                  garmentType: g.id,
                  garmentName: g.name
                })
              }
              className={`p-2 rounded-xl border text-left transition-all ${
                config.garmentType === g.id
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-white'
              }`}
            >
              <p className="text-[11px] font-bold truncate">{g.name}</p>
              <p
                className={`text-[9px] font-medium ${
                  config.garmentType === g.id ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                {g.tag}
              </p>
            </button>
          ))}
        </div>

        {/* Color Swatches */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            Coloris du Tissu ({config.colorName})
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c.hex}
                onClick={() =>
                  onChangeConfig({
                    ...config,
                    colorHex: c.hex,
                    colorName: c.name
                  })
                }
                title={c.name}
                className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 relative ${
                  config.colorHex.toLowerCase() === c.hex.toLowerCase()
                    ? 'border-amber-500 ring-2 ring-amber-500/30 scale-105'
                    : 'border-slate-300'
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3. PLACEMENT & CADRAGE GÉOMÉTRIQUE */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            3. Emplacement & Échelle
          </h3>
        </div>

        {/* Placement Presets */}
        <div className="flex items-center gap-1.5 flex-wrap mb-4">
          {PLACEMENTS.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePlacementChange(p.id)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                config.placement === p.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Fine-tuning Controls */}
        <div className="space-y-3 pt-1 border-t border-slate-100">
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
              <span className="flex items-center gap-1">
                <Maximize2 className="w-3 h-3" />
                Taille du motif
              </span>
              <span className="font-mono">{Math.round(config.scale * 400)}%</span>
            </div>
            <input
              type="range"
              min="0.06"
              max="0.32"
              step="0.01"
              value={config.scale}
              onChange={(e) =>
                onChangeConfig({ ...config, scale: parseFloat(e.target.value) })
              }
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
              <span className="flex items-center gap-1">
                <Sliders className="w-3 h-3" />
                Position verticale
              </span>
              <span className="font-mono">{Math.round(config.offsetY * 100)}</span>
            </div>
            <input
              type="range"
              min="-0.08"
              max="0.12"
              step="0.01"
              value={config.offsetY}
              onChange={(e) =>
                onChangeConfig({ ...config, offsetY: parseFloat(e.target.value) })
              }
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
              <span className="flex items-center gap-1">
                <RotateCw className="w-3 h-3" />
                Rotation
              </span>
              <span className="font-mono">{config.rotationDeg}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              step="5"
              value={config.rotationDeg}
              onChange={(e) =>
                onChangeConfig({ ...config, rotationDeg: parseInt(e.target.value, 10) })
              }
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
        </div>
      </section>

      {/* 4. ÉCLAIRAGE STUDIO */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-2.5">
          <Sun className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            4. Ambiance Lumineuse
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {LIGHTING_PRESETS.map((lp) => (
            <button
              key={lp.id}
              onClick={() => onChangeConfig({ ...config, lighting: lp.id })}
              className={`p-2 rounded-xl border text-left transition-all ${
                config.lighting === lp.id
                  ? 'border-amber-500 bg-amber-500/10 text-slate-900 ring-1 ring-amber-500'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
              }`}
            >
              <p className="text-[11px] font-bold">{lp.name}</p>
              <p className="text-[9px] text-slate-500">{lp.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* PRIMARY GENERATION ACTION BUTTON */}
      <button
        onClick={onGeneratePack}
        disabled={isGenerating || !config.uploadedImageUrl}
        className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Calcul du Rendu 3D Multi-Angles...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Générer le Pack 3D Multi-Angles</span>
          </>
        )}
      </button>
    </div>
  );
};
