import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus, Trash2 } from "lucide-react";

export function DialogTabla({ open, onClose, onSave, initialArgs = {} }) {
  const [leyenda, setLeyenda] = useState(initialArgs.leyenda || "");
  const [color, setColor] = useState(initialArgs.color_encabezado || "D9D9D9");
  const [headers, setHeaders] = useState(initialArgs.encabezados || ["ID", "Tarea", "Estado"]);
  const [filas, setFilas] = useState(initialArgs.filas || [["", "", ""]]);

  const updateHeader = (i, val) => { const h = [...headers]; h[i] = val; setHeaders(h); };
  const addHeader = () => { setHeaders([...headers, ""]); setFilas(filas.map((f) => [...f, ""])); };
  const removeHeader = (i) => {
    if (headers.length <= 1) return;
    setHeaders(headers.filter((_, idx) => idx !== i));
    setFilas(filas.map((f) => f.filter((_, idx) => idx !== i)));
  };
  const updateFila = (ri, ci, val) => {
    setFilas(filas.map((r, i) => (i === ri ? r.map((c, j) => (j === ci ? val : c)) : r)));
  };
  const addFila = () => setFilas([...filas, headers.map(() => "")]);
  const removeFila = (i) => {
    if (filas.length <= 1) return;
    setFilas(filas.filter((_, idx) => idx !== i));
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl w-full max-w-5xl mx-4 max-h-[92vh] overflow-auto p-6 z-50 focus:outline-none">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-bold text-[#1F2937]">Editor de Tabla</Dialog.Title>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X size={20} /></button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Leyenda</label>
              <input className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]" value={leyenda} onChange={(e) => setLeyenda(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Color encabezado</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={`#${color}`}
                  onChange={(e) => setColor(e.target.value.replace("#", ""))}
                  className="w-10 h-10 border rounded cursor-pointer"
                  title="Color del encabezado"
                />
                <input className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]" value={color} onChange={(e) => setColor(e.target.value)} placeholder="D9D9D9" />
              </div>
            </div>
          </div>

          <label className="block text-xs font-semibold text-gray-700 mb-2">Encabezados</label>
          <div className="flex gap-2 mb-4 flex-wrap items-center">
            {headers.map((h, i) => (
              <span key={i} className="inline-flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1.5">
                <input className="w-24 text-xs bg-transparent outline-none" value={h} onChange={(e) => updateHeader(i, e.target.value)} />
                <button onClick={() => removeHeader(i)} className="text-red-400 hover:text-red-600 ml-1"><Trash2 size={12} /></button>
              </span>
            ))}
            <button onClick={addHeader} className="text-xs text-[#2563EB] font-medium hover:underline"><Plus size={14} className="inline" /> Columna</button>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  {headers.map((h, i) => (
                    <th key={i} className="border border-gray-300 px-3 py-2 text-xs font-semibold text-left min-w-[100px]">{h || `Col ${i + 1}`}</th>
                  ))}
                  <th className="border border-gray-300 px-2 py-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filas.map((fila, ri) => (
                  <tr key={ri} className="bg-white">
                    {headers.map((_, ci) => (
                      <td key={ci} className="border border-gray-200 p-0">
                        <input className="w-full px-3 py-2 text-xs outline-none focus:bg-blue-50" value={ci < fila.length ? fila[ci] : ""} onChange={(e) => updateFila(ri, ci, e.target.value)} />
                      </td>
                    ))}
                    <td className="border border-gray-200 p-1 text-center">
                      <button onClick={() => removeFila(ri)} className="text-red-400 hover:text-red-600 p-1" title="Eliminar fila"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={addFila} className="mt-3 text-sm text-[#2563EB] font-medium hover:underline inline-flex items-center gap-1">
            <Plus size={14} /> Agregar Fila
          </button>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
            <button onClick={onClose} className="px-5 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button onClick={() => onSave({ leyenda, color_encabezado: color, encabezados: headers, filas })} className="px-5 py-2 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg">Guardar Tabla</button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
