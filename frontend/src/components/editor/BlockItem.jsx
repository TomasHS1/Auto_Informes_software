import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Pencil,
  Copy,
  Trash2,
  BookOpen,
  Indent,
  Type,
  Image,
  Table,
  FileSearch,
  BarChart3,
  Book,
  User,
} from "lucide-react";
import { useDocumentStore } from "../../store/documentStore";
import { DialogCapitulo } from "./dialogs/DialogCapitulo";
import { DialogSubtitulo } from "./dialogs/DialogSubtitulo";
import { DialogTexto } from "./dialogs/DialogTexto";
import { DialogFigura } from "./dialogs/DialogFigura";
import { DialogTabla } from "./dialogs/DialogTabla";
import { DialogCasoUso } from "./dialogs/DialogCasoUso";
import { DialogMatrizESA } from "./dialogs/DialogMatrizESA";

const metaBloques = {
  capitulo: { icon: BookOpen, tag: "CAPITULO", color: "bg-blue-100 text-blue-700", Dialog: DialogCapitulo },
  subtitulo: { icon: Indent, tag: "SUBTITULO", color: "bg-indigo-100 text-indigo-700", Dialog: DialogSubtitulo },
  texto: { icon: Type, tag: "TEXTO", color: "bg-gray-100 text-gray-700", Dialog: DialogTexto },
  figura: { icon: Image, tag: "FIGURA", color: "bg-green-100 text-green-700", Dialog: DialogFigura },
  tabla_simple: { icon: Table, tag: "TABLA", color: "bg-orange-100 text-orange-700", Dialog: DialogTabla },
  caso_uso: { icon: FileSearch, tag: "CASO DE USO", color: "bg-purple-100 text-purple-700", Dialog: DialogCasoUso },
  matriz_ur_esa: { icon: BarChart3, tag: "MATRIZ ESA", color: "bg-red-100 text-red-700", Dialog: DialogMatrizESA },
  apa: { icon: Book, tag: "BIBLIOGRAFIA", color: "bg-teal-100 text-teal-700", Dialog: null },
  definicion: { icon: User, tag: "ACTOR", color: "bg-pink-100 text-pink-700", Dialog: null },
};

function resumenBloque(bloque) {
  const args = bloque.args || {};
  const m = bloque.metodo;
  if (m === "capitulo") return args.titulo || "Sin titulo";
  if (m === "subtitulo") return args.subtitulo || "Sin subtitulo";
  if (m === "texto") return (args.texto || "").slice(0, 50) + "...";
  if (m === "figura") return args.leyenda || "Sin leyenda";
  if (m === "tabla_simple") return args.leyenda || "Sin leyenda";
  if (m === "caso_uso") return args.nombre || "Sin nombre";
  if (m === "matriz_ur_esa") {
    const cats = args.categorias || [];
    return `${cats.length} categoria(s)`;
  }
  if (m === "apa") return `${(args.lista_referencias || []).length} referencia(s)`;
  if (m === "definicion") return args.termino || "Sin termino";
  return "";
}

export function BlockItem({ bloque, index }) {
  const addBloque = useDocumentStore((s) => s.addBloque);
  const removeBloque = useDocumentStore((s) => s.removeBloque);
  const [editOpen, setEditOpen] = useState(false);
  const meta = metaBloques[bloque.metodo] || metaBloques.texto;
  const Icon = meta.icon;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: bloque.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleEdit = () => {
    if (!meta.Dialog) return;
    setEditOpen(true);
  };

  const handleDuplicate = () => {
    addBloque(bloque.metodo, structuredClone(bloque.args));
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow"
      >
        <button
          {...attributes}
          {...listeners}
          className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing p-1"
        >
          <GripVertical size={18} />
        </button>

        <div className={`px-2 py-0.5 rounded-md text-xs font-bold ${meta.color}`}>
          {meta.tag}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-[#1F2937] font-medium truncate">
            {resumenBloque(bloque)}
          </p>
        </div>

        <span className="text-xs text-gray-400 font-mono">#{index + 1}</span>

        <div className="flex items-center gap-1">
          {meta.Dialog && (
            <button
              onClick={handleEdit}
              className="p-2 rounded-lg hover:bg-amber-50 text-amber-500 transition-colors"
              title="Editar"
            >
              <Pencil size={16} />
            </button>
          )}
          <button
            onClick={handleDuplicate}
            className="p-2 rounded-lg hover:bg-blue-50 text-blue-400 hover:text-blue-600 transition-colors"
            title="Duplicar"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={() => removeBloque(bloque.id)}
            className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {editOpen && meta.Dialog && (
        <meta.Dialog
          open={true}
          onClose={() => setEditOpen(false)}
          initialArgs={bloque.args}
          onSave={(args) => {
            useDocumentStore.getState().updateBloque(bloque.id, args);
            setEditOpen(false);
          }}
        />
      )}
    </>
  );
}
