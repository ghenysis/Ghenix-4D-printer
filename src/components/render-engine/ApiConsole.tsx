import React, { useState } from 'react';
import {
  Code,
  Terminal,
  Play,
  Copy,
  Check,
  Share2,
  ExternalLink,
  BookOpen,
  Sparkles
} from 'lucide-react';
import {
  MockupConfig,
  ApiRenderRequest,
  ApiRenderResponse,
  RenderSnapshot
} from '../../types/renderEngine';
import {
  generateCurlSnippet,
  generateJsSnippet,
  generatePythonSnippet,
  generateEmbedIframeSnippet,
  executeRenderApi
} from '../../services/mockupApi';

interface ApiConsoleProps {
  config: MockupConfig;
  snapshots: RenderSnapshot[];
}

export const ApiConsole: React.FC<ApiConsoleProps> = ({ config, snapshots }) => {
  const [activeTab, setActiveTab] = useState<'playground' | 'snippets' | 'embed'>('playground');
  const [snippetLang, setSnippetLang] = useState<'curl' | 'js' | 'python'>('curl');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Playground state
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<ApiRenderResponse | null>(null);

  const currentRequest: ApiRenderRequest = {
    imageUrl: config.uploadedImageUrl || 'https://atelier.ghenix.com/assets/logo-sample.png',
    garmentType: config.garmentType,
    colorHex: config.colorHex,
    placement: config.placement,
    lighting: config.lighting,
    angles: ['front', 'back', 'three-quarter-left', 'three-quarter-right', 'macro-detail'],
    resolution: 'hd'
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestApiCall = async () => {
    setIsLoading(true);
    try {
      const res = await executeRenderApi(currentRequest, snapshots);
      setApiResponse(res);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-200/80 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                POST
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold text-slate-100">
                /api/render-3d-mockup
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Moteur de rendu autonome & pipeline de génération 3D multi-vues
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700/80 text-xs">
          <button
            onClick={() => setActiveTab('playground')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'playground'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Play className="w-3 h-3" />
            <span>Playground</span>
          </button>
          <button
            onClick={() => setActiveTab('snippets')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'snippets'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Code className="w-3 h-3" />
            <span>Snippets & SDK</span>
          </button>
          <button
            onClick={() => setActiveTab('embed')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'embed'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Share2 className="w-3 h-3" />
            <span>Widget 360° Embed</span>
          </button>
        </div>
      </div>

      {/* Tab 1: PLAYGROUND */}
      {activeTab === 'playground' && (
        <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left: Request Configuration */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Corps de Requête (JSON Payload)
              </span>
              <button
                onClick={() =>
                  copyToClipboard(JSON.stringify(currentRequest, null, 2), 'req-json')
                }
                className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1"
              >
                {copiedKey === 'req-json' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>Copier</span>
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-slate-200 overflow-x-auto max-h-[340px] border border-slate-800 leading-relaxed">
              <pre>{JSON.stringify(currentRequest, null, 2)}</pre>
            </div>

            <button
              onClick={handleTestApiCall}
              disabled={isLoading}
              className="mt-1 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Exécution de l'API en cours...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Tester la Requête API en Direct</span>
                </>
              )}
            </button>
          </div>

          {/* Right: Response Output */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Réponse Serveur
                </span>
                {apiResponse && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                    200 OK ({apiResponse.processingTimeMs}ms)
                  </span>
                )}
              </div>
              {apiResponse && (
                <button
                  onClick={() =>
                    copyToClipboard(JSON.stringify(apiResponse, null, 2), 'res-json')
                  }
                  className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1"
                >
                  {copiedKey === 'res-json' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>Copier JSON</span>
                </button>
              )}
            </div>

            {apiResponse ? (
              <div className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-[380px] border border-slate-800 leading-relaxed">
                <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
              </div>
            ) : (
              <div className="h-[340px] rounded-xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                <Terminal className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-700">Aucune réponse exécutée</p>
                <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                  Cliquez sur « Tester la Requête API » pour simuler l'appel réseau et inspecter le manifeste 3D complet retourné.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: CODE SNIPPETS & PARAMS */}
      {activeTab === 'snippets' && (
        <div className="p-4 sm:p-5 flex flex-col gap-4">
          {/* Lang buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {(['curl', 'js', 'python'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSnippetLang(lang)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all uppercase ${
                    snippetLang === lang
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lang === 'js' ? 'JavaScript' : lang}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                const code =
                  snippetLang === 'curl'
                    ? generateCurlSnippet(currentRequest)
                    : snippetLang === 'js'
                    ? generateJsSnippet(currentRequest)
                    : generatePythonSnippet(currentRequest);
                copyToClipboard(code, 'snippet-code');
              }}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              {copiedKey === 'snippet-code' ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>Copier le Code</span>
            </button>
          </div>

          {/* Code Viewer */}
          <div className="p-4 bg-slate-950 rounded-xl font-mono text-[11px] text-slate-100 overflow-x-auto border border-slate-800 leading-relaxed max-h-[300px]">
            <pre>
              {snippetLang === 'curl' && generateCurlSnippet(currentRequest)}
              {snippetLang === 'js' && generateJsSnippet(currentRequest)}
              {snippetLang === 'python' && generatePythonSnippet(currentRequest)}
            </pre>
          </div>

          {/* Parameters Spec */}
          <div className="mt-2 border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              Spécification des Paramètres
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 font-bold text-slate-700 text-[11px]">
                  <tr>
                    <th className="p-2">Paramètre</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">Défaut</th>
                    <th className="p-2">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="p-2 font-mono font-bold text-slate-900">imageUrl</td>
                    <td className="p-2 font-mono text-emerald-600">string (URL / Base64)</td>
                    <td className="p-2 font-mono text-slate-400">obligatoire</td>
                    <td className="p-2">Image transparente PNG, JPG ou WebP du motif/logo</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono font-bold text-slate-900">garmentType</td>
                    <td className="p-2 font-mono text-emerald-600">string</td>
                    <td className="p-2 font-mono text-slate-500">tshirt-oversize</td>
                    <td className="p-2">Type : tshirt-oversize, tshirt-classic, hoodie-street</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono font-bold text-slate-900">colorHex</td>
                    <td className="p-2 font-mono text-emerald-600">string (Hex)</td>
                    <td className="p-2 font-mono text-slate-500">#18181B</td>
                    <td className="p-2">Code couleur hexadécimal du textile</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono font-bold text-slate-900">placement</td>
                    <td className="p-2 font-mono text-emerald-600">string</td>
                    <td className="p-2 font-mono text-slate-500">chest-center</td>
                    <td className="p-2">chest-center, pocket-left, large-front, back-center</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono font-bold text-slate-900">lighting</td>
                    <td className="p-2 font-mono text-emerald-600">string</td>
                    <td className="p-2 font-mono text-slate-500">softbox</td>
                    <td className="p-2">softbox, warm-editorial, clean-ecommerce, cyber-night</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: EMBED WIDGET 360 */}
      {activeTab === 'embed' && (
        <div className="p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Visualiseur 3D 360° Intégrable (Iframe & Web Component)
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Copiez ce code pour intégrer la rotation 360° interactive sur Shopify, WooCommerce ou votre application web.
              </p>
            </div>
            <button
              onClick={() => {
                const code = generateEmbedIframeSnippet('demo-job-2026');
                copyToClipboard(code, 'embed-code');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              {copiedKey === 'embed-code' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>Copier le Code d'Intégration</span>
            </button>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl font-mono text-[11px] text-amber-300 overflow-x-auto border border-slate-800 leading-relaxed">
            <pre>{generateEmbedIframeSnippet('demo-job-2026')}</pre>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/90 text-xs text-slate-600 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p>
              Le lecteur 360° intégré supporte les commandes tactiles sur smartphone, l'accélération matérielle WebGL et le gyroscope pour une immersion optimale chez vos clients.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
