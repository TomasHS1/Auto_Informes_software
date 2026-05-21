import { useDocumentStore } from "../../store/documentStore";

export function PortadaForm() {
  const portada = useDocumentStore((s) => s.portada);
  const setPortada = useDocumentStore((s) => s.setPortada);

  const update = (key, value) => setPortada({ [key]: value });

  return (
    <div className="px-4 py-3 flex flex-col gap-2.5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Portada</p>
      <Field label="Titulo" value={portada.titulo} onChange={(v) => update("titulo", v)} />
      <div className="grid grid-cols-2 gap-2">
        <Field label="N° Grupo" value={portada.grupo} onChange={(v) => update("grupo", v)} />
        <Field label="Logo" value={portada.logo} onChange={(v) => update("logo", v)} />
      </div>
      <Field label="Facultad" value={portada.facultad} onChange={(v) => update("facultad", v)} />
      <Field label="Curso" value={portada.curso} onChange={(v) => update("curso", v)} />
      <Field label="Profesor" value={portada.profesor} onChange={(v) => update("profesor", v)} />
      <div className="grid grid-cols-2 gap-2">
        <Field label="Ciudad" value={portada.ciudad} onChange={(v) => update("ciudad", v)} />
        <Field label="Anio" value={portada.anio} onChange={(v) => update("anio", v)} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Autores</label>
        <textarea
          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-none"
          rows={3}
          value={portada.autores}
          onChange={(e) => update("autores", e.target.value)}
        />
      </div>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-gray-600 mb-0.5">{label}</label>
      <input
        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
