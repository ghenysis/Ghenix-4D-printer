import React, { useState, useEffect } from 'react';
import { CustomDesign } from '../../types';
import {
  getStoredDesigns,
  saveDesign,
  deleteSavedDesign
} from '../../services/storage';
import {
  X,
  Bookmark,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  FolderOpen,
  Calendar,
  Sparkles
} from 'lucide-react';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDesign: CustomDesign;
  onLoadDesign: (design: CustomDesign) => void;
}

export const SaveModal: React.FC<SaveModalProps> = ({
  isOpen,
  onClose,
  currentDesign,
  onLoadDesign
}) => {
  const [designs, setDesigns] = useState<CustomDesign[]>([]);
  const [designName, setDesignName] = useState(currentDesign.name || 'Ma Création Ghenix');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDesigns(getStoredDesigns());
      setDesignName(currentDesign.name || 'Ma Création Ghenix');
    }
  }, [isOpen, currentDesign]);

  if (!isOpen) return null;

  const handleSave = () => {
    const toSave: CustomDesign = {
      ...currentDesign,
      name: designName.trim() || 'Création sans titre'
    };
    saveDesign(toSave);
    setDesigns(getStoredDesigns());
    setStatusMessage('Votre création a été enregistrée avec succès.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDelete = (id: string) => {
    deleteSavedDesign(id);
    setDesigns(getStoredDesigns());
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentDesign, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ghenix_design_${currentDesign.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.articleId && parsed.front) {
          onLoadDesign(parsed);
          setStatusMessage('Projet importé avec succès.');
          onClose();
        } else {
          setStatusMessage('Format de fichier de projet invalide.');
        }
      } catch {
        setStatusMessage('Erreur lors de la lecture du fichier JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Sauvegarder & Reprendre une Création
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Conservez vos designs graphiques recto/verso pour les modifier à tout moment.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FEEDBACK BANNER */}
        {statusMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* SAVE CURRENT DESIGN */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Nommer et enregistrer le projet actuel
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              className="flex-1 px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Ex : Collection Hiver 2026"
            />
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shrink-0 shadow-xs flex items-center gap-1.5"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Sauvegarder</span>
            </button>
          </div>
        </div>

        {/* SAVED DESIGNS LIST */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Vos projets enregistrés ({designs.length})
          </label>

          {designs.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl text-slate-500 text-xs">
              Aucun design sauvegardé pour le moment.
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {designs.map((des) => (
                <div
                  key={des.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white text-xs transition-all"
                >
                  <div className="truncate pr-2">
                    <p className="font-bold text-slate-900 truncate">{des.name}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(des.updatedAt).toLocaleDateString('fr-FR')}</span>
                      <span>·</span>
                      <span>{des.front.elements.length + des.back.elements.length} élément(s)</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        onLoadDesign(des);
                        onClose();
                      }}
                      className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold flex items-center gap-1 transition-colors"
                      title="Charger ce design"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Ouvrir</span>
                    </button>
                    <button
                      onClick={() => handleDelete(des.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* JSON BACKUP / RESTORE */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter projet (.json)</span>
          </button>

          <label className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors font-medium cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Importer fichier (.json)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
