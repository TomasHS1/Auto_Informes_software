import { useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw, FileText } from "lucide-react";
import { PageSimulator } from "./PageSimulator";

export function PreviewPanel() {
  const [zoom, setZoom] = useState(100);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-4 bg-white rounded-xl border border-gray-200 px-4 py-2">
        <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"><ZoomOut size={18} /></button>
        <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">{zoom}%</span>
        <button onClick={() => setZoom(Math.min(150, zoom + 10))} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"><ZoomIn size={18} /></button>
        <button onClick={() => setZoom(100)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"><RotateCcw size={18} /></button>
        <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
          <FileText size={14} />
          <span>Vista previa en tiempo real</span>
        </div>
      </div>

      <div
        className="flex-1 overflow-auto flex justify-center"
        style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
      >
        <PageSimulator />
      </div>
    </div>
  );
}
