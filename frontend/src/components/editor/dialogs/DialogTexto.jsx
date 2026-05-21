import { useState } from "react";
import { X } from "lucide-react";

export function DialogTexto({ open, onClose, onSave, initialArgs = {} }) {
  const [texto, setTexto] = useState(initialArgs.texto || "");
  const [negrita, setNegrita] = useState(initialArgs.negrita || false);
  const [cursiva, setCursiva] = useState(initialArgs.cursiva || false);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#1F2937]">Editar Texto Libre</h2>
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
      </div>
    </div>
  );
}
