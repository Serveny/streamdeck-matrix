export type ColorImage = string;

export function createColorImage(colorHex: string, width = 72, height = 72) {
  const svg = `<svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><rect width="${width}" height="${height}" x="0" y="0" fill="${colorHex}" /></svg>`;
  return toBase64Image(svg);
}

function toBase64Image(svgString: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svgString)}`;
}
