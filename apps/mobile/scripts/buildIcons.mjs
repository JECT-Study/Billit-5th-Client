#!/usr/bin/env node
/**
 * Figma 아이콘 덤프(icons.figma.json) → SVG 원본 + 아이콘 export (index.ts)
 *
 * 사용법 (apps/mobile 기준):
 *   node scripts/buildIcons.mjs
 *
 * 하는 일
 *   1. Figma 이름 → 코드 이름 (아래 "이름 규칙", 예외는 NAME_OVERRIDES)
 *   2. 흰 배경·전체 영역 clip-path 제거, 아이콘 색 → currentColor
 *   3. assets/icons/<name>.svg 저장 (앱이 실제로 쓰는 원본. react-native-svg-transformer가 컴포넌트로 변환)
 *   4. src/shared/ui/icons/index.ts 생성: <Name>Icon = createIcon(svg, 기본 크기)
 *
 * 이름을 바꾸거나 아이콘을 제외하려면 생성 파일이 아니라 아래 설정을 수정하세요.
 */
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  unlinkSync,
} from 'node:fs';
import { join } from 'node:path';

const INPUT = process.argv[2] ?? 'src/shared/ui/icons/icons.figma.json';
const SVG_DIR = 'assets/icons';
const TSX_DIR = 'src/shared/ui/icons';
const GENERATED_MARK = '// 자동 생성 파일';

// ─── 설정 ───────────────────────────────────────────────────
// 규칙으로 만들 수 없는 이름 (key: Figma nodeId)
const NAME_OVERRIDES = {
  // 예: '2260:17065': 'clear',
};
// 아이콘으로 만들지 않는 것 (key: Figma nodeId)
const EXCLUDE = {
  '2260:17140':
    '체크박스 UI (흰 배경 + 회색 테두리). shared/ui의 Checkbox 컴포넌트로 구현',
  '2260:17166': 'icon_camera_fill 2와 완전히 같은 SVG',
};
// currentColor로 바꾸는 아이콘 색. 그 외 색은 고정 색으로 남기고 경고
const INK_COLORS = new Set(['#292C2D', '#616367', 'BLACK', '#000000']);

// ─── 이름 규칙 ──────────────────────────────────────────────
// "majesticons:receipt-text-line" → "receipt-text-line"   (아이콘 세트 접두어 제거)
// "invite/icon_camera_fill 2"     → "camera-fill"          (경로·icon_ 접두어·번호 제거)
// "caret_down_sm"                 → "caret-down-sm"
const toCodeName = (figmaName) =>
  figmaName
    .replace(/^[\w-]+:/, '')
    .replace(/^.*\//, '')
    .replace(/^icon_/, '')
    .replace(/\s+\d+$/, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .toLowerCase();

// ─── SVG 정리 ───────────────────────────────────────────────
const warnings = [];
const cleanSvg = (svg, name) => {
  let s = svg.replace(/\s+xmlns(:xlink)?="[^"]*"/g, '');

  // Figma 바깥/안쪽 선: <use>로 같은 path를 칠하고, 선은 mask로 잘라 냄
  // 선 색과 칠 색이 같으면 mask 없이 그려도 모양이 같으므로 풀어서 일반 path로 바꿈
  if (/<use /.test(s)) {
    const defs = Object.fromEntries(
      [...s.matchAll(/<path id="([^"]+)"([^>]*?)\/>/g)].map(([, id, attrs]) => [
        id,
        attrs,
      ]),
    );
    const colors = new Set(
      [...s.matchAll(/(?:fill|stroke)="(#[0-9A-Fa-f]{3,8})"/g)].map(([, c]) =>
        c.toUpperCase(),
      ),
    );
    if (colors.size > 1)
      throw new Error(
        `${name}: 선 색과 칠 색이 다른 mask 선은 지원하지 않음 (Figma에서 Outline stroke 해 주세요)`,
      );
    s = s.replace(/<mask id="stroke[^"]*"[\s\S]*?<\/mask>/g, '');
    s = s.replace(/<use xlink:href="#([^"]+)"([^>]*)\/>/g, (_, id, rest) => {
      if (!defs[id])
        throw new Error(`${name}: <use>가 가리키는 path(${id})가 없음`);
      return `<path${defs[id]}${rest}/>`;
    });
    s = s.replace(/ mask="url\(#stroke[^)]+\)"/g, '');
  }
  // 아이콘 영역 전체를 덮는 mask (자르는 것이 없으므로 제거)
  s = s.replace(
    /<mask id="([^"]+)"[^>]*x="0" y="0" width="(\d+)" height="\2"[^>]*><rect width="\2" height="\2" fill="[^"]+"\/><\/mask><g mask="url\(#\1\)">([\s\S]*?)<\/g>/g,
    '$3',
  );
  s = s.replace(/<g clip-path="url\(#[^)]+\)">([\s\S]*?)<\/g>/g, '$1');
  s = s.replace(/<defs>[\s\S]*?<\/defs>/g, '');
  // 아이콘 영역 전체를 덮는 흰 배경 제거
  s = s.replace(/<rect width="(\d+)" height="\1" fill="white"\/>/g, '');
  if (/clip-path=|<defs>|<mask|Gradient|<image|<text/.test(s))
    throw new Error(
      `${name}: 지원하지 않는 SVG 요소 (clip/mask/gradient/image/text)`,
    );

  // 한 가지 색으로만 그린 아이콘은 그 색이 무엇이든 currentColor로 (색은 쓰는 곳에서 color로 지정)
  const colorRe = /(fill|stroke)="(#[0-9A-Fa-f]{3,8}|white|black)"/g;
  const singleColor =
    new Set([...s.matchAll(colorRe)].map(([, , c]) => c.toUpperCase())).size ===
    1;
  const fixed = new Set();
  s = s.replace(colorRe, (_, attr, color) => {
    if (singleColor || INK_COLORS.has(color.toUpperCase()))
      return `${attr}="currentColor"`;
    fixed.add(color);
    return `${attr}="${color}"`;
  });
  if (fixed.size)
    warnings.push(`${name}: 고정 색 유지 (${[...fixed].join(', ')})`);
  return s.replace(/></g, '>\n<').trim() + '\n';
};

