export interface Pokemon {
  id: number;
  name: string;
}

export type Generation =
  | 'default'
  | 'generation-i'
  | 'generation-ii'
  | 'generation-iii'
  | 'generation-iv'
  | 'generation-v'
  | 'generation-vi'
  | 'generation-vii';

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
  default: 'Default (PokeAPI)',
  'generation-i': 'Gen I (Red/Blue)',
  'generation-ii': 'Gen II (Crystal)',
  'generation-iii': 'Gen III (Emerald)',
  'generation-iv': 'Gen IV (HeartGold/SoulSilver)',
  'generation-v': 'Gen V (Black/White)',
  'generation-vi': 'Gen VI (X/Y)',
  'generation-vii': 'Gen VII (Ultra Sun/Ultra Moon)',
};

export const SPRITE_PATHS: Record<Generation, string> = {
  default: '',
  'generation-i': 'versions/generation-i/red-blue/transparent',
  'generation-ii': 'versions/generation-ii/crystal/transparent',
  'generation-iii': 'versions/generation-iii/emerald',
  'generation-iv': 'versions/generation-iv/heartgold-soulsilver',
  'generation-v': 'versions/generation-v/black-white',
  'generation-vi': 'versions/generation-vi/x-y',
  'generation-vii': 'versions/generation-vii/ultra-sun-ultra-moon',
};

// Max Pokemon ID available per generation
export const GENERATION_MAX_ID: Record<Generation, number> = {
  default: 1025,
  'generation-i': 151,
  'generation-ii': 251,
  'generation-iii': 386,
  'generation-iv': 493,
  'generation-v': 649,
  'generation-vi': 721,
  'generation-vii': 807,
};

export const GENERATION_ORDER: Generation[] = [
  'generation-i',
  'generation-ii',
  'generation-iii',
  'generation-iv',
  'generation-v',
  'generation-vi',
  'generation-vii',
  'default',
];

export function hasShiny(generation: Generation): boolean {
  return generation !== 'generation-i';
}

export function getSpriteUrl(pokemonId: number, generation: Generation, shiny?: boolean): string {
  const base = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
  const path = SPRITE_PATHS[generation];

  if (generation === 'default') {
    return shiny ? `${base}/shiny/${pokemonId}.png` : `${base}/${pokemonId}.png`;
  }

  if (shiny && hasShiny(generation)) {
    return `${base}/${path}/shiny/${pokemonId}.png`;
  }

  return `${base}/${path}/${pokemonId}.png`;
}

export function getAvailableGenerations(pokemonId: number): Generation[] {
  return GENERATION_ORDER.filter((gen) => pokemonId <= GENERATION_MAX_ID[gen]);
}

export function getPreferredGeneration(pokemonId: number): Generation {
  const specific = getAvailableGenerations(pokemonId).filter((gen) => gen !== 'default');

  if (specific.includes('generation-iii')) {
    return 'generation-iii';
  }

  return specific[0] ?? 'default';
}
