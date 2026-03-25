# UX Flows — GTO Idiot

## Interaction Patterns

| Pattern | Implementation |
|---------|---------------|
| Form validation | Real-time per-field on blur + full validation on submit |
| Error display | Inline below field (forms) / toast (actions) / modal (fatal) |
| Loading — app init | Full-screen spinner with poker chip animation |
| Loading — buttons | Spinner inside button, button disabled |
| Empty state | Illustration + descriptive text + primary action button |
| Navigation | Top nav bar (Home / Play / History / Stats) |
| Destructive actions | Confirmation dialog before execution |
| Game actions | Large tap-friendly buttons at bottom of table view |
| Notifications | Toast notifications for non-blocking info (auto-dismiss 3s) |

---

## User Journeys

### Flow: first-visit-and-onboarding (covers F-011, F-009)

**Happy Path:**
1. User opens app URL in browser → System shows full-screen splash with app logo "GTO Idiot" and loading spinner while initializing
2. System detects first visit (no localStorage data) → System shows NewbieGuideModal (step 1/5): "欢迎来到 GTO Idiot！这是一个帮助你学习德扑最优策略的练习器" with illustration of a poker table
3. User clicks "下一步" → System shows step 2/5: highlights the TableLayout area — "这是六人桌牌桌，你将和 5 个 AI 对手进行对战"
4. User clicks "下一步" → System shows step 3/5: highlights ActionPanel area — "轮到你时，在这里选择操作：弃牌、跟注、加注等"
5. User clicks "下一步" → System shows step 4/5: highlights HandReviewCard mock — "每手牌结束后，系统会告诉你哪些操作符合推荐策略，哪些可以改进"
6. User clicks "下一步" → System shows step 5/5: "准备好了吗？点击开始你的第一局！" with primary CTA "开始牌局"
7. User clicks "开始牌局" → System marks onboarding complete in localStorage, navigates to GameSetupPanel
8. Outcome: User understands core UI and proceeds to first game

**Error States:**
- localStorage unavailable (private browsing) → System shows StorageWarningBanner at top: "当前浏览器模式无法保存数据，关闭后游戏记录将丢失，但你仍可正常游戏" with "我知道了" dismiss button

**Empty State:**
- N/A (this flow handles the initial empty state of the app)

**Loading State:**
- App initialization: FullScreenLoader with poker chip spinner animation and "加载中…" text

---

### Flow: game-setup (covers F-001)

**Happy Path:**
1. User sees HomeScreen with NavBar (logo + nav links: 首页/历史/统计) and hero area showing "开始牌局" PrimaryButton, plus quick stats summary if returning user
2. User clicks "开始牌局" → System shows GameSetupPanel with: BlindsSelector (radio group: 1/2, 2/5, 5/10) defaulting to 1/2, BuyinInput (number input, range 20-100 BB, default 100), and "开始" PrimaryButton
3. User selects blinds "2/5" → BlindsSelector updates selection, BuyinInput label updates to show actual chip amount (e.g., "买入筹码: 10-500")
4. User inputs buyin "100" (BB) → BuyinInput validates on blur: value within 20-100 range, shows green checkmark
5. User clicks "开始" → System creates 6-max table, randomly assigns seat positions, deals first hand
6. User sees TableLayout: oval table with 6 SeatWidget components arranged around it, each showing PlayerNameLabel, ChipCountBadge, PositionBadge (UTG/UTG+1/MP/CO/BTN/SB/BB), DealerButton clearly visible on BTN seat
7. Outcome: Table is set up, first hand begins

**Error States:**
- BuyinInput value < 20 BB → Inline error below input: "最少买入 20 BB"
- BuyinInput value > 100 BB → Inline error below input: "最多买入 100 BB"
- BuyinInput non-numeric → Inline error below input: "请输入有效数字"
- BuyinInput empty on submit → Inline error below input: "请输入买入筹码"

**Empty State:**
- First time user with no previous sessions → GameSetupPanel shows with default values, no "上次设置" badge

**Loading State:**
- Table creation: "开始" button shows spinner inside, disabled state, text changes to "创建牌桌…" (< 1s)

---

### Flow: playing-a-hand (covers F-002, F-003, F-004, F-010)

