#!/usr/bin/env node
/**
 * Figma 토큰 덤프(tokens.json) → theme.generated.ts 변환
 *
 * 사용법 (apps/mobile 기준):
 *   node scripts/buildTokens.mjs [입력 경로] [출력 경로]
 *   기본값: src/theme/tokens.json → src/theme/theme.generated.ts
 *
 * 이름을 바꾸고 싶으면 생성 파일이 아니라 아래 "설정"과 "이름 규칙"을 수정하세요.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const INPUT = process.argv[2] ?? 'src/theme/tokens.json';
const OUTPUT = process.argv[3] ?? 'src/theme/theme.generated.ts';

// ─── 설정 ───────────────────────────────────────────────────
const COLLECTIONS = {
  primitive: 'BILLIT · Color / Primitive v2',
  semantic: 'BILLIT · Color / Semantic v2',
  layout: 'BILLIT · System v2 / Layout',
};
// expo-font로 로드한 이름과 일치해야 함 ("SUIT/SemiBold" → "SUIT-SemiBold")
const fontFamilyName = (family, style) => `${family}-${style}`;
const SHADOW_NAME_MAP = { 'light sh': 'light', blur: 'inner-glow' };

// ─── 이름 규칙 ──────────────────────────────────────────────
// Primitive: color/sky/60 → sky-60, color/gray/008 → gray-8, color/white/alpha-90 → white-alpha-90
const primitiveKey = (name) =>
  name
    .replace(/^color\//, '')
    .split('/')
    .map((s) => s.replace(/^0+(?=\d)/, ''))
    .join('-');

// Semantic: 유틸리티 이름과 겹치는 그룹은 전용 테마 키로 보냄
//   color/text/muted      → TEXT_COLORS.muted       → className="text-muted"
//   color/border/focus    → BORDER_COLORS.focus     → className="border-focus"
//   color/surface/subtle  → COLORS['surface-subtle'] → className="bg-surface-subtle"
const semanticTarget = (name) => {
  const [group, ...rest] = name.replace(/^color\//, '').split('/');
  if (group === 'text') return ['TEXT_COLORS', rest.join('-')];
  if (group === 'border') return ['BORDER_COLORS', rest.join('-')];
  return ['COLORS', [group, ...rest].join('-')];
};

// ─── 유틸 ───────────────────────────────────────────────────
const toKebab = (s) =>
  s
    .trim()
    .replace(/[\s_/]+/g, '-')
    .toLowerCase();
const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
const byNumber = (obj) =>
  Object.fromEntries(
    Object.entries(obj).sort(([a], [b]) => Number(a) - Number(b)),
  );

// ─── 변환 ───────────────────────────────────────────────────
const src = JSON.parse(readFileSync(INPUT, 'utf8'));
const warnings = [];
const collection = (key) => {
  const c = src.variables[COLLECTIONS[key]];
  if (!c) throw new Error(`컬렉션 없음: ${COLLECTIONS[key]}`);
  return c.vars;
};

// alias 풀기: 이름으로 찾아서 실제 값이 나올 때까지 따라감
const allVars = Object.assign(
  {},
  ...Object.values(src.variables).map((c) => c.vars),
);
const resolve = (name, seen = []) => {
  const v = allVars[name];
  if (!v)
    throw new Error(
      `alias 대상 없음: ${name} (경로: ${[...seen, name].join(' → ')})`,
    );
  if (seen.includes(name))
    throw new Error(`alias 순환: ${[...seen, name].join(' → ')}`);
  return v.alias ? resolve(v.alias, [...seen, name]) : v.value;
};

const COLORS = {},
  TEXT_COLORS = {},
  BORDER_COLORS = {};
const targets = { COLORS, TEXT_COLORS, BORDER_COLORS };

// 1) Semantic (권장)
for (const name of Object.keys(collection('semantic'))) {
  const [target, key] = semanticTarget(name);
  targets[target][key] = resolve(name).toUpperCase();
}
// 2) Primitive (Figma 시안이 Paint Style로 primitive를 직접 쓰고 있어 함께 노출)
for (const name of Object.keys(collection('primitive'))) {
  const key = primitiveKey(name);
  if (COLORS[key]) warnings.push(`색 이름 충돌: ${key}`);
  COLORS[key] = resolve(name).toUpperCase();
}

// 간격·라운드
const SPACING = {},
  RADIUS = {};
for (const [name] of Object.entries(collection('layout'))) {
  const [group, key] = name.split('/');
  if (group === 'space') SPACING[key] = resolve(name);
  else if (group === 'radius') RADIUS[key] = resolve(name);
}

// 타이포그래피: % → RN 숫자, 굵기는 FONT_FAMILY로 분리
const FONT_SIZE = {},
  FONT_FAMILY = {};
for (const t of src.textStyles) {
  const [, category] = t.name.split('/'); // "Body 1"
  const key = toKebab(category); // body-1
  const entry = [
    t.fontSize,
    {
      lineHeight: Math.round((t.fontSize * t.lineHeightPercent) / 100),
      letterSpacing: round((t.fontSize * t.letterSpacingPercent) / 100),
    },
  ];
  if (
    FONT_SIZE[key] &&
    JSON.stringify(FONT_SIZE[key]) !== JSON.stringify(entry)
  )
    warnings.push(`타이포 수치 불일치: ${t.name}`);
  FONT_SIZE[key] = entry;

  const [family, style] = t.font.split('/');
  FONT_FAMILY[`${family}-${style}`.toLowerCase()] = fontFamilyName(
    family,
    style,
  ); // suit-semibold
}

// 그림자: RN 0.76+ boxShadow 문자열
const SHADOW = {};
for (const e of src.effectStyles) {
  const key = SHADOW_NAME_MAP[e.name] ?? toKebab(e.name);
  SHADOW[key] = e.effects
    .map(
      (f) =>
        `${f.type === 'INNER_SHADOW' ? 'inset ' : ''}${f.offset.x}px ${f.offset.y}px ${f.radius}px ${f.spread}px ${f.color}`,
    )
    .join(', ');
}

const tokens = {
  COLORS,
  TEXT_COLORS,
  BORDER_COLORS,
  SPACING: byNumber(SPACING),
  RADIUS: byNumber(RADIUS),
  FONT_SIZE,
  FONT_FAMILY,
  SHADOW,
};

// ─── 이전 결과와 비교 ───────────────────────────────────────
const flatten = (obj) =>
  Object.fromEntries(
    Object.entries(obj).flatMap(([g, items]) =>
      Object.entries(items).map(([k, v]) => [`${g}.${k}`, JSON.stringify(v)]),
    ),
  );
const next = flatten(tokens);
if (existsSync(OUTPUT)) {
  const line = readFileSync(OUTPUT, 'utf8')
    .split('\n')
    .find((l) => l.startsWith('// @snapshot '));
  if (line) {
    const prev = JSON.parse(line.slice('// @snapshot '.length));
    const removed = Object.keys(prev).filter((k) => !(k in next));
    const changed = Object.keys(prev).filter(
      (k) => k in next && prev[k] !== next[k],
    );
    const added = Object.keys(next).filter((k) => !(k in prev));
    if (removed.length)
      console.log(
        `⚠️  삭제된 토큰 ${removed.length}개 (코드에서 사용 중인지 확인 필요):\n  ${removed.join('\n  ')}`,
      );
    if (changed.length)
      console.log(
        `🔄 값이 바뀐 토큰 ${changed.length}개:\n  ${changed.join('\n  ')}`,
      );
    if (added.length) console.log(`➕ 추가된 토큰 ${added.length}개`);
    if (!removed.length && !changed.length && !added.length)
      console.log('변경 없음');
  }
}

// ─── 출력 ───────────────────────────────────────────────────
const lit = (v) => (typeof v === 'string' ? `'${v}'` : String(v));
const keyOf = (k) => (/^[a-zA-Z_$][\w$]*$/.test(k) ? k : `'${k}'`);
const serialize = (v, indent = '') => {
  if (Array.isArray(v))
    return `[${v.map((x) => serialize(x, indent)).join(', ')}]`;
  if (v && typeof v === 'object') {
    const inner = indent + '  ';
    const flat = Object.values(v).every((x) => typeof x !== 'object');
    if (flat && indent)
      return `{ ${Object.entries(v)
        .map(([k, x]) => `${keyOf(k)}: ${lit(x)}`)
        .join(', ')} }`;
    return `{\n${Object.entries(v)
      .map(([k, x]) => `${inner}${keyOf(k)}: ${serialize(x, inner)},`)
      .join('\n')}\n${indent}}`;
  }
  return lit(v);
};

writeFileSync(
  OUTPUT,
  `// 자동 생성 파일: 직접 수정하지 마세요.
// 원본: ${src.meta.source} (${src.meta.dumpedAt})
// 수정 방법: Figma 덤프 → tokens.json 갱신 → node scripts/buildTokens.mjs
// @snapshot ${JSON.stringify(next)}

${Object.entries(tokens)
  .map(([name, v]) => `export const ${name} = ${serialize(v)} as const;`)
  .join('\n\n')}
`,
);

for (const w of warnings) console.log(`⚠️  ${w}`);
console.log(`✅ ${OUTPUT} 생성 (${Object.keys(next).length}개 토큰)`);
