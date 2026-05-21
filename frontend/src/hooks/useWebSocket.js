import { useEffect, useRef } from "react";
import { wsStore } from "../store/wsStore";

export function useWebSocket(documentoId = "proyecto1") {
  const status = wsStore((s) => s.status);
  const connect = wsStore((s) => s.connect);
  const disconnect = wsStore((s) => s.disconnect);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      connect(documentoId);
    }
    return () => {
      disconnect();
    };
  }, [documentoId]);

  return { status };
}
