import json
import sys
import traceback
import io
import os
import uuid
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Body, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from estado_compartido import (
    obtener_estado,
    establecer_estado,
    agregar_cliente,
    remover_cliente,
    obtener_clientes,
    contar_clientes,
)
from informe import GeneradorInforme

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASEDIR = os.path.dirname(__file__)
UPLOADS_DIR = os.path.join(BASEDIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

DIST_PATH = os.path.join(BASEDIR, "frontend", "dist")
if os.path.exists(DIST_PATH):
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST_PATH, "assets")), name="assets")

    @app.get("/")
    async def root():
        with open(os.path.join(DIST_PATH, "index.html"), "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())

if os.path.exists(UPLOADS_DIR):
    app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")


@app.get("/status")
async def status():
    return {"status": "ok", "clientes_conectados": contar_clientes()}


EXTENSIONES_PERMITIDAS = {".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp", ".svg"}
TAMANO_MAXIMO_MB = 10


@app.post("/upload")
async def upload_imagen(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename or "img.png")[1].lower()

    if ext not in EXTENSIONES_PERMITIDAS:
        raise HTTPException(
            status_code=400,
            detail=f"Extension no permitida: {ext}. Solo imagenes: {', '.join(sorted(EXTENSIONES_PERMITIDAS))}",
        )

    contenido = await file.read()

    if len(contenido) > TAMANO_MAXIMO_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"Imagen demasiado grande. Maximo {TAMANO_MAXIMO_MB} MB.",
        )

    firma = contenido[:12]
    firmas_validas = (
        b"\x89PNG",
        b"\xff\xd8\xff",
        b"GIF8",
        b"BM",
        b"RIFF",
        b"<?xml",
        b"<svg",
    )
    if not any(firma.startswith(f) for f in firmas_validas):
        raise HTTPException(
            status_code=400,
            detail="El archivo no es una imagen valida (cabecera no reconocida).",
        )

    nombre = f"{uuid.uuid4().hex}{ext}"
    ruta = os.path.join(UPLOADS_DIR, nombre)
    with open(ruta, "wb") as f:
        f.write(contenido)
    filename = f"uploads/{nombre}"
    print(f"[SERVIDOR] Imagen subida: {filename} ({len(contenido)} bytes)", flush=True)
    return {"filename": filename}


@app.get("/preview-html")
async def preview_html():
    import os
    preview_path = os.path.join(os.path.dirname(__file__), "preview.html")
    with open(preview_path, "r", encoding="utf-8") as f:
        html_content = f.read()
    return HTMLResponse(content=html_content)


@app.post("/compilar")
async def compilar(payload: dict = Body(...)):
    print(f"[SERVIDOR] Compilando documento...", flush=True)
    try:
        titulo = payload.get("titulo", "PROYECTO")
        grupo = payload.get("grupo", "1")
        logo = payload.get("logo", "logo_unab")
        facultad = payload.get("facultad", "")
        curso = payload.get("curso", "")
        autores = payload.get("autores", [])
        profesor = payload.get("profesor", "")
        ciudad = payload.get("ciudad", "")
        anio = payload.get("anio", "2026")
        elementos = payload.get("elementos", [])

        gen = GeneradorInforme(titulo, grupo)
        gen.generar_portada(logo, facultad, curso, autores, profesor, ciudad, anio)
        gen.estructurar_indices()

        cap_num = 0
        sub_num = 0
        tab_num = 0
        fig_num = 0

        for bloque in elementos:
            m = bloque.get("metodo", "")
            args = dict(bloque.get("args", {}))

            if m == "capitulo":
                cap_num += 1
                sub_num = tab_num = fig_num = 0
                args["titulo"] = f"{cap_num}. {args.get('titulo','')}"
                gen.agregar_capitulo(**args)
            elif m == "subtitulo":
                sub_num += 1
                args["subtitulo"] = f"{cap_num}.{sub_num} {args.get('subtitulo','')}"
                gen.agregar_subtitulo(**args)
            elif m == "texto":
                gen.agregar_texto_libre(**args)
            elif m == "definicion":
                gen.agregar_definicion(**args)
            elif m == "figura":
                fig_num += 1
                args["correlativo"] = f"{cap_num}.{fig_num}"
                gen.agregar_figura(**args)
            elif m == "tabla_simple":
                tab_num += 1
                args["correlativo"] = f"{cap_num}.{tab_num}"
                gen.agregar_tabla(**args)
            elif m == "caso_uso":
                tab_num += 1
                args["correlativo"] = f"{cap_num}.{tab_num}"
                gen.agregar_caso_uso_extendido(**args)
            elif m == "matriz_ur_esa":
                tab_num += 1
                args["correlativo"] = f"{cap_num}.{tab_num}"
                gen.agregar_matriz_ur_esa(**args)
            elif m == "apa":
                gen.agregar_bibliografia_apa(**args)

        buf = io.BytesIO()
        gen.doc.save(buf)
        buf.seek(0)

        filename = f"Grupo {grupo} - Documento_Final.docx"
        print(f"[SERVIDOR] Documento '{filename}' compilado ({buf.getbuffer().nbytes} bytes)", flush=True)

        from urllib.parse import quote
        safe_filename = quote(filename, safe="")
        return StreamingResponse(
            buf,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename*=UTF-8''{safe_filename}"},
        )
    except Exception:
        print("[SERVIDOR] ERROR compilando:", flush=True)
        traceback.print_exc()
        return {"error": "Error al compilar el documento"}


