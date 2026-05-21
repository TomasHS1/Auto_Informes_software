import { useState } from "react";
import { X } from "lucide-react";

export function DialogFigura({ open, onClose, onSave, initialArgs = {} }) {
  const [ruta, setRuta] = useState(initialArgs.ruta_imagen || "");
  const [leyenda, setLeyenda] = useState(initialArgs.leyenda || "");
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#1F2937]">Agregar Figura</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X size={20} /></button>
        </div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del archivo</label>
        <input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent mb-3" value={ruta} onChange={(e) => setRuta(e.target.value)} />
        <label className="block text-sm font-medium text-gray-700 mb-1">Leyenda</label>
        <input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent" value={leyenda} onChange={(e) => setLeyenda(e.target.value)} />
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
          <button onClick={() => onSave({ ruta_imagen: ruta, leyenda })} className="px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg">Guardar</button>
        </div>
      </div>
    </div>
  );
}
