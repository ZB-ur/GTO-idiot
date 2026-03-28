# UX Flows — GTO Idiot

## Interaction Patterns

| Pattern | Implementation |
|---------|---------------|
| Form validation | Real-time per-field on blur (bet amount) + submit validation |
| Error display | Toast for action errors / inline for invalid bet amounts |
| Loading — lists | Skeleton screen (hand history list) |
| Loading — buttons | Spinner inside button, button disabled |
| Empty state | Illustration + descriptive text + primary action CTA |
| Navigation | Top nav bar: Logo | Play | History | Stats |
| Destructive actions | Confirmation dialog (clear history) |
| Player action timeout | No timeout — user takes as long as needed |
| BOT thinking | 0.5–1.5s artificial delay with thinking indicator |
| Card animations | CSS transitions, 300ms duration |

---

## User Journeys

### Flow: landing-and-start (covers F-010)

**Happy Path:**
1. User opens app URL → Browser loads SPA; landing page renders with: product name "GTO Idiot", tagline "免费六人桌GTO策略练习器", hero illustration of a poker table, and a prominent "开始对战" button
2. User clicks "开始对战" → Router navigates to `/play`, game engine initializes a new 6-max table, user is seated at a random position with 100BB, 5 BOTs fill remaining seats
3. First hand begins automatically — blinds posted, cards dealt

**Error States:**
- Browser does not support IndexedDB → User sees full-screen error: "您的浏览器不支持本地存储，请使用最新版Chrome/Firefox/Edge"
- JS bundle fails to load → User sees static fallback page: "加载失败，请刷新页面重试" with a retry button

**Empty State:**
- N/A — landing page always has content

**Loading State:**
- Initial page load → Centered spinner with "GTO Idiot" logo and "加载中..." text
- Navigation to /play → Skeleton of table layout (grey ovals for seats, grey rectangle for board) for < 500ms while engine initializes

---

### Flow: play-hand (covers F-001, F-002, F-003, F-004, F-012)

**Happy Path:**
1. User sees the 6-max table: 6 seats arranged in oval layout labeled UTG/HJ/CO/BTN/SB/BB, each showing player nickname, chip count, and style tag (for BOTs). Dealer button (D) on BTN seat. Pot display in center reads "0"
2. Deal animation plays → Cards slide from deck position to each player. User's 2 hole cards appear face-up; BOT cards show card backs
3. SB and BB auto-post blinds → Chip animations move to pot area. Pot updates to "3" (1+2). Blind amounts shown next to SB/BB seats
4. Action indicator highlights first-to-act player (UTG). If BOT: thinking dots appear for 0.5–1.5s, then BOT acts (fold/call/raise). BOT action shown as text label ("Fold" / "Call 2" / "Raise 6") that fades after 1.5s. If fold, cards visually muck
5. Action proceeds clockwise. When it's user's turn → User's seat pulses with highlight border. Action panel appears at bottom of screen
6. **User action panel** displays context-aware buttons:
   - Facing a raise: **Fold** | **Call [amount]** | **Raise** (with amount input)
   - No bet to face: **Check** | **Bet** (with amount input)
   - Raise/Bet selected: slider appears (min raise to all-in), plus quick buttons: **1/3 Pot** | **1/2 Pot** | **2/3 Pot** | **Pot** | **All-in**. Numeric input field shows selected amount. **Confirm** button submits
7. User selects action → Action animates (chips slide to pot if bet/call/raise, cards muck if fold). Pot updates. Action panel disappears. Next player highlighted
8. When preflop action complete → 3 flop cards deal to board center with flip animation. New betting round begins from first active player after BTN
9. Repeat for turn (1 card) and river (1 card)
10. **Showdown**: If 2+ players remain after river action → All remaining players' hole cards flip face-up. Best hand highlighted with label (e.g., "Two Pair, Aces and Kings"). Pot chips animate to winner. Winner's seat flashes briefly
11. **Hand complete**: Results summary appears briefly (winner name, amount won). After 2s auto-dismiss, dealer button moves clockwise, next hand begins automatically

