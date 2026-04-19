import { useState, useEffect, useCallback, useRef } from 'react';
import type { Pokemon, Generation } from 'shared';
import { getAvailableGenerations, getPreferredGeneration, hasShiny } from 'shared';
import { PokemonGrid } from './components/PokemonGrid';
import { GenerationPicker } from './components/GenerationPicker';
import { FaviconPreview } from './components/FaviconPreview';
import './App.css';

function App() {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Pokemon | null>(null);
  const [generation, setGeneration] = useState<Generation>('default');
  const [shiny, setShiny] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef<HTMLElement>(null);
  const [selectedSpriteUrl, setSelectedSpriteUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/pokemon')
      .then((r) => r.json())
      .then(setPokemonList);
  }, []);

  const filtered = pokemonList.filter((p) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return p.name.includes(q) || String(p.id) === q;
  });

  const availableGens = selected ? getAvailableGenerations(selected.id) : [];

  // Fetch a trimmed sprite for the selected Pokemon display
  useEffect(() => {
    if (!selected) { setSelectedSpriteUrl(null); return; }
    let cancelled = false;
    fetch('/api/favicon/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pokemonId: selected.id, generation, shiny }),
    })
      .then((r) => r.ok ? r.blob() : null)
      .then((blob) => {
        if (!cancelled && blob) {
          setSelectedSpriteUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(blob);
          });
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [selected, generation, shiny]);

  const handleSelect = useCallback((pokemon: Pokemon) => {
    setSelected(pokemon);
    setGeneration(getPreferredGeneration(pokemon.id));
    setShiny(false);
    requestAnimationFrame(() => {
      previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  const handleGenerationChange = useCallback((gen: Generation) => {
    setGeneration(gen);
    if (!hasShiny(gen)) setShiny(false);
  }, []);

  const handleDownload = async () => {
    if (!selected) return;
    setDownloading(true);
    try {
      const res = await fetch('/api/favicon/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pokemonId: selected.id, generation, shiny }),
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selected.name}-favicon.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to generate favicon set. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Poke Sprite Favicon Generator</h1>
        <p>Pick a Pokemon sprite, generate a complete favicon set for your website.</p>
      </header>

      <main className="main">
        <section className="picker-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by name or number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <PokemonGrid
            pokemon={filtered}
            selectedId={selected?.id ?? null}
            onSelect={handleSelect}
          />
        </section>

        {selected && (
          <section className="preview-section" ref={previewRef}>
            <div className="selected-info">
              {selectedSpriteUrl && (
                <img
                  src={selectedSpriteUrl}
                  alt={selected.name}
                  className="selected-sprite"
                />
              )}
              <div>
                <h2>
                  #{selected.id} {selected.name}
                </h2>
                <GenerationPicker
                  available={availableGens}
                  selected={generation}
                  onChange={handleGenerationChange}
                />
                {hasShiny(generation) && (
                  <button
                    className={`shiny-toggle ${shiny ? 'active' : ''}`}
                    onClick={() => setShiny((s) => !s)}
                  >
                    Shiny
                  </button>
                )}
              </div>
            </div>

            <FaviconPreview
              pokemonId={selected.id}
              generation={generation}
              shiny={shiny}
            />

            <button
              className="download-btn"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? 'Generating...' : 'Download Favicon Set'}
            </button>

            <HtmlSnippet />
          </section>
        )}
      </main>
    </div>
  );
}

function HtmlSnippet() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const snippet = `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">
<link rel="manifest" href="/site.webmanifest">`;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="snippet-section">
      <button className="snippet-toggle" onClick={() => setOpen(!open)}>
        {open ? 'Hide' : 'Show'} HTML Snippet
      </button>
      {open && (
        <div className="snippet-content">
          <pre><code>{snippet}</code></pre>
          <button
            className={`copy-btn${copied ? ' copied' : ''}`}
            onClick={handleCopy}
          >
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
