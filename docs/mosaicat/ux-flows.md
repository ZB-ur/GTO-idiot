# UX Flows — GTO Idiot (德州扑克GTO策略练习器)

---

## Interaction Patterns

| Pattern | Implementation |
|---------|---------------|
| Form validation | Real-time per-field on blur (bet sizing) + full validation on submit |
| Error display | Toast (action errors) / inline (invalid bet) / full-screen (fatal: IndexedDB unavailable) |
| Loading — lists | Skeleton screen (hand history list) |
| Loading — buttons | Spinner inside button, button disabled |
| Loading — data | Progress bar with percentage (GTO postflop data lazy load) |
| Empty state | Illustration + descriptive text + primary action button |
| Navigation (mobile) | Bottom tab bar: 牌桌 / 历史 / 学习进度 |
| Navigation (desktop) | Top nav bar: 牌桌 / 历史记录 / 学习进度 |
| Destructive actions | Confirmation dialog (clear history, leave session) |
| Language | All UI in Chinese; poker terms show bilingual (中/EN) |

---

## User Journeys

### Flow: instant-play (covers F-012, F-010, F-011)

**Happy Path:**
1. User opens app URL → System renders landing page with hero illustration of a 6-max poker table, tagline "零门槛GTO策略练习" and a prominent "开始对战" CTA button. All text in Chinese.
2. User clicks "开始对战" → System initializes a new session: assigns 6 players (1 user + 5 BOTs) each 100BB (10,000 chips, blinds 50/100), randomizes seat positions, assigns BOT styles, stores session in memory.
3. System deals first hand within 30 seconds of page load → User sees the table UI with their 2 hole cards face-up, BOT cards face-down, blinds posted, pot displayed.
4. Outcome: User is in an active hand ready to make their first decision.

**Error States:**
- Browser does not support IndexedDB → User sees full-screen error: "您的浏览器不支持本地存储，请升级到 Chrome 90+ / Firefox 90+ / Safari 15+ / Edge 90+" with links to download.
- JavaScript disabled → User sees `<noscript>` message: "请启用 JavaScript 以使用 GTO Idiot"
- GTO preflop data fails to load → User sees toast: "GTO数据加载失败，提示功能暂不可用，但对局可正常进行" + "重试" button. Game proceeds without hints.

**Empty State:**
- First visit, no prior session → Landing page with "开始对战" CTA. No history or progress sections visible from landing.

**Loading State:**
- Page load: Skeleton of poker table (gray seat placeholders, empty card slots) with centered spinner + "加载中..."
- GTO preflop data: Small progress indicator in corner, non-blocking. Table renders first, data loads in background.

---

### Flow: poker-hand-lifecycle (covers F-001, F-002, F-009, F-014)

**Happy Path:**
1. User sees the 6-max table with positions labeled (UTG / HJ / CO / BTN / SB / BB) in bilingual format (e.g., "枪口位 UTG"). BOT seats show name, chip count, and style tag (e.g., "Bot-A · 紧凶 TAG"). Current dealer has BTN chip icon.
2. System posts blinds automatically → SB posts 50, BB posts 100. Pot shows "底池 Pot: 150". Chip counts update for SB/BB.
3. System deals 2 hole cards to each player → User sees their 2 cards face-up with card rank/suit. BOT cards show card-back design.
4. Preflop action begins at UTG → System highlights UTG seat with a glowing border and countdown timer (15s). If BOT, BOT "thinks" for 0.5-2s then acts. Action label appears briefly on seat (e.g., "弃牌 Fold" / "加注到 Raise to 300").
5. Action rotates clockwise through each position → Each active player's seat highlights in turn. Pot updates after each action. Previous actions show as faded labels.
6. When action reaches User → Decision panel appears (see player-action flow). Seat highlights with distinct color. Timer starts.
7. After preflop action completes → System deals Flop (3 community cards) with flip animation into center. Street label shows "翻牌 Flop". Pot resets action tracking.
8. Flop/Turn/River action rounds repeat steps 4-7 → Turn deals 1 card, River deals 1 card. Each card appears with flip animation.
9. Showdown (if 2+ players remain after River) → Remaining players' hole cards flip face-up one by one. System evaluates hands, displays hand rank labels (e.g., "两对 Two Pair — A♠A♣7♦7♥K♠"). Best hand highlighted. Pot awarded with chip animation flowing to winner(s).
10. If side pots exist → System resolves each side pot separately, showing side pot amounts and eligible players for each. Awards animate sequentially.
11. Hand complete → Results banner shows briefly ("你赢得 +2,400" or "你输了 -300"). Hand auto-saves to IndexedDB. After 3s pause, next hand begins with BTN rotating clockwise one position.
12. Outcome: Continuous play loop, positions rotate each hand, chips persist within session.