**Error States:**
- User enters bet amount below minimum raise → Inline error below input: "最小加注额为 [X]", Confirm button disabled
- User enters bet amount above current stack → Input auto-caps to all-in amount, label changes to "All-in [stack amount]"
- User enters non-numeric value → Input rejects character, no error shown (input mask)
- Game engine encounters unexpected state → Toast: "游戏状态异常，本局将重新开始" → Current hand discarded, new hand dealt

**Empty State:**
- N/A — table always has active game state once entered

**Loading State:**
- BOT decision: animated thinking dots "..." next to BOT's seat (0.5–1.5s)
- Between streets: brief pause (300ms) before community cards animate in
- Hand initialization: deal animation serves as loading indicator (~800ms)

---

### Flow: side-pot-resolution (covers F-001)

**Happy Path:**
1. Player A goes all-in for 50BB, Player B calls 50BB, Player C (bigger stack) raises to 100BB, Player B calls remaining
2. Engine creates Main Pot (50×3=150BB, all 3 eligible) and Side Pot (50×2=100BB, only B and C eligible)
3. UI shows stacked pot display: "主池 150" and "边池 100" in center
4. At showdown → Winner of each pot determined separately. Animation shows chip distribution per pot: main pot chips → winner A/B/C, then side pot chips → winner B/C
5. If main pot winner differs from side pot winner → Both highlighted sequentially with result labels

**Error States:**
- N/A — engine handles internally

**Empty State:**
- N/A

**Loading State:**
- Pot calculation is instant (< 16ms), no loading indicator needed

---

### Flow: hand-history-browsing (covers F-005, F-009)

**Happy Path:**
1. User clicks "历史记录" in top nav → Router navigates to `/history`
2. Page loads → List of completed hands displayed in reverse chronological order. Each row shows: date/time, user position (e.g., "BTN"), result (+25BB in green / -15BB in red), key hand star icon (filled if marked), and short summary (e.g., "AKs → Top Pair, won at showdown")
3. User scrolls down → Pagination loads next 50 hands (infinite scroll or "加载更多" button)
4. User clicks star icon on a hand → Star fills/unfills (toggle). Hand marked/unmarked as key hand. Toast: "已标记为关键手牌" / "已取消标记"
5. User clicks filter dropdown → Options: "全部手牌" | "仅关键手牌" | by position (UTG/HJ/CO/BTN/SB/BB). Selecting filter refreshes list
6. User clicks a hand row → Navigates to `/review/:handId` (post-game review flow)

**Error States:**
- IndexedDB read error → Toast: "读取历史记录失败，请刷新重试"
- Data corruption in a single record → Skip record, show remaining. Corrupted record shows "数据异常" in list with disabled click

**Empty State:**
- No hands played yet → Centered illustration (empty table icon) + "还没有对战记录" + "开始对战" button linking to `/play`

**Loading State:**
- Initial load → 5 skeleton rows (grey rectangles mimicking row layout) with pulse animation
- Pagination → Spinner at bottom of list while next page loads
- Filter change → List dims (opacity 0.6) briefly while re-querying IndexedDB

---

### Flow: auto-key-hand-marking (covers F-009, F-005, F-007)

**Happy Path:**
1. Hand completes → Engine calculates result
2. If user P/L exceeds ±20BB → Hand auto-flagged as key hand in IndexedDB record
3. If any user decision point has GTO data AND user action is a "severe deviation" (chose action with <10% GTO frequency) → Hand auto-flagged as key hand
4. In history list, auto-marked hands show filled star icon. Tooltip on hover: "自动标记：大额盈亏" or "自动标记：GTO偏差"

**Error States:**
- GTO data unavailable for deviation check → Skip GTO-based marking, only use P/L threshold
- IndexedDB write fails on marking → Silent failure, hand still saved without mark

**Empty State:**
- N/A

**Loading State:**
- Marking happens synchronously at hand end — no visible loading

---

### Flow: post-game-review (covers F-006, F-007, F-011)

