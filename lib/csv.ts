import { apiFetch, ApiError } from '@/lib/api/client';

export async function downloadFile(
  path: string,
  filename: string
): Promise<void> {
  const res = await apiFetch(path, { headers: { Accept: 'text/csv' } });

  if (!res.ok) {
    let message = 'Download failed';
    try {
      const data = await res.json();
      if (typeof data?.message === 'string') message = data.message;
    } catch {
      // Body was not JSON — keep the generic message.
    }
    throw new ApiError(message, res.status);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

export function filenameSlug(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'promotion'
  );
}