**Happy Path:**
1. User sees TableLayout with new hand starting → System posts blinds automatically: SB and BB seats show chip animations moving to pot, PotDisplay in center shows current pot
2. System deals cards → User's SeatWidget shows 2 HoleCards (face up, rendered as poker card graphics with suit/rank), other 5 seats show CardBack images
3. Preflop action begins, positions act in order (UTG first) → ActivePlayerIndicator highlights current actor's SeatWidget with glowing border
4. BOT seats act in sequence: each BOT's SeatWidget shows thinking animation (pulsing dots) for 1-2 seconds, then displays ActionBadge ("Fold" / "Call 10" / "Raise to 25") with brief animation
5. User's turn arrives → ActivePlayerIndicator highlights user's seat, ActionPanel appears below table with contextual buttons:
   - FoldButton (always visible)
   - CheckButton (when no bet to call) OR CallButton with amount (when facing a bet)
   - RaiseButton → expands RaiseSlider with min/max range and RaiseInput for exact amount
   - AllInButton (always visible)
6. User clicks RaiseButton → RaiseSlider appears with: slider track (min raise to all-in), preset buttons (1/2 pot, 3/4 pot, pot), RaiseInput number field, "确认加注" ConfirmButton
7. User adjusts slider to desired amount and clicks "确认加注" → System validates amount, user's chips animate to pot, PotDisplay updates, action moves to next player
8. All preflop action complete → CommunityCards area shows Flop: 3 cards dealt with flip animation, PotDisplay updates
9. Postflop action rounds repeat (Flop → Turn → River) with same ActionPanel flow
10. Turn card dealt → 1 card added to CommunityCards with flip animation
11. River card dealt → 1 card added to CommunityCards with flip animation
12. Showdown: all remaining players' HoleCards flip face-up → WinnerHighlight animation on winning seat, chips animate from pot to winner, ResultBanner shows hand ranking (e.g., "一对 A - 赢得 120 筹码")
13. Outcome: Hand completes, triggers hand-review flow

**Alternative Path — All opponents fold:**
1. All BOTs fold to user's action → User wins pot immediately
2. No showdown, chips animate to user, ResultBanner shows "所有对手弃牌 - 赢得 45 筹码"
3. Triggers hand-review flow

**Alternative Path — User folds:**
1. User clicks FoldButton → User's HoleCards grey out and flip face-down, "已弃牌" label appears
2. Hand continues among remaining BOTs (sped up, ~0.5s per action)
3. Hand resolves → ResultBanner shows result, triggers hand-review flow

**Alternative Path — Side pot:**
1. A player goes All-in with fewer chips than others → System creates MainPot and SidePot
2. PotDisplay splits to show "主池: 300" and "边池: 150" as separate labels
3. At showdown, system correctly distributes from each pot

**Alternative Path — Split pot:**
1. Two or more players have equal hand strength → ResultBanner shows "平分底池"
2. Chips split evenly with animation to each winner

**Error States:**
- Raise amount below minimum → Inline error below RaiseInput: "最小加注 X 筹码"
- Raise amount exceeds stack → Inline error below RaiseInput: "超过你的筹码，可选择 All-in"
- User idle > 30 seconds → ActionPanel shows subtle pulse animation reminder, no auto-fold in practice mode

**Empty State:**
- N/A (this flow always has active game state)

**Loading State:**
- BOT thinking: ThinkingIndicator (animated dots "···") in BOT's SeatWidget for 1-2 seconds
- Card dealing: flip animation (0.3s per card)
- Pot calculation: instant, no loading needed

---

### Flow: hand-review-after-each-hand (covers F-006, F-004, F-005, F-012)

