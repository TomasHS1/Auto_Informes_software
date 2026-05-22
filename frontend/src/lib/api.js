const BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export function apiUrl(path) {
  return `${BASE}${path}`;
}

export function wsUrl(docId) {
  const host = BASE ? BASE.replace(/^https?:\/\//, "") : window.location.host;
  const protocol = (BASE.startsWith("https") || window.location.protocol === "https:") ? "wss" : "ws";
  return `${protocol}://${host}/ws/${docId}`;
}
