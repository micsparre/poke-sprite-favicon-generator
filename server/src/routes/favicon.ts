import { Router } from 'express';
import archiver from 'archiver';
import { getSpriteUrl, getAvailableGenerations } from 'shared';
import type { Generation, GenerateRequest } from 'shared';
import pokemonList from 'shared/src/pokemon.json' with { type: 'json' };
import { fetchSprite } from '../spriteCache.js';
import { generateFaviconSet, generatePreview } from '../faviconGenerator.js';

export const faviconRouter = Router();

function validateRequest(body: unknown): body is GenerateRequest {
  const b = body as Record<string, unknown>;
  return (
    typeof b.pokemonId === 'number' &&
    b.pokemonId >= 1 &&
    b.pokemonId <= 1025 &&
    typeof b.generation === 'string' &&
    (b.shiny === undefined || typeof b.shiny === 'boolean')
  );
}

faviconRouter.post('/generate', async (req, res) => {
  try {
    if (!validateRequest(req.body)) {
      res.status(400).json({ error: 'Invalid request. Need pokemonId (1-1025) and generation.' });
      return;
    }

    const { pokemonId, generation, shiny } = req.body as GenerateRequest;
    const available = getAvailableGenerations(pokemonId);

    if (!available.includes(generation)) {
      res.status(400).json({ error: `Pokemon #${pokemonId} is not available in ${generation}` });
      return;
    }

    const spriteUrl = getSpriteUrl(pokemonId, generation, shiny);
    const spriteBuffer = await fetchSprite(spriteUrl);
    const pokemon = pokemonList.find((p) => p.id === pokemonId);
    const pokemonName = pokemon?.name ?? `pokemon-${pokemonId}`;

    const files = await generateFaviconSet(spriteBuffer, pokemonName);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${pokemonName}-favicon.zip"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    for (const file of files) {
      archive.append(Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data), {
        name: file.name,
      });
    }

    await archive.finalize();
  } catch (err) {
    console.error('Favicon generation error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate favicon set' });
    }
  }
});

faviconRouter.post('/preview', async (req, res) => {
  try {
    if (!validateRequest(req.body)) {
      res.status(400).json({ error: 'Invalid request. Need pokemonId (1-1025) and generation.' });
      return;
    }

    const { pokemonId, generation, shiny } = req.body as GenerateRequest;
    const available = getAvailableGenerations(pokemonId);

    if (!available.includes(generation)) {
      res.status(400).json({ error: `Pokemon #${pokemonId} is not available in ${generation}` });
      return;
    }

    const spriteUrl = getSpriteUrl(pokemonId, generation, shiny);
    const spriteBuffer = await fetchSprite(spriteUrl);
    const previewBuffer = await generatePreview(spriteBuffer);

    res.setHeader('Content-Type', 'image/png');
    res.send(previewBuffer);
  } catch (err) {
    console.error('Preview generation error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate preview' });
    }
  }
});
