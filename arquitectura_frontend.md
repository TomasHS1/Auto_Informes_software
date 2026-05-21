# Arquitectura Frontend — Gestor de Informes Universitarios
### Stack Moderno · Componentes · Estructura de Vistas

---

## 1. Stack Recomendado

### Por qué este stack y no otro

El sistema tiene tres restricciones concretas: backend Python/FastAPI ya existente, usuarios técnicos (estudiantes de ingeniería), y un flujo de trabajo centrado en **edición estructurada → previsualización → exportación**. Eso descarta frameworks orientados a marketing (Astro, Next.js con SSG) y apunta a una SPA liviana con estado local reactivo.

---

### Decisión: **React 18 + Vite + shadcn/ui + Tailwind CSS**

```
react@18          → UI reactiva con estado local por componente
vite@5            → Dev server ultrarrápido, HMR instantáneo, build en <2s
tailwindcss@3     → Utilidades atómicas, sin CSS custom para el 95% de los casos
shadcn/ui         → Componentes accesibles, sin opinión visual fuerte, 100% customizables
@dnd-kit/core     → Drag-and-drop para reordenar bloques (reemplaza _mover_arriba / _mover_abajo)
zustand           → Estado global liviano (elementos_documento, sesión WS)
react-pdf/renderer → Previsualización PDF en el navegador (Estrategia B, sin iframe)
```

**Por qué shadcn/ui sobre Material UI o Ant Design:**
- No instala una librería monolítica: copia los componentes al repo, son tuyos.
- No impone un design system con opinión visual fuerte (no "se ve a Material UI").
- Compatible con Tailwind nativamente.
- Cada componente es accesible (Radix UI como primitiva).

**Por qué Zustand sobre Redux o Context:**
- El estado es simple: una lista de bloques + conexión WS.
- Zustand es < 1 KB, sin boilerplate, sin providers anidados.

---

## 2. Estructura de Carpetas

```
src/
├── components/
│   ├── editor/               ← Vista de edición
│   │   ├── BlockList.jsx
│   │   ├── BlockItem.jsx
│   │   ├── BlockToolbar.jsx
│   │   └── dialogs/
│   │       ├── DialogCapitulo.jsx
│   │       ├── DialogSubtitulo.jsx
│   │       ├── DialogTexto.jsx
│   │       ├── DialogTabla.jsx
│   │       ├── DialogFigura.jsx
│   │       ├── DialogCasoUso.jsx
│   │       └── DialogMatrizESA.jsx
│   ├── preview/              ← Vista de previsualización
│   │   ├── PreviewPanel.jsx
│   │   ├── PageSimulator.jsx
│   │   ├── blocks/
│   │   │   ├── PreviewCapitulo.jsx
│   │   │   ├── PreviewSubtitulo.jsx
│   │   │   ├── PreviewTexto.jsx
│   │   │   ├── PreviewTabla.jsx
│   │   │   ├── PreviewFigura.jsx
│   │   │   ├── PreviewCasoUso.jsx
│   │   │   └── PreviewMatrizESA.jsx
│   │   └── PreviewPDFButton.jsx
│   ├── portada/
│   │   └── PortadaForm.jsx
│   ├── layout/
│   │   ├── AppShell.jsx
│   │   ├── Sidebar.jsx
│   │   └── TopBar.jsx
│   └── shared/
│       ├── StatusBadge.jsx   ← Indicador de conexión WS
│       └── ExportButton.jsx
├── store/
│   ├── documentStore.js      ← Zustand: elementos_documento
│   └── wsStore.js            ← Zustand: estado WebSocket
├── hooks/
│   ├── useWebSocket.js
│   └── usePreviewSync.js
├── lib/
│   ├── serializer.js         ← elementos_documento → HTML string (Estrategia A)
│   └── wsClient.js           ← Wrapper sobre WebSocket nativo
└── pages/
    ├── EditorPage.jsx
    └── PreviewPage.jsx
```

---

## 3. Vista de Edición — Árbol de Componentes

