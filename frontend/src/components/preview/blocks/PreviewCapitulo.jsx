export function PreviewCapitulo({ capNum, args }) {
  const size = args.fontSize || "12";
  return (
    <h1 style={{ ...h1Style, fontSize: `${size}pt` }}>
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
