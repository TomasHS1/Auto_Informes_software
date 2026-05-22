import { create } from "zustand";
import { useDocumentStore } from "./documentStore";
import { wsUrl } from "../lib/api";

export const wsStore = create((set, get) => ({
  status: "disconnected",
  socket: null,
  documentoId: "proyecto1",

  connect: (id) => {
    const docId = id || get().documentoId;

    const prev = get().socket;
    if (prev) {
      try { prev.close(); } catch (e) {}
    }

    set({ status: "connecting", documentoId: docId, socket: null });

    try {
      const ws = new WebSocket(wsUrl(docId));
      set({ socket: ws });

      ws.onopen = () => {
        if (get().socket !== ws) return;
        set({ status: "connected" });
      };

      ws.onmessage = (event) => {
        if (get().socket !== ws) return;
        try {
          const data = JSON.parse(event.data);
          const store = useDocumentStore.getState();

          if (data.tipo === "estado_completo") {
            const serverElements = data.elementos || [];
            if (serverElements.length > 0) {
              store.reemplazarElementos(serverElements);
            } else {
              const local = useDocumentStore.getState().elementos;
              if (local.length > 0) {
                local.forEach((el, i) => {
                  get().send({
                    tipo: "agregar_bloque",
                    idx: i,
                    bloque: { metodo: el.metodo, args: el.args },
                  });
                });
              }
            }
          } else if (data.tipo === "agregar_bloque") {
            const { idx, bloque } = data;
            const prev = useDocumentStore.getState().elementos;
            const nuevos = [...prev];
            const b = { ...bloque, id: crypto.randomUUID() };
            if (idx != null && idx <= nuevos.length) nuevos.splice(idx, 0, b);
            else nuevos.push(b);
            useDocumentStore.setState({ elementos: nuevos });
          } else if (data.tipo === "actualizar_bloque") {
            const idx = data.idx;
            const prev = useDocumentStore.getState().elementos;
            if (idx >= 0 && idx < prev.length) {
              const nuevos = [...prev];
              nuevos[idx] = { ...nuevos[idx], args: data.bloque.args };
              useDocumentStore.setState({ elementos: nuevos });
            }
          } else if (data.tipo === "eliminar_bloque") {
            const idx = data.idx;
            const prev = useDocumentStore.getState().elementos;
            if (idx >= 0 && idx < prev.length) {
              useDocumentStore.setState({
                elementos: prev.filter((_, i) => i !== idx),
              });
            }
          } else if (data.tipo === "mover_bloque") {
            const { idx_origen, idx_destino } = data;
            const prev = [...useDocumentStore.getState().elementos];
            if (
              idx_origen >= 0 &&
              idx_origen < prev.length &&
              idx_destino >= 0 &&
              idx_destino < prev.length
            ) {
              const [item] = prev.splice(idx_origen, 1);
              prev.splice(idx_destino, 0, item);
              useDocumentStore.setState({ elementos: prev });
            }
          }
        } catch (e) {
          console.error("WS message error:", e);
        }
      };

      ws.onclose = () => {
        if (get().socket === ws) {
          set({ status: "disconnected", socket: null });
        }
      };

      ws.onerror = () => {
        if (get().socket === ws) {
          set({ status: "error" });
        }
      };
    } catch (e) {
      set({ status: "error" });
    }
  },

  send: (payload) => {
    const { socket, status } = get();
    if (socket && status === "connected") {
      socket.send(JSON.stringify(payload));
    }
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      try { socket.close(); } catch (e) {}
    }
    set({ status: "disconnected", socket: null });
  },
}));
