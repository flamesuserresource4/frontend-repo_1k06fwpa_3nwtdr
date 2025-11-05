export async function predictImage(blob) {
  // If backend URL is defined, use it; else, return a mock result for development.
  const base = import.meta.env.VITE_BACKEND_URL;
  if (!base) {
    await new Promise((r) => setTimeout(r, 500));
    return { labels: [{ name: 'No backend configured', confidence: 0.0, bbox: null }] };
  }
  const url = `${base.replace(/\/$/, '')}/predict`;
  const fd = new FormData();
  fd.append('file', blob, 'frame.jpg');
  const res = await fetch(url, { method: 'POST', body: fd });
  if (!res.ok) {
    throw new Error(`Predict failed: ${res.status}`);
  }
  return res.json();
}