**Happy Path:**
1. User clicks a hand from history → Router navigates to `/review/:handId`. Review page loads
2. Page renders: top area shows the poker table in read-only mode (same layout as play, but with review controls). Bottom area shows a timeline bar with dots for each decision point in the hand. Left sidebar shows hand summary (players, positions, final result)
3. Table initially shows the hand's starting state: all players seated, blinds posted, user's hole cards visible
4. User clicks "下一步" (forward) button or right arrow → Table advances to next action. The acting player's action appears (e.g., "UTG: Raise 6"). Cards/chips update accordingly
5. When reaching a **user decision point** →
   - User's actual action shown with a label: e.g., "你的操作: Call 6"
   - GTO panel appears on the right side showing:
     - **GTO推荐**: action distribution bar chart (e.g., Fold 15% | Call 45% | Raise 40%)
     - **你的操作** highlighted in the chart
     - Color coding: 🟢 Green border if user's action matches highest-frequency GTO action, 🟡 Yellow if user's action has ≥20% GTO frequency, 🔴 Red if user's action has <10% GTO frequency (severe deviation)
     - Brief text explanation: e.g., "GTO建议此处以45%频率跟注，你的跟注操作符合推荐"
   - GTO coverage indicator (small badge): "✓ GTO数据可用" (green) shown in corner
6. When reaching a user decision point **without GTO data** →
   - User's action shown normally
   - GTO panel shows: "此场景无GTO参考数据" with grey placeholder
   - Coverage indicator: "— 无GTO数据" (grey)
7. User clicks "上一步" (backward) → Table rewinds one action. All UI state reverses
8. User can click any dot on the timeline → Jumps directly to that decision point
9. At hand end → Final result displayed: showdown cards revealed, pot distribution shown, session P/L impact

**Error States:**
- Hand data not found in IndexedDB → Full-screen message: "未找到该牌局记录" + "返回历史记录" button
- GTO data file fails to parse → Toast: "GTO数据加载异常". Review continues without GTO annotations (all spots show "无GTO数据")
- Hand data partially corrupted → Show available data, skip corrupted decision points with note: "此步骤数据异常，已跳过"

**Empty State:**
- N/A — user always arrives from a specific hand selection

**Loading State:**
- Review page initial load → Table skeleton + "加载牌局数据..." text (IndexedDB read + GTO data lookup)
- GTO data lookup per decision point → Small spinner in GTO panel (< 200ms typical, pre-cached after first load)
- Stepping through actions → Instant (all data pre-loaded), card/chip transitions are animation-only (300ms)

---

### Flow: session-statistics (covers F-008)

**Happy Path:**
1. User clicks "统计" in top nav → Router navigates to `/stats`
2. Stats page loads with three sections:
   - **Overview cards** (top row): Total hands played | Total P/L (in BB) | bb/100 win rate | GTO conformance %
   - **Position breakdown** (middle): Table/chart showing per-position stats. Columns: Position | Hands | P/L | bb/100 | GTO %. Rows: UTG, HJ, CO, BTN, SB, BB
   - **GTO conformance** (bottom): Pie chart or bar showing % of decisions matching GTO across all reviewed hands
3. User clicks a position row (e.g., BTN) → Stats filter to show only BTN data. Overview cards update to BTN-only numbers. "筛选: BTN" chip appears with X to clear
4. User clicks X on filter chip → Returns to all-position view

**Error States:**
- IndexedDB read error → Toast: "统计数据加载失败" + retry button
- Calculation overflow (extremely unlikely) → Display "N/A" for affected metric

**Empty State:**
- No hands played → All metrics show "—". Centered message: "完成一些对战后，这里会显示你的统计数据" + "开始对战" button
- No reviewed hands (GTO conformance unavailable) → GTO conformance card shows "—" with tooltip: "完成赛后复盘后显示GTO符合度"

**Loading State:**
- Initial load → 4 skeleton cards (top row) + skeleton table (position breakdown) with pulse animation
- Filter change → Numbers fade out (200ms) → recalculate → fade in (200ms)

---

### Flow: gto-live-indicator (covers F-011)

**Happy Path:**
1. During active play, when it's user's turn → A small indicator badge appears near the action panel
2. If current spot has GTO reference data → Badge shows "📊 GTO" in subtle green. Tooltip on hover: "此场景有GTO参考数据，复盘时可查看"
3. If current spot has no GTO data → Badge shows "— GTO" in grey. Tooltip: "此场景暂无GTO参考数据"
4. Badge does NOT reveal the GTO recommendation during play (to avoid giving away the answer — learning requires independent thinking first)

