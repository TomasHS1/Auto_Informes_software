import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus, Trash2 } from "lucide-react";

export function DialogMatrizESA({ open, onClose, onSave, initialArgs = {} }) {
  const [categorias, setCategorias] = useState(() => {
    if (initialArgs.categorias) return [...initialArgs.categorias.map((c) => ({ ...c, reqs: [...c.reqs] }))];
    return [{ nombre: "", reqs: [{ tipo: "UR", id: "", nombre: "", puntos: ["", "", "", "", "", ""], descripcion: "" }] }];
  });

  const updateCat = (ci, key, val) => { const c = [...categorias]; c[ci] = { ...c[ci], [key]: val }; setCategorias(c); };
  const addCat = () => setCategorias([...categorias, { nombre: "", reqs: [{ tipo: "UR", id: "", nombre: "", puntos: ["", "", "", "", "", ""], descripcion: "" }] }]);
  const removeCat = (ci) => setCategorias(categorias.filter((_, i) => i !== ci));

  const updateReq = (ci, ri, key, val) => {
    const c = [...categorias];
    c[ci].reqs = c[ci].reqs.map((r, i) => (i === ri ? { ...r, [key]: val } : r));
    setCategorias(c);
  };
  const addReq = (ci) => {
    const c = [...categorias];
    c[ci].reqs.push({ tipo: "UR", id: "", nombre: "", puntos: ["", "", "", "", "", ""], descripcion: "" });
    setCategorias(c);
  };
  const removeReq = (ci, ri) => {
    const c = [...categorias];
    c[ci].reqs = c[ci].reqs.filter((_, i) => i !== ri);
    setCategorias(c);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-auto p-6 z-50 focus:outline-none">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-bold text-[#1F2937]">Matriz UR ESA</Dialog.Title>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X size={20} /></button>
          </div>

          {categorias.map((cat, ci) => (
            <div key={ci} className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-bold text-[#2563EB]">Categoria {ci + 1}</span>
                <input className="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]" value={cat.nombre} onChange={(e) => updateCat(ci, "nombre", e.target.value)} placeholder="Nombre de la categoria" />
                <button onClick={() => removeCat(ci)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
              </div>

              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    {["Tipo", "ID", "Nombre", "Nec", "Prio", "Est", "Cla", "Ver", "Fue", "Desc", ""].map((h, i) => (
                      <th key={i} className="border border-gray-300 px-1 py-1 text-[10px] font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cat.reqs.map((req, ri) => (
                    <tr key={ri} className="bg-white">
                      <td className="border border-gray-200 p-0"><input className="w-full px-1 py-1 text-xs outline-none text-center" value={req.tipo} onChange={(e) => updateReq(ci, ri, "tipo", e.target.value)} /></td>
                      <td className="border border-gray-200 p-0"><input className="w-full px-1 py-1 text-xs outline-none text-center" value={req.id} onChange={(e) => updateReq(ci, ri, "id", e.target.value)} /></td>
                      <td className="border border-gray-200 p-0"><input className="w-full px-1 py-1 text-xs outline-none" value={req.nombre} onChange={(e) => updateReq(ci, ri, "nombre", e.target.value)} /></td>
                      {[0, 1, 2, 3, 4, 5].map((pi) => (
                        <td key={pi} className="border border-gray-200 p-0"><input className="w-full px-1 py-1 text-xs outline-none text-center" value={(req.puntos || [])[pi] || ""} onChange={(e) => { const pts = [...(req.puntos || [])]; pts[pi] = e.target.value; updateReq(ci, ri, "puntos", pts); }} /></td>
                      ))}
                      <td className="border border-gray-200 p-0"><input className="w-full px-1 py-1 text-xs outline-none" value={req.descripcion || ""} onChange={(e) => updateReq(ci, ri, "descripcion", e.target.value)} /></td>
                      <td className="border border-gray-200 p-1"><button onClick={() => removeReq(ci, ri)} className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button onClick={() => addReq(ci)} className="mt-2 text-xs text-[#2563EB] hover:underline"><Plus size={12} className="inline" /> Requisito</button>
            </div>
          ))}

          <button onClick={addCat} className="text-sm text-[#10B981] font-medium hover:underline"><Plus size={14} className="inline" /> Nueva Categoria</button>

          <div className="flex justify-end gap-2 mt-6">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button onClick={() => onSave({ categorias })} className="px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg">Guardar</button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
