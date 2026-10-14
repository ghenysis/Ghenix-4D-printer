# Moteur de Rendu 3D Automatisé (Studio Mockup & API)

Création d'un module autonome et indépendant de rendu 3D permettant d'uploader n'importe quelle image (logo, illustration, motif) pour générer instantanément un studio de mockups 3D multi-angles, une vue interactive manipulable à 360°, et un accès API avec playground interactif.

### User Review & Critical Decisions

> [!IMPORTANT]
> Suite aux clarifications confirmées :
> - **Type de rendu** : Studio de mockups 3D automatisé multi-angles (Face, Dos, Profils 3/4, Macro).
> - **Mode d'intégration** : Module indépendant avec sa propre interface plein écran accessible depuis la barre de navigation, incluant également une console et un endpoint API.
> - **Format principal** : Vue 3D interactive manipulable à 360° (avec rotation libre, presets de cadrage studio et export d'images HD).

- **Navigation & Découplage** : L'Atelier de personnalisation actuel (Studio 3D / Éditeur 2D) reste intact. Un nouveau mode dédié « Moteur 3D & API » est ajouté dans la navigation principale pour basculer en un clic vers cette nouvelle interface autonome.
- **Accès API** : Fourniture d'un endpoint Express `/api/render-3d-mockup` et d'une console interactive (Playground) permettant de tester des requêtes en direct, d'obtenir le payload JSON (renders multi-angles base64, configuration 3D, code d'intégration iframe 360°), et de copier des snippets cURL et JavaScript/Python.
- **Moteur de rendu WebGL / Three.js** : Exploitation du moteur Three.js PBR avec éclairage studio softbox (`RoomEnvironment`), plaquage automatique de décalcomanie sans déformation avec détection de ratio d'aspect, et génération synchrone/asynchrone de snapshots HD sous 5 angles prédéfinis.

---

### 1. Overview & Core Concept

- **What It Does** :
  L'utilisateur dépose ou uploade une image (PNG transparent, JPG, SVG, WebP). Le moteur calcule automatiquement l'ajustement géométrique optimal sur le vêtement 3D (T-shirt, Hoodie, Sweatshirt, etc.), configure les matériaux et lumières studio, et fournit en temps réel :
  1. Une **scène 3D 360° interactive** manipulable à la souris ou au doigt (rotation orbitale, zoom, turntable automatique).
  2. Un **pack de mockups multi-angles HD** généré automatiquement (Face, Dos, 3/4 Gauche, 3/4 Droit, Gros plan tissu).
  3. Un **code d'intégration 360° (Embed Widget)** pour intégrer le visualiseur 3D sur un site e-commerce ou portfolio.
  4. Une **console API complète** documentée avec testeur interactif en direct.

- **Target Audience / Persona** :
  - Créateurs de marques textiles et e-commerçants souhaitant générer des fiches produits 3D réalistes en quelques secondes à partir de simples maquettes graphiques.
  - Développeurs et intégrateurs souhaitant connecter leur boutique ou application à un moteur de rendu 3D via API.

- **Key Value** :
  Supprime le besoin de modélisation 3D manuelle ou de logiciels lourds (Blender, Clo3D) : un simple upload d'image produit un visualiseur 3D 360° haut de gamme et des visuels commerciaux prêts à l'emploi.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Accès au module** : Clic sur l'onglet « Moteur 3D & API » dans l'entête supérieure. L'écran s'ouvre sur un studio épuré orienté productivité.
2. **Zone de Drop & Configuration instantanée** :
   - Glisser-déposer d'une image ou choix parmi des exemples graphiques prêts à tester.
   - Sélecteurs compacts : Type de vêtement, Couleur du tissu, Emplacement (Poitrine, Centre torse, Grand format, Dos), Ambiance d'éclairage (Studio Softbox, Warm Editorial, Clean E-commerce).
3. **Exploration 3D 360°** :
   - Manipulation orbitale fluide avec amortissement physique (inertie naturelle).
   - Boutons de vue rapide (Face, Dos, Côté, Perspective) avec transition de caméra interpolée.
   - Mode auto-rotation continue (Turntable 360°).
4. **Galerie de Rendu Multi-Angles** :
   - Bandeau horizontal présentant les vignettes générées sous 5 angles distincts.
   - Téléchargement individuel ou pack complet en haute résolution.
5. **Console API & Embed** :
   - Onglet basculant vers la documentation API : spécification des paramètres, générateur de token/requête, commande cURL pré-remplie, exécution test en direct et réponse JSON inspectable.
   - Bouton de copie du code HTML iframe 360° personnalisable.

#### Visual Identity & Theme
- **Direction esthétique** : Studio photographique minimaliste haut de gamme, inspiration Leica / Apple Industrial Design.
- **Palette** :
  - Fond de scène : Teinte studio neutre raffinée (`#F8FAFC` / `#0F172A`).
  - Panneaux de contrôle : Verre dépoli translucide avec contours ultra-fins (`backdrop-blur-md border-slate-200/80`).
  - Accentuation : Ambre atelier chaud (`#F59E0B`) pour les indicateurs d'action active et boutons d'exécution.
- **Typographie** : `Plus Jakarta Sans` pour les labels et commandes, couplé à `JetBrains Mono` / `font-mono tabular-nums` pour la console API et les paramètres dimensionnels.
- **Ergonomie** : Dock de contrôle latéral compact repliable ou dock inférieur zéro occlusion pour laisser le viewport 3D respirer à 100%.

