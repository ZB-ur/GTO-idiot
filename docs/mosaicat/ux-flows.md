<!-- ARTIFACT:ux-flows.md -->
# UX Flows — GTO Idiot

## Interaction Patterns

| Pattern | Implementation |
|---------|---------------|
| Form validation | Real-time per-field on blur (raise amount) + submit validation |
| Error display | Inline below field (amount input) / toast (system errors) / full-screen (fatal) |
| Loading — lists | Skeleton screen (hand list, session list) |
| Loading — buttons | Spinner inside button, button disabled |
| Loading — page | Full skeleton with card placeholders on table |
| Empty state | Illustration + descriptive text + primary action button |
| Navigation | Top nav bar: 大厅 / 牌桌 / 复盘 / 统计 |
| Destructive actions | Confirmation dialog (leave mid-session) |
| Audio toggle | Persistent icon button in top-right corner |

---

## User Journeys

### Flow: Game Lobby (covers F-009)

**Happy Path:**
1. User opens the app → System displays the lobby page with top nav (大厅 active), a prominent "开始新牌局" button centered, and below it a list of historical sessions (if any) showing session ID, date, hands played, net P&L in BB
2. User clicks "开始新牌局" → System creates a new 6-max session, navigates to the poker table page, seats the user and 5 BOTs, and auto-deals the first hand
3. User sees a historical session in the list → Each session card shows: date, total hands, net BB result, and two action buttons: "继续对战" / "查看复盘"
4. User clicks "继续对战" on an unfinished session → System loads the session state, navigates to the poker table, resumes from where the user left off
5. User clicks "查看复盘" on any session → System navigates to the hand list browser (F-011) filtered to that session

**Error States:**
- Session data corrupted or missing → Toast notification: "Session数据加载失败，请开始新牌局"
- Browser storage full → Toast notification: "存储空间不足，部分历史数据可能无法保存。请清理浏览器数据。"

**Empty State:**
- When no historical sessions exist → Show a poker chip illustration with text "还没有对战记录" and a single prominent "开始第一局" CTA button

**Loading State:**
- Session list: Skeleton cards (3 placeholder cards with pulsing lines for date/stats)
- "开始新牌局" button: Available immediately (no async dependency)

---

### Flow: Poker Table Play (covers F-001, F-002, F-003, F-004, F-005, F-006, F-012, F-013)

