# Figma → 코드 동기화

디자인 출처: Figma `3팀_내부공유용` 파일 (토큰·아이콘·컴포넌트 모두)

| 대상   | 가져오기                        | 코드 생성                                    | 결과                                                 |
| ------ | ------------------------------- | -------------------------------------------- | ---------------------------------------------------- |
| 아이콘 | `pnpm icons:sync` (REST API)    | 자동 (`icons:sync`가 `icons:build`까지 실행) | `assets/icons/*.svg`, `src/shared/ui/icons/index.ts` |
| 토큰   | Figma 플러그인 `token-exporter` | `pnpm tokens:build`                          | `src/theme/theme.generated.ts`                       |

생성 파일(`icons.figma.json`, `assets/icons/*.svg`, `src/shared/ui/icons/index.ts`, `tokens.json`, `theme.generated.ts`)은 직접 수정하지 말고 커밋합니다. 토큰이 없는 팀원과 CI도 빌드할 수 있게 하기 위해서입니다.

## 아이콘: `pnpm icons:sync`

1. Figma → Settings → Security → Personal access tokens에서 토큰 발급
   - 스코프는 **File content: Read-only**만 선택
2. `apps/mobile/.env.local`에 `FIGMA_TOKEN=figd_...` 추가 (gitignore 대상)
   - 앱 코드에서 쓰는 값이 아니므로 `EXPO_PUBLIC_` 접두어를 붙이지 않습니다. 붙이면 앱 번들에 포함됩니다.
3. `pnpm icons:sync` 실행 → 출력되는 추가·삭제·이름 변경을 확인하고 `git diff` 검토 후 커밋

- 대상: comp > 01 · 아이콘 및 에셋 > **icon 섹션 바로 아래의 컴포넌트** (`syncIcons.mjs`의 `ICON_SECTION_ID`)
- 코드 이름은 Figma 이름에서 자동으로 만듭니다: `caret_down_sm` → `assets/icons/caret-down-sm.svg` → `CaretDownSmIcon`
- SVG 파일이 원본입니다. `react-native-svg-transformer`(metro.config.js)가 `.svg`를 컴포넌트로 바꾸고, `index.ts`가 `createIcon`으로 `size`·`color` props를 붙여 내보냅니다.
- 아이콘 색은 SVG 안의 `currentColor`입니다. 한 가지 색으로만 그린 아이콘은 자동으로 `currentColor`가 되고, 여러 색이면 원래 색을 유지합니다.
- 이름이 겹치거나 규칙에 맞지 않으면 빌드가 멈춥니다. `buildIcons.mjs`의 `NAME_OVERRIDES` 또는 `EXCLUDE`에 추가하세요.
- 아이콘이 삭제되거나 이름이 바뀌면 해당 컴포넌트가 사라지므로, 쓰던 곳에서 타입 에러가 납니다.
- `/v1/images`는 요청 한도가 낮은 API입니다. 빌드마다 실행하지 말고 아이콘이 바뀌었을 때만 실행해주세요.

```tsx
import { HomeIcon } from '@/shared/ui/icons';

<HomeIcon />; // 24px, 기본 색 icon-default
<HomeIcon size={20} color={COLORS['sky-60']} />;
```

## 토큰: Figma 플러그인 `token-exporter`

Figma 안에서만 실행되는 팀 전용 개발 플러그인입니다. Node로 실행할 수 없습니다. (Variables REST API는 Enterprise 플랜 전용이라 플러그인으로 읽습니다.)

### 처음 한 번: 플러그인 등록

1. **Figma 데스크톱 앱**을 엽니다 (브라우저에서는 개발 플러그인을 등록할 수 없음)
2. Plugins → Development → **Import plugin from manifest…**
3. `apps/mobile/scripts/figma/token-exporter/manifest.json` 선택

### 토큰 내보내기

1. `3팀_내부공유용` 파일을 엽니다 (다른 파일에서 실행하면 플러그인이 막습니다)
2. Plugins → Development → **Billit Token Exporter** 실행
3. 요약과 경고를 확인하고 **tokens.json 다운로드**
4. 받은 파일로 `apps/mobile/src/theme/tokens.json`을 교체
5. `pnpm tokens:build` → 출력되는 삭제·변경 토큰 확인 → `git diff` 검토 후 커밋

- 내보내는 범위: `code.js`의 `CONFIG.collections`에 적힌 Variables 컬렉션 + 로컬 텍스트·이펙트 스타일
- `CONFIG.expectedFileKey`로 3팀 파일에서만 내보내도록 막아 두었습니다. 잘못된 파일의 값으로 덮어쓰는 일을 방지합니다.
