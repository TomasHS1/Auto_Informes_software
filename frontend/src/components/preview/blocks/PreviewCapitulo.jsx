export function PreviewCapitulo({ capNum, args }) {
  return (
    <h1 style={h1Style}>
      {capNum}. {(args.titulo || "").toUpperCase()}
    </h1>
  );
}

const h1Style = {
  fontFamily: "Arial",
  fontSize: "12pt",
  fontWeight: "bold",
  textTransform: "uppercase",
  textAlign: "left",
  marginTop: 24,
  marginBottom: 12,
};
