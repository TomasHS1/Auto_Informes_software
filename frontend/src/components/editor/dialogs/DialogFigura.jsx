import { useState, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Image, Upload, Loader2 } from "lucide-react";
import { apiUrl } from "../../../lib/api";

export function DialogFigura({ open, onClose, onSave, initialArgs = {} }) {
  const [ruta, setRuta] = useState(initialArgs.ruta_imagen || "");
  const [leyenda, setLeyenda] = useState(initialArgs.leyenda || "");
  const [subiendo, setSubiendo] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(
    initialArgs.ruta_imagen ? apiUrl("/" + initialArgs.ruta_imagen) : null
  );
  const fileRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendo(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(apiUrl("/upload"), { method: "POST", body: form });
      if (!res.ok) throw new Error("Error al subir");
      const data = await res.json();
      setRuta(data.filename);
      setPreviewUrl(apiUrl("/" + data.filename));
    } catch (err) {
      alert("Error al subir la imagen: " + err.message);
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 z-50 focus:outline-none">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-bold text-[#1F2937]">Agregar Figura</Dialog.Title>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X size={20} /></button>
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar imagen</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={subiendo}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-[#2563EB] hover:text-[#2563EB] transition-colors disabled:opacity-50"
          >
            {subiendo ? (
              <><Loader2 size={18} className="animate-spin" /> Subiendo...</>
            ) : (
              <><Upload size={18} /> Elegir archivo (JPG, PNG, GIF)</>
            )}
          </button>

          <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">
            O escribir nombre de archivo ya subido
          </label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent mb-3"
            value={ruta}
            onChange={(e) => { setRuta(e.target.value); setPreviewUrl(e.target.value ? apiUrl("/" + e.target.value) : null); }}
            placeholder="ej: diagrama.png"
          />

          <label className="block text-sm font-medium text-gray-700 mb-1">Leyenda</label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            value={leyenda}
            onChange={(e) => setLeyenda(e.target.value)}
          />

          {previewUrl ? (
            <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-contain bg-gray-50"
                onError={(e) => { e.target.style.display = "none"; }}
              />
              <div className="px-3 py-2 bg-gray-50 text-xs text-gray-500 font-mono truncate">{ruta}</div>
            </div>
          ) : ruta ? (
            <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <Image size={40} />
                <span className="text-xs font-mono truncate max-w-[300px]">{ruta}</span>
                <span className="text-[10px] text-gray-400">
                  La imagen se incrustara al exportar a .docx
                </span>
              </div>
            </div>
          ) : null}

          <div className="flex justify-end gap-2 mt-6">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button onClick={() => onSave({ ruta_imagen: ruta, leyenda })} className="px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg">Guardar</button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
