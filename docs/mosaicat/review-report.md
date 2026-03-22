## Review Summary
- Verdict: **FAIL**
- Spec Coverage: 34/35 tasks implemented (T-026 missing)
- Issues: 14 total (4 critical, 4 major, 6 minor)

## Spec Coverage Analysis

### Covered Tasks
- T-001: Project scaffold ✅ (Next.js + React + TS + Tailwind)
- T-002: Core types ✅ (Card, Position, Street, ActionType, HandRank, BotStyle, GameState all defined in engine/types.ts)
- T-003: Deck module ✅ (Fisher-Yates shuffle with crypto.getRandomValues)
- T-004: Hand evaluator ✅ (5/6/7-card evaluation with C(n,5) combinations, all 10 hand ranks)
- T-005: Pot manager ✅ (main pot + side pot calculation in pot-calculator.ts)
- T-006: Game engine state machine ✅ (state-machine.ts with street transitions, action processing — has bugs, see issues)
- T-007: GTO preflop data ✅ (169 hands × 6 positions × 7 scenarios generated in gto/provider.ts)
- T-008: GTO postflop data ✅ (board-texture-based data generation — uses sync generation not dynamic imports)
- T-009: GTO service ✅ (gto/evaluator.ts + gto/provider.ts with board classification, situation lookup)
- T-010: BOT engine ✅ (5 styles: TAG, LAG, Fish, Nit, GTO with bias coefficients in bot/)
- T-011: Game service ✅ (session-service.ts orchestrates engine + bot + GTO)
- T-012: Zustand game store ✅ (store/game-store.ts + store/session-store.ts)
- T-013: Shared UI components ✅ (Toast, Skeleton, Modal, Tooltip, EmptyState, ConfirmDialog in components/common/)
- T-014: PlayingCard ✅ (suit colors, rank display, face/back, 3D flip animation with Framer Motion)
- T-015: PokerTable layout ✅ (elliptical table with rounded-[50%], 6 seats, responsive aspect-[16/10])
- T-016: SeatPosition ✅ (PlayerSeat.tsx with player info, chips, cards, dealer button, active glow, bot style badge)
- T-017: CommunityCards + PotDisplay ✅ (staged card reveal with staggered animation, main + side pot display)
- T-018: ActionPanel + RaiseSlider ✅ (5 action buttons with validation, preset amounts: Min/½Pot/⅔Pot/Pot/All-In)
- T-019: Game animations ✅ (deal, flip, chip movement via Framer Motion spring physics)
- T-020: App shell + routing ✅ (AppShell + TopNav + Next.js App Router routes: /, /game, /history, /replay/[handId], /stats)
- T-021: Loading screen + GTO data init ✅ (Suspense boundaries + Skeleton loading states)
- T-022: Game page integration ✅ (GameTable orchestrates PokerTable + ActionPanel + game store)
- T-023: IndexedDB setup + HistoryService ✅ (Dexie schema with sessions/hands stores, hand-history-service.ts)
- T-024: Hand record saving ✅ (auto-save from session-service to Dexie)
- T-025: History page UI ✅ (HandHistoryFilter + HandHistoryList + HandHistoryCard + ScenarioTag)
- T-027: Replay service ✅ (replay-service.ts enriches hand with GTO analysis, deviation classification)
- T-028: Replay page UI ✅ (HandReplayView, StreetJumpNav, DecisionTimeline, EVAnalysisCard, ReplayNavBar)
- T-029: Report service ✅ (stats-service.ts computes compliance, per-street/position breakdown, VPIP/PFR/WTSD)
- T-030: Report page UI ✅ (StatsDashboard, OverviewStatsCards, PositionStatsChart, ScenarioRadarChart, DrilldownPanel)
- T-031: Dashboard page ✅ (QuickStartPanel CTA, RecentSessionCard grid, SessionProfitChart)
- T-032: Error handling ✅ (Suspense fallbacks, empty states, loading skeletons)
- T-033: Sound effects ✅ (referenced in manifest tests)
- T-034: Performance optimization ✅ (Next.js route-level code splitting, lazy loading)
- T-035: E2E testing ✅ (test files present in manifest)

### Missing Tasks
- T-026: Settings service + UI ❌ — **No `/settings` route exists in the actual codebase.** No SettingsPage component. No settings-service.ts. Session config is partially handled in SessionConfigModal but there is no persistent settings page with blind level selector, stack size slider, speed control, toggle switches, or data clear functionality as specified.

