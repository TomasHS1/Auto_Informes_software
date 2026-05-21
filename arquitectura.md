# Comparativa Técnica: Colaboración en Tiempo Real para Generación de Informes Universitarios

> **Contexto del análisis:** El sistema existente (`informe.py`) es una app de escritorio en Python/Tkinter que genera documentos `.docx` respetando la rúbrica del curso (márgenes, fuentes, interlineado, estilos APA, matrices ESA, etc.). El desafío es extenderla para que **múltiples integrantes del grupo editen simultáneamente**.

---

## 1. Descripción de las Opciones

### Opción A — Google Docs API + Drive como backend

Se reemplaza (o complementa) el editor Tkinter con una interfaz web o script que usa la **Google Docs API v1** y la **Google Drive API v3** para crear, leer y editar el documento directamente en la nube. El archivo vive en Drive; Google gestiona la sincronización.

**Stack mínimo:**
```
google-auth · google-api-python-client · requests
```

**Flujo de trabajo:**
```
Usuario A (Tkinter/Web) ──► Google Docs API ──► Documento en Drive
Usuario B (Tkinter/Web) ──────────────────────────────►┘  (sync automático)
```

---

### Opción B — App propia con sincronización en tiempo real

Se construye un servidor backend que mantiene el estado del documento en memoria/BD y lo propaga a todos los clientes conectados mediante **WebSockets** o estructuras de datos **CRDT** (Conflict-free Replicated Data Types).

**Sub-opciones:**

| Sub-opción | Tecnología | Caso de uso ideal |
|---|---|---|
| B1 — WebSockets simples | `websockets` + `FastAPI` | Pocos usuarios, red LAN confiable |
| B2 — CRDTs (Yjs/Automerge) | `y-py` / `pycrdt` + servidor | Alta concurrencia, red inestable |

**Flujo de trabajo (WebSockets):**
```
Cliente A ──► WebSocket Server ──► broadcast ──► Cliente B
              (estado central)                    Cliente C
```

**Flujo de trabajo (CRDTs):**
```
Cliente A (replica local) ──► merge ──► Servidor (CRDT store)
Cliente B (replica local) ◄── sync ─────────────────────────►
```

---

## 2. Comparativa Técnica Detallada

### 2.1 Complejidad de Implementación

| Criterio | Opción A (Google Docs API) | Opción B1 (WebSockets) | Opción B2 (CRDTs) |
|---|---|---|---|
| **Líneas de código extra** | ~150–300 | ~400–700 | ~800–1500 |
| **Dependencias nuevas** | 3 paquetes Google | `fastapi`, `websockets`, `uvicorn` | + `y-py` o `automerge-py` |
| **Curva de aprendizaje** | Baja (API REST documentada) | Media (async Python) | Alta (teoría de CRDTs) |
| **Tiempo de setup inicial** | 1–2 días | 3–5 días | 1–3 semanas |
| **Infra necesaria** | Ninguna (Google la provee) | Servidor local o VPS | Servidor local o VPS |

---

### 2.2 Sincronización y Consistencia

| Criterio | Opción A | Opción B1 (WS) | Opción B2 (CRDT) |
|---|---|---|---|
| **Latencia de sync** | 1–3 s (polling/push de Google) | < 100 ms | < 100 ms |
| **Resolución de conflictos** | Automática (Google la resuelve) | Manual (last-write-wins) | Automática (garantía matemática) |
| **Offline support** | Parcial (Google Drive offline) | ❌ No | ✅ Sí (merge al reconectar) |
| **Consistencia garantizada** | ✅ Sí | ⚠️ Depende del diseño | ✅ Sí (convergencia eventual) |

---

### 2.3 Compatibilidad con `informe.py` existente

El código actual produce `.docx` mediante `python-docx` con estilos hardcodeados según la rúbrica. Aquí el punto es crítico:

| Aspecto | Opción A | Opción B |
|---|---|---|
| **Mantener generación `.docx`** | ⚠️ Parcial — Google Docs tiene su propio formato; exportar a `.docx` puede perder estilos precisos (márgenes exactos, estilos LeyendaFigura, paginación romana/arábiga) | ✅ Total — el backend sigue llamando a `GeneradorInforme` sin cambios |
| **Reutilizar la clase `GeneradorInforme`** | ❌ Se reemplaza por la API | ✅ Se conserva íntegra |
| **Fidelidad a la rúbrica** (márgenes 2.5cm, Arial 12, interlineado 1.5, numeración capítulo.correlativo) | ⚠️ Riesgo de pérdida en exportación | ✅ Garantizada |
| **Matrices UR ESA, casos de uso extendidos** | ⚠️ Requiere re-implementar en formato Google | ✅ Ya implementados en `informe.py` |

---

### 2.4 Seguridad y Privacidad

| Aspecto | Opción A | Opción B |
|---|---|---|
| **Datos en la nube** | ✅/⚠️ Google Drive (GDPR, privacidad datos del proyecto) | ✅ Todo local/privado |
| **Autenticación** | OAuth 2.0 (requiere cuenta Google de cada integrante) | Cualquier esquema (JWT, sesión simple) |
| **Riesgo de exposición** | Si el Drive no está bien configurado, el doc queda público | Controlado por el equipo |

---

### 2.5 Escalabilidad y Mantenimiento

| Aspecto | Opción A | Opción B1 | Opción B2 |
|---|---|---|---|
| **Límites de usuarios simultáneos** | Sin límite práctico | ~10–20 con servidor básico | ~50–100+ |
| **Rate limits API** | 300 req/min (quota gratuita) | Sin límite propio | Sin límite propio |
| **Mantenimiento a largo plazo** | Bajo (Google actualiza) | Medio | Alto |
| **Portabilidad** | Depende de Google | ✅ Portable | ✅ Portable |

