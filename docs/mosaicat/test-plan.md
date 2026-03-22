# Test Plan — GTO Idiot (Texas Hold'em GTO Strategy Trainer)

## Test Strategy

### Framework Selection: Vitest + React Testing Library

**Rationale:**
- The project uses **Vite + React + TypeScript**, making **Vitest** the natural, zero-config test framework (Vite-native, shared config, fast HMR-based watch mode).
- **React Testing Library** for component tests — aligns with the project's React 18 stack.
- **jsdom** environment for DOM-dependent tests (components, IndexedDB mocks).
- **fake-indexeddb** for IndexedDB simulation in Node.js environment.

### Test Pyramid

| Level | Focus | Approximate Count |
|-------|-------|--------------------|
| **Unit** | Engine logic, evaluators, services, data utilities | ~60 cases |
| **Integration** | Service orchestration, store ↔ engine, service ↔ persistence | ~20 cases |
| **E2E (component-level)** | Full page flows, game loop, replay flow | ~10 cases |

### Conventions
- Test files live under `tests/` directory, mirroring source structure
- Naming: `tests/{module}/{file}.test.ts` (logic) or `.test.tsx` (components)
- Mocks: GTO data mocked with minimal fixtures; IndexedDB via fake-indexeddb
- No actual browser E2E (Playwright) in this plan — component-level integration covers critical flows

---

## Test Suites

### Suite 1: Core — Deck (`tests/core/deck.test.ts`)

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should create a standard 52-card deck with no duplicates | unit | T-003 |
| 2 | should shuffle deck with Fisher-Yates producing different orderings | unit | T-003 |
| 3 | should deal N cards and reduce deck size accordingly | unit | T-003 |
| 4 | should throw when dealing more cards than remaining | unit | T-003 |
| 5 | should produce statistically uniform distribution over many shuffles | unit | T-003 |

### Suite 2: Core — Hand Evaluator (`tests/core/hand-evaluator.test.ts`)

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should identify Royal Flush | unit | T-004 |
| 2 | should identify Straight Flush | unit | T-004 |
| 3 | should identify Four of a Kind | unit | T-004 |
| 4 | should identify Full House | unit | T-004 |
| 5 | should identify Flush | unit | T-004 |
| 6 | should identify Straight (including A-5 wheel) | unit | T-004 |
| 7 | should identify Three of a Kind | unit | T-004 |
| 8 | should identify Two Pair | unit | T-004 |
| 9 | should identify One Pair | unit | T-004 |
| 10 | should identify High Card | unit | T-004 |
| 11 | should select best 5 cards from 7 | unit | T-004 |
| 12 | should correctly compare two hands and determine winner | unit | T-004 |
| 13 | should detect a split pot (tied hands) | unit | T-004 |
| 14 | should evaluate within <1ms for a single hand | unit | T-004 |

### Suite 3: Core — Pot Manager (`tests/core/pot-manager.test.ts`)

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should calculate main pot from equal bets | unit | T-005 |
| 2 | should create side pot when a player is all-in with less chips | unit | T-005 |
| 3 | should handle multiple side pots with 3+ all-in players | unit | T-005 |
| 4 | should correctly split pot among tied winners | unit | T-005 |
| 5 | should handle odd chip distribution in split pots | unit | T-005 |

### Suite 4: Core — Game Engine (`tests/core/game-engine.test.ts`)

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should create a new game session with 6 players and correct blind posting | unit | T-006 |
| 2 | should deal 2 hole cards to each active player at hand start | unit | T-006 |
| 3 | should transition streets: preflop → flop (3 cards) → turn (1 card) → river (1 card) | unit | T-006 |
| 4 | should validate actions — reject raise below minimum, reject check when facing bet | unit | T-006 |
| 5 | should correctly track betting round completion (all players acted, bets matched) | unit | T-006 |
| 6 | should move to showdown when betting completes on river | unit | T-006 |
| 7 | should end hand immediately when all but one player folds | unit | T-006 |
| 8 | should correctly award pot to winner at showdown | unit | T-006 |
| 9 | should handle all-in player correctly — skip in future streets, eligible for pot | unit | T-006 |
| 10 | should rotate dealer button and blinds between hands | unit | T-006 |
| 11 | should return correct available actions for current player | unit | T-006 |
| 12 | should track hand status transitions: in_progress → showdown → concluded | unit | T-006 |

### Suite 5: Core — Types (`tests/core/types.test.ts`)

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should define all Card rank and suit combinations | unit | T-002 |
| 2 | should define all Position values for 6-max | unit | T-002 |
| 3 | should define all Street, ActionType, HandRank, BotStyle enums | unit | T-002 |
| 4 | should enforce GameState and HandState shape via type checks | unit | T-002 |

