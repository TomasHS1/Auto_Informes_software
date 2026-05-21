import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
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
  const update = (key, value) => setVals((prev) => ({ ...prev, [key]: value }));

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-auto p-6 z-50 focus:outline-none">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-bold text-[#1F2937]">Editor de Caso de Uso</Dialog.Title>
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
