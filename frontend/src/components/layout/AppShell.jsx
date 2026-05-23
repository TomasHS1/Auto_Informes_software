import { useState } from "react";
import { BookOpen, Eye, Menu } from "lucide-react";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";

export function AppShell({ children, currentPage, onNavigate, documentoId, onDocumentoIdChange }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: "editor", label: "Editor", icon: BookOpen },
    { id: "preview", label: "Preview A4", icon: Eye },
  ];

  return (
    <div className="flex h-screen bg-[#F0F2F5] overflow-hidden">
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static z-30 w-[320px] h-full bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 shrink-0`}
      >
        <Sidebar currentPage={currentPage} onNavigate={onNavigate} documentoId={documentoId} onDocumentoIdChange={onDocumentoIdChange} />
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          currentPage={currentPage}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onNavigate={onNavigate}
          navItems={navItems}
        />

        <main className="flex-1 overflow-auto p-6 max-w-full">{children}</main>
      </div>
    </div>
  );
}