**Error States:**
- GTO data lookup fails → Badge defaults to grey "— GTO" state (safe fallback)

**Empty State:**
- N/A

**Loading State:**
- GTO lookup for indicator → No visible loading (< 50ms lookup, done when user turn begins)

---

### Flow: deal-and-chip-animations (covers F-012)

**Happy Path:**
1. **New hand deal**: Cards slide from center-top (deck position) to each player seat, 100ms stagger per player. User's cards flip face-up on arrival (150ms flip). BOT cards remain face-down
2. **Flop deal**: 3 cards slide to board center simultaneously, then flip face-up one by one (100ms stagger)
3. **Turn/River deal**: Single card slides to board and flips face-up
4. **Bet/Call/Raise**: Chip icon slides from player seat to pot area (200ms). Pot number increments
5. **Pot won**: Chip icons slide from pot center to winner's seat (300ms). Winner's chip count increments
6. **Fold**: Player's cards slide to center and fade out (200ms)

**Error States:**
- Animation frame drop / low-end device → CSS `prefers-reduced-motion` media query disables animations. Instant state changes instead
- Browser tab not focused → Animations skip (requestAnimationFrame paused), state updates instantly on tab refocus

**Empty State:**
- N/A

**Loading State:**
- Animations ARE the loading state — they provide visual feedback during state transitions

---

## Component Inventory

### Layout Components
| Component | Description | Used In |
|-----------|-------------|---------|
| `AppShell` | Top nav bar + main content area + route outlet | All pages |
| `TopNav` | Navigation bar with Logo, Play, History, Stats links | All pages |
| `PageContainer` | Max-width centered content wrapper with padding | History, Stats, Landing |

### Landing Page Components
| Component | Description | Used In |
|-----------|-------------|---------|
| `LandingHero` | Product name, tagline, hero illustration, CTA button | landing-and-start |
| `StartButton` | Prominent "开始对战" button | landing-and-start |

### Table Components
| Component | Description | Used In |
|-----------|-------------|---------|
| `PokerTable` | Main table surface with oval layout, board area, pot display | play-hand, post-game-review |
| `Seat` | Player seat showing avatar/initials, nickname, chip count, position label, style tag | play-hand, post-game-review |
| `DealerButton` | "D" chip marker on current dealer seat | play-hand, post-game-review |
| `HoleCards` | 2-card display (face-up for user, face-down for BOTs) | play-hand, post-game-review |
| `CommunityBoard` | 3–5 community cards display in table center | play-hand, post-game-review |
| `Card` | Single playing card with suit/rank, supports face-up and face-down states | play-hand, post-game-review |
| `PotDisplay` | Center pot amount, supports main pot + side pots stacked | play-hand, post-game-review, side-pot |
| `BetChip` | Chip amount label shown next to a player's seat for current street bet | play-hand |
| `ActionHighlight` | Pulsing border/glow on active player's seat | play-hand |
| `BotThinkingIndicator` | Animated dots "..." shown when BOT is deciding | play-hand |
| `ActionLabel` | Temporary text label showing last action (e.g., "Raise 6"), fades after 1.5s | play-hand, post-game-review |
| `HandResultBanner` | Brief winner/amount display at hand conclusion | play-hand |

### Action Panel Components
| Component | Description | Used In |
|-----------|-------------|---------|
| `ActionPanel` | Container for all action buttons, visible only on user's turn | play-hand |
| `FoldButton` | Fold action button | play-hand |
| `CheckButton` | Check action button | play-hand |
| `CallButton` | Call action button with amount label | play-hand |
| `BetRaiseButton` | Bet/Raise toggle button that opens amount selector | play-hand |
| `AmountSelector` | Slider + numeric input + quick amount buttons (1/3, 1/2, 2/3, pot, all-in) | play-hand |
| `AmountSlider` | Range slider from min-raise to all-in | play-hand |
| `QuickAmountButton` | Preset amount button (1/3 pot, etc.) | play-hand |
| `ConfirmButton` | Confirm bet/raise amount submission | play-hand |
| `GtoCoverageIndicatorBadge` | Small badge showing GTO data availability for current spot | play-hand (gto-live-indicator) |

