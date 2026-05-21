export function PreviewFigura({ capNum, figNum, args }) {
  return (
    <figure style={{ margin: "16px 0", textAlign: "center" }}>
      <figcaption style={captionStyle}>
        Figura {capNum}.{figNum} &quot;{args.leyenda || ""}&quot;.
      </figcaption>
      <div style={placeholderStyle}>
        [ IMAGEN: {args.ruta_imagen || "sin ruta"} ]
      </div>
      <p style={fuenteStyle}>
        Fuente: Elaborado por el estudiante de acuerdo con el proyecto.
      </p>
    </figure>
  );
}

const captionStyle = {
  fontFamily: "Arial",
  fontSize: "9pt",
  textAlign: "center",
  fontStyle: "italic",
  marginBottom: 6,
};

const placeholderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "80%",
  maxWidth: "12cm",
  height: 120,
  margin: "8px auto",
  background: "#DBEAFE",
  border: "2px dashed #93C5FD",
  borderRadius: 6,
  color: "#1E40AF",
  fontFamily: "Arial",
  fontSize: "10pt",
};

const fuenteStyle = {
  fontFamily: "Arial",
  fontSize: "9pt",
  textAlign: "center",
  lineHeight: "1.0",
  color: "#444",
  marginTop: 4,
};
