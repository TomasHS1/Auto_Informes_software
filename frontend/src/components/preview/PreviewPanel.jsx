import { useState, useCallback } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileText,
  LayoutList,
  Layout,
} from "lucide-react";
import { PageSimulator } from "./PageSimulator";

export function PreviewPanel() {
  const [zoom, setZoom] = useState(100);
  const [vistaPaginar, setVistaPaginar] = useState(true);
  const [numPaginas, setNumPaginas] = useState(0);

  const handlePageCount = useCallback((n) => setNumPaginas(n), []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-4 bg-white rounded-xl border border-gray-200 px-4 py-2 flex-wrap">
        <button
          onClick={() => setZoom(Math.max(50, zoom - 10))}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          <ZoomOut size={18} />
        </button>
        <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
          {zoom}%
        </span>
        <button
          onClick={() => setZoom(Math.min(150, zoom + 10))}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={() => setZoom(100)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          <RotateCcw size={18} />
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <button
          onClick={() => setVistaPaginar(!vistaPaginar)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            vistaPaginar
              ? "bg-[#2563EB] text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          title={vistaPaginar ? "Vista paginada" : "Vista simple"}
        >
          {vistaPaginar ? <Layout size={14} /> : <LayoutList size={14} />}
          {vistaPaginar ? "Paginada" : "Simple"}
        </button>

        <div className="ml-auto flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1">
            <FileText size={14} />
            <span>{numPaginas > 0 ? `${numPaginas} página(s)` : "—"}</span>
          </div>
          <span>Vista previa en tiempo real</span>
        </div>
      </div>

      <div
        className="flex-1 overflow-auto flex justify-center"
        style={{
          transform: `scale(${zoom / 100})`,
          transformOrigin: "top center",
        }}
      >
        <PageSimulator
          vistaPaginar={vistaPaginar}
          onPageCount={handlePageCount}
        />
      </div>
    </div>
  );
}
