import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');

  const generateLyrics = async () => {
    setLoading(true);
    const res = await fetch('/api/generate-lyrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme })
    });
    const data = await res.json();
    setLyrics(data.lyrics);
    setLoading(false);
  };

  const generateMusic = async () => {
    setLoading(true);
    const res = await fetch('/api/generate-music', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lyrics })
    });
    const data = await res.json();
    setAudioUrl(data.audioUrl);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">🎵 AI Music Generator</h1>
      <input
        placeholder="Enter a theme (e.g., Telugu love song)"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
      />
      <button onClick={generateLyrics} disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : 'Generate Lyrics'}
      </button>
      <pre>{lyrics}</pre>
      {lyrics && (
        <button onClick={generateMusic} disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : 'Generate Music'}
        </button>
      )}
      {audioUrl && <audio controls src={audioUrl} />}
    </div>
  );
}