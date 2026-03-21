## User Journeys

### Flow 1: New Session — Start & Play a Hand (game-loop)
1. **Landing/Home Screen** → User sees main menu with "开始练习" (Start Practice) and "历史记录" (History) options
2. **Table Setup** → User selects seat position (UTG/MP/CO/BTN/SB/BB), confirms starting stack (default 100BB)
3. **Hand Begins** → Dealer button assigned, blinds posted automatically, hole cards dealt to user with animation
4. **Preflop Action** → Action proceeds clockwise; when it's user's turn, action panel appears with Fold/Check/Call/Raise/All-in buttons + pot/stack/range info
5. **Flop Deal** → Three community cards revealed with animation, pot updated
6. **Flop Action** → Same action flow as preflop; BOTs act based on their style profiles
7. **Turn Deal** → Fourth community card revealed
8. **Turn Action** → Action round
9. **River Deal** → Fifth community card revealed
10. **River Action** → Final action round
11. **Showdown / Hand End** → Winner determined, chips animated to winner, hand summary overlay appears
12. **Continue or Review** → User chooses "下一手" (Next Hand) or "复盘本局" (Review This Hand)

### Flow 2: Player Action Decision (action-decision)
1. **Action Prompt** → User's turn indicator highlights their seat, timer-optional visual cue
2. **View Context** → User sees: current pot size, own stack, effective stacks, min/max raise range, current bet to call
3. **Select Action** → Tap one of: Fold / Check / Call / Raise / All-in
4. **Raise Adjustment** (if Raise selected) → Slider + manual input for raise amount, constrained to [min raise, all-in]; preset buttons (½ pot, ¾ pot, pot, 2x pot)
5. **Confirm Action** → Action submitted, table state updates instantly, action logged to hand recorder

### Flow 3: Post-Hand Review / Replayer (hand-review)
1. **Enter Review** → From hand-end overlay ("复盘本局") or from history list click
2. **Replay Controls** → Visual poker table shows initial state; transport bar with ◀ Previous / ▶ Next / ⏮ Start / ⏭ End / street jump buttons
3. **Step Through Actions** → Each click advances one action; table updates (cards, chips, pot, player actions) accordingly
4. **GTO Comparison Overlay** → At each user decision point, side panel shows:
   - User's actual action (highlighted)
   - GTO recommended action(s) with frequency %
   - Color-coded badge: 🟢 green (match) / 🟡 yellow (minor deviation) / 🔴 red (major deviation)
   - Estimated EV difference
5. **Navigate Freely** → User can jump to any decision point or street

### Flow 4: GTO Comparison & Leak Analysis (leak-analysis)
1. **Review Summary Screen** → After completing full hand replay, summary panel appears
2. **Decision Score Card** → List of all user decision points with color-coded GTO alignment
3. **Top 5 Leaks** → Sorted by EV loss, each showing:
   - Street + action context (e.g., "River: Check → should Bet 75% pot")
   - Leak type tag (e.g., "过度弃牌 vs 3bet", "河牌 bluff 不足")
   - EV loss amount in BB
   - Brief improvement suggestion text
4. **Drill Down** → Tap any leak to jump to that exact replay point with GTO overlay visible

### Flow 5: Session History & Statistics (session-stats)
1. **Open History** → From home screen, tap "历史记录"
2. **Hand List** → Scrollable list, newest first; each row shows: date/time, position, hole cards (if shown), result (+/- BB), key action tag
3. **Filter/Sort** → Filter by date range, position, result (winning/losing hands)
4. **Cumulative Stats Dashboard** → Top section shows aggregate stats:
   - Total hands played
   - Win rate (BB/100)
   - VPIP %, PFR %, 3bet %
   - Profit/loss trend chart (line graph over hands)
5. **Tap Hand → Enter Replayer** → Any hand row click opens Flow 3

### Flow 6: Data Management (data-management)
1. **Settings Screen** → Accessible from home screen gear icon
2. **Storage Info** → Shows current IndexedDB usage, total hands stored
3. **Clear Old Data** → User prompted when storage is high; option to delete hands older than X days
4. **Confirm Deletion** → Confirmation dialog before destructive action

---

## Interaction Rules

### Form & Input Validation
- Raise amount input validates in real-time: must be ≥ min raise and ≤ player's remaining stack
- Invalid raise amounts disable the confirm button and show inline error ("最小加注: X BB")
- Seat selection enforced as single-select radio group

### Error Display Patterns
- Invalid actions (e.g., check when facing a bet) are never shown — action buttons are contextually enabled/disabled
- Storage quota warnings appear as non-blocking toast notifications
- Data deletion confirmations use modal dialogs with explicit "确认删除" / "取消" buttons

### Loading States
- Initial app load: skeleton table layout while IndexedDB hydrates
- Hand deal: card-flip animation serves as natural loading indicator (no spinner needed)
- GTO calculation during replay: inline spinner on the GTO panel with "计算中..." text, resolves in <500ms (Monte Carlo runs client-side)
- History list: skeleton rows while querying IndexedDB

### Action Panel Behavior
- Action panel only visible during user's turn; slides up from bottom on mobile-width, appears as fixed right panel on desktop
- Fold/Check/Call buttons are single-tap instant actions
- Raise opens secondary slider panel; All-in is single-tap with confirmation dialog ("确定 All-in?")
- After action submission, panel immediately hides and table animates the action

