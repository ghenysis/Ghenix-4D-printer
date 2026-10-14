import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GarmentArticle,
  GarmentColor,
  GarmentSize,
  PrintTechniqueId,
  CustomDesign,
  CustomElement,
  TextCustomElement,
  ImageCustomElement,
  CartItem
} from './types';
import {
  getStoredCatalog,
  getStoredCart,
  saveCart,
  calculateItemPrice
} from './services/storage';
import { PRINT_TECHNIQUES } from './data/defaultCatalog';
import { renderFaceToDataUrl } from './utils/canvasRenderer';
import { TopNavbar } from './components/customizer/TopNavbar';
import { GarmentViewer3D } from './components/3d/GarmentViewer3D';
import { CanvasEditor2D } from './components/2d/CanvasEditor2D';
import { StudioBottomDock } from './components/customizer/StudioBottomDock';
import { ArticleSelectorDrawer } from './components/customizer/ArticleSelectorDrawer';
import { AiPanel } from './components/customizer/LovableControls';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { ExportModal } from './components/customizer/ExportModal';
import { SaveModal } from './components/customizer/SaveModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { OrderTrackingModal } from './components/tracking/OrderTrackingModal';
import { useConfigurator } from './store/useConfigurator';
import {
  Shirt,
  CheckCircle2,
  ChevronRight,
  EyeOff,
  Maximize2
} from 'lucide-react';

