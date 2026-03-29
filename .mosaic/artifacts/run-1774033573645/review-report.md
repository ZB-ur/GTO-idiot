## Review Summary
- Verdict: **FAIL**
- Spec Coverage: **42/46** tasks implemented (4 missing)
- Issues: **9 total** (2 critical, 4 major, 3 minor)

## Spec Coverage Analysis

### Covered Tasks
- T-001: Project scaffold ✅ (partial: vitest missing from devDependencies)
- T-002: Core type system ✅
- T-003: Dexie database layer ✅
- T-004: Deck shuffle and deal ✅
- T-005: Hand evaluator ✅ (note: combinatorial, not lookup-table optimized)
- T-006: Game state machine ✅
- T-007: Pot calculator with side pots ✅
- T-008: Showdown resolution ✅
- T-010: GTO preflop strategy dataset ✅ (4 JSON files)
- T-011: GTO postflop strategy dataset ✅ (7 JSON files)
- T-012: GTO provider with lazy loading ✅
- T-013: BOT style profiles and hand ranges ✅
- T-014: BOT decision engine ✅
- T-016: GameService orchestration ✅
- T-017: SessionService CRUD ✅
- T-018: Shared UI components ✅
- T-019: PlayingCard component ✅
- T-020: PokerTable + PlayerSeat ✅
- T-021: CommunityCards + PotDisplay ✅ (DealerButton embedded in PokerTable)
- T-022: ActionPanel + RaiseSlider ✅
- T-023: GameTable + useGame hook ✅
- T-024: Game animations ✅ (Framer Motion used for bot thinking, card reveal)
- T-025: ShowdownOverlay + BetTimeline ✅
- T-026: BOT think animation ✅ (ThinkingBanner with bouncing dots)
- T-027: HomePage + Session management UI ✅
- T-028: SessionPauseModal + SessionSummaryModal + SessionProfitChart ✅
- T-029: HandHistoryService with auto-save + scenario tags ✅
- T-030: Hand history UI ✅
- T-031: GTO evaluator ✅
- T-032: EV calculator ✅
- T-033: ReplayService ✅
- T-034: Replay UI core ✅
- T-035: GTO comparison components ✅
- T-036: Replay navigation ✅
- T-037: HandSummaryFooter ✅
- T-038: StatsService ✅
- T-039: Stats dashboard UI ✅
- T-040: Stats charts ✅
- T-041: DrilldownPanel ✅
- T-042: Export service ✅
- T-043: Export UI ✅
- T-044: Session pause/resume ✅ (basic status transition, but no browser reopen recovery)

### Missing Tasks
- T-009: Poker engine unit tests ❌ (no test files found anywhere in the codebase)
- T-015: BOT behavioral validation tests ❌ (no test files)
- T-045: Global error handling ❌ (no IndexedDB detection, no error recovery Modal, no Toast warnings for engine errors)
- T-046: E2E integration tests ❌ (no test files)

## Issues Found

### Critical

- **[src/engine/deck.ts:33]** **Modular bias in Fisher-Yates shuffle.** The line `const j = randomValues[i]! % (i + 1)` introduces modular bias because `2^32` is not evenly divisible by most values of `(i + 1)`. For a poker application where shuffle fairness is essential (per NFR: "确保牌序不可预测"), this should use rejection sampling or a debiased mapping. The bias is small but measurable over millions of hands, which is unacceptable for a GTO training tool.

- **[src/services/game-service.ts]** **GameService reimplements state machine logic instead of delegating to engine/state-machine.ts.** The `game-service.ts` file contains its own `applyAction()`, `isStreetComplete()`, `isHandComplete()`, `computeAvailableActions()`, and `transitionStreet()` functions (~250 lines) that duplicate the pure functional state machine in `engine/state-machine.ts`. This creates two divergent implementations of game rules. Any bug fix in one must be mirrored in the other, and the two already differ in edge cases (e.g., blinds 0.5/1 vs 1/2, different next-player logic). The spec explicitly states "扑克引擎作为纯函数式状态机...便于单元测试" — the GameService should call `createInitialGameState()` and `applyAction()` from state-machine.ts, not reimplement them.

### Major

- **[Missing tests]** **No test files exist in the entire codebase.** T-009 (poker engine unit tests), T-015 (BOT behavioral tests), and T-046 (E2E integration tests) are completely missing. The spec requires these for correctness verification: "覆盖发牌、状态推进、边池、摊牌等核心场景" and "Fish limp-call、Nit 不 bluff、LAG 宽范围 aggression 等行为测试". Fix: add vitest to devDependencies and create test suites for engine, bot, and integration flows.

- **[package.json]** **vitest is missing from devDependencies.** T-001 specifies Vitest as part of the scaffold, and it's listed in the tech stack table, but it's absent from `package.json`. This blocks all testing tasks.

- **[Missing T-045]** **No global error handling implemented.** The spec requires IndexedDB availability detection, Toast warnings for DB failures, and an engine error recovery Modal. None of these exist. A user on a browser with disabled IndexedDB will get an uncaught Dexie error with no UI feedback.

- **[src/engine/showdown.ts:71-76]** **Pot calculation at showdown uses per-street `currentBet` instead of total hand contributions.** The `resolveShowdown` function builds `PotPlayerInput` from `player.currentBet`, but `currentBet` is reset to 0 at each street transition (see state-machine.ts:446). At showdown, `currentBet` only reflects the final street's bets, not the total contributions across all streets. This means side pots will be calculated incorrectly for multi-street all-in scenarios. Fix: track cumulative `totalBetThisHand` per player separately from per-street `currentBet`.

### Minor / Suggestions

- **[src/engine/hand-evaluator.ts, src/bot/decision-tree.ts]** **Duplicate hand evaluation code.** Both files contain independent 5-card evaluation implementations and identical `combinations()` utility functions. The bot's `decision-tree.ts` should import from `engine/hand-evaluator.ts` instead of reimplementing. This violates DRY and risks the two evaluators diverging.

- **[src/services/session-service.ts:31, src/services/game-service.ts:31]** **ID generation uses `Date.now() + Math.random()` instead of `uuid`.** The `uuid` package is listed as a dependency in package.json but is never used. Either use `uuid` for proper RFC4122 UUIDs (as the API spec requires) or remove the dependency.

- **[src/gto/provider.ts:36-38]** **Multiple `eslint-disable` comments for `any` types.** The preflop cache uses `Record<string, any>` which loses type safety. Consider defining proper typed interfaces for each preflop scenario JSON structure, or at minimum use `unknown` instead of `any`.
