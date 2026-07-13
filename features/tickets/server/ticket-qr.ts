import "server-only";
import QRCode from "qrcode";

export async function generateTicketQRBuffer(secureToken: string): Promise<Buffer> {
  return QRCode.toBuffer(`IBPA-TICKET:${secureToken}`, {
    type: "png",
    width: 300,
    margin: 2,
    color: {
      dark: "#252a2d",
      light: "#ffffff",
    },
  });
}

export async function generateTicketQRDataUrl(secureToken: string): Promise<string> {
  return QRCode.toDataURL(`IBPA-TICKET:${secureToken}`, {
    type: "image/png",
    width: 300,
    margin: 2,
    color: {
      dark: "#252a2d",
      light: "#ffffff",
    },
  });
}
