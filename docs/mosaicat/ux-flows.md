# UX Flows — GTO Idiot 德州扑克GTO策略练习器

---

## Interaction Patterns

| Pattern | Implementation |
|---------|---------------|
| Form validation | Real-time per-field on blur + full validation on submit |
| Error display | Inline below field (forms) / Toast (actions) / Full-screen (fatal) |
| Loading — lists | Skeleton screen (hand history list) |
| Loading — buttons | Spinner inside button, button disabled |
| Loading — data | Progress bar with percentage (GTO strategy data initial load) |
| Empty state | Illustration + descriptive text + primary action button |
| Navigation | Top nav bar with tabs: 牌桌 / 手牌历史 / 设置 |
| Destructive actions | Confirmation dialog before execution (end session, clear history) |
| Tooltips | Hover (desktop) triggers tooltip for poker terms; click dismisses |
| Cards | SVG-based card rendering, face-up/face-down states |
| Chips | Numeric display with color-coded badges |

---

## User Journeys

### Flow: session-start (covers F-001, F-010, F-011)

**Happy Path:**
1. User sees **Home Screen**: app logo "GTO Idiot", tagline "零成本掌握GTO基础", two buttons — "开始新游戏" (primary) and "手牌历史" (secondary). If a previous unfinished session exists, a **SessionResumeDialog** appears: "检测到上次未完成的session，是否继续？" with "继续游戏" / "开始新游戏" buttons.
2. User clicks "开始新游戏" → System shows **SessionSetupPanel**: blind level selector (radio group: 1/2, 2/5, 5/10, default 1/2), buy-in display (fixed 100BB, shown as chip count e.g. "200 chips at 1/2"), "确认开始" button.
3. User selects blind level and clicks "确认开始" → System shows **PokerTable** with 6 seats arranged around an oval table. User's seat is pre-assigned (bottom center, Seat 1). Each seat shows: player name (User / BOT-1~5), chip count (100BB), empty position label. A "选择座位" prompt highlights the user's seat with a pulsing border.
4. User confirms seat → System assigns 5 BOTs to remaining seats, dealer button placed randomly, position labels (UTG/MP/CO/BTN/SB/BB) displayed on each seat. Blinds auto-deducted. First hand begins with card dealing animation.
5. Outcome: User is seated at a 6-max table with 100BB, blinds posted, hole cards dealt (user's cards face-up, BOT cards face-down). Game is in progress.

**Error States:**
- IndexedDB unavailable (Safari Private Browsing) → User sees **FullScreenError**: "您的浏览器不支持本地存储（可能处于隐私浏览模式）。请使用普通浏览模式以保存游戏记录。" with "了解详情" link.
- GTO strategy data fails to load → User sees **LoadingErrorBanner** at top of table: "GTO策略数据加载失败，BOT将使用简化策略。" with "重试" button.

**Empty State:**
- First-time user, no previous sessions → Home Screen shows welcome illustration (poker chips + cards graphic) + "开始你的第一局GTO训练" text + "开始新游戏" primary button. No "手牌历史" badge count.

**Loading State:**
- GTO strategy data loading on first visit → **StrategyLoadingOverlay**: progress bar with "正在加载GTO策略数据... 65%" text. Table renders underneath but is non-interactive until loading completes.
- Session resuming → Spinner inside "继续游戏" button, button disabled. Table skeleton renders.

---

### Flow: hand-play (covers F-001, F-002, F-003, F-004, F-010)

**Happy Path:**
1. User sees **PokerTable** at hand start: dealer button on a seat, blinds auto-posted (SB/BB chips deducted and shown in pot area), each player has two hole cards (user's face-up with rank/suit, BOTs face-down). Pot amount shown center-table. Street indicator shows "Preflop".
2. Action proceeds clockwise from UTG. When a BOT acts → BOT seat briefly highlights, an **ActionLabel** appears next to their seat (e.g., "Fold", "Raise to 6BB") for 1.5 seconds, pot updates. BOT decisions sourced from GTO strategy tables (F-003, F-004); query result (frequency distribution) logged to hand history.
3. When it's user's turn → User's seat highlights with a glowing border. **ActionPanel** slides up at bottom of screen showing:
   - Current pot size (e.g., "底池: 7BB")
   - User's remaining chips (e.g., "筹码: 94BB")
   - Amount to call if applicable (e.g., "跟注: 3BB")
   - Legal action buttons only: **FoldButton** (灰) / **CheckButton** (if no bet) or **CallButton** (蓝, shows amount) / **RaiseButton** (橙)
4. User clicks **RaiseButton** → **RaiseSlider** expands below the action buttons showing: min-raise amount (left), max/all-in amount (right), draggable slider, numeric input field, preset buttons (1/2 pot, 3/4 pot, pot, all-in). Slider and input are synced.
5. User sets raise amount and clicks "确认加注" → Action executes immediately. **ActionLabel** "Raise to 8BB" appears next to user's seat. Pot updates. Action panel hides. Next player's turn begins.
6. After all preflop action completes → **Flop** animation: three community cards dealt face-up in center above pot. Street indicator changes to "Flop". New betting round begins.
7. Process repeats for Flop → Turn (one card) → River (one card).
8. At showdown → All remaining players' cards flip face-up. **ShowdownPanel** appears: winning hand highlighted, hand rank label (e.g., "两对 A和K"), pot awarded with chip animation to winner. **HandResultBanner**: "+15BB" (green) or "-6BB" (red).
9. If all opponents fold → User wins by default. Pot awarded. Opponents' cards remain hidden. **HandResultBanner**: "+7BB" (green).
10. After 2-second pause → Next hand auto-deals. Dealer button moves one seat clockwise. Position labels update.
11. Outcome: Hand complete, result displayed, hand history auto-saved (F-005), next hand begins.

**Error States:**
- User disconnects mid-hand (closes tab accidentally) → On return, **SessionResumeDialog** offers to continue. If hand was in progress, that hand is voided and not recorded. Session resumes from next hand.
- GTO strategy table miss (Postflop, no matching spot for BOT) → BOT uses simplified fallback rules (F-003 AC-3). No user-visible error; in replay, this spot is marked "简化策略" instead of GTO frequencies.

**Empty State:**
- N/A — this flow only occurs during active gameplay.

**Loading State:**
- BOT "thinking" → Brief pause (300-800ms randomized) with a subtle thinking indicator (three animated dots) next to the BOT's seat, simulating decision time.
- Card dealing → 200ms sequential dealing animation per card.

---

### Flow: player-action-decision (covers F-002)

**Happy Path:**
1. User sees **ActionPanel** at bottom of screen with legal actions. A countdown timer (30 seconds) is displayed as a thin progress bar above the panel.
2. User evaluates the situation using displayed info: pot size, own chips, call amount, own hole cards, community cards.
3. User taps one of: **FoldButton** / **CheckButton** / **CallButton** → Action executes immediately with confirmation animation (button briefly turns green). Panel slides away.
4. OR User taps **RaiseButton** → **RaiseSlider** appears. User adjusts amount via slider, input field, or preset buttons. User taps "确认加注" → Raise executes.
5. Outcome: User's decision is registered, game proceeds.

**Error States:**
- User enters raise amount below minimum → Inline error below input: "最小加注额为 X BB". "确认加注" button remains disabled.
- User enters raise amount above their stack → Input auto-corrects to all-in amount. Label changes to "All-in".
- Action timer expires (30 seconds) → Auto-fold with toast notification: "超时自动弃牌".

**Empty State:**
- N/A — panel only appears when it's user's turn.

**Loading State:**
- Action submission → Button shows spinner for 100ms then disappears (near-instant since all client-side).

---

### Flow: session-end (covers F-001, F-005, F-011)

**Happy Path:**
1. User sees game in progress. User clicks **EndSessionButton** (top-right "结束session" text button).
2. System shows **ConfirmDialog**: "确定要结束本次session吗？" with "结束" / "继续游戏" buttons.
3. User clicks "结束" → If a hand is in progress, it completes first (or user can fold immediately). Then **SessionSummaryPanel** appears as a modal:
   - 总手数: 47
   - 净盈亏: +23.5BB (green) or -15BB (red)
   - 游玩时长: 32分钟
   - "查看手牌历史" button / "返回主页" button
4. User clicks "返回主页" → Returns to Home Screen.
5. Outcome: Session ended, all hands saved, summary displayed.

**Error States:**
- IndexedDB write fails during session save → **Toast** (warning): "部分手牌记录保存失败，建议清理旧记录后重试。" with "清理记录" link.

**Empty State:**
- Session with 0 completed hands (user ends immediately) → SessionSummaryPanel shows "本次session未完成任何手牌" with "返回主页" button only.

**Loading State:**
- Session data saving → Spinner inside "结束" button while final writes complete.

---

### Flow: busted-rebuy (covers F-001)

**Happy Path:**
1. User's chips reach 0 after a hand loss → **BustedDialog** appears: "你的筹码已耗尽" with avatar illustration showing empty chip stack.
2. Two options: "重新买入 (100BB)" primary button / "结束session" secondary button.
3. User clicks "重新买入" → Chips reset to 100BB. Next hand begins normally.
4. User clicks "结束session" → Redirects to session-end flow.
5. Outcome: User continues playing or session ends gracefully.

**Error States:**
- N/A — simple local state operation.

**Empty State:**
- N/A.

**Loading State:**
- N/A — instant operation.

---

### Flow: hand-history-browse (covers F-005, F-006, F-014)

**Happy Path:**
1. User navigates to **HandHistoryPage** via top nav "手牌历史" tab.
2. User sees **HandHistoryList**: cards displayed in reverse chronological order. Each **HandHistoryCard** shows:
   - 时间: "3分钟前" / "2024-01-15 14:32"
   - 位置: "BTN" (with position badge color)
   - 起手牌: card icons (e.g., A♠ K♥)
   - 结果: "+12BB" (green) or "-6BB" (red)
3. Above the list: **FilterBar** with filter chips:
   - 位置: dropdown (全部 / UTG / MP / CO / BTN / SB / BB)
   - 盈亏: dropdown (全部 / 赢 / 输)
   - 起手牌类型: dropdown (全部 / 口袋对 / 同花连张 / 同花非连张 / 非同花连张 / 其他)
4. User selects "BTN" position filter → List instantly filters to show only BTN hands. Filter chip shows active state. Result count updates: "显示 12 / 47 手".
5. User combines filters: BTN + 赢 → List narrows further. "显示 8 / 47 手".
6. User clicks a **HandHistoryCard** → Navigates to **HandReplayPage** for that hand.
7. Outcome: User can browse, filter, and select hands for replay.

**Error States:**
- IndexedDB read fails → **InlineError** replacing list: "无法读取手牌记录" with "重试" button.
- Filter returns no results → **EmptyFilterResult**: "没有符合筛选条件的手牌" with "清除筛选" button.

**Empty State:**
- No hands recorded yet → **EmptyHistoryIllustration**: poker table illustration + "还没有手牌记录" text + "开始游戏" primary button linking to session-start flow.

**Loading State:**
- Initial list load → 5 **HandHistoryCardSkeleton** items (gray pulsing rectangles matching card layout).
- Scroll pagination (>50 hands) → **LoadMoreSpinner** at bottom of list while next batch loads via virtual scroll.

---

### Flow: hand-replay-playback (covers F-007, F-008, F-010)

**Happy Path:**
1. User enters **HandReplayPage** from hand history list. Page shows:
   - **ReplayPokerTable**: same oval table layout as game, initialized to hand start state (seats, chip counts, blinds posted, all cards face-down).
   - **ReplayControls**: "⏮ 开始" / "◀ 上一步" / "▶ 下一步" / "⏭ 结束" buttons at bottom.
   - **ReplayTimeline**: horizontal progress bar showing all action points as dots, grouped by street (Preflop | Flop | Turn | River | Showdown). Current position highlighted.
   - **ActionLog** panel (right side or collapsible): text list of all actions in the hand.
2. User clicks "▶ 下一步" → Table state advances: first action shown (e.g., UTG folds — UTG seat grays out, ActionLabel "Fold" appears). Timeline dot advances. ActionLog highlights current action.
3. User continues clicking "下一步" through preflop actions → When reaching flop deal point, three community cards animate onto the table. Street indicator changes to "Flop".
4. At each **user decision point** → The action is highlighted with a distinct border color. A **GTODeviationPanel** appears beside the table:
   - "你的选择: Call" (with actual action)
   - "GTO建议:" followed by a **FrequencyBar** (horizontal stacked bar chart): Raise 65% (orange) | Call 25% (blue) | Fold 10% (gray)
   - **DeviationBadge**: "符合GTO" (green, if user chose action with >40% frequency) OR "显著偏差" (red, if <20% frequency) OR "轻微偏差" (yellow, 20-40%)
5. User clicks "◀ 上一步" → Table state reverts to previous action point. Community cards removed if stepping back past a street deal.
6. User clicks through to showdown → All remaining players' cards revealed. Hand rank labels shown. Winner highlighted. Final pot distribution displayed.
7. User clicks "⏮ 开始" → Resets to initial state. User can replay again.
8. Outcome: User has reviewed the complete hand with GTO deviation analysis at each decision point.

**Error States:**
- Hand record corrupted or incomplete → **InlineError** on replay page: "该手牌记录不完整，无法回放" with "返回手牌列表" button.
- GTO data unavailable for a Postflop spot (F-008 AC-4) → **GTODeviationPanel** shows: "此spot暂无GTO数据" in a muted info box. No deviation badge displayed. No false analysis.

**Empty State:**
- N/A — user always enters from a specific hand record.

**Loading State:**
- Hand data loading → **ReplayTableSkeleton**: gray oval table outline + 6 seat placeholders + pulsing cards.
- GTO data lookup per decision point → Small spinner inside **GTODeviationPanel** for 200ms while strategy table is queried.

---

### Flow: gto-explanation-detail (covers F-009)

**Happy Path:**
1. User is on **HandReplayPage** at a user decision point where **GTODeviationPanel** is visible.
2. User clicks "为什么？" link/button inside the GTODeviationPanel.
3. System shows **GTOExplanationDrawer** (slide-in panel from right):
   - **RangeHeatmap**: 13×13 grid of all 169 starting hands, color-coded by action frequency for the current position. User's actual hand cell is highlighted with a pulsing border.
   - Legend: Raise (orange) / Call (blue) / Fold (gray) with gradient intensity.
   - **ExplanationText**: Natural language explanation in beginner-friendly Chinese. Example: "在CO位置，A5s是一手边缘手牌。GTO建议以60%的频率加注，40%弃牌。加注是为了保持你的范围平衡——如果你只加注强牌，对手可以轻松应对。混合策略让对手无法判断你的牌力。"
   - **MixedStrategyNote** (if applicable): "为什么不是100%加注？如果你总是加注A5s，你CO位置的加注范围会过宽，对手在大盲位可以更频繁地3-bet来利用你。"
4. For Postflop spots → If GTO data available, shows simplified explanation. If not available, shows "此spot暂无详细解释数据".
5. User closes drawer via X button or clicking outside → Returns to replay view.
6. Outcome: User understands the reasoning behind GTO's recommendation.

**Error States:**
- Postflop spot has no explanation data → **GTOExplanationDrawer** shows: "此spot暂无详细GTO解释" with a general tip: "Postflop策略取决于公共牌面、位置和筹码深度的复杂交互，建议先掌握Preflop范围。"

**Empty State:**
- N/A — drawer only opens from an existing decision point.

**Loading State:**
- Range heatmap rendering → **HeatmapSkeleton**: 13×13 grid of gray pulsing cells for 300ms.

---

### Flow: bot-decision-inspection (covers F-013)

**Happy Path:**
1. User is on **HandReplayPage**, replaying through a hand.
2. At a BOT's decision point, user clicks on the BOT's **ActionLabel** or seat.
3. **BotDecisionPopover** appears near the BOT's seat:
   - BOT name and position (e.g., "BOT-3 (CO)")
   - "GTO策略:" **FrequencyBarChart** (horizontal bar: Raise 60% | Call 40%)
   - "本次执行:" badge showing the actual action (e.g., "Call" highlighted on the bar)
   - Visual: the bar chart has a marker/arrow pointing to the actually chosen action segment.
4. User clicks elsewhere → Popover closes.
5. Outcome: User understands how BOT's mixed strategy worked for this specific decision.

**Error States:**
- BOT used fallback strategy (no GTO table match) → **BotDecisionPopover** shows: "此决策使用了简化策略（无匹配的GTO数据）" with the action taken but no frequency chart.

**Empty State:**
- N/A — only appears for BOT actions that occurred.

**Loading State:**
- Popover content → Instant (data already loaded with hand record).

---

### Flow: glossary-tooltip (covers F-012)

**Happy Path:**
1. User sees a poker term in the UI (e.g., "UTG" position label on the table, "3-bet" in an explanation, "EV" in GTO analysis). The term has a subtle dotted underline indicating it's interactive.
2. User hovers over the term (desktop) → **GlossaryTooltip** appears after 300ms delay:
   - Term in bold: "UTG (Under The Gun)"
   - Definition: "枪口位，大盲注左手边第一个行动的位置。由于需要最先做决策且后面还有多人未行动，是最不利的位置之一。"
3. User moves mouse away → Tooltip fades out after 200ms.
4. Outcome: User learns the term without leaving the current context.

**Error States:**
- N/A — glossary is static embedded data.

**Empty State:**
- N/A.

**Loading State:**
- N/A — instant rendering from local data.

---

### Flow: hand-export (covers F-015)

**Happy Path:**
1. User is on **HandHistoryPage** with hands displayed (possibly filtered).
2. User clicks **ExportButton** ("导出") in the top-right of the page.
3. **ExportDialog** appears:
   - "导出范围:" radio group — "全部手牌 (47手)" / "当前筛选结果 (12手)"
   - "格式:" display text — "标准扑克手牌历史格式 (.txt)"
   - "导出" primary button / "取消" secondary button
4. User selects scope and clicks "导出" → Browser triggers file download. File named "gto-idiot-hands-20240115.txt". **Toast** (success): "已导出12手牌记录".
5. Outcome: User has a downloadable text file of hand histories.

**Error States:**
- No hands to export (empty history or empty filter) → **ExportButton** is disabled with tooltip: "没有可导出的手牌".
- File generation fails → **Toast** (error): "导出失败，请重试".

**Empty State:**
- N/A — button disabled when no data.

**Loading State:**
- File generation → Spinner inside "导出" button while generating text file.

---

### Flow: gto-data-initialization (covers F-004)

**Happy Path:**
1. User opens the app for the first time → System begins loading GTO strategy data in the background.
2. **StrategyLoadingIndicator** appears on Home Screen: small progress bar below the "开始新游戏" button — "正在加载策略数据... 45%". Button is disabled during loading.
3. Preflop range tables (169 hands × 6 positions) load first (higher priority). Then Postflop common spots load.
4. Loading completes → Progress bar disappears. "开始新游戏" button becomes active. Data cached in memory for session.
5. On subsequent visits → Data loads from browser cache (near-instant). No visible loading indicator.
6. Outcome: All GTO strategy data available for BOT decisions and replay analysis.

**Error States:**
- Network error loading strategy data (if loaded from CDN) → **Toast** (error): "策略数据加载失败" with "重试" button. If retry fails, app works with degraded Postflop (fallback rules only).
- Data corruption → Silent re-download. If still fails, same degraded mode.

**Empty State:**
- N/A.

**Loading State:**
- First load → Progress bar with percentage (compressed data < 2MB).
- Subsequent loads → No visible loading (cached).

---

### Flow: storage-management (covers F-005)

**Happy Path:**
1. System auto-saves every completed hand to IndexedDB (invisible to user during gameplay).
2. If storage approaches limit → **StorageWarningBanner** appears on HandHistoryPage: "存储空间不足，建议清理旧记录" with "清理" button.
3. User clicks "清理" → **StorageCleanupDialog**: "选择清理范围" with options: "30天前的记录" / "全部记录" / "取消". Shows space that will be freed.
4. User selects and confirms → Records deleted. **Toast** (success): "已清理 156 条旧记录，释放 2.3MB".
5. Outcome: Storage space freed, recent records preserved.

**Error States:**
- IndexedDB write fails during hand save → **Toast** (warning): "手牌记录保存失败" — game continues, but this hand won't be in history.
- IndexedDB unavailable entirely → **FullScreenError** at app start (see session-start flow).

**Empty State:**
- N/A.

**Loading State:**
- Cleanup operation → Spinner inside "确认清理" button.

---

## Component Inventory

### Layout Components
| Component | Description | Used In |
|-----------|-------------|---------|
| **AppShell** | Top nav bar + main content area + optional bottom panel | All pages |
| **TopNavBar** | App name "GTO Idiot" + tab navigation (牌桌 / 手牌历史) + settings icon | All pages |
| **PageContainer** | Max-width centered content wrapper with padding | All pages |

### Home / Session Components
| Component | Description | Used In |
|-----------|-------------|---------|
| **HomeScreen** | Landing page with logo, tagline, and action buttons | session-start |
| **SessionSetupPanel** | Blind level selector + buy-in display + confirm button | session-start |
| **SessionResumeDialog** | Modal asking to resume or start new session | session-start |
| **SessionSummaryPanel** | Modal showing session stats (hands, P&L, duration) | session-end |
| **BustedDialog** | Modal for zero-chips state with rebuy/end options | busted-rebuy |
| **ConfirmDialog** | Generic confirmation modal with two action buttons | session-end, storage-management |

### Poker Table Components
| Component | Description | Used In |
|-----------|-------------|---------|
| **PokerTable** | Oval table SVG with seat positions, pot area, community cards area | hand-play, hand-replay-playback |
| **PlayerSeat** | Seat UI: avatar, name, chip count, position badge, hole cards area, active highlight | hand-play, hand-replay-playback |
| **PositionBadge** | Colored label (UTG/MP/CO/BTN/SB/BB) | hand-play, hand-replay-playback |
| **DealerButton** | "D" chip marker on dealer seat | hand-play, hand-replay-playback |
| **HoleCards** | Two card images (face-up for user, face-down for BOTs) | hand-play, hand-replay-playback |
| **CommunityCards** | 3-5 card images displayed horizontally above pot | hand-play, hand-replay-playback |
| **PotDisplay** | Chip count in center of table | hand-play, hand-replay-playback |
| **ActionLabel** | Temporary floating label next to seat showing action (e.g., "Raise to 6BB") | hand-play, hand-replay-playback |
| **CardFace** | Single playing card SVG with rank + suit | All table views |
| **CardBack** | Card back design SVG | hand-play |
| **StreetIndicator** | Label showing current street (Preflop/Flop/Turn/River) | hand-play, hand-replay-playback |
| **ThinkingDots** | Three animated dots indicating BOT thinking | hand-play |
| **ShowdownPanel** | Overlay showing winner, hand ranks, pot distribution | hand-play |
| **HandResultBanner** | "+15BB" / "-6BB" colored result display | hand-play |

### Action Panel Components
| Component | Description | Used In |
|-----------|-------------|---------|
| **ActionPanel** | Bottom panel with pot info, chip info, action buttons | player-action-decision |
| **FoldButton** | Gray action button for fold | player-action-decision |
| **CheckButton** | Blue action button for check | player-action-decision |
| **CallButton** | Blue action button showing call amount | player-action-decision |
| **RaiseButton** | Orange action button to open raise slider | player-action-decision |
| **RaiseSlider** | Expandable panel with slider, input, preset buttons | player-action-decision |
| **PresetRaiseButton** | Quick-select buttons (1/2 pot, 3/4 pot, pot, all-in) | player-action-decision |
| **ActionTimer** | Thin progress bar countdown (30 seconds) | player-action-decision |

### Hand History Components
| Component | Description | Used In |
|-----------|-------------|---------|
| **HandHistoryPage** | Full page with filter bar + hand list + export button | hand-history-browse |
| **FilterBar** | Horizontal bar with filter dropdowns | hand-history-browse |
| **FilterDropdown** | Dropdown selector for position / P&L / hand type | hand-history-browse |
| **FilterChip** | Active filter indicator pill | hand-history-browse |
| **ResultCount** | "显示 12 / 47 手" text | hand-history-browse |
| **HandHistoryList** | Scrollable list container with virtual scroll | hand-history-browse |
| **HandHistoryCard** | List item: time, position badge, hole cards, P&L result | hand-history-browse |
| **HandHistoryCardSkeleton** | Loading placeholder for hand history card | hand-history-browse |
| **LoadMoreSpinner** | Spinner at bottom of list during pagination | hand-history-browse |
| **ExportButton** | "导出" button in header | hand-export |
| **ExportDialog** | Modal with export scope and format options | hand-export |

### Replay Components
| Component | Description | Used In |
|-----------|-------------|---------|
| **HandReplayPage** | Full page with replay table + controls + GTO panel | hand-replay-playback |
| **ReplayPokerTable** | PokerTable variant with replay state management | hand-replay-playback |
| **ReplayControls** | Playback buttons: start, prev, next, end | hand-replay-playback |
| **ReplayTimeline** | Horizontal progress bar with street-grouped action dots | hand-replay-playback |
| **ActionLog** | Collapsible text panel listing all actions in sequence | hand-replay-playback |
| **ReplayTableSkeleton** | Loading placeholder for replay table | hand-replay-playback |

### GTO Analysis Components
| Component | Description | Used In |
|-----------|-------------|---------|
| **GTODeviationPanel** | Side panel showing user action vs GTO frequencies | hand-replay-playback |
| **FrequencyBar** | Horizontal stacked bar chart of action frequencies | hand-replay-playback, bot-decision-inspection |
| **DeviationBadge** | Colored badge: 符合GTO (green) / 轻微偏差 (yellow) / 显著偏差 (red) | hand-replay-playback |
| **GTOExplanationDrawer** | Slide-in right panel with range heatmap + explanation text | gto-explanation-detail |
| **RangeHeatmap** | 13×13 color-coded grid of 169 starting hands | gto-explanation-detail |
| **HeatmapSkeleton** | Loading placeholder for range heatmap | gto-explanation-detail |
| **ExplanationText** | Natural language GTO reasoning in Chinese | gto-explanation-detail |
| **MixedStrategyNote** | Callout explaining why mixed strategies exist | gto-explanation-detail |
| **BotDecisionPopover** | Floating popover showing BOT's GTO frequencies + actual action | bot-decision-inspection |
| **GTOUnavailableNotice** | Info box: "此spot暂无GTO数据" | hand-replay-playback, gto-explanation-detail |

### Glossary Components
| Component | Description | Used In |
|-----------|-------------|---------|
| **GlossaryTerm** | Inline text with dotted underline indicating tooltip-enabled term | glossary-tooltip |
| **GlossaryTooltip** | Hover/click tooltip with term name + Chinese definition | glossary-tooltip |

### Feedback Components
| Component | Description | Used In |
|-----------|-------------|---------|
| **Toast** | Temporary notification (success green / warning yellow / error red) | Multiple flows |
| **FullScreenError** | Full-page error with illustration + message + action | session-start, storage-management |
| **InlineError** | Error message replacing content area with retry button | hand-history-browse, hand-replay-playback |
| **StorageWarningBanner** | Yellow banner warning about storage limits | storage-management |
| **StrategyLoadingOverlay** | Progress bar overlay during GTO data load | gto-data-initialization |
| **StrategyLoadingIndicator** | Small progress bar on home screen | gto-data-initialization |
| **LoadingErrorBanner** | Top banner for non-fatal loading errors | session-start |

### Utility Components
| Component | Description | Used In |
|-----------|-------------|---------|
| **StorageCleanupDialog** | Modal for selecting cleanup range + confirming deletion | storage-management |
| **EmptyHistoryIllustration** | Illustration + text + CTA for empty hand history | hand-history-browse |
| **EmptyFilterResult** | Message + clear filter button for empty filter results | hand-history-browse |

---

## Feature Coverage Verification

| Feature ID | Feature Name | Covered By Flow(s) |
|------------|-------------|-------------------|
| F-001 | poker-table-game | session-start, hand-play, session-end, busted-rebuy |
| F-002 | player-action-ui | hand-play, player-action-decision |
| F-003 | bot-gto-decision | hand-play |
| F-004 | gto-strategy-data | hand-play, gto-data-initialization |
| F-005 | hand-history-storage | session-end, hand-history-browse, storage-management |
| F-006 | hand-history-list | hand-history-browse |
| F-007 | hand-replay | hand-replay-playback |
| F-008 | gto-deviation-analysis | hand-replay-playback |
| F-009 | gto-explanation | gto-explanation-detail |
| F-010 | poker-table-ui | session-start, hand-play, hand-replay-playback |
| F-011 | session-management | session-start, session-end |
| F-012 | beginner-glossary | glossary-tooltip |
| F-013 | bot-decision-transparency | bot-decision-inspection |
| F-014 | position-filter | hand-history-browse |
| F-015 | hand-export | hand-export |

✅ All 15 features (F-001 through F-015) are covered by at least one flow.