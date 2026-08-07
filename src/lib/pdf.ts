import PDFDocument from "pdfkit";
import { formatVenueTime } from "./timezone";

export interface InvitationListRow {
  codigo: string;
  peliculaTitulo: string;
  funcionFechaHora: Date;
}

const PAGE_MARGIN = 50;
const ROW_HEIGHT = 22;
const ACCENT_COLOR = "#7f1d1d";
const COL_X = { codigo: PAGE_MARGIN, pelicula: PAGE_MARGIN + 160, hora: PAGE_MARGIN + 400 };

export async function buildInvitationsListPdf(
  title: string,
  rows: InvitationListRow[]
): Promise<Buffer> {
  const doc = new PDFDocument({ size: "letter", margin: PAGE_MARGIN });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const bottomLimit = doc.page.height - PAGE_MARGIN;

  function drawHeader() {
    doc.fillColor("#111111").font("Helvetica-Bold").fontSize(16).text(title, PAGE_MARGIN, PAGE_MARGIN);
    doc.moveDown(1.2);

    const y = doc.y;
    doc.font("Helvetica-Bold").fontSize(10).fillColor(ACCENT_COLOR);
    doc.text("Codigo", COL_X.codigo, y);
    doc.text("Pelicula", COL_X.pelicula, y);
    doc.text("Hora", COL_X.hora, y);
    doc
      .moveTo(PAGE_MARGIN, y + 16)
      .lineTo(doc.page.width - PAGE_MARGIN, y + 16)
      .strokeColor("#dddddd")
      .stroke();
    doc.y = y + 24;
  }

  drawHeader();
  doc.font("Helvetica").fontSize(10).fillColor("#222222");

  for (const row of rows) {
    if (doc.y + ROW_HEIGHT > bottomLimit) {
      doc.addPage();
      drawHeader();
      doc.font("Helvetica").fontSize(10).fillColor("#222222");
    }

    const y = doc.y;
    doc.text(row.codigo, COL_X.codigo, y, { width: COL_X.pelicula - COL_X.codigo - 10 });
    doc.text(row.peliculaTitulo, COL_X.pelicula, y, { width: COL_X.hora - COL_X.pelicula - 10 });
    doc.text(formatVenueTime(row.funcionFechaHora), COL_X.hora, y, {
      width: doc.page.width - PAGE_MARGIN - COL_X.hora,
    });
    doc.y = y + ROW_HEIGHT;
  }

  doc.end();
  return finished;
}
