import { FileText } from "lucide-react";

export function PreviewPDFButton() {
  const handlePreviewPDF = async () => {
    try {
      const res = await fetch("http://localhost:8000/preview-html?doc=proyecto1");
      if (res.ok) {
        window.open("http://localhost:8000/preview-html?doc=proyecto1", "_blank");
      }
    } catch (e) {
      alert("Error al abrir preview: " + e.message);
    }
  };

  return (
    <button
      onClick={handlePreviewPDF}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors border border-[#2563EB]"
    >
      <FileText size={16} />
      Vista previa HTML
    </button>
  );
}
