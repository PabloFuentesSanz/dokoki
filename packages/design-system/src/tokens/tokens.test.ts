import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  renderTokensModule,
  TOKENS_JSON,
  TOKENS_TS,
  type TokensFile,
} from '../../scripts/generate-tokens';
import { colors, radii, spacing, touchTarget, typography } from './index';

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r = 0, g = 0, b = 0] = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

describe('tokens', () => {
  it('index.ts está generado desde tokens.json (ejecuta `npm run tokens` si falla)', () => {
    const json = JSON.parse(readFileSync(TOKENS_JSON, 'utf8')) as TokensFile;
    expect(readFileSync(TOKENS_TS, 'utf8')).toBe(renderTokensModule(json));
  });

  it('tiene los 18 colores del sistema y resuelve el alias de focus', () => {
    expect(Object.keys(colors)).toHaveLength(18);
    expect(colors.focus).toBe(colors.stampBlue);
  });

  it('usa la escala de espaciado 4·8·12·16·24·32·48·64 y los radios 0 / 3 / 999', () => {
    expect(Object.values(spacing)).toEqual([4, 8, 12, 16, 24, 32, 48, 64]);
    expect(radii).toEqual({ none: 0, sm: 3, round: 999 });
  });

  it('el objetivo táctil es 44 px y ningún texto baja de 11 px', () => {
    expect(touchTarget).toBe(44);
    for (const style of Object.values(typography))
      expect(style.fontSize).toBeGreaterThanOrEqual(11);
  });

  describe('contraste AA', () => {
    const papers = { paper: colors.paper, paperRaised: colors.paperRaised };
    const textColors = {
      ink: colors.ink,
      inkMuted: colors.inkMuted,
      stampRedText: colors.stampRedText,
      stampBlue: colors.stampBlue,
      oliveText: colors.oliveText,
      ochre: colors.ochre,
    };

    for (const [textName, text] of Object.entries(textColors)) {
      for (const [paperName, paper] of Object.entries(papers)) {
        it(`${textName} sobre ${paperName} ≥ 4,5:1`, () => {
          expect(contrast(text, paper)).toBeGreaterThanOrEqual(4.5);
        });
      }
    }

    it('on-stamp sobre stamp-red, stamp-blue e ink ≥ 4,5:1', () => {
      for (const fill of [colors.stampRed, colors.stampBlue, colors.ink]) {
        expect(contrast(colors.onStamp, fill)).toBeGreaterThanOrEqual(4.5);
      }
    });

    it('marcas no textuales (olive, stamp-red, focus) ≥ 3:1 sobre paper', () => {
      for (const mark of [colors.olive, colors.stampRed, colors.focus]) {
        expect(contrast(mark, colors.paper)).toBeGreaterThanOrEqual(3);
      }
    });

    it('ink-muted sobre paper-sunk ≥ 4,5:1 (pistas y zonas deshabilitadas)', () => {
      expect(contrast(colors.inkMuted, colors.paperSunk)).toBeGreaterThanOrEqual(4.5);
    });
  });
});
