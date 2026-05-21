import { useEffect, useRef, useCallback } from "react";
import { wsStore } from "../store/wsStore";
import { useDocumentStore } from "../store/documentStore";

export function usePreviewSync() {
  const status = wsStore((s) => s.status);
  const lastSync = useRef(null);
  const versionRef = useRef(0);

  const elementos = useDocumentStore((s) => s.elementos);
  const version = elementos.length;

  useEffect(() => {
    if (status === "connected") {
      lastSync.current = new Date().toISOString();
    }
  }, [status]);

  useEffect(() => {
    versionRef.current = version;
    lastSync.current = new Date().toISOString();
  }, [version]);

  const isSyncing = status === "connecting";
  const isConnected = status === "connected";
  const lastSyncTime = lastSync.current;

  const forceSync = useCallback(() => {
    const send = wsStore.getState().send;
    if (send) {
      send({ tipo: "sync_estado" });
    }
    lastSync.current = new Date().toISOString();
  }, []);

  return { isSyncing, isConnected, lastSyncTime, forceSync };
}
