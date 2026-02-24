import sharp from 'sharp';
import toIco from 'to-ico';

interface FaviconFile {
  name: string;
  data: Buffer | string;
}

const FAVICON_SIZES = [16, 32, 48] as const;
const APPLE_TOUCH_SIZE = 180;
const ANDROID_SIZES = [192, 512] as const;

/**
 * Trim transparent padding from a sprite, then resize and center
 * on a square canvas of the target size.
 */
async function resizePixelArt(source: Buffer, targetSize: number): Promise<Buffer> {
  // Trim transparent padding so sprite content is centered properly
  const trimmed = await sharp(source).trim().png().toBuffer();
  const trimMeta = await sharp(trimmed).metadata();
  const srcW = trimMeta.width!;
  const srcH = trimMeta.height!;
  const srcMax = Math.max(srcW, srcH);

  // Leave a small margin (~6%) so the sprite doesn't touch the edges
  const fillTarget = Math.floor(targetSize * 0.94);

  // Scale to fill the canvas: nearest-neighbor for that pixel art look
  const scale = fillTarget / srcMax;
  const scaledW = Math.round(srcW * scale);
  const scaledH = Math.round(srcH * scale);

  const scaled = await sharp(trimmed)
    .resize(scaledW, scaledH, { kernel: sharp.kernel.nearest })
    .png()
    .toBuffer();

  // Center on a transparent canvas of the target size
  return sharp({
    create: {
      width: targetSize,
      height: targetSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: scaled, gravity: 'centre' }])
    .png()
    .toBuffer();
}

export async function generateFaviconSet(spriteBuffer: Buffer, pokemonName: string): Promise<FaviconFile[]> {
  const files: FaviconFile[] = [];

  // Generate all PNG sizes
  const [png16, png32, png48, appleTouchPng, android192, android512] = await Promise.all([
    resizePixelArt(spriteBuffer, 16),
    resizePixelArt(spriteBuffer, 32),
    resizePixelArt(spriteBuffer, 48),
    resizePixelArt(spriteBuffer, APPLE_TOUCH_SIZE),
    resizePixelArt(spriteBuffer, 192),
    resizePixelArt(spriteBuffer, 512),
  ]);

  // Generate .ico (16x16 + 32x32)
  const icoBuffer = Buffer.from(await toIco([png16, png32]));

  files.push(
    { name: 'favicon.ico', data: icoBuffer },
    { name: 'favicon-16x16.png', data: png16 },
    { name: 'favicon-32x32.png', data: png32 },
    { name: 'favicon-48x48.png', data: png48 },
    { name: 'apple-touch-icon.png', data: appleTouchPng },
    { name: 'android-chrome-192x192.png', data: android192 },
    { name: 'android-chrome-512x512.png', data: android512 },
  );

  // Generate site.webmanifest
  const manifest = {
    name: `${pokemonName} favicon`,
    short_name: pokemonName,
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone',
  };
  files.push({ name: 'site.webmanifest', data: JSON.stringify(manifest, null, 2) });

  // Generate HTML snippet
  const snippet = [
    '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">',
    '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">',
    '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">',
    '<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">',
    '<link rel="manifest" href="/site.webmanifest">',
  ].join('\n');
  files.push({ name: 'favicon-snippet.html', data: snippet });

  return files;
}

export async function generatePreview(spriteBuffer: Buffer, size: number = 128): Promise<Buffer> {
  return resizePixelArt(spriteBuffer, size);
}
