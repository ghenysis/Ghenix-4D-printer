import React, { useState } from 'react';
import { drawing, useConfigurator, type Side } from '../../store/useConfigurator';
import { streamImage } from '../../lib/stream-image';
import {
  Sparkles,
  Type,
  Image as ImageIcon,
  RotateCcw,
  Download,
  AlertCircle,
  X
} from 'lucide-react';

const COLORS = [
  { name: 'Blanc', hex: '#ffffff' },
  { name: 'Noir', hex: '#1a1a1a' },
  { name: 'Bleu', hex: '#1e40af' },
  { name: 'Rouge', hex: '#dc2626' },
  { name: 'Vert', hex: '#16a34a' },
  { name: 'Sable', hex: '#d6c3a1' }
];

export function AiPanel({ onClose }: { onClose?: () => void }) {
  const side = useConfigurator((s: { side: Side }) => s.side);
  const [prompt, setPrompt] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [final, setFinal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!prompt.trim() || busy) return;
    setBusy(true);
    setError(null);
    setPreview(null);
    setFinal(false);
    const target = side;
    try {
      await streamImage('/api/generate-image', { prompt }, (url: string, isFinal: boolean) => {
        setPreview(url);
        setFinal(isFinal);
        if (isFinal) drawing.applyGenerated(url, target);
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(
        msg.includes('402')
          ? 'Crédits IA épuisés.'
          : msg.includes('429')
          ? 'Trop de demandes, réessayez dans un instant.'
          : 'La génération a échoué. Réessayez.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="absolute right-3 top-3 z-30 w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl p-4 bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl select-none">
      <div className="flex items-center justify-between mb-2">
        <p className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Motif par IA · {side === 'front' ? 'Devant' : 'Dos'}</span>
        </p>
        {onClose && (
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ex. : un lion géométrique style néon"
        rows={3}
        maxLength={500}
        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none bg-slate-50"
      />
      <button
        onClick={generate}
        disabled={busy || !prompt.trim()}
        className="mt-2 w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
      >
        {busy ? 'Génération en cours…' : 'Générer et appliquer au vêtement'}
      </button>

      {preview && (
        <div className="mt-3">
          <p className="text-[10px] text-slate-400 mb-1">Aperçu du motif :</p>
          <img
            src={preview}
            alt="Aperçu du motif généré"
            className={`aspect-square w-full rounded-xl bg-slate-100 object-contain transition-all border border-slate-200 ${
              final ? 'blur-0' : 'blur-xs animate-pulse'
            }`}
          />
        </div>
      )}

      {error && <p className="mt-2 text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
}

export function LovableControlsBar({ onOpenAi }: { onOpenAi?: () => void }) {
  const { color, setColor, setLogo, logos, side, setSide, updateLogo } = useConfigurator();
  const [text, setText] = useState('GHENIX');
  const logo = logos[side];

  return (
    <div className="w-full flex flex-wrap items-center justify-center gap-2.5 p-3 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-md text-xs select-none">
      {/* Side selector */}
      <div className="flex gap-1 bg-slate-100 p-0.5 rounded-xl">
        <button
          onClick={() => setSide('front')}
          className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
            side === 'front' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:bg-white'
          }`}
        >
          Devant
        </button>
        <button
          onClick={() => setSide('back')}
          className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
            side === 'back' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:bg-white'
          }`}
        >
          Dos
        </button>
      </div>

      {/* Color swatches */}
      <div className="flex items-center gap-1.5">
        {COLORS.map((c) => (
          <button
            key={c.hex}
            onClick={() => setColor(c.hex)}
            title={c.name}
            aria-label={c.name}
            className={`w-6 h-6 rounded-lg border transition-all ${
              color === c.hex
                ? 'ring-2 ring-slate-900 ring-offset-1 scale-105 border-transparent shadow-xs'
                : 'border-slate-300 hover:scale-105'
            }`}
            style={{ background: c.hex }}
          />
        ))}
      </div>

      {/* Text adder */}
      <div className="flex items-center gap-1">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-28 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-900"
          placeholder="Texte"
        />
        <button
          onClick={() => drawing.addText(text)}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold transition-colors"
        >
          Texte
        </button>
      </div>

      {/* Preset HD Texture applied */}
      <button
        onClick={() => {
          drawing.applyGenerated('/design-devant-hd.png', side);
        }}
        className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-500/30 rounded-lg font-bold transition-colors"
        title="Appliquer le design HD"
      >
        Texture HD
      </button>

      {/* Image Upload */}
      <label className="px-3 py-1.5 border border-slate-200 hover:border-slate-800 rounded-lg font-bold text-slate-700 hover:text-slate-900 cursor-pointer bg-white transition-colors">
        Image
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) drawing.addImage(f);
            e.target.value = '';
          }}
        />
      </label>

      {/* Logo Placement */}
      <label className="px-3 py-1.5 border border-slate-200 hover:border-slate-800 rounded-lg font-bold text-slate-700 hover:text-slate-900 cursor-pointer bg-white transition-colors">
        Logo
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f)
              setLogo(side, {
                url: URL.createObjectURL(f),
                x: side === 'front' ? 0.08 : 0,
                y: side === 'front' ? 0.06 : 0.08,
                scale: 0.14
              });
            e.target.value = '';
          }}
        />
      </label>

      {/* Scale Slider */}
      {logo && (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span>Taille</span>
          <input
            type="range"
            min={0.05}
            max={0.35}
            step={0.005}
            value={logo.scale}
            onChange={(e) => updateLogo(side, { scale: Number(e.target.value) })}
            aria-label="Taille du logo"
            className="w-20 accent-slate-900"
          />
        </div>
      )}

      {/* Clear & Export */}
      <button
        onClick={() => {
          drawing.clear();
          setLogo(side, null);
        }}
        className="px-2.5 py-1.5 text-slate-500 hover:text-rose-600 rounded-lg font-semibold transition-colors"
      >
        Effacer
      </button>
      <button
        onClick={() => drawing.download()}
        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold transition-colors flex items-center gap-1"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Export HD</span>
      </button>

      {onOpenAi && (
        <button
          onClick={onOpenAi}
          className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-bold transition-all flex items-center gap-1 shadow-xs hover:opacity-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>IA Motif</span>
        </button>
      )}
    </div>
  );
}
