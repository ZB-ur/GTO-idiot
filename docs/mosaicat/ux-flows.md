# UX Flows — GTO Idiot

## Standard Interaction Patterns

| Pattern | Implementation |
|---------|---------------|
| Form validation | Real-time per-field on blur (raise amount) + submit validation |
| Error display | Toast for action errors / inline for input errors / modal for fatal |
| Loading — lists | Skeleton screen (hand history list) |
| Loading — buttons | Spinner inside button, button disabled |
| Empty state | Illustration + descriptive text + primary action button |
| Navigation | Top nav bar with logo + nav items (desktop-first) |
| Destructive actions | Confirmation dialog before execution (leave game, delete history) |
| Game actions | Large tappable buttons with amount labels, disabled states for unavailable actions |
| Card rendering | Standard playing card faces with suit colors (red ♥♦ / black ♠♣) |

---

## Component Inventory

### Layout Components
- **AppShell** — Top nav + main content area container
- **TopNavBar** — Logo ("GTO Idiot"), nav items: 开始牌局, 手牌历史; active state indicator
- **PageContainer** — Max-width centered content wrapper

### Game Table Components
- **PokerTable** — Oval table with 6 seat positions arranged around it
- **SeatPosition** — Single seat showing: player name/label, chip count, position tag (UTG/MP/CO/BTN/SB/BB), cards (face-down or face-up), current bet amount, active/folded/all-in state indicator, dealer button chip
- **CommunityCards** — Center area showing 0-5 community cards with reveal animation
- **PotDisplay** — Center-bottom showing current pot size
- **ActionPanel** — Bottom bar with action buttons: FoldButton, CheckButton, CallButton, BetButton, RaiseButton
- **RaiseSlider** — Slider + preset buttons (2x, 3x, Pot) + manual input field + min/max labels
- **DealerButton** — Small "D" chip indicator on current dealer seat
- **PlayerCards** — Two hole cards (face-up for user, face-down for BOTs until showdown)
- **ActionBadge** — Transient label showing last action per player (e.g., "Raise 300", "Fold", "Call")
- **WinnerOverlay** — Highlights winner seat + winning hand type label + pot award animation
- **HandStrengthLabel** — Shows winning hand rank name at showdown (e.g., "两对 A和K")

### Seat Selection Components
- **SeatSelectionScreen** — Full-page seat picker before game starts
- **SeatOption** — Clickable seat with position label, highlight on hover/select
- **StartGameButton** — Primary CTA to begin session after seat selection

### Hand History Components
- **HandHistoryList** — Scrollable list of past hands with filters
- **HandHistoryCard** — Single list item: datetime, user position, result (+/-BB), hand summary (e.g., "A♠K♥ — Won +45BB")
- **EmptyHistoryState** — Illustration + "还没有对战记录" + "开始牌局" CTA
- **DeleteHistoryButton** — Destructive action to clear selected/all records
- **SelectAllCheckbox** — Batch selection toggle
- **HandCheckbox** — Per-item selection for deletion

### Review/Replay Components
- **ReplayScreen** — Full replay interface for one hand
- **ReplayBoard** — Miniature table showing game state at current decision point
- **ReplayTimeline** — Horizontal stepper: Preflop → Flop → Turn → River, clickable steps
- **DecisionPointCard** — Shows: user's actual action, GTO recommended action, match/deviation badge, explanation text
- **DeviationBadge** — Red "偏离" or Green "正确" label
- **GtoExplanationText** — Short paragraph explaining why GTO recommends action
- **ReplayNavButtons** — Previous/Next decision point navigation arrows
- **ApproximationDisclaimer** — Small text: "近似GTO策略，仅供学习参考"

### Session Stats Components
- **SessionStatsPanel** — Summary card after session ends or accessible from nav
- **StatItem** — Label + value pair (e.g., 总手牌数: 47)
- **PositionBreakdownTable** — Table showing per-position: hands played, deviation rate, win/loss
- **GtoComplianceGauge** — Visual indicator (percentage bar) of GTO compliance rate

### Storage Management Components
- **StorageIndicator** — Progress bar showing used/total localStorage
- **ExportButton** — Downloads JSON backup
- **StorageWarningToast** — Toast notification when storage is nearly full

### Shared Components
- **ConfirmDialog** — Modal with title, message, confirm/cancel buttons
- **Toast** — Auto-dismiss notification (success/warning/error variants)
- **LoadingSpinner** — Inline spinner for buttons
- **SkeletonCard** — Placeholder loading card for lists
- **GtoDisclaimerBanner** — First-visit banner explaining approximate GTO nature
- **PlayingCard** — Single card rendering (rank + suit, face-up or face-down)

