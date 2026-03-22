## User Journeys

### Flow 1: New Session & Gameplay (game-loop)
**Covers: F-001, F-003, F-004, F-006**

```
Landing Page
  → Click "开始新会话"
  → Table UI loads (6 players seated, 100BB each, random seat assignment)
  → Hand begins: Blinds posted automatically (SB/BB)
  → Preflop: Cards dealt to user → BOTs act in position order → User's turn: action panel appears
    → User selects action (Fold / Call / Raise slider / All-in)
    → Remaining BOTs act → Preflop resolves
  → Flop: 3 community cards revealed → Betting round (same action flow)
  → Turn: 1 community card revealed → Betting round
  → River: 1 community card revealed → Betting round
  → Showdown: Winning hand revealed, pot awarded, chip stacks updated
  → Next hand auto-starts (positions rotate) OR User clicks "结束会话"
  → Session summary screen (hands played, net profit/loss)
  → Return to Landing Page
```

**Decision Points:**
- Each betting round: user must choose from available actions within context
- Raise amount: continuous slider from min-raise to all-in
- End session: available between any two hands

### Flow 2: Hand History Review (review-flow)
**Covers: F-005, F-007**

```
Landing Page → Click "历史记录"
  → Session List (sorted by date, showing hand count & P/L)
  → Select a session → Hand List within session
  → Select a hand → Hand Replay View
    → Street-by-street stepper (Preflop → Flop → Turn → River → Showdown)
    → At each user decision point:
      - "你的操作" badge (what user did)
      - "GTO 建议" badge (what GTO recommends)
      - Deviation indicator (符合 / 轻微偏差 / 严重偏差) with color coding
      - EV loss estimate (if deviation exists)
    → Navigation: Previous Street / Next Street / Previous Hand / Next Hand
  → Back to Hand List → Back to Session List
```

### Flow 3: Statistics Dashboard (stats-flow)
**Covers: F-008**

```
Landing Page → Click "统计数据"
  → Stats Dashboard loads with:
    - Summary cards: Total hands, Total P/L, Overall GTO conformance %
    - GTO conformance trend line chart (over sessions)
    - Position breakdown bar chart (UTG/HJ/CO/BTN/SB/BB conformance)
    - Street breakdown (Preflop/Flop/Turn/River conformance)
    - Top deviation types ranked list
  → Click on a session data point → jumps to that session's review (Flow 2)
  → Filter controls: date range, session selector
```

### Flow 4: GTO Reference Lookup (reference-flow)
**Covers: F-002**

```
Landing Page → Click "GTO 参考表"
  → Tab: Preflop Charts
    → Select position (UTG/HJ/CO/BTN/SB/BB)
    → Select scenario (Open Raise / vs 3-Bet / etc.)
    → 13×13 hand matrix displayed with color-coded actions (Raise/Call/Fold)
  → Tab: Postflop Guide
    → Select board texture category (高牌/低牌, 同花/彩虹, 连接/断裂)
    → Select hand strength tier (坚果/强牌/中等/弱牌/空气)
    → Recommended action displayed with sizing
  → ⚠️ "简化 GTO 参考" disclaimer banner always visible
```

---

## Interaction Rules

### Form & Input Patterns
- **Raise Slider**: Continuous slider from min-raise to all-in; displays BB amount and pot percentage in real-time; snap points at common sizings (2.5BB, 3BB, pot, half-pot)
- **Action Buttons**: Only show legally available actions (e.g., no "Check" when facing a bet); primary action highlighted; disabled states for unavailable actions
- **Confirmation**: All-in requires a confirmation tap/click to prevent misclicks; Fold when check is available shows a brief "你可以 Check" tooltip

### Loading States
- **Initial Load**: Skeleton table layout while GTO lookup tables load (~1MB); progress indicator for IndexedDB initialization
- **Between Hands**: Brief card-dealing animation (< 1s) as transition; no blocking loader
- **Review Page**: Skeleton cards while hand history loads from IndexedDB
- **Stats Page**: Skeleton charts while aggregating data; progressive rendering (summary cards first, then charts)

