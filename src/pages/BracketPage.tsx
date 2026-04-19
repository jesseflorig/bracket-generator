import { BracketViewer } from '../components/BracketViewer';
import { DimensionPanel } from '../components/DimensionPanel';
import { ExportBar } from '../components/ExportBar';

export function BracketPage() {
  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      {/* Left sidebar */}
      <div className="w-72 flex-shrink-0 bg-zinc-900 flex flex-col overflow-hidden border-r border-zinc-800">
        <div className="flex-1 overflow-hidden flex flex-col">
          <DimensionPanel />
        </div>
        <ExportBar />
      </div>

      {/* 3D viewer */}
      <div className="flex-1 relative">
        <BracketViewer />
        <div className="absolute top-3 right-3 text-xs text-zinc-600 pointer-events-none">
          Drag to orbit · Scroll to zoom · Right-drag to pan
        </div>
      </div>
    </div>
  );
}
