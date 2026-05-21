# Sistema de Previsualización de Informe Word
### Análisis Técnico — Stack, Estrategias y Decisión

> **Contexto fijo:** El sistema existente (`informe.py`) usa `python-docx` + Tkinter.  
> El motor gráfico actual (`ejecutar_motor_grafico`) renderiza bloques sobre un `tk.Canvas`  
> con posicionamiento manual: no refleja fuentes reales, márgenes exactos ni saltos de página  
> reales. La pregunta central es cómo reemplazar o complementar ese canvas con una  
> previsualización **fiel a la rúbrica**.

---

## 1. Las Dos Estrategias Principales

### Estrategia A — Renderizar en HTML/CSS y exportar a `.docx` al final

El documento se modela como un árbol de bloques en Python (igual que hoy).  
Un endpoint FastAPI serializa ese árbol a HTML/CSS replicando la rúbrica (márgenes  
2.5 cm, Arial 12, interlineado 1.5, numeración capítulo.correlativo).  
El usuario ve el HTML en el navegador y, cuando confirma, el servidor llama a  
`GeneradorInforme` para producir el `.docx` real.

```
[elementos_documento]
       │
       ▼  serializar_a_html()
  FastAPI endpoint /preview
       │
       ▼  <iframe> o ventana del navegador
  HTML/CSS (fiel a la rúbrica)
       │
       ▼  confirmar → POST /compilar
  GeneradorInforme.compilar() → informe_final.docx
```

### Estrategia B — Generar el `.docx` en memoria y mostrarlo en el navegador

Se genera el `.docx` en memoria con `python-docx` (sin guardarlo en disco),  
se convierte a HTML usando `mammoth` o a PDF usando LibreOffice headless,  
y ese resultado se sirve al navegador como previsualización.

```
[elementos_documento]
       │
       ▼  GeneradorInforme → doc en BytesIO
  FastAPI endpoint /preview
       │
       ├─── mammoth → HTML (aproximado)
       └─── LibreOffice headless → PDF (fiel)
               │
               ▼
        <embed type="application/pdf"> en el navegador
```

---

## 2. Stack Tecnológico Detallado por Estrategia

### Estrategia A — HTML/CSS live + python-docx al final

| Capa | Tecnología | Rol |
|---|---|---|
| Backend | `FastAPI` + `uvicorn` | Sirve `/preview` (HTML) y `/compilar` (docx) |
| Serialización | Función Python propia `serializar_a_html()` | Traduce `elementos_documento` a HTML+CSS |
| CSS de rúbrica | CSS custom con `@page`, `font-family: Arial`, `line-height: 1.5` | Replica márgenes, fuente e interlineado |
| Frontend | HTML plano en `<iframe>` o pestaña del navegador | Muestra la previsualización |
| Generación final | `python-docx` existente (`GeneradorInforme`) | Produce el `.docx` real sin cambios |
| Integración Tkinter | `webbrowser.open("http://localhost:8000/preview")` | Abre la preview desde el botón actual |

**Dependencias nuevas:**
```bash
pip install fastapi uvicorn
# python-docx ya está instalado
```

**CSS mínimo de rúbrica:**
```css
@page {
  size: 21.59cm 27.94cm;
  margin: 2.5cm;
}
body {
  font-family: Arial, sans-serif;
  font-size: 12pt;
  line-height: 1.5;
  text-align: justify;
  max-width: 16.59cm; /* 21.59 - 2*2.5 */
  margin: 0 auto;
  padding: 2.5cm;
}
h1 { font-size: 12pt; font-weight: bold; text-transform: uppercase; page-break-before: always; }
h2 { font-size: 12pt; font-weight: bold; margin-left: 1.25cm; }
.leyenda { font-size: 9pt; line-height: 1.0; text-align: center; }
.numero-pagina { position: fixed; bottom: 1.5cm; right: 2.5cm; font-size: 12pt; }
```

---

### Estrategia B — Generar `.docx` real y convertir para preview

| Capa | Tecnología | Rol |
|---|---|---|
| Backend | `FastAPI` + `uvicorn` | Endpoint `/preview` genera y convierte |
| Generación | `python-docx` + `GeneradorInforme` | Crea el `.docx` en `BytesIO` |
| Conversión HTML | `mammoth` | `.docx` → HTML (pérdida de estilos personalizados) |
| Conversión PDF | `LibreOffice headless` (`soffice --headless --convert-to pdf`) | `.docx` → PDF fiel |
| Visualización PDF | `<embed>` o `<iframe>` con PDF.js | Renderiza el PDF en el navegador |
| Integración Tkinter | `webbrowser.open(...)` | Igual que Estrategia A |

**Dependencias nuevas:**
```bash
pip install fastapi uvicorn mammoth
# LibreOffice debe estar instalado en el sistema
sudo apt install libreoffice  # Linux
```

**Endpoint de ejemplo (sub-estrategia PDF):**
```python
from fastapi import FastAPI
from fastapi.responses import FileResponse
import subprocess, tempfile, os
from informe import GeneradorInforme  # sin cambios

app = FastAPI()

@app.post("/preview-pdf")
def preview_pdf(payload: dict):
    gen = GeneradorInforme(payload["titulo"], payload["grupo"])
    # ... reconstruir documento desde payload["elementos"] ...
    with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as f:
        gen.compilar_en(f.name)
    subprocess.run([
        "soffice", "--headless", "--convert-to", "pdf",
        "--outdir", "/tmp", f.name
    ])
    pdf_path = f.name.replace(".docx", ".pdf")
    return FileResponse(pdf_path, media_type="application/pdf")
```

