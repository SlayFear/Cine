import QRCode from "qrcode";

export async function generateQrPngBuffer(text: string): Promise<Buffer> {
  return QRCode.toBuffer(text, { type: "png", margin: 1, width: 320 });
}

export async function generateQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, { margin: 1, width: 320 });
}
