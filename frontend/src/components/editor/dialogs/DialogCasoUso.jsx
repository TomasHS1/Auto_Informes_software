import { useState } from "react";
import { X } from "lucide-react";

const CAMPOS = [
  { key: "nombre", label: "Nombre del caso de uso", type: "input" },
  { key: "actores", label: "Actor(es)", type: "input" },
  { key: "resumen", label: "Resumen", type: "textarea" },
  { key: "frecuencia", label: "Frecuencia", type: "input" },
  { key: "precondiciones", label: "Precondiciones", type: "textarea" },
  { key: "descripcion", label: "Descripcion (pasos)", type: "textarea" },
  { key: "excepciones", label: "Excepciones", type: "textarea" },
  { key: "poscondiciones", label: "Poscondiciones", type: "textarea" },
  { key: "dependencias", label: "Dependencias", type: "input" },
];

export function DialogCasoUso({ open, onClose, onSave, initialArgs = {} }) {
  const [vals, setVals] = useState(() => {
    const v = {};
    CAMPOS.forEach((c) => { v[c.key] = initialArgs[c.key] || ""; });
    return v;
  });
  if (!open) return null;

  const update = (key, value) => setVals((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#1F2937]">Editor de Caso de Uso</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X size={20} /></button>
        </div>

        {CAMPOS.map((campo) => (
          <div key={campo.key} className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">{campo.label}</label>
            {campo.type === "textarea" ? (
              <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-none" rows={3} value={vals[campo.key]} onChange={(e) => update(campo.key, e.target.value)} />
            ) : (
              <input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]" value={vals[campo.key]} onChange={(e) => update(campo.key, e.target.value)} />
            )}
          </div>
        ))}

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
          <button onClick={() => onSave(vals)} className="px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg">Guardar</button>
        </div>
      </div>
    </div>
  );
}