export default function App() {
  // Catalog & Product Selection
  const [catalog, setCatalog] = useState<GarmentArticle[]>(getStoredCatalog);
  const [selectedArticle, setSelectedArticle] = useState<GarmentArticle>(catalog[0]);
  const [selectedColor, setSelectedColor] = useState<GarmentColor>(selectedArticle.colors[0]);
  const [selectedSize, setSelectedSize] = useState<GarmentSize>(selectedArticle.sizes[2] || 'M');
  const [selectedTechnique, setSelectedTechnique] = useState<PrintTechniqueId>('dtg');

  // Visualization View Mode: 2D or 3D
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [currentFace, setCurrentFace] = useState<'front' | 'back'>('front');

  // 3D Animation and Zen Preview Mode
  const [isWindActive, setIsWindActive] = useState(false);
  const [isAutoRotate, setIsAutoRotate] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [isArticleDrawerOpen, setIsArticleDrawerOpen] = useState(false);

  // Sync with Lovable 3D store
  const storeSide = useConfigurator((s) => s.side);

  useEffect(() => {
    useConfigurator.getState().setColor(selectedColor.hex);
  }, [selectedColor.hex]);

  useEffect(() => {
    useConfigurator.getState().setSide(currentFace);
  }, [currentFace]);

  useEffect(() => {
    if (storeSide !== currentFace) {
      setCurrentFace(storeSide);
    }
  }, [storeSide]);

  // Active Design
  const [design, setDesign] = useState<CustomDesign>(() => ({
    id: `des-${Date.now()}`,
    name: 'Mon T-Shirt Ghenix',
    articleId: catalog[0].id,
    selectedColorId: catalog[0].colors[0].id,
    selectedSize: 'M',
    selectedTechnique: 'dtg',
    front: {
      printZone: catalog[0].frontPrintZone,
      elements: [
        {
          id: 'text-default-1',
          type: 'text',
          x: 50,
          y: 40,
          width: 65,
          height: 18,
          rotation: 0,
          zIndex: 1,
          opacity: 1,
          text: 'GHENIX',
          fontFamily: 'Space Grotesk',
          fontSize: 36,
          color: '#F9FAFB',
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'center',
          letterSpacing: 2
        }
      ]
    },
    back: {
      printZone: catalog[0].backPrintZone,
      elements: []
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  // Undo / Redo History Stack
  const [history, setHistory] = useState<CustomDesign[]>([design]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const updateDesignWithHistory = useCallback((newDesign: CustomDesign) => {
    setDesign(newDesign);
    setHistory((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [...sliced, newDesign];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const targetIdx = historyIndex - 1;
      setHistoryIndex(targetIdx);
      setDesign(history[targetIdx]);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const targetIdx = historyIndex + 1;
      setHistoryIndex(targetIdx);
      setDesign(history[targetIdx]);
    }
  }, [historyIndex, history]);

  // Selected Element (null by default to prevent accidental intrusive popups)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Cart & Order State
  const [cart, setCart] = useState<CartItem[]>(getStoredCart);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  // 3D Screenshot capture function ref
  const capture3DRef = useRef<(() => string) | null>(null);

  // Keyboard Shortcuts for Undo (Ctrl+Z) and Redo (Ctrl+Y / Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // BI-DIRECTIONAL REAL-TIME SYNCHRONIZATION:
  // Whenever design elements change on Front or Back, generate high-res transparent decals for the 3D model!
  useEffect(() => {
    let active = true;

    // Front decal sync
    if (design.front.elements.length > 0) {
      renderFaceToDataUrl(design.front).then((url) => {
        if (active) {
          useConfigurator.getState().setLogo('front', {
            url,
            x: 0,
            y: 0.04,
            scale: 0.17,
            rotation: 0
          });
        }
      });
    } else {
      useConfigurator.getState().setLogo('front', null);
    }

    // Back decal sync
    if (design.back.elements.length > 0) {
      renderFaceToDataUrl(design.back).then((url) => {
        if (active) {
          useConfigurator.getState().setLogo('back', {
            url,
            x: 0,
            y: 0.06,
            scale: 0.17,
            rotation: 0
          });
        }
      });
    } else {
      useConfigurator.getState().setLogo('back', null);
    }

    return () => {
      active = false;
    };
  }, [design.front, design.back]);

  const handleSelectArticle = (art: GarmentArticle) => {
    setSelectedArticle(art);
    setSelectedColor(art.colors[0]);
    setSelectedSize(art.sizes[0] || 'M');
    if (!art.allowedTechniques.includes(selectedTechnique)) {
      setSelectedTechnique(art.allowedTechniques[0]);
    }
  };

  // Current face design for 2D mode
  const currentFaceDesign = currentFace === 'front' ? design.front : design.back;

  const handleUpdateElement = (updated: CustomElement) => {
    const updatedElements = currentFaceDesign.elements.map((el) =>
      el.id === updated.id ? updated : el
    );
    updateDesignWithHistory({
      ...design,
      [currentFace]: {
        ...currentFaceDesign,
        elements: updatedElements
      }
    });
  };

  const handleDeleteElement = (id: string) => {
    const updatedElements = currentFaceDesign.elements.filter((el) => el.id !== id);
    updateDesignWithHistory({
      ...design,
      [currentFace]: {
        ...currentFaceDesign,
        elements: updatedElements
      }
    });
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const handleDuplicateElement = (id: string) => {
    const target = currentFaceDesign.elements.find((el) => el.id === id);
    if (!target) return;
    const duplicated: CustomElement = {
      ...target,
      id: `dup-${Date.now()}`,
      x: Math.min(85, target.x + 5),
      y: Math.min(85, target.y + 5),
      zIndex: currentFaceDesign.elements.length + 1
    };
    updateDesignWithHistory({
      ...design,
      [currentFace]: {
        ...currentFaceDesign,
        elements: [...currentFaceDesign.elements, duplicated]
      }
    });
    setSelectedElementId(duplicated.id);
  };

  const handleAddText = (text: string, fontFamily: string, color: string) => {
    const newEl: TextCustomElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 50,
      y: currentFaceDesign.elements.length === 0 ? 44 : Math.min(80, 40 + currentFaceDesign.elements.length * 8),
      width: 60,
      height: 18,
      rotation: 0,
      zIndex: currentFaceDesign.elements.length + 1,
      opacity: 1,
      text,
      fontFamily,
      fontSize: 36,
      color,
      fontWeight: 'bold',
      fontStyle: 'normal',
      textAlign: 'center',
      letterSpacing: 2
    };
    updateDesignWithHistory({
      ...design,
      [currentFace]: {
        ...currentFaceDesign,
        elements: [...currentFaceDesign.elements, newEl]
      }
    });
    setSelectedElementId(newEl.id);
  };

  const handleAddImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const aspect = img.width / img.height || 1;
        const width = 45;
        const height = width / aspect;
        const newEl: ImageCustomElement = {
          id: `img-${Date.now()}`,
          type: 'image',
          x: 50,
          y: 48,
          width,
          height,
          rotation: 0,
          zIndex: currentFaceDesign.elements.length + 1,
          opacity: 1,
          url: dataUrl,
          originalName: file.name,
          originalWidth: img.width,
          originalHeight: img.height,
          aspectRatio: aspect
        };
        updateDesignWithHistory({
          ...design,
          [currentFace]: {
            ...currentFaceDesign,
            elements: [...currentFaceDesign.elements, newEl]
          }
        });
        setSelectedElementId(newEl.id);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Add to Cart
  const handleAddToCart = () => {
    const technique =
      PRINT_TECHNIQUES.find((t) => t.id === selectedTechnique) || PRINT_TECHNIQUES[0];
    const facesUsed: ('front' | 'back')[] = [];
    if (design.front.elements.length > 0) facesUsed.push('front');
    if (design.back.elements.length > 0) facesUsed.push('back');
    if (facesUsed.length === 0) facesUsed.push('front');

    const pricing = calculateItemPrice(
      selectedArticle,
      selectedTechnique,
      facesUsed.length,
      orderQuantity
    );

    const newItem: CartItem = {
      id: `cart-${Date.now()}`,
      article: selectedArticle,
      design: { ...design },
      color: selectedColor,
      size: selectedSize,
      technique,
      quantity: orderQuantity,
      unitPrice: pricing.unitPrice,
      totalPrice: pricing.totalPrice,
      facesUsed
    };

    const updatedCart = [newItem, ...cart];
    setCart(updatedCart);
    saveCart(updatedCart);

    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const handleUpdateCartQty = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(itemId);
      return;
    }
    const updated = cart.map((item) => {
      if (item.id === itemId) {
        const pricing = calculateItemPrice(
          item.article,
          item.technique.id,
          item.facesUsed.length,
          newQty
        );
        return {
          ...item,
          quantity: newQty,
          unitPrice: pricing.unitPrice,
          totalPrice: pricing.totalPrice
        };
      }
      return item;
    });
    setCart(updated);
    saveCart(updated);
  };

  const handleRemoveCartItem = (itemId: string) => {
    const updated = cart.filter((item) => item.id !== itemId);
    setCart(updated);
    saveCart(updated);
  };

  // Live pricing calculation
  const facesCustomizedCount =
    (design.front.elements.length > 0 ? 1 : 0) + (design.back.elements.length > 0 ? 1 : 0) || 1;
  const livePricing = calculateItemPrice(
    selectedArticle,
    selectedTechnique,
    facesCustomizedCount,
    orderQuantity
  );

  const selectedElement =
    currentFaceDesign.elements.find((el) => el.id === selectedElementId) || null;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 text-slate-900 font-sans">
      {/* 1. TOP NAVBAR (Hidden in Zen Preview Mode) */}
      {!isZenMode && (
        <TopNavbar
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
          cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
          onOpenSave={() => setIsSaveOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
          onOpenTracking={() => setIsTrackingOpen(true)}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />
      )}

      {/* 2. FULLSCREEN HERO CANVAS */}
      <main className="flex-1 relative flex flex-col overflow-hidden">
        {viewMode === '3d' ? (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* FULL 3D VIEWER */}
            <GarmentViewer3D
              article={selectedArticle}
              color={selectedColor}
              frontDesign={design.front}
              backDesign={design.back}
              currentFace={currentFace}
              onFaceChange={setCurrentFace}
              isWindActive={isWindActive}
              onToggleWind={() => setIsWindActive(!isWindActive)}
              isAutoRotate={isAutoRotate}
              onToggleAutoRotate={() => setIsAutoRotate(!isAutoRotate)}
              isZenMode={isZenMode}
              onToggleZenMode={() => setIsZenMode(!isZenMode)}
              onCaptureRef={(captureFn) => {
                capture3DRef.current = captureFn;
              }}
              onDeselectElement={() => setSelectedElementId(null)}
              className="w-full h-full"
            />

            {/* FLOATING MODEL & SIZE CAPSULE (Hidden in Zen Mode) */}
            {!isZenMode && (
              <div className="absolute top-5 left-5 z-20 hidden sm:block">
                <button
                  onClick={() => setIsArticleDrawerOpen(true)}
                  className="flex items-center gap-2.5 px-3.5 py-2 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm hover:bg-white transition-all text-xs group"
                >
                  <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                    <Shirt className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-slate-900 block leading-tight">
                      {selectedArticle.name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Taille : <strong className="text-slate-800">{selectedSize}</strong>
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}

            {/* FLOATING AI GENERATOR PANEL */}
            {showAiPanel && !isZenMode && <AiPanel onClose={() => setShowAiPanel(false)} />}

            {/* FLOATING BOTTOM DOCK (Hidden in Zen Mode) */}
            {!isZenMode && (
              <div className="absolute bottom-5 inset-x-4 z-20 flex justify-center pointer-events-auto">
                <StudioBottomDock
                  article={selectedArticle}
                  selectedColor={selectedColor}
                  onSelectColor={setSelectedColor}
                  selectedSize={selectedSize}
                  onSelectSize={setSelectedSize}
                  onOpenAi={() => setShowAiPanel(!showAiPanel)}
                  price={livePricing.unitPrice}
                  quantity={orderQuantity}
                  onUpdateQuantity={setOrderQuantity}
                  onAddToCart={handleAddToCart}
                  onOpenExport={() => setIsExportOpen(true)}
                  selectedElement={selectedElement}
                  allElements={currentFaceDesign.elements}
                  onSelectElementId={setSelectedElementId}
                  onUpdateElement={handleUpdateElement}
                  onDeleteElement={handleDeleteElement}
                  onDuplicateElement={handleDuplicateElement}
                  onDeselectElement={() => setSelectedElementId(null)}
                  onAddText={handleAddText}
                  onAddImage={handleAddImage}
                  canUndo={historyIndex > 0}
                  canRedo={historyIndex < history.length - 1}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                />
              </div>
            )}

            {/* ZEN MODE EXIT BUTTON (Visible only when in Zen Mode) */}
            {isZenMode && (
              <div className="absolute top-5 right-5 z-40">
                <button
                  onClick={() => setIsZenMode(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900/90 text-white rounded-2xl shadow-lg backdrop-blur-md text-xs font-bold hover:bg-slate-900 transition-all"
                >
                  <EyeOff className="w-4 h-4 text-amber-400" />
                  <span>Quitter l'aperçu agrandi</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* 2D PRECISION CANVAS MODE */
          <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
            <CanvasEditor2D
              article={selectedArticle}
              color={selectedColor}
              faceDesign={currentFaceDesign}
              faceName={currentFace}
              selectedElementId={selectedElementId}
              onSelectElement={setSelectedElementId}
              onUpdateElement={handleUpdateElement}
              onDeleteElement={handleDeleteElement}
              onDuplicateElement={handleDuplicateElement}
              onFaceChange={setCurrentFace}
              className="w-full h-full max-w-4xl"
            />

            {/* FLOATING BOTTOM DOCK IN 2D */}
            <div className="absolute bottom-5 inset-x-4 z-20 flex justify-center pointer-events-auto">
              <StudioBottomDock
                article={selectedArticle}
                selectedColor={selectedColor}
                onSelectColor={setSelectedColor}
                selectedSize={selectedSize}
                onSelectSize={setSelectedSize}
                onOpenAi={() => setShowAiPanel(!showAiPanel)}
                price={livePricing.unitPrice}
                quantity={orderQuantity}
                onUpdateQuantity={setOrderQuantity}
                onAddToCart={handleAddToCart}
                onOpenExport={() => setIsExportOpen(true)}
                selectedElement={selectedElement}
                allElements={currentFaceDesign.elements}
                onSelectElementId={setSelectedElementId}
                onUpdateElement={handleUpdateElement}
                onDeleteElement={handleDeleteElement}
                onDuplicateElement={handleDuplicateElement}
                onDeselectElement={() => setSelectedElementId(null)}
                onAddText={handleAddText}
                onAddImage={handleAddImage}
                canUndo={historyIndex > 0}
                canRedo={historyIndex < history.length - 1}
                onUndo={handleUndo}
                onRedo={handleRedo}
              />
            </div>
          </div>
        )}

        {/* ADD TO CART TOAST FEEDBACK */}
        {addedNotice && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 px-4 py-2.5 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-fade-in border border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Article personnalisé ajouté au panier</span>
          </div>
        )}
      </main>

      {/* 3. DRAWERS & MODALS */}
      {/* ARTICLE & SIZE SELECTOR DRAWER */}
      <ArticleSelectorDrawer
        isOpen={isArticleDrawerOpen}
        onClose={() => setIsArticleDrawerOpen(false)}
        catalog={catalog}
        selectedArticle={selectedArticle}
        onSelectArticle={handleSelectArticle}
        selectedSize={selectedSize}
        onSelectSize={setSelectedSize}
      />

      {/* CART DRAWER */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* CHECKOUT MODAL */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        onOrderSuccess={() => {
          setCart([]);
          saveCart([]);
        }}
      />

      {/* EXPORT / PRINT FILES DOWNLOAD */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        article={selectedArticle}
        color={selectedColor}
        frontDesign={design.front}
        backDesign={design.back}
        selectedTechnique={selectedTechnique}
        get3DCaptureUrl={capture3DRef.current ? () => capture3DRef.current!() : undefined}
      />

      {/* SAVE / LOAD DESIGN */}
      <SaveModal
        isOpen={isSaveOpen}
        onClose={() => setIsSaveOpen(false)}
        currentDesign={design}
        onLoadDesign={(loaded) => {
          updateDesignWithHistory(loaded);
          const foundArt = catalog.find((a) => a.id === loaded.articleId) || catalog[0];
          setSelectedArticle(foundArt);
          const foundCol =
            foundArt.colors.find((c) => c.id === loaded.selectedColorId) || foundArt.colors[0];
          setSelectedColor(foundCol);
          setSelectedSize(loaded.selectedSize || 'M');
          setSelectedTechnique(loaded.selectedTechnique || 'dtg');
        }}
      />

      {/* WORKSHOP ADMIN CONSOLE */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onCatalogUpdated={(newCat) => {
          setCatalog(newCat);
          const current = newCat.find((a) => a.id === selectedArticle.id);
          if (current) setSelectedArticle(current);
        }}
      />

      {/* ORDER TRACKING MODAL */}
      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
      />
    </div>
  );
}
