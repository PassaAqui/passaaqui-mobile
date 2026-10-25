const PNG_DATA_URI_PREFIX = "data:image/png;base64,";

export function buildQrCodeUri(qrCodeBase64?: string | null): string | null {
  const value = qrCodeBase64?.trim();

  if (!value) return null;

  return value.startsWith("data:") ? value : `${PNG_DATA_URI_PREFIX}${value}`;
}
