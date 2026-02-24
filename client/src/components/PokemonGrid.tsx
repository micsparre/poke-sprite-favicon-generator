import { useRef, useCallback } from 'react';
import type { Pokemon } from 'shared';
import { getSpriteUrl } from 'shared';

interface Props {
  pokemon: Pokemon[];
  selectedId: number | null;
  onSelect: (p: Pokemon) => void;
}

export function PokemonGrid({ pokemon, selectedId, onSelect }: Props) {
  return (
    <div className="pokemon-grid">
      {pokemon.map((p) => (
        <PokemonCard
          key={p.id}
          pokemon={p}
          selected={p.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function PokemonCard({
  pokemon,
  selected,
  onSelect,
}: {
  pokemon: Pokemon;
  selected: boolean;
  onSelect: (p: Pokemon) => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);

  const handleError = useCallback(() => {
    if (imgRef.current) {
      imgRef.current.style.display = 'none';
    }
  }, []);

  return (
    <div
      className={`pokemon-card${selected ? ' selected' : ''}`}
      onClick={() => onSelect(pokemon)}
    >
      <img
        ref={imgRef}
        src={getSpriteUrl(pokemon.id, 'generation-v')}
        alt={pokemon.name}
        loading="lazy"
        onError={handleError}
      />
      <span className="number">#{pokemon.id}</span>
      <span className="name">{pokemon.name}</span>
    </div>
  );
}
