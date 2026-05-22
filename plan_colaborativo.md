# Plan de Implementación: Modo Colaborativo — Auto Informes Software

> **Contexto:** El proyecto ya tiene implementado el servidor WebSocket (`servidor_ws.py` + FastAPI), el cliente WS (`wsClient.js`), y el store reactivo (`documentStore.js`). La infraestructura de colaboración **ya existe**. Este plan cubre lo que falta para que sea usable desde internet, usando tu PC local como servidor mientras esté prendida.

---

## Estado actual del proyecto

El sistema ya tiene:

- `servidor_ws.py` — servidor FastAPI con WebSocket, maneja `agregar_bloque`, `actualizar_bloque`, `eliminar_bloque`, `mover_bloque`
- `estado_compartido.py` — estado en memoria (se pierde al cerrar el servidor)
- `wsClient.js` + `wsStore.js` — cliente WebSocket en el frontend React con reconexión automática
- `documentStore.js` — store Zustand que ya envía cambios por WS cuando está conectado
- Frontend React/Vite listo para producción (`npm run build`)

Lo que **no existe aún** y es necesario para colaboración real desde internet:

1. Persistencia del documento (el estado se pierde si el servidor se reinicia)
2. Exposición pública de tu PC local (los demás no pueden conectarse desde fuera de tu red)
3. El frontend buildeado servido por el mismo servidor Python (para no necesitar dos procesos)
4. Un script de arranque simple (`iniciar.bat` / `iniciar.sh`)

---

## Arquitectura objetivo

```
Internet
    │
    ▼
[Ngrok / Cloudflare Tunnel]   ← túnel gratuito, sin abrir puertos del router
    │
    ▼
Tu PC Local  ──  uvicorn servidor_ws.py  (puerto 8000)
                        │
                        ├── /ws/{doc_id}     ← WebSocket colaborativo
                        ├── /compilar        ← genera el .docx
                        ├── /status          ← health check
                        └── /               ← sirve el frontend buildeado
                                │
                        frontend/dist/       ← React buildeado con npm run build
```

Cada colaborador abre el navegador en la URL pública del túnel. Tú arrancas el servidor, compartes la URL, y todos editan en tiempo real.

---

## Fase 1 — Persistencia del estado (1–2 horas)

**Problema:** Si el servidor se reinicia (o se cae la luz), el documento desaparece porque el estado vive en un `defaultdict` en memoria.

**Solución:** Guardar el estado en un archivo JSON local cada vez que cambia.

### Cambios en `estado_compartido.py`

Reemplazar el módulo actual con esta versión:

```python
# estado_compartido.py  (versión con persistencia JSON)
import json
import os
from collections import defaultdict

ARCHIVO_ESTADO = "estado_documentos.json"

def _cargar():
    if os.path.exists(ARCHIVO_ESTADO):
        try:
            with open(ARCHIVO_ESTADO, "r", encoding="utf-8") as f:
                return defaultdict(list, json.load(f))
        except Exception:
            pass
    return defaultdict(list)

def _guardar(estado):
    with open(ARCHIVO_ESTADO, "w", encoding="utf-8") as f:
        json.dump(dict(estado), f, ensure_ascii=False, indent=2)

_estado = _cargar()
_clientes = defaultdict(set)


def obtener_estado(documento_id: str) -> list:
    return _estado[documento_id]


def establecer_estado(documento_id: str, elementos: list) -> None:
    _estado[documento_id] = elementos
    _guardar(_estado)          # ← única línea nueva respecto al original


def agregar_cliente(documento_id: str, websocket) -> None:
    _clientes[documento_id].add(websocket)
    print(f"[SERVIDOR] Cliente conectado a '{documento_id}' "
          f"(total: {len(_clientes[documento_id])})", flush=True)


def remover_cliente(documento_id: str, websocket) -> None:
    _clientes[documento_id].discard(websocket)
    print(f"[SERVIDOR] Cliente desconectado de '{documento_id}' "
          f"(total: {len(_clientes[documento_id])})", flush=True)
    if not _clientes[documento_id]:
        del _clientes[documento_id]


def obtener_clientes(documento_id: str) -> set:
    return _clientes.get(documento_id, set())


def contar_clientes() -> int:
    return sum(len(c) for c in _clientes.values())
```

**Resultado:** el archivo `estado_documentos.json` se actualiza en cada cambio. Si el servidor se reinicia, recupera el último estado automáticamente.

---

## Fase 2 — Servir el frontend desde el servidor Python (30 min)

**Objetivo:** que el mismo proceso de Python sirva el frontend buildeado, para que los colaboradores solo necesiten la URL del servidor (sin Vite corriendo).

### Paso 1: Buildear el frontend

```bash
cd frontend
npm install
npm run build
# Genera frontend/dist/
```

### Paso 2: Agregar serving estático en `servidor_ws.py`

Al principio del archivo, después de los imports existentes:

```python
from fastapi.staticfiles import StaticFiles
import os

# Montar el frontend buildeado (agregar ANTES de las rutas existentes)
DIST_PATH = os.path.join(os.path.dirname(__file__), "frontend", "dist")
if os.path.exists(DIST_PATH):
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST_PATH, "assets")), name="assets")

    @app.get("/", response_class=HTMLResponse)
    async def root():
        with open(os.path.join(DIST_PATH, "index.html"), "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
```

### Paso 3: Configurar la URL del WebSocket en el frontend

En el frontend, la URL del WS debe apuntar al servidor. Crear un archivo `.env.production` en `frontend/`:

```
VITE_WS_URL=wss://TU-URL-NGROK.ngrok-free.app/ws/grupo1
VITE_API_URL=https://TU-URL-NGROK.ngrok-free.app
```

