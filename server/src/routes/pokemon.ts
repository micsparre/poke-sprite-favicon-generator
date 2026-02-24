import { Router } from 'express';
import pokemonList from 'shared/src/pokemon.json' with { type: 'json' };
import { getAvailableGenerations, getSpriteUrl, GENERATION_LABELS } from 'shared';
import type { Generation, SpriteInfo } from 'shared';

export const pokemonRouter = Router();

pokemonRouter.get('/', (_req, res) => {
  res.json(pokemonList);
});

pokemonRouter.get('/:id/sprites', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id < 1 || id > 649) {
    res.status(400).json({ error: 'Invalid Pokemon ID' });
    return;
  }

  const generations = getAvailableGenerations(id);
  const sprites: SpriteInfo[] = generations.map((gen) => ({
    generation: gen,
    label: GENERATION_LABELS[gen],
    url: getSpriteUrl(id, gen),
  }));

  res.json({ id, sprites });
});