### Replay Navigation
- Keyboard shortcuts: ← previous action, → next action, 1-4 jump to street (preflop/flop/turn/river)
- Click on any decision point marker in the action timeline to jump directly
- GTO overlay panel stays visible throughout replay, updates per decision point

### Animation & Timing
- Card deal animation: 200ms per card
- Chip movement animation: 300ms
- BOT action delay: 500ms–1500ms randomized for realism
- Street transition (flop/turn/river reveal): 400ms per card

### Responsive Layout
- Primary target: desktop (1280px+), table is centered with side panels
- Minimum supported width: 1024px
- No mobile-specific layouts in MVP (constraint from PRD)

### Color Coding System (GTO Analysis)
- 🟢 Green (#22c55e): Action matches GTO recommendation (within top frequency action)
- 🟡 Yellow (#eab308): Action is in GTO range but not primary recommendation, or EV loss < 0.5BB
- 🔴 Red (#ef4444): Action not in GTO range or EV loss ≥ 0.5BB

### Data Persistence Rules
- Every completed hand auto-saves to IndexedDB immediately
- Incomplete hands (user closes mid-hand) are discarded
- Statistics recalculated from raw hand data on dashboard open (no separate stats cache)
- Storage warning threshold: when stored hands exceed 10,000 or IndexedDB usage > 50MB

---

## Component Inventory

### Layout Components
- **AppShell**: Top-level layout wrapper with header navigation and content area routing
- **HomeScreen**: Landing page with primary CTAs (Start Practice, History) and quick stats summary
- **SettingsPanel**: Application settings including data management and storage info

### Table & Game Components
- **PokerTable**: Central six-player table visualization (oval layout with 6 seat positions, community card area, pot display)
- **PlayerSeat**: Individual player seat showing avatar/name, stack size, current action label, bet amount, hole cards (face-down or face-up), dealer/blind chips, active turn indicator
- **CommunityCards**: Horizontal card display area for flop/turn/river (0-5 cards) with deal animations
- **PotDisplay**: Central pot amount display, updates on each action, shows side pots if applicable
- **CardComponent**: Single playing card with suit/rank, supports face-up/face-down states and flip animation
- **ChipStack**: Visual chip representation for bets and stacks, animated for movements

### Action Components
- **ActionPanel**: Container for all user action controls, contextually shown during user's turn
- **ActionButton**: Individual action button (Fold/Check/Call/Raise/All-in) with enabled/disabled states and amount labels
- **RaiseSlider**: Slider + numeric input for selecting raise amount, with preset buttons (½ pot, ¾ pot, pot, 2x pot) and min/max constraints
- **AllInConfirmDialog**: Modal confirmation before executing all-in action

### Replay Components
- **HandReplayer**: Full replay interface wrapping PokerTable in read-only mode with transport controls
- **ReplayControls**: Transport bar with prev/next/start/end buttons and street jump shortcuts
- **ActionTimeline**: Horizontal timeline showing all actions in the hand, with clickable decision point markers
- **DecisionPointMarker**: Colored dot/badge on timeline indicating user decision quality (green/yellow/red)

### GTO Analysis Components
- **GTOPanel**: Side panel showing GTO comparison data for current decision point during replay
- **GTOActionComparison**: Row showing user action vs GTO recommended action with frequency percentages
- **EVDifferenceBadge**: Color-coded badge showing EV difference between user action and GTO optimal
- **GTOFrequencyBar**: Horizontal stacked bar showing action frequencies (fold/check/call/raise percentages)

### Leak Analysis Components
- **ReviewSummary**: Post-hand or post-session summary screen with overall GTO alignment score
- **LeakCard**: Card component for each identified leak, showing street context, leak type tag, EV loss, and improvement suggestion
- **LeakTypeTag**: Categorized tag badge (e.g., "过度弃牌", "bluff 频率过高", "value bet 不足")
- **ImprovementTip**: Collapsible text block with brief strategic improvement advice

### History & Stats Components
- **HandHistoryList**: Scrollable list of past hands with summary rows, supports filtering and sorting
- **HandHistoryRow**: Single hand summary: date, position, hole cards, result (+/- BB), key action tag
- **HistoryFilter**: Filter controls for date range, position, and result type
- **StatsDashboard**: Aggregate statistics display with key metrics (hands, win rate, VPIP, PFR, 3bet%)
- **ProfitChart**: Line chart showing BB profit/loss trend over hands played
- **StatCard**: Individual metric card showing label, value, and optional trend indicator

### Shared / Utility Components
- **Modal**: Generic modal dialog for confirmations and information display
- **Toast**: Non-blocking notification for success messages, warnings, and storage alerts
- **SkeletonLoader**: Placeholder loading state for table, list rows, and panels
- **Spinner**: Inline loading spinner for GTO calculation states
- **IconButton**: Reusable icon-based button used in navigation, settings, and controls
- **SeatSelector**: Pre-game seat selection interface showing 6 positions with labels (UTG/MP/CO/BTN/SB/BB)

### Data Management Components
- **StorageInfo**: Display of current IndexedDB usage and hand count
- **DataCleanupDialog**: Modal for selecting and confirming deletion of old hand data