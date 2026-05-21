import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { BlockItem } from "./BlockItem";
import { useDocumentStore } from "../../store/documentStore";

export function BlockList() {
  const elementos = useDocumentStore((s) => s.elementos);
  const moveBloque = useDocumentStore((s) => s.moveBloque);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = elementos.findIndex((e) => e.id === active.id);
    const newIndex = elementos.findIndex((e) => e.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      moveBloque(oldIndex, newIndex);
    }
  };

  if (elementos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
        <p className="text-lg font-medium">El documento esta vacio</p>
        <p className="text-sm">Agrega bloques desde la barra lateral izquierda</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={elementos.map((e) => e.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {elementos.map((bloque, index) => (
            <BlockItem key={bloque.id} bloque={bloque} index={index} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