---

## User Journeys

### Flow: First Visit & Seat Selection (covers F-002, F-009, F-010)

**Happy Path:**
1. User opens app URL → System shows **AppShell** with **TopNavBar** (logo "GTO Idiot", nav items: 开始牌局, 手牌历史) and **SeatSelectionScreen** as default landing page
2. User sees **GtoDisclaimerBanner** at top of page: "本应用使用简化GTO近似策略，适用于学习目的，非精确solver结果" with dismiss button
3. User sees **PokerTable** outline with 6 **SeatOption** components (labeled UTG, MP, CO, BTN, SB, BB), all available
4. User clicks a **SeatOption** (e.g., BTN) → System highlights selected seat in primary color, shows user avatar/label on it, remaining 5 seats show "BOT 1-5" labels
5. User clicks **StartGameButton** ("开始牌局") → System transitions to game table view, session begins

**Error States:**
- No seat selected + click Start → **StartGameButton** stays disabled until a seat is selected; tooltip shows "请先选择座位"

**Empty State:**
- N/A — Seat selection is always populated with 6 positions

**Loading State:**
- Page load → Brief **LoadingSpinner** in center while app initializes (< 500ms typically)

---

### Flow: Playing a Hand (covers F-001, F-003, F-004, F-005)

**Happy Path:**
1. User sees **PokerTable** fully rendered: 6 **SeatPosition** components around oval table, each showing player name, chip count (starting 100BB = 10,000 chips at 50/100 blinds), position tag
2. System auto-posts blinds: SB posts 50, BB posts 100 → **SeatPosition** for SB/BB updates bet display; **PotDisplay** shows "底池: 150"
3. System deals 2 **PlayerCards** face-up to user's seat; other 5 seats show face-down cards → Deal animation plays
4. **Preflop betting round begins:** Action starts UTG. For each BOT's turn:
   - Current BOT's **SeatPosition** gets active border highlight
   - BOT decides in <1 second → **ActionBadge** appears (e.g., "Fold", "Raise 300")
   - **PotDisplay** updates; folded BOTs' seats dim
5. When it's user's turn → **ActionPanel** appears at bottom with available actions:
   - **FoldButton** (always available)
   - **CheckButton** (if no bet to call) or **CallButton** showing call amount (e.g., "跟注 200")
   - **RaiseButton** → expands **RaiseSlider** with min raise, preset buttons (2x, 3x, Pot), max (all-in)
6. User selects action (e.g., clicks **CallButton**) → **ActionPanel** hides, **ActionBadge** shows "Call 200" on user seat, **PotDisplay** updates, next player acts
7. **Flop:** When preflop betting completes → **CommunityCards** reveals 3 cards with flip animation; new betting round begins (first active player left of dealer)
8. **Turn:** After flop betting → 4th community card revealed
9. **River:** After turn betting → 5th community card revealed
10. **Showdown:** If 2+ players remain → all remaining players' **PlayerCards** flip face-up; **HandStrengthLabel** shows winning hand (e.g., "同花 A高"); **WinnerOverlay** highlights winner, pot chips animate to winner
11. System records complete hand history to localStorage via F-005 → No visible UI change (background save)
12. After 3-second pause → **DealerButton** moves clockwise, next hand begins automatically from step 2

**Error States:**
- User enters invalid raise amount (below minimum) → **RaiseSlider** shows inline error "最小加注额为 X", confirm button disabled
- User enters raise above stack → **RaiseSlider** caps at all-in amount automatically, label changes to "全下"
- localStorage save fails → **Toast** (warning): "手牌保存失败，存储空间可能已满"

**Empty State:**
- N/A — Game table always has active game state once entered

**Loading State:**
- BOT thinking → Subtle pulsing animation on active BOT's **SeatPosition** border (< 1 second)
- Deal animation → Cards slide from deck position to each seat (0.5s)
- Community card reveal → Card flip animation (0.3s per card)

---

### Flow: All-in Scenario (covers F-001, F-003)

**Happy Path:**
1. During any betting round, user (or BOT) pushes all chips → **ActionBadge** shows "All-in 10,000"
2. **SeatPosition** for all-in player shows "ALL-IN" badge, chip count shows 0
3. If other players still have action → betting continues; remaining players can fold/call/re-raise
4. Once all action complete with all-in player(s), remaining community cards are dealt automatically (run-out)
5. **CommunityCards** reveals remaining cards sequentially → **WinnerOverlay** shows result
6. Side pot display (simplified MVP): **PotDisplay** shows single main pot; if side pot exists, shows "主池: X / 边池: Y"

