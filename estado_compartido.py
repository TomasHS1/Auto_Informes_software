import json
import sys
from collections import defaultdict

_estado = defaultdict(list)
_clientes = defaultdict(set)


def obtener_estado(documento_id: str) -> list:
    return _estado[documento_id]


def establecer_estado(documento_id: str, elementos: list) -> None:
    _estado[documento_id] = elementos


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
