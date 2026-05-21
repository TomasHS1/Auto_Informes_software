import tkinter as tk
import json
import asyncio
import threading
import queue
import sys
import traceback
import websockets
from informe import AppGeneradorGUI

SERVIDOR = "ws://localhost:8000"
DOCUMENTO_ID = "proyecto1"


def _derivar_titulo_lista(bloque):
    m = bloque.get("metodo", "")
    args = bloque.get("args", {})
    if m == "capitulo":
        return f"\U0001f4d8 CAPITULO: {args.get('titulo', '')}"
    elif m == "subtitulo":
        return f"   \u21b3 Subtitulo: {args.get('subtitulo', '')}"
    elif m == "texto":
        texto = args.get("texto", "")
        return f"\U0001f4dd Texto: {texto[:40]}..."
    elif m == "definicion":
        return f"\U0001f464 Actor: {args.get('termino', '')}"
    elif m == "figura":
        return f"\U0001f5bc\ufe0f Figura: {args.get('leyenda', '')}"
    elif m == "tabla_simple":
        return f"\U0001f4ca Tabla: {args.get('leyenda', '')}"
    elif m == "caso_uso":
        return f"\u2699\ufe0f Caso de Uso: {args.get('nombre', '')}"
    elif m == "matriz_ur_esa":
        cats = args.get("categorias", [])
        return f"\U0001f4cb MATRIZ UR ESA ({len(cats)} Categorias)"
    elif m == "apa":
        return "\U0001f4da Bibliografia APA"
    return f"??? {m}"


