export interface Pokemon {
  id: number;
  name: string;
}

export type Generation =
  | 'generation-i'
  | 'generation-ii'
  | 'generation-iii'
  | 'generation-iv'
  | 'generation-v';

export interface SpriteInfo {
  generation: Generation;
  label: string;
  url: string;
}

export interface GenerateRequest {
  pokemonId: number;
  generation: Generation;
  shiny?: boolean;
}

export const GENERATION_LABELS: Record<Generation, string> = {
  'generation-i': 'Gen I (Red/Blue)',
  'generation-ii': 'Gen II (Crystal)',
  'generation-iii': 'Gen III (Emerald)',
  'generation-iv': 'Gen IV (HeartGold/SoulSilver)',
  'generation-v': 'Gen V (Black/White)',
};

export const SPRITE_PATHS: Record<Generation, string> = {
  'generation-i': 'versions/generation-i/red-blue/transparent',
  'generation-ii': 'versions/generation-ii/crystal/transparent',
  'generation-iii': 'versions/generation-iii/emerald',
  'generation-iv': 'versions/generation-iv/heartgold-soulsilver',
  'generation-v': 'versions/generation-v/black-white',
};

// Max Pokemon ID available per generation
export const GENERATION_MAX_ID: Record<Generation, number> = {
  'generation-i': 151,
  'generation-ii': 251,
  'generation-iii': 386,
  'generation-iv': 493,
  'generation-v': 649,
};

export function hasShiny(generation: Generation): boolean {
  return generation !== 'generation-i';
}

export function getSpriteUrl(pokemonId: number, generation: Generation, shiny?: boolean): string {
  const base = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
  const path = SPRITE_PATHS[generation];

  if (shiny && hasShiny(generation)) {
    return `${base}/${path}/shiny/${pokemonId}.png`;
  }

  return `${base}/${path}/${pokemonId}.png`;
}

export function getAvailableGenerations(pokemonId: number): Generation[] {
  return (Object.keys(GENERATION_MAX_ID) as Generation[]).filter(
    (gen) => pokemonId <= GENERATION_MAX_ID[gen]
  );
}
