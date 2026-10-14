import React from 'react';
import { GarmentArticle, GarmentSize } from '../../types';
import { X, Shirt, Check } from 'lucide-react';

interface ArticleSelectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: GarmentArticle[];
  selectedArticle: GarmentArticle;
  onSelectArticle: (article: GarmentArticle) => void;
  selectedSize: GarmentSize;
  onSelectSize: (size: GarmentSize) => void;
}

export function ArticleSelectorDrawer({
  isOpen,
  onClose,
  catalog,
  selectedArticle,
  onSelectArticle,
  selectedSize,
  onSelectSize
}: ArticleSelectorDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none animate-fade-in">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pr-10">
        <div className="w-screen max-w-sm bg-white shadow-2xl flex flex-col border-r border-slate-200">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shirt className="w-5 h-5 text-slate-900" />
              <h3 className="font-bold text-sm text-slate-900">
                Choix du Modèle & Tailles
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* ARTICLES LIST */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">
                Articles disponibles
              </label>
              {catalog.map((art) => {
                const isSelected = art.id === selectedArticle.id;
                return (
                  <button
                    key={art.id}
                    onClick={() => onSelectArticle(art)}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs">{art.name}</span>
                      <span className="font-bold font-mono">{art.basePrice.toFixed(2)} €</span>
                    </div>
                    <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {art.weightGsm}g/m² · {art.material}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* SIZES LIST */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">
                Sélectionnez votre taille
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedArticle.sizes.map((sz) => {
                  const isSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      onClick={() => onSelectSize(sz)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-xs ring-2 ring-slate-900/20'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-100">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Valider la sélection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
