
export const hexToRgb = (hex: string) => {
  if (!hex || typeof hex !== 'string') return { r: 255, g: 255, b: 255 };
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const normalizedHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalizedHex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 };
};

export const rgbToHex = (r: number, g: number, b: number) => {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  return "#" + ((1 << 24) + (clamp(r) << 16) + (clamp(g) << 8) + clamp(b)).toString(16).slice(1);
};

export const lerpHex = (c1: string, c2: string, t: number) => {
  const color1 = hexToRgb(c1);
  const color2 = hexToRgb(c2);
  const r = color1.r + (color2.r - color1.r) * t;
  const g = color1.g + (color2.g - color1.g) * t;
  const b = color1.b + (color2.b - color1.b) * t;
  return rgbToHex(r, g, b);
};
