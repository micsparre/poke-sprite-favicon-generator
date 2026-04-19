import type { Generation } from 'shared';
import { GENERATION_LABELS } from 'shared';

interface Props {
  available: Generation[];
  selected: Generation;
  onChange: (gen: Generation) => void;
}

const SHORT_LABELS: Record<Generation, string> = {
  default: 'Default',
  'generation-i': 'Gen I',
  'generation-ii': 'Gen II',
  'generation-iii': 'Gen III',
  'generation-iv': 'Gen IV',
  'generation-v': 'Gen V',
  'generation-vi': 'Gen VI',
  'generation-vii': 'Gen VII',
};

export function GenerationPicker({ available, selected, onChange }: Props) {
  return (
    <div className="gen-picker">
      {available.map((gen) => (
        <button
          key={gen}
          className={`gen-btn${gen === selected ? ' active' : ''}`}
          onClick={() => onChange(gen)}
          title={GENERATION_LABELS[gen]}
        >
          {SHORT_LABELS[gen]}
        </button>
      ))}
    </div>
  );
}