**Happy Path:**
1. Hand ends and result settles → System automatically shows HandReviewCard as a modal overlay after 1.5s delay
2. User sees HandReviewCard header: "手牌复盘" with hand summary (user's hole cards displayed, final result, net chips won/lost)
3. HandReviewCard body shows DecisionTimeline — a vertical timeline of user's decision points during the hand:
   - Each DecisionPointRow shows:
     - PositionBadge with position name (e.g., "BTN - 按钮位")
     - StreetLabel (Preflop / Flop / Turn / River)
     - Board state (community cards at that point)
     - UserActionBadge: what user did (e.g., "Raise to 15")
     - GTORecommendBadge: what GTO recommends (e.g., "Raise — GTO 推荐")
     - MatchIndicator: green checkmark "符合 GTO" or yellow/red warning "偏离 GTO"
4. For Preflop decisions → GTORecommendBadge shows precise recommendation from range data, labeled "GTO 推荐"
5. For Postflop decisions → GTORecommendBadge shows simplified recommendation, labeled "简化 GTO 参考", with ExplanationText (e.g., "干燥牌面 IP 位置倾向于 c-bet")
6. For decisions where user deviated → DeviationExplanation shows in yellow/red box: position-aware tip (e.g., "UTG 是最早行动的位置，通常需要更紧的 range")
7. User scrolls through all decision points → Bottom of card shows HandScoreSummary: "本手 GTO 符合率: 75% (3/4 决策点)"
8. User clicks "下一手" ContinueButton → HandReviewCard closes, next hand begins automatically
9. Outcome: User learns from GTO comparison and continues playing

**Alternative Path — User wants to skip review:**
1. User clicks "跳过" SkipButton in HandReviewCard header → Card closes immediately, next hand begins
2. Review data is still saved to history

**Error States:**
- GTO data lookup fails for edge case → DecisionPointRow shows "无法生成 GTO 建议" in grey text, other decision points still display normally

**Empty State:**
- Hand where user had no decision points (e.g., user was in BB, all folded to them preflop) → HandReviewCard shows "本手无需决策，自动赢得底池" with "下一手" button only

**Loading State:**
- GTO comparison calculation: HandReviewCard shows skeleton placeholder rows for 0.3s while computing, then content fades in

---

### Flow: hand-history-browsing (covers F-007, F-006)

**Happy Path:**
1. User clicks "历史记录" in NavBar → System navigates to HandHistoryPage
2. User sees HandHistoryList: a scrollable list of HandHistoryRow components, each showing:
   - DateTimeLabel (e.g., "2024-03-15 14:32")
   - HoleCardsMini (2 small card icons)
   - ResultBadge: green "赢 +45" / red "输 -30" / grey "平 ±0"
   - PositionBadge (e.g., "BTN")
3. List is sorted by time descending (most recent first)
4. User clicks a HandHistoryRow → Row expands inline to show full HandReviewCard (same as F-006 review view) with DecisionTimeline, GTO comparison, position annotations
5. User clicks expanded row again → Row collapses back to summary
6. User can expand multiple rows for comparison
7. Outcome: User reviews past hands and GTO comparisons

**Error States:**
- localStorage read error → Toast notification: "读取历史记录失败，请刷新页面重试"

**Empty State:**
- No hand history exists → EmptyStateView with poker cards illustration, text "还没有对战记录", and PrimaryButton "开始第一局"

**Loading State:**
- History list loading: 5 SkeletonRow placeholders (card-shaped grey blocks) shown while reading from localStorage (< 0.5s)

---

### Flow: session-statistics (covers F-008)

**Happy Path:**
1. User clicks "统计" in NavBar → System navigates to StatsPage
2. User sees StatsSummaryCards row at top:
   - TotalHandsCard: "总手数: 142"
   - WinRateCard: "胜率: 38%"
   - ProfitLossCard: "总盈亏: +350 筹码" (green if positive, red if negative)
   - GTOComplianceCard: "GTO 符合率: 62%"
3. Below summary, user sees ChipTrendChart: line chart with X-axis = hand number, Y-axis = cumulative profit/loss in chips, with zero line highlighted
4. Below chart, user sees PositionStatsTable: a table/grid showing each position (UTG/UTG+1/MP/CO/BTN/SB/BB) with columns: 手数, 胜率, 盈亏
5. User hovers over ChipTrendChart data point → Tooltip shows hand number and exact chip count at that point
6. Outcome: User understands their performance trends

**Error States:**
- Stats data corrupted in localStorage → Toast: "统计数据异常，已重新计算" (system recalculates from raw hand history)
- Chart rendering error → ChipTrendChart area shows "图表加载失败" with "重试" link

**Empty State:**
- No hand history → StatsPage shows EmptyStateView with chart illustration, text "完成几局对战后，这里会显示你的统计数据", PrimaryButton "开始牌局"

**Loading State:**
- Stats calculation: StatsSummaryCards show as skeleton cards, ChipTrendChart shows skeleton rectangle, PositionStatsTable shows skeleton rows — all resolve in < 0.5s

---

### Flow: leave-table-and-return (covers F-001, F-009)

**Happy Path:**
1. User is at TableLayout during a hand → User clicks "离开牌桌" LeaveButton in top-right corner
2. System shows LeaveConfirmDialog: "确定离开牌桌？当前筹码和记录将自动保存。"  with "确认离开" and "继续游戏" buttons
3. User clicks "确认离开" → System saves current chip count and all hand records to localStorage, navigates to HomeScreen
4. User sees HomeScreen with ReturningPlayerCard: "上次牌局: 2/5 盲注，剩余筹码 485" with "继续牌局" SecondaryButton and "新牌局" PrimaryButton
5. User clicks "继续牌局" → System restores previous table settings and chip count, starts new hand at same table
6. Outcome: User's progress is preserved across sessions

**Alternative Path — User closes browser:**
1. User closes browser tab during a hand → Current hand is abandoned (not saved as complete), but all previously completed hands and chip count are already persisted
2. User returns later → HomeScreen shows ReturningPlayerCard with last saved state

**Error States:**
- localStorage full when saving → Toast: "存储空间不足，正在清理旧记录…" → System auto-cleans oldest hand detail records, keeps summary stats, retries save
- Save fails after cleanup → Toast: "保存失败，请手动清理浏览器存储"

**Empty State:**
- N/A

**Loading State:**
- Save operation: LeaveButton shows brief spinner (< 0.5s)

---

### Flow: data-auto-cleanup (covers F-009)

**Happy Path:**
1. System detects localStorage usage > 4MB during a save operation → System triggers auto-cleanup
2. System deletes oldest hand detail records (full action logs) while preserving: HandHistoryRow summaries (date, cards, result, position), cumulative stats, current chip count
3. System completes cleanup → Toast: "已自动清理旧的详细记录，统计数据已保留"
4. Outcome: Storage stays within limits, key data preserved

**Error States:**
- Cleanup insufficient (still > 4MB after removing all detail records) → Toast: "存储空间仍然不足，建议清除浏览器数据" with link to browser settings guidance
- localStorage API throws error → App continues working in memory-only mode, Toast: "数据保存暂时不可用"

**Empty State:**
- N/A

**Loading State:**
- Cleanup runs synchronously during save, no visible loading (< 100ms)

---

### Flow: newbie-guide-replay (covers F-011)

**Happy Path:**
1. User clicks gear icon → SettingsDropdown appears with option "重新查看新手引导"
2. User clicks "重新查看新手引导" → NewbieGuideModal starts from step 1/5 (same as first-visit flow)
3. User goes through all 5 steps or clicks "跳过" → Guide closes
4. Outcome: User can re-learn the interface anytime

**Error States:**
- N/A

**Empty State:**
- N/A

**Loading State:**
- N/A (guide is purely UI, no data loading)

---

## Component Inventory

### Layout Components
| Component | Description | Used In |
|-----------|-------------|---------|
| AppShell | Root layout with NavBar slot and content area | All pages |
| NavBar | Top navigation: logo + nav links (首页/历史/统计) + settings gear icon | All pages |
| HomeScreen | Landing page with hero CTA and returning player info | home |
| TableLayout | Oval poker table with 6 seat positions, community cards area, pot display | game |
| HandHistoryPage | Full-page list of past hands | history |
| StatsPage | Full-page statistics dashboard | stats |

### Game Table Components
| Component | Description | Used In |
|-----------|-------------|---------|
| SeatWidget | Player seat: name, chips, position, cards, action state | TableLayout |
| PlayerNameLabel | Display name text (e.g., "You", "BOT 1") | SeatWidget |
| ChipCountBadge | Chip amount display with chip icon | SeatWidget |
| PositionBadge | Position label (UTG/UTG+1/MP/CO/BTN/SB/BB) with color coding | SeatWidget, DecisionPointRow |
| DealerButton | "D" button marker on BTN position | TableLayout |
| HoleCards | 2 poker cards rendered face-up with suit/rank graphics | SeatWidget (user) |
| CardBack | Card back image for hidden cards | SeatWidget (BOTs) |
| CommunityCards | 3-5 public cards in table center with deal animation | TableLayout |
| PotDisplay | Current pot amount(s), splits for main/side pot | TableLayout |
| ActivePlayerIndicator | Glowing border highlight on current actor's seat | SeatWidget |
| ActionBadge | Shows player's action text (e.g., "Raise to 25") | SeatWidget |
| ThinkingIndicator | Animated dots showing BOT is "thinking" | SeatWidget |
| ResultBanner | Hand result display (winner, hand rank, chips won) | TableLayout |

### Action Components
| Component | Description | Used In |
|-----------|-------------|---------|
| ActionPanel | Container for all action buttons, appears on user's turn | TableLayout |
| FoldButton | "弃牌" button | ActionPanel |
| CheckButton | "过牌" button (when no bet to call) | ActionPanel |
| CallButton | "跟注 X" button with amount | ActionPanel |
| RaiseButton | "加注" button, expands to show slider | ActionPanel |
| AllInButton | "全下" button | ActionPanel |
| RaiseSlider | Slider + presets (1/2 pot, 3/4 pot, pot) + number input | ActionPanel |
| RaiseInput | Number input field for exact raise amount | RaiseSlider |
| ConfirmButton | "确认加注" submit button | RaiseSlider |
| LeaveButton | "离开牌桌" button in top-right | TableLayout |

### Setup Components
| Component | Description | Used In |
|-----------|-------------|---------|
| GameSetupPanel | Setup form: blinds + buyin + start button | HomeScreen |
| BlindsSelector | Radio group for blind levels (1/2, 2/5, 5/10) | GameSetupPanel |
| BuyinInput | Number input for buy-in amount in BB (20-100) | GameSetupPanel |
| PrimaryButton | Main CTA button (filled, primary color) | Multiple |
| SecondaryButton | Secondary action button (outlined) | Multiple |

### Review Components
| Component | Description | Used In |
|-----------|-------------|---------|
| HandReviewCard | Modal overlay showing GTO comparison for a hand | post-hand, history |
| DecisionTimeline | Vertical timeline of user decision points | HandReviewCard |
| DecisionPointRow | Single decision point: position, action, GTO compare | DecisionTimeline |
| UserActionBadge | User's actual action display | DecisionPointRow |
| GTORecommendBadge | GTO recommended action display | DecisionPointRow |
| MatchIndicator | Green check (match) or yellow/red warning (deviate) | DecisionPointRow |
| DeviationExplanation | Yellow/red box with position-aware GTO tip | DecisionPointRow |
| ExplanationText | Short GTO rationale text for postflop decisions | DecisionPointRow |
| StreetLabel | Label for game street (Preflop/Flop/Turn/River) | DecisionPointRow |
| HandScoreSummary | "GTO 符合率: X%" summary at bottom of review | HandReviewCard |
| ContinueButton | "下一手" button to proceed | HandReviewCard |
| SkipButton | "跳过" button to dismiss review | HandReviewCard |
| HoleCardsMini | Small card icons for history list display | HandHistoryRow |

### History Components
| Component | Description | Used In |
|-----------|-------------|---------|
| HandHistoryList | Scrollable list of hand records | HandHistoryPage |
| HandHistoryRow | Single hand summary: date, cards, result, position | HandHistoryList |
| DateTimeLabel | Formatted date/time display | HandHistoryRow |
| ResultBadge | Win/loss/tie badge with color and amount | HandHistoryRow |

### Stats Components
| Component | Description | Used In |
|-----------|-------------|---------|
| StatsSummaryCards | Row of 4 summary stat cards | StatsPage |
| TotalHandsCard | Total hands played stat | StatsSummaryCards |
| WinRateCard | Win rate percentage stat | StatsSummaryCards |
| ProfitLossCard | Total profit/loss stat with color | StatsSummaryCards |
| GTOComplianceCard | GTO compliance rate stat | StatsSummaryCards |
| ChipTrendChart | Line chart of cumulative chip profit/loss over hands | StatsPage |
| PositionStatsTable | Table of stats broken down by position | StatsPage |

### Feedback Components
| Component | Description | Used In |
|-----------|-------------|---------|
| Toast | Auto-dismiss notification (3s) for non-blocking messages | Global |
| LeaveConfirmDialog | Confirmation modal for leaving table | TableLayout |
| StorageWarningBanner | Top banner warning about localStorage unavailability | Global |
| EmptyStateView | Illustration + text + CTA for empty data states | History, Stats |
| FullScreenLoader | App initialization loader with poker chip animation | App init |
| SkeletonRow | Grey placeholder block for loading lists | History, Stats |

### Guide Components
| Component | Description | Used In |
|-----------|-------------|---------|
| NewbieGuideModal | Multi-step onboarding overlay (5 steps) | First visit, settings |
| SettingsDropdown | Dropdown menu from gear icon with settings options | NavBar |
| ReturningPlayerCard | Card showing last session info with continue/new options | HomeScreen |