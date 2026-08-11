import { getSeatById } from "@/lib/seatLayout";
import { EVENT_FALLBACK_POSTER } from "@/lib/eventConfig";

const SITE_DOMAIN = "lacaptura.click";

interface TicketImageParams {
  peliculaTitulo: string;
  funcionLabel: string;
  seatId: string | null;
  codigo: string;
  qrDataUrl: string;
  posterUrl?: string | null;
}

const CINE_RED = "#e50914";
const CINE_TEXT = "#ffffff";
const CINE_MUTED = "#b8b8b8";
const CINE_BORDER = "rgba(255, 255, 255, 0.16)";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No se pudo cargar la imagen: ${src}`));
    img.src = src;
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number
) {
  const scale = Math.max(dw / img.width, dh / img.height);
  const sw = dw / scale;
  const sh = dh / scale;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

function seatLabel(seatId: string | null): string {
  if (!seatId) return "Por confirmar";
  const seat = getSeatById(seatId);
  return seat ? `Fila ${seat.rowLabel}, Asiento ${seat.seatNumber}` : seatId;
}

async function renderTicketCanvas(params: TicketImageParams): Promise<HTMLCanvasElement> {
  const width = 900;
  const height = 1440;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas no soportado");

  const [logo, qr, poster, notcoreLogo, netflixLogo, dracoLogo] = await Promise.all([
    loadImage("/img/LogoCaptura.png"),
    loadImage(params.qrDataUrl),
    loadImage(params.posterUrl || EVENT_FALLBACK_POSTER),
    loadImage("/img/NCWhiteL.png"),
    loadImage("/img/Logonetflix.png"),
    loadImage("/img/DracoFilmsN.png"),
  ]);

  // Fondo: poster de la película, oscurecido con un degradado para que el
  // texto y el QR blanco siempre queden legibles encima.
  drawCover(ctx, poster, 0, 0, width, height);
  const overlay = ctx.createLinearGradient(0, 0, 0, height);
  overlay.addColorStop(0, "rgba(9, 9, 9, 0.55)");
  overlay.addColorStop(0.35, "rgba(9, 9, 9, 0.82)");
  overlay.addColorStop(1, "rgba(9, 9, 9, 0.96)");
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, width, height);

  const margin = 28;
  ctx.strokeStyle = CINE_BORDER;
  ctx.lineWidth = 2;
  ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

  ctx.fillStyle = CINE_RED;
  ctx.fillRect(margin, margin, width - margin * 2, 8);

  let y = margin + 90;

  const logoW = 440;
  const logoH = logoW * (logo.height / logo.width);
  ctx.drawImage(logo, (width - logoW) / 2, y, logoW, logoH);
  y += logoH + 56;

  ctx.textAlign = "center";
  ctx.fillStyle = CINE_RED;
  ctx.font = "bold 22px Arial";
  ctx.fillText("FUNCIÓN EXCLUSIVA", width / 2, y);
  y += 48;

  ctx.fillStyle = CINE_TEXT;
  ctx.font = "bold 40px Arial";
  const titleLines = wrapText(ctx, params.peliculaTitulo.toUpperCase(), width - margin * 2 - 80);
  for (const line of titleLines) {
    ctx.fillText(line, width / 2, y);
    y += 48;
  }
  y += 12;

  ctx.fillStyle = CINE_MUTED;
  ctx.font = "22px Arial";
  ctx.fillText(params.funcionLabel, width / 2, y);
  y += 56;

  const qrSize = 460;
  const qrPad = 24;
  const qrX = (width - qrSize) / 2;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(qrX - qrPad, y - qrPad, qrSize + qrPad * 2, qrSize + qrPad * 2);
  ctx.drawImage(qr, qrX, y, qrSize, qrSize);
  y += qrSize + qrPad * 2 + 50;

  ctx.fillStyle = CINE_TEXT;
  ctx.font = "bold 28px Arial";
  ctx.fillText(seatLabel(params.seatId), width / 2, y);
  y += 42;

  ctx.fillStyle = CINE_MUTED;
  ctx.font = "18px monospace";
  ctx.fillText(params.codigo, width / 2, y);
  y += 50;

  ctx.strokeStyle = CINE_BORDER;
  ctx.beginPath();
  ctx.moveTo(margin + 60, y);
  ctx.lineTo(width - margin - 60, y);
  ctx.stroke();
  y += 40;

  ctx.fillStyle = CINE_MUTED;
  ctx.font = "16px Arial";
  ctx.fillText("Pase único e intransferible. Presenta este código en taquilla.", width / 2, y);
  y += 34;

  ctx.fillStyle = CINE_RED;
  ctx.font = "bold 17px Arial";
  ctx.fillText(SITE_DOMAIN, width / 2, y);

  // Footer: marcas (Netflix, casa productora, desarrollador) en columnas
  // fijas -- etiqueta arriba, logo centrado debajo. Evita tener que sumar
  // anchos de texto e imagen a mano (eso fue lo que causaba encimados).
  const footerSpanLeft = margin + 60;
  const footerSpanRight = width - margin - 60;
  const colW = (footerSpanRight - footerSpanLeft) / 3;
  const footerTop = height - margin - 106;

  ctx.strokeStyle = CINE_BORDER;
  ctx.beginPath();
  ctx.moveTo(footerSpanLeft, footerTop);
  ctx.lineTo(footerSpanRight, footerTop);
  ctx.stroke();

  const footerGroups = [
    { label: "DISPONIBLE EN", img: netflixLogo, h: 26 },
    { label: "", img: dracoLogo, h: 44 },
    { label: "DESARROLLADO POR", img: notcoreLogo, h: 32 },
  ];

  const labelY = footerTop + 30;
  const logoCenterY = footerTop + 70;

  footerGroups.forEach((g, i) => {
    const colCenterX = footerSpanLeft + colW * i + colW / 2;

    if (g.label) {
      ctx.fillStyle = CINE_MUTED;
      ctx.font = "bold 13px Arial";
      ctx.fillText(g.label, colCenterX, labelY);
    }

    const logoW = g.h * (g.img.width / g.img.height);
    ctx.drawImage(g.img, colCenterX - logoW / 2, logoCenterY - g.h / 2, logoW, g.h);
  });

  return canvas;
}

export async function downloadTicketImage(params: TicketImageParams): Promise<void> {
  const canvas = await renderTicketCanvas(params);
  const dataUrl = canvas.toDataURL("image/png");

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `pase-cinerejon-${params.codigo}.png`;
  link.click();
}