**Happy Path:**
1. User enters the table → System displays the 6-seat oval table layout:
   - User's seat at bottom center, 5 BOT seats distributed around the table
   - Each seat shows: avatar placeholder, nickname, style tag (TAG/LAG/Fish etc.), chip count (400 chips = 200BB), position label (UTG/HJ/CO/BTN/SB/BB)
   - Dealer button token on the BTN seat
   - Center area: empty community card zone (5 card slots), pot display showing "底池: 0"
   - Top-right: sound toggle icon (🔊), session info (hand #, blinds 1/2)
2. Hand begins → System auto-posts blinds (SB: 1, BB: 2), pot updates to 3, dealing animation sends 2 face-down cards to each seat with deal sound effect; user's 2 hole cards flip face-up; hand history recording begins
3. **Pre-flop action round** — Action proceeds clockwise from UTG:
   - When a BOT acts: BOT seat highlights briefly, a thinking indicator shows (1-2s delay), then the action appears as a label on the seat (e.g., "Fold", "Call 2", "Raise 6") with chip animation and sound; pot updates
   - When it's the user's turn: User's seat pulses with highlight glow; the action panel appears at the bottom of the table
4. **User action panel** (context-dependent):
   - Facing a bet/raise: Three buttons — "弃牌 (Fold)", "跟注 (Call X)", "加注 (Raise)" with a slider + numeric input for raise amount; min-raise and all-in markers on slider
   - No bet to face (first to act or checked to): Two buttons — "过牌 (Check)", "下注 (Bet)" with slider + numeric input
   - Not user's turn: Action panel hidden or grayed out
5. User selects an action → System plays confirmation sound, animates chips if applicable, updates pot, records action to hand history, advances to next player
6. All pre-flop action complete → System deals 3 community cards with flip animation and sound (翻牌), action round repeats
7. Turn card → System deals 1 card with flip animation (转牌), action round repeats
8. River card → System deals 1 card with flip animation (河牌), final action round
9. **Showdown** (multiple players remain): All remaining players' hole cards flip face-up, system highlights the winning hand combination, pot slides to winner with chip sound, result banner shows briefly ("Player X 赢得底池 42")
10. **No showdown** (all but one fold): Last remaining player wins, pot slides to them, no cards revealed
11. Hand complete → System saves complete hand history (all actions, cards, pot changes, result), updates chip counts, moves dealer button clockwise, 2-second pause, next hand begins automatically
12. User can leave at any time → Click "离开牌桌" in top nav → Confirmation dialog "确定要离开牌桌吗？当前对战进度将自动保存。" → Confirm returns to lobby

**Error States:**
- Raise amount below minimum → Inline error below input: "最小加注金额为 X"
- Raise amount above stack → Inline error below input: "加注金额不能超过剩余筹码 (X)"；slider clamped to stack
- Game engine error during hand → Toast: "牌局引擎出错，当前手牌已保存。" → Auto-save hand history, return to lobby
- Hand history save failure → Toast warning: "手牌记录保存失败，复盘可能不完整"

**Empty State:**
- N/A — table is always populated once a session starts

**Loading State:**
- Table initialization: Skeleton table layout with 6 empty seat outlines, card slot placeholders pulsing, "正在准备牌桌..." text overlay
- Between hands: Brief "发牌中..." overlay during deal animation (1-2s)
- BOT thinking: Animated dots "···" on the acting BOT's seat (1-2s simulated delay)

**Sound & Animation Sub-flow (F-012, F-013):**
- Deal animation: Cards slide from deck position to each seat (0.3s per card, staggered)
- Community card animation: Card flips from face-down to face-up (0.4s)
- Chip animation: Chips slide from player seat to pot center (0.3s)
- Sound effects: distinct sounds for deal, check, call, raise, fold, all-in, win
- Sound toggle: Click 🔊 → toggles to 🔇, all sounds muted; state persisted in localStorage

---

### Flow: Hand Replay / Review (covers F-007, F-010)

**Happy Path:**
1. User navigates to a specific hand's replay (from hand list or session review) → System loads the hand history and GTO strategy data
2. System displays the replay interface:
   - Top: Hand info bar (Hand #, date, user's hole cards, final result)
   - Center: The same poker table visualization (F-001) but in replay/static mode
   - Bottom: **Street timeline** — four clickable nodes: "翻前" → "翻牌" → "转牌" → "河牌", connected by a progress line; the active node is highlighted
   - Below timeline: **Action sequence panel** — scrollable list of all actions in the current street
3. User clicks "翻前" node on timeline → Table shows pre-flop state (no community cards), action sequence shows all pre-flop actions; user's decision points are highlighted with a colored border
4. User clicks on a **user decision point** in the action sequence → Decision detail panel expands:
   - Left column: "你的选择" — shows the user's actual action (e.g., "Raise to 6")
   - Right column: "GTO推荐" — shows the GTO recommended action (e.g., "Raise to 6" or "Fold")
   - Rating badge: ✅最优 (green) / ⚠️可接受 (yellow) / ❌错误 (red)
   - EV difference: "估算EV差异: -2.3 BB" (labeled as 估算)
   - If from post-flop simplified strategy: "近似参考" badge displayed next to GTO recommendation
   - GTO explanation text (1-2 sentences in Chinese): e.g., "CO位置，ATs属于标准开牌范围。弃牌损失了正EV的机会。"
5. User clicks "翻牌" node → Table updates to show 3 community cards, action sequence updates, user decision points highlighted
6. User clicks "转牌" node → Table adds the turn card, similar display
7. User clicks "河牌" node → Table adds the river card, similar display
8. At any point, user can click "返回列表" to go back to the hand list

**Error States:**
- Hand history data missing or corrupted → Full-screen error: "无法加载该手牌记录" with "返回列表" button
- GTO strategy data unavailable for a specific scenario → Decision point shows: "GTO数据暂不可用" with ⚪ neutral badge instead of rating; explanation text: "该场景（如多人底池翻后）超出简化策略表覆盖范围"

**Empty State:**
- When a hand has no user decision points (user folded immediately) → Timeline shows all streets grayed out except pre-flop; message: "本手牌你在翻前弃牌，没有更多决策点可供复盘" with "查看下一手" button

**Loading State:**
- Replay page load: Skeleton table + skeleton timeline nodes + skeleton action list (3 placeholder rows)
- GTO data computation per decision point: Small spinner next to "GTO推荐" column while strategy is looked up (< 500ms expected)

---

### Flow: Hand List Browser (covers F-011)

**Happy Path:**
1. User navigates to 复盘 section via top nav → System displays the hand list page
2. Hand list shows all saved hands in reverse chronological order, each row displaying:
   - Hand # and timestamp
   - User's hole cards (miniature card icons)
   - Result: "+12 BB" (green) or "-6 BB" (red) or "±0" (gray)
   - GTO rating summary: count of ✅/⚠️/❌ decisions (e.g., "✅2 ⚠️1 ❌1")
3. **Filter bar** at top of list with toggle: "全部" (default) / "仅❌错误决策"
4. User clicks "仅❌错误决策" filter → List filters to show only hands containing at least one ❌ rated decision
5. User clicks on a hand row → Navigates to that hand's replay view (F-007)

**Error States:**
- Failed to load hand history from storage → Toast: "加载历史记录失败，请刷新页面重试"

**Empty State:**
- No hands recorded yet → Illustration of empty card deck with text "还没有对战记录" and CTA "去打一局" linking to lobby
- Filter active but no matching hands → Text: "没有包含❌错误决策的手牌。继续保持！💪" (no CTA needed)

**Loading State:**
- Initial list load: 5 skeleton rows with placeholder card icons and pulsing text lines
- Filter change: Brief skeleton flash (< 300ms, likely instant from local data)

---

### Flow: Session Statistics (covers F-008)

**Happy Path:**
1. User navigates to 统计 section via top nav → System loads and computes statistics from all stored hand histories
2. Statistics page displays:
   - **Summary cards** row: Total hands played | Net P&L (in BB, colored green/red) | Win rate (% of hands where user won pot)
   - **P&L Chart**: Line chart with X-axis = hand number (cumulative), Y-axis = cumulative BB won/lost; zero line marked
   - **GTO Performance**: GTO compliance rate (% of ✅最优 decisions) | Average EV loss per hand (in BB, labeled 估算)
3. User can hover/tap on the P&L chart to see exact values at each point

**Error States:**
- Statistics computation error → Toast: "统计数据计算出错，部分数据可能不完整"
- Partial data (some hands missing GTO evaluations) → Footnote on GTO metrics: "基于 X/Y 手牌的复盘数据"

**Empty State:**
- No hands played yet → Illustration with text "还没有对战数据" and CTA "开始第一局"
- Has hands but no replay/GTO data → Summary cards show hand count and P&L; GTO section shows "完成复盘后才能显示GTO统计" with CTA "去复盘"

**Loading State:**
- Summary cards: 3 skeleton cards with pulsing number placeholders
- P&L chart: Skeleton chart area with faint axis lines
- GTO metrics: Skeleton text lines

---

## Component Inventory

### Layout Components
| Component | Description | Used In |
|-----------|-------------|---------|
| TopNavBar | App-wide navigation bar with tabs: 大厅, 牌桌, 复盘, 统计; active tab highlighted; right side: sound toggle | All pages |
| PageContainer | Standard page wrapper with max-width and padding | All pages |
| ConfirmDialog | Modal dialog with message, confirm and cancel buttons | Leave table confirmation |

### Lobby Components
| Component | Description | Used In |
|-----------|-------------|---------|
| LobbyPage | Main lobby layout with new game CTA and session list | Game Lobby flow |
| NewGameButton | Prominent primary CTA button "开始新牌局" / "开始第一局" | LobbyPage, empty states |
| SessionList | Scrollable list of SessionCard items | LobbyPage |
| SessionCard | Card showing session info: date, hands count, net BB, with "继续对战" / "查看复盘" action buttons | SessionList |
| EmptyLobbyState | Illustration + "还没有对战记录" + CTA | LobbyPage (empty) |

### Poker Table Components
| Component | Description | Used In |
|-----------|-------------|---------|
| PokerTablePage | Full table page layout containing all table sub-components | Poker Table Play flow |
| TableFelt | Oval table surface with community card zone and pot display | PokerTablePage |
| SeatLayout | Positions 6 PlayerSeat components around the table | PokerTablePage |
| PlayerSeat | Single seat: avatar, nickname, style tag (BOT), chip count, position label, active highlight, action label | SeatLayout |
| DealerButton | Small circular "D" token positioned next to BTN seat | SeatLayout |
| CommunityCards | 5 card slots in table center, progressively filled per street | TableFelt |
| PotDisplay | "底池: X" text display in table center below community cards | TableFelt |
| HoleCards | User's 2 face-up cards at their seat | PlayerSeat (user) |
| CardComponent | Single playing card with suit/rank display; supports face-up and face-down states | CommunityCards, HoleCards, HandReplay |
| ActionPanel | Bottom-anchored panel with context-dependent action buttons | PokerTablePage |
| FoldButton | "弃牌 (Fold)" action button | ActionPanel |
| CallButton | "跟注 (Call X)" action button showing required amount | ActionPanel |
| CheckButton | "过牌 (Check)" action button | ActionPanel |
| RaiseControl | "加注 (Raise)" / "下注 (Bet)" button + slider + numeric input with min/max constraints | ActionPanel |
| RaiseSlider | Slider input for raise amount with min-raise and all-in markers | RaiseControl |
| RaiseAmountInput | Numeric text input for precise raise amount with inline validation | RaiseControl |
| BotThinkingIndicator | Animated "···" dots shown on BOT seat during simulated thinking | PlayerSeat (BOT) |
| ActiveSeatHighlight | Glowing border/pulse effect on the currently acting seat | PlayerSeat |
| HandInfoBar | Top bar showing hand #, blinds, session info | PokerTablePage |
| LeaveTableButton | "离开牌桌" button in nav area | TopNavBar (during game) |
| SoundToggle | 🔊/🔇 icon toggle button for audio on/off | TopNavBar |
| ActionLabel | Temporary label on seat showing last action (e.g., "Fold", "Call 6", "Raise 18") | PlayerSeat |
| ChipAnimation | Animated chip tokens moving from seat to pot | PokerTablePage |
| DealAnimation | Card dealing animation from deck to seats | PokerTablePage |
| CardFlipAnimation | Card flip-over animation for community cards | CommunityCards |
| WinnerBanner | Brief result overlay "Player X 赢得底池 Y" | PokerTablePage |
| TableLoadingSkeleton | Skeleton placeholder for table initialization | PokerTablePage (loading) |

### Hand Replay Components
| Component | Description | Used In |
|-----------|-------------|---------|
| HandReplayPage | Replay page layout with table view, timeline, and decision details | Hand Replay flow |
| ReplayTableView | Static/replay version of poker table showing game state at selected point | HandReplayPage |
| StreetTimeline | Horizontal timeline with 4 clickable nodes (翻前/翻牌/转牌/河牌) connected by progress line | HandReplayPage |
| TimelineNode | Single clickable node on the street timeline; states: active, visited, disabled | StreetTimeline |
| ActionSequencePanel | Scrollable list of all actions in the current street, user decisions highlighted | HandReplayPage |
| ActionSequenceItem | Single action row: player name, action type, amount; highlighted border for user decisions | ActionSequencePanel |
| DecisionDetailPanel | Expandable panel showing user choice vs GTO recommendation comparison | HandReplayPage |
| UserChoiceColumn | Left column: "你的选择" with the user's actual action | DecisionDetailPanel |
| GTORecommendColumn | Right column: "GTO推荐" with recommended action | DecisionDetailPanel |
| RatingBadge | ✅最优 (green) / ⚠️可接受 (yellow) / ❌错误 (red) badge | DecisionDetailPanel |
| EVDifference | "估算EV差异: ±X BB" display with "估算" label | DecisionDetailPanel |
| ApproximateBadge | "近似参考" tag shown for post-flop GTO data | DecisionDetailPanel |
| GTOExplanationText | 1-2 sentence Chinese explanation of GTO reasoning | DecisionDetailPanel |
| BackToListButton | "返回列表" navigation button | HandReplayPage |
| NoDecisionMessage | Message for hands with no reviewable decisions + "查看下一手" link | HandReplayPage (empty) |
| GTOUnavailableNotice | "GTO数据暂不可用" placeholder for uncovered scenarios | DecisionDetailPanel |
| ReplayLoadingSkeleton | Skeleton for replay page loading state | HandReplayPage (loading) |

### Hand List Components
| Component | Description | Used In |
|-----------|-------------|---------|
| HandListPage | Page layout with filter bar and scrollable hand list | Hand List Browser flow |
| HandListFilterBar | Filter controls: "全部" / "仅❌错误决策" toggle | HandListPage |
| HandListItem | Row: hand #, timestamp, miniature hole cards, result (±BB colored), GTO rating summary (✅/⚠️/❌ counts) | HandListPage |
| MiniCardPair | Two small card icons showing user's hole cards | HandListItem |
| ResultBadge | "+X BB" (green) / "-X BB" (red) / "±0" (gray) pill | HandListItem |
| GTORatingSummary | Compact display of ✅/⚠️/❌ decision counts | HandListItem |
| EmptyHandListState | "还没有对战记录" illustration + "去打一局" CTA | HandListPage (empty) |
| FilterEmptyState | "没有包含❌错误决策的手牌。继续保持！" message | HandListPage (filtered empty) |
| HandListSkeleton | 5 skeleton rows for loading state | HandListPage (loading) |

### Statistics Components
| Component | Description | Used In |
|-----------|-------------|---------|
| StatsPage | Statistics page layout with summary cards, chart, and GTO metrics | Session Statistics flow |
| StatSummaryCard | Single metric card: label + large number + optional color coding | StatsPage |
| PLChart | Line chart: X = hand number, Y = cumulative BB; with zero line and hover tooltip | StatsPage |
| GTOComplianceRate | "GTO符合率" display showing ✅ decision percentage | StatsPage |
| AvgEVLoss | "平均EV损失" display per hand in BB with "估算" label | StatsPage |
| EmptyStatsState | "还没有对战数据" illustration + "开始第一局" CTA | StatsPage (empty) |
| NoGTODataNotice | "完成复盘后才能显示GTO统计" + "去复盘" CTA | StatsPage (partial) |
| StatsLoadingSkeleton | Skeleton for summary cards + chart area + metric lines | StatsPage (loading) |

### Shared / Utility Components
| Component | Description | Used In |
|-----------|-------------|---------|
| ToastNotification | Temporary notification bar (success/warning/error variants) | Global |
| SkeletonLoader | Generic pulsing placeholder (text line, card, chart variants) | All loading states |
| EmptyStateIllustration | Reusable empty state with customizable illustration, text, and CTA | Multiple empty states |
| ErrorFullScreen | Full-screen error with message and action button | Fatal errors |

---

## Feature Coverage Matrix

| Feature ID | Feature Name | Covered By Flow(s) |
|------------|-------------|-------------------|
| F-001 | poker-table-ui | Poker Table Play |
| F-002 | player-actions | Poker Table Play |
| F-003 | game-engine | Poker Table Play |
| F-004 | bot-players | Poker Table Play |
| F-005 | gto-strategy-data | Poker Table Play, Hand Replay |
| F-006 | hand-history-storage | Poker Table Play |
| F-007 | hand-replay | Hand Replay |
| F-008 | session-stats | Session Statistics |
| F-009 | game-lobby | Game Lobby |
| F-010 | gto-explanation | Hand Replay |
| F-011 | hand-list-browser | Hand List Browser |
| F-012 | sound-effects | Poker Table Play |
| F-013 | card-deal-animation | Poker Table Play |
<!-- END:ux-flows.md -->