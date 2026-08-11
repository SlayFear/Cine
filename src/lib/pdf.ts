import fs from "node:fs/promises";
import path from "node:path";
import PDFDocument from "pdfkit";
import sharp from "sharp";
import { formatVenueTime } from "./timezone";

export interface InvitationListRow {
  codigo: string;
  peliculaTitulo: string;
  funcionFechaHora: Date;
  status: "disponible" | "reservado" | "cancelado";
}

export interface InvitationListOptions {
  posterUrl?: string | null;
}

const PAGE_MARGIN = 50;
const ROW_HEIGHT = 24;
const HEADER_H = 118;
const INSTRUCTION_H = 34;
const FOOTER_H = 96;
const ACCENT_COLOR = "#7f1d1d";
const CINE_BG = "#0a0a0a";
const CINE_RED = "#e50914";
const SITE_DOMAIN = "lacaptura.click";
const INSTRUCTION_TEXT = `Entra a ${SITE_DOMAIN}, elige tu función e ingresa tu código para reservar tu asiento.`;

const POSTER_W = 58;
const POSTER_H = 87;
const LOGO_W = 168;
const LOGO_RATIO = 616 / 2924;

const NETFLIX_LOGO_PATH = path.join(process.cwd(), "public", "img", "Logonetflix.png");
const DRACO_LOGO_PATH = path.join(process.cwd(), "public", "img", "DracoFilms.png");
const NOTCORE_LOGO_PATH = path.join(process.cwd(), "public", "img", "NCWhiteL.png");
const NETFLIX_RATIO = 678 / 2226;
const DRACO_RATIO = 66 / 67;
const NOTCORE_RATIO = 833 / 1157;

interface BrandGroup {
  label: string;
  logo: Buffer | null;
  ratio: number;
  logoH: number;
}

const COL_X = {
  codigo: PAGE_MARGIN,
  pelicula: PAGE_MARGIN + 130,
  hora: PAGE_MARGIN + 290,
  estado: PAGE_MARGIN + 360,
};

const STATUS_LABEL: Record<InvitationListRow["status"], string> = {
  disponible: "Disponible",
  reservado: "Reservado",
  cancelado: "Inactivo",
};

const STATUS_STYLE: Record<InvitationListRow["status"], { bg: string; fg: string }> = {
  disponible: { bg: "#f3f4f6", fg: "#4b5563" },
  reservado: { bg: "#dcfce7", fg: "#166534" },
  cancelado: { bg: "#fee2e2", fg: "#991b1b" },
};

const LOGO_PATH = path.join(process.cwd(), "public", "img", "LogoCaptura.png");

async function loadPosterThumbnail(posterUrl: string | null | undefined): Promise<Buffer | null> {
  const resolved = posterUrl || "/img/lacaptura.jpg";
  if (!resolved.startsWith("/")) return null;

  try {
    const raw = await fs.readFile(path.join(process.cwd(), "public", resolved));
    return await sharp(raw)
      .resize(POSTER_W * 4, POSTER_H * 4, { fit: "cover" })
      .png()
      .toBuffer();
  } catch {
    return null;
  }
}

