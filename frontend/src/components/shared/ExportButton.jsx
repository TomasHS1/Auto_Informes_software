import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useDocumentStore } from "../../store/documentStore";

export function ExportButton() {
  const { portada, elementos } = useDocumentStore();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const autores = portada.autores
        .split("\n")
        .map((a) => a.trim())
        .filter(Boolean);

      const payload = {
        titulo: portada.titulo,
        grupo: portada.grupo,
        logo: portada.logo,
        facultad: portada.facultad,
        curso: portada.curso,
        autores,
        profesor: portada.profesor,
        ciudad: portada.ciudad,
        anio: portada.anio,
        elementos: elementos.map(({ metodo, args }) => ({ metodo, args })),
      };

      const res = await fetch("http://localhost:8000/compilar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Error HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Grupo ${portada.grupo} - Documento_Final.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.error("Export error:", e);
      alert("Error al generar el documento:\n" + (e.message || "Verifica que el servidor este corriendo en puerto 8000"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] disabled:opacity-60 text-white font-semibold text-sm rounded-lg transition-colors"
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
      {loading ? "Generando..." : "Exportar .docx"}
    </button>
  );
}
