import { useState } from 'react';
import { useBracketStore } from '../store/bracketStore';
import { buildBracket } from '../geometry/bracket';
import { exportStl } from '../export/exportStl';
import { export3mf } from '../export/export3mf';

export function ExportBar() {
  const params = useBracketStore((s) => s.params);
  const [exporting3mf, setExporting3mf] = useState(false);

  const makePayload = () => {
    const geometry = buildBracket(params);
    return {
      geometry,
      params,
      filename: `bracket-${Math.round(params.width)}x${Math.round(params.height)}x${Math.round(params.depth)}mm`,
    };
  };

  const handleStl = () => {
    const payload = makePayload();
    exportStl(payload);
    payload.geometry.dispose();
  };

  const handle3mf = async () => {
    setExporting3mf(true);
    try {
      const payload = makePayload();
      await export3mf(payload);
      payload.geometry.dispose();
    } finally {
      setExporting3mf(false);
    }
  };

  return (
    <div className="px-4 py-3 border-t border-zinc-800 space-y-2">
      <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Export</p>
      <button
        onClick={handleStl}
        className="w-full bg-zinc-700 hover:bg-zinc-600 text-zinc-100 text-sm font-medium py-2 rounded transition-colors"
      >
        Download STL
      </button>
      <button
        onClick={handle3mf}
        disabled={exporting3mf}
        className="w-full bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium py-2 rounded transition-colors"
      >
        {exporting3mf ? 'Generating…' : 'Download 3MF'}
      </button>
    </div>
  );
}
