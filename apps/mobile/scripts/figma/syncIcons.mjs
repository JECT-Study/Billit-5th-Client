#!/usr/bin/env node
/**
 * Figma REST API로 아이콘 섹션을 SVG로 받아 icons.figma.json을 갱신하고 buildIcons.mjs를 실행
 *
 * 사용법 (apps/mobile 기준, Node 18+):
 *   FIGMA_TOKEN=figd_xxx node scripts/figma/syncIcons.mjs
 *   또는 .env.local에 FIGMA_TOKEN을 넣고 `node --env-file=.env.local scripts/figma/syncIcons.mjs`
 *
 * 토큰: Figma > Settings > Security > Personal access tokens
 *   - 스코프는 "File content: Read-only"만 체크
 *   - 앱 코드에서 쓰는 값이 아니므로 EXPO_PUBLIC_ 접두어를 붙이지 말 것 (번들에 포함됨)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

// ─── 설정 ───────────────────────────────────────────────────
// 아이콘이 라이브러리 파일로 옮겨지면 여기만 바꾸면 됨
const FILE_KEY = 'E1ACpAmbHMjk3CNT0uMczu'; // 3팀_내부공유용
const ICON_SECTION_ID = '2260:17032'; //      comp > 01 · 아이콘 및 에셋 > icon
// 섹션 밖에 있지만 화면에서 쓰는 아이콘 (예: 라이브러리 원격 컴포넌트를 쓰는 인스턴스)
const EXTRA_NODE_IDS = [];
const OUTPUT = 'src/shared/ui/icons/icons.figma.json';
const BATCH_SIZE = 50; // /v1/images 한 번에 요청할 노드 수

const API = 'https://api.figma.com/v1';
const TOKEN = process.env.FIGMA_TOKEN;
if (!TOKEN) {
  console.error(
    'FIGMA_TOKEN 환경 변수가 없습니다. (Figma > Settings > Security > Personal access tokens)',
  );
  process.exit(1);
}

const figma = async (path) => {
  const res = await fetch(`${API}${path}`, {
    headers: { 'X-Figma-Token': TOKEN },
  });
  if (res.status === 429)
    throw new Error(
      `요청 한도 초과 (429). ${res.headers.get('retry-after') ?? '잠시'}초 뒤 다시 실행하세요.`,
    );
  if (!res.ok)
    throw new Error(`Figma API ${res.status}: ${path}\n${await res.text()}`);
  return res.json();
};

// 1. 아이콘 목록: 섹션 바로 아래 컴포넌트 + 추가 노드
const { nodes } = await figma(
  `/files/${FILE_KEY}/nodes?ids=${encodeURIComponent([ICON_SECTION_ID, ...EXTRA_NODE_IDS].join(','))}&depth=1`,
);
const section = nodes[ICON_SECTION_ID]?.document;
if (!section) throw new Error(`아이콘 섹션을 찾을 수 없음: ${ICON_SECTION_ID}`);

const targets = [
  ...section.children.filter((n) => n.type === 'COMPONENT'),
  ...EXTRA_NODE_IDS.map((id) => nodes[id]?.document).filter(Boolean),
].map((n) => ({ nodeId: n.id, figmaName: n.name }));
console.log(`아이콘 ${targets.length}개 발견`);

// 2. SVG 렌더링 URL 받기 (한 번에 여러 노드)
const urls = {};
for (let i = 0; i < targets.length; i += BATCH_SIZE) {
  const ids = targets
    .slice(i, i + BATCH_SIZE)
    .map((t) => t.nodeId)
    .join(',');
  const { err, images } = await figma(
    `/images/${FILE_KEY}?ids=${encodeURIComponent(ids)}&format=svg&svg_include_id=false&svg_outline_text=true&svg_simplify_stroke=true`,
  );
  if (err) throw new Error(`SVG 렌더링 실패: ${err}`);
  Object.assign(urls, images);
}

// 3. SVG 내려받기 (URL은 임시 주소라 바로 받아야 함)
const icons = [];
for (const t of targets) {
  const url = urls[t.nodeId];
  if (!url) throw new Error(`SVG를 만들지 못함: ${t.figmaName} (${t.nodeId})`);
  const svg = await (await fetch(url)).text();
  icons.push({
    ...t,
    svg: svg
      .replace(/ xmlns="http:\/\/www.w3.org\/2000\/svg"/, '')
      .replace(/\n/g, ''),
    ...(EXTRA_NODE_IDS.includes(t.nodeId) && { outsideSection: true }),
  });
}

// 4. 이전 덤프와 비교해서 바뀐 점 출력
let prev = [];
try {
  prev = JSON.parse(readFileSync(OUTPUT, 'utf8')).icons;
} catch {}
const prevById = new Map(prev.map((i) => [i.nodeId, i]));
const nextIds = new Set(icons.map((i) => i.nodeId));
const added = icons
  .filter((i) => !prevById.has(i.nodeId))
  .map((i) => i.figmaName);
const removed = prev
  .filter((i) => !nextIds.has(i.nodeId))
  .map((i) => i.figmaName);
const renamed = icons
  .filter(
    (i) =>
      prevById.has(i.nodeId) &&
      prevById.get(i.nodeId).figmaName !== i.figmaName,
  )
  .map((i) => `${prevById.get(i.nodeId).figmaName} → ${i.figmaName}`);
const changed = icons
  .filter((i) => prevById.has(i.nodeId) && prevById.get(i.nodeId).svg !== i.svg)
  .map((i) => i.figmaName);
if (added.length) console.log(`➕ 추가: ${added.join(', ')}`);
if (removed.length)
  console.log(
    `⚠️  삭제 (코드에서 사용 중인지 확인 필요): ${removed.join(', ')}`,
  );
if (renamed.length)
  console.log(
    `✏️  이름 변경 (컴포넌트 이름이 바뀔 수 있음): ${renamed.join(', ')}`,
  );
if (changed.length) console.log(`🔄 모양 변경: ${changed.join(', ')}`);

writeFileSync(
  OUTPUT,
  JSON.stringify(
    {
      meta: {
        source: `Figma REST API (${FILE_KEY}, node ${ICON_SECTION_ID})`,
        fileKey: FILE_KEY,
        sectionNodeId: ICON_SECTION_ID,
        dumpedAt: new Date().toISOString().slice(0, 10),
        note: 'scripts/figma/syncIcons.mjs로 생성. 직접 수정하지 마세요.',
      },
      icons,
    },
    null,
    2,
  ) + '\n',
);

// 5. 컴포넌트 생성
execFileSync('node', ['scripts/buildIcons.mjs'], { stdio: 'inherit' });
