import React from "react";

export function PreviewMatrizESA({ capNum, tabNum, args }) {
  const cats = args.categorias || [];
  const headers = [
    "",
    "ID",
    "Descripcion",
    "Nec",
    "Prio",
    "Est",
    "Cla",
    "Ver",
    "Fue",
  ];

  return (
    <div style={{ margin: "12px 0" }}>
      <p style={captionStyle}>
        Tabla {capNum}.{tabNum} &quot;Requerimientos funcionales formato
        ESA&quot;.
      </p>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "Arial",
          fontSize: "8pt",
        }}
      >
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={thEsa}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cats.map((cat, ci) => (
            <React.Fragment key={ci}>
              <tr>
                <td style={tdEsaBold}>{ci + 1}.</td>
                <td style={tdEsa}></td>
                <td colSpan={7} style={tdCat}>
                  {cat.nombre || ""}
                </td>
              </tr>
              {(cat.reqs || []).map((req, ri) => (
                <React.Fragment key={ri}>
                  <tr>
                    <td style={tdEsaBold}>{req.tipo || "UR"}</td>
                    <td style={tdEsaBold}>{req.id || ""}</td>
                    <td style={tdEsaBold}>{req.nombre || ""}</td>
                    {(req.puntos || []).slice(0, 6).map((p, pi) => (
                      <td key={pi} style={{ ...tdEsa, textAlign: "center" }}>
                        {p}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td style={tdEsa}></td>
                    <td colSpan={8} style={tdDesc}>
                      {req.descripcion || ""}
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </React.Fragment>
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

const thEsa = {
  background: "#D9D9D9",
  fontWeight: "bold",
  padding: "2px 3px",
  border: "1px solid #999",
  textAlign: "center",
  fontSize: "8pt",
};

const tdEsa = {
  border: "1px solid #999",
  padding: "2px 3px",
  fontSize: "8pt",
};

const tdEsaBold = {
  border: "1px solid #999",
  padding: "2px 3px",
  fontSize: "8pt",
  fontWeight: "bold",
  textAlign: "center",
};

const tdCat = {
  border: "1px solid #999",
  padding: "2px 4px",
  fontSize: "8pt",
  background: "#F2F2F2",
  fontWeight: "bold",
};

const tdDesc = {
  border: "1px solid #999",
  padding: "2px 4px",
  fontSize: "8pt",
  textAlign: "justify",
};

const fuenteStyle = {
  fontFamily: "Arial",
  fontSize: "9pt",
  textAlign: "center",
  lineHeight: "1.0",
  color: "#444",
  marginTop: 4,
};
