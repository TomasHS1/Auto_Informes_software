export function serializarAHtml(elementos, portada = null) {
  const partes = [];

  if (portada) {
    partes.push(`
      <div class="portada" style="text-align:center;margin-bottom:40px;">
        <h1 style="font-size:16pt;font-weight:bold;margin-bottom:8px;">${portada.titulo || ""}</h1>
        <p style="font-size:12pt;">${portada.facultad || ""} — ${portada.curso || ""}</p>
        <p style="font-size:12pt;margin-top:12px;">Autores: ${(portada.autores || "").replace(/\n/g, ", ")}</p>
        <p style="font-size:12pt;">Profesor: ${portada.profesor || ""}</p>
        <p style="font-size:12pt;margin-top:24px;">${portada.ciudad || ""}, ${portada.anio || ""}</p>
      </div>
    `);
  }

  let capNum = 0,
    subNum = 0,
    tabNum = 0,
    figNum = 0;

  for (const blk of elementos) {
    const m = blk.metodo;
    const args = blk.args || {};

    if (m === "capitulo") {
      capNum++;
      subNum = tabNum = figNum = 0;
      const capSize = args.fontSize || "12";
      partes.push(
        `<h1 class="capitulo" style="font:${capSize}pt Arial;font-weight:bold;text-transform:uppercase;text-align:left;">${capNum}. ${(args.titulo || "").toUpperCase()}</h1>`
      );
    } else if (m === "subtitulo") {
      subNum++;
      partes.push(
        `<h2 class="subtitulo" style="font:12pt Arial;font-weight:bold;margin-left:1.25cm;">${capNum}.${subNum} ${args.subtitulo || ""}</h2>`
      );
    } else if (m === "texto") {
      const tw = args.negrita ? "font-weight:bold;" : "";
      const ti = args.cursiva ? "font-style:italic;" : "";
      partes.push(
        `<p style="font:12pt/1.5 Arial;text-align:justify;${tw}${ti}">${args.texto || ""}</p>`
      );
    } else if (m === "figura") {
      figNum++;
      partes.push(`
        <figure style="text-align:center;margin:16px 0;">
          <figcaption style="font:9pt Arial;text-align:center;font-style:italic;">Figura ${capNum}.${figNum} "${args.leyenda || ""}".</figcaption>
          <div style="display:flex;align-items:center;justify-content:center;width:80%;height:120px;background:#DBEAFE;border:2px dashed #93C5FD;margin:8px auto;color:#1E40AF;font:10pt Arial;">[IMAGEN]</div>
          <p style="font:9pt/1.0 Arial;text-align:center;color:#444;">Fuente: Elaborado por el estudiante.</p>
        </figure>
      `);
    } else if (m === "tabla_simple") {
      tabNum++;
      const headers = (args.encabezados || [])
        .map((h) => `<th style="background:#D9D9D9;border:1px solid #999;padding:4px 6px;font-size:12pt;">${h}</th>`)
        .join("");
      const filas = (args.filas || [])
        .map(
          (f) =>
            `<tr>${f
              .map((d) => `<td style="border:1px solid #999;padding:4px 6px;font-size:12pt;">${d}</td>`)
              .join("")}</tr>`
        )
        .join("");
      partes.push(`
        <div style="margin:12px 0;">
          <p style="font:9pt Arial;text-align:center;font-style:italic;">Tabla ${capNum}.${tabNum}: "${args.leyenda || ""}".</p>
          <table style="width:100%;border-collapse:collapse;font:12pt Arial;"><thead><tr>${headers}</tr></thead><tbody>${filas}</tbody></table>
          <p style="font:9pt/1.0 Arial;text-align:center;color:#444;">Fuente: Elaborado por el estudiante.</p>
        </div>
      `);
    } else if (m === "caso_uso") {
      tabNum++;
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
      const filas = campos
        .map(
          ([k, v]) =>
            `<tr><td style="background:#F2F2F2;font-weight:bold;border:1px solid #999;padding:4px 6px;width:30%;">${k}</td><td style="border:1px solid #999;padding:4px 6px;">${v || ""}</td></tr>`
        )
        .join("");
      partes.push(`
        <p style="font:9pt Arial;text-align:center;font-style:italic;">Tabla ${capNum}.${tabNum} CU "${args.nombre || ""}".</p>
        <table style="width:100%;border-collapse:collapse;font:12pt Arial;margin:12px 0;">${filas}</table>
        <p style="font:9pt/1.0 Arial;text-align:center;color:#444;">Fuente: Elaborado por el estudiante.</p>
      `);
    } else if (m === "matriz_ur_esa") {
      tabNum++;
      const cats = args.categorias || [];
      let html = `<p style="font:9pt Arial;text-align:center;font-style:italic;">Tabla ${capNum}.${tabNum} "Requerimientos funcionales formato ESA".</p>`;
      html += `<table style="width:100%;border-collapse:collapse;font:8pt Arial;margin:12px 0;">`;
      html += `<thead><tr>${["", "ID", "Descripcion", "Necesidad", "Prioridad", "Estabilidad", "Claridad", "Verificabilidad", "Fuente"]
        .map((h) => `<th style="background:#D9D9D9;border:1px solid #999;padding:2px 3px;">${h}</th>`)
        .join("")}</tr></thead><tbody>`;
      cats.forEach((cat, ci) => {
        html += `<tr><td style="font-weight:bold;">${ci + 1}.</td><td colspan="8" style="background:#F2F2F2;font-weight:bold;">${cat.nombre || ""}</td></tr>`;
        (cat.reqs || []).forEach((req) => {
          html += `<tr>${[
            req.tipo, req.id, req.nombre,
            ...(req.puntos || []).slice(0, 6),
          ]
            .map((v) => `<td style="border:1px solid #999;padding:2px 3px;text-align:center;font-weight:bold;">${v || ""}</td>`)
            .join("")}</tr>`;
          html += `<tr><td></td><td colspan="8" style="border:1px solid #999;padding:2px 3px;text-align:justify;">${req.descripcion || ""}</td></tr>`;
        });
      });
      html += `</tbody></table>`;
      html += `<p style="font:9pt/1.0 Arial;text-align:center;color:#444;">Fuente: Elaborado por el estudiante.</p>`;
      partes.push(html);
    } else if (m === "apa") {
      partes.push(
        `<h1 style="font:12pt Arial;font-weight:bold;text-transform:uppercase;text-align:left;">REFERENCIAS BIBLIOGRAFICAS</h1>`
      );
      (args.lista_referencias || []).forEach((ref) => {
        partes.push(
          `<p style="font:12pt/1.0 Arial;text-align:left;margin-left:1.25cm;text-indent:-1.25cm;">${ref}</p>`
        );
      });
    } else if (m === "definicion") {
      partes.push(
        `<p><strong>${args.termino || ""}</strong></p><p style="font:12pt/1.5 Arial;text-align:justify;">${args.descripcion || ""}</p>`
      );
    }
  }

  return partes.join("\n");
}