### Suite 6: GTO — Board Classifier (`tests/gto/board-classifier.test.ts`)

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should classify rainbow dry board (e.g., K♠ 7♦ 2♣) | unit | T-009 |
| 2 | should classify two-tone wet board (e.g., J♠ T♠ 8♦) | unit | T-009 |
| 3 | should classify monotone board (e.g., A♥ 9♥ 4♥) | unit | T-009 |
| 4 | should classify high/mid/low card texture correctly | unit | T-009 |
| 5 | should classify paired boards | unit | T-009 |
| 6 | should handle turn and river board classifications | unit | T-009 |

### Suite 7: GTO — Preflop Data (`tests/gto/preflop-data.test.ts`)

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should load preflop data successfully | unit | T-007 |
| 2 | should contain strategy for all 169 hand combos | unit | T-007 |
| 3 | should contain entries for all 6 positions | unit | T-007 |
| 4 | should have valid action frequencies summing to ~1.0 | unit | T-007 |

### Suite 8: GTO — Postflop Loader (`tests/gto/postflop-loader.test.ts`)

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should lazy-load postflop chunk by board texture | unit | T-008 |
| 2 | should cache loaded chunks and not re-fetch | unit | T-008 |
| 3 | should handle load failure gracefully with retry | unit | T-008 |

### Suite 9: GTO — GTO Service (`tests/gto/gto-service.test.ts`)

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should return preflop strategy for given position and scenario | integration | T-009 |
| 2 | should return postflop strategy for given board texture and street | integration | T-009 |
| 3 | should map full game situation to GTORecommendation via lookup() | integration | T-009 |
| 4 | should handle unknown scenario gracefully with default recommendation | unit | T-009 |

### Suite 10: Bot Engine (`tests/bot/bot-engine.test.ts`)

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should create TAG style profile with correct bias coefficients | unit | T-010 |
| 2 | should create LAG style profile with higher aggression factor | unit | T-010 |
| 3 | should create Fish style profile with wider ranges | unit | T-010 |
| 4 | should create Nit style profile with tighter ranges | unit | T-010 |
| 5 | should create Maniac style profile with extreme aggression | unit | T-010 |
| 6 | should make a decision within 100ms | unit | T-010 |
| 7 | should apply style bias to GTO base recommendation | unit | T-010 |
| 8 | should return valid action (fold/check/call/raise) for given game state | unit | T-010 |
| 9 | should not raise above player's chip stack | unit | T-010 |

### Suite 11: Bot Services — Game Service (`tests/services/game-service.test.ts`)

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should orchestrate player action → BOT decisions → state update | integration | T-011 |
| 2 | should process full betting round with BOTs acting in sequence | integration | T-011 |
| 3 | should emit animation events for deal, bet, fold actions | integration | T-011 |
| 4 | should handle end-of-hand settlement and trigger next hand | integration | T-011 |

### Suite 12: Bot Services — Game Store (`tests/store/game-store.test.ts`)

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should initialize with idle state | unit | T-012 |
| 2 | should create a new game session via createGame action | unit | T-012 |
| 3 | should update state after submitAction | unit | T-012 |
| 4 | should provide derived selectors (current player, available actions, pot) | unit | T-012 |
| 5 | should dealNextHand and reset hand state | unit | T-012 |

### Suite 13: Persistence — IndexedDB Schema (`tests/persistence/schema.test.ts`)

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should create hands object store with correct indexes | unit | T-023 |
| 2 | should open database and upgrade schema | unit | T-023 |

### Suite 14: Persistence — History Service (`tests/persistence/history-service.test.ts`)

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should save a hand record to IndexedDB | integration | T-023 |
| 2 | should retrieve a hand by ID | integration | T-023 |
| 3 | should list hands with pagination | integration | T-023 |
| 4 | should filter hands by date range | integration | T-023 |
| 5 | should filter hands by blind level | integration | T-023 |
| 6 | should filter hands by profit/loss | integration | T-023 |
| 7 | should compute aggregate stats (total hands, P&L, win rate, VPIP, PFR) | integration | T-023 |
| 8 | should clear all records with clearAll() | integration | T-023 |
| 9 | should handle 10,000+ records with <100ms query time | integration | T-023 |

### Suite 15: Persistence — Hand Record Saving (`tests/persistence/hand-saving.test.ts`)

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should auto-save completed hand from game engine to IndexedDB | integration | T-024 |
| 2 | should not save incomplete/aborted hands | integration | T-024 |
| 3 | should record all street actions in correct order | integration | T-024 |

