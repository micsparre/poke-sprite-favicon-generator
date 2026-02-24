import { useState, useEffect } from 'react';
import type { Generation } from 'shared';

interface Props {
  pokemonId: number;
  generation: Generation;
  shiny: boolean;
}

const PREVIEW_SIZES = [16, 32, 48, 180, 192] as const;

export function FaviconPreview({ pokemonId, generation, shiny }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/favicon/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pokemonId, generation, shiny }),
    })
      .then((r) => {
        if (!r.ok) throw new Error('Preview failed');
        return r.blob();
      })
      .then((blob) => {
        if (!cancelled) {
          setPreviewUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(blob);
          });
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [pokemonId, generation, shiny]);

  if (!previewUrl) {
    return <div className="favicon-preview" style={{ justifyContent: 'center', color: 'var(--text-muted)' }}>Loading preview...</div>;
  }

  return (
    <div className="favicon-preview">
      {PREVIEW_SIZES.map((size) => {
        const label =
          size === 180
            ? 'apple-touch'
            : size === 192
              ? 'android'
              : `${size}x${size}`;
        return (
          <div key={size} className="favicon-item">
            <img
              src={previewUrl}
              alt={`${size}x${size} preview`}
              width={size}
              height={size}
              style={{ imageRendering: 'pixelated' }}
            />
            <span className="label">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