### Error Display Patterns
- **IndexedDB Unavailable**: Full-page notice with explanation — "请使用支持 IndexedDB 的浏览器"; no game start allowed
- **Data Corruption**: Toast notification — "部分历史数据无法读取"; graceful degradation, skip corrupted records
- **GTO Table Load Failure**: Retry button with message — "GTO 策略表加载失败，请刷新页面"

### Animation & Transitions
- **Card Deal**: Cards slide from deck position to player positions (staggered, 80ms per card)
- **Community Cards**: Flip animation for each street reveal
- **Chip Movement**: Chips animate from player to pot on bet; pot slides to winner on showdown
- **Action Highlight**: Active player seat pulses gently; action timer bar depletes
- **Page Transitions**: Slide transitions between main views (table, review, stats)

### Responsive & Layout Rules
- **Desktop-first**: Optimized for 1280px+ viewport
- **Minimum Width**: 1024px; below this, horizontal scroll allowed
- **Table Layout**: Oval table centered; 6 seats distributed evenly (BTN at bottom-center, positions clockwise)
- **Review Stepper**: Horizontal stepper for streets; vertical timeline for actions within a street

### Data Persistence Rules
- **Auto-save**: Every completed hand auto-saves to IndexedDB immediately
- **Session State**: Active session state saved on every action (crash recovery)
- **No Explicit Save Button**: All persistence is automatic and invisible to user

### GTO Comparison Display Rules
- **Color Coding**: 符合 GTO = green ✓; 轻微偏差 = yellow ⚠; 严重偏差 = red ✗
- **Deviation Threshold**: Action matches = 符合; same category but different sizing = 轻微偏差; completely different action = 严重偏差
- **EV Loss Display**: Show as BB amount (e.g., "-1.5 BB EV"); only for deviations, not for conforming plays
- **Simplified GTO Disclaimer**: Persistent subtle banner on all GTO-related views — "基于简化 GTO 模型，仅供参考"

### Navigation Rules
- **During Active Hand**: Navigation to review/stats blocked; must complete or fold current hand
- **Between Hands**: Free navigation; session state preserved in IndexedDB
- **Back Navigation**: Browser back button supported via URL hash routing

---

## Component Inventory

### Layout Components
- **AppShell**: Top-level layout with navigation header and main content area; handles route switching between table, review, stats, and reference views
- **NavHeader**: Top navigation bar with app logo "GTO Idiot", nav links (牌桌 / 历史记录 / 统计数据 / GTO 参考表), active session indicator badge
- **LandingPage**: Entry screen with primary CTA "开始新会话", recent session list preview, and quick stats summary

### Table UI Components (F-004)
- **PokerTable**: Central oval table component; positions 6 seats, renders community cards area and pot display
- **PlayerSeat**: Individual seat showing: avatar/position label (UTG/HJ/CO/BTN/SB/BB), chip count, current bet, card backs (or face-up for user/showdown), active/folded/all-in state styling, dealer button indicator
- **CommunityCards**: Displays 0-5 community cards with flip animation; centered on table
- **PotDisplay**: Shows current main pot and any side pots; updates on each action with animation
- **ActionPanel**: Bottom-anchored panel for user actions; contains Fold/Check/Call/Bet/Raise buttons + raise slider; only renders available actions; shows pot odds helper text
- **RaiseSlider**: Custom slider component with min/max labels, BB display, pot-percentage display, and snap points for common sizings (half-pot, pot, 2x pot)
- **DealerButton**: Small "D" chip indicator that rotates between seats each hand
- **HandStrengthIndicator**: Subtle indicator showing user's current hand rank (e.g., "一对 K" / "顺子") below user's cards
- **BetChips**: Visual chip stack representation for bets placed in front of each seat
- **CardComponent**: Single playing card with suit/rank display; supports face-up, face-down, and flip-reveal states