**Error States:**
- N/A — All-in is handled entirely by engine logic

**Empty State:**
- N/A

**Loading State:**
- Run-out card dealing → Slightly slower animation (0.5s between each card) for dramatic effect

---

### Flow: Navigating Away from Active Game (covers F-010)

**Happy Path:**
1. User is in active game → User clicks "手牌历史" in **TopNavBar**
2. System shows **ConfirmDialog**: title "离开牌局", message "当前牌局进行中，离开将结束本局并保存当前进度", buttons: "继续牌局" (secondary) / "离开" (destructive)
3. User clicks "离开" → System saves current hand (if mid-hand, records as abandoned), navigates to Hand History page
4. User clicks "继续牌局" → Dialog closes, user returns to game

**Error States:**
- N/A

**Empty State:**
- N/A

**Loading State:**
- N/A

---

### Flow: Viewing Hand History List (covers F-007, F-009)

**Happy Path:**
1. User clicks "手牌历史" in **TopNavBar** → System loads **HandHistoryList** page
2. User sees list of **HandHistoryCard** items in reverse chronological order, each showing:
   - Date/time (e.g., "2026-03-26 14:32")
   - User position (e.g., "BTN")
   - Result with color (green "+45BB" or red "-20BB")
   - Hand summary (e.g., "A♠K♥ — 两对")
3. User sees **ApproximationDisclaimer** text at page top: "复盘中的GTO建议为近似策略，仅供学习参考"
4. User clicks a **HandHistoryCard** → System navigates to **ReplayScreen** for that hand (F-006 flow)

**Error States:**
- localStorage read fails → **Toast** (error): "读取历史记录失败" + show **EmptyHistoryState** with retry option

**Empty State:**
- No saved hands → **EmptyHistoryState**: illustration of empty poker table + "还没有对战记录" text + **StartGameButton** CTA "开始第一局"

**Loading State:**
- History loading → 3-4 **SkeletonCard** placeholders in list while localStorage parses data

---

### Flow: Deleting Hand History (covers F-007)

**Happy Path:**
1. User is on **HandHistoryList** page → User clicks "管理" button to enter selection mode
2. Each **HandHistoryCard** shows **HandCheckbox**; **SelectAllCheckbox** appears at top
3. User selects individual hands or clicks **SelectAllCheckbox**
4. User clicks **DeleteHistoryButton** ("删除选中") → **ConfirmDialog**: "确认删除 X 条记录？此操作不可恢复"
5. User confirms → Records removed from localStorage, list updates, **Toast** (success): "已删除 X 条记录"

**Error States:**
- No items selected + click Delete → **DeleteHistoryButton** disabled

**Empty State:**
- After deleting all records → Transitions to **EmptyHistoryState**

**Loading State:**
- Deletion in progress → **LoadingSpinner** inside **DeleteHistoryButton**

---

### Flow: Hand Review Replay (covers F-006, F-009)

