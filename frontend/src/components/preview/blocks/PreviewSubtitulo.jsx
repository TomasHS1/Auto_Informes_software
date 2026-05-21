export function PreviewSubtitulo({ capNum, subNum, args }) {
  return (
    <h2 style={h2Style}>
      {capNum}.{subNum} {args.subtitulo || ""}
    </h2>
  );
}

const h2Style = {
  fontFamily: "Arial",
  fontSize: "12pt",
  fontWeight: "bold",
  textAlign: "left",
  marginLeft: "1.25cm",
  marginBottom: 8,
};
