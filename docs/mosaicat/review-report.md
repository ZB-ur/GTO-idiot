# Review Report: GTO Idiot — Texas Hold'em GTO Trainer

## Review Summary
- **Verdict**: FAIL
- **Spec Coverage**: 29/29 tasks claimed in manifest
- **Constitution Compliance**: 1 violation found (Article V — No Placeholder Delivery)
- **Issues**: 18 total (3 critical, 5 major, 7 minor, 3 suggestions)

---

## Spec Coverage Analysis

### Covered Tasks
- T-001: Setup Vite + React + TypeScript + Tailwind project scaffold ✅
- T-002: Define shared types and enums ✅
- T-003: Implement shared layout components ✅
- T-004: Implement deck management (Fisher-Yates shuffle) ✅
- T-005: Implement poker hand evaluator ✅
- T-006: Implement betting round state machine ✅
- T-007: Implement pot and side-pot calculator ✅
- T-008: Implement available actions resolver ✅
- T-009: Build IndexedDB persistence layer ✅
- T-010: Create GTO preflop range tables ✅
- T-011: Create GTO postflop simplified strategy tree ✅
- T-012: Implement hand categorizer ✅
- T-013: Implement BOT decision engine ✅
- T-014: Build poker table layout ✅
- T-015: Build CardComponent and CommunityCards ✅
- T-016: Build ActionPanel with fold/check/call/raise ✅ (partial — RaiseControl non-functional)
- T-017: Implement game session controller hook ✅ (partial — stub hook)
- T-018: Implement BOT action display with thinking delay ✅ (partial — stub component)
- T-019: Build lobby page ✅ (partial — stub components)
- T-020: Implement hand history recording ✅
- T-021: Implement EV estimator and GTO decision scorer ✅
- T-022: Build hand list browser page ✅ (partial — stub service)
- T-023: Build hand replay page ✅ (partial — stub components)
- T-024: Build DecisionDetailPanel ✅ (partial — stub component)
- T-025: Implement GTO explanation text generator ✅ (partial — returns empty string)
- T-026: Build statistics page ✅ (partial — stub service returns zeros)
- T-027: Implement card deal/flip animations ✅ (partial — DealAnimation is placeholder div)
- T-028: Implement chip animation and winner banner ✅ (partial — both are placeholder divs)
- T-029: Implement sound effects system ✅ (partial — SoundToggle is placeholder div)

### Missing Tasks
None formally missing from manifest, but **13 tasks are only partially implemented** — the file exists but contains a placeholder component (`<div>ComponentName</div>`) or stub hook/service with no real logic.

### Effective Coverage Assessment
- **Fully implemented**: T-001 through T-013 (core engine, types, scaffold, GTO strategy, persistence) — 13 tasks
- **Partially implemented** (file exists, placeholder UI or stub logic): T-014 through T-029 — 16 tasks
- **True functional coverage**: ~13/29 tasks (45%)

---

## Constitution Compliance

### Checked Rules

| Rule | Status | Details |
|------|--------|---------|
| **Article I: Verifiability** — `tsc --noEmit` zero errors | ✅ PASS | TypeScript compilation passes with zero errors |
| **Article II: Spec Is Authority** — Code follows tech-spec.md | ⚠️ PARTIAL | Module structure matches spec; many components are stubs |
| **Article III: No Ambiguous Pass-Through** | ✅ PASS | No fabricated requirements detected |
| **Article IV: Acceptance-Driven Completion** | ❌ FAIL | Stub components cannot pass acceptance tests |
| **Article V: No Placeholder Delivery** | ❌ FAIL | 13 user-visible components are bare placeholder divs |
| **Article VI: End-to-End Traceability** | ⚠️ PARTIAL | All T-NNN IDs present in manifest, but partial implementations break traceability intent |
| File structure convention | ✅ PASS | Feature-module architecture correctly applied |
| Naming conventions | ✅ PASS | PascalCase components, useCamelCase hooks, kebab-case files |
| Tech stack compliance | ✅ PASS | React 18 + Vite + Tailwind + TypeScript strict — all per spec |