Y en `wsStore.js` o donde se construya la URL del WS, leer la variable:

```javascript
const WS_URL = import.meta.env.VITE_WS_URL || `ws://${window.location.host}/ws/grupo1`;
```

Esto hace que en desarrollo apunte a `localhost` y en producción use la URL pública.

---

## Fase 3 — Exposición pública con túnel (30 min, solo una vez)

**Problema:** Tu PC está detrás del router de tu casa. Los demás no pueden conectarse a `localhost:8000`.

**Solución recomendada: Ngrok** (gratuito, no requiere configurar el router).

### Instalación de Ngrok

1. Ir a [ngrok.com](https://ngrok.com) → crear cuenta gratuita
2. Descargar el ejecutable para Windows/Mac/Linux
3. Autenticarse una sola vez:
   ```bash
   ngrok config add-authtoken TU_TOKEN_AQUI
   ```

### Uso diario

Cada vez que quieras trabajar en modo colaborativo:

**Terminal 1 — servidor Python:**
```bash
cd Auto_Informes_software
uvicorn servidor_ws:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 — túnel público:**
```bash
ngrok http 8000
```

Ngrok mostrará algo como:
```
Forwarding   https://a1b2c3d4.ngrok-free.app -> http://localhost:8000
```

Esa URL `https://a1b2c3d4.ngrok-free.app` es la que compartes con tu grupo. Todos abren esa URL en el navegador y editan en tiempo real.

**Limitaciones del plan gratuito de Ngrok:**
- La URL cambia cada vez que reinicias Ngrok (puedes anotarla en un chat del grupo)
- 1 agente simultáneo (suficiente para este caso)
- Sin límite de conexiones WebSocket para este uso

**Alternativa sin cuenta: Cloudflare Tunnel**
```bash
# Sin instalar nada, con npx:
npx cloudflared tunnel --url http://localhost:8000
```
Te da una URL `*.trycloudflare.com` que también cambia por sesión.

---

## Fase 4 — Script de arranque (20 min)

Para no tener que recordar los comandos cada vez.

### `iniciar.bat` (Windows)

```bat
@echo off
echo === Arrancando Auto Informes Colaborativo ===
cd /d %~dp0

:: Verificar que el frontend esté buildeado
if not exist "frontend\dist\index.html" (
    echo Buildeando frontend por primera vez...
    cd frontend
    call npm install
    call npm run build
    cd ..
)

:: Iniciar servidor en background
start "Servidor Auto Informes" cmd /k "uvicorn servidor_ws:app --host 0.0.0.0 --port 8000"

:: Esperar 2 segundos y abrir el túnel
timeout /t 2 /nobreak >nul
echo.
echo Iniciando tunel publico...
echo Copia la URL que aparece (https://xxxx.ngrok-free.app) y compartela con tu grupo.
echo.
ngrok http 8000
```

### `iniciar.sh` (Mac/Linux)

```bash
#!/bin/bash
echo "=== Arrancando Auto Informes Colaborativo ==="
cd "$(dirname "$0")"

# Buildear frontend si no existe
if [ ! -f "frontend/dist/index.html" ]; then
    echo "Buildeando frontend por primera vez..."
    cd frontend && npm install && npm run build && cd ..
fi

# Iniciar servidor en background
uvicorn servidor_ws:app --host 0.0.0.0 --port 8000 &
SERVER_PID=$!

sleep 2
echo ""
echo "Iniciando túnel público..."
echo "Copia la URL (https://xxxx.ngrok-free.app) y compártela con tu grupo."
echo ""
ngrok http 8000

# Cerrar servidor al salir
kill $SERVER_PID
```

---

## Limitación conocida: conflictos simultáneos

El servidor actual usa **last-write-wins**: si dos personas editan el mismo bloque al mismo tiempo, gana el último mensaje en llegar. Para un grupo de 3–5 personas coordinadas (que es el caso universitario típico), esto es manejable con una mínima coordinación verbal ("yo estoy editando el capítulo 2").

Si quisieran resolución automática de conflictos, se necesitaría implementar CRDTs, lo cual está documentado como Opción B2 en `arquitectura.md` y se considera excesivo para el alcance actual.

---

## Resumen de horas estimadas

| Fase | Tarea | Tiempo estimado |
|---|---|---|
| 1 | Persistencia JSON en `estado_compartido.py` | 1 h |
| 2 | Serving del frontend desde Python + variable de entorno WS_URL | 1 h |
| 3 | Instalar Ngrok y probar el túnel | 30 min |
| 4 | Script `iniciar.bat` / `iniciar.sh` | 20 min |
| — | Testing con 2–3 personas simultáneas | 1 h |
| **Total** | | **~4 horas** |

---

## Checklist de implementación

- [ ] Reemplazar `estado_compartido.py` con la versión con persistencia JSON
- [ ] Agregar `StaticFiles` y ruta `/` en `servidor_ws.py`
- [ ] Crear `frontend/.env.production` con `VITE_WS_URL` y `VITE_API_URL`
- [ ] Modificar la construcción de la URL WS en el frontend para leer `import.meta.env`
- [ ] Ejecutar `npm run build` en `frontend/`
- [ ] Instalar Ngrok y autenticarse
- [ ] Crear `iniciar.bat` o `iniciar.sh`
- [ ] Probar con un segundo dispositivo (celular o PC del grupo)
- [ ] Compartir la URL de Ngrok al grupo por WhatsApp/Discord antes de cada sesión

---

*Plan elaborado sobre la arquitectura existente en `servidor_ws.py`, `estado_compartido.py`, `wsClient.js` y `documentStore.js`. No se modifican las reglas de formato del documento ni la lógica de `GeneradorInforme`.*
