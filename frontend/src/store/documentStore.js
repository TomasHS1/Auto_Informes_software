import { create } from "zustand";
import { wsStore } from "./wsStore";

function nuevoId() {
  return crypto.randomUUID();
}

export const useDocumentStore = create((set, get) => ({
  portada: {
    titulo: "PROYECTO DE SOFTWARE INGECON",
    grupo: "1",
    logo: "logo_unab",
    facultad: "Facultad de Ingenieria",
    curso: "Ingenieria de Software I",
    autores: "Diego Carabajal Belmar\nTomas Hurtado Silva",
    profesor: "Paulo Quinsacara Jofre",
    ciudad: "Santiago",
    anio: "2026",
  },

  elementos: [
    {
      id: nuevoId(),
      metodo: "capitulo",
      args: { titulo: "Analisis Interno Externo de la Organizacion" },
    },
    {
      id: nuevoId(),
      metodo: "subtitulo",
      args: { subtitulo: "Analisis PESTEL" },
    },
    {
      id: nuevoId(),
      metodo: "texto",
      args: {
        texto:
          "Para llevar a cabo el analisis externo del macroentorno se aplico la herramienta PESTEL de forma rigurosa...",
      },
    },
    {
      id: nuevoId(),
      metodo: "capitulo",
      args: { titulo: "Requerimientos del Sistema" },
    },
    {
      id: nuevoId(),
      metodo: "caso_uso",
      args: {
        nombre: "CU-01: Iniciar Sesion",
        actores: "Administrador",
        resumen: "Permite acceder a la plataforma.",
        frecuencia: "Alta",
        precondiciones: "Usuario registrado",
        descripcion: "1. Ingresar credenciales.\n2. Validar en BD.",
        excepciones: "Error 401",
        poscondiciones: "Acceso al panel",
        dependencias: "Ninguna",
      },
    },
    {
      id: nuevoId(),
      metodo: "matriz_ur_esa",
      args: {
        categorias: [
          {
            nombre: "Formulario de Contacto: Visitante",
            reqs: [
              {
                tipo: "UR",
                id: "1.1",
                nombre: "Enviar Consulta",
                puntos: ["1", "1", "1", "1", "1", "1"],
                descripcion:
                  "El sistema debe permitir al Visitante enviar una Consulta de contacto...",
              },
            ],
          },
        ],
      },
    },
  ],

  setPortada: (data) => {
    set((state) => ({ portada: { ...state.portada, ...data } }));
    const { status, send } = wsStore.getState();
    if (status === "connected") {
      send({ tipo: "actualizar_portada", portada: get().portada });
    }
  },

  _aplicarPortadaServidor: (data) => set((state) => ({ portada: { ...state.portada, ...data } })),

  addBloque: (metodo, args) => {
    const id = nuevoId();
    const bloque = { id, metodo, args };
    set((state) => ({ elementos: [...state.elementos, bloque] }));

    const { status, send } = wsStore.getState();
    if (status === "connected") {
      send({
        tipo: "agregar_bloque",
        bloque: { metodo, args },
      });
    }
  },

  updateBloque: (elementId, args) => {
    set((state) => ({
      elementos: state.elementos.map((el) =>
        el.id === elementId ? { ...el, args } : el
      ),
    }));

    const el = get().elementos.find((e) => e.id === elementId);
    if (!el) return;
    const idx = get().elementos.findIndex((e) => e.id === elementId);

    const { status, send } = wsStore.getState();
    if (status === "connected") {
      send({
        tipo: "actualizar_bloque",
        idx,
        bloque: { metodo: el.metodo, args: el.args },
      });
    }
  },

  removeBloque: (elementId) => {
    const idx = get().elementos.findIndex((e) => e.id === elementId);
    if (idx < 0) return;
    set((state) => ({
      elementos: state.elementos.filter((el) => el.id !== elementId),
    }));

    const { status, send } = wsStore.getState();
    if (status === "connected") {
      send({ tipo: "eliminar_bloque", idx });
    }
  },

  moveBloque: (fromIndex, toIndex) => {
    set((state) => {
      const elementos = [...state.elementos];
      const [item] = elementos.splice(fromIndex, 1);
      elementos.splice(toIndex, 0, item);
      return { elementos };
    });

    const { status, send } = wsStore.getState();
    if (status === "connected") {
      send({ tipo: "mover_bloque", idx_origen: fromIndex, idx_destino: toIndex });
    }
  },

  reemplazarElementos: (nuevos) => {
    set({ elementos: nuevos.map((b) => ({ ...b, id: b.id || nuevoId() })) });
  },
}));
