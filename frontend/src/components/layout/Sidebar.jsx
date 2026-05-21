import { PortadaForm } from "../portada/PortadaForm";
import { BlockToolbar } from "../editor/BlockToolbar";

export function Sidebar({ currentPage, onNavigate, documentoId }) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-xs font-semibold text-[#1F2937] uppercase tracking-wider">
          Proyecto
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Doc: <span className="font-mono text-[#2563EB] text-xs">{documentoId}</span>
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <PortadaForm />
      </div>

      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <BlockToolbar />
      </div>
    </div>
  );
}
