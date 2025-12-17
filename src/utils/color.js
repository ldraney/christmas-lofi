/**
 * Color utilities - HSB/HSL preferred for lofi aesthetics
 */

/**
 * Convert HSL to RGB hex
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {number} RGB hex value (e.g., 0xFF5500)
 */
export function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r, g, b;

  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  const ri = Math.round((r + m) * 255);
  const gi = Math.round((g + m) * 255);
  const bi = Math.round((b + m) * 255);

  return (ri << 16) | (gi << 8) | bi;
}

/**
 * Convert RGB hex to HSL
 * @param {number} hex - RGB hex value
 * @returns {{h: number, s: number, l: number}}
 */
export function hexToHsl(hex) {
  const r = ((hex >> 16) & 0xFF) / 255;
  const g = ((hex >> 8) & 0xFF) / 255;
  const b = (hex & 0xFF) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: l * 100 };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h;
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
    case g: h = ((b - r) / d + 2) / 6; break;
    case b: h = ((r - g) / d + 4) / 6; break;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Lerp between two hex colors
 * @param {number} color1 - Start color
 * @param {number} color2 - End color
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated hex color
 */
export function lerpColor(color1, color2, t) {
  const r1 = (color1 >> 16) & 0xFF;
  const g1 = (color1 >> 8) & 0xFF;
  const b1 = color1 & 0xFF;

  const r2 = (color2 >> 16) & 0xFF;
  const g2 = (color2 >> 8) & 0xFF;
  const b2 = color2 & 0xFF;

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return (r << 16) | (g << 8) | b;
}

/**
 * Create a muted/desaturated version of a color (lofi aesthetic)
 * @param {number} hex - Input color
 * @param {number} [amount=0.3] - How much to desaturate (0-1)
 */
export function muteColor(hex, amount = 0.3) {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex(h, s * (1 - amount), l);
}

/**
 * Shift hue of a color
 * @param {number} hex - Input color
 * @param {number} degrees - Degrees to shift (-360 to 360)
 */
export function shiftHue(hex, degrees) {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex((h + degrees + 360) % 360, s, l);
}

/**
 * Pre-defined lofi color palettes
 * Each palette has: dominant (70%), secondary (20%), accent (10%)
 */
export const palettes = {
  warmNight: {
    dominant: 0x2D2A4A,
    secondary: 0x4A3F6B,
    accent: 0xE8985E,
    weights: [0.7, 0.2, 0.1]
  },
  coolMorning: {
    dominant: 0x3D5A80,
    secondary: 0x98C1D9,
    accent: 0xEE6C4D,
    weights: [0.7, 0.2, 0.1]
  },
  forest: {
    dominant: 0x2D3A3A,
    secondary: 0x4A6B5D,
    accent: 0xD4A373,
    weights: [0.7, 0.2, 0.1]
  },
  sunset: {
    dominant: 0x3D2645,
    secondary: 0x832161,
    accent: 0xF9A03F,
    weights: [0.7, 0.2, 0.1]
  },
  christmas: {
    dominant: 0x0B1426,    // Deep night blue
    secondary: 0x1A3A52,   // Midnight blue
    accent: 0x2D5A4A,      // Deep pine green
    weights: [0.5, 0.3, 0.2]
  }
};

// Christmas-specific color collections
export const christmasColors = {
  // Sky gradient
  skyTop: 0x0B0B1A,        // Deep night
  skyMid: 0x0F1B3D,        // Dark blue
  skyBottom: 0x1A2744,     // Slightly lighter

  // Aurora colors
  aurora: [0x4FFFB0, 0x2DD4BF, 0x22D3EE, 0xA78BFA, 0xF472B6],

  // Tree colors
  treeDark: 0x1B4332,      // Dark pine
  treeMid: 0x2D5A4A,       // Pine green
  treeLight: 0x3D7A5A,     // Lighter pine

  // Snow
  snowWhite: 0xF0F8FF,     // Slightly blue-white
  snowShadow: 0xB8D4E8,    // Blue shadow

  // Warm lights
  lightGold: 0xFFD93D,     // Golden yellow
  lightWarm: 0xFFA94D,     // Warm orange
  lightRed: 0xFF6B6B,      // Red
  lightBlue: 0x74C0FC,     // Cool blue
  lightGreen: 0x69DB7C,    // Green
  lightPink: 0xF783AC,     // Pink
  lightPurple: 0xB197FC,   // Purple

  // Ornament colors
  ornaments: [0xFF6B6B, 0xFFD93D, 0x74C0FC, 0x69DB7C, 0xF783AC, 0xB197FC],

  // Star/sparkle
  starGold: 0xFFF3BF,      // Bright gold
  starWhite: 0xFFFFFF,     // Pure white

  // Moon
  moonGlow: 0xFFFACD,      // Lemon chiffon
  moonCore: 0xFFF8DC,      // Cornsilk
};

/**
 * Pick a color from a palette using weights
 */
export function pickFromPalette(palette) {
  const colors = [palette.dominant, palette.secondary, palette.accent];
  const r = Math.random();
  let sum = 0;
  for (let i = 0; i < colors.length; i++) {
    sum += palette.weights[i];
    if (r <= sum) return colors[i];
  }
  return colors[0];
}
