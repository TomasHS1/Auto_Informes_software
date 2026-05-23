import { useState } from "react";
import {
  BookOpen,
  Indent,
  Type,
  Image,
  Table,
  FileSearch,
  BarChart3,
  Book,
} from "lucide-react";
import { useDocumentStore } from "../../store/documentStore";
import { DialogCapitulo } from "./dialogs/DialogCapitulo";
import { DialogSubtitulo } from "./dialogs/DialogSubtitulo";
import { DialogTexto } from "./dialogs/DialogTexto";
import { DialogFigura } from "./dialogs/DialogFigura";
import { DialogTabla } from "./dialogs/DialogTabla";
import { DialogCasoUso } from "./dialogs/DialogCasoUso";
import { DialogMatrizESA } from "./dialogs/DialogMatrizESA";
import { DialogAPA } from "./dialogs/DialogAPA";

const botones = [
  { label: "+ Capitulo", icon: BookOpen, metodo: "capitulo", Dialog: DialogCapitulo },
  { label: "+ Subtitulo", icon: Indent, metodo: "subtitulo", Dialog: DialogSubtitulo },
  { label: "+ Texto", icon: Type, metodo: "texto", Dialog: DialogTexto },
  { label: "+ Figura", icon: Image, metodo: "figura", Dialog: DialogFigura },
  { label: "+ Tabla", icon: Table, metodo: "tabla_simple", Dialog: DialogTabla },
  { label: "+ Caso de Uso", icon: FileSearch, metodo: "caso_uso", Dialog: DialogCasoUso },
  { label: "+ Matriz UR ESA", icon: BarChart3, metodo: "matriz_ur_esa", Dialog: DialogMatrizESA },
  { label: "+ Bibliografia APA", icon: Book, metodo: "apa", Dialog: DialogAPA },
];

export function BlockToolbar() {
  const addBloque = useDocumentStore((s) => s.addBloque);
  const [dialogOpen, setDialogOpen] = useState(null);

  const handleAdd = (btn) => {
    setDialogOpen(btn);
  };

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 px-1">
        Agregar bloque
      </p>
      {botones.map((btn) => (
        <button
          key={btn.metodo}
          onClick={() => handleAdd(btn)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-left text-[#1F2937] hover:bg-gray-100 rounded-lg transition-colors"
        >
          <btn.icon size={16} className="text-[#2563EB]" />
          {btn.label}
        </button>
      ))}

      {dialogOpen && (
        <dialogOpen.Dialog
          open={true}
          onClose={() => setDialogOpen(null)}
          onSave={(args) => {
            addBloque(dialogOpen.metodo, args);
            setDialogOpen(null);
          }}
        />
      )}
    </div>
  );
}
