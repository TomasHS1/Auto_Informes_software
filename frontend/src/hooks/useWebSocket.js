import { useEffect } from "react";
import { wsStore } from "../store/wsStore";

export function useWebSocket(documentoId = "proyecto1") {
  const status = wsStore((s) => s.status);
  const connect = wsStore((s) => s.connect);
  const disconnect = wsStore((s) => s.disconnect);

  useEffect(() => {
    connect(documentoId);
    return () => {
      disconnect();
    };
  }, [documentoId]);

  return { status };
}
