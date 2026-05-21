import React from "react";
import { useDocumentStore } from "../../store/documentStore";
import { PreviewCapitulo } from "./blocks/PreviewCapitulo";
import { PreviewSubtitulo } from "./blocks/PreviewSubtitulo";
import { PreviewTexto } from "./blocks/PreviewTexto";
import { PreviewFigura } from "./blocks/PreviewFigura";
import { PreviewTabla } from "./blocks/PreviewTabla";
import { PreviewCasoUso } from "./blocks/PreviewCasoUso";
import { PreviewMatrizESA } from "./blocks/PreviewMatrizESA";

export function PageSimulator({ vistaPaginar = true, onPageCount }) {
  const portada = useDocumentStore((s) => s.portada);
  const elementos = useDocumentStore((s) => s.elementos);

  if (elementos.length === 0) {
    return (
      <div>
        <div style={{ ...pageStyle, overflow: "hidden" }}>
          <p style={emptyStyle}>El documento esta vacio.</p>
        </div>
      </div>
    );
  }

  const paginas = [];
  let paginaActual = [];
  for (const blk of elementos) {
    if (vistaPaginar && blk.metodo === "capitulo" && paginaActual.length > 0) {
      paginas.push(paginaActual);
      paginaActual = [];
    }
    paginaActual.push(blk);
  }
  if (paginaActual.length > 0 || paginas.length === 0) {
    paginas.push(paginaActual);
  }

  React.useEffect(() => {
    if (onPageCount) onPageCount(paginas.length);
  }, [paginas.length, onPageCount]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
      {paginas.map((bloques, pi) => {
        let capNum = 0,
          subNum = 0,
          tabNum = 0,
          figNum = 0;

        return (
          <div key={pi} style={{ ...pageStyle, position: "relative", overflow: "hidden" }}>
            <div style={{ fontFamily: "Arial" }}>
              {pi === 0 && <PortadaPreview portada={portada} />}
              {pi === 0 && <IndicesPreview />}

              {bloques.map((blk, idx) => {
                const m = blk.metodo;
                const args = blk.args || {};
                if (m === "capitulo") {
                  capNum++;
                  subNum = tabNum = figNum = 0;
                  return <PreviewCapitulo key={idx} capNum={capNum} args={args} />;
                }
                if (m === "subtitulo") {
                  subNum++;
                  return <PreviewSubtitulo key={idx} capNum={capNum} subNum={subNum} args={args} />;
                }
                if (m === "texto") return <PreviewTexto key={idx} args={args} />;
                if (m === "definicion")
                  return (
                    <div key={idx} style={{ marginBottom: 8 }}>
                      <p style={{ ...pStyle, fontWeight: "bold" }}>{args.termino || ""}</p>
                      <p style={pStyle}>{args.descripcion || ""}</p>
                    </div>
                  );
                if (m === "figura") {
                  figNum++;
                  return <PreviewFigura key={idx} capNum={capNum} figNum={figNum} args={args} />;
                }
                if (m === "tabla_simple") {
                  tabNum++;
                  return <PreviewTabla key={idx} capNum={capNum} tabNum={tabNum} args={args} />;
                }
                if (m === "caso_uso") {
                  tabNum++;
                  return <PreviewCasoUso key={idx} capNum={capNum} tabNum={tabNum} args={args} />;
                }
                if (m === "matriz_ur_esa") {
                  tabNum++;
                  return <PreviewMatrizESA key={idx} capNum={capNum} tabNum={tabNum} args={args} />;
                }
                if (m === "apa") {
                  return (
                    <div key={idx}>
                      <h1 style={h1Style}>REFERENCIAS BIBLIOGRAFICAS</h1>
                      {(args.lista_referencias || []).map((ref, ri) => (
                        <p key={ri} style={apaRefStyle}>{ref}</p>
                      ))}
                    </div>
                  );
                }
                return null;
              })}
            </div>
            <div style={pageNumStyle}>{pi + 1}</div>
          </div>
        );
      })}
    </div>
  );
}

function PortadaPreview({ portada }) {
  return (
    <div style={portadaContainerStyle}>
      <h1 style={portadaTituloStyle}>{portada.titulo || ""}</h1>
      <p style={portadaInfoStyle}>
        {portada.facultad || ""} — {portada.curso || ""}
      </p>
      <p style={portadaInfoStyle}>
        Autores: {(portada.autores || "").replace(/\n/g, ", ")}
      </p>
      <p style={portadaInfoStyle}>Profesor: {portada.profesor || ""}</p>
      <p style={{ ...portadaInfoStyle, marginTop: 24 }}>
        {portada.ciudad || ""}, {portada.anio || ""}
      </p>
    </div>
  );
}

function IndicesPreview() {
  return (
    <div style={{ marginTop: 40, marginBottom: 40 }}>
      <h1 style={{ ...h1Style, textAlign: "center", marginBottom: 16 }}>
        INDICE DE CONTENIDOS
      </h1>
      <div style={tocPlaceholderStyle}>[ Tabla de contenidos automática — se genera al exportar a .docx ]</div>
      <h1 style={{ ...h1Style, textAlign: "center", marginBottom: 16, marginTop: 32 }}>
        INDICE DE FIGURAS
      </h1>
      <div style={tocPlaceholderStyle}>[ Índice de figuras automático — se genera al exportar a .docx ]</div>
      <h1 style={{ ...h1Style, textAlign: "center", marginBottom: 16, marginTop: 32 }}>
        INDICE DE TABLAS
      </h1>
      <div style={tocPlaceholderStyle}>[ Índice de tablas automático — se genera al exportar a .docx ]</div>
      <div style={pageBreakStyle} />
    </div>
  );
}

const pageStyle = {
  width: "21.59cm",
  minHeight: "27.94cm",
  padding: "2.5cm",
  fontFamily: "Arial, sans-serif",
  fontSize: "12pt",
  lineHeight: 1.5,
  textAlign: "justify",
  background: "white",
  boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
};

const emptyStyle = {
  textAlign: "center",
  color: "#9CA3AF",
  fontFamily: "Arial",
  fontSize: "12pt",
  paddingTop: "200px",
};

const h1Style = {
  fontFamily: "Arial",
  fontSize: "12pt",
  fontWeight: "bold",
  textTransform: "uppercase",
  textAlign: "left",
  marginTop: 24,
  marginBottom: 12,
};

const pStyle = {
  fontFamily: "Arial",
  fontSize: "12pt",
  lineHeight: 1.5,
  textAlign: "justify",
  marginBottom: 6,
  wordBreak: "break-word",
};

const apaRefStyle = {
  fontFamily: "Arial",
  fontSize: "12pt",
  lineHeight: 1.0,
  textAlign: "left",
  marginLeft: "1.25cm",
  textIndent: "-1.25cm",
  marginBottom: 6,
};

const pageNumStyle = {
  position: "absolute",
  bottom: "40px",
  right: "2.5cm",
  fontFamily: "Arial",
  fontSize: "12pt",
  color: "#9CA3AF",
};

const portadaContainerStyle = {
  textAlign: "center",
  marginBottom: 40,
};

const portadaTituloStyle = {
  fontSize: "16pt",
  fontWeight: "bold",
  marginBottom: 8,
  fontFamily: "Arial",
};

const portadaInfoStyle = {
  fontSize: "12pt",
  fontFamily: "Arial",
};

const tocPlaceholderStyle = {
  border: "2px dashed #D1D5DB",
  padding: "12px 16px",
  borderRadius: 8,
  textAlign: "center",
  fontSize: "9pt",
  fontFamily: "Arial",
  color: "#9CA3AF",
  background: "#F9FAFB",
};

const pageBreakStyle = {
  borderTop: "2px dashed #e5e7eb",
  margin: "1.5cm 0",
  position: "relative",
  textAlign: "center",
  height: 0,
};
