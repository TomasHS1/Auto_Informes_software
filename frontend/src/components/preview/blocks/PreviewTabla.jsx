export function PreviewTabla({ capNum, tabNum, args }) {
  return (
    <div style={{ margin: "12px 0" }}>
      <p style={captionStyle}>
        Tabla {capNum}.{tabNum}: &quot;{args.leyenda || ""}&quot;.
      </p>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "Arial",
          fontSize: "12pt",
        }}
      >
        <thead>
          <tr>
            {(args.encabezados || []).map((h, i) => (
              <th key={i} style={thStyle}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(args.filas || []).map((fila, ri) => (
            <tr key={ri}>
              {fila.map((d, ci) => (
                <td key={ci} style={tdStyle}>
                  {d}
                </td>
              ))}
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

const thStyle = {
  background: "#D9D9D9",
  fontWeight: "bold",
  padding: "4px 6px",
  border: "1px solid #999",
  textAlign: "center",
  fontSize: "12pt",
};

const tdStyle = {
  padding: "4px 6px",
  border: "1px solid #999",
  fontSize: "12pt",
};

const fuenteStyle = {
  fontFamily: "Arial",
  fontSize: "9pt",
  textAlign: "center",
  lineHeight: "1.0",
  color: "#444",
  marginTop: 4,
};
