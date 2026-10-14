import React, { useState } from 'react';
import {
  GarmentArticle,
  GarmentColor,
  GarmentSize,
  CustomElement,
  TextCustomElement,
  ImageCustomElement
} from '../../types';
import { AVAILABLE_FONTS } from '../../data/defaultCatalog';
import {
  Sparkles,
  Type,
  Image as ImageIcon,
  ShoppingBag,
  Trash2,
  Copy,
  RotateCw,
  RotateCcw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Minus,
  Undo2,
  Redo2,
  ChevronDown,
  ChevronUp,
  X,
  Upload,
  Layers,
  Crosshair,
  Check,
  Shirt
} from 'lucide-react';

export interface StudioBottomDockProps {
  article: GarmentArticle;
  selectedColor: GarmentColor;
  onSelectColor: (color: GarmentColor) => void;
  selectedSize: GarmentSize;
  onSelectSize: (size: GarmentSize) => void;
  onOpenAi: () => void;
  price: number;
  quantity: number;
  onUpdateQuantity: (qty: number) => void;
  onAddToCart: () => void;
  onOpenExport?: () => void;
  selectedElement: CustomElement | null;
  allElements?: CustomElement[];
  onSelectElementId?: (id: string) => void;
  onUpdateElement: (el: CustomElement) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onDeselectElement: () => void;
  onAddText: (text: string, font: string, color: string) => void;
  onAddImage: (file: File) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenArticleDrawer?: () => void;
}