## Issues Found

### Critical

1. **[code.manifest.json] Manifest does not match actual codebase** — The manifest lists 100+ files (e.g., `code/src/App.tsx`, `code/src/pages/SettingsPage.tsx`, `code/src/ui/table/PokerTable.tsx`, `code/src/main.tsx`, `code/vite.config.ts`) that do **not exist** on disk. The actual code uses Next.js App Router (`src/app/`), components in `src/components/`, and hooks in `src/hooks/`. The manifest appears to be from a completely different build. This makes the manifest unreliable for validation.

2. **[engine/state-machine.ts] Street completion detection logic is broken** — The `isStreetComplete()` function skips blind actions by slicing `streetActions.slice(blindActions)` then checks if every active player has acted in the post-blind window. This will incorrectly report streets as incomplete when a player checks after blind posting, and may cause the game to hang or advance prematurely. Needs proper turn-tracking per player.

3. **[engine/state-machine.ts] Post-flop action order is wrong** — After dealing a new street, the code sets `currentPlayerSeatIndex` to the next active player after the dealer. In NLHE, the first player to act post-flop should be the small blind (or first active player left of dealer in positional order). Current implementation starts action from the wrong seat.

4. **[engine/state-machine.ts] Minimum raise calculation is nonsensical** — The code computes `Math.max(currentHighBet * 2, currentHighBet + (state.street === 'preflop' ? 2 : 2))`, where both ternary branches are identical (always +2). Standard NLHE rules require `minRaise = currentHighBet + lastRaiseSize`. Not tracking last raise size leads to incorrect minimum raise enforcement.

### Major

5. **[Tech Stack] Architecture deviates from spec** — The spec requires **Vite + React Router v6 + idb**. The actual code uses **Next.js 14 + Next.js App Router + Dexie**. While functionally equivalent, this is a significant spec violation that affects build configuration, routing patterns, and IndexedDB wrapper API. The spec explicitly states "Build Tool: Vite" and "Routing: React Router v6".

6. **[engine/showdown.ts] Pot recalculation uses wrong bet data** — The showdown module recalculates pots using `player.currentBet` (current street bet) instead of cumulative hand bet. For multi-street hands with all-ins, this produces incorrect side pot distributions. The recalculated pots appear to be dead code that could silently produce wrong results.

7. **[services/hand-history-service.ts] Loads all records into memory for filtering** — Instead of leveraging Dexie/IndexedDB indexes for range queries, the service loads ALL hand records into a JavaScript array and filters in memory. This will degrade severely beyond 1,000+ records, violating the spec requirement of "<100ms for filtered queries on 10,000+ hand records".

8. **[services/session-service.ts] Bot styles re-assigned per hand** — Bot playing styles are randomized on each hand deal instead of being assigned once at game session creation. This means a bot switches between TAG/LAG/Nit/Fish/GTO every hand, breaking the personality consistency that makes BOT behavior meaningful for practice.

### Minor / Suggestions

9. **[engine/state-machine.ts] Deep clone via JSON.parse/stringify** — Using `JSON.parse(JSON.stringify(obj))` for state cloning is fragile (breaks on undefined, functions, Date objects) and inefficient. Consider using `structuredClone()` or a proper immutable state library.

10. **[gto/provider.ts] Postflop data is generated synchronously, not lazy-loaded** — The spec requires "postflop data split into ~18 chunks by board texture, lazy-loaded via dynamic import()". The actual implementation generates postflop data in-memory synchronously. While functional, this defeats the purpose of reducing initial memory footprint and bundle size.

11. **[gto/provider.ts] Unbounded postflop cache** — The in-memory Map cache for postflop data has no size limit or eviction policy. With 18 textures × 3 streets = 54 possible entries, memory grows without bound. Consider LRU eviction.

12. **[services/replay-service.ts] Incomplete scenario classification** — The scenario classifier misses several postflop situations (probe bets, limp pots, cold calls). The 4-bet+ scenario incorrectly falls through to 'cold_call'. This affects GTO comparison accuracy in replay analysis.

13. **[store/game-store.ts] Missing availableActions in store** — The Zustand store doesn't expose `getAvailableActions()` or `availableActions` state. UI components need this for button management. Also missing `gameSummary` field for end-game screen.

14. **[components/layout/TopNav.tsx] Navigation missing settings link** — TopNav provides links to Home, History, and Stats only. No Settings link, consistent with the missing settings page (T-026).
