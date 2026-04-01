## User Journeys

### Flow 1: Game Session Setup (Lobby → Table)
Step 1: User lands on Home/Lobby screen → Step 2: User clicks "Start New Session" → Step 3: System seats user at a 6-max table with 5 BOT opponents (TAG, LAG, Fish, Nit, Maniac randomly assigned with personality names) → Step 4: System assigns default buy-in (e.g., 200BB at 1/2 blinds) → Step 5: Table UI renders with all 6 seats populated, chips displayed → Step 6: First hand begins automatically

**Covers:** F-003, F-004

---

### Flow 2: Playing a Hand (Core Game Loop)
Step 1: System posts blinds and deals hole cards to all players → Step 2: Table UI shows user's hand, community cards area (empty preflop), pot size, and action indicator highlighting current actor → Step 3: When it's user's turn, legal actions are enabled (Fold/Check/Call/Bet/Raise/All-in based on game state) → Step 4: User selects action via button; for Bet/Raise, a slider + numeric input appears with min/max constraints → Step 5: User confirms action (confirmation tap/click) → Step 6: BOTs act in turn with style-appropriate decisions (brief animation delay) → Step 7: Repeat Steps 2-6 through Flop, Turn, River streets → Step 8: At showdown or last-player-standing, pot is awarded; side pots resolved if applicable → Step 9: Hand result displayed briefly → Step 10: Hand data auto-saved to IndexedDB → Step 11: Next hand begins automatically after short delay

**Covers:** F-001, F-002, F-003, F-004, F-007

---

### Flow 3: Preflop GTO Reference (During or Post-Hand)
Step 1: During preflop decision point, system internally looks up the 169-class × position × action-sequence strategy table → Step 2: GTO recommendation is stored with hand record for later review → Step 3: (In review mode) User sees the GTO-recommended frequencies for each preflop action at that decision node

**Covers:** F-005

---

### Flow 4: Postflop GTO Solving
Step 1: At a postflop decision point, system checks precomputed scenario cache → Step 2a: If scenario is cached (~70-80% coverage), retrieve solution instantly → Step 2b: If not cached, invoke DCFR WASM solver (simplified: 10 buckets × 3-4 bet sizes) → Step 3: If multi-way pot, system degrades to pseudo-heads-up model → Step 4: If degraded or simplified, precision disclaimer flag is attached to this decision point → Step 5: Solution (action frequencies + EV estimates) stored with hand record for review

**Covers:** F-006, F-010

---