**Happy Path:**
1. User enters **ReplayScreen** from hand history → System renders **ReplayBoard** showing initial game state (preflop, after blinds posted)
2. **ReplayTimeline** shows stages: [Preflop] → [Flop] → [Turn] → [River], with Preflop highlighted
3. **ReplayBoard** shows table state: all 6 seats with positions, user's hole cards face-up, community cards empty, pot with blinds
4. System displays first decision point → **DecisionPointCard** appears beside the table:
   - "你的操作: Fold" (user's actual action)
   - "近似GTO建议: Raise 3x" (recommended action)
   - **DeviationBadge**: Red "偏离"
   - **GtoExplanationText**: "在CO位置，A5s属于标准开局范围，fold是过紧的偏离。建议用此类同花Ax手牌进行open raise以平衡范围。"
5. User clicks **ReplayNavButtons** "下一步" → Board advances to next decision point where user acted; community cards update; pot/bets update
6. At a correct decision point → **DecisionPointCard** shows:
   - **DeviationBadge**: Green "正确"
   - **GtoExplanationText**: "正确，BTN位置3bet AKo是标准打法，充分利用位置优势。"
7. User clicks **ReplayTimeline** stage (e.g., "Turn") → Board jumps to first user decision point on the turn
8. User clicks **ReplayNavButtons** "上一步" → Returns to previous decision point
9. User reaches end of hand → Shows final result: pot awarded, hand ranks

**Error States:**
- Hand data corrupted/missing → **Toast** (error): "无法加载该手牌数据" + auto-navigate back to **HandHistoryList**

**Empty State:**
- Hand has no user decision points (user folded preflop immediately) → Show single **DecisionPointCard** for the fold decision with GTO comparison, message "本手牌仅有1个决策点"

**Loading State:**
- Replay data parsing → **LoadingSpinner** centered on **ReplayScreen** (< 500ms)

---

### Flow: Session Statistics (covers F-008)

**Happy Path:**
1. User finishes a session (leaves game table or views stats) → Can access **SessionStatsPanel** via "本次统计" button in **TopNavBar** dropdown or post-game prompt
2. **SessionStatsPanel** displays:
   - **StatItem**: 总手牌数 (e.g., "47手")
   - **StatItem**: 盈亏总额 (e.g., "+1,250 chips" in green or "-800 chips" in red)
   - **StatItem**: GTO偏离次数 (e.g., "12次偏离")
   - **GtoComplianceGauge**: GTO符合率 (e.g., "74%" with progress bar)
3. Below summary, **PositionBreakdownTable** shows per-position stats:
   | 位置 | 手牌数 | 偏离率 | 盈亏 |
   |------|--------|--------|------|
   | UTG  | 8      | 25%    | -200 |
   | BTN  | 8      | 5%     | +450 |
   | ...  | ...    | ...    | ...  |
4. User can click "查看手牌详情" → Navigates to **HandHistoryList** filtered by current session

**Error States:**
- No completed hands in session → **Toast** (info): "至少完成1手牌才能查看统计"

**Empty State:**
- Session with 0 hands → **SessionStatsPanel** shows "本次session暂无数据" + "开始牌局" CTA

**Loading State:**
- Stats calculation → **LoadingSpinner** inside **SessionStatsPanel** (< 300ms)

---

### Flow: Storage Management (covers F-011, F-005)

**Happy Path:**
1. User navigates to hand history page → **StorageIndicator** appears at bottom of **HandHistoryList** showing "已用 2.1MB / 5MB (约存储1200手牌)"
2. User clicks **ExportButton** ("导出数据") → Browser triggers JSON file download named `gto-idiot-history-2026-03-26.json`
3. **Toast** (success): "数据导出成功"

**Storage Warning Sub-flow:**
1. During game, localStorage usage exceeds 80% → **StorageWarningToast** appears: "存储空间即将用完（已用4.1MB/5MB），建议导出并清理旧记录"
2. User clicks toast action "去管理" → Navigates to **HandHistoryList** with **StorageIndicator** highlighted
3. User can delete old records (F-007 delete flow) or export then clear

**Error States:**
- Export fails (browser restriction) → **Toast** (error): "导出失败，请检查浏览器下载设置"
- localStorage completely full → **Toast** (error): "存储空间已满，新手牌无法保存。请清理历史记录。" — Game continues but hands are not saved until space freed

**Empty State:**
- No stored data → **StorageIndicator** shows "已用 0MB / 5MB" + **ExportButton** disabled

**Loading State:**
- Export preparation → **LoadingSpinner** inside **ExportButton** during JSON serialization

---

### Flow: App Navigation (covers F-010)

**Happy Path:**
1. User sees **TopNavBar** at all times with:
   - Logo "GTO Idiot" (clickable → home/seat selection)
   - "开始牌局" nav item → Goes to seat selection or resumes active game
   - "手牌历史" nav item → Goes to hand history list
   - Active page indicator (underline/highlight on current nav item)
2. If game is active, "开始牌局" label changes to "返回牌局" with pulsing dot indicator
3. User can freely navigate between pages; game-exit confirmation triggers per F-010 acceptance criteria

**Error States:**
- N/A

**Empty State:**
- N/A — Nav is always rendered

**Loading State:**
- Page transitions → Instant (SPA routing), no loading indicator needed

---

## Feature Coverage Verification

| Feature ID | Feature Name | Covered By Flow(s) |
|-----------|-------------|-------------------|
| F-001 | poker-game-engine | Playing a Hand, All-in Scenario |
| F-002 | seat-selection | First Visit & Seat Selection |
| F-003 | game-table-ui | Playing a Hand, All-in Scenario |
| F-004 | gto-bot-strategy | Playing a Hand |
| F-005 | hand-history-recording | Playing a Hand, Storage Management |
| F-006 | hand-review-replay | Hand Review Replay |
| F-007 | hand-history-list | Viewing Hand History List, Deleting Hand History |
| F-008 | session-stats-summary | Session Statistics |
| F-009 | gto-accuracy-label | First Visit & Seat Selection, Viewing Hand History List, Hand Review Replay |
| F-010 | app-navigation | First Visit & Seat Selection, Navigating Away from Active Game, App Navigation |
| F-011 | storage-management | Storage Management |