import { wsStore } from "../../store/wsStore";
import { Wifi, WifiOff } from "lucide-react";

export function StatusBadge() {
  const status = wsStore((s) => s.status);

  const config = {
    connected: { color: "bg-[#10B981]", text: "Conectado", icon: Wifi },
    connecting: { color: "bg-[#F59E0B]", text: "Conectando...", icon: Wifi },
    error: { color: "bg-[#EF4444]", text: "Error", icon: WifiOff },
    disconnected: { color: "bg-gray-400", text: "Desconectado", icon: WifiOff },
  };

  const { color, text, icon: Icon } = config[status] || config.disconnected;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium text-[#1F2937]">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      <Icon size={12} />
      <span>{text}</span>
    </div>
  );
}
