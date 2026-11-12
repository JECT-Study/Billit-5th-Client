/**
 * Billit Token Exporter: Figma 안에서만 실행되는 팀 전용 개발 플러그인 (Node로 실행할 수 없음)
 *
 * 열려 있는 파일의 로컬 Variables 컬렉션과 텍스트·이펙트 스타일을 읽어
 * scripts/buildTokens.mjs가 읽는 tokens.json 형식으로 내보냅니다. 파일을 수정하지 않습니다.
 * 등록·사용 방법: scripts/figma/README.md
 */

const CONFIG = {
  // 토큰 원본 파일(3팀_내부공유용) 확인. 다른 파일에서 실행하면 내보내기를 막습니다.
  // 2026-11-12 디자인-산출물 라이브러리에서 이 파일로 토큰을 옮겼습니다.
  expectedFileKey: 'E1ACpAmbHMjk3CNT0uMczu',
  // 내보낼 Variables 컬렉션 (buildTokens.mjs의 COLLECTIONS와 같아야 함)
  collections: [
    'BILLIT · Color / Primitive v2',
    'BILLIT · Color / Semantic v2',
    'BILLIT · System v2 / Layout',
  ],
  // tokens.json meta.source에 남길 파일 이름 (fileKey → 이름)
  knownFiles: {
    E1ACpAmbHMjk3CNT0uMczu: '3팀_내부공유용',
    rJ8Jqb4PoKozJBx5TpVeWx: '디자인-산출물',
  },
  // 사용 여부를 확인할 영역. 내보내기 범위는 바꾸지 않고, 여기서 쓰지 않는 토큰을 결과 화면에 경고로만 보여 줍니다.
  usageScope: { id: '2260:16871', name: 'comp' }, // ui 페이지 > comp 섹션
};

