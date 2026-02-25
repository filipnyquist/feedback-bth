import QRCode from "react-qr-code";
import type { Translations } from "@/lib/i18n";

interface QRCodeDisplayProps {
  url: string;
  i18n: Translations;
}

export function QRCodeDisplay({ url, i18n }: QRCodeDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-xl border">
      <QRCode value={url} size={160} />
      <p className="text-xs text-muted-foreground text-center">{i18n.scanQR}</p>
    </div>
  );
}
