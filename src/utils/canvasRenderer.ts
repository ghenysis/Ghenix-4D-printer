import { CustomElement, FaceDesign, GarmentColor } from '../types';

export interface RenderOptions {
  width: number;
  height: number;
  includeBackground?: boolean;
  backgroundColor?: string;
  showPrintBoundary?: boolean;
  scaleFactor?: number;
}

/**
 * Draws a face design (elements) onto an HTMLCanvasElement
 */
export async function renderFaceToCanvas(
  canvas: HTMLCanvasElement,
  faceDesign: FaceDesign,
  options: RenderOptions
): Promise<void> {
  const { width, height, includeBackground, backgroundColor, showPrintBoundary } = options;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, width, height);

  // Background
  if (includeBackground && backgroundColor) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }

  // Draw printable zone boundary line if requested
  if (showPrintBoundary) {
    ctx.save();
    ctx.strokeStyle = 'rgba(234, 88, 12, 0.4)'; // amber/orange dashed
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(10, 10, width - 20, height - 20);
    ctx.restore();
  }

  // Sort elements by zIndex
  const sorted = [...faceDesign.elements].sort((a, b) => a.zIndex - b.zIndex);

  for (const el of sorted) {
    ctx.save();
    ctx.globalAlpha = el.opacity ?? 1;

    // Element center in canvas pixels
    const cx = (el.x / 100) * width;
    const cy = (el.y / 100) * height;
    const elWidth = (el.width / 100) * width;
    const elHeight = (el.height / 100) * height;

    // Translate to center and rotate
    ctx.translate(cx, cy);
    if (el.rotation) {
      ctx.rotate((el.rotation * Math.PI) / 180);
    }

    if (el.type === 'text') {
      const fontSize = (el.fontSize / 500) * height;
      ctx.font = `${el.fontStyle} ${el.fontWeight} ${fontSize}px "${el.fontFamily}", sans-serif`;
      ctx.fillStyle = el.color;
      ctx.textAlign = el.textAlign;
      ctx.textBaseline = 'middle';

      let drawX = 0;
      if (el.textAlign === 'left') drawX = -elWidth / 2;
      if (el.textAlign === 'right') drawX = elWidth / 2;

      // Handle letter spacing if supported
      if ('letterSpacing' in ctx && el.letterSpacing) {
        (ctx as unknown as { letterSpacing: string }).letterSpacing = `${el.letterSpacing}px`;
      }

      ctx.fillText(el.text, drawX, 0);
    } else if (el.type === 'image' || el.type === 'clipart') {
      await drawImageElement(ctx, el.url, -elWidth / 2, -elHeight / 2, elWidth, elHeight);
    }

    ctx.restore();
  }
}

function drawImageElement(
  ctx: CanvasRenderingContext2D,
  url: string,
  x: number,
  y: number,
  w: number,
  h: number
): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, x, y, w, h);
      resolve();
    };
    img.onerror = () => {
      // Fallback: draw placeholder
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#EF4444';
      ctx.font = '12px sans-serif';
      ctx.fillText('Image non chargée', x + 5, y + 20);
      resolve();
    };
    img.src = url;
  });
}

/**
 * Renders a face design to a transparent Data URL
 */
export async function renderFaceToDataUrl(
  faceDesign: FaceDesign,
  size = 1024
): Promise<string> {
  const canvas = document.createElement('canvas');
  await renderFaceToCanvas(canvas, faceDesign, {
    width: size,
    height: size,
    includeBackground: false,
    showPrintBoundary: false
  });
  return canvas.toDataURL('image/png');
}