// react-native-svg가 지원하는 태그
const ALLOWED_TAGS = new Set([
  'svg',
  'g',
  'path',
  'rect',
  'circle',
  'ellipse',
  'line',
  'polyline',
  'polygon',
]);

// ─── 실행 ───────────────────────────────────────────────────
const src = JSON.parse(readFileSync(INPUT, 'utf8'));
mkdirSync(SVG_DIR, { recursive: true });
mkdirSync(TSX_DIR, { recursive: true });

// 이전 생성물 정리 (이름이 바뀌거나 빠진 아이콘이 남지 않도록)
// *Icon.tsx는 예전 방식(react-native-svg 코드 생성)의 결과물. 남아 있으면 지움
for (const f of readdirSync(TSX_DIR)) {
  const path = join(TSX_DIR, f);
  if (
    f.endsWith('Icon.tsx') &&
    readFileSync(path, 'utf8').startsWith(GENERATED_MARK)
  )
    unlinkSync(path);
}
for (const f of readdirSync(SVG_DIR))
  if (f.endsWith('.svg')) unlinkSync(join(SVG_DIR, f));

const pascal = (name) =>
  name
    .split('-')
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join('');

const built = [];
const skipped = [];
const seen = new Map();
for (const icon of src.icons) {
  if (EXCLUDE[icon.nodeId]) {
    skipped.push(`${icon.figmaName}: ${EXCLUDE[icon.nodeId]}`);
    continue;
  }
  const name = NAME_OVERRIDES[icon.nodeId] ?? toCodeName(icon.figmaName);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name))
    throw new Error(
      `코드 이름이 kebab-case가 아님: "${icon.figmaName}" → "${name}" (NAME_OVERRIDES에 추가하세요)`,
    );
  if (seen.has(name))
    throw new Error(
      `이름 충돌: "${icon.figmaName}"와 "${seen.get(name)}" → "${name}" (NAME_OVERRIDES나 EXCLUDE에 추가하세요)`,
    );
  seen.set(name, icon.figmaName);

  const svg = cleanSvg(icon.svg, name);
  // react-native-svg가 그릴 수 있는 태그만 허용 (svg-transformer가 그대로 컴포넌트로 바꿈)
  for (const [, tag] of svg.matchAll(/<(\w+)[\s>]/g))
    if (!ALLOWED_TAGS.has(tag))
      throw new Error(`${name}: 지원하지 않는 태그 <${tag}>`);
  const [, w, h] =
    svg.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/) ?? [];
  if (!w || w !== h)
    throw new Error(`${name}: 정사각형이 아닌 아이콘 (${w}x${h})`);
  writeFileSync(join(SVG_DIR, `${name}.svg`), svg);

  built.push({
    name,
    component: `${pascal(name)}Icon`,
    size: Number(w),
    figma: `${icon.figmaName} (${icon.nodeId})`,
  });
}

built.sort((a, b) => a.component.localeCompare(b.component));
writeFileSync(
  join(TSX_DIR, 'index.ts'),
  `${GENERATED_MARK}: 직접 수정하지 마세요. (scripts/buildIcons.mjs)
// SVG 원본: assets/icons/*.svg (react-native-svg-transformer가 컴포넌트로 바꿔 줌)
${built.map((b) => `import ${b.component.replace(/Icon$/, 'Svg')} from '@/assets/icons/${b.name}.svg';`).join('\n')}

import { createIcon } from './CreateIcon';

${built.map((b) => `export const ${b.component} = createIcon(${b.component.replace(/Icon$/, 'Svg')}, ${b.size}, '${b.component}'); // ${b.figma}`).join('\n')}

export type { IconProps } from './types';
`,
);

for (const s of skipped) console.log(`⏭️  제외: ${s}`);
for (const w of warnings) console.log(`⚠️  ${w}`);
console.log(
  `✅ 아이콘 ${built.length}개 생성 (덤프 ${src.icons.length}개, 제외 ${skipped.length}개)`,
);
