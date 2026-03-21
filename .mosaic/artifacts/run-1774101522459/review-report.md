## Review Summary
- Verdict: **FAIL**
- Spec Coverage: 34/34 tasks claimed covered
- Issues: 18 total (1 critical, 7 major, 10 minor/suggestions)

## Spec Coverage Analysis

### Covered Tasks
- T-001: Project scaffold (Vite + React + TS + Tailwind + Vitest) ✅
- T-002: Dexie.js database schema, migrations, repositories ✅
- T-003: Core game engine: deck, dealing, blinds, state machine ✅
- T-004: Betting round logic: action validation, processing ✅
- T-005: Pot manager: main pot and side pot calculation ✅
- T-006: Hand evaluator: custom 7-card ranking (not pokersolver wrapper) ✅
- T-007: Settlement engine: winners, pot distribution ✅
- T-008: BOT style profiles: TAG/LAG/TP/LP/GTO with VPIP/PFR/AF/3Bet% ✅
- T-009: BOT decision engine: hand strength, position-aware, style-weighted ✅
- T-010: Preflop GTO range tables: 6-max ranges as JSON data ✅
- T-011: Postflop GTO heuristic: pot odds, hand strength, SPR ✅
- T-012: Monte Carlo simulation: equity estimation ✅
- T-013: Web Worker setup: message protocol, 5s timeout, fallback ✅
- T-014: Service layer: TypeScript service functions wiring engine + persistence ✅
- T-015: Session manager: create/pause/resume/end, seat assignment ✅
- T-016: Zustand stores: gameStore, sessionStore, uiStore ✅
- T-017: App shell and routing: 4 routes with lazy loading ✅
- T-018: Card and table SVG components ✅
- T-019: Action panel: legal actions, RaiseSlider, confirm dialog ✅
- T-020: Game loop integration: user → engine → BOT → UI cycle ✅
- T-021: Animations: deal (300ms), flip (400ms), chip (500ms), fade (200ms) ✅
- T-022: Hand history list with infinite scroll (cursor pagination) ✅
- T-023: Hand history detail view ✅
- T-024: Replay engine: timeline, step navigation ✅
- T-025: GTO decision analysis panel: EV bars, quality colors ✅
- T-026: Batch GTO evaluation ✅
- T-027: Stats overview page ✅
- T-028: Position and street stats ✅
- T-029: Profit trend chart (Recharts) ✅
- T-030: Session status UI: StatusBar, NewSessionDialog, SummaryModal ✅
- T-031: Error handling and edge cases ✅
- T-032: Empty states and loading skeletons ✅
- T-033: Integration testing ✅
- T-034: E2E smoke tests ✅

### Missing Tasks
None — all 34 tasks are structurally covered with source files. However, several implementations have correctness issues significant enough to affect functional coverage (see Issues below).

## Issues Found

### Critical

- **[src/main.tsx]** App entry point renders a placeholder `<Root>` component instead of importing and rendering the actual `<App />` component. The entire application **will not render** — users see only static text "GTO Idiot" with no interactive UI. This blocks all functional features.

### Major

- **[src/gto/batch-evaluator.ts]** EV approximation treats GTO frequency as an EV multiplier (e.g., `freq.call * 2`, `freq.raise * 3.5`). Frequencies do not scale to EV this way — the batch evaluation produces meaningless EV numbers, which propagates incorrect data to the replay DecisionAnalysis panel and session summary EV loss metric. Affects T-026, F-003, F-006.

- **[src/gto/monte-carlo.ts:76-86]** Multi-way pot tie handling is incorrect. Code does `totalWins += 0.5` for ties regardless of opponent count. Correct formula: `wins/opponents + ties/(2*opponents)`. Overestimates equity in multi-way pots, affecting bot GTO decisions and postflop EV calculations. Affects T-012, F-003.

- **[src/gto/monte-carlo.ts:221,231]** Fold probability is hardcoded at 0.6 for bets and 0.7 for raises regardless of bet sizing, street, or opponent tendencies. This makes Monte Carlo EV estimates unreliable since fold equity is a major component of bet EV. Affects T-012, F-003.