### Suite 16: Persistence — Replay Service (`tests/services/replay-service.test.ts`)

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should enrich hand record with GTO analysis per decision point | integration | T-027 |
| 2 | should classify deviation as match for correct GTO play | unit | T-027 |
| 3 | should classify deviation as minor for close-to-GTO play | unit | T-027 |
| 4 | should classify deviation as major for anti-GTO play | unit | T-027 |
| 5 | should generate explanation text for each deviation | unit | T-027 |
| 6 | should handle hands with no player decisions (auto-win scenarios) | unit | T-027 |

### Suite 17: Persistence — Report Service (`tests/services/report-service.test.ts`)

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should generate compliance report for N recent hands | integration | T-029 |
| 2 | should compute overall GTO compliance percentage | integration | T-029 |
| 3 | should compute per-street compliance breakdown | integration | T-029 |
| 4 | should compute per-decision-type compliance breakdown | integration | T-029 |
| 5 | should identify top 5 weakness scenarios | integration | T-029 |
| 6 | should return weakness-specific hand list via getWeaknessHands | integration | T-029 |
| 7 | should handle empty history gracefully | unit | T-029 |

### Suite 18: Bot Services — Settings Service (`tests/services/settings-service.test.ts`)

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should return default settings when localStorage is empty | unit | T-026 |
| 2 | should persist updated settings to localStorage | unit | T-026 |
| 3 | should merge partial updates without overwriting other fields | unit | T-026 |
| 4 | should validate setting values (blind level, stack size, speed) | unit | T-026 |
| 5 | should handle corrupted localStorage data gracefully | unit | T-026 |

### Suite 19: UI Shared Components (`tests/ui/shared.test.tsx`)

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | Toast should render message and auto-dismiss | unit | T-013 |
| 2 | Spinner should render with correct size prop | unit | T-013 |
| 3 | Skeleton should render placeholder with correct dimensions | unit | T-013 |
| 4 | LoadingScreen should show progress bar | unit | T-013 |
| 5 | Modal should open/close and render children | unit | T-013 |
| 6 | Tooltip should show on hover | unit | T-013 |
| 7 | EmptyState should render message and optional action button | unit | T-013 |

### Suite 20: UI Table — PlayingCard (`tests/ui/playing-card.test.tsx`)

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should render card face with correct rank and suit | unit | T-014 |
| 2 | should render card back when face-down | unit | T-014 |
| 3 | should apply correct suit color (red for hearts/diamonds, black for spades/clubs) | unit | T-014 |
| 4 | should apply flip animation class when transitioning | unit | T-014 |

### Suite 21: UI Table — PokerTable Layout (`tests/ui/poker-table.test.tsx`)

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should render 6 seat positions | unit | T-015 |
| 2 | should display dealer button at correct position | unit | T-015, T-016 |
| 3 | should highlight active player's seat | unit | T-016 |
| 4 | should show folded state for eliminated players | unit | T-016 |
| 5 | should render community cards area | unit | T-017 |
| 6 | should display pot amount | unit | T-017 |

### Suite 22: UI Table — ActionPanel (`tests/ui/action-panel.test.tsx`)

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should render available action buttons (Fold/Check/Call/Raise) | unit | T-018 |
| 2 | should disable unavailable actions | unit | T-018 |
| 3 | should show raise slider with min/max constraints | unit | T-018 |
| 4 | should display preset raise amounts (1/3 pot, 1/2 pot, pot, all-in) | unit | T-018 |
| 5 | should call onAction callback with correct action type and amount | unit | T-018 |

### Suite 23: UI Pages — History Page (`tests/ui/history-page.test.tsx`)

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should render stats cards row | unit | T-025 |
| 2 | should render filter toolbar | unit | T-025 |
| 3 | should display hand history list | unit | T-025 |
| 4 | should show empty state when no history | unit | T-025 |

### Suite 24: UI Pages — Replay Page (`tests/ui/replay-page.test.tsx`)

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should render street navigator | unit | T-028 |
| 2 | should render action timeline with color-coded nodes | unit | T-028 |
| 3 | should display GTO comparison card for selected action | unit | T-028 |
| 4 | should reveal bot style tags | unit | T-028 |
| 5 | should show deviation badges (match/minor/major) | unit | T-028 |

### Suite 25: UI Pages — Report Page (`tests/ui/report-page.test.tsx`)

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should render compliance score ring | unit | T-030 |
| 2 | should render bar chart for per-street breakdown | unit | T-030 |
| 3 | should render radar chart for per-decision-type breakdown | unit | T-030 |
| 4 | should render weakness ranking list | unit | T-030 |
| 5 | should render range selector for hand count | unit | T-030 |

### Suite 26: UI Pages — Settings Page (`tests/ui/settings-page.test.tsx`)

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should render all settings controls | unit | T-026 |
| 2 | should persist changes on update | integration | T-026 |
| 3 | should show confirmation dialog for data clear | unit | T-026 |
| 4 | should toggle sound effects | unit | T-033 |