---

## 3. Tabla de Pros y Contras

### Estrategia A — HTML/CSS live

| | Detalle |
|---|---|
| ✅ **Sin dependencias pesadas** | Solo FastAPI. Sin LibreOffice, sin conversores. |
| ✅ **Instantáneo** | La preview se actualiza en tiempo real al editar cada bloque. |
| ✅ **Compatible con WebSocket** | El servidor WS ya planificado puede enviar los cambios al HTML al mismo tiempo que los broadcast a otros clientes. |
| ✅ **Control total del CSS** | La rúbrica se implementa exactamente: márgenes, fuente, interlineado, numeración. |
| ✅ **No rompe nada** | `GeneradorInforme` se llama solo al compilar, sin ningún cambio. |
| ⚠️ **Paridad no perfecta** | El HTML no replicará al 100% el salto de página real de Word ni la paginación romana/arábiga en el TOC. |
| ⚠️ **Trabajo de mapeo** | Hay que escribir `serializar_a_html()` para cada tipo de bloque: `capitulo`, `subtitulo`, `tabla_simple`, `caso_uso`, `matriz_ur_esa`, `figura`. |
| ❌ **No es el `.docx` real** | El usuario ve una aproximación fiel, no el archivo final. Puede haber diferencias menores en tablas complejas o figuras. |

---

### Estrategia B — `.docx` real → PDF (sub-estrategia recomendada de B)

| | Detalle |
|---|---|
| ✅ **Fidelidad absoluta** | El PDF viene del mismo `.docx` que se entregará. Lo que se ve es exactamente lo que se exporta. |
| ✅ **Cero trabajo de mapeo** | No hay que serializar a HTML. El `GeneradorInforme` ya produce el documento. |
| ✅ **TOC, paginación romana, estilos LeyendaFigura** | Todos se reflejan correctamente porque Word los generó. |
| ⚠️ **Requiere LibreOffice** | Instalación de ~300 MB en el sistema. En Windows puede ser más complejo de automatizar. |
| ⚠️ **Latencia en la preview** | Cada refresh reconstruye y convierte el `.docx`. En documentos largos: 3–8 segundos. No es tiempo real. |
| ⚠️ **No integra bien con WS en tiempo real** | La conversión es costosa; no se puede llamar en cada keystroke. Sirve como "preview bajo demanda". |
| ❌ **Depende de LibreOffice headless** | En entornos de escritorio universitarios puede no estar disponible o tener permisos restringidos. |

---

### Sub-estrategia B2 — `.docx` → HTML con `mammoth` (alternativa ligera a LibreOffice)

| | Detalle |
|---|---|
| ✅ **Sin LibreOffice** | Solo `pip install mammoth`. |
| ⚠️ **Pérdida de estilos críticos** | `mammoth` ignora los estilos personalizados (`LeyendaFigura`, `LeyendaTabla`, `TOC 1`). El HTML resultante es genérico. |
| ❌ **No recomendada para este caso** | La rúbrica depende exactamente de esos estilos. La preview sería más pobre que la actual del Canvas. |

---

## 4. Decisión Recomendada

### Para previsualización en tiempo real (mientras se edita): **Estrategia A**

Es la extensión natural del sistema WebSocket ya diseñado. El servidor puede emitir el HTML actualizado en el mismo broadcast que sincroniza los bloques entre clientes. Sin dependencias extra. La fidelidad visual es suficiente para que el usuario vea estructura, jerarquía, numeración y proporciones.

### Para previsualización final antes de exportar: **Estrategia B (PDF via LibreOffice)**

Un botón "Vista previa final" genera el `.docx` en `BytesIO`, lo convierte a PDF con LibreOffice headless y lo muestra en una ventana del navegador. El usuario confirma que todo está correcto y luego exporta. Esta llamada es costosa pero ocurre una sola vez por sesión.

### Integración de ambas en la arquitectura actual

```
Tkinter GUI (informe.py)
    │
    ├── Tab "Constructor" → editar bloques
    │       │
    │       └── POST /actualizar_bloque  ──► servidor_ws.py
    │                                            │ broadcast WS
    │                                            ▼
    │                                    cliente_ws.py → actualiza estado
    │
    ├── Tab "Preview" (reemplaza Canvas) 
    │       │
    │       └── webbrowser.open("http://localhost:8000/preview-html")
    │               └── Estrategia A: HTML/CSS live, actualización en ~100 ms
    │
    └── Botón "Vista previa final"
            │
            └── webbrowser.open("http://localhost:8000/preview-pdf")
                    └── Estrategia B: PDF real via LibreOffice, ~5 s, solo bajo demanda
```

---

## 5. Lo que NO cambia en `informe.py`

- `GeneradorInforme` completo: ningún método se modifica.
- `configurar_formato_rubrica()`: los estilos siguen siendo la fuente de verdad.
- `compilar()`: sigue siendo el método que produce el `.docx` final.
- La lista `elementos_documento`: es el estado que se serializa para la preview HTML.

El único cambio en `informe.py` es en el método `_al_cambiar_pestana`:  
en lugar de llamar a `ejecutar_motor_grafico()` (Canvas), llama a  
`webbrowser.open("http://localhost:8000/preview-html")`.

---

*Análisis elaborado sobre la base del código fuente de `informe.py`, `servidor_ws.py`, `cliente_ws.py` y `arquitectura.md` del proyecto.*