---

## 3. Pros y Contras Resumidos

### ✅ Opción A — Google Docs API

**Pros:**
- Implementación más rápida: la infraestructura de colaboración ya existe.
- Sin servidor propio que mantener.
- Los integrantes ya conocen Google Docs (UX familiar).
- Historial de versiones gratuito y automático.
- Control de acceso por correo, sin código extra.

**Contras:**
- La clase `GeneradorInforme` queda obsoleta o requiere reescribirse para usar la API.
- La exportación `.docx` desde Google Docs **no garantiza** los estilos exactos exigidos por la rúbrica (márgenes, fuentes, paginación).
- Requiere conexión a internet constante (y cuentas Google).
- El campo `TOC` automático, la numeración romana/arábiga y los estilos `LeyendaFigura`/`LeyendaTabla` son difíciles de replicar vía API.
- Quota de API puede ser restrictiva durante generación masiva.

---

### ✅ Opción B1 — WebSockets + FastAPI

**Pros:**
- Preserva completamente `informe.py` y toda su lógica de formato.
- Latencia muy baja (< 100 ms).
- Sin dependencia de servicios externos.
- Implementación razonablemente simple para un equipo de estudiantes.

**Contras:**
- Requiere levantar un servidor (puede ser en la misma red local del grupo).
- Resolución de conflictos manual: si dos personas editan el mismo bloque simultáneamente, hay que decidir qué prevalece.
- Sin soporte offline.

---

### ✅ Opción B2 — CRDTs (Yjs/Automerge)

**Pros:**
- Resolución de conflictos matemáticamente garantizada (nunca se pierde trabajo).
- Funciona offline y sincroniza al reconectar.
- La experiencia de usuario es la más fluida.

**Contras:**
- Curva de aprendizaje alta: requiere entender CRDTs, operaciones conmutativas, etc.
- Las bibliotecas Python para CRDTs (`y-py`, `pycrdt`) son menos maduras que las de JavaScript.
- Tiempo de implementación desproporcionado para un proyecto semestral.

---

## 4. Recomendación para un Proyecto Universitario con Recursos Limitados

### 🏆 Recomendación Principal: **Opción B1 — WebSockets + FastAPI (servidor local)**

**Justificación técnica:**

1. **Preservación de la inversión existente:** La clase `GeneradorInforme` ya tiene implementado todo lo que exige la rúbrica: márgenes, estilos, paginación, matrices ESA, casos de uso extendidos. Descartarla en favor de Google Docs API implicaría reescribir toda esa lógica en un formato diferente, con riesgo real de perder la fidelidad al formato.

2. **Complejidad acotada y alcanzable:** Un servidor WebSocket con FastAPI puede implementarse en ~400 líneas de Python. Un estudiante con conocimiento básico de async puede hacerlo en una semana.

3. **No depende de terceros:** No hay que gestionar OAuth, cuotas de API, ni privacidad de datos en la nube.

4. **Arquitectura sugerida:**

```
informe.py (Tkinter GUI, sin cambios) 
      │
      ▼
estado_compartido.py (diccionario de bloques en memoria)
      │
      ▼
servidor_ws.py (FastAPI + WebSocket)
      │
      ▼   broadcast a todos los clientes
      ▼
cliente_ws.py (parche sobre AppGeneradorGUI)
```

5. **Alcance mínimo viable para el proyecto:** El servidor solo necesita tres operaciones: `sync_estado` (al conectar), `actualizar_bloque` (al editar) y `agregar_bloque` (al añadir). No se necesita persistencia sofisticada si el grupo trabaja en sesiones coordinadas.

---

### Cuándo preferir Opción A (Google Docs API)

Considera la Opción A **solo si**:
- El grupo decide abandonar el generador `.docx` y trabajar directamente en Google Docs (editando el documento final de forma manual, sin generación automática).
- La fidelidad exacta al formato de la rúbrica no es prioritaria o se verifica manualmente antes de la entrega.
- El grupo quiere la solución más rápida posible y acepta ese trade-off.

---

## 5. Hoja de Ruta de Implementación (Opción B1)

```
Semana 1: Instalar FastAPI + websockets. Implementar servidor con estado en dict.
Semana 2: Modificar AppGeneradorGUI para conectarse al WebSocket al iniciar.
Semana 3: Broadcast de cambios (add_bloque, move_bloque, delete_bloque).
Semana 4: Testing con 2–3 clientes simultáneos. Ajustes de race conditions.
```

**Costo en dependencias:**
```bash
pip install fastapi uvicorn websockets
```

**Sin costo monetario. Sin cuentas externas. Sin servidor en la nube (basta una PC del grupo en la red local).**

---

## 6. Tabla Resumen Final

| Criterio | Google Docs API | WebSockets (B1) | CRDTs (B2) |
|---|:---:|:---:|:---:|
| Preserva `informe.py` | ❌ | ✅ | ✅ |
| Fidelidad a la rúbrica | ⚠️ | ✅ | ✅ |
| Tiempo de implementación | Bajo | Medio | Alto |
| Infra externa requerida | Google | Ninguna | Ninguna |
| Resolución de conflictos | Automática | Manual | Automática |
| Recomendado para este caso | ⚠️ Solo si se abandona el `.docx` automático | ✅ **Recomendado** | ❌ Excesivo para el contexto |

---

*Análisis elaborado considerando la arquitectura actual de `informe.py` (Tkinter + python-docx) y los requisitos formales de la Rúbrica de Proyecto de Ingeniería de Software 2026.*
