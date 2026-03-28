# Dynamic Project Constitution

## Product Constraints (from ProductOwner)

### Target User Profile
扑克新手和初中级玩家，刚接触GTO（Game Theory Optimal）概念，具备基本的德州扑克规则认知但缺乏系统性策略训练经验。主要使用桌面浏览器访问，期望零门槛（无需注册、无需付费、无需安装）即可开始练习。对扑克术语（position、pot odds、SPR等）有初步了解但不精通，需要直观的视觉反馈（红绿灯标记）而非复杂的数学分析。

### Core Value Proposition
在免费浏览器端提供"完整牌局对战 + 赛后逐手GTO复盘"的闭环体验——现有竞品要么是付费的（GTO Wizard $39/月），要么是选择题模式（无完整牌局），要么无GTO精确对比（PokerSnowie）。

### Feature Priority Rules
- P0 features MUST be fully functional — no stubs, no partial implementations
- P1 features SHOULD be implemented if time/budget allows
- P2 features are nice-to-have and may be omitted entirely
- When in doubt about scope, cut P2 first, then P1
- 牌局引擎（F-001）和复盘（F-006）是产品核心差异化，绝不可降级

### Product-Level NEVER Rules
- NEVER 在未覆盖的GTO spot上显示虚假或猜测的策略数据——必须明确标注"无GTO参考数据"
- NEVER 要求用户注册账号或登录才能开始对战——即开即玩是核心体验
- NEVER 将完整牌局体验降级为选择题/quiz模式——"打完整牌局"是与竞品的根本差异
- NEVER 在牌局引擎中跳过规则验证（如最小加注额、边池计算）——错误的规则会误导用户学习
- NEVER 让BOT做出违反基本扑克逻辑的动作（如在无人加注时fold）——BOT行为必须合理，即使是"鱼"风格


## Technical Constraints (from TechLead)

### Tech Stack
- Language: TypeScript (strict mode, no `any`)
- Framework: React 18 + Vite 5
- Styling: Tailwind CSS 3
- State: Zustand (game state + review state)
- Storage: Dexie.js (IndexedDB wrapper for hand history)
- Hand Evaluation: pokersolver
- Routing: React Router 6
- Animation: CSS transitions + Framer Motion (minimal, card/chip only)
- Testing: Vitest + @testing-library/react + happy-dom

### File Structure Convention
```
src/
  components/        # By feature subdirectory (table/, actions/, history/, review/, stats/, shared/)
  pages/             # Page-level components, 1:1 with routes (LandingPage, PlayPage, HistoryPage, ReviewPage, StatsPage)
  hooks/             # Custom hooks (useGameEngine, useHandHistory, useGtoLookup, useStats)
  services/          # Pure logic — no React dependency (gameEngine, botEngine, gtoLookup, handHistory, statsComputer)
  types/             # Shared TypeScript types and enums (card, player, gameState, handHistory, gto)
  data/              # Static GTO strategy JSON files (preflop/, postflop/)
  stores/            # Zustand store definitions (gameStore, reviewStore)
  lib/               # Utility functions (pot calculator, hand evaluator wrapper, board texture classifier)
```

### Naming Conventions
- Components: PascalCase (e.g., `PokerTable.tsx`, `ActionPanel.tsx`)
- Hooks: useCamelCase (e.g., `useGameEngine.ts`, `useGtoLookup.ts`)
- Services: camelCase (e.g., `gameEngine.ts`, `gtoLookupService.ts`)
- Types: PascalCase interfaces (e.g., `interface GameState`, `interface HandHistoryRecord`)
- Stores: camelCase with `use` prefix (e.g., `useGameStore.ts`)
- Data files: kebab-case (e.g., `btn-rfi.json`, `high-rainbow-medium-spr.json`)
- Test files: `*.test.ts` / `*.test.tsx` co-located in `__tests__/` subdirectory
- CSS: Tailwind utility classes only — no custom CSS files except for card SVG styles

### Verification Commands
- Type check: `npx tsc --noEmit`
- Build: `npm run build`
- Test: `npx vitest run`
- Preview: `npm run preview`

### NEVER Rules
- NEVER use `any` type — use `unknown` + type narrowing or explicit interfaces
- NEVER mutate state directly — use Zustand's `set()` or immutable patterns
- NEVER fetch from external APIs — this is a 100% client-side app with zero network requests after initial load
- NEVER use `dangerouslySetInnerHTML` — all content is generated, no user HTML input
- NEVER store GTO data in component state — load from static JSON via service layer, cache in memory
- NEVER skip poker rule validation — every action must be validated against game state (min raise, max stack, legal actions)
- NEVER fabricate GTO data for uncovered spots — return `hasData: false` and display "无GTO参考数据"
- NEVER use `console.log` in production code — remove or gate behind `import.meta.env.DEV`
- NEVER import React components in service/ files — services must be framework-agnostic pure TypeScript
- NEVER use `index.tsx` for page components — each page has an explicit name (e.g., `PlayPage.tsx` not `index.tsx`)

### Game Engine Rules
- Deck: Fisher-Yates shuffle, cryptographic-quality randomness via `crypto.getRandomValues()`
- Hand evaluation: delegate to pokersolver — do not re-implement hand ranking
- Pot calculation: iterate all-in amounts ascending, create side pots for each tier
- Blind posting: automatic at hand start, SB = 1BB, BB = 2BB, fixed
- Starting stack: 100BB per player per hand reset (cash game)
- Action validation: check legal actions list before accepting — reject invalid actions with error

### Component Architecture Rules
- PokerTable is a controlled component — receives GameState as props, emits actions via callbacks
- ActionPanel only renders when `isUserTurn === true`
- BOT actions are queued and animated with staggered 0.5–1.5s delays — not instant
- Review page reuses PokerTable in read-only mode (no ActionPanel, step-controlled state)
- All pages use React.lazy() + Suspense for route-level code splitting