class ClienteColaborativo:
    def __init__(self, root, app, servidor, documento_id):
        self.root = root
        self.app = app
        self.servidor = servidor
        self.documento_id = documento_id
        self.ws = None
        self.conectado = False
        self.cola_ui = queue.Queue()
        self._loop = None

        print("[CLIENTE] Iniciando ClienteColaborativo...", flush=True)
        self._instalar_indicador_conexion()
        self._iniciar_hilo_ws()
        self._procesar_cola_ws()

    def _instalar_indicador_conexion(self):
        self.lbl_status = tk.Label(
            self.app.root,
            text="\u23f3 Conectando...",
            font=("Segoe UI", 9),
            bg=self.app.BG_MAIN,
            fg="#9CA3AF",
        )
        self.lbl_status.place(relx=1.0, rely=1.0, x=-10, y=-10, anchor="se")

    def _actualizar_indicador(self, texto, color):
        try:
            self.lbl_status.config(text=texto, fg=color)
        except Exception:
            pass

    def _iniciar_hilo_ws(self):
        def ejecutar_loop():
            self._loop = asyncio.SelectorEventLoop()
            asyncio.set_event_loop(self._loop)
            print("[CLIENTE] Hilo WS iniciado, loop creado", flush=True)
            try:
                self._loop.run_until_complete(self._conectar_ws())
            except Exception:
                print("[CLIENTE] ERROR FATAL en hilo WS:", flush=True)
                traceback.print_exc()

        t = threading.Thread(target=ejecutar_loop, daemon=True)
        t.start()

    async def _conectar_ws(self):
        while True:
            try:
                print(f"[CLIENTE] Conectando a {self.servidor}/ws/{self.documento_id} ...", flush=True)
                async with websockets.connect(
                    f"{self.servidor}/ws/{self.documento_id}",
                    ping_interval=20,
                    ping_timeout=10,
                ) as ws:
                    self.ws = ws
                    print("[CLIENTE] Conectado al servidor", flush=True)
                    await self._sincronizar_inicial(ws)
                    await self._escuchar_mensajes(ws)
            except (websockets.ConnectionClosed, OSError, ConnectionRefusedError) as e:
                print(f"[CLIENTE] Error de conexion: {e}", flush=True)
                self.conectado = False
                self.cola_ui.put(("status", "\u274c Desconectado", "#EF4444"))
            except Exception:
                print("[CLIENTE] ERROR inesperado en _conectar_ws:", flush=True)
                traceback.print_exc()
                self.conectado = False
                self.cola_ui.put(("status", "\u274c Desconectado", "#EF4444"))
            print("[CLIENTE] Reintentando conexion en 3s...", flush=True)
            await asyncio.sleep(3)

    async def _sincronizar_inicial(self, ws):
        try:
            raw = await asyncio.wait_for(ws.recv(), timeout=10)
            data = json.loads(raw)
            print(f"[CLIENTE] Recibido primer mensaje: tipo={data.get('tipo')}", flush=True)

            if data.get("tipo") == "estado_completo":
                server_state = data.get("elementos", [])
                print(f"[CLIENTE] Estado servidor tiene {len(server_state)} elementos", flush=True)
                if server_state:
                    self.cola_ui.put(("remplazar_estado", server_state))
                else:
                    self.cola_ui.put(("push_inicial", None))
        except asyncio.TimeoutError:
            print("[CLIENTE] Timeout esperando estado_completo", flush=True)
        except Exception:
            print("[CLIENTE] ERROR en _sincronizar_inicial:", flush=True)
            traceback.print_exc()

        self.conectado = True
        self.cola_ui.put(("status", "\u2705 Conectado", "#10B981"))
        self.cola_ui.put(("instalar_parches", None))
        print("[CLIENTE] Sincronizacion inicial completada, parches pendientes", flush=True)

    async def _escuchar_mensajes(self, ws):
        print("[CLIENTE] Escuchando mensajes del servidor...", flush=True)
        async for raw in ws:
            try:
                data = json.loads(raw)
                print(f"[CLIENTE] Mensaje recibido del servidor: tipo={data.get('tipo')}", flush=True)
                self.cola_ui.put(("mensaje_servidor", data))
            except Exception:
                print("[CLIENTE] ERROR procesando mensaje entrante:", flush=True)
                traceback.print_exc()

    def _procesar_cola_ws(self):
        try:
            while True:
                accion, payload = self.cola_ui.get_nowait()
                print(f"[CLIENTE-UI] Procesando accion: {accion}", flush=True)

                if accion == "status":
                    self._actualizar_indicador(payload[0], payload[1])
                elif accion == "remplazar_estado":
                    self._remplazar_estado(payload)
                elif accion == "push_inicial":
                    self._push_estado_inicial()
                elif accion == "instalar_parches":
                    self._instalar_parches_crud()
                elif accion == "mensaje_servidor":
                    self._procesar_mensaje(payload)

        except queue.Empty:
            pass
        except Exception:
            print("[CLIENTE-UI] ERROR en _procesar_cola_ws:", flush=True)
            traceback.print_exc()

        self.root.after(100, self._procesar_cola_ws)

    def _remplazar_estado(self, elementos):
        print(f"[CLIENTE-UI] Reemplazando estado local con {len(elementos)} elementos", flush=True)
        self.app.elementos_documento.clear()
        self.app.listbox.delete(0, tk.END)
        for bloque in elementos:
            self.app.elementos_documento.append(bloque)
            self.app.listbox.insert(tk.END, _derivar_titulo_lista(bloque))

    def _push_estado_inicial(self):
        print(f"[CLIENTE-UI] Empujando estado inicial: {len(self.app.elementos_documento)} elementos", flush=True)
        if self._loop is None:
            print("[CLIENTE-UI] ERROR: _loop es None, no se puede enviar", flush=True)
            return
        for i, bloque in enumerate(self.app.elementos_documento):
            try:
                asyncio.run_coroutine_threadsafe(
                    self._enviar_mensaje("agregar_bloque", idx=i, bloque=bloque),
                    self._loop,
                )
                print(f"[CLIENTE-UI]   Enviado agregar_bloque idx={i}", flush=True)
            except Exception:
                print(f"[CLIENTE-UI] ERROR enviando agregar_bloque idx={i}:", flush=True)
                traceback.print_exc()

    async def _enviar_mensaje(self, tipo, **kwargs):
        if not self.ws or not self.conectado:
            print(f"[CLIENTE-WS] _enviar_mensaje ignorado: ws={'OK' if self.ws else 'None'}, conectado={self.conectado}", flush=True)
            return
        mensaje = {"tipo": tipo}
        mensaje.update(kwargs)
        if "bloque" in mensaje and "titulo_lista" not in mensaje:
            mensaje["titulo_lista"] = _derivar_titulo_lista(mensaje["bloque"])
        try:
            await self.ws.send(json.dumps(mensaje))
            print(f"[CLIENTE-WS] Mensaje '{tipo}' enviado al servidor", flush=True)
        except Exception:
            print(f"[CLIENTE-WS] ERROR enviando mensaje '{tipo}':", flush=True)
            traceback.print_exc()

    def _procesar_mensaje(self, data):
        tipo = data.get("tipo")
        print(f"[CLIENTE-UI] Procesando mensaje remoto: {tipo}", flush=True)
        try:
            if tipo == "agregar_bloque":
                idx = data.get("idx", len(self.app.elementos_documento))
                bloque = data["bloque"]
                titulo = data.get("titulo_lista", _derivar_titulo_lista(bloque))
                if idx is not None and idx <= len(self.app.elementos_documento):
                    self.app.elementos_documento.insert(idx, bloque)
                    self.app.listbox.insert(idx, titulo)
                else:
                    self.app.elementos_documento.append(bloque)
                    self.app.listbox.insert(tk.END, titulo)
                print(f"[CLIENTE-UI]   agregar_bloque aplicado en idx={idx}", flush=True)

            elif tipo == "actualizar_bloque":
                idx = data["idx"]
                bloque = data["bloque"]
                titulo = data.get("titulo_lista", _derivar_titulo_lista(bloque))
                if 0 <= idx < len(self.app.elementos_documento):
                    self.app.elementos_documento[idx] = bloque
                    self.app.listbox.delete(idx)
                    self.app.listbox.insert(idx, titulo)
                    self.app.listbox.selection_set(idx)
                    print(f"[CLIENTE-UI]   actualizar_bloque aplicado en idx={idx}", flush=True)
                else:
                    print(f"[CLIENTE-UI]   actualizar_bloque: idx={idx} fuera de rango (len={len(self.app.elementos_documento)})", flush=True)

            elif tipo == "eliminar_bloque":
                idx = data["idx"]
                if 0 <= idx < len(self.app.elementos_documento):
                    self.app.elementos_documento.pop(idx)
                    self.app.listbox.delete(idx)
                    print(f"[CLIENTE-UI]   eliminar_bloque aplicado en idx={idx}", flush=True)

            elif tipo == "mover_bloque":
                idx_origen = data["idx_origen"]
                idx_destino = data["idx_destino"]
                elementos = self.app.elementos_documento
                if 0 <= idx_origen < len(elementos) and 0 <= idx_destino < len(elementos):
                    bloque = elementos.pop(idx_origen)
                    elementos.insert(idx_destino, bloque)
                    texto = self.app.listbox.get(idx_origen)
                    self.app.listbox.delete(idx_origen)
                    self.app.listbox.insert(idx_destino, texto)
                    self.app.listbox.selection_set(idx_destino)
                    print(f"[CLIENTE-UI]   mover_bloque aplicado: {idx_origen}->{idx_destino}", flush=True)

            elif tipo == "estado_completo":
                self._remplazar_estado(data.get("elementos", []))

        except Exception:
            print(f"[CLIENTE-UI] ERROR aplicando mensaje '{tipo}':", flush=True)
            traceback.print_exc()

    def _instalar_parches_crud(self):
        print("[CLIENTE-UI] Instalando parches CRUD...", flush=True)
        app = self.app
        self_ws = self

        original_guardar = app._guardar_bloque

        def guardar_bloque_patcheado(idx, titulo_lista, tipo_metodo, kwargs):
            try:
                original_guardar(idx, titulo_lista, tipo_metodo, kwargs)
            except Exception:
                print("[CLIENTE-PATCH] ERROR en original_guardar:", flush=True)
                traceback.print_exc()
                return

            if not self_ws.conectado:
                print(f"[CLIENTE-PATCH]   WS no conectado, no se envia mensaje", flush=True)
                return

            bloque = {"metodo": tipo_metodo, "args": kwargs}
            try:
                if idx is None:
                    idx_real = len(app.elementos_documento) - 1
                    print(f"[CLIENTE-PATCH] Enviando agregar_bloque idx={idx_real}", flush=True)
                    asyncio.run_coroutine_threadsafe(
                        self_ws._enviar_mensaje("agregar_bloque", idx=idx_real, bloque=bloque, titulo_lista=titulo_lista),
                        self_ws._loop,
                    )
                else:
                    print(f"[CLIENTE-PATCH] Enviando actualizar_bloque idx={idx}", flush=True)
                    asyncio.run_coroutine_threadsafe(
                        self_ws._enviar_mensaje("actualizar_bloque", idx=idx, bloque=bloque, titulo_lista=titulo_lista),
                        self_ws._loop,
                    )
            except Exception:
                print("[CLIENTE-PATCH] ERROR al enviar mensaje WS:", flush=True)
                traceback.print_exc()

        app._guardar_bloque = guardar_bloque_patcheado
        print("[CLIENTE-UI]   _guardar_bloque parcheado", flush=True)

        original_eliminar = app._eliminar_elemento

        def eliminar_elemento_patcheado():
            sel = app.listbox.curselection()
            if not sel:
                original_eliminar()
                return
            idx = sel[0]
            try:
                original_eliminar()
            except Exception:
                print("[CLIENTE-PATCH] ERROR en original_eliminar:", flush=True)
                traceback.print_exc()
                return
            if self_ws.conectado:
                try:
                    print(f"[CLIENTE-PATCH] Enviando eliminar_bloque idx={idx}", flush=True)
                    asyncio.run_coroutine_threadsafe(
                        self_ws._enviar_mensaje("eliminar_bloque", idx=idx),
                        self_ws._loop,
                    )
                except Exception:
                    print("[CLIENTE-PATCH] ERROR al enviar eliminar_bloque:", flush=True)
                    traceback.print_exc()

        app._eliminar_elemento = eliminar_elemento_patcheado
        print("[CLIENTE-UI]   _eliminar_elemento parcheado", flush=True)

        original_arriba = app._mover_arriba

        def mover_arriba_patcheado():
            sel = app.listbox.curselection()
            if not sel or sel[0] == 0:
                original_arriba()
                return
            idx = sel[0]
            try:
                original_arriba()
            except Exception:
                print("[CLIENTE-PATCH] ERROR en original_mover_arriba:", flush=True)
                traceback.print_exc()
                return
            if self_ws.conectado:
                try:
                    print(f"[CLIENTE-PATCH] Enviando mover_bloque {idx}->{idx-1}", flush=True)
                    asyncio.run_coroutine_threadsafe(
                        self_ws._enviar_mensaje("mover_bloque", idx_origen=idx, idx_destino=idx - 1),
                        self_ws._loop,
                    )
                except Exception:
                    print("[CLIENTE-PATCH] ERROR al enviar mover_bloque:", flush=True)
                    traceback.print_exc()

        app._mover_arriba = mover_arriba_patcheado
        print("[CLIENTE-UI]   _mover_arriba parcheado", flush=True)

        original_abajo = app._mover_abajo

        def mover_abajo_patcheado():
            sel = app.listbox.curselection()
            if not sel or sel[0] == len(app.elementos_documento) - 1:
                original_abajo()
                return
            idx = sel[0]
            try:
                original_abajo()
            except Exception:
                print("[CLIENTE-PATCH] ERROR en original_mover_abajo:", flush=True)
                traceback.print_exc()
                return
            if self_ws.conectado:
                try:
                    print(f"[CLIENTE-PATCH] Enviando mover_bloque {idx}->{idx+1}", flush=True)
                    asyncio.run_coroutine_threadsafe(
                        self_ws._enviar_mensaje("mover_bloque", idx_origen=idx, idx_destino=idx + 1),
                        self_ws._loop,
                    )
                except Exception:
                    print("[CLIENTE-PATCH] ERROR al enviar mover_bloque:", flush=True)
                    traceback.print_exc()

        app._mover_abajo = mover_abajo_patcheado
        print("[CLIENTE-UI]   _mover_abajo parcheado", flush=True)
        print("[CLIENTE-UI] Parches CRUD instalados correctamente", flush=True)


def main():
    print("=" * 60, flush=True)
    print("[CLIENTE] Iniciando GUI colaborativa...", flush=True)
    print("=" * 60, flush=True)
    root = tk.Tk()
    app = AppGeneradorGUI(root)
    print(f"[CLIENTE] GUI creada, {len(app.elementos_documento)} elementos en plantilla", flush=True)
    ClienteColaborativo(root, app, SERVIDOR, DOCUMENTO_ID)
    root.mainloop()


if __name__ == "__main__":
    main()
