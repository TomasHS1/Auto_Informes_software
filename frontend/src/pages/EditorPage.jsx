import { ExportButton } from "../components/shared/ExportButton";
import { BlockList } from "../components/editor/BlockList";

export function EditorPage() {
  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#1F2937]">Estructura del Documento</h2>
        <ExportButton />
      </div>

      <div className="flex-1 overflow-auto">
        <BlockList />
      </div>
    </div>
  );
}