// ─── 내보내기 (UI와 무관한 부분) ─────────────────────────────
async function exportTokens(config) {
  const warnings = [];
  const round = (n, d) => Math.round(n * 10 ** d) / 10 ** d;
  const toHex = (c) => {
    const hex = (v) =>
      Math.round(v * 255)
        .toString(16)
        .padStart(2, '0');
    const alpha = c.a !== undefined && c.a < 1 ? hex(c.a) : '';
    return `#${hex(c.r)}${hex(c.g)}${hex(c.b)}${alpha}`.toUpperCase();
  };

  const fileKey = figma.fileKey || null;
  if (config.expectedFileKey && fileKey !== config.expectedFileKey) {
    throw new Error(
      `토큰 원본 파일이 아닙니다. 지금 파일: ${figma.root.name} (${fileKey}). 원본 파일에서 실행하세요.`,
    );
  }

  // Variables
  const localCollections =
    await figma.variables.getLocalVariableCollectionsAsync();
  const missing = config.collections.filter(
    (name) => !localCollections.some((c) => c.name === name),
  );
  if (missing.length) {
    throw new Error(
      `컬렉션을 찾을 수 없습니다: ${missing.join(', ')}\n이 파일의 컬렉션: ${localCollections.map((c) => c.name).join(', ') || '(없음)'}`,
    );
  }

  const nameCache = new Map();
  const variableName = async (id) => {
    if (!nameCache.has(id)) {
      const v = await figma.variables.getVariableByIdAsync(id);
      nameCache.set(id, v ? v.name : null);
    }
    return nameCache.get(id);
  };
  const serializeValue = async (type, raw, where) => {
    if (raw && typeof raw === 'object' && raw.type === 'VARIABLE_ALIAS') {
      const name = await variableName(raw.id);
      if (!name)
        throw new Error(
          `${where}: alias 대상 변수를 찾을 수 없습니다 (${raw.id})`,
        );
      return { alias: name };
    }
    if (type === 'COLOR') return { value: toHex(raw) };
    if (type === 'FLOAT') return { value: round(raw, 4) };
    return { value: raw };
  };

  const variables = {};
  for (const name of config.collections) {
    const collection = localCollections.find((c) => c.name === name);
    const [firstMode, ...otherModes] = collection.modes;
    if (otherModes.length)
      warnings.push(
        `${name}: 모드가 ${collection.modes.length}개라 첫 모드(${firstMode.name}) 값을 value로, 전체를 valuesByMode에 넣었습니다.`,
      );

    const vars = {};
    for (const id of collection.variableIds) {
      const v = await figma.variables.getVariableByIdAsync(id);
      if (!v) continue;
      nameCache.set(v.id, v.name);
      const where = `${name} > ${v.name}`;
      const entry = {
        type: v.resolvedType,
        ...(await serializeValue(
          v.resolvedType,
          v.valuesByMode[firstMode.modeId],
          where,
        )),
      };
      if (otherModes.length) {
        entry.valuesByMode = {};
        for (const mode of collection.modes)
          entry.valuesByMode[mode.name] = await serializeValue(
            v.resolvedType,
            v.valuesByMode[mode.modeId],
            where,
          );
      }
      entry.codeSyntax = (v.codeSyntax && v.codeSyntax.WEB) || null;
      vars[v.name] = entry;
    }
    variables[name] = { modes: collection.modes.map((m) => m.name), vars };
  }

  // 텍스트 스타일: 줄 간격·자간은 % 단위로 통일
  const toPercent = (metric, fontSize, digits, styleName, label) => {
    if (metric.unit === 'PERCENT') return round(metric.value, digits);
    if (metric.unit === 'PIXELS')
      return round((metric.value / fontSize) * 100, digits);
    warnings.push(`${styleName}: ${label}이 AUTO라 값을 넣지 않았습니다.`);
    return null;
  };
  const textStyles = (await figma.getLocalTextStylesAsync()).map((s) => ({
    name: s.name,
    font: `${s.fontName.family}/${s.fontName.style}`,
    fontSize: s.fontSize,
    lineHeightPercent: toPercent(
      s.lineHeight,
      s.fontSize,
      1,
      s.name,
      '줄 간격',
    ),
    letterSpacingPercent: toPercent(
      s.letterSpacing,
      s.fontSize,
      2,
      s.name,
      '자간',
    ),
  }));

  // 이펙트 스타일: 그림자만
  const effectStyles = (await figma.getLocalEffectStylesAsync()).map((s) => ({
    name: s.name,
    effects: s.effects
      .filter(
        (e) =>
          e.visible !== false &&
          (e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW'),
      )
      .map((e) => ({
        type: e.type,
        color: toHex(e.color),
        offset: { x: e.offset.x, y: e.offset.y },
        radius: e.radius,
        spread: e.spread || 0,
      })),
  }));

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return {
    tokens: {
      meta: {
        source: `Figma ${(config.knownFiles && config.knownFiles[fileKey]) || figma.root.name}`,
        fileKey,
        dumpedAt: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
        exportedBy: 'scripts/figma/token-exporter',
        excludedCollections: localCollections
          .map((c) => c.name)
          .filter((n) => !config.collections.includes(n)),
      },
      variables,
      textStyles,
      effectStyles,
    },
    warnings,
  };
}

// ─── 사용 여부 확인 (tokens.json에는 영향 없음) ──────────────
// usageScope 안의 레이어가 쓰는 변수·스타일을 모아, 내보낸 토큰 중 쓰이지 않는 것을 돌려줍니다.
// semantic 변수가 가리키는 primitive 변수, 페인트 스타일에 연결된 변수도 사용한 것으로 칩니다.
async function findUnused(config, tokens) {
  const scope =
    config.usageScope && (await figma.getNodeByIdAsync(config.usageScope.id));
  if (!scope)
    return {
      error: `사용 여부를 확인할 영역(${config.usageScope ? config.usageScope.name : '없음'})을 찾을 수 없습니다.`,
    };
  let page = scope;
  while (page && page.type !== 'PAGE') page = page.parent;
  if (page) await page.loadAsync();

  const usedVarIds = new Set();
  const usedStyleIds = new Set();
  const collectAliases = (value) => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) return value.forEach(collectAliases);
    if (value.type === 'VARIABLE_ALIAS' && value.id)
      return usedVarIds.add(value.id);
    Object.values(value).forEach(collectAliases);
  };
  const collectPaints = (paints) =>
    Array.isArray(paints) &&
    paints.forEach((p) => collectAliases(p.boundVariables));
  const collectStyle = (id) =>
    typeof id === 'string' && id && usedStyleIds.add(id);

  for (const node of [scope, ...scope.findAll(() => true)]) {
    collectAliases(node.boundVariables);
    if ('fills' in node) collectPaints(node.fills);
    if ('strokes' in node) collectPaints(node.strokes);
    if ('effects' in node && Array.isArray(node.effects))
      node.effects.forEach((e) => collectAliases(e.boundVariables));
    for (const prop of [
      'fillStyleId',
      'strokeStyleId',
      'effectStyleId',
      'textStyleId',
    ])
      if (prop in node) collectStyle(node[prop]);
    if (node.type === 'TEXT') {
      for (const seg of node.getStyledTextSegments([
        'textStyleId',
        'fills',
        'boundVariables',
      ])) {
        collectStyle(seg.textStyleId);
        collectPaints(seg.fills);
        collectAliases(seg.boundVariables);
      }
    }
  }
  // 페인트 스타일에 연결된 변수
  for (const id of usedStyleIds) {
    const style = await figma.getStyleByIdAsync(id);
    if (style && style.type === 'PAINT') collectPaints(style.paints);
  }
  // alias를 따라가며 가리키는 변수도 사용한 것으로
  const queue = [...usedVarIds];
  while (queue.length) {
    const v = await figma.variables.getVariableByIdAsync(queue.pop());
    if (!v) continue;
    for (const raw of Object.values(v.valuesByMode)) {
      if (raw && raw.type === 'VARIABLE_ALIAS' && !usedVarIds.has(raw.id)) {
        usedVarIds.add(raw.id);
        queue.push(raw.id);
      }
    }
  }

  const usedVarNames = new Map(); // 컬렉션 이름 → 사용한 변수 이름
  for (const id of usedVarIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    if (!v || v.remote) continue;
    const c = await figma.variables.getVariableCollectionByIdAsync(
      v.variableCollectionId,
    );
    if (!c) continue;
    if (!usedVarNames.has(c.name)) usedVarNames.set(c.name, new Set());
    usedVarNames.get(c.name).add(v.name);
  }
  const usedStyleNames = new Set();
  for (const id of usedStyleIds) {
    const st = await figma.getStyleByIdAsync(id);
    if (st && !st.remote) usedStyleNames.add(`${st.type}|${st.name}`);
  }

  const variables = {};
  for (const [name, c] of Object.entries(tokens.variables)) {
    const used = usedVarNames.get(name) || new Set();
    const unused = Object.keys(c.vars).filter((v) => !used.has(v));
    if (unused.length) variables[name] = unused;
  }
  return {
    scope: config.usageScope.name,
    variables,
    textStyles: tokens.textStyles
      .map((t) => t.name)
      .filter((n) => !usedStyleNames.has(`TEXT|${n}`)),
    effectStyles: tokens.effectStyles
      .map((e) => e.name)
      .filter((n) => !usedStyleNames.has(`EFFECT|${n}`)),
  };
}

// ─── 플러그인 실행 ──────────────────────────────────────────
figma.showUI(__html__, { width: 480, height: 600, themeColors: true });

figma.ui.onmessage = (msg) => {
  if (msg.type === 'close') figma.closePlugin();
  if (msg.type === 'notify') figma.notify(msg.text);
};

exportTokens(CONFIG)
  .then(async ({ tokens, warnings }) => {
    let unused;
    try {
      unused = await findUnused(CONFIG, tokens);
    } catch (e) {
      unused = {
        error: `사용 여부 확인 실패: ${String((e && e.message) || e)}`,
      };
    }
    const counts = Object.fromEntries(
      Object.entries(tokens.variables).map(([name, c]) => [
        name,
        Object.keys(c.vars).length,
      ]),
    );
    figma.ui.postMessage({
      type: 'result',
      json: `${JSON.stringify(tokens, null, 2)}\n`,
      summary: {
        file: tokens.meta.source,
        fileKey: tokens.meta.fileKey,
        counts,
        textStyles: tokens.textStyles.length,
        effectStyles: tokens.effectStyles.length,
      },
      warnings,
      unused,
    });
  })
  .catch((error) =>
    figma.ui.postMessage({
      type: 'error',
      message: String((error && error.message) || error),
    }),
  );
