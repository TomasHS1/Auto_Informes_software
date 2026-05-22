import json
import os
import sys
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
    _guardar(_estado)


def agregar_cliente(documento_id: str, websocket) -> None:
    _clientes[documento_id].add(websocket)
    print(f"[SERVIDOR] Cliente conectado a '{documento_id}' (total: {len(_clientes[documento_id])})", flush=True)


def remover_cliente(documento_id: str, websocket) -> None:
    _clientes[documento_id].discard(websocket)
    print(f"[SERVIDOR] Cliente desconectado de '{documento_id}' (total: {len(_clientes[documento_id])})", flush=True)
    if not _clientes[documento_id]:
        del _clientes[documento_id]


def obtener_clientes(documento_id: str) -> set:
    return _clientes.get(documento_id, set())


def contar_clientes() -> int:
    return sum(len(c) for c in _clientes.values())