export async function buildInvitationsListPdf(
  title: string,
  rows: InvitationListRow[],
  options: InvitationListOptions = {}
): Promise<Buffer> {
  const [logoBuffer, posterBuffer, netflixLogo, dracoLogo, notcoreLogo] = await Promise.all([
    fs.readFile(LOGO_PATH).catch(() => null),
    loadPosterThumbnail(options.posterUrl),
    fs.readFile(NETFLIX_LOGO_PATH).catch(() => null),
    fs.readFile(DRACO_LOGO_PATH).catch(() => null),
    fs.readFile(NOTCORE_LOGO_PATH).catch(() => null),
  ]);

  const doc = new PDFDocument({ size: "letter", margin: PAGE_MARGIN });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const bottomLimit = doc.page.height - FOOTER_H - 12;
  let pageNumber = 0;

  const brandGroups: BrandGroup[] = [
    { label: "DISPONIBLE EN", logo: netflixLogo, ratio: NETFLIX_RATIO, logoH: 17 },
    { label: "CASA PRODUCTORA", logo: dracoLogo, ratio: DRACO_RATIO, logoH: 24 },
    { label: "DESARROLLADO POR", logo: notcoreLogo, ratio: NOTCORE_RATIO, logoH: 20 },
  ];

  function drawHeader() {
    doc.rect(0, 0, doc.page.width, HEADER_H).fill(CINE_BG);
    doc.rect(0, HEADER_H - 3, doc.page.width, 3).fill(CINE_RED);

    let contentX = PAGE_MARGIN;
    const posterY = (HEADER_H - POSTER_H) / 2;

    if (posterBuffer) {
      doc.save();
      doc.roundedRect(PAGE_MARGIN, posterY, POSTER_W, POSTER_H, 6).clip();
      doc.image(posterBuffer, PAGE_MARGIN, posterY, { width: POSTER_W, height: POSTER_H });
      doc.restore();
      contentX = PAGE_MARGIN + POSTER_W + 18;
    }

    const logoH = LOGO_W * LOGO_RATIO;
    const logoY = 26;
    if (logoBuffer) {
      doc.image(logoBuffer, contentX, logoY, { width: LOGO_W });
    }

    doc
      .fillColor(CINE_RED)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("FUNCIÓN EXCLUSIVA", contentX, logoY + logoH + 10, { characterSpacing: 1 });

    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(13)
      .text(title, contentX, logoY + logoH + 24);

    doc
      .fillColor("#c9c9c9")
      .font("Helvetica-Bold")
      .fontSize(8)
      .text("RESERVA TU LUGAR EN", PAGE_MARGIN, 34, {
        width: doc.page.width - PAGE_MARGIN * 2,
        align: "right",
        characterSpacing: 0.5,
      });
    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(20)
      .text(SITE_DOMAIN, PAGE_MARGIN, 46, {
        width: doc.page.width - PAGE_MARGIN * 2,
        align: "right",
      });

    doc.rect(0, HEADER_H, doc.page.width, INSTRUCTION_H).fill("#fdeceb");
    doc
      .fillColor(ACCENT_COLOR)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(INSTRUCTION_TEXT, PAGE_MARGIN, HEADER_H + 12, {
        width: doc.page.width - PAGE_MARGIN * 2,
        align: "center",
      });

    const y = HEADER_H + INSTRUCTION_H + 22;
    doc.rect(PAGE_MARGIN - 10, y - 6, doc.page.width - (PAGE_MARGIN - 10) * 2, 22).fill("#fdf2f2");
    doc.font("Helvetica-Bold").fontSize(9).fillColor(ACCENT_COLOR);
    doc.text("CODIGO", COL_X.codigo, y);
    doc.text("PELICULA", COL_X.pelicula, y);
    doc.text("HORA", COL_X.hora, y);
    doc.text("ESTADO", COL_X.estado, y);
    doc.y = y + 26;
  }

  function drawFooter() {
    // .text() pagina automaticamente si la posicion cae dentro del margen
    // inferior de la pagina; se desactiva el margen mientras se dibuja el
    // footer (que vive justo ahi) para que no cree una pagina en blanco.
    const bottomMargin = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;

    const bandY = doc.page.height - FOOTER_H;
    doc.rect(0, bandY, doc.page.width, FOOTER_H).fill(CINE_BG);
    doc.rect(0, bandY, doc.page.width, 2).fill(CINE_RED);

    // Columnas fijas (no en linea): evita tener que sumar anchos de texto e
    // imagen a mano, que es lo que causaba que el logo se encimara con la
    // etiqueta de al lado.
    const visible = brandGroups.filter((g) => g.logo);
    const colW = (doc.page.width - PAGE_MARGIN * 2) / visible.length;
    const labelY = bandY + 13;
    const logoRowY = bandY + 27;
    const logoRowH = 28;

    visible.forEach((g, i) => {
      const colX = PAGE_MARGIN + i * colW;

      doc
        .fillColor("#c9c9c9")
        .font("Helvetica-Bold")
        .fontSize(7)
        .text(g.label, colX, labelY, { width: colW, align: "center", characterSpacing: 0.4 });

      const logoW = g.logoH / g.ratio;
      const logoX = colX + (colW - logoW) / 2;
      const logoY = logoRowY + (logoRowH - g.logoH) / 2;
      doc.image(g.logo!, logoX, logoY, { width: logoW, height: g.logoH });
    });

    const lineY = bandY + 63;
    doc
      .moveTo(PAGE_MARGIN, lineY)
      .lineTo(doc.page.width - PAGE_MARGIN, lineY)
      .strokeColor("#2a2a2a")
      .stroke();
    doc
      .fillColor("#8a8a8a")
      .font("Helvetica")
      .fontSize(8)
      .text(`Página ${pageNumber}`, PAGE_MARGIN, lineY + 9, {
        width: doc.page.width - PAGE_MARGIN * 2,
        align: "center",
      });

    doc.page.margins.bottom = bottomMargin;
  }

  function newPage() {
    if (pageNumber > 0) doc.addPage();
    pageNumber += 1;
    drawHeader();
  }

  newPage();

  rows.forEach((row, index) => {
    if (doc.y + ROW_HEIGHT > bottomLimit) {
      drawFooter();
      newPage();
    }

    const y = doc.y;
    if (index % 2 === 1) {
      doc.rect(PAGE_MARGIN - 10, y - 4, doc.page.width - (PAGE_MARGIN - 10) * 2, ROW_HEIGHT).fill("#fafafa");
    }

    doc.font("Helvetica").fontSize(10).fillColor("#222222");
    doc.text(row.codigo, COL_X.codigo, y, { width: COL_X.pelicula - COL_X.codigo - 10 });
    doc.text(row.peliculaTitulo, COL_X.pelicula, y, { width: COL_X.hora - COL_X.pelicula - 10 });
    doc.text(formatVenueTime(row.funcionFechaHora), COL_X.hora, y, {
      width: COL_X.estado - COL_X.hora - 10,
    });

    const { bg, fg } = STATUS_STYLE[row.status];
    const label = STATUS_LABEL[row.status];
    doc.font("Helvetica-Bold").fontSize(8);
    const pillW = doc.widthOfString(label) + 16;
    doc.roundedRect(COL_X.estado, y - 2, pillW, 14, 7).fill(bg);
    doc.fillColor(fg).text(label, COL_X.estado, y + 1, { width: pillW, align: "center" });

    doc.y = y + ROW_HEIGHT;
  });

  drawFooter();
  doc.end();
  return finished;
}
