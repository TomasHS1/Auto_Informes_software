import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export function DialogTexto({ open, onClose, onSave, initialArgs = {} }) {
  const [texto, setTexto] = useState(initialArgs.texto || "");
  const [negrita, setNegrita] = useState(initialArgs.negrita || false);
  const [cursiva, setCursiva] = useState(initialArgs.cursiva || false);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 z-50 focus:outline-none">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-bold text-[#1F2937]">Editar Texto Libre</Dialog.Title>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X size={20} /></button>
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent resize-none"
            rows={6}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            autoFocus
          />
          <div className="flex gap-4 mt-3">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={negrita} onChange={(e) => setNegrita(e.target.checked)} className="rounded" /> Negrita
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={cursiva} onChange={(e) => setCursiva(e.target.checked)} className="rounded" /> Cursiva
            </label>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button onClick={() => onSave({ texto, negrita, cursiva })} className="px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg">Guardar</button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
