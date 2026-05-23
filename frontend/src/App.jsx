import { useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { EditorPage } from "./pages/EditorPage";
import { PreviewPage } from "./pages/PreviewPage";
import { useWebSocket } from "./hooks/useWebSocket";

export default function App() {
  const [page, setPage] = useState("editor");
  const [documentoId, setDocumentoId] = useState("proyecto1");
  const { status } = useWebSocket(documentoId);

  return (
    <AppShell
      currentPage={page}
      onNavigate={setPage}
      documentoId={documentoId}
      onDocumentoIdChange={setDocumentoId}
    >
      {page === "editor" ? <EditorPage /> : <PreviewPage />}
    </AppShell>
  );
}