### Flow 5: Hand History Browsing
Step 1: User navigates to "Hand History" from main menu or post-session → Step 2: System loads hand records from IndexedDB → Step 3: List view shows hands sorted by time (newest first) with summary info (hand #, result +/- chips, hole cards) → Step 4: User can filter by time range and/or result (won/lost/folded) → Step 5: User taps a hand to enter Hand Review (Flow 6)

**Covers:** F-007

---

### Flow 6: Hand Review / Replay
Step 1: User selects a hand from history → Step 2: Replay view shows the table state at the first decision point → Step 3: At each user decision point, a split panel displays: LEFT = "Your Action" (what user actually did), RIGHT = "GTO Recommendation" (action frequencies for fold/check/call/bet/raise) → Step 4: Each decision is color-coded: 🟢 Match (action within GTO high-frequency), 🟡 Minor Deviation, 🔴 Major Deviation → Step 5: Estimated EV loss is shown for deviations → Step 6: If precision disclaimer applies to this node, a subtle banner reads "Simplified calculation — for reference only" → Step 7: User navigates forward/backward through decision points with arrow controls → Step 8: At end of hand, summary shows total EV lost and deviation count

**Covers:** F-008, F-010

---

### Flow 7: Session Summary
Step 1: User clicks "End Session" or session auto-summarizes on navigation away → Step 2: Session Summary screen renders → Step 3: Profit/Loss curve chart (hands on X-axis, cumulative BB won/lost on Y-axis) → Step 4: Key stats displayed: total hands, win rate (BB/100), showdown %, fold-to-cbet %, voluntarily-put-in-pot % → Step 5: GTO Conformance Score (0-100) prominently displayed with color indicator (red < 40, yellow 40-70, green > 70) → Step 6: "Review Worst Hands" shortcut links to the hands with largest GTO deviations → Step 7: "Play Again" and "View Hand History" buttons available → Step 8: Disclaimer footer: "For learning purposes only"

**Covers:** F-009, F-010

---

## Interaction Rules

### Form Validation & Input
- **Bet/Raise Slider**: Continuous slider from minimum legal bet to player's remaining stack; numeric input box synced bidirectionally with slider; invalid values (below min-raise, above stack) are clamped automatically with brief shake animation
- **Action Confirmation**: Single-click on action button executes immediately for Fold/Check/Call; Bet/Raise requires amount selection then confirm button press; no double-confirmation dialogs to maintain game flow speed
- **All-in**: Dedicated button appears only when relevant; triggers a distinct confirmation style (button turns red, requires hold-press 300ms) to prevent accidental all-ins

### Error Display Patterns
- **Invalid Action Attempt**: If user somehow triggers an illegal action, inline toast appears above action bar: "Invalid action — minimum raise is X" (auto-dismiss 3s)
- **Solver Timeout**: If WASM solver exceeds 5s, fallback to best available approximation with precision disclaimer badge
- **IndexedDB Failure**: Non-blocking warning toast "Hand history save failed" — game continues uninterrupted
- **Empty State**: Hand history with no records shows illustration + "Play your first hand to see history here"

### Loading States
- **Table Initialization**: Skeleton loader showing table outline with pulsing seat placeholders (< 1s expected)
- **BOT Thinking**: Animated thinking indicator (ellipsis bubble) above acting BOT's seat; 0.5-2s artificial delay for realism
- **WASM Solver Loading**: First-time WASM module load shows progress bar in splash; subsequent solves show subtle spinner on GTO panel only
- **Hand History Load**: Skeleton list items while IndexedDB query resolves
- **Session Summary Calculation**: Brief calculation spinner before charts render

### Navigation & State
- **Mid-Hand Navigation Prevention**: If user tries to leave table mid-hand, confirmation modal: "Hand in progress. Fold and leave?" with Cancel/Fold & Leave options
- **Session Persistence**: Active session state survives browser refresh via IndexedDB checkpoint; on return, offer "Resume Session" or "Start New"
- **Back Navigation**: Browser back from table → confirms exit; back from review → returns to history list

### Precision Disclaimer Display
- **Inline Badge**: Small "≈ Approximate" pill badge next to GTO recommendations that used simplified solving
- **Tooltip on Badge**: Hover/tap reveals: "This scenario used simplified calculation (pseudo-heads-up model / reduced bet sizing). Results are approximate."
- **Session-Level Note**: Footer on all GTO-related screens: "GTO Idiot — For learning purposes only"

### Responsive Behavior
- **Desktop Only**: Minimum supported width 1024px; below that, display message "GTO Idiot is optimized for desktop browsers"
- **No Mobile**: Touch interactions not optimized; pointer-based interactions only

---

## Component Inventory

- **LobbyScreen**: Landing page with session start button, quick stats from last session, and navigation to hand history
- **PokerTable**: Main game canvas component; renders oval table, community card area, pot display, and 6 seat positions in standard 6-max layout
- **PlayerSeat**: Individual seat component showing avatar/name, chip count, hole cards (face-up for user, face-down for BOTs until showdown), dealer button, blind indicators, and current-bet chips; highlights when it's that player's turn
- **CommunityCards**: Horizontal card display area for flop (3), turn (1), river (1) with deal animation
- **PotDisplay**: Central pot amount indicator; splits into main pot + side pots when applicable
- **ActionBar**: Bottom-anchored action panel with context-sensitive buttons (Fold/Check/Call/Bet/Raise/All-in); only legal actions are enabled
- **BetSlider**: Slider + numeric input combo for sizing bets/raises; includes preset buttons (1/3 pot, 1/2 pot, 2/3 pot, pot, all-in)
- **PlayingCard**: Single card component with suit/rank rendering; supports face-up, face-down, and highlight states
- **DealerButton**: Small circular "D" indicator positioned at the current dealer seat
- **BotThinkingIndicator**: Animated ellipsis bubble shown above a BOT seat while it's "thinking"
- **HandResultOverlay**: Brief overlay after hand completion showing winner(s), pot won, and hand strength
- **HandHistoryList**: Scrollable list of past hands with summary rows; supports time and result filtering
- **HandHistoryFilter**: Filter controls for hand history — date range picker and result type toggles (won/lost/folded)
- **HandHistoryRow**: Single row in history list showing hand number, hole cards mini-display, result (+/- chips), and timestamp
- **HandReplayViewer**: Full replay interface with table state visualization at each decision point; step-forward/back controls
- **GtoComparisonPanel**: Side-by-side panel showing "Your Action" vs "GTO Recommendation" with frequency bars for each possible action
- **DeviationBadge**: Color-coded badge (green/yellow/red) indicating match, minor deviation, or major deviation from GTO
- **EvLossIndicator**: Numeric display of estimated EV loss in BB at a specific decision point
- **PrecisionDisclaimer**: Inline pill badge + tooltip indicating simplified/approximate GTO calculation
- **SessionSummaryScreen**: Post-session dashboard with profit curve, stats grid, and GTO conformance score
- **ProfitCurveChart**: Line chart (hands vs cumulative profit in BB) using lightweight charting lib
- **GtoScoreGauge**: Circular or bar gauge displaying 0-100 GTO conformance score with color coding
- **StatsGrid**: Grid of key session statistics (total hands, win rate, showdown %, fold %)
- **ConfirmationModal**: Reusable modal for mid-hand exit confirmation and similar confirm/cancel dialogs
- **Toast**: Auto-dismissing notification component for errors and warnings (appears top-center)
- **SkeletonLoader**: Generic skeleton/placeholder component for loading states (table, list items, charts)
- **AppHeader**: Top navigation bar with session controls, navigation to lobby/history, and "learning purposes" label
- **DesktopOnlyGuard**: Viewport check component that shows "desktop only" message below 1024px width
- **GlobalDisclaimerFooter**: Persistent footer on GTO screens: "For learning purposes only"