import path from "node:path";
import nodemailer from "nodemailer";
import { generateQrPngBuffer } from "./qrcode";
import { getSiteUrl, invitationUrlFor } from "./serial";
import { formatVenueDate, formatVenueTime } from "./timezone";
import { getSeatById } from "./seatLayout";
import {
  EVENT_NETFLIX_RELEASE_LABEL,
  EVENT_PRIVACY_NOTE,
  EVENT_SUBTITLE,
  EVENT_VENUE_CITY,
  EVENT_VENUE_NAME,
} from "./eventConfig";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error("Faltan variables de entorno SMTP_*");
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 20_000,
    logger: true,
    debug: true,
  });

  return transporter;
}

export interface ConfirmationEmailParams {
  to: string;
  guestName: string;
  peliculaTitulo: string;
  funcionOrden: number;
  funcionFechaHora: Date;
  seatId: string;
  codigo: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function seatLabel(seatId: string): string {
  const seat = getSeatById(seatId);
  return seat ? `Fila ${seat.rowLabel}, Asiento ${seat.seatNumber}` : seatId;
}

/**
 * Arma el HTML del correo de confirmacion. Separado de sendConfirmationEmail
 * para poder generar un preview sin tocar SMTP.
 */
export function buildConfirmationEmailHtml(params: ConfirmationEmailParams): string {
  const siteUrl = getSiteUrl();
  const heroBg = "cid:hero-bg";
  const footerBg = "cid:footer-bg";
  const netflixLogo = "cid:netflix-logo";
  const dracoLogo = "cid:draco-logo";
  const notcoreLogo = "cid:notcore-logo";

  const guestName = escapeHtml(params.guestName);
  const peliculaTitulo = escapeHtml(params.peliculaTitulo);
  const fecha = formatVenueDate(params.funcionFechaHora);
  const hora = formatVenueTime(params.funcionFechaHora);
  const seat = seatLabel(params.seatId);
  const verEnNavegador = `${siteUrl}/confirmacion/${encodeURIComponent(params.codigo)}`;
  const year = new Date().getFullYear();

  const metaRow = (icon: string, label: string, lines: string[]) => `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
      <tr>
        <td valign="top" style="padding-right:10px;font-size:15px;line-height:1;">${icon}</td>
        <td>
          <p style="margin:0 0 2px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:bold;letter-spacing:1.5px;color:#8a8a8a;">${label}</p>
          ${lines
            .map(
              (line) =>
                `<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;color:#f2f2f2;">${line}</p>`
            )
            .join("")}
        </td>
      </tr>
    </table>`;

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="dark" />
<title>Tu pase - ${peliculaTitulo}</title>
<style>
  body, table, td { margin:0; padding:0; }
  img { border:0; outline:none; text-decoration:none; }
  a { text-decoration:none; }
  p { word-wrap:break-word; overflow-wrap:break-word; }
  @media only screen and (max-width:600px) {
    .container { width:100% !important; }
    .px { padding-left:20px !important; padding-right:20px !important; }
    .hero-title { font-size:32px !important; }
    .pass-col { display:block !important; width:100% !important; }
    .pass-divider { display:none !important; }
    .pass-col-right { padding-top:20px !important; margin-top:4px; border-top:1px solid #262626; }
    .footer-col { display:block !important; width:100% !important; padding:0 0 22px !important; text-align:center !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#000000;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Tu pase personal para ${peliculaTitulo} — ${seat}, ${fecha}.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;">
    <tr>
      <td align="center" style="padding:20px 10px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" class="container" style="width:600px;max-width:600px;background-color:#111111;border:1px solid #262626;border-radius:14px;overflow:hidden;">

          <!-- barra superior -->
          <tr>
            <td class="px" style="padding:14px 24px;background-color:#0a0a0a;border-bottom:1px solid #262626;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#8a8a8a;">
                    Este correo contiene tu pase personal. No lo compartas.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- hero -->
          <tr>
            <td background="${heroBg}" style="background-image:url('${heroBg}');background-size:cover;background-position:center 17%;background-color:#0a0a0a;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(180deg, rgba(8,8,8,0.6) 0%, rgba(8,8,8,0.35) 45%, rgba(6,6,6,0.9) 100%);">
                <tr>
                  <td class="px" style="padding:34px 24px 26px;">
                    <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:3px;color:#e50914;">FUNCIÓN EXCLUSIVA</p>
                    <p class="hero-title" style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:46px;font-weight:900;line-height:0.98;letter-spacing:-1px;color:#f5f5f0;">${peliculaTitulo.toUpperCase()}</p>
                    <p style="margin:0 0 22px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:2px;color:#c7c7c7;text-transform:uppercase;">${escapeHtml(EVENT_SUBTITLE)}</p>
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#f2f2f2;">
                      SOLO EN&nbsp;&nbsp;<img src="${netflixLogo}" width="64" height="19" alt="Netflix" style="vertical-align:middle;" />&nbsp;&nbsp;|&nbsp;&nbsp;${EVENT_NETFLIX_RELEASE_LABEL.toUpperCase()}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- saludo -->
          <tr>
            <td class="px" style="padding:28px 24px 18px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 6px;font-size:20px;font-weight:bold;color:#f2f2f2;">Hola, <span style="color:#e50914;">${guestName}</span></p>
              <p style="margin:0;font-size:13px;line-height:1.6;color:#a8a8a8;">
                Tu invitación ha sido confirmada.<br />
                Aquí está tu pase personal para la función exclusiva de ${peliculaTitulo}.
              </p>
            </td>
          </tr>

          <!-- pase -->
          <tr>
            <td class="px" style="padding:6px 24px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="table-layout:fixed;border:1px solid #2a2a2a;border-radius:12px;background-color:#161616;">
                <tr>
                  <td class="pass-col" width="56%" valign="top" style="padding:24px;">
                    <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:2px;color:#e50914;">TU PASE PERSONAL</p>
                    <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#a8a8a8;">Presenta este código QR el día del evento para acceder a la premiere.</p>
                    <img src="cid:qr-code" width="176" height="176" alt="Código QR" style="display:block;max-width:100%;height:auto;border:6px solid #ffffff;border-radius:8px;" />
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                      <tr>
                        <td valign="top" style="padding-right:8px;font-size:13px;">🔒</td>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.5;color:#8a8a8a;">
                          Pase único e intransferible<br />Este código es válido para 1 persona.
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td class="pass-divider" width="1" style="background-color:#2a2a2a;font-size:0;line-height:0;">&nbsp;</td>
                  <td class="pass-col pass-col-right" width="44%" valign="top" style="padding:24px;">
                    ${metaRow("📅", "FECHA", [fecha])}
                    ${metaRow("🕐", "HORA", [hora])}
                    ${metaRow("📍", "LUGAR", [EVENT_VENUE_NAME, EVENT_VENUE_CITY])}
                    ${metaRow("⭐", "EVENTO", [`<span style="color:#e50914;">Función Exclusiva</span>`, escapeHtml(EVENT_PRIVACY_NOTE)])}
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:bold;letter-spacing:1px;color:#8a8a8a;">ASIENTO</p>
                    <p style="margin:2px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;color:#f2f2f2;">${escapeHtml(seat)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- importante -->
          <tr>
            <td class="px" style="padding:26px 24px 28px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 12px;font-size:12px;font-weight:bold;letter-spacing:1.5px;color:#f2f2f2;">
                <span style="color:#e50914;">I</span>MPORTANTE
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr><td style="padding:0 0 8px;font-size:13px;line-height:1.5;color:#a8a8a8;">• Llega 30 minutos antes de la función.</td></tr>
                <tr><td style="padding:0 0 8px;font-size:13px;line-height:1.5;color:#a8a8a8;">• Tu pase QR es único y no puede ser transferido.</td></tr>
                <tr><td style="padding:0 0 8px;font-size:13px;line-height:1.5;color:#a8a8a8;">• Capturas de pantalla no serán válidas.</td></tr>
                <tr><td style="padding:0;font-size:13px;line-height:1.5;color:#a8a8a8;">• Mantén tu código visible al ingresar.</td></tr>
              </table>
            </td>
          </tr>

          <!-- footer -->
          <tr>
            <td background="${footerBg}" style="background-image:url('${footerBg}');background-size:cover;background-position:center;background-color:#050505;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(180deg, rgba(5,5,5,0.35) 0%, rgba(5,5,5,0.85) 45%, rgba(3,3,3,0.97) 100%);">
                <tr>
                  <td class="px" style="padding:40px 24px 22px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td class="footer-col" width="50%" align="center" valign="top" style="padding-bottom:20px;">
                          <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:bold;letter-spacing:1.5px;color:#9a9a9a;">DISPONIBLE EN</p>
                          <img src="${netflixLogo}" width="76" height="23" alt="Netflix" />
                        </td>
                        <td class="footer-col" width="50%" align="center" valign="middle" style="padding-bottom:20px;">
                          <img src="${dracoLogo}" width="130" height="40" alt="Draco Films" />
                        </td>
                      </tr>
                    </table>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(255,255,255,0.12);margin-top:6px;">
                      <tr>
                        <td align="center" style="padding-top:18px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#8a8a8a;">
                          <a href="https://notcore.com.mx/" target="_blank" style="color:#8a8a8a;text-decoration:none;">
                            Desarrollado por&nbsp;&nbsp;<img src="${notcoreLogo}" width="28" height="20" alt="NotCore" style="vertical-align:middle;" />
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Envia el correo de confirmacion con el QR embebido. Nunca lanza: si algo
 * falla (SMTP mal configurado, proveedor caido, etc.) regresa false para que
 * la reservacion, que ya quedo guardada, no se vea afectada.
 */
export async function sendConfirmationEmail(params: ConfirmationEmailParams): Promise<boolean> {
  try {
    const qrBuffer = await generateQrPngBuffer(invitationUrlFor(params.codigo));
    const imgDir = path.join(process.cwd(), "public", "img");

    const info = await getTransporter().sendMail({
      from: process.env.SMTP_USER,
      to: params.to,
      subject: `Tu lugar en ${params.peliculaTitulo} esta confirmado`,
      html: buildConfirmationEmailHtml(params),
      attachments: [
        {
          filename: "qr.png",
          content: qrBuffer,
          cid: "qr-code",
        },
        {
          filename: "hero.jpg",
          path: path.join(imgDir, "lacaptura.jpg"),
          cid: "hero-bg",
        },
        {
          filename: "footer.png",
          path: path.join(imgDir, "Cine.png"),
          cid: "footer-bg",
        },
        {
          filename: "netflix.png",
          path: path.join(imgDir, "Logonetflix.png"),
          cid: "netflix-logo",
        },
        {
          filename: "draco.png",
          path: path.join(imgDir, "DracoFilmsN.png"),
          cid: "draco-logo",
        },
        {
          filename: "notcore.png",
          path: path.join(imgDir, "NCWhiteL.png"),
          cid: "notcore-logo",
        },
      ],
    });

    console.log("Correo de confirmacion enviado:", {
      to: params.to,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });

    return true;
  } catch (err) {
    console.error("No se pudo enviar el correo de confirmacion:", err);
    return false;
  }
}
