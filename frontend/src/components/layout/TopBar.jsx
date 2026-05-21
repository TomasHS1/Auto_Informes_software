import {
  Menu,
  BookOpen,
  Eye,
} from "lucide-react";
import { StatusBadge } from "../shared/StatusBadge";

export function TopBar({ currentPage, onMenuClick, onNavigate, navItems }) {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4 shrink-0">
      <button
        className="md:hidden p-2 rounded-lg hover:bg-gray-100"
        onClick={onMenuClick}
      >
        <Menu size={20} />
      </button>

      <h1 className="text-lg font-bold text-[#1F2937] flex items-center gap-2">
        <BookOpen size={22} className="text-[#2563EB]" />
        <span className="hidden sm:inline">Ingecon Document Studio</span>
      </h1>

      <div className="hidden md:flex items-center gap-1 ml-6">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPage === item.id
                ? "bg-[#2563EB] text-white"
                : "text-[#6B7280] hover:bg-gray-100"
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </div>

      <div className="ml-auto">
        <StatusBadge />
      </div>
    </header>
  );
}