### Violations
1. **Article V violation**: 13 user-visible components deliver placeholder content (bare `<div>ComponentName</div>` elements)

---

## Issues Found

### Critical

1. **[13 components] Placeholder components violate Article V — No Placeholder Delivery**
   - `src/features/table/BotThinkingIndicator.tsx:4` — `<div>BotThinkingIndicator</div>`
   - `src/features/table/WinnerBanner.tsx:4` — `<div>WinnerBanner</div>`
   - `src/features/table/SoundToggle.tsx:4` — `<div>SoundToggle</div>`
   - `src/features/table/DealAnimation.tsx:9` — `<div>DealAnimation</div>`
   - `src/features/table/ChipAnimation.tsx:9` — `<div>ChipAnimation</div>`
   - `src/features/replay/ActionSequencePanel.tsx:4` — `<div>ActionSequencePanel</div>`
   - `src/features/replay/DecisionDetailPanel.tsx:4` — `<div>DecisionDetailPanel</div>`
   - `src/features/replay/ReplayTableView.tsx:4` — `<div>ReplayTableView</div>`
   - `src/features/replay/StreetTimeline.tsx:4` — `<div>StreetTimeline</div>`
   - `src/features/replay/HandListFilterBar.tsx:4` — `<div>HandListFilterBar</div>`
   - `src/features/lobby/EmptyLobbyState.tsx:4` — `<div>EmptyLobbyState</div>`
   - `src/features/lobby/NewGameButton.tsx:4` — `<button>NewGameButton</button>`
   - `src/features/stats/PLChart.tsx:10` — `<div>PLChart</div>`
   
   These are user-visible paths rendering raw component names. **Violates Static Constitution Article V.**

2. **[5 hooks] Stub hooks with no data fetching — features non-functional**
   - `src/features/lobby/hooks/useSessionList.ts` — returns hardcoded empty array, `refresh()` is no-op
   - `src/features/table/hooks/useBotActions.ts` — returns hardcoded `isBotThinking: false`, no bot logic
   - `src/features/replay/hooks/useHandList.ts` — returns empty arrays, never calls service
   - `src/features/replay/hooks/useHandReplay.ts` — ignores `handId`, returns null replay
   - `src/features/stats/hooks/useStatistics.ts` — returns null statistics, never calls service
   
   These hooks are the data-fetching layer for their respective pages. Without them, Lobby, Replay, and Stats pages are non-functional. **Violates Article IV — Acceptance-Driven Completion.**

3. **[3 services] Stub services return null/empty — replay and stats broken**
   - `src/features/replay/services/replay-service.ts:4,11,17` — `getHandReplay()` → null, `getDecisionDetail()` → null, `generateExplanation()` → ''
   - `src/features/stats/services/stats-service.ts:3,20` — `computeStatistics()` → hardcoded zeros, `computePLChartData()` → []
   - `src/statistics/services/stats-service.ts` — duplicate file, also returns hardcoded zeros
   
   **Violates Article V** (stats page shows fake data) and **Article IV** (cannot pass acceptance tests).

### Major

4. **[3 directories] Dead/duplicate code directories create architectural confusion**
   - `src/gto-strategy/` (2 files) — duplicate of `src/gto/`, not imported by any file
   - `src/hand-history/services/` (2 files) — pure passthrough re-exports of `src/services/`
   - `src/replay/services/replay-service.ts` — 66-line implementation shadowed by 12-line stub in `src/features/replay/services/`
   - `src/statistics/services/stats-service.ts` — duplicate stub of `src/features/stats/services/`
   
   **Spec violation**: Tech-spec defines clean module boundaries; duplicate directories violate this structure.

5. **[5 files] Hardcoded `bigBlind = 2` instead of using constants.ts**
   - `src/engine/available-actions.ts:22`
   - `src/gto/bot-engine.ts:77`
   - `src/gto/bot-engine.ts:316`
   - `src/gto/ev-estimator.ts:37`
   - `src/services/hand-service.ts:6`
   
   `src/constants.ts` already defines `DEFAULT_BLINDS` but these files hardcode the value. If blinds change, 5 files must be manually updated.