@app.websocket("/ws/{documento_id}")
async def websocket_endpoint(websocket: WebSocket, documento_id: str):
    await websocket.accept()
    agregar_cliente(documento_id, websocket)
    print(f"[SERVIDOR] WS aceptado: {documento_id}", flush=True)

    try:
        estado = obtener_estado(documento_id)
        print(f"[SERVIDOR] Enviando estado_completo a '{documento_id}': {len(estado)} elementos", flush=True)
        await websocket.send_json({"tipo": "estado_completo", "elementos": estado})

        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            tipo = data.get("tipo")
            print(f"[SERVIDOR] Recibido '{tipo}' de '{documento_id}'", flush=True)

            elementos = obtener_estado(documento_id)

            if tipo == "sync_estado":
                await websocket.send_json(
                    {"tipo": "estado_completo", "elementos": elementos}
                )

            elif tipo == "agregar_bloque":
                idx = data.get("idx")
                bloque = data["bloque"]
                if idx is not None and 0 <= idx <= len(elementos):
                    elementos.insert(idx, bloque)
                else:
                    elementos.append(bloque)
                    idx = len(elementos) - 1
                establecer_estado(documento_id, elementos)
                print(f"[SERVIDOR] Estado ahora tiene {len(elementos)} elementos", flush=True)

                broadcast = {
                    "tipo": "agregar_bloque",
                    "idx": idx,
                    "bloque": bloque,
                    "titulo_lista": data.get("titulo_lista", ""),
                }
                otros = [c for c in obtener_clientes(documento_id) if c != websocket]
                print(f"[SERVIDOR] Broadcast 'agregar_bloque' a {len(otros)} clientes", flush=True)
                for cliente in otros:
                    await cliente.send_json(broadcast)

            elif tipo == "actualizar_bloque":
                idx = data["idx"]
                bloque = data["bloque"]
                if 0 <= idx < len(elementos):
                    elementos[idx] = bloque
                establecer_estado(documento_id, elementos)
                print(f"[SERVIDOR] Bloque {idx} actualizado. Estado: {len(elementos)} elem", flush=True)

                broadcast = {
                    "tipo": "actualizar_bloque",
                    "idx": idx,
                    "bloque": bloque,
                    "titulo_lista": data.get("titulo_lista", ""),
                }
                otros = [c for c in obtener_clientes(documento_id) if c != websocket]
                print(f"[SERVIDOR] Broadcast 'actualizar_bloque' a {len(otros)} clientes", flush=True)
                for cliente in otros:
                    await cliente.send_json(broadcast)

            elif tipo == "eliminar_bloque":
                idx = data["idx"]
                if 0 <= idx < len(elementos):
                    elementos.pop(idx)
                establecer_estado(documento_id, elementos)
                print(f"[SERVIDOR] Bloque {idx} eliminado. Estado: {len(elementos)} elem", flush=True)

                broadcast = {"tipo": "eliminar_bloque", "idx": idx}
                otros = [c for c in obtener_clientes(documento_id) if c != websocket]
                print(f"[SERVIDOR] Broadcast 'eliminar_bloque' a {len(otros)} clientes", flush=True)
                for cliente in otros:
                    await cliente.send_json(broadcast)

            elif tipo == "mover_bloque":
                idx_origen = data["idx_origen"]
                idx_destino = data["idx_destino"]
                if (
                    0 <= idx_origen < len(elementos)
                    and 0 <= idx_destino < len(elementos)
                ):
                    item = elementos.pop(idx_origen)
                    elementos.insert(idx_destino, item)
                establecer_estado(documento_id, elementos)
                print(f"[SERVIDOR] Bloque movido {idx_origen}->{idx_destino}", flush=True)

                broadcast = {
                    "tipo": "mover_bloque",
                    "idx_origen": idx_origen,
                    "idx_destino": idx_destino,
                }
                otros = [c for c in obtener_clientes(documento_id) if c != websocket]
                print(f"[SERVIDOR] Broadcast 'mover_bloque' a {len(otros)} clientes", flush=True)
                for cliente in otros:
                    await cliente.send_json(broadcast)

    except WebSocketDisconnect:
        print(f"[SERVIDOR] WebSocketDisconnect: {documento_id}", flush=True)
    except Exception:
        print(f"[SERVIDOR] ERROR en '{documento_id}':", flush=True)
        traceback.print_exc()
    finally:
        remover_cliente(documento_id, websocket)
