export interface SampleArtwork {
  id: string;
  name: string;
  category: string;
  dataUrl: string;
}

// Generate high-quality vector-like canvas graphics programmatically to guarantee 100% reliability and zero 404s
export function createSampleGraphic(type: 'tokyo' | 'minimal-crest' | 'botanical' | 'cyber-phoenix'): string {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.clearRect(0, 0, 800, 800);

  if (type === 'tokyo') {
    // Tokyo Underground Typography & Sun
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(400, 360, 180, 0, Math.PI * 2);
    ctx.fill();

    // Geometric lines
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 8;
    ctx.strokeRect(160, 160, 480, 480);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 68px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TOKYO 2026', 400, 440);

    ctx.fillStyle = '#F8FAFC';
    ctx.font = '700 24px monospace';
    ctx.fillText('ATELIER INDUSTRIAL APPAREL', 400, 490);
  } else if (type === 'minimal-crest') {
    // Luxury Minimalist Crest
    ctx.strokeStyle = '#F59E0B'; // Amber gold
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(400, 380, 160, 0, Math.PI * 2);
    ctx.stroke();

    // Star
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const x = 400 + Math.cos(angle) * 70;
      const y = 380 + Math.sin(angle) * 70;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 48px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GHENIX STUDIO', 400, 620);
    ctx.font = '600 20px monospace';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('PARIS — ARCHIVE EDITION', 400, 660);
  } else if (type === 'botanical') {
    // Botanical Organic Art
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.ellipse(400, 380, 140, 200, Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#064E3B';
    ctx.beginPath();
    ctx.ellipse(400, 380, 80, 140, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 52px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NATURE ARCHIVE', 400, 640);
  } else {
    // Cyber Phoenix Geometric
    ctx.strokeStyle = '#38BDF8'; // Sky blue
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(400, 180);
    ctx.lineTo(600, 480);
    ctx.lineTo(400, 420);
    ctx.lineTo(200, 480);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.arc(400, 350, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F8FAFC';
    ctx.font = '900 56px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CYBER FLIGHT', 400, 600);
  }

  return canvas.toDataURL('image/png');
}

export const SAMPLE_ARTWORKS: { id: string; name: string; tag: string; type: 'tokyo' | 'minimal-crest' | 'botanical' | 'cyber-phoenix' }[] = [
  { id: 'sample-1', name: 'Tokyo 2026 Red Sun', tag: 'Streetwear', type: 'tokyo' },
  { id: 'sample-2', name: 'Ghenix Studio Gold Crest', tag: 'Luxury Serif', type: 'minimal-crest' },
  { id: 'sample-3', name: 'Botanical Organic', tag: 'Minimal', type: 'botanical' },
  { id: 'sample-4', name: 'Cyber Flight Geometric', tag: 'Modern', type: 'cyber-phoenix' }
];