6. **[RaiseControl.tsx] Raise callback is silently discarded**
   - `src/features/table/RaiseControl.tsx:10` — `void onRaise;` discards the callback prop
   - The raise button renders but clicking it does nothing. Spec T-016 requires a functional raise slider + numeric input.

7. **[PLChart.tsx] Chart data prop is silently discarded**
   - `src/features/stats/PLChart.tsx:9` — `void dataPoints;` discards the data prop
   - Renders `<div>PLChart</div>` instead of a Recharts line chart. Spec T-026 requires a P&L chart visualization.

8. **[Multiple pages] No error boundaries or error display on page components**
   - PokerTablePage, HandListPage, HandReplayPage, StatsPage, LobbyPage — none implement error boundaries or display error states from their data hooks.
   - **Spec non-functional requirement**: "Error: toast (light) / inline (forms) / full-screen (fatal)" per UX interaction patterns.

### Minor

9. **[CommunityCards.tsx, SeatLayout.tsx] Array index used as React key**
   - Anti-pattern that causes rendering issues on reorder. Cards should use a stable key like `${rank}${suit}`.

10. **[EmptyStateIllustration.tsx] Props interface naming inconsistency**
    - Interface named `EmptyStateProps` instead of `EmptyStateIllustrationProps`. Minor naming inconsistency.

11. **[tsconfig.app.json] `noUnusedLocals` and `noUnusedParameters` set to false**
    - Allows dead code to accumulate undetected. Should be `true` for production quality.

12. **[services/session-service.ts] Bot names hardcoded in Chinese**
    - `['鲨鱼哥', '疯狗', '铁壁', '小鱼', '平衡侠']` — should be extracted to constants for i18n readiness.

13. **[Multiple components] Hardcoded Chinese strings not extracted**
    - TopNavBar navigation labels, ConfirmDialog button text, ErrorFullScreen retry text, SkeletonLoader aria-labels — all hardcoded in Chinese.

14. **[services/db.ts] No error handling for IndexedDB failures**
    - No try-catch for connection failures, quota exceeded, or store operation errors.

15. **[ToastNotification.tsx] Magic number for auto-dismiss timeout**
    - `AUTO_DISMISS_MS = 4000` hardcoded inline instead of imported from constants.

### Suggestions

16. **Consider adding React Error Boundaries** at the page level to gracefully handle component crashes.

17. **Consider lazy-loading GTO data files** as specified in tech-spec non-functional requirements (code splitting per route is configured in vite.config.ts, but GTO JSON data loading strategy is not visible).

18. **Consider adding keyboard navigation to ActionPanel** as specified in tech-spec accessibility requirements (Tab between buttons, Enter to confirm).

---

## Module Quality Summary

| Module | Files | Engine/Logic | UI Components | Hooks/Services | Overall |
|--------|-------|-------------|---------------|----------------|---------|
| core | 10 | N/A | ✅ Complete | N/A | ✅ Good |
| game-engine | 7 | ✅ Complete | N/A | N/A | ✅ Good |
| gto-strategy | 8 | ✅ Complete | N/A | N/A | ✅ Good |
| hand-history | 6 | N/A | N/A | ✅ Complete | ✅ Good |
| poker-table | 16 | N/A | ⚠️ 5 placeholder | ⚠️ 2 stub hooks | ❌ Incomplete |
| lobby | 6 | N/A | ⚠️ 2 placeholder | ⚠️ 1 stub hook | ❌ Incomplete |
| replay | 17 | N/A | ⚠️ 5 placeholder | ⚠️ 3 stubs | ❌ Incomplete |
| statistics | 7 | N/A | ⚠️ 1 placeholder | ⚠️ 2 stubs | ❌ Incomplete |

**Bottom line**: The backend logic layer (game engine, GTO strategy, hand evaluation, persistence) is solid and well-implemented. The UI layer has extensive placeholder components and stub hooks that render the application non-functional for end users.
