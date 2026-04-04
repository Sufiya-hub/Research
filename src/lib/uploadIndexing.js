const DEFAULT_BASE = 'http://127.0.0.1:8000';

function ingestionBase() {
  if (
    typeof process !== 'undefined' &&
    process.env.NEXT_PUBLIC_INGESTION_API_URL
  ) {
    return process.env.NEXT_PUBLIC_INGESTION_API_URL.replace(/\/$/, '');
  }
  return DEFAULT_BASE;
}

/** Raster images we send to CLIP index (JPG/PNG-like); not PDFs or other docs. */
export function isImageUploadFile(file) {
  if (!file) return false;
  const mime = (file.type || '').toLowerCase();
  if (/^image\/(jpeg|png|gif|webp)$/i.test(mime)) return true;
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
}

export async function triggerClipIndex(file, userId, fileId) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user_id', userId);
  formData.append('file_id', fileId);
  const res = await fetch(`${ingestionBase()}/api/v1/clip/index`, {
    method: 'POST',
    headers: { accept: 'application/json' },
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `CLIP index failed (${res.status})`);
  }
  return res.json().catch(() => ({}));
}

export async function triggerDocumentIngestion(file, userId, fileId) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user_id', userId);
  formData.append('file_id', fileId);
  const ingestRes = await fetch(`${ingestionBase()}/api/v1/ingest`, {
    method: 'POST',
    body: formData,
  });
  if (ingestRes.ok) {
    const ingestData = await ingestRes.json().catch(() => ({}));
    return {
      ok: true,
      message: ingestData.message || 'File ingested successfully',
    };
  }
  return { ok: false };
}
