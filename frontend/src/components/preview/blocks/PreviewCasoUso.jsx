export function PreviewCasoUso({ capNum, tabNum, args }) {
  const campos = [
    ["Nombre", args.nombre],
    ["Actor(es)", args.actores],
    ["Resumen", args.resumen],
    ["Frecuencia", args.frecuencia],
    ["Precondiciones", args.precondiciones],
    ["Descripcion", args.descripcion],
    ["Excepciones", args.excepciones],
    ["Poscondiciones", args.poscondiciones],
    ["Dependencias", args.dependencias],
  ];

  return (
    <div style={{ margin: "12px 0" }}>
      <p style={captionStyle}>
        Tabla {capNum}.{tabNum} CU &quot;{args.nombre || ""}&quot;.
      </p>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "Arial",
          fontSize: "12pt",
        }}
      >
        <tbody>
          {campos.map(([k, v], i) => (
            <tr key={i}>
              <td style={campoStyle}>{k}</td>
              <td style={valorStyle}>{v || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={fuenteStyle}>
        Fuente: Elaborado por el estudiante de acuerdo con el proyecto.
      </p>
    </div>
  );
}

const captionStyle = {
  fontFamily: "Arial",
  fontSize: "9pt",
  textAlign: "center",
  fontStyle: "italic",
  marginBottom: 6,
};

const campoStyle = {
  background: "#F2F2F2",
  fontWeight: "bold",
  border: "1px solid #999",
  padding: "4px 6px",
  width: "30%",
  fontSize: "12pt",
};

const valorStyle = {
  border: "1px solid #999",
  padding: "4px 6px",
  fontSize: "12pt",
  whiteSpace: "pre-wrap",
};

const fuenteStyle = {
  fontFamily: "Arial",
  fontSize: "9pt",
  textAlign: "center",
  lineHeight: "1.0",
  color: "#444",
  marginTop: 4,
};
