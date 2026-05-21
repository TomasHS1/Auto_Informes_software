import React from "react";
import { useDocumentStore } from "../../store/documentStore";

export function PageSimulator() {
  const elementos = useDocumentStore((s) => s.elementos);

  if (elementos.length === 0) {
    return (
      <div>
        <div style={{ ...pageStyle, overflow: "hidden" }}>
          <p style={{ textAlign: "center", color: "#9CA3AF", fontFamily: "Arial", fontSize: "12pt", paddingTop: "200px" }}>
            El documento esta vacio.
          </p>
        </div>
      </div>
    );
  }

  const paginas = [];
  let paginaActual = [];

  for (let i = 0; i < elementos.length; i++) {
    const blk = elementos[i];
    if (blk.metodo === "capitulo" && paginaActual.length > 0) {
      paginas.push(paginaActual);
      paginaActual = [];
    }
    paginaActual.push(blk);
  }
  if (paginaActual.length > 0) paginas.push(paginaActual);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
      {paginas.map((bloques, pi) => {
        let capNum = 0, subNum = 0, tabNum = 0, figNum = 0;
        return (
          <div key={pi} style={{ ...pageStyle, position: "relative", overflow: "hidden" }}>
            <div style={{ fontFamily: "Arial" }}>
              {bloques.map((blk, idx) => {
                const m = blk.metodo;
                const args = blk.args || {};
                if (m === "capitulo") { capNum++; subNum = tabNum = figNum = 0; }
                else if (m === "subtitulo") subNum++;
                else if (m === "figura") figNum++;
                else if (m === "tabla_simple" || m === "caso_uso" || m === "matriz_ur_esa") tabNum++;

                if (m === "capitulo")
                  return <h1 key={idx} style={h1Style}>{capNum}. {(args.titulo || "").toUpperCase()}</h1>;
                if (m === "subtitulo")
                  return <h2 key={idx} style={h2Style}>{capNum}.{subNum} {args.subtitulo || ""}</h2>;
                if (m === "texto")
                  return <p key={idx} style={pStyle}>{args.texto || ""}</p>;
                if (m === "definicion")
                  return <div key={idx} style={{ marginBottom: 8 }}><p style={{ ...pStyle, fontWeight: "bold" }}>{args.termino || ""}</p><p style={pStyle}>{args.descripcion || ""}</p></div>;
                if (m === "figura")
                  return <FiguraPreview key={idx} capNum={capNum} figNum={figNum} args={args} />;
                if (m === "tabla_simple")
                  return <TablaPreview key={idx} capNum={capNum} tabNum={tabNum} args={args} />;
                if (m === "caso_uso")
                  return <CasoUsoPreview key={idx} capNum={capNum} tabNum={tabNum} args={args} />;
                if (m === "matriz_ur_esa")
                  return <MatrizESAPreview key={idx} capNum={capNum} tabNum={tabNum} args={args} />;
                if (m === "apa")
                  return <ApaPreview key={idx} args={args} />;
                return null;
              })}
            </div>
            <div style={{ position: "absolute", bottom: "40px", right: "2.5cm", fontFamily: "Arial", fontSize: "12pt", color: "#9CA3AF" }}>{pi + 1}</div>
          </div>
        );
      })}
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

const h1Style = { fontFamily: "Arial", fontSize: "12pt", fontWeight: "bold", textTransform: "uppercase", textAlign: "left", marginTop: 24, marginBottom: 12 };
const h2Style = { fontFamily: "Arial", fontSize: "12pt", fontWeight: "bold", textAlign: "left", marginLeft: "1.25cm", marginBottom: 8 };
const pStyle = { fontFamily: "Arial", fontSize: "12pt", lineHeight: 1.5, textAlign: "justify", marginBottom: 6, wordBreak: "break-word" };

const captionStyle = { fontFamily: "Arial", fontSize: "9pt", textAlign: "center", fontStyle: "italic", marginBottom: 6 };
const fuenteStyle = { fontFamily: "Arial", fontSize: "9pt", textAlign: "center", lineHeight: "1.0", color: "#444", marginTop: 4 };
const thStyle = { background: "#D9D9D9", fontWeight: "bold", padding: "4px 6px", border: "1px solid #999", textAlign: "center", fontSize: "12pt" };
const tdStyle = { padding: "4px 6px", border: "1px solid #999", fontSize: "12pt" };

function FiguraPreview({ capNum, figNum, args }) {
  return (
    <figure style={{ margin: "16px 0", textAlign: "center" }}>
      <figcaption style={captionStyle}>Figura {capNum}.{figNum} &quot;{args.leyenda || ""}&quot;.</figcaption>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "80%", maxWidth: "12cm", height: 120, margin: "8px auto", background: "#DBEAFE", border: "2px dashed #93C5FD", borderRadius: 6, color: "#1E40AF", fontFamily: "Arial", fontSize: "10pt" }}>[ IMAGEN: {args.ruta_imagen || "sin ruta"} ]</div>
      <p style={fuenteStyle}>Fuente: Elaborado por el estudiante de acuerdo con el proyecto.</p>
    </figure>
  );
}

