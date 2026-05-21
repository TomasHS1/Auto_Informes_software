export function PreviewTexto({ args }) {
  return (
    <p style={pStyle}>
      {args.texto || ""}
    </p>
  );
}

const pStyle = {
  fontFamily: "Arial",
  fontSize: "12pt",
  lineHeight: 1.5,
  textAlign: "justify",
  marginBottom: 6,
  wordBreak: "break-word",
};
