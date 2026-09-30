/**
 * Genera src/tokens/index.ts desde src/tokens/tokens.json (la fuente de verdad).
 *
 *   npm run tokens
 *
 * El test src/tokens/tokens.test.ts falla si index.ts no está al día con tokens.json.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

interface TokenEntry {
  name: string;
  value: string;
  usage: string;
}

interface TypeStyle {
  name: string;
  fontSize: string;
  lineHeight: string;
  fontWeight: number;
  usage: string;
}

export interface TokensFile {
  $source: string;
  color: { tokens: TokenEntry[] };
  type: {
    families: Record<string, string>;
    nativeFaces: Record<string, Record<string, string>>;
    groups: { name: string; family: string; styles: TypeStyle[] }[];
  };
  spacing: { tokens: TokenEntry[] };
  radius: { tokens: TokenEntry[] };
  shadow: { tokens: TokenEntry[] };
  tilt: { tokens: TokenEntry[] };
  opacity: { tokens: TokenEntry[] };
  size: { tokens: TokenEntry[] };
  breakpoint: { tokens: TokenEntry[] };
  motion: { tokens: TokenEntry[] };
}

const here = dirname(fileURLToPath(import.meta.url));
export const TOKENS_JSON = join(here, '../src/tokens/tokens.json');
export const TOKENS_TS = join(here, '../src/tokens/index.ts');

function camel(name: string): string {
  return name.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

function px(value: string): number {
  const match = /^(-?[\d.]+)(px|ms)?$/.exec(value);
  if (!match?.[1]) throw new Error(`Valor numérico no válido: ${value}`);
  return Number(match[1]);
}

function resolveColor(entries: TokenEntry[], value: string, seen: string[] = []): string {
  const alias = /^\{(.+)\}$/.exec(value)?.[1];
  if (!alias) return value;
  if (seen.includes(alias)) throw new Error(`Alias circular: ${[...seen, alias].join(' → ')}`);
  const target = entries.find((entry) => entry.name === alias);
  if (!target) throw new Error(`Alias a un color que no existe: ${alias}`);
  return resolveColor(entries, target.value, [...seen, alias]);
}

function block(doc: string, name: string, body: string, type = ''): string {
  return `/** ${doc} */\nexport const ${name}${type} = ${body} as const;\n`;
}

function record(entries: [string, string | number][], comments: string[] = []): string {
  const lines = entries.map(([key, value], i) => {
    const comment = comments[i] ? `  /** ${comments[i]} */\n` : '';
    const safeKey = /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);
    return `${comment}  ${safeKey}: ${JSON.stringify(value)},`;
  });
  return `{\n${lines.join('\n')}\n}`;
}

export function renderTokensModule(tokens: TokensFile): string {
  const colors = tokens.color.tokens;
  const out: string[] = [
    '// ARCHIVO GENERADO desde tokens.json con `npm run tokens`. No lo edites a mano.',
    `// Fuente: ${tokens.$source}`,
    '',
  ];

  out.push(
    block(
      'Colores. Solo modo claro. Texto sobre papel: ink, ink-muted, stamp-red-text, stamp-blue, olive-text, ochre.',
      'colors',
      record(
        colors.map((c) => [camel(c.name), resolveColor(colors, c.value)]),
        colors.map((c) => c.usage),
      ),
    ),
  );
  out.push('export type ColorToken = keyof typeof colors;\n');

  out.push(
    block(
      'Pilas CSS de cada familia (web, Storybook).',
      'fontStacks',
      record(Object.entries(tokens.type.families)),
    ),
  );

  const faces = Object.entries(tokens.type.nativeFaces).map(
    ([family, weights]) =>
      `  ${family}: ${record(Object.entries(weights)).replace(/\n/g, '\n  ')},`,
  );
  out.push(
    block(
      'Nombre de cada fuente cargada con expo-font (@expo-google-fonts), por familia y peso.',
      'fontFaces',
      `{\n${faces.join('\n')}\n}`,
    ),
  );

  const styles: string[] = [];
  for (const group of tokens.type.groups) {
    for (const style of group.styles) {
      const face = tokens.type.nativeFaces[group.family]?.[String(style.fontWeight)];
      if (!face) throw new Error(`Falta la fuente nativa de ${group.family} ${style.fontWeight}`);
      styles.push(
        `  /** ${style.usage} */\n  ${camel(style.name)}: { fontFamily: ${JSON.stringify(face)}, fontSize: ${px(style.fontSize)}, lineHeight: ${px(style.lineHeight)} },`,
      );
    }
  }
  out.push(
    block(
      'Escala tipográfica lista para StyleSheet. El peso va en la fuente (fontFamily), no en fontWeight: así funciona igual en Android.',
      'typography',
      `{\n${styles.join('\n')}\n}`,
    ),
  );
  out.push('export type TypographyToken = keyof typeof typography;\n');

  const scale = (entries: TokenEntry[], prefix: string): [string, number][] =>
    entries.map((e) => [e.name.replace(prefix, ''), px(e.value)]);

  out.push(
    block(
      'Escala de espaciado: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64.',
      'spacing',
      record(
        scale(tokens.spacing.tokens, 'space-'),
        tokens.spacing.tokens.map((t) => t.usage),
      ),
    ),
  );
  out.push(
    block(
      'Radios: 0 billetes y fotos, 3 px todo lo demás, 999 px solo avatares, sellos y captura.',
      'radii',
      record(
        scale(tokens.radius.tokens, 'radius-'),
        tokens.radius.tokens.map((t) => t.usage),
      ),
    ),
  );
  out.push(
    block(
      'Sombras como `boxShadow` (React Native 0.76+ y web).',
      'shadows',
      record(
        tokens.shadow.tokens.map((t) => [camel(t.name.replace('shadow-', '')), t.value]),
        tokens.shadow.tokens.map((t) => t.usage),
      ),
    ),
  );
  out.push(
    block(
      'Inclinaciones para piezas de papel. Nunca en texto ni en controles.',
      'tilts',
      record(
        tokens.tilt.tokens.map((t) => [camel(t.name.replace('tilt-', '')), t.value]),
        tokens.tilt.tokens.map((t) => t.usage),
      ),
    ),
  );
  out.push(
    block(
      'Opacidades.',
      'opacity',
      record(
        tokens.opacity.tokens.map((t) => [camel(t.name), Number(t.value)]),
        tokens.opacity.tokens.map((t) => t.usage),
      ),
    ),
  );

  const size = Object.fromEntries(tokens.size.tokens.map((t) => [t.name, px(t.value)]));
  out.push(
    `/** Objetivo táctil mínimo: 44 × 44 px. */\nexport const touchTarget = ${size['touch-target']};\n`,
  );
  out.push(
    block(
      'Tamaños de icono: 22 navegación, 18 botones, 14 etiquetas.',
      'iconSizes',
      record(
        tokens.size.tokens
          .filter((t) => t.name.startsWith('icon-'))
          .map((t) => [t.name.replace('icon-', ''), px(t.value)]),
      ),
    ),
  );
  out.push(
    block(
      'Puntos de corte: < 600 BottomNav, ≥ 600 SideNav, ≥ 1024 doble vista.',
      'breakpoints',
      record(
        tokens.breakpoint.tokens.map((t) => [camel(t.name), px(t.value)]),
        tokens.breakpoint.tokens.map((t) => t.usage),
      ),
    ),
  );
  out.push(
    block(
      'Duraciones en ms.',
      'motion',
      record(
        tokens.motion.tokens.map((t) => [camel(t.name.replace('duration-', '')), px(t.value)]),
        tokens.motion.tokens.map((t) => t.usage),
      ),
    ),
  );

  return `${out.join('\n').trimEnd()}\n`;
}

function main(): void {
  const tokens = JSON.parse(readFileSync(TOKENS_JSON, 'utf8')) as TokensFile;
  writeFileSync(TOKENS_TS, renderTokensModule(tokens));
  console.log(`tokens → ${TOKENS_TS}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
