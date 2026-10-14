import React, { useState } from 'react';
import {
  GarmentArticle,
  GarmentColor,
  GarmentSize,
  PrintTechniqueId,
  CustomElement,
  FaceDesign,
  TextCustomElement,
  ImageCustomElement
} from '../../types';
import {
  PRINT_TECHNIQUES,
  AVAILABLE_FONTS,
  CLIPARTS_LIBRARY
} from '../../data/defaultCatalog';
import {
  Shirt,
  Palette,
  Type,
  Image as ImageIcon,
  Layers,
  Sparkles,
  Upload,
  Plus,
  Trash2,
  Undo2,
  Redo2,
  Check,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface CustomizerSidebarProps {
  catalog: GarmentArticle[];
  selectedArticle: GarmentArticle;
  onSelectArticle: (article: GarmentArticle) => void;
  selectedColor: GarmentColor;
  onSelectColor: (color: GarmentColor) => void;
  selectedSize: GarmentSize;
  onSelectSize: (size: GarmentSize) => void;
  selectedTechnique: PrintTechniqueId;
  onSelectTechnique: (techId: PrintTechniqueId) => void;
  currentFace: 'front' | 'back';
  onFaceChange: (face: 'front' | 'back') => void;
  currentFaceDesign: FaceDesign;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onAddElement: (el: CustomElement) => void;
  onUpdateElement: (el: CustomElement) => void;
  onDeleteElement: (id: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

type TabType = 'garment' | 'text' | 'graphics' | 'layers';

export const CustomizerSidebar: React.FC<CustomizerSidebarProps> = ({
  catalog,
  selectedArticle,
  onSelectArticle,
  selectedColor,
  onSelectColor,
  selectedSize,
  onSelectSize,
  selectedTechnique,
  onSelectTechnique,
  currentFace,
  onFaceChange,
  currentFaceDesign,
  selectedElementId,
  onSelectElement,
  onAddElement,
  onUpdateElement,
  onDeleteElement,
  canUndo,
  canRedo,
  onUndo,
  onRedo
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('garment');

  // Text builder state
  const [inputText, setInputText] = useState('MON TEXTE');
  const [textFont, setTextFont] = useState(AVAILABLE_FONTS[0].id);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textSize, setTextSize] = useState(36);
  const [isBold, setIsBold] = useState(true);
  const [isItalic, setIsItalic] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [letterSpacing, setLetterSpacing] = useState(2);

  // Upload DPI analysis state
  const [uploadWarning, setUploadWarning] = useState<string | null>(null);

  // Currently selected element (if any)
  const selectedElement = currentFaceDesign.elements.find(el => el.id === selectedElementId);

  // Add new text element
  const handleAddText = () => {
    if (!inputText.trim()) return;

    const newElement: TextCustomElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 50,
      y: 40,
      width: 60,
      height: 20,
      rotation: 0,
      zIndex: currentFaceDesign.elements.length + 1,
      opacity: 1,
      text: inputText,
      fontFamily: textFont,
      fontSize: textSize,
      color: textColor,
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
      textAlign,
      letterSpacing
    };

    onAddElement(newElement);
  };

  // Image upload with DPI analysis
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadWarning(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        // Calculate estimated DPI
        // standard print zone is approx 30cm wide. If element is 50% = 15cm = 5.9 inches
        // DPI = pixels / inches
        const widthInches = (selectedArticle.frontPrintZone.widthCm * 0.5) / 2.54;
        const estimatedDpi = Math.round(img.width / widthInches);

        if (estimatedDpi < 150) {
          setUploadWarning(
            `Résolution basse (~${estimatedDpi} DPI). Pour une impression optimale, privilégiez un fichier avec une résolution d'au moins 300 DPI.`
          );
        }

        const aspect = img.width / img.height;
        const initialWidth = 45;
        const initialHeight = Math.min(65, Math.round(initialWidth / aspect));

        const newElement: ImageCustomElement = {
          id: `img-${Date.now()}`,
          type: 'image',
          x: 50,
          y: 50,
          width: initialWidth,
          height: initialHeight,
          rotation: 0,
          zIndex: currentFaceDesign.elements.length + 1,
          opacity: 1,
          url,
          originalName: file.name,
          originalWidth: img.width,
          originalHeight: img.height,
          dpi: estimatedDpi,
          aspectRatio: aspect
        };

        onAddElement(newElement);
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
    // Reset file input
    e.target.value = '';
  };

  // Add Clipart element
  const handleAddClipart = (clipart: (typeof CLIPARTS_LIBRARY)[0]) => {
    const svgBlob = new Blob([clipart.svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const newElement: ImageCustomElement = {
      id: `clipart-${Date.now()}`,
      type: 'clipart',
      x: 50,
      y: 50,
      width: 40,
      height: 40,
      rotation: 0,
      zIndex: currentFaceDesign.elements.length + 1,
      opacity: 1,
      url,
      originalName: clipart.name,
      originalWidth: 200,
      originalHeight: 200,
      dpi: 300,
      aspectRatio: 1
    };

    onAddElement(newElement);
  };

  // Check size availability
  const checkVariantAvailable = (size: GarmentSize) => {
    const variant = selectedArticle.variants.find(
      v => v.colorId === selectedColor.id && v.size === size
    );
    return variant ? variant.available && variant.stock > 0 : false;
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-full sm:w-80 lg:w-96 select-none shadow-xs">
      {/* TOOLBAR TABS HEADER */}
      <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-slate-50/70">
        <div className="grid grid-cols-4 gap-1 w-full bg-slate-200/60 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('garment')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'garment'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shirt className="w-4 h-4 mb-0.5" />
            <span>Article</span>
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'text'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Type className="w-4 h-4 mb-0.5" />
            <span>Texte</span>
          </button>
          <button
            onClick={() => setActiveTab('graphics')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'graphics'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-4 h-4 mb-0.5" />
            <span>Visuels</span>
          </button>
          <button
            onClick={() => setActiveTab('layers')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'layers'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 mb-0.5" />
            <span>Calques</span>
          </button>
        </div>
      </div>

      {/* RECTO / VERSO & UNDO / REDO CONTROLS BAR */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-100 text-xs">
        {/* Face toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
          <button
            onClick={() => onFaceChange('front')}
            className={`px-2.5 py-1 font-medium rounded-md transition-all ${
              currentFace === 'front' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Recto
          </button>
          <button
            onClick={() => onFaceChange('back')}
            className={`px-2.5 py-1 font-medium rounded-md transition-all ${
              currentFace === 'back' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Verso
          </button>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-1 text-slate-600">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-30 disabled:pointer-events-none"
            title="Annuler"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-30 disabled:pointer-events-none"
            title="Rétablir"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SCROLLABLE TOOL TAB CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-sm">
        {/* --- TAB 1: ARTICLE & VARIANTES --- */}
        {activeTab === 'garment' && (
          <div className="space-y-5">
            {/* ARTICLE SELECTOR */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Modèle de vêtement
              </label>
              <div className="space-y-1.5">
                {catalog.filter(a => a.active).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSelectArticle(item)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                      selectedArticle.id === item.id
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-xs">{item.name}</p>
                      <p className={`text-[11px] ${selectedArticle.id === item.id ? 'text-slate-300' : 'text-slate-500'}`}>
                        {item.weightGsm}g/m² · {item.material}
                      </p>
                    </div>
                    <span className="font-bold text-xs shrink-0 ml-2">
                      {item.basePrice.toFixed(2)} €
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* COLOR PALETTE */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Couleur : <span className="text-slate-900 font-bold normal-case">{selectedColor.name}</span>
                </label>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {selectedArticle.colors.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onSelectColor(c)}
                    className={`group relative flex flex-col items-center justify-center p-1.5 rounded-xl border transition-all ${
                      selectedColor.id === c.id
                        ? 'border-slate-900 ring-2 ring-slate-900/30 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    title={c.name}
                  >
                    <div
                      className="w-7 h-7 rounded-lg shadow-inner flex items-center justify-center border border-black/10"
                      style={{ backgroundColor: c.hex }}
                    >
                      {selectedColor.id === c.id && (
                        <Check
                          className={`w-3.5 h-3.5 ${
                            c.textColor === 'dark' ? 'text-slate-900' : 'text-white'
                          }`}
                        />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* SIZE SELECTOR WITH STOCK CHECK */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Taille disponible
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedArticle.sizes.map((size) => {
                  const isAvailable = checkVariantAvailable(size);
                  const isSelected = selectedSize === size;

                  return (
                    <button
                      key={size}
                      onClick={() => isAvailable && onSelectSize(size)}
                      disabled={!isAvailable}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-xs'
                          : isAvailable
                          ? 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200'
                          : 'bg-slate-50 text-slate-300 line-through border border-slate-100 cursor-not-allowed'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PRINT TECHNIQUE SELECTOR */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Technique d'impression
              </label>
              <div className="space-y-2">
                {PRINT_TECHNIQUES.filter(tech =>
                  selectedArticle.allowedTechniques.includes(tech.id)
                ).map((technique) => (
                  <button
                    key={technique.id}
                    onClick={() => onSelectTechnique(technique.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      selectedTechnique === technique.id
                        ? 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{technique.name}</span>
                      <span className="text-[11px] font-semibold text-amber-700">
                        +{technique.pricePerUnit.toFixed(2)} €/u
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {technique.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: TEXT TOOL --- */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Texte à imprimer
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={2}
                placeholder="Votre message ici..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* FONT SELECTOR */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Typographie
              </label>
              <select
                value={textFont}
                onChange={(e) => setTextFont(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {AVAILABLE_FONTS.map((font) => (
                  <option key={font.id} value={font.id}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>

            {/* TEXT COLOR PRESETS */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Couleur d'impression
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0"
                />
                <div className="flex items-center gap-1.5 flex-1">
                  {['#FFFFFF', '#111827', '#EF4444', '#F59E0B', '#10B981', '#3B82F6'].map((hex) => (
                    <button
                      key={hex}
                      onClick={() => setTextColor(hex)}
                      className="w-6 h-6 rounded-md border border-slate-300 shadow-xs"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* SIZE & SPACING SLIDERS */}
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Taille de police</span>
                  <span className="font-mono">{textSize}px</span>
                </div>
                <input
                  type="range"
                  min={18}
                  max={72}
                  value={textSize}
                  onChange={(e) => setTextSize(Number(e.target.value))}
                  className="w-full accent-slate-900"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Espacement des lettres</span>
                  <span className="font-mono">{letterSpacing}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={12}
                  value={letterSpacing}
                  onChange={(e) => setLetterSpacing(Number(e.target.value))}
                  className="w-full accent-slate-900"
                />
              </div>
            </div>

            {/* STYLES (BOLD / ITALIC / ALIGN) */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setIsBold(!isBold)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  isBold ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                Gras
              </button>
              <button
                onClick={() => setIsItalic(!isItalic)}
                className={`flex-1 py-1.5 text-xs italic font-semibold rounded-lg border transition-all ${
                  isItalic ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                Italique
              </button>
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => setTextAlign(align)}
                    className={`px-2 py-1.5 text-[10px] uppercase font-bold ${
                      textAlign === align ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'
                    }`}
                  >
                    {align[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* ADD BUTTON */}
            <button
              onClick={handleAddText}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter le texte au vêtement</span>
            </button>
          </div>
        )}

        {/* --- TAB 3: VISUELS & IMAGES --- */}
        {activeTab === 'graphics' && (
          <div className="space-y-5">
            {/* FILE UPLOAD WITH DPI DETECTOR */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Importer vos fichiers
              </label>

              <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-300 hover:border-slate-900 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-all text-center">
                <Upload className="w-6 h-6 text-slate-600 mb-2" />
                <span className="text-xs font-semibold text-slate-900">
                  Choisir une image, logo ou photo
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  PNG transparent, JPG ou SVG (300 DPI recommandés)
                </span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/svg+xml, image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {uploadWarning && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{uploadWarning}</span>
                </div>
              )}
            </div>

            {/* CLIPARTS LIBRARY */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Galerie de motifs & insignes
                </label>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {CLIPARTS_LIBRARY.map((clipart) => (
                  <button
                    key={clipart.id}
                    onClick={() => handleAddClipart(clipart)}
                    className="flex flex-col items-center justify-center p-2.5 border border-slate-200 hover:border-slate-900 rounded-xl bg-white hover:shadow-xs transition-all text-center group"
                    title={clipart.name}
                  >
                    <div
                      className="w-12 h-12 flex items-center justify-center text-slate-800 group-hover:scale-105 transition-transform"
                      dangerouslySetInnerHTML={{ __html: clipart.svgData }}
                    />
                    <span className="text-[10px] font-medium text-slate-600 mt-1.5 truncate max-w-full">
                      {clipart.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 4: CALQUES / LAYERS --- */}
        {activeTab === 'layers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Éléments ({currentFaceDesign.elements.length})
              </label>
            </div>

            {currentFaceDesign.elements.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">
                Aucun élément présent sur le {currentFace === 'front' ? 'recto' : 'verso'}.
              </p>
            ) : (
              <div className="space-y-2">
                {[...currentFaceDesign.elements]
                  .reverse()
                  .map((el) => {
                    const isSelected = el.id === selectedElementId;

                    return (
                      <div
                        key={el.id}
                        onClick={() => onSelectElement(el.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {el.type === 'text' ? (
                            <Type className="w-3.5 h-3.5 shrink-0" />
                          ) : (
                            <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                          )}
                          <span className="font-semibold truncate">
                            {el.type === 'text' ? el.text : el.originalName || 'Image'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteElement(el.id);
                            }}
                            className={`p-1 rounded hover:bg-rose-500 hover:text-white transition-colors ${
                              isSelected ? 'text-slate-300' : 'text-slate-500'
                            }`}
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
