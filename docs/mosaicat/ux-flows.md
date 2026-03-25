# GTO Idiot — UX Flows

## Standard Interaction Patterns

| Pattern | Implementation |
|---------|---------------|
| Form validation | Real-time per-field on blur + full validation on submit |
| Error display | Inline below field (forms) / toast (actions) / full-screen (fatal) |
| Loading — lists | Skeleton screen |
| Loading — buttons | Spinner inside button, button disabled |
| Loading — data | Skeleton cards with pulse animation |
| Empty state | Illustration + descriptive text + primary action button |
| Navigation | Top nav bar with dark theme (desktop); hamburger menu for secondary pages |
| Destructive actions | Confirmation dialog before execution |
| Language switch | Instant swap, no page reload |
| Dark theme | Global dark background (#1a1a2e base), green felt table (#2d5a3d), high-contrast text |

---

## User Journeys

### Flow: landing-and-start (covers F-015, F-012, F-013)

**Happy Path:**
1. User opens app URL → System detects browser language, loads saved language preference from localStorage if exists, renders Landing Page with dark background, "GTO Idiot" logo, slogan, three value-prop cards ("免费/Free", "无需注册/No Sign-up", "打开即玩/Instant Play"), and a large "开始对战 / Start Game" CTA button. Top-right shows language toggle (中/EN).
2. User clicks language toggle → System instantly swaps all UI text to the other language, saves preference to localStorage.
3. User clicks "开始对战" → System navigates to seat-selection screen (→ game-setup flow).

**Returning User Happy Path:**
1. User opens app URL with existing history → System loads data from localStorage, renders Landing Page with modified CTA: "继续对战 / Continue Playing" as primary button plus a stats summary card showing: total hands played, overall win rate, GTO conformance %. "开始新对战 / New Game" as secondary button.
2. User clicks "继续对战" → System navigates to game table with previous settings restored.

**Error States:**
- localStorage unavailable (private browsing) → User sees toast notification: "浏览器存储不可用，本次对战数据将不会保存 / Browser storage unavailable, session data will not be saved". App continues in memory-only mode.
- Saved data corrupted → User sees toast: "历史数据读取失败，已重置 / History data corrupted, reset complete". System clears localStorage and starts fresh.

**Empty State:**
- First visit, no data → Landing page shows full value proposition layout with single "开始对战" CTA (no stats summary).

**Loading State:**
- Initial app load → Full-screen dark background with "GTO Idiot" logo and a subtle card-flip animation (< 2 seconds). localStorage data hydrates in background.

---

### Flow: game-setup (covers F-001, F-004, F-011)

**Happy Path:**
1. User sees seat selection screen → System renders an oval dark-green poker table with 6 seats arranged around it. Each seat shows its position label (UTG / MP / CO / BTN / SB / BB). All seats show "空位 / Empty" state with a subtle pulse. Below the table: a buy-in selector (default 100BB) and a "确认开始 / Confirm & Start" button (disabled until seat chosen).
2. User clicks a seat (e.g., BTN) → System highlights the selected seat with a bright border glow. The other 5 seats populate with BOT avatars, names, and style tags:
   - Seat 1: "Rock" (TAG紧凶) — stone icon
   - Seat 2: "Shark" (LAG松凶) — shark icon
   - Seat 3: "Turtle" (Nit紧弱) — turtle icon
   - Seat 4: "Fish" (Fish松弱) — fish icon
   - Seat 5: "Oracle" (GTO平衡) — crystal ball icon
   BOT assignment fills remaining seats in order. Each BOT shows name, icon, and style tag badge.
3. User adjusts buy-in slider (50BB–200BB, default 100BB) → System updates displayed chip count for all players in real-time.
4. User clicks "确认开始" → System transitions to game table. Chip stacks appear at each seat with a dealing animation. First hand begins (→ hand-play flow).

**Error States:**
- User clicks already-selected seat → System deselects it (toggle behavior), BOTs disappear, "确认开始" button disables again.
- User attempts to start without selecting seat → "确认开始" button remains disabled; no error needed (prevention over correction).

**Empty State:**
- N/A — this screen always has the 6-seat table structure.

**Loading State:**
- Transition to game table → Brief card-shuffle animation overlay (0.5s) while game engine initializes.

---

### Flow: hand-play (covers F-002, F-003, F-004, F-005, F-006, F-011)

**Happy Path:**
1. User sees game table in ready state → System shows: oval green table, 6 player seats with name/chips/position, empty community card area center-top, pot display showing "0" center, user's hole cards area at bottom (face down). Dealer button token on correct seat.

2. **Preflop — Deal:**
   System deals 2 hole cards to each player with animation → User's cards appear face-up in enlarged area at screen bottom. BOT cards show face-down. SB and BB auto-post blinds, pot updates. Action indicator moves to UTG.

3. **Preflop — BOT Actions (before user):**
   Current BOT's seat glows with highlight ring → After configured delay (default 2s per F-005), BOT action appears as floating label near seat ("Fold" / "Raise 2.5BB" / etc.) with brief animation → Label fades after 1.5s. Chips animate to pot if applicable. Action moves to next player.

4. **Preflop — User's Turn:**
   User's seat pulses. Action panel appears at bottom of screen showing only legal actions as buttons:
   - If no bet faced: [Check] [Bet ▼] [Fold]
   - If facing a bet: [Call $X] [Raise ▼] [Fold] [All-In]
   A turn timer bar (cosmetic, no time limit) subtly fills.

5. User clicks [Raise ▼] → System expands raise panel: a horizontal slider from min-raise to all-in, with preset buttons above: [1/3 Pot] [1/2 Pot] [2/3 Pot] [Pot]. Current raise amount shows in large text. [Confirm Raise] button at right.

6. User adjusts slider or clicks preset, then clicks [Confirm Raise] → Chips animate from user stack to pot area. User's bet amount shows in front of seat. Pot updates. Action panel hides. Next player's turn begins.

7. **Flop:** After preflop completes → 3 community cards dealt face-up to center with flip animation. New betting round starts (first to act is SB or next active player left of dealer).

8. **Turn:** After flop round completes → 4th community card dealt with flip animation. New betting round.

9. **River:** After turn round completes → 5th community card dealt with flip animation. Final betting round.

10. **Showdown:** After river round completes → Remaining players' hole cards flip face-up with reveal animation. Winning hand highlighted with glow. Best 5-card combination shown as tooltip. Pot slides to winner(s). Hand result summary appears briefly:
    - Winner name and hand rank
    - Pot amount won
    - +/- chips for user this hand

11. **Hand Record:** System silently records complete hand history (all actions, cards, pot, result) to localStorage (F-006).

12. **Next Hand:** After 2-second pause → Cards clear, dealer button moves, new hand begins automatically at step 2.

**All-In & Side Pot Path:**
- When a player goes all-in with less chips than others → System creates main pot (capped at all-in amount × number of players) and side pot(s). Side pot amounts display as stacked pot indicators. At showdown, each pot is awarded separately with sequential animations.

**Everyone Folds to User:**
- All BOTs fold → Pot slides to user immediately. BOT cards remain face-down. Brief "+X BB" popup on user seat. Next hand begins.

**User Folds:**
- User clicks [Fold] → User's cards gray out and flip face-down. Hand continues among remaining players at accelerated speed (half normal delay). Result shown, then next hand.

**Mid-Game Seat Change:**
- User opens settings during hand → "更换座位 / Change Seat" option shown as disabled with tooltip: "当前手牌结束后可更换 / Available after current hand". After hand ends, option enables. Clicking it returns to seat selection screen with chips preserved.

**Error States:**
- Illegal action attempted (should not happen due to UI filtering) → System ignores input, logs error internally.
- localStorage write fails during hand recording → Toast: "手牌记录保存失败 / Hand record save failed". Game continues; data exists only in memory for this session.
- Side pot edge case with 3+ all-ins at different amounts → System calculates all side pots; if calculation error occurs, toast "边池计算可能存在偏差 / Side pot calculation may have variance" and logs for debugging. [NEEDS CLARIFICATION: side pot完整实现的优先级]

**Empty State:**
- N/A — game always has active state once started.

**Loading State:**
- Card dealing → Card flip animation (0.3s per card).
- BOT thinking → Pulsing "..." indicator on BOT seat during configured delay.
- Pot calculation → Instant (client-side math).

---

### Flow: observation-and-speed (covers F-005, F-014)

**Happy Path:**
1. User clicks gear icon (⚙) on game table top-right → System shows settings overlay panel (semi-transparent dark modal) with:
   - **BOT速度 / BOT Speed**: Three radio-style buttons [🐢 慢速 2s / Slow] [⏱ 正常 1s / Normal] [⚡ 快速 0.3s / Fast]. Current selection highlighted (default: 慢速).
   - **语言 / Language**: Toggle [中文] [EN]
   - **更换座位 / Change Seat**: Button (disabled if hand in progress)
   - **清除数据 / Clear Data**: Red text button at bottom

2. User taps "正常 1s" → System immediately applies 1-second BOT delay. Selection updates visually. Setting saved to localStorage.

3. User closes settings (click outside or X button) → Overlay dismisses, game continues with new speed setting.

**Error States:**
- Setting fails to save to localStorage → Toast: "设置保存失败 / Settings save failed". Setting applies for current session only.

**Empty State:**
- N/A — settings always have default values.

**Loading State:**
- Settings panel open → Instant render, no loading needed.

---

### Flow: hand-replay (covers F-007, F-008)

**Happy Path:**
1. User navigates to "复盘 / Replay" from top navigation → System shows hand history list: each entry as a card showing hand #, date/time, user position, hole cards (mini icons), result (+/- BB), and GTO conformance badge (colored dot: green/yellow/red).

2. User clicks a hand entry → System renders the poker table in replay mode with a timeline control bar at bottom:
   - [⏮ Start] [◀ Prev] [▶ Next] [⏭ End] buttons
   - Step indicator: "Step 3 / 12"
   - Mini timeline with dots for each action, user's action dots colored by GTO rating

3. Table shows initial state: all cards face-down, blinds posted. User clicks [▶ Next] → First action replays. Each BOT/player action shows with the same floating label as live play.

4. **User Decision Point:** When replay reaches a step where user acted → System displays a split comparison panel below the table:
   - Left side: "你的选择 / Your Action" — shows what user did (e.g., "Raise 3BB") with chip amount
   - Right side: "GTO建议 / GTO Recommendation" — shows GTO optimal action (e.g., "Fold")
   - Color badge on the step: 🟢 Green = matches GTO, 🟡 Yellow = acceptable deviation, 🔴 Red = significant error
   - If 🔴 Red: A brief explanation appears below in a callout box (e.g., "此位置GTO建议fold，因为T9o不在UTG开牌范围内 / GTO recommends fold here — T9o is not in UTG open range")

5. User clicks through all steps → After final step, a hand summary card appears:
   - **GTO吻合度 / GTO Conformance**: X% (e.g., "2/3 decisions matched = 67%")
   - **关键偏差 / Key Deviations**: Bullet list of red/yellow decisions with brief reasons
   - **结果 / Result**: +/- BB
   - [返回列表 / Back to List] button and [下一手 / Next Hand] button

**Error States:**
- Hand data corrupted or incomplete → User sees inline message on the hand card: "数据不完整，无法回放 / Data incomplete, cannot replay". Card is non-clickable.
- GTO comparison data unavailable for a postflop decision → Comparison panel shows: "简化GTO参考不可用 / Simplified GTO reference unavailable" with gray badge.

**Empty State:**
- No hand history exists → Illustration of an empty poker table with text: "还没有对战记录 / No hand history yet" + CTA button "开始对战 / Start Playing".

**Loading State:**
- Hand list loading → 3 skeleton cards with pulse animation.
- Replay table rendering → Skeleton table outline fills in 0.3s.

---

### Flow: gto-comparison-engine (covers F-008, F-016)

**Happy Path (integrated into replay flow and live play recording):**
1. During live play, after each user decision → System silently queries internal GTO lookup:
   - **Preflop**: Maps (position, hand, facing_action) → GTO range table → returns recommended action + confidence
   - **Postflop**: Maps (board_texture_class, position, SPR_range, action_facing) → simplified strategy tree → returns recommended action + "简化GTO参考" flag
2. Comparison result is stored alongside the hand action record for later replay use.

**Postflop Strategy Reference (standalone):**
1. User navigates to "学习 / Learn" from top nav → System shows learning hub with two cards: "Preflop Range Chart" and "Postflop策略参考 / Postflop Strategy Reference".
2. User clicks "Postflop策略参考" → System shows strategy reference page organized by board texture:
   - **Dry Board** (e.g., K♠ 7♦ 2♣): Strategy cards for IP/OOP, high/low SPR
   - **Wet Board** (e.g., J♥ T♥ 8♠): Strategy cards
   - **Monotone Board** (e.g., 9♠ 6♠ 3♠): Strategy cards
   Each card shows: recommended frequencies (bet/check/fold), sizing suggestions, key principles. All marked with "简化GTO参考 / Simplified GTO Reference" badge.

**Error States:**
- GTO lookup returns no match (unusual hand/position combo) → System marks decision as "⬜ 无参考 / No Reference" (gray).
- Data file fails to load → Toast: "GTO数据加载失败 / GTO data load failed". Replay continues without comparison highlights.

**Empty State:**
- N/A — GTO tables are bundled with the app.

**Loading State:**
- GTO lookup during live play → Instant (in-memory hash map lookup, < 1ms).
- Strategy reference page → Skeleton cards while content renders.

---

### Flow: statistics-dashboard (covers F-009, F-017)

**Happy Path:**
1. User navigates to "统计 / Stats" from top nav → System loads statistics from localStorage, renders dashboard with dark card layout:

   **Top Row — Key Metrics (4 cards):**
   - 总手数 / Total Hands: number
   - 总盈亏 / Total P&L: ±XXX BB (green if positive, red if negative)
   - 整体胜率 / Win Rate: XX% (hands won / total)
   - GTO吻合度 / GTO Conformance: XX%

   **Middle Row — Trend Chart:**
   - Line chart showing GTO conformance over time (X-axis: hand groups of 10, Y-axis: conformance %). Dark background, green line, subtle grid.

   **Bottom Row — Common Errors:**
   - Sorted list of error categories as expandable cards:
     - "UTG位置过度open / Over-opening from UTG" — 15次 (23%)
     - "面对3-bet过多call / Calling 3-bets too wide" — 12次 (18%)
     - "河牌圈过度bluff / Over-bluffing on river" — 8次 (12%)
     - etc.

2. User clicks an error category card → Card expands to show:
   - Brief explanation of the error pattern (F-017)
   - Why it's a leak in GTO terms
   - One-sentence improvement tip
   - [查看相关手牌 / View Related Hands] button → navigates to replay list filtered by this error type

**Error States:**
- Statistics data corrupted → Toast: "统计数据异常，正在重新计算 / Stats data anomaly, recalculating". System recalculates from raw hand history.
- Recalculation also fails → Full-screen error: "数据已损坏，请在设置中重置 / Data corrupted, please reset in settings". Link to settings page.

**Empty State:**
- No history data (0 hands) → Illustration of a bar chart outline with text: "完成你的第一局对战来查看统计 / Complete your first session to see stats" + CTA "开始对战 / Start Playing".
- Fewer than 10 hands → Key metrics show with note: "数据量较少，趋势图需至少10手 / Insufficient data, trend chart requires 10+ hands". Trend chart area shows placeholder with progress indicator "3/10 hands".

**Loading State:**
- Dashboard initial load → 4 skeleton metric cards + skeleton chart area + 3 skeleton error list items.
- Stats recalculation → Spinner overlay on dashboard with "重新计算中... / Recalculating...".

---

### Flow: preflop-range-chart (covers F-010)

**Happy Path:**
1. User navigates to "学习 / Learn" → clicks "Preflop Range Chart" card → System renders 13×13 matrix grid:
   - Rows: A, K, Q, J, T, 9, 8, 7, 6, 5, 4, 3, 2
   - Columns: A, K, Q, J, T, 9, 8, 7, 6, 5, 4, 3, 2
   - Diagonal cells = pocket pairs (AA, KK, etc.) — distinct border style
   - Above diagonal = suited hands (AKs, AQs...) — "s" suffix, slightly different bg tint
   - Below diagonal = offsuit hands (AKo, AQo...) — "o" suffix
   - Default: no position selected, all cells neutral gray

2. User selects position from tab bar above chart: [UTG] [MP] [CO] [BTN] [SB] [BB] → System highlights cells in the selected position's open-raise range with gradient color (brighter = higher frequency). Out-of-range cells remain dark gray.

3. User selects action scenario from secondary tab: [Open Raise] [vs 3-Bet] [vs 4-Bet] → Range highlights update to reflect the selected scenario for the selected position.

4. User taps/hovers a specific cell (e.g., "ATs") → Tooltip shows: hand name, action recommendation (Raise/Call/Fold), frequency if mixed strategy (e.g., "Raise 70% / Fold 30%").

**In-Game Quick Access:**
1. During hand-play, user clicks 📊 icon at top of screen → Range chart slides in as a right-side panel overlay (40% width on desktop). Current user position auto-selected. Game table remains visible on left.
2. User references chart → closes panel by clicking X or clicking on table area. Game is not interrupted.

**Error States:**
- Range data file fails to load → Chart area shows: "Range数据加载失败 / Range data failed to load" with [重试 / Retry] button.

**Empty State:**
- N/A — chart is always populated from bundled data.

**Loading State:**
- Chart page load → 13×13 skeleton grid with pulse animation (< 0.5s).
- Position switch → Instant re-color (client-side data, no fetch).

---

### Flow: data-management (covers F-013, F-006)

**Happy Path:**
1. System auto-saves after each hand → Hand record serialized to JSON, appended to localStorage hand history array. Stats incrementally updated.
2. System checks storage on each save → If localStorage usage > 4MB, triggers auto-cleanup:
   - Toast notification: "存储空间不足，正在清理旧记录 / Storage full, cleaning old records"
   - Removes oldest hand records, keeping most recent 500
   - Toast: "已清理至500手记录 / Cleaned to 500 hand records"

**Data Reset:**
1. User opens settings → clicks "清除所有数据 / Clear All Data" → Confirmation dialog appears:
   - Title: "确认清除 / Confirm Clear"
   - Body: "这将删除所有对战记录、统计数据和设置。此操作不可撤销。/ This will delete all game history, statistics, and settings. This action cannot be undone."
   - [取消 / Cancel] [确认清除 / Confirm Clear (red)]
2. User clicks "确认清除" → System clears all localStorage data. Toast: "所有数据已清除 / All data cleared". Redirects to landing page.

**Error States:**
- localStorage quota exceeded unexpectedly → System attempts cleanup. If still fails, toast: "存储写入失败 / Storage write failed". Data preserved in memory for current session.
- Data migration needed (schema version change) → System auto-migrates on load. If migration fails, prompts: "数据格式已更新，旧数据无法兼容，是否重置？/ Data format updated, old data incompatible. Reset?" with confirm dialog.

**Empty State:**
- N/A — data management operates silently in background.

**Loading State:**
- Data save → Invisible (async, non-blocking).
- Data load on app start → Part of initial loading animation (landing-and-start flow).

---

### Flow: i18n-language-switch (covers F-012)

**Happy Path:**
1. User sees language toggle on any page (top nav area) showing current language: [中] or [EN] → User clicks toggle → All visible UI text instantly swaps to the other language. No page reload. Poker terms use idiomatic expressions for each language (e.g., "加注" not "Raise的中文翻译"). Setting saved to localStorage.

**Scope of Translation:**
- All navigation labels
- All button text
- All settings labels and options
- All GTO explanations and tips
- All error messages and toasts
- All empty state messages
- Poker position labels (keep standard: UTG/MP/CO/BTN/SB/BB in both languages)
- Poker action labels: Fold/弃牌, Check/过牌, Call/跟注, Bet/下注, Raise/加注, All-In

**Error States:**
- Translation key missing → Falls back to English. Logs warning internally.

**Empty State:**
- N/A.

**Loading State:**
- Language switch → Instant (all translations bundled in app, no network fetch).

---

## Component Inventory

### Layout Components
| Component | Description | Used In |
|-----------|-------------|---------|
| `AppShell` | Top nav + main content area, dark theme wrapper | All pages |
| `TopNav` | Navigation bar with logo, page links (对战/复盘/学习/统计), language toggle, settings gear | All pages |
| `PageContainer` | Max-width centered content wrapper with padding | All pages |

### Landing Page Components
| Component | Description | Used In |
|-----------|-------------|---------|
| `LandingHero` | Logo, slogan, value prop cards, CTA button | landing-and-start |
| `ValuePropCard` | Icon + title + description card for feature highlights | landing-and-start |
| `ReturningUserBanner` | Stats summary + "继续对战" CTA for returning users | landing-and-start |

### Game Table Components
| Component | Description | Used In |
|-----------|-------------|---------|
| `PokerTable` | Oval green felt table with seats arranged around perimeter | game-setup, hand-play, hand-replay |
| `PlayerSeat` | Seat showing player name, avatar/icon, chip count, position label, action state, highlight ring | game-setup, hand-play, hand-replay |
| `BotAvatar` | Icon + name + style tag badge for each BOT | game-setup, hand-play |
| `SeatSelector` | Clickable empty seat with pulse animation for selection | game-setup |
| `DealerButton` | Dealer token indicator on current dealer seat | hand-play, hand-replay |
| `CommunityCards` | 3-5 card display area at table center | hand-play, hand-replay |
| `PotDisplay` | Central pot amount display, supports multiple pots (main + side) | hand-play, hand-replay |
| `PlayerBetChips` | Chip amount display in front of each seat for current round bets | hand-play, hand-replay |
| `HoleCards` | Enlarged 2-card display at bottom for user's cards | hand-play, hand-replay |
| `PlayingCard` | Individual card with rank + suit, supports face-up/face-down/highlighted states | hand-play, hand-replay, preflop-range-chart |
| `ActionLabel` | Floating label showing BOT action type + amount near seat, auto-fades | hand-play, hand-replay |
| `ActionIndicator` | Pulsing highlight ring on currently-acting player's seat | hand-play |
| `BuyInSlider` | Slider for selecting buy-in amount (50-200BB) | game-setup |

### Action Panel Components
| Component | Description | Used In |
|-----------|-------------|---------|
| `ActionPanel` | Bottom panel with legal action buttons | hand-play |
| `ActionButton` | Styled button for Fold/Check/Call/Bet/Raise/All-In | hand-play |
| `RaiseSlider` | Horizontal slider from min-raise to all-in with amount display | hand-play |
| `RaisePresetButtons` | Quick-select buttons: 1/3 pot, 1/2 pot, 2/3 pot, pot | hand-play |
| `ConfirmButton` | Primary action confirmation button | hand-play |

### Replay Components
| Component | Description | Used In |
|-----------|-------------|---------|
| `HandHistoryList` | Scrollable list of hand record cards | hand-replay |
| `HandHistoryCard` | Summary card: hand #, date, position, cards, result, GTO badge | hand-replay |
| `ReplayControls` | Timeline control bar: prev/next/start/end buttons + step indicator | hand-replay |
| `ReplayTimeline` | Mini dot timeline showing all actions, colored by GTO rating | hand-replay |
| `GtoComparisonPanel` | Split panel showing user action vs GTO recommendation | hand-replay |
| `GtoColorBadge` | Green/yellow/red circle badge for GTO conformance | hand-replay, statistics |
| `GtoReasonCallout` | Callout box with explanation for red-flagged decisions | hand-replay |
| `HandSummaryCard` | End-of-replay summary: conformance %, deviations, result | hand-replay |

### Statistics Components
| Component | Description | Used In |
|-----------|-------------|---------|
| `StatsDashboard` | Dashboard layout for statistics page | statistics-dashboard |
| `MetricCard` | Single KPI card: label + large number + optional color/trend | statistics-dashboard |
| `TrendChart` | Line chart for GTO conformance over time | statistics-dashboard |
| `ErrorCategoryList` | Sorted list of common error types | statistics-dashboard |
| `ErrorCategoryCard` | Expandable card: error name, count, %, explanation, improvement tip | statistics-dashboard, error-type-learning |
| `EmptyStatsPlaceholder` | Illustration + text + CTA for no-data state | statistics-dashboard |

### Learning Components
| Component | Description | Used In |
|-----------|-------------|---------|
| `LearningHub` | Hub page with cards for Range Chart and Postflop Reference | preflop-range-chart, gto-comparison-engine |
| `RangeChart` | 13×13 matrix grid for preflop hand ranges | preflop-range-chart |
| `RangeCell` | Individual cell in range chart: hand label + color fill by frequency | preflop-range-chart |
| `PositionTabs` | Tab bar for position selection (UTG/MP/CO/BTN/SB/BB) | preflop-range-chart |
| `ScenarioTabs` | Tab bar for action scenario (Open Raise / vs 3-Bet / vs 4-Bet) | preflop-range-chart |
| `RangeCellTooltip` | Tooltip on hover: hand name, action, frequency | preflop-range-chart |
| `RangeChartOverlay` | Slide-in side panel for in-game range chart access | hand-play |
| `PostflopStrategyPage` | Strategy reference organized by board texture categories | gto-comparison-engine |
| `BoardTextureSection` | Section for dry/wet/monotone board strategies | gto-comparison-engine |
| `StrategyCard` | Strategy advice card with position, SPR, recommended actions | gto-comparison-engine |
| `SimplifiedGtoBadge` | "简化GTO参考" disclaimer badge | gto-comparison-engine, hand-replay |

### Settings Components
| Component | Description | Used In |
|-----------|-------------|---------|
| `SettingsOverlay` | Semi-transparent modal with settings options | observation-and-speed |
| `SpeedSelector` | Three radio-style buttons for BOT speed selection | observation-and-speed |
| `LanguageToggle` | Two-option toggle for 中文/English | All pages (in TopNav) |
| `ClearDataButton` | Red destructive action button for data reset | observation-and-speed |

### Shared Components
| Component | Description | Used In |
|-----------|-------------|---------|
| `ConfirmDialog` | Modal dialog with title, body, cancel + confirm buttons | data-management, observation-and-speed |
| `Toast` | Non-blocking notification popup, auto-dismisses | All flows (errors, confirmations) |
| `SkeletonCard` | Pulse-animated placeholder card | hand-replay, statistics, preflop-range-chart |
| `SkeletonGrid` | Skeleton version of the range chart 13×13 grid | preflop-range-chart |
| `SkeletonTable` | Skeleton version of poker table during load | hand-replay |
| `EmptyStateBlock` | Reusable illustration + text + CTA layout for empty states | hand-replay, statistics |
| `LoadingOverlay` | Full-screen or section-level spinner/animation overlay | landing-and-start, game-setup |
| `AppLoadingScreen` | Initial app load screen with logo + card-flip animation | landing-and-start |