**Error States:**
- Deck exhaustion (impossible in Hold'em but defensive) → System logs error silently, reshuffles, continues.
- BOT decision timeout (>2s internal) → BOT defaults to Fold, action continues. No user-visible error.
- Hand evaluation edge case (split pot miscalculation) → System logs, awards pot evenly if ambiguous. Toast: "底池已均分"

**Empty State:**
- N/A — this flow only triggers during active play.

**Loading State:**
- Between hands: Brief 1-2s pause showing "下一手..." label in center. Dealer chip animates to new position. Cards clear with fade animation.
- BOT thinking: Animated ellipsis "..." on BOT seat + subtle pulse on seat border. Duration 0.5-2s randomized per BOT.

---

### Flow: player-decision (covers F-003, F-005, F-004)

**Happy Path:**
1. User's turn arrives → Decision panel slides up from bottom (mobile) or appears as fixed panel below table (desktop). Panel shows only legal actions as buttons:
   - No prior bet this street: "过牌 Check" | "下注 Bet" | "弃牌 Fold"
   - Facing a bet: "跟注 Call [amount]" | "加注 Raise" | "弃牌 Fold" | (if chips < min raise) "全下 All-in [amount]"
2. GTO hint area appears above/beside decision panel (based on hint level setting):
   - **Level 1** (default): Compact badge — "💡 建议：加注 Raise"
   - **Level 2**: Badge + one-line reason — "💡 建议：加注 Raise — 你在BTN位持有强牌，应加注获取价值"
   - **Level 3**: Full strategy breakdown card — "弃牌 Fold 0% · 跟注 Call 35% · 加注 Raise 65%" with horizontal bar chart
3. User taps hint level toggle (1→2→3→1 cycle button) → Hint content updates instantly with crossfade animation.
4. User selects "下注 Bet" → Sizing sub-panel expands showing preset buttons: "1/3 底池" | "1/2 底池" | "2/3 底池" | "底池" + custom slider (min bet to all-in range) with live amount display.
5. User selects a sizing (e.g., "1/2 底池") → Amount populates (e.g., "下注 750"). "确认 Confirm" button activates.
6. User taps "确认" → Action executes immediately. Decision panel collapses. Table updates: user's chips decrease, pot increases, action label shows on user's seat ("下注 Bet 750"). Turn passes to next player.
7. Outcome: User's action recorded, game continues.

**Error States:**
- User tries to bet below minimum → Slider snaps to minimum. Inline hint below slider: "最小下注: [amount]"
- User tries to bet more than their stack → Slider caps at stack. Button changes to "全下 All-in [amount]"
- GTO data unavailable for current scenario → Hint area shows: "📊 此场景暂无GTO数据" with muted styling. Labeled as informational, not an error.
- GTO data still loading → Hint area shows: spinner + "GTO数据加载中..."
- Decision timer expires (15s) → Auto-action: Check if available, otherwise Fold. Toast: "超时自动操作"

**Empty State:**
- N/A — panel only appears when it's user's turn with valid actions.

**Loading State:**
- Decision panel appearing: Slide-up animation 200ms.
- GTO hint loading: Skeleton text line (gray bar) in hint area, resolves in <100ms for preflop, may take 200-500ms for postflop lazy-loaded scenarios.
- Confirm button after tap: Button shows spinner, disables for 300ms to prevent double-tap.

---

### Flow: gto-data-loading (covers F-004)

**Happy Path:**
1. App initializes → System loads preflop GTO data bundle (<2MB) during initial page load. Progress shown in landing page loading state.
2. User enters first hand → Preflop GTO queries resolve instantly from in-memory data.
3. Hand reaches Flop → System triggers lazy load of relevant postflop scenario data. Small non-blocking indicator in hint area: "加载翻牌后GTO数据..."
4. Postflop data chunk loads → Hint area updates with GTO recommendation. Data cached in memory for session.
5. Outcome: GTO data available at each decision point with appropriate precision labels.

**Error States:**
- Preflop data corrupted/failed parse → Toast: "Preflop GTO数据加载异常，提示功能暂不可用" + retry button. Game continues without hints.
- Postflop chunk network error (if hosted separately) → Hint area: "📊 此场景GTO数据加载失败" + "重试" link.
- Postflop scenario not in database → Hint area: "📊 此场景暂无GTO数据（简化GTO仅覆盖常见场景）" — precision label: "简化GTO参考"

**Empty State:**
- N/A — data is either loaded or shows "unavailable" messaging.

**Loading State:**
- Preflop bundle: Progress bar during app init (part of landing page load).
- Postflop chunk: Inline spinner in GTO hint area. Non-blocking — user can act without waiting.

---

### Flow: hand-history-save (covers F-006)

**Happy Path:**
1. Hand reaches conclusion (showdown or all fold) → System automatically serializes complete hand record: hand ID, timestamp, all player hole cards (shown at showdown), community cards, action sequence per street with amounts, final pot distribution, user P&L.
2. System writes record to IndexedDB `hands` store → Write completes silently in background. No user interaction required.
3. Record size: <10KB per hand. Supports 10,000+ hands.
4. Outcome: Hand history persisted, available across browser sessions.

**Error States:**
- IndexedDB write fails (storage full) → Toast: "存储空间不足，历史记录可能无法保存。建议清理旧记录。" Game continues normally.
- IndexedDB unavailable (private browsing mode in some browsers) → Toast on session start: "当前浏览模式不支持数据持久化，关闭后历史记录将丢失" — game still works, data held in memory only.

**Empty State:**
- N/A — saving is automatic and invisible.

**Loading State:**
- N/A — writes are async and non-blocking. No user-visible loading state.

---

### Flow: hand-history-browsing (covers F-008, F-007)

**Happy Path:**
1. User navigates to "历史记录" tab → System queries IndexedDB for all saved hands, ordered by timestamp descending.
2. User sees hand history list → Each row shows: date/time, user's hole cards (mini card icons), result (green "+2,400" or red "-300"), GTO score (e.g., "GTO得分: 82/100") as colored badge.
3. User scrolls through list → Virtual list renders smoothly, loading 50 items at a time. Scroll is fluid.
4. User taps a hand record → System transitions to review (replay) view for that hand.
5. Outcome: User can browse all past hands and enter review for any of them.

**Error States:**
- IndexedDB read fails → Full-area error: "读取历史记录失败" + "重试" button.
- Data corrupted for a specific hand → That row shows: "⚠️ 记录损坏" in muted text. Tap shows toast: "此记录无法加载"

**Empty State:**
- No hands played yet → Centered illustration (empty card table sketch) + text "还没有对战记录" + "开始对战" CTA button.

**Loading State:**
- List loading: 6 skeleton rows (gray bars for cards, text, score) with subtle shimmer animation.
- Entering a hand detail: Brief spinner overlay while deserializing hand data.

---

### Flow: post-game-review (covers F-007, F-005, F-004)

**Happy Path:**
1. User enters review for a specific hand (from history list or end-of-hand prompt) → System loads full hand record. Review interface renders: miniature table view at top, timeline scrubber at bottom, detail panel in middle.
2. User sees initial state: Preflop with positions, hole cards, blinds posted → Timeline shows all decision points as dots. User's decision points are colored (green/yellow/red based on GTO alignment). Current position highlighted.
3. User sees first decision point detail panel:
   - Left column: "你的操作: 跟注 Call 200" with action icon
   - Right column: "GTO建议: 加注 Raise 65% / 跟注 Call 35% / 弃牌 Fold 0%"
   - Color indicator: Yellow dot (acceptable deviation — user chose Call which has 35% GTO frequency)
   - Explanation text: "你选择了跟注，GTO在此场景更倾向加注(65%)以获取价值，但跟注也在混合策略内。"
4. User clicks "下一步 ▶" → Timeline advances to next decision point. Table view updates to show board at that street. New comparison renders.
5. Color coding at each decision:
   - 🟢 Green: User action matches highest-frequency GTO action OR user action has ≥40% frequency in GTO mix
   - 🟡 Yellow: User action has 10-39% frequency in GTO mix
   - 🔴 Red: User action has <10% frequency in GTO mix (or 0% — pure mistake)
6. User clicks "◀ 上一步" → Timeline goes back. User can freely navigate.
7. User reaches end of hand → Summary card appears:
   - "GTO得分: 74/100"
   - Decision breakdown: "✅ 正确 2 · ⚠️ 偏差 1 · ❌ 错误 1"
   - "最大失误: 翻牌圈 — GTO建议弃牌(92%)但你选择了跟注"
   - "返回列表" and "复盘下一手" buttons
8. Outcome: User understands each mistake with visual clarity and GTO context.

**Error States:**
- GTO data unavailable for a decision point → That point shows: "📊 此场景暂无GTO数据" — decision point rendered in gray (neutral), excluded from GTO score calculation.
- Hand record incomplete (edge case) → Toast: "部分数据缺失，复盘可能不完整" — available points still render.

**Empty State:**
- N/A — user always enters review with a specific hand selected.

**Loading State:**
- Review interface loading: Skeleton table + skeleton timeline (5 gray dots) + skeleton detail panel. Resolves in <500ms from IndexedDB.
- GTO data for postflop points: Inline spinner in GTO recommendation column. Loads lazily per decision point.

---

### Flow: session-management (covers F-010)

**Happy Path:**
1. User is in active session, playing hands → Top bar shows: "Session #1 · 手数: 15 · 筹码: 12,400 (▲+2,400)" in compact format.
2. User continues playing → Chip count and P&L update after each hand. Hand counter increments.
3. User wants to end session → Clicks "结束对战" button (top bar) → Confirmation dialog: "确定结束当前对战？你的筹码变化已自动保存。" with "结束" / "继续" buttons.
4. User confirms → System saves final session state. Returns to landing page. Session summary toast: "本次对战: 25手 · 盈亏 +3,200"
5. User starts new session → Clicks "开始对战" → Fresh session: all players reset to 100BB.
6. Outcome: Clean session lifecycle with persistent hand records.

**Error States:**
- Browser closed mid-session without ending → On next visit, no session resume (by design — only hand histories persist, not live session state). User starts fresh.
- Player busts (0 chips) → Dialog: "你的筹码已耗尽！" with "重新开始 (100BB)" CTA. Session stats shown.
- BOT busts (0 chips) → BOT is eliminated from remaining hands in session. If <2 players remain, session auto-ends with summary.

**Empty State:**
- No active session → Landing page with "开始对战" CTA (same as instant-play flow).

**Loading State:**
- Session initialization: Brief spinner on "开始对战" button (300ms) while shuffling deck, assigning positions, dealing.

---

### Flow: learning-progress (covers F-013)

**Happy Path:**
1. User navigates to "学习进度" tab → System queries IndexedDB for all hand records, aggregates GTO scores.
2. User sees progress dashboard:
   - **GTO得分趋势图**: Line chart (x-axis: hand number or date, y-axis: GTO score 0-100). Moving average line overlaid.
   - **常见错误模式** section: Cards showing top 3 weakness areas, e.g.:
     - "🔴 SB位3bet频率过低 — 你的: 8% · GTO标准: 18%"
     - "🔴 面对翻牌圈持续下注时弃牌过多 — 你的弃牌率: 65% · GTO参考: 42%"
     - "🟡 CO位开牌范围偏紧 — 你的: 22% · GTO标准: 28%"
   - **总对局数** and **平均GTO得分** summary cards.
3. User taps a weakness card → Expanded view shows relevant hand examples (links to specific hand reviews).
4. Outcome: User identifies and focuses on weakest areas.

**Error States:**
- Insufficient data for meaningful analysis (<10 hands) → Section shows: "需要更多对局数据（至少10手）来生成分析" with progress bar showing X/10.
- IndexedDB read error → "加载学习数据失败" + "重试" button.

**Empty State:**
- No hands played → Centered illustration (growth chart sketch) + "开始对战积累数据，解锁学习进度分析" + "开始对战" CTA.

**Loading State:**
- Dashboard loading: Skeleton chart (gray rectangle) + 3 skeleton cards. Computation may take 200-500ms for large datasets.
- Trend chart rendering: Chart area shows spinner while calculating aggregations.

---

### Flow: gto-hint-level-toggle (covers F-005)

**Happy Path:**
1. User is at a decision point, sees Level 1 hint by default → Compact badge: "💡 建议：加注 Raise"
2. User taps hint level toggle button (shows current level: "提示 Lv.1") → Level cycles to 2. Badge expands to show reason: "💡 建议：加注 Raise — 你在CO位持有AKs，GTO标准开牌范围内的强牌"
3. User taps toggle again → Level cycles to 3. Full strategy card expands: horizontal bar chart showing "弃牌 Fold 0% · 跟注 Call 30% · 加注 Raise 70%". Precision label: "标准GTO范围" or "简化GTO参考"
4. User taps toggle again → Cycles back to Level 1. Content compresses with smooth animation.
5. Setting persists for the session (and optionally in localStorage for future sessions).
6. Outcome: User controls information density to match their learning preference.

**Error States:**
- GTO data unavailable → All 3 levels show same message: "📊 此场景暂无GTO数据". Toggle still works but content doesn't change.

**Empty State:**
- N/A — toggle only appears during active decision points.

**Loading State:**
- Level switch: Instant crossfade (no loading needed — data already fetched for current decision point).
- If postflop data not yet loaded when toggling to L3: Show skeleton bar chart, resolves when data arrives.

---

### Flow: bilingual-term-display (covers F-011)

**Happy Path:**
1. Throughout all flows, poker terms display in bilingual format:
   - Position labels: "枪口位 UTG" / "劫持位 HJ" / "关煞位 CO" / "庄位 BTN" / "小盲 SB" / "大盲 BB"
   - Street labels: "翻前 Preflop" / "翻牌 Flop" / "转牌 Turn" / "河牌 River"
   - Action labels: "弃牌 Fold" / "过牌 Check" / "跟注 Call" / "下注 Bet" / "加注 Raise" / "全下 All-in"
   - BOT style tags: "紧凶 TAG" / "松凶 LAG" / "鱼 Fish" / "极紧 Nit"
   - Hand rankings: "皇家同花顺 Royal Flush" / "同花顺 Straight Flush" / etc.
2. Chinese is primary (larger font), English is secondary (smaller, muted color).
3. GTO hints and teaching content: Full Chinese sentences. English only for technical terms inline.
4. Outcome: Beginner-friendly Chinese-first experience that also teaches standard English poker terminology.

**Error States:**
- N/A — all text is static/hardcoded, no dynamic localization failures possible.

**Empty State:**
- N/A

**Loading State:**
- N/A — text renders with components.

---

## Component Inventory

### Layout Components
| Component | Description | Used In |
|-----------|-------------|---------|
| `AppShell` | Top-level layout with nav bar and content area | All pages |
| `TopNavBar` | Desktop navigation: logo + tabs (牌桌/历史记录/学习进度) + session info | Desktop all pages |
| `BottomTabBar` | Mobile navigation: 3 tabs with icons | Mobile all pages |
| `LandingPage` | Hero section + "开始对战" CTA | instant-play |
| `SessionHeader` | Compact bar showing session stats (hand count, chips, P&L) | poker-hand-lifecycle, session-management |

### Table Components
| Component | Description | Used In |
|-----------|-------------|---------|
| `PokerTable` | 6-max table layout with oval shape, seats, community card area, pot display | poker-hand-lifecycle, post-game-review |
| `PlayerSeat` | Individual seat: avatar/name, chip count, style tag, hole cards, action label, highlight state | poker-hand-lifecycle, post-game-review |
| `CommunityCards` | Center area showing 0-5 community cards with flip animation | poker-hand-lifecycle, post-game-review |
| `PotDisplay` | Current pot amount + side pots if applicable | poker-hand-lifecycle |
| `DealerChip` | BTN position indicator that animates between seats | poker-hand-lifecycle |
| `CardFace` | Single playing card (rank + suit, face-up) | poker-hand-lifecycle, post-game-review, hand-history-browsing |
| `CardBack` | Single card back design | poker-hand-lifecycle |
| `ActionLabel` | Transient label on seat showing last action (e.g., "加注 Raise to 600") | poker-hand-lifecycle |
| `PositionBadge` | Bilingual position label (e.g., "庄位 BTN") | poker-hand-lifecycle, post-game-review |
| `StyleTag` | BOT style indicator (e.g., "紧凶 TAG") with color coding | poker-hand-lifecycle |
| `StreetLabel` | Current street indicator (e.g., "翻牌 Flop") | poker-hand-lifecycle |

### Decision Components
| Component | Description | Used In |
|-----------|-------------|---------|
| `DecisionPanel` | Container for action buttons, slides up on user's turn | player-decision |
| `ActionButton` | Individual action button (Fold/Check/Call/Bet/Raise/All-in) with amount | player-decision |
| `BetSizingPanel` | Expandable sub-panel with preset sizing buttons + custom slider | player-decision |
| `SizingPresetButton` | Preset bet size button (1/3 pot, 1/2 pot, 2/3 pot, pot) | player-decision |
| `BetSlider` | Custom amount slider with min/max bounds and live amount display | player-decision |
| `ConfirmButton` | Confirm action button with loading spinner state | player-decision |
| `DecisionTimer` | Countdown indicator for user's turn (15s) | player-decision |

### GTO Hint Components
| Component | Description | Used In |
|-----------|-------------|---------|
| `GTOHintPanel` | Container for GTO hints, adapts to current level | player-decision, post-game-review |
| `HintLevelToggle` | Cycle button showing current level (Lv.1/2/3) | player-decision |
| `HintBadge` | Level 1: Compact recommendation badge | player-decision |
| `HintWithReason` | Level 2: Recommendation + one-line explanation | player-decision |
| `HintStrategyCard` | Level 3: Full mixed strategy with frequency bar chart | player-decision |
| `FrequencyBar` | Horizontal stacked bar showing action frequencies (%) | player-decision, post-game-review |
| `PrecisionLabel` | Data quality indicator ("标准GTO范围" / "简化GTO参考") | player-decision, post-game-review |
| `NoDataNotice` | "此场景暂无GTO数据" message | player-decision, post-game-review |

### Review Components
| Component | Description | Used In |
|-----------|-------------|---------|
| `ReviewContainer` | Full review layout: mini table + timeline + detail panel | post-game-review |
| `ReviewTimeline` | Horizontal timeline with decision point dots (colored green/yellow/red) | post-game-review |
| `TimelineDot` | Individual decision point on timeline, colored by GTO alignment | post-game-review |
| `DecisionComparison` | Side-by-side: user action vs GTO recommendation with color indicator | post-game-review |
| `DeviationIndicator` | Green/Yellow/Red circle indicating GTO alignment degree | post-game-review |
| `ReviewNavButtons` | "◀ 上一步" / "下一步 ▶" navigation buttons | post-game-review |
| `HandSummaryCard` | End-of-review summary: GTO score, decision breakdown, biggest mistake | post-game-review |
| `GTOScoreBadge` | Circular or pill-shaped score display (0-100) with color gradient | post-game-review, hand-history-browsing, learning-progress |

### History Components
| Component | Description | Used In |
|-----------|-------------|---------|
| `HandHistoryList` | Virtual scrolling list of hand records | hand-history-browsing |
| `HandHistoryRow` | Single row: date, mini hole cards, result (+/-), GTO score badge | hand-history-browsing |
| `MiniCardPair` | Compact display of 2 hole cards for list items | hand-history-browsing |
| `ResultChip` | Green (win) or red (loss) chip showing amount | hand-history-browsing |

### Progress Components
| Component | Description | Used In |
|-----------|-------------|---------|
| `ProgressDashboard` | Full progress page layout | learning-progress |
| `ScoreTrendChart` | Line chart of GTO scores over time with moving average | learning-progress |
| `WeaknessCard` | Card showing a specific weakness pattern with stats comparison | learning-progress |
| `StatSummaryCard` | Summary metric card (total hands, average score) | learning-progress |
| `DataRequiredNotice` | "需要更多数据" message with progress bar | learning-progress |

### Shared / Feedback Components
| Component | Description | Used In |
|-----------|-------------|---------|
| `Toast` | Transient notification message (success/warning/error) | All flows |
| `ConfirmDialog` | Modal confirmation with title, message, confirm/cancel buttons | session-management |
| `SkeletonRow` | Shimmer placeholder for list loading | hand-history-browsing |
| `SkeletonCard` | Shimmer placeholder for card-shaped content | learning-progress |
| `SkeletonTable` | Shimmer placeholder for poker table during load | instant-play |
| `Spinner` | Circular loading spinner (inline or overlay) | All flows |
| `ProgressBar` | Determinate progress bar with percentage | gto-data-loading |
| `EmptyStateIllustration` | Centered illustration + text + CTA pattern | hand-history-browsing, learning-progress |
| `ErrorFullScreen` | Full-screen error with message and retry/help links | instant-play (browser incompatibility) |
| `BilingualTerm` | Renders Chinese primary + English secondary for poker terms | All flows |
| `ChipAnimation` | Animated chip movement for pot awarding | poker-hand-lifecycle |
| `CardFlipAnimation` | Card flip reveal animation | poker-hand-lifecycle |

---

## Feature Coverage Verification

| Feature ID | Feature Name | Covered By Flow(s) |
|------------|-------------|---------------------|
| F-001 | poker-game-engine | poker-hand-lifecycle |
| F-002 | bot-ai-opponents | poker-hand-lifecycle |
| F-003 | player-action-interface | player-decision |
| F-004 | gto-strategy-data | player-decision, gto-data-loading, post-game-review |
| F-005 | realtime-gto-hints | player-decision, gto-hint-level-toggle |
| F-006 | hand-history-storage | hand-history-save |
| F-007 | post-game-review | post-game-review |
| F-008 | hand-history-browser | hand-history-browsing |
| F-009 | table-ui | poker-hand-lifecycle |
| F-010 | session-management | session-management, instant-play |
| F-011 | chinese-localization | bilingual-term-display, instant-play |
| F-012 | instant-play-experience | instant-play |
| F-013 | learning-progress-tracking | learning-progress |
| F-014 | six-max-positions | poker-hand-lifecycle |

✅ All 14 features (F-001 through F-014) are covered by at least one flow.