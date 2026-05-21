import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Image } from "lucide-react";

export function DialogFigura({ open, onClose, onSave, initialArgs = {} }) {
  const [ruta, setRuta] = useState(initialArgs.ruta_imagen || "");
  const [leyenda, setLeyenda] = useState(initialArgs.leyenda || "");

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 z-50 focus:outline-none">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-bold text-[#1F2937]">Agregar Figura</Dialog.Title>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X size={20} /></button>
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del archivo</label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent mb-3"
            value={ruta}
            onChange={(e) => setRuta(e.target.value)}
          />

          <label className="block text-sm font-medium text-gray-700 mb-1">Leyenda</label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            value={leyenda}
            onChange={(e) => setLeyenda(e.target.value)}
          />

          {ruta && (
            <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <Image size={40} />
                <span className="text-xs font-mono truncate max-w-[300px]">{ruta}</span>
                <span className="text-[10px] text-gray-400">
                  La imagen se incrustara al exportar a .docx
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button onClick={() => onSave({ ruta_imagen: ruta, leyenda })} className="px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg">Guardar</button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
