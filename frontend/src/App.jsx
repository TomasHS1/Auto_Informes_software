import { useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { EditorPage } from "./pages/EditorPage";
import { PreviewPage } from "./pages/PreviewPage";
import { useWebSocket } from "./hooks/useWebSocket";

export default function App() {
  const [page, setPage] = useState("editor");
  const { status } = useWebSocket("proyecto1");

  return (
    <AppShell currentPage={page} onNavigate={setPage} documentoId="proyecto1">
      {page === "editor" ? <EditorPage /> : <PreviewPage />}
    </AppShell>
  );
}