---

### 3. Key Product Decisions & Trade-Offs

- **Décision 1 : Rendu client Three.js temps réel combiné à un endpoint API Express**
  - *Approche choisie* : Le visualiseur 360° s'exécute côté client avec WebGL hardware-accelerated pour une fluidité à 60 fps sans latence de streaming vidéo. L'API Express fournit un endpoint de traitement et simulation de webhook/rendu retournant les métadonnées complètes et URLs de rendu.
  - *Pourquoi* : Réactivité instantanée sans coût de serveur GPU cloud dédié, tout en offrant une interface API standardisée pour les intégrations tierces.
  - *Alternatives écartées* : Rendu headless pur sur serveur avec Puppeteer/WebGL software (trop lourd et lent pour du temps réel interactif).

- **Décision 2 : Pipeline de texture avec mise à l'échelle automatique préservant le ratio**
  - *Approche choisie* : Lors de l'upload, l'image est normalisée sur un canevas haute définition avec calcul mathématique du bounding-box selon la zone d'impression (centrée, poche, dos) pour éviter toute déformation anamorphique.
  - *Pourquoi* : Les utilisateurs uploadent des images de résolutions et ratios variés (carré, portrait, paysage, transparent). Le rendu 3D doit rester impeccable sans étirement.

- **Décision 3 : Architecture d'exportation multi-angles synchrone par caméra virtuelle**
  - *Approche choisie* : Un cycle automatique positionne séquentiellement la caméra Three.js sur 5 coordonnées vectorielles définies, déclenche `renderer.render()`, et capture les snapshots en `toDataURL('image/png')`.
  - *Pourquoi* : Permet de générer instantanément l'ensemble du pack e-commerce (Face, Dos, 3/4, Macro) en moins de 500ms sans rechargement.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          TOP NAVBAR NAVIGATION                         │
│   [Atelier Customizer (3D / 2D)]  │  [★ Moteur de Rendu 3D & API]      │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   MOTEUR DE RENDU 3D DÉDIÉ (VIEWPORT)                  │
│                                                                        │
│   ┌───────────────────────────┐    ┌───────────────────────────────┐   │
│   │ UPLOAD & CONFIGURATION    │    │ 3D 360° INTERACTIVE VIEWPORT   │   │
│   │ - Drag & drop image       │    │ - Three.js Canvas / Orbit     │   │
│   │ - Type vêtement & coloris │    │ - Turntable auto-rotate       │   │
│   │ - Emplacement & échelle   │    │ - Presets caméra 1-clic       │   │
│   │ - Ambiance lumineuse      │    │ - Contact shadows & PBR       │   │
│   └───────────────────────────┘    └───────────────────────────────┘   │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ GALERIE PACK MOCKUPS MULTI-ANGLES (HD Export)                  │   │
│   │ [ Face ]  [ Dos ]  [ 3/4 Gauche ]  [ 3/4 Droit ]  [ Macro ]    │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ CONSOLE API & INTÉGRATION                                      │   │
│   │ - Spécification POST /api/render-3d-mockup                     │   │
│   │ - Testeur de requêtes en direct (Playground)                   │   │
│   │ - Snippets cURL / JS / Python + Code Embed <iframe> 360°       │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

#### Nouveaux composants & fichiers cibles :
1. `src/components/render-engine/RenderEngineView.tsx` : Conteneur principal plein écran du module de rendu 3D avec onglets Studio Mockup et Console API.
2. `src/components/render-engine/MockupCanvas3D.tsx` : Scène Three.js dédiée au rendu 360° du vêtement avec support de la décalcomanie dynamique, presets d'angles et capture photo haute fidélité.
3. `src/components/render-engine/RenderControlsPanel.tsx` : Panneau d'upload drag & drop, choix du garment, placement et environnement.
4. `src/components/render-engine/MultiAngleGallery.tsx` : Visualiseur et exportateur des 5 angles générés en un clic.
5. `src/components/render-engine/ApiPlaygroundModal.tsx` / `ApiConsole.tsx` : Documentation interactive de l'API avec exécution réelle, cURL, et code iframe exportable.
6. `server.ts` : Route backend Express `POST /api/render-3d-mockup` validant les requêtes et renvoyant le manifeste de rendu.
7. `src/App.tsx` & `src/components/customizer/TopNavbar.tsx` : Ajout de la navigation fluide vers ce nouveau mode indépendant.

---

### Verification Plan

1. **Test d'Upload d'image** : Uploader divers formats (PNG transparent, JPG portrait, logo vectoriel) et vérifier le plaquage instantané sans étirement sur le vêtement 3D.
2. **Test 3D 360°** : Vérifier la manipulation orbitale à 360°, le zoom, l'activation du turntable automatique et la fidélité des textures.
3. **Test Génération Multi-Angles** : Déclencher le rendu automatique et vérifier que les 5 angles (Face, Dos, 3/4 G, 3/4 D, Macro) sont générés nettement en HD et téléchargeables individuellement ou groupés.
4. **Test Console API & Endpoint** : Exécuter une requête de test via le playground, vérifier la réponse JSON standardisée, la validité des snippets cURL et le fonctionnement du code embed iframe.
5. **Compilation & Lint** : Exécuter `compile_applet` et `lint_applet` pour garantir l'absence d'erreurs TypeScript.