### Session Management Components (F-006)
- **SessionControls**: "结束会话" button visible during play; "开始新会话" on landing page
- **SessionList**: Sortable list of past sessions showing: date/time, number of hands, net P/L in BB, GTO conformance %
- **SessionSummary**: End-of-session modal/screen with: hands played, net BB won/lost, highlight moments, GTO conformance score, link to review

### Hand History & Review Components (F-005, F-007)
- **HandList**: Scrollable list of hands within a session; each row shows hand #, position, hole cards (mini), result (+/- BB), quick GTO badge
- **HandReplayView**: Full replay interface for a single hand; contains street stepper and action timeline
- **StreetStepper**: Horizontal step indicator (Preflop → Flop → Turn → River → Showdown); click to jump between streets
- **ActionTimeline**: Vertical list of actions within the current street; each action shows: player name/position, action type & amount, and for user actions: GTO comparison badges
- **GTOComparisonBadge**: Inline badge showing user action vs GTO suggestion; color-coded by deviation severity (green/yellow/red)
- **DeviationDetail**: Expandable panel on each user decision point showing: "你的操作", "GTO 建议", deviation level, EV loss estimate, brief explanation
- **ReplayControls**: Previous/Next street, Previous/Next hand, auto-play toggle, speed control
- **MiniTable**: Compact table view within replay showing board state, pot size, and remaining players at each point

### Statistics Components (F-008)
- **StatsDashboard**: Container layout for all stats panels; manages date range and session filters
- **SummaryCards**: Row of metric cards: 总手数, 总盈亏 (BB), GTO 符合度 %, sessions count
- **ConformanceTrendChart**: Line chart showing GTO conformance % over time (x-axis: sessions or date, y-axis: percentage)
- **PositionBreakdownChart**: Grouped bar chart showing GTO conformance % by position (UTG/HJ/CO/BTN/SB/BB)
- **StreetBreakdownChart**: Bar chart showing conformance % split by street (Preflop/Flop/Turn/River)
- **DeviationRankingList**: Ordered list of most common deviation types with count and description (e.g., "Preflop 冷跟注过多: 47次")
- **DateRangeFilter**: Date picker for filtering stats by time period
- **SessionFilter**: Dropdown multi-select for filtering by specific sessions

### GTO Reference Components (F-002)
- **GTOReferenceView**: Container with tab navigation between Preflop and Postflop reference
- **PreflopChart**: 13×13 hand matrix grid (rows: first card, cols: second card); cells color-coded by recommended action; tooltip with detailed frequencies
- **PositionSelector**: Dropdown or button group to select viewing position (UTG/HJ/CO/BTN/SB/BB)
- **ScenarioSelector**: Button group for selecting preflop scenario (Open / vs 3-Bet / vs Raise)
- **PostflopGuide**: Card-style layout showing recommended action for selected board texture × hand strength combination
- **BoardTextureSelector**: Button group for board texture categories (高牌面/低牌面, 同花/彩虹, 连接/断裂)
- **HandStrengthSelector**: Button group for hand strength tiers (坚果/强牌/中等/弱牌/空气)
- **GTODisclaimerBanner**: Persistent banner — "⚠ 简化 GTO 参考，非精确纳什均衡解"

### Shared / Utility Components
- **Card**: Base playing card renderer (rank + suit + styling); used across table, review, and reference views
- **ChipStack**: Visual chip stack with value label; used for pot, bets, and player stacks
- **Toast**: Transient notification component for errors and status messages
- **SkeletonLoader**: Placeholder shimmer component for loading states (table skeleton, chart skeleton, list skeleton)
- **Modal**: Reusable modal dialog for confirmations (all-in confirm, end session confirm)
- **EmptyState**: Placeholder view when no data exists (no sessions yet, no hands played)
- **Badge**: Small label component for status indicators (position badges, deviation badges, action type badges)