function TablaPreview({ capNum, tabNum, args }) {
  return (
    <div style={{ margin: "12px 0" }}>
      <p style={captionStyle}>Tabla {capNum}.{tabNum}: &quot;{args.leyenda || ""}&quot;.</p>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Arial", fontSize: "12pt" }}>
        <thead><tr>{(args.encabezados || []).map((h, i) => (<th key={i} style={thStyle}>{h}</th>))}</tr></thead>
        <tbody>{(args.filas || []).map((fila, ri) => (<tr key={ri}>{fila.map((d, ci) => (<td key={ci} style={tdStyle}>{d}</td>))}</tr>))}</tbody>
      </table>
      <p style={fuenteStyle}>Fuente: Elaborado por el estudiante de acuerdo con el proyecto.</p>
    </div>
  );
}

function CasoUsoPreview({ capNum, tabNum, args }) {
  const campos = [
    ["Nombre", args.nombre], ["Actor(es)", args.actores], ["Resumen", args.resumen],
    ["Frecuencia", args.frecuencia], ["Precondiciones", args.precondiciones],
    ["Descripcion", args.descripcion], ["Excepciones", args.excepciones],
    ["Poscondiciones", args.poscondiciones], ["Dependencias", args.dependencias],
  ];
  const campoStyle = { background: "#F2F2F2", fontWeight: "bold", border: "1px solid #999", padding: "4px 6px", width: "30%", fontSize: "12pt" };
  const valorStyle = { border: "1px solid #999", padding: "4px 6px", fontSize: "12pt", whiteSpace: "pre-wrap" };
  return (
    <div style={{ margin: "12px 0" }}>
      <p style={captionStyle}>Tabla {capNum}.{tabNum} CU &quot;{args.nombre || ""}&quot;.</p>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Arial", fontSize: "12pt" }}>
        <tbody>{campos.map(([k, v], i) => (<tr key={i}><td style={campoStyle}>{k}</td><td style={valorStyle}>{v || ""}</td></tr>))}</tbody>
      </table>
      <p style={fuenteStyle}>Fuente: Elaborado por el estudiante de acuerdo con el proyecto.</p>
    </div>
  );
}

function MatrizESAPreview({ capNum, tabNum, args }) {
  const cats = args.categorias || [];
  const headers = ["", "ID", "Descripcion", "Nec", "Prio", "Est", "Cla", "Ver", "Fue"];
  const thEsa = { background: "#D9D9D9", fontWeight: "bold", padding: "2px 3px", border: "1px solid #999", textAlign: "center", fontSize: "8pt" };
  const tdEsa = { border: "1px solid #999", padding: "2px 3px", fontSize: "8pt" };
  const tdEsaBold = { border: "1px solid #999", padding: "2px 3px", fontSize: "8pt", fontWeight: "bold", textAlign: "center" };
  const tdCat = { border: "1px solid #999", padding: "2px 4px", fontSize: "8pt", background: "#F2F2F2", fontWeight: "bold" };
  const tdDesc = { border: "1px solid #999", padding: "2px 4px", fontSize: "8pt", textAlign: "justify" };
  return (
    <div style={{ margin: "12px 0" }}>
      <p style={captionStyle}>Tabla {capNum}.{tabNum} &quot;Requerimientos funcionales formato ESA&quot;.</p>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Arial", fontSize: "8pt" }}>
        <thead><tr>{headers.map((h, i) => (<th key={i} style={thEsa}>{h}</th>))}</tr></thead>
        <tbody>
          {cats.map((cat, ci) => (
            <React.Fragment key={ci}>
              <tr><td style={tdEsaBold}>{ci + 1}.</td><td style={tdEsa}></td><td colSpan={7} style={tdCat}>{cat.nombre || ""}</td></tr>
              {(cat.reqs || []).map((req, ri) => (
                <React.Fragment key={ri}>
                  <tr>
                    <td style={tdEsaBold}>{req.tipo || "UR"}</td>
                    <td style={tdEsaBold}>{req.id || ""}</td>
                    <td style={tdEsaBold}>{req.nombre || ""}</td>
                    {(req.puntos || []).slice(0, 6).map((p, pi) => (<td key={pi} style={{ ...tdEsa, textAlign: "center" }}>{p}</td>))}
                  </tr>
                  <tr><td style={tdEsa}></td><td colSpan={8} style={tdDesc}>{req.descripcion || ""}</td></tr>
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <p style={fuenteStyle}>Fuente: Elaborado por el estudiante de acuerdo con el proyecto.</p>
    </div>
  );
}

function ApaPreview({ args }) {
  return (
    <div>
      <h1 style={h1Style}>REFERENCIAS BIBLIOGRAFICAS</h1>
      {(args.lista_referencias || []).map((ref, ri) => (
        <p key={ri} style={{ ...pStyle, marginLeft: "1.25cm", textIndent: "-1.25cm", lineHeight: "1.0", marginBottom: 6 }}>{ref}</p>
      ))}
    </div>
  );
}