- **[src/persistence/hand-history-repository.ts:124]** Cursor-based pagination calls `toArray()` loading ALL hand history records into memory, then performs JavaScript `filter()` and `slice()`. With 5000+ target records, this defeats the purpose of cursor pagination and causes memory bloat. Should use Dexie's `where()`, `offset()`, and `limit()` for true indexed queries. Affects T-022, F-005.

- **[src/services/hand-service.ts]** GameEngine instances live only in an in-memory `Map`. On page reload or browser crash, all in-progress hand state is permanently lost — the session record persists but references a `currentHandId` that can never be resumed. No persistence or recovery mechanism exists. Affects T-014, T-020, F-001.

- **[src/engine/settlement.ts:136-143]** Chip movement tracking records `changesBB: 0` for losing players instead of their actual loss amount. Settlement history and stats computations that rely on chip movements will show incomplete data. Fix: `chipMovements.push({ seat, changesBB: winnings })` without the `> 0` guard. Affects T-007, F-001.

- **[src/gto/gto-client.ts:158-162]** On Worker error, all pending requests are rejected with an error instead of falling back to the synchronous heuristic evaluator. This contradicts the spec's "degraded fallback" requirement (T-013, T-031). Should resolve with heuristic result for graceful degradation.

### Minor / Suggestions

- **[src/engine/hand-state-machine.ts:276-295]** When blind posting causes a player to go all-in (stack ≤ blind), `PotManager.markAllIn()` is never called. Side pot calculation may be incorrect for this edge case. Add `this.potManager.markAllIn(seat)` when `stackBB === 0` after blind deduction.

- **[src/engine/game-engine.ts:95-98]** Uses unsafe type cast `(hand as any).bettingState` to access private property. Should expose via a public getter method for type safety.

- **[src/stores/game-store.ts:211]** Bot detection relies on `player.name.startsWith('BOT')` but seat-assigner generates names like "TAG-42", "LAG-73". Should check `player.isHuman === false` instead for robust bot identification.

- **[src/services/session-service.ts:184-191]** `totalEvLoss` is never incremented in the session end summary loop — `avgEvLossPerHand` always returns 0. The TODO comment indicates GTO batch eval integration is incomplete.

- **[src/gto/gto-client.ts:45]** Worker URL uses `.ts` extension (`new URL('./gto-worker.ts', import.meta.url)`), which may break in production builds depending on bundler configuration. Should verify Vite handles this correctly or use the compiled `.js` extension.

- **[project config]** ESLint and Prettier configurations are missing (T-001 specifies "ESLint/Prettier config"). No `.eslintrc.*` or `.prettierrc` files found.

- **[src/components/replay/]** Keyboard shortcuts (← / → for step navigation) are specified in T-024 but not implemented in the replay UI components. ReplayEngine supports all navigation methods but no `useEffect` keyboard listener is wired.

- **[src/components/game/PokerTable.tsx vs useGameLoop.ts]** Phase naming inconsistency: PokerTable expects `'player_turn' | 'bot_thinking' | 'settled'` but useGameLoop can produce `'idle' | 'dealing' | 'settling'`. May cause action panel to not render correctly during certain phases.

- **[vite.config.ts]** Duplicate test configuration exists in both `vite.config.ts` and `vitest.config.ts`. Remove from `vite.config.ts` to maintain single source of truth.

- **[src/gto/postflop-heuristic.ts:174-176]** Fold equity formula caps at 70% for any bet size (`min(0.7, betRatio * 0.3 + 0.1)`). A 2x pot overbet showing 70% fold equity is unrealistic. Consider street-aware and opponent-aware adjustments for future iterations.

## Architecture Assessment

The overall architecture is sound and follows the tech spec's design:
- ✅ Service layer pattern correctly separates UI from logic
- ✅ Web Worker isolation for GTO computation
- ✅ IndexedDB via Dexie.js for structured storage
- ✅ State machine for game engine lifecycle
- ✅ Zustand for lightweight UI state management
- ✅ Comprehensive type system with TypeScript strict mode
- ✅ SVG-based card rendering, proper 6-max table layout
- ✅ Preflop range data reflects real poker GTO theory
- ✅ Custom hand evaluator is correct and handles all hand categories
- ✅ Fisher-Yates shuffle uses crypto.getRandomValues() for security
- ✅ 19 test files with 80+ test cases across all modules