```
EditorPage
├── AppShell
│   ├── TopBar
│   │   ├── [Logo / Título del proyecto]
│   │   ├── StatusBadge (WS: conectado | desconectado | sincronizando)
│   │   └── ExportButton → POST /compilar
│   └── Sidebar
│       ├── PortadaForm
│       │   ├── Input: Título del proyecto
│       │   ├── Input: Número de grupo
│       │   ├── Input: Facultad / Curso
│       │   ├── Textarea: Autores (uno por línea)
│       │   ├── Input: Profesor
│       │   └── Input: Ciudad / Año
│       └── BlockToolbar
│           ├── Button: + Capítulo
│           ├── Button: + Subtítulo
│           ├── Button: + Texto
│           ├── Button: + Figura
│           ├── Button: + Tabla
│           ├── Button: + Caso de Uso
│           ├── Button: + Matriz UR ESA
│           └── Button: + Bibliografía APA
│
└── [main content]
    └── BlockList                          ← Lista reordenable (DnD)
        └── BlockItem[]                    ← Un item por elemento del documento
            ├── DragHandle                 ← Ícono de agarre para reordenar
            ├── BlockTypeTag               ← Pill: "CAPÍTULO" | "TABLA" | etc.
            ├── BlockSummary               ← Texto preview del contenido (truncado)
            └── BlockActions
                ├── IconButton: Editar     → abre Dialog correspondiente
                ├── IconButton: Duplicar
                └── IconButton: Eliminar
```

### Dialogs de Edición

Cada tipo de bloque tiene su propio Dialog (modal). Todos comparten la misma estructura base:

```
Dialog (shadcn/ui <Dialog>)
├── DialogHeader
│   └── DialogTitle: "Editar [Tipo]"
├── DialogContent
│   └── [Campos específicos del bloque]  ← ver detalle abajo
└── DialogFooter
    ├── Button: Cancelar
    └── Button: Guardar  → dispatch a documentStore + emit WS
```

**Campos por tipo de bloque:**

```
DialogCapitulo
└── Input: Título del capítulo

DialogSubtitulo
├── Input: Título del subtítulo
└── Textarea: Texto (opcional)

DialogTexto
├── Textarea: Contenido
├── Checkbox: Negrita
└── Checkbox: Cursiva

DialogFigura
├── FileInput: Ruta de imagen
├── Input: Leyenda
└── [Preview de la imagen seleccionada]

DialogTabla
├── Input: Leyenda
├── [Editor de filas/columnas dinámico]
│   ├── Row: encabezados (inputs inline)
│   └── Row[]: filas de datos (inputs inline)
├── Button: + Fila
├── Button: + Columna
└── ColorPicker: Color de encabezado

DialogCasoUso
├── Input: Nombre del caso de uso
├── Input: Actores
├── Textarea: Resumen
├── Input: Frecuencia
├── Textarea: Precondiciones
├── Textarea: Descripción (pasos)
├── Textarea: Excepciones
├── Textarea: Postcondiciones
└── Input: Dependencias

DialogMatrizESA
├── [Lista de categorías]
│   └── CategoríaItem[]
│       ├── Input: Nombre de categoría
│       ├── RequisitoItem[]
│       │   ├── Input: ID (RNF-XX)
│       │   ├── Input: Descripción
│       │   └── Select: Prioridad (Alta/Media/Baja)
│       └── Button: + Requisito
└── Button: + Categoría
```

---

## 4. Vista de Previsualización — Árbol de Componentes

```
PreviewPage
├── TopBar (mismo AppShell)
│   └── [Añade] PreviewPDFButton → GET /preview-pdf (Estrategia B, bajo demanda)
│
└── [main content — split view opcional]
    └── PreviewPanel
        ├── PreviewToolbar
        │   ├── Slider: Zoom (50% – 150%)
        │   ├── Badge: "[N] páginas estimadas"
        │   └── Toggle: "Vista simple" | "Vista paginada"
        │
        └── PageSimulator                  ← Simula hoja A4 con la rúbrica en CSS
            └── [bloques renderizados en orden]
                ├── PreviewPortada         ← Portada con logo, autores, etc.
                ├── PreviewIndices         ← Placeholder visual del TOC
                └── PreviewBlock[]         ← Un componente por tipo:
                    ├── PreviewCapitulo
                    │   └── <h1> numerado: "1. INTRODUCCIÓN"
                    ├── PreviewSubtitulo
                    │   └── <h2> numerado: "1.1 Motivación"
                    ├── PreviewTexto
                    │   └── <p> justificado, Arial 12, line-height 1.5
                    ├── PreviewFigura
                    │   ├── <img> centrada
                    │   └── <p class="leyenda"> "Figura 1.1: ..."
                    ├── PreviewTabla
                    │   ├── <p class="leyenda-tabla"> "Tabla 1.1: ..."
                    │   ├── <table> con encabezado coloreado
                    │   └── <p class="fuente-tabla"> "Fuente: Elaboración propia"
                    ├── PreviewCasoUso
                    │   └── <table> de dos columnas (campo | valor)
                    └── PreviewMatrizESA
                        └── <table> con filas agrupadas por categoría
```

### CSS crítico de `PageSimulator` (fidelidad a la rúbrica)

```css
.page-simulator {
  width: 21.59cm;
  min-height: 27.94cm;
  padding: 2.5cm;
  font-family: 'Arial', sans-serif;   /* Arial exacto de la rúbrica */
  font-size: 12pt;
  line-height: 1.5;
  text-align: justify;
  background: white;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  margin: 2rem auto;
}

.page-simulator h1 {
  font-size: 12pt;
  font-weight: bold;
  text-transform: uppercase;
  text-align: left;
  margin-bottom: 1.5em;
}

.page-simulator h2 {
  font-size: 12pt;
  font-weight: bold;
  text-align: left;
  margin-left: 1.25cm;
}

.leyenda, .leyenda-tabla {
  font-size: 9pt;
  line-height: 1.0;
  text-align: center;
}

.page-break {
  border-top: 2px dashed #e5e7eb;
  margin: 1.5cm 0;
  position: relative;
}
.page-break::after {
  content: "— página —";
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: -0.75em;
  background: #f9fafb;
  padding: 0 0.5em;
  font-size: 9pt;
  color: #9ca3af;
}
```

---

## 5. Estado Global (Zustand)

```javascript
// documentStore.js
{
  portada: { titulo, grupo, facultad, curso, autores[], profesor, ciudad, anio },
  elementos: [
    { id: uuid, metodo: "capitulo", args: { titulo: "Introducción" } },
    { id: uuid, metodo: "subtitulo", args: { subtitulo: "Motivación", texto: "..." } },
    { id: uuid, metodo: "figura", args: { ruta: "...", leyenda: "...", correlativo: 1 } },
    // ...
  ],
  addBloque(metodo, args),
  updateBloque(id, args),
  removeBloque(id),
  moveBloque(fromIndex, toIndex),    // usado por DnD
  setPortada(data),
}

// wsStore.js
{
  status: "disconnected" | "connecting" | "connected" | "error",
  socket: WebSocket | null,
  connect(url),
  disconnect(),
  send(event, payload),
}
```

---

## 6. Flujo de Datos: Edición → WS → Preview

```
Usuario edita bloque (DialogCasoUso)
        │
        ▼
documentStore.updateBloque(id, args)   ← Zustand actualiza estado local
        │
        ├──► PreviewPanel re-renderiza  ← React reactividad, ~0 ms
        │
        └──► wsStore.send("actualizar_bloque", { id, args })
                │
                ▼
        servidor_ws.py (FastAPI)
                │
                ▼  broadcast
        Otros clientes conectados
                │
                ▼
        documentStore.updateBloque(id, args)  ← mismo store, mismo flujo
```

---

## 7. Integración con el Backend Python Existente

| Acción en UI | Endpoint | Payload |
|---|---|---|
| Abrir editor | `GET /estado` | — devuelve `elementos_documento` actual |
| Guardar bloque | `WS → actualizar_bloque` | `{ id, metodo, args }` |
| Agregar bloque | `WS → agregar_bloque` | `{ metodo, args }` |
| Mover bloque | `WS → mover_bloque` | `{ id, nueva_posicion }` |
| Eliminar bloque | `WS → eliminar_bloque` | `{ id }` |
| Preview HTML live | `GET /preview-html` | Renderizado por `serializer.js` (local, sin llamada) |
| Preview PDF final | `POST /preview-pdf` | `{ portada, elementos }` → devuelve PDF |
| Exportar `.docx` | `POST /compilar` | `{ portada, elementos }` → devuelve `.docx` |

La previsualización HTML live **no hace llamadas al servidor**: `serializer.js` convierte `documentStore.elementos` a HTML directamente en el cliente. Cero latencia.

---

## 8. Alternativas Descartadas y Por Qué

| Alternativa | Razón de descarte |
|---|---|
| **Vue 3 + Vuetify** | Vuetify impone Material Design con opinión visual fuerte. Los componentes no son "tuyos". |
| **Angular** | Overhead de boilerplate desproporcionado para una SPA de este tamaño. |
| **Svelte / SvelteKit** | Excelente opción técnica, pero el ecosistema de componentes accesibles es menor. shadcn/ui no existe para Svelte. |
| **Material UI (MUI)** | Mismo problema que Vuetify: la UI "se ve a Google". Difícil de deshacer visualmente. |
| **Ant Design** | Orientado a enterprise dashboards con estética corporativa china. Peso del bundle: ~2.5 MB. |
| **Redux Toolkit** | Excesivo para este estado. Zustand hace lo mismo en 1/10 del código. |
| **react-pdf (iFrame)** | Requiere servidor. Se propone como opción "preview final" (Estrategia B), no como vista principal. |

---

*Arquitectura diseñada sobre la base del código fuente de `informe.py` y la arquitectura WebSocket documentada en `arquitectura.md`.*
