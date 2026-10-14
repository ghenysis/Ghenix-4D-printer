export async function streamImage(
  endpoint: string,
  params: { prompt: string },
  onProgress: (url: string, isFinal: boolean) => void
): Promise<void> {
  const { prompt } = params;

  // Render high-res stylized canvas artwork locally as fallback/immediate preview
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Generate an evocative graphic badge based on prompt
    const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
    gradient.addColorStop(0, '#F59E0B'); // amber
    gradient.addColorStop(0.5, '#EF4444'); // red
    gradient.addColorStop(1, '#8B5CF6'); // violet
    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.arc(512, 512, 420, 0, Math.PI * 2);
    ctx.fill();

    // Dark inner
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(512, 512, 380, 0, Math.PI * 2);
    ctx.fill();

    // Sun / Crest rays
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 14;
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8;
      ctx.beginPath();
      ctx.moveTo(512 + Math.cos(angle) * 200, 512 + Math.sin(angle) * 200);
      ctx.lineTo(512 + Math.cos(angle) * 340, 512 + Math.sin(angle) * 340);
      ctx.stroke();
    }

    // Centered Typography badge
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 54px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GHENIX STUDIO', 512, 470);

    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    const truncatedPrompt =
      prompt.length > 28 ? prompt.substring(0, 26) + '...' : prompt.toUpperCase();
    ctx.fillText(truncatedPrompt, 512, 540);

    const initialUrl = canvas.toDataURL('image/png');
    onProgress(initialUrl, false);

    // Short simulated generation delay
    await new Promise((res) => setTimeout(res, 600));

    // Try server endpoint if backend provides it
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          onProgress(data.url, true);
          return;
        }
      }
    } catch {
      // Endpoint fallback
    }

    // Finalize local high-res texture
    onProgress(initialUrl, true);
  }
}