### History Components
| Component | Description | Used In |
|-----------|-------------|---------|
| `HandHistoryList` | Scrollable list of hand records with infinite scroll / pagination | hand-history-browsing |
| `HandHistoryRow` | Single hand record: date, position, result, summary, star icon | hand-history-browsing |
| `KeyHandStar` | Star icon toggle for marking/unmarking key hands | hand-history-browsing, auto-key-hand-marking |
| `HistoryFilter` | Dropdown filter: all / key hands only / by position | hand-history-browsing |
| `HistoryEmptyState` | Illustration + message + CTA for when no hands exist | hand-history-browsing |
| `HistorySkeletonRow` | Skeleton loading placeholder row | hand-history-browsing |
| `LoadMoreSpinner` | Spinner at list bottom for pagination loading | hand-history-browsing |

### Review Components
| Component | Description | Used In |
|-----------|-------------|---------|
| `ReviewPage` | Layout: table replay + timeline + GTO panel + hand summary | post-game-review |
| `ReviewTimeline` | Horizontal bar with dots for each decision point, clickable | post-game-review |
| `TimelineDot` | Single decision point on timeline, color-coded (green/yellow/red/grey) | post-game-review |
| `StepControls` | "上一步" / "下一步" navigation buttons | post-game-review |
| `GtoPanel` | Right-side panel showing GTO recommendation for current decision point | post-game-review |
| `GtoActionBar` | Horizontal stacked bar chart of action frequencies (fold/call/raise) | post-game-review |
| `GtoComparisonLabel` | "你的操作" highlight with color-coded border (green/yellow/red) | post-game-review |
| `GtoUnavailableNotice` | Grey placeholder: "此场景无GTO参考数据" | post-game-review |
| `GtoCoverageBadge` | "✓ GTO数据可用" or "— 无GTO数据" badge | post-game-review, gto-live-indicator |
| `HandSummary` | Left sidebar: players, positions, final result overview | post-game-review |

### Stats Components
| Component | Description | Used In |
|-----------|-------------|---------|
| `StatsPage` | Layout: overview cards + position breakdown + GTO conformance | session-statistics |
| `StatCard` | Single metric card (e.g., Total Hands, bb/100) with value and label | session-statistics |
| `PositionBreakdownTable` | Table with per-position stats, rows clickable for filtering | session-statistics |
| `GtoConformanceChart` | Pie or bar chart showing GTO match percentage | session-statistics |
| `PositionFilterChip` | Active filter indicator with X to clear | session-statistics |
| `StatsEmptyState` | Message + CTA for when no data available | session-statistics |
| `StatCardSkeleton` | Skeleton loading placeholder for stat cards | session-statistics |

### Shared Components
| Component | Description | Used In |
|-----------|-------------|---------|
| `Toast` | Transient notification popup (success/error/info) | Multiple flows |
| `ConfirmDialog` | Modal dialog for destructive action confirmation | hand-history (clear) |
| `SkeletonBlock` | Generic skeleton loading rectangle | Multiple flows |
| `Spinner` | Circular loading spinner | Multiple flows |
| `ErrorScreen` | Full-screen error with message and retry/back button | Browser compat, data not found |
| `EmptyStateIllustration` | Reusable illustration + text + CTA pattern | History, Stats |

---

## Coverage Matrix

| Feature | Flows |
|---------|-------|
| F-001 game-engine | play-hand, side-pot-resolution |
| F-002 player-actions | play-hand |
| F-003 bot-opponents | play-hand |
| F-004 table-ui | play-hand |
| F-005 hand-history-storage | hand-history-browsing, auto-key-hand-marking |
| F-006 post-game-review | post-game-review |
| F-007 gto-strategy-data | post-game-review, auto-key-hand-marking |
| F-008 session-stats | session-statistics |
| F-009 key-hand-marking | hand-history-browsing, auto-key-hand-marking |
| F-010 landing-page | landing-and-start |
| F-011 gto-coverage-indicator | post-game-review, gto-live-indicator |
| F-012 deal-animation | deal-and-chip-animations, play-hand |
