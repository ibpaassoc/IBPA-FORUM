import "server-only";
import QRCode from "qrcode";

export async function generateTicketQRDataUrl(secureToken: string): Promise<string> {
  return QRCode.toDataURL(`IBPA-TICKET:${secureToken}`, {
    width: 300,
    margin: 2,
    color: {
      dark: "#252a2d",
      light: "#ffffff",
    },
  });
}