### Suite 27: App Shell (`tests/app/app-shell.test.tsx`)

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should render AppShell with TopNav | unit | T-020 |
| 2 | should navigate between all routes | integration | T-020 |
| 3 | should show loading screen during GTO data initialization | unit | T-021 |
| 4 | should complete GTO data load and transition to app | integration | T-021 |
| 5 | should show dashboard with start game CTA and quick stats | unit | T-031 |

### Suite 28: Game Animations (`tests/ui/animations.test.tsx`)

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should apply deal animation class to newly dealt cards | unit | T-019 |
| 2 | should apply flip animation to community cards | unit | T-019 |
| 3 | should apply fold fade animation to folded player | unit | T-019 |

### Suite 29: Error Handling (`tests/app/error-handling.test.ts`)

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should show toast when IndexedDB is unavailable | unit | T-032 |
| 2 | should retry GTO lazy load on failure | unit | T-032 |
| 3 | should recover from invalid game state | unit | T-032 |

### Suite 30: Sound Effects (`tests/ui/sound-effects.test.ts`)

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should play sound on fold/check/call/raise actions when enabled | unit | T-033 |
| 2 | should not play sound when sound is disabled in settings | unit | T-033 |

### Suite 31: Performance (`tests/performance/performance.test.ts`)

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should evaluate hand in <1ms | unit | T-034 |
| 2 | should make BOT decision in <100ms | unit | T-034 |
| 3 | should query history with filters in <100ms for 1000 records | integration | T-034 |

### Suite 32: E2E — Full Game Flow (`tests/e2e/full-game-flow.test.tsx`)

| # | Test Case | Type | Covers |
|---|-----------|------|--------|
| 1 | should complete a full hand: deal → preflop → flop → turn → river → showdown | e2e | T-035, T-006 |
| 2 | should save completed hand to history and retrieve it | e2e | T-035, T-024 |
| 3 | should generate replay with GTO analysis for a completed hand | e2e | T-035, T-027 |
| 4 | should generate compliance report from saved history | e2e | T-035, T-029 |
| 5 | should complete multi-hand session with correct stack tracking | e2e | T-035, T-006 |

---

## Setup Instructions

### Install Dependencies
```bash
cd code
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom fake-indexeddb
```

### Vitest Configuration
Add to `vite.config.ts`:
```ts
/// <reference types="vitest" />
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/vite-env.d.ts', 'src/**/*.d.ts']
    }
  }
});
```

### Test Setup File (`tests/setup.ts`)
```ts
import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';
```

### Run Commands
```bash
npx vitest run          # Run all tests once
npx vitest              # Watch mode
npx vitest --coverage   # With coverage report
```

---

## Task Coverage Matrix

| Task | Test Suites |
|------|-------------|
| T-001 | Suite 27 (app-shell) |
| T-002 | Suite 5 (types) |
| T-003 | Suite 1 (deck) |
| T-004 | Suite 2 (hand-evaluator) |
| T-005 | Suite 3 (pot-manager) |
| T-006 | Suite 4 (game-engine), Suite 32 (e2e) |
| T-007 | Suite 7 (preflop-data) |
| T-008 | Suite 8 (postflop-loader) |
| T-009 | Suite 6 (board-classifier), Suite 9 (gto-service) |
| T-010 | Suite 10 (bot-engine) |
| T-011 | Suite 11 (game-service) |
| T-012 | Suite 12 (game-store) |
| T-013 | Suite 19 (shared components) |
| T-014 | Suite 20 (playing-card) |
| T-015 | Suite 21 (poker-table) |
| T-016 | Suite 21 (poker-table) |
| T-017 | Suite 21 (poker-table) |
| T-018 | Suite 22 (action-panel) |
| T-019 | Suite 28 (animations) |
| T-020 | Suite 27 (app-shell) |
| T-021 | Suite 27 (app-shell) |
| T-022 | Suite 32 (e2e full-game) |
| T-023 | Suite 13 (schema), Suite 14 (history-service) |
| T-024 | Suite 15 (hand-saving), Suite 32 (e2e) |
| T-025 | Suite 23 (history-page) |
| T-026 | Suite 18 (settings-service), Suite 26 (settings-page) |
| T-027 | Suite 16 (replay-service), Suite 32 (e2e) |
| T-028 | Suite 24 (replay-page) |
| T-029 | Suite 17 (report-service), Suite 32 (e2e) |
| T-030 | Suite 25 (report-page) |
| T-031 | Suite 27 (app-shell) |
| T-032 | Suite 29 (error-handling) |
| T-033 | Suite 30 (sound-effects), Suite 26 (settings-page) |
| T-034 | Suite 31 (performance) |
| T-035 | Suite 32 (e2e full-game) |