export function StudioBottomDock({
  article,
  selectedColor,
  onSelectColor,
  selectedSize,
  onSelectSize,
  onOpenAi,
  price,
  quantity,
  onUpdateQuantity,
  onAddToCart,
  selectedElement,
  allElements = [],
  onSelectElementId,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onDeselectElement,
  onAddText,
  onAddImage,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenArticleDrawer
}: StudioBottomDockProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'contextual' | 'article'>('contextual');

  const isTextElement = selectedElement?.type === 'text';
  const textElem = isTextElement ? (selectedElement as TextCustomElement) : null;
  const isImageElement = selectedElement?.type === 'image' || selectedElement?.type === 'clipart';
  const imageElem = isImageElement ? (selectedElement as ImageCustomElement) : null;

  // Replace image on active element
  const handleReplaceImage = (file: File) => {
    if (!imageElem) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const aspect = img.width / img.height || 1;
        onUpdateElement({
          ...imageElem,
          url: dataUrl,
          originalName: file.name,
          originalWidth: img.width,
          originalHeight: img.height,
          aspectRatio: aspect,
          height: imageElem.width / aspect
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Quick add text
  const handleQuickAddText = () => {
    onAddText('GHENIX', 'Space Grotesk', '#ffffff');
    setActiveTab('contextual');
    setIsExpanded(true);
  };

  return (
    <div className="relative z-30 w-full max-w-3xl mx-auto flex flex-col items-center select-none">
      {/* UNIFIED COMPACT DOCK CONTAINER */}
      <div className="w-full bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-xl transition-all overflow-hidden flex flex-col">
        {/* MOBILE DRAG / COLLAPSE HANDLE */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex justify-center py-1 sm:hidden cursor-pointer hover:bg-slate-100/50 transition-colors"
          title={isExpanded ? 'Réduire le panneau' : 'Agrandir le panneau'}
        >
          <div className="w-8 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* CONTEXTUAL COMPACT TOP BAR (When element is selected) */}
        {selectedElement && (
          <div className="flex items-center justify-between px-2.5 py-1 sm:px-3 sm:py-1.5 border-b border-slate-200/70 bg-slate-50/90 text-xs gap-2">
            {/* Left: Element Tag & View Switcher */}
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="flex items-center gap-1 font-bold text-slate-900 bg-white border border-slate-200/80 px-1.5 py-0.5 rounded-lg shadow-2xs shrink-0 text-[10px] sm:text-[11px]">
                {isTextElement ? (
                  <Type className="w-3 h-3 text-amber-500 shrink-0" />
                ) : (
                  <ImageIcon className="w-3 h-3 text-amber-500 shrink-0" />
                )}
                <span className="max-w-[90px] sm:max-w-[140px] truncate">
                  {isTextElement
                    ? `Texte: "${textElem?.text || ''}"`
                    : imageElem?.originalName || 'Visuel'}
                </span>
              </span>

              {/* View Switcher: Réglages vs Vêtement */}
              <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-[10px] font-semibold shrink-0">
                <button
                  onClick={() => {
                    setActiveTab('contextual');
                    setIsExpanded(true);
                  }}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    activeTab === 'contextual'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Réglages
                </button>
                <button
                  onClick={() => {
                    setActiveTab('article');
                    setIsExpanded(true);
                  }}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    activeTab === 'article'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Vêtement
                </button>
              </div>
            </div>

            {/* Right: Done button */}
            <button
              onClick={onDeselectElement}
              className="flex items-center gap-1 px-2 py-0.5 text-slate-700 bg-slate-200/70 hover:bg-slate-300 hover:text-slate-900 rounded-md font-semibold text-[10px] sm:text-[11px] transition-colors shrink-0"
              title="Désélectionner et valider"
            >
              <Check className="w-3 h-3 text-emerald-600" />
              <span className="hidden xs:inline">Terminer</span>
            </button>
          </div>
        )}

        {/* EXPANDABLE COMPACT CONTROLS */}
        {isExpanded && (
          <div className="p-2 sm:p-2.5 space-y-2 max-h-[50vh] sm:max-h-none overflow-y-auto">
            {/* CASE 1: CONTEXTUAL EDITING CONTROLS */}
            {selectedElement && activeTab === 'contextual' ? (
              <div className="space-y-1.5 animate-fade-in text-xs">
                {/* 1A. COMPACT TEXT ELEMENT CONTROLS */}
                {isTextElement && textElem && (
                  <div className="space-y-1.5">
                    {/* PRIMARY ROW: TEXT INPUT & FONT */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={textElem.text}
                          onChange={(e) => onUpdateElement({ ...textElem, text: e.target.value })}
                          placeholder="Votre texte..."
                          className="w-full pl-2.5 pr-7 py-1 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                          autoFocus
                        />
                        {textElem.text && (
                          <button
                            type="button"
                            onClick={() => onUpdateElement({ ...textElem, text: '' })}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                            title="Effacer le texte"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <select
                        value={textElem.fontFamily}
                        onChange={(e) => onUpdateElement({ ...textElem, fontFamily: e.target.value })}
                        className="px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-semibold focus:ring-1 focus:ring-slate-900 shrink-0"
                      >
                        {AVAILABLE_FONTS.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* SECONDARY ROW: COMPACT SIZE, ALIGN, COLOR, ROTATE, ACTIONS */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-slate-100 text-[11px]">
                      {/* Font Size Stepper */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase hidden xs:inline">
                          Taille:
                        </span>
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
                          <button
                            onClick={() =>
                              onUpdateElement({ ...textElem, fontSize: Math.max(12, textElem.fontSize - 3) })
                            }
                            className="w-5 h-5 flex items-center justify-center text-slate-700 hover:text-slate-950 font-bold"
                            title="Diminuer"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="w-8 text-center font-mono font-bold text-slate-800 text-[10px]">
                            {textElem.fontSize}
                          </span>
                          <button
                            onClick={() =>
                              onUpdateElement({ ...textElem, fontSize: Math.min(96, textElem.fontSize + 3) })
                            }
                            className="w-5 h-5 flex items-center justify-center text-slate-700 hover:text-slate-950 font-bold"
                            title="Agrandir"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>

                      {/* Text Alignment */}
                      <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
                        <button
                          onClick={() => onUpdateElement({ ...textElem, textAlign: 'left' })}
                          className={`p-1 rounded-md transition-colors ${
                            textElem.textAlign === 'left' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'
                          }`}
                          title="Aligner à gauche"
                        >
                          <AlignLeft className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onUpdateElement({ ...textElem, textAlign: 'center' })}
                          className={`p-1 rounded-md transition-colors ${
                            textElem.textAlign === 'center' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'
                          }`}
                          title="Centrer"
                        >
                          <AlignCenter className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onUpdateElement({ ...textElem, textAlign: 'right' })}
                          className={`p-1 rounded-md transition-colors ${
                            textElem.textAlign === 'right' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'
                          }`}
                          title="Aligner à droite"
                        >
                          <AlignRight className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Color Picker & Presets */}
                      <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-1 py-0.5 rounded-lg">
                        <input
                          type="color"
                          value={textElem.color}
                          onChange={(e) => onUpdateElement({ ...textElem, color: e.target.value })}
                          className="w-4 h-4 rounded border p-0 cursor-pointer"
                          title="Couleur personnalisée"
                        />
                        <div className="flex items-center gap-1">
                          {['#ffffff', '#111827', '#F59E0B', '#EF4444', '#10B981', '#3B82F6'].map((hx) => (
                            <button
                              key={hx}
                              onClick={() => onUpdateElement({ ...textElem, color: hx })}
                              className={`w-3.5 h-3.5 rounded-full border transition-transform shrink-0 ${
                                textElem.color.toLowerCase() === hx.toLowerCase()
                                  ? 'scale-125 ring-1 ring-slate-900 ring-offset-1'
                                  : 'border-slate-300 hover:scale-110'
                              }`}
                              style={{ backgroundColor: hx }}
                              title={hx}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Rotation & Center */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            onUpdateElement({
                              ...textElem,
                              rotation: ((textElem.rotation || 0) - 15 + 360) % 360
                            })
                          }
                          className="flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-[10px]"
                          title="Pivoter -15°"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>-15°</span>
                        </button>
                        <button
                          onClick={() =>
                            onUpdateElement({
                              ...textElem,
                              rotation: ((textElem.rotation || 0) + 15) % 360
                            })
                          }
                          className="flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-[10px]"
                          title="Pivoter +15°"
                        >
                          <RotateCw className="w-2.5 h-2.5" />
                          <span>+15°</span>
                        </button>
                        <button
                          onClick={() => onUpdateElement({ ...textElem, x: 50, y: 50, rotation: 0 })}
                          className="flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-[10px]"
                          title="Centrer"
                        >
                          <Crosshair className="w-2.5 h-2.5 text-slate-500" />
                          <span className="hidden sm:inline">Centrer</span>
                        </button>
                      </div>

                      {/* Duplicate & Delete */}
                      <div className="flex items-center gap-1 ml-auto">
                        <button
                          onClick={() => onDuplicateElement(selectedElement.id)}
                          className="flex items-center gap-1 px-2 py-0.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md font-semibold transition-colors text-[10px]"
                          title="Dupliquer"
                        >
                          <Copy className="w-3 h-3" />
                          <span className="hidden sm:inline">Dupliquer</span>
                        </button>
                        <button
                          onClick={() => onDeleteElement(selectedElement.id)}
                          className="flex items-center gap-1 px-2 py-0.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md font-bold transition-colors text-[10px]"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span className="hidden sm:inline">Supprimer</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 1B. COMPACT IMAGE / LOGO ELEMENT CONTROLS */}
                {isImageElement && imageElem && (
                  <div className="space-y-1.5">
                    {/* PRIMARY ROW: SIZE SLIDER & CENTERING */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                        <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">
                          Taille:
                        </span>
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5 shrink-0">
                          <button
                            onClick={() => {
                              const newW = Math.max(12, imageElem.width - 4);
                              onUpdateElement({
                                ...imageElem,
                                width: newW,
                                height: newW / (imageElem.aspectRatio || 1)
                              });
                            }}
                            className="w-5 h-5 flex items-center justify-center text-slate-700 hover:text-slate-950 font-bold"
                            title="Réduire"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="w-8 text-center font-mono font-bold text-slate-800 text-[10px]">
                            {Math.round(imageElem.width)}%
                          </span>
                          <button
                            onClick={() => {
                              const newW = Math.min(95, imageElem.width + 4);
                              onUpdateElement({
                                ...imageElem,
                                width: newW,
                                height: newW / (imageElem.aspectRatio || 1)
                              });
                            }}
                            className="w-5 h-5 flex items-center justify-center text-slate-700 hover:text-slate-950 font-bold"
                            title="Agrandir"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        <input
                          type="range"
                          min={12}
                          max={95}
                          value={imageElem.width}
                          onChange={(e) => {
                            const w = Number(e.target.value);
                            onUpdateElement({
                              ...imageElem,
                              width: w,
                              height: w / (imageElem.aspectRatio || 1)
                            });
                          }}
                          className="flex-1 min-w-[60px] accent-slate-900 cursor-pointer h-1 bg-slate-200 rounded-lg"
                        />
                      </div>

                      <button
                        onClick={() => onUpdateElement({ ...imageElem, x: 50, y: 50 })}
                        className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold transition-colors shrink-0 text-[10px]"
                        title="Centrer le visuel"
                      >
                        <Crosshair className="w-3 h-3 text-slate-600" />
                        <span>Centrer</span>
                      </button>
                    </div>

                    {/* SECONDARY ROW: ROTATION, REPLACE, DUPLICATE, DELETE */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-slate-100 text-[11px]">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            onUpdateElement({
                              ...imageElem,
                              rotation: ((imageElem.rotation || 0) - 15 + 360) % 360
                            })
                          }
                          className="flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700 font-medium text-[10px]"
                          title="Pivoter -15°"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>-15°</span>
                        </button>
                        <button
                          onClick={() =>
                            onUpdateElement({
                              ...imageElem,
                              rotation: ((imageElem.rotation || 0) + 15) % 360
                            })
                          }
                          className="flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700 font-medium text-[10px]"
                          title="Pivoter +15°"
                        >
                          <RotateCw className="w-2.5 h-2.5" />
                          <span>+15°</span>
                        </button>
                        <span className="text-[10px] font-mono text-slate-500 ml-0.5">
                          {imageElem.rotation || 0}°
                        </span>
                      </div>

                      <label className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold cursor-pointer transition-colors text-[10px]">
                        <Upload className="w-3 h-3 text-slate-600" />
                        <span>Remplacer</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleReplaceImage(f);
                            e.target.value = '';
                          }}
                        />
                      </label>

                      <div className="flex items-center gap-1 ml-auto">
                        <button
                          onClick={() => onDuplicateElement(selectedElement.id)}
                          className="flex items-center gap-1 px-2 py-0.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md font-semibold transition-colors text-[10px]"
                          title="Dupliquer"
                        >
                          <Copy className="w-3 h-3" />
                          <span className="hidden sm:inline">Dupliquer</span>
                        </button>
                        <button
                          onClick={() => onDeleteElement(selectedElement.id)}
                          className="flex items-center gap-1 px-2 py-0.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md font-bold transition-colors text-[10px]"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span className="hidden sm:inline">Supprimer</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* CASE 2: COMPACT OPTIONS PALETTE (Garment Colors, Sizes, Tools) */
              <div className="space-y-1.5 animate-fade-in text-xs">
                {/* ROW 1: ARTICLE SELECTOR, COLOR SWATCHES & SIZES */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5">
                  {/* Article button & Colors */}
                  <div className="flex items-center gap-1.5 max-w-full">
                    {onOpenArticleDrawer && (
                      <button
                        onClick={onOpenArticleDrawer}
                        className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-bold text-[10px] sm:text-[11px] shrink-0 border border-slate-200/80 transition-colors"
                        title="Changer d'article"
                      >
                        <Shirt className="w-3 h-3 text-slate-700" />
                        <span className="truncate max-w-[80px] sm:max-w-none">{article.name}</span>
                      </button>
                    )}

                    <div className="w-[1px] h-4 bg-slate-200 shrink-0 mx-0.5" />

                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                      Couleur:
                    </span>
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                      {article.colors.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => onSelectColor(c)}
                          title={c.name}
                          className={`w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full border transition-all shrink-0 ${
                            selectedColor.hex.toLowerCase() === c.hex.toLowerCase()
                              ? 'ring-2 ring-slate-900 ring-offset-1 scale-110 border-transparent shadow-xs'
                              : 'border-slate-300 hover:scale-105'
                          }`}
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Sizes */}
                  <div className="flex items-center gap-1 self-start sm:self-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                      Taille:
                    </span>
                    <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg overflow-x-auto no-scrollbar">
                      {article.sizes.map((sz) => (
                        <button
                          key={sz}
                          onClick={() => onSelectSize(sz)}
                          className={`px-1.5 py-0.5 sm:px-2 sm:py-0.5 text-[10px] sm:text-[11px] font-bold rounded-md transition-all shrink-0 ${
                            selectedSize === sz
                              ? 'bg-slate-900 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ROW 2: CREATIVE TOOLS (+ TEXTE, + LOGO, MOTIF IA, UNDO/REDO) */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-slate-100">
                  <div className="flex items-center gap-1 flex-wrap">
                    <button
                      onClick={handleQuickAddText}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shadow-2xs"
                      title="Ajouter un texte"
                    >
                      <Type className="w-3 h-3 text-slate-600" />
                      <span>+ Texte</span>
                    </button>

                    <label className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors shadow-2xs">
                      <ImageIcon className="w-3 h-3 text-slate-600" />
                      <span>+ Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) onAddImage(f);
                          e.target.value = '';
                        }}
                      />
                    </label>

                    <button
                      onClick={onOpenAi}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-amber-950 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-lg transition-colors shadow-2xs"
                      title="Générer un motif avec l'IA"
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>Motif IA</span>
                    </button>
                  </div>

                  {/* Undo / Redo */}
                  <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg ml-auto">
                    <button
                      onClick={onUndo}
                      disabled={!canUndo}
                      className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-md transition-colors"
                      title="Annuler (Ctrl+Z)"
                    >
                      <Undo2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={onRedo}
                      disabled={!canRedo}
                      className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-md transition-colors"
                      title="Rétablir (Ctrl+Y)"
                    >
                      <Redo2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ACTIVE ELEMENTS COMPACT STRIP */}
            {allElements.length > 0 && (
              <div className="pt-1.5 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[10px]">
                <span className="flex items-center gap-1 font-bold text-slate-400 shrink-0 uppercase tracking-wider text-[9px]">
                  <Layers className="w-2.5 h-2.5 text-slate-400" />
                  <span>Éléments</span> ({allElements.length}):
                </span>
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                  {allElements.map((el) => {
                    const isSelected = selectedElement?.id === el.id;
                    const isText = el.type === 'text';
                    const textContent = isText ? (el as TextCustomElement).text : '';
                    const label = isText ? textContent || 'Texte' : (el as ImageCustomElement).originalName || 'Visuel';

                    return (
                      <button
                        key={el.id}
                        onClick={() => {
                          onSelectElementId?.(el.id);
                          setActiveTab('contextual');
                          setIsExpanded(true);
                        }}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-all shrink-0 font-medium ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-2xs font-bold'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                        title={label}
                      >
                        {isText ? <Type className="w-2.5 h-2.5" /> : <ImageIcon className="w-2.5 h-2.5" />}
                        <span className="max-w-[70px] sm:max-w-[100px] truncate">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* BOTTOM COMPACT FIXED STRIP: PRICE, QUANTITY & ORDER */}
        <div className="flex items-center justify-between px-3 py-1.5 sm:px-3.5 sm:py-2 border-t border-slate-100 bg-slate-50/80 gap-2">
          {/* Price */}
          <div className="flex items-baseline gap-1 shrink-0">
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total:
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-900 font-mono">
              {(price * quantity).toFixed(2)} €
            </span>
          </div>

          {/* Controls: Quantity + Commander + Toggle */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Quantity Stepper */}
            <div className="flex items-center border border-slate-200 rounded-lg bg-white p-0.5 text-xs">
              <button
                onClick={() => onUpdateQuantity(Math.max(1, quantity - 1))}
                className="w-5 h-5 sm:w-5 sm:h-5 flex items-center justify-center text-slate-600 hover:text-slate-900 font-bold"
                title="Diminuer"
              >
                <Minus className="w-2.5 h-2.5" />
              </button>
              <span className="w-5 text-center font-mono font-bold text-slate-900 text-xs">
                {quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(quantity + 1)}
                className="w-5 h-5 sm:w-5 sm:h-5 flex items-center justify-center text-slate-600 hover:text-slate-900 font-bold"
                title="Augmenter"
              >
                <Plus className="w-2.5 h-2.5" />
              </button>
            </div>

            {/* Commander Button */}
            <button
              onClick={onAddToCart}
              className="flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-sm hover:shadow transition-all active:scale-95 shrink-0"
            >
              <ShoppingBag className="w-3 h-3 text-amber-400" />
              <span>Commander</span>
            </button>

            {/* Collapse / Expand toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200/70 transition-colors"
              title={isExpanded ? 'Réduire' : 'Agrandir'}
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
