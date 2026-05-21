export class WsClient {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.listeners = new Map();
    this.reconnectDelay = 2000;
    this.shouldReconnect = true;
  }

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;
    this.shouldReconnect = true;

    try {
      this.ws = new WebSocket(this.url);
    } catch (e) {
      this._emit("error", e);
      this._scheduleReconnect();
      return;
    }

    this.ws.onopen = () => this._emit("open");
    this.ws.onclose = () => {
      this._emit("close");
      if (this.shouldReconnect) this._scheduleReconnect();
    };
    this.ws.onerror = (e) => this._emit("error", e);
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this._emit("message", data);
      } catch (e) {
        console.error("WsClient: error parsing message", e);
      }
    };
  }

  send(payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
      return true;
    }
    return false;
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.listeners.get(event)?.delete(callback);
  }

  _emit(event, data) {
    this.listeners.get(event)?.forEach((cb) => {
      try { cb(data); } catch (e) { console.error("WsClient listener error:", e); }
    });
  }

  _scheduleReconnect() {
    setTimeout(() => {
      if (this.shouldReconnect) this.connect();
    }, this.reconnectDelay);
  }
}
