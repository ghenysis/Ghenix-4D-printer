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
  SlidersHorizontal,
  Check
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
  onRedo
}: StudioBottomDockProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'contextual' | 'article'>('contextual');

  const isTextElement = selectedElement?.type === 'text';
  const textElem = isTextElement ? (selectedElement as TextCustomElement) : null;
  const isImageElement = selectedElement?.type === 'image' || selectedElement?.type === 'clipart';
  const imageElem = isImageElement ? (selectedElement as ImageCustomElement) : null;

  // Handle image replacement directly on selected image element
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

  // Quick add text handler without modal popup
  const handleQuickAddText = () => {
    onAddText('GHENIX', 'Space Grotesk', '#ffffff');
    setActiveTab('contextual');
  };

  return (
    <div className="relative z-30 max-w-4xl w-full mx-auto flex flex-col items-center">
      {/* UNIFIED SINGLE DOCK CONTAINER (Zero intrusive floating popups) */}
      <div className="w-full bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-xl transition-all overflow-hidden flex flex-col">
        {/* CONTEXTUAL TOP BAR (When element is selected, provides header & mode switch) */}
        {selectedElement && (
          <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-200/70 bg-slate-50/80 text-xs">
            {/* Left: Element Indicator & Tab Switcher */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 font-bold text-slate-900 bg-white border border-slate-200/80 px-2.5 py-1 rounded-xl shadow-2xs">
                {isTextElement ? (
                  <Type className="w-3.5 h-3.5 text-amber-500" />
                ) : (
                  <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span className="max-w-[130px] sm:max-w-[200px] truncate">
                  {isTextElement
                    ? `Texte : "${textElem?.text || ''}"`
                    : imageElem?.originalName || 'Image / Motif'}
                </span>
              </span>

              {/* View Switcher between Element controls and Article controls */}
              <div className="flex items-center bg-slate-200/60 p-0.5 rounded-lg text-[11px] font-semibold">
                <button
                  onClick={() => setActiveTab('contextual')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    activeTab === 'contextual'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Réglages
                </button>
                <button
                  onClick={() => setActiveTab('article')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    activeTab === 'article'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Vêtement
                </button>
              </div>
            </div>

            {/* Right: Accidental tap / Dismiss button (Immediately deselects) */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onDeselectElement}
                className="flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg font-medium transition-colors"
                title="Désélectionner l'élément"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Terminer</span>
              </button>
            </div>
          </div>
        )}

        {/* EXPANDABLE INTERACTIVE ZONE */}
        {isExpanded && (
          <div className="p-3 space-y-3">
            {/* CASE 1: CONTEXTUAL VIEW FOR SELECTED ELEMENT */}
            {selectedElement && activeTab === 'contextual' ? (
              <div className="space-y-2.5 animate-fade-in text-xs">
                {/* 1A. TEXT ELEMENT CONTROLS */}
                {isTextElement && textElem && (
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    {/* Inline Text Input (No modal!) */}
                    <div className="flex-1 min-w-[160px]">
                      <input
                        type="text"
                        value={textElem.text}
                        onChange={(e) => onUpdateElement({ ...textElem, text: e.target.value })}
                        placeholder="Votre texte personnalisé..."
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                        autoFocus
                      />
                    </div>

                    {/* Font Selector */}
                    <select
                      value={textElem.fontFamily}
                      onChange={(e) => onUpdateElement({ ...textElem, fontFamily: e.target.value })}
                      className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 font-medium focus:ring-1 focus:ring-slate-900"
                    >
                      {AVAILABLE_FONTS.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>

                    {/* Font Size Stepper */}
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5">
                      <button
                        onClick={() =>
                          onUpdateElement({ ...textElem, fontSize: Math.max(12, textElem.fontSize - 3) })
                        }
                        className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 font-bold"
                        title="Diminuer la taille"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-9 text-center font-mono font-bold text-slate-800 text-[11px]">
                        {textElem.fontSize}px
                      </span>
                      <button
                        onClick={() =>
                          onUpdateElement({ ...textElem, fontSize: Math.min(96, textElem.fontSize + 3) })
                        }
                        className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 font-bold"
                        title="Agrandir la taille"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Text Color Picker & Presets */}
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-xl">
                      <input
                        type="color"
                        value={textElem.color}
                        onChange={(e) => onUpdateElement({ ...textElem, color: e.target.value })}
                        className="w-5 h-5 rounded border p-0 cursor-pointer"
                        title="Palette complète"
                      />
                      {['#ffffff', '#111827', '#F59E0B', '#EF4444', '#10B981', '#3B82F6'].map((hx) => (
                        <button
                          key={hx}
                          onClick={() => onUpdateElement({ ...textElem, color: hx })}
                          className={`w-4 h-4 rounded-full border transition-transform ${
                            textElem.color.toLowerCase() === hx.toLowerCase()
                              ? 'scale-125 ring-1 ring-slate-900 ring-offset-1'
                              : 'border-slate-300 hover:scale-110'
                          }`}
                          style={{ backgroundColor: hx }}
                        />
                      ))}
                    </div>

                    {/* Text Alignment */}
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-xl">
                      <button
                        onClick={() => onUpdateElement({ ...textElem, textAlign: 'left' })}
                        className={`p-1.5 rounded-lg transition-colors ${
                          textElem.textAlign === 'left' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'
                        }`}
                        title="Aligner à gauche"
                      >
                        <AlignLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onUpdateElement({ ...textElem, textAlign: 'center' })}
                        className={`p-1.5 rounded-lg transition-colors ${
                          textElem.textAlign === 'center' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'
                        }`}
                        title="Centrer"
                      >
                        <AlignCenter className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onUpdateElement({ ...textElem, textAlign: 'right' })}
                        className={`p-1.5 rounded-lg transition-colors ${
                          textElem.textAlign === 'right' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'
                        }`}
                        title="Aligner à droite"
                      >
                        <AlignRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Rotation Shortcuts */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          onUpdateElement({
                            ...textElem,
                            rotation: ((textElem.rotation || 0) - 15 + 360) % 360
                          })
                        }
                        className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                        title="Pivoter -15°"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span className="text-[10px]">-15°</span>
                      </button>
                      <button
                        onClick={() =>
                          onUpdateElement({
                            ...textElem,
                            rotation: ((textElem.rotation || 0) + 15) % 360
                          })
                        }
                        className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                        title="Pivoter +15°"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span className="text-[10px]">+15°</span>
                      </button>
                    </div>

                    {/* Actions: Duplicate & Delete */}
                    <div className="flex items-center gap-1 ml-auto">
                      <button
                        onClick={() => onDuplicateElement(selectedElement.id)}
                        className="flex items-center gap-1 px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
                        title="Dupliquer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Dupliquer</span>
                      </button>
                      <button
                        onClick={() => onDeleteElement(selectedElement.id)}
                        className="flex items-center gap-1 px-2.5 py-1 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl font-semibold transition-colors"
                        title="Supprimer cet élément"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Supprimer</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 1B. IMAGE / LOGO ELEMENT CONTROLS */}
                {isImageElement && imageElem && (
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    {/* Scale Stepper & Slider */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-500">Taille :</span>
                      <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5">
                        <button
                          onClick={() => {
                            const newW = Math.max(12, imageElem.width - 4);
                            onUpdateElement({
                              ...imageElem,
                              width: newW,
                              height: newW / (imageElem.aspectRatio || 1)
                            });
                          }}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 font-bold"
                          title="Réduire"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-10 text-center font-mono font-bold text-slate-800 text-[11px]">
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
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 font-bold"
                          title="Agrandir"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Scale Slider */}
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
                        className="w-20 sm:w-28 accent-slate-900 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                      />
                    </div>

                    {/* Rotation Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          onUpdateElement({
                            ...imageElem,
                            rotation: ((imageElem.rotation || 0) - 15 + 360) % 360
                          })
                        }
                        className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-medium"
                        title="Pivoter -15°"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>-15°</span>
                      </button>
                      <button
                        onClick={() =>
                          onUpdateElement({
                            ...imageElem,
                            rotation: ((imageElem.rotation || 0) + 15) % 360
                          })
                        }
                        className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-medium"
                        title="Pivoter +15°"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>+15°</span>
                      </button>
                      <span className="text-[10px] font-mono text-slate-500 ml-1">
                        {imageElem.rotation || 0}°
                      </span>
                    </div>

                    {/* Center Button */}
                    <button
                      onClick={() => onUpdateElement({ ...imageElem, x: 50, y: 50 })}
                      className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium"
                      title="Centrer sur la zone imprimable"
                    >
                      <Crosshair className="w-3.5 h-3.5 text-slate-600" />
                      <span>Centrer</span>
                    </button>

                    {/* Replace Image Button */}
                    <label className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5 text-slate-600" />
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

                    {/* Actions: Duplicate & Delete */}
                    <div className="flex items-center gap-1 ml-auto">
                      <button
                        onClick={() => onDuplicateElement(selectedElement.id)}
                        className="flex items-center gap-1 px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
                        title="Dupliquer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Dupliquer</span>
                      </button>
                      <button
                        onClick={() => onDeleteElement(selectedElement.id)}
                        className="flex items-center gap-1 px-2.5 py-1 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl font-semibold transition-colors"
                        title="Supprimer cet élément"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Supprimer</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* CASE 2: ARTICLE OPTIONS & CREATIVE TOOLS (When no element is selected or in 'article' tab) */
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs animate-fade-in">
                {/* ARTICLE COLORS */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 hidden sm:inline">
                    Couleur :
                  </span>
                  <div className="flex items-center gap-1.5">
                    {article.colors.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => onSelectColor(c)}
                        title={c.name}
                        className={`w-6 h-6 rounded-full border transition-all ${
                          selectedColor.hex.toLowerCase() === c.hex.toLowerCase()
                            ? 'ring-2 ring-slate-900 ring-offset-2 scale-110 border-transparent shadow-xs'
                            : 'border-slate-300 hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>

                <div className="hidden sm:block h-5 w-[1px] bg-slate-200" />

                {/* ARTICLE SIZES */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 hidden sm:inline">
                    Taille :
                  </span>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl">
                    {article.sizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => onSelectSize(sz)}
                        className={`px-2 py-0.5 text-[11px] font-bold rounded-lg transition-all ${
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

                <div className="hidden md:block h-5 w-[1px] bg-slate-200" />

                {/* CREATIVE TOOLS (+ TEXTE, + LOGO, MOTIF IA) */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleQuickAddText}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors"
                    title="Ajouter un texte personnalisé sur l'article"
                  >
                    <Type className="w-3.5 h-3.5 text-slate-600" />
                    <span>+ Texte</span>
                  </button>

                  <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl cursor-pointer transition-colors">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-600" />
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
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-colors"
                    title="Générer un motif avec l'IA"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Motif IA</span>
                  </button>

                  {/* Undo / Redo */}
                  <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-xl ml-1">
                    <button
                      onClick={onUndo}
                      disabled={!canUndo}
                      className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-lg transition-colors"
                      title="Annuler (Ctrl+Z)"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={onRedo}
                      disabled={!canRedo}
                      className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-lg transition-colors"
                      title="Rétablir (Ctrl+Y)"
                    >
                      <Redo2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ACTIVE ELEMENTS CHIPS STRIP (Visible if there are custom elements on the shirt) */}
            {allElements.length > 0 && (
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px]">
                <span className="flex items-center gap-1 font-semibold text-slate-400 shrink-0 uppercase tracking-wider text-[10px]">
                  <Layers className="w-3 h-3 text-slate-400" />
                  <span>Éléments ({allElements.length}) :</span>
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                  {allElements.map((el) => {
                    const isSelected = selectedElement?.id === el.id;
                    const isText = el.type === 'text';
                    const textContent = isText ? (el as TextCustomElement).text : '';
                    const label = isText ? textContent : (el as ImageCustomElement).originalName || 'Image';

                    return (
                      <button
                        key={el.id}
                        onClick={() => {
                          onSelectElementId?.(el.id);
                          setActiveTab('contextual');
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all shrink-0 font-medium ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                        title={label}
                      >
                        {isText ? <Type className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                        <span className="max-w-[90px] truncate">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* BOTTOM FIXED STRIP: PRICE, QUANTITY & ORDER BUTTON */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 bg-slate-50/50">
          {/* Price */}
          <div className="flex items-baseline gap-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Total :
            </span>
            <span className="text-sm font-black text-slate-900 font-mono">
              {(price * quantity).toFixed(2)} €
            </span>
          </div>

          {/* Quantity Stepper & Order Button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-slate-200 rounded-xl bg-white p-0.5 text-xs">
              <button
                onClick={() => onUpdateQuantity(Math.max(1, quantity - 1))}
                className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 font-bold"
                title="Diminuer la quantité"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center font-mono font-bold text-slate-900 text-xs">
                {quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(quantity + 1)}
                className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 font-bold"
                title="Augmenter la quantité"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <button
              onClick={onAddToCart}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>Commander</span>
            </button>

            {/* Collapse / Expand toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
              title={isExpanded ? 'Réduire' : 'Agrandir'}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
