# UX Flows — GTO Idiot

## Interaction Patterns

| Pattern | Implementation |
|---------|---------------|
| Form validation | Real-time per-field on blur + full validation on submit |
| Error display | Inline below field (forms) / toast (actions) / full-screen (fatal) |
| Loading — game init | Skeleton table with pulsing seats, then card deal animation |
| Loading — buttons | Spinner inside button, button disabled |
| Loading — data | Skeleton rows for hand history list |
| Empty state | Illustration + descriptive text + primary action button |
| Navigation (desktop) | Top nav bar with tabs: Play / History / Range Charts / Stats |
| Navigation (mobile) | Bottom tab bar: Play / History / Charts / Stats |
| Destructive actions | Confirmation dialog before execution (e.g., clear history) |
| BOT thinking | Pulsing avatar + "Thinking..." label with 0.5–2s simulated delay |
| Card animations | Slide-in for dealing, flip for reveal, fade for muck |

---

## User Journeys

### Flow: Onboarding (covers F-013)

**Happy Path:**
1. User opens the app URL for the first time (no localStorage data detected)
2. User sees a full-screen **TutorialOverlay** with a friendly illustration of a poker table and the headline "Welcome to GTO Idiot!"
3. Step 1/4: "What is GTO?" — User reads a plain-language explanation: "GTO (Game Theory Optimal) is a mathematically balanced poker strategy that can't be exploited. Think of it as the 'perfect' way to play." User clicks "Next →"
4. Step 2/4: "How to Play" — User sees an annotated screenshot of the table UI showing: hole cards, community cards, action buttons, chip stack, pot. User clicks "Next →"
5. Step 3/4: "How to Review" — User sees an explanation of post-hand review: "After each hand, review your decisions against GTO. We'll show you what the 'perfect' play would have been." User clicks "Next →"
6. Step 4/4: "Ready to Start!" — User sees a recommendation: "We suggest starting with Fish bots to learn the basics." with a "Start Playing" CTA button
7. User clicks "Start Playing" → System closes the overlay, sets `tutorial_completed = true` in localStorage, and navigates to the **GameSetupScreen** with Fish difficulty pre-selected
8. Outcome: User lands on game setup ready to configure and start their first session

**Error States:**
- localStorage unavailable (private browsing) → User sees **ErrorBanner**: "Your browser's storage is unavailable. Hand history and progress won't be saved. You can still play!" with a "Continue Anyway" button
- Tutorial assets fail to load → User sees simplified text-only tutorial without illustrations; functionality unaffected

**Empty State:**
- N/A — this flow only triggers when there IS no data

**Loading State:**
- App initial load → **AppShell** skeleton: top nav placeholder + centered spinner with "Shuffling the deck..." text (< 2s)

---

### Flow: Game Setup (covers F-003, F-014)

**Happy Path:**
1. User sees the **GameSetupScreen** with a visual mini-table preview at top and configuration panels below
2. User sees the **BotDifficultyPanel** with 5 bot seats displayed. Each seat shows a dropdown with options: Fish 🐟, Regular 🃏, GTO 🤖. A "Set All" dropdown at the top applies one difficulty to all 5 bots
3. User selects difficulty for each bot (or uses "Set All") → Each seat's avatar updates to reflect the selected difficulty tier (distinct avatar style per tier)
4. User sees the **GameSettingsPanel** with three controls:
   - **Blind Level** selector: radio buttons for 1/2, 2/5, 5/10 (default: 1/2)
   - **Starting Stack** selector: radio buttons for 100BB, 200BB (default: 100BB)
   - **Game Speed** selector: radio buttons for Slow, Normal, Fast (default: Normal) with tooltip explaining BOT action delay times
5. User adjusts settings as desired → Mini-table preview updates chip counts to reflect selected stack size
6. User clicks the **StartGameButton** "Deal Me In!" → System initializes the game engine with selected configuration
7. Outcome: User transitions to the **PokerTableScreen** with a dealing animation

**Error States:**
- Invalid configuration (should not occur with constrained UI, but defensive) → **StartGameButton** stays disabled with inline hint: "Please select a difficulty for all bots"

**Empty State:**
- First visit after tutorial → All defaults pre-selected (Fish for all bots, 1/2 blinds, 100BB, Normal speed); user can start immediately

**Loading State:**
- Game initialization after clicking "Deal Me In!" → **StartGameButton** shows spinner inside, disabled. Table transition begins within 500ms

---

### Flow: Gameplay (covers F-001, F-002, F-004, F-005)

**Happy Path:**
1. User sees the **PokerTableScreen**: an oval table layout with 6 seats arranged around it. The user occupies one seat (bottom center). The **DealerButton** is at one position, and position labels (UTG/MP/CO/BTN/SB/BB) are shown at each seat
2. A new hand begins: **DealerButton** is at the correct position, SB and BB post blinds automatically. Chip amounts animate from player stacks to the pot area. The **PotDisplay** at center shows the current pot total
3. Cards are dealt with a slide-in animation: user sees 2 **HoleCard** components face-up in their seat area. Each BOT seat shows 2 face-down **HoleCard** components. A "Hand #N" indicator appears
4. Preflop betting round begins. The **TurnIndicator** (glowing border) highlights the first-to-act player (UTG)
5. If a BOT is acting: their avatar shows a pulsing **ThinkingIndicator** for 0.5–2s (based on game speed setting), then their action appears as a **ActionChip** label (e.g., "Fold", "Raise 6") and chips animate accordingly
6. When it's the user's turn: the **ActionPanel** slides up from below the table showing only legal actions:
   - **FoldButton** — always available
   - **CheckButton** — only when no bet to call
   - **CallButton** — shows exact amount (e.g., "Call 4") when there's a bet
   - **RaiseButton** — opens the **RaiseSlider** showing min-raise to all-in range with a numeric input field. The selected amount updates in real-time
   - **AllInButton** — always available, shows exact all-in amount
7. User selects an action (e.g., taps "Call 4") → The **ActionPanel** disables momentarily, chip animation plays, **PotDisplay** updates, play continues to next player
8. When all preflop actions complete → 3 community cards animate face-up onto the **CommunityCardArea** (flop). Betting continues
9. Turn card (1 card) animates onto the board → Betting continues
10. River card (1 card) animates onto the board → Final betting round
11. **Showdown scenario**: All remaining players' hole cards flip face-up with animation. The **HandRankLabel** appears under each player (e.g., "Two Pair, Aces and Kings"). The winning hand highlights with a glow. Chips animate from pot to winner's stack. The **HandResultBanner** shows "+24 chips" or "-12 chips" for the user
12. **All-fold scenario**: When the last opponent folds, the remaining player wins. Pot animates to winner. No cards are revealed
13. **Side pot scenario**: When players are all-in with unequal stacks, **SidePotDisplay** components show each pot and eligible players. At showdown, each pot is awarded separately with individual animations
14. Hand history is automatically serialized and saved to localStorage (invisible to user — no UI indication needed for the save itself)
15. After a 2-second pause showing the result, the next hand begins automatically: dealer button rotates clockwise, position labels update, new blinds post
16. Outcome: Continuous gameplay loop until user navigates away or runs out of chips

**Error States:**
- User's chip stack reaches 0 → **BustedOverlay** appears: "You're out of chips!" with options: "Rebuy (Reset Stack)" or "End Session → Review"
- localStorage full when saving hand → **Toast** notification: "Storage full — oldest hands will be removed to save new ones." System auto-prunes oldest 10% of hands
- Browser tab becomes inactive during BOT turn → Game pauses, resumes when tab is active. **Toast**: "Welcome back! Resuming your hand..."

**Empty State:**
- N/A — gameplay always has active state once started

**Loading State:**
- Between hands → Brief card-shuffling animation (0.5s) as visual break
- BOT decision → **ThinkingIndicator** pulsing dot animation on acting BOT's avatar

---

### Flow: Session Stats (covers F-006, F-010, F-011)

**Happy Path:**
1. User taps the "Stats" tab in the navigation → **SessionStatsScreen** loads
2. User sees two sections: **CurrentSessionCard** (if a session is active) and **OverallStatsCard**
3. **CurrentSessionCard** shows:
   - Hands played this session (e.g., "47 hands")
   - Session profit/loss with color coding (green for profit, red for loss, e.g., "+142 chips")
   - VPIP% with a bar indicator and label (e.g., "VPIP: 28%")
   - PFR% with a bar indicator and label (e.g., "PFR: 19%")
   - Win rate (e.g., "Win Rate: 58%")
   - Session GTO Deviation Score (0–100 gauge, e.g., "GTO Score: 64/100")
4. **OverallStatsCard** shows:
   - Total hands played across all sessions
   - Overall profit/loss
   - Average GTO deviation score
   - **DeviationTrendChart** — a line chart showing GTO deviation score per session over time (x-axis: session date, y-axis: score 0–100)
5. User scrolls to view the **DeviationTrendChart** → they can see their improvement trajectory
6. Outcome: User understands their current performance and progress over time

**Difficulty Progression Hint (F-011):**
- At session end (user clicks "End Session" from gameplay), a **SessionSummaryOverlay** appears showing session stats
- IF user's average GTO deviation score exceeds threshold for current difficulty (e.g., >70 vs Fish, >80 vs Regular), THEN a **ProgressionHintBanner** appears: "Your GTO score is consistently above 70 against Fish bots — try Regular bots for a bigger challenge! 🎯"
- IF user is already playing vs GTO bots with high score → No hint shown
- User can dismiss the hint or click "Try Harder Bots →" which navigates to **GameSetupScreen** with the next difficulty pre-selected

**Error States:**
- No session data available → Handled by empty state
- Stats calculation error → **Toast**: "Couldn't calculate some stats. Try refreshing."

**Empty State:**
- No sessions played yet → **EmptyStatsIllustration** (cards flying) + "No stats yet — play your first hand to start tracking!" + "Start Playing" CTA button

**Loading State:**
- Stats screen opening → **Skeleton** placeholders for each stat card (pulsing rectangles), loads within 200ms from localStorage

---

### Flow: Hand History Browsing (covers F-005, F-012)

**Happy Path:**
1. User taps the "History" tab in the navigation → **HandHistoryScreen** loads
2. User sees a **HistorySummaryBar** at top: total hands played, overall win rate, total profit/loss
3. Below, a **HandHistoryList** shows all saved hands in reverse chronological order. Each **HandHistoryCard** shows:
   - Hand number and date/time
   - Hero's hole cards (mini card icons)
   - Result: "Won" (green) or "Lost" (red) with profit/loss amount
   - Final board (mini community cards)
   - GTO deviation score badge (color-coded: green >80, yellow 50–80, red <50)
4. User scrolls through the list → Infinite scroll loads more hands in batches of 20
5. User taps a **HandHistoryCard** → Navigates to the **HandReviewScreen** for that hand (see Hand Review flow)
6. Outcome: User can browse all their played hands and select any for detailed review

**Export (F-012):**
7. User taps the **ExportButton** (download icon) in the top bar → System serializes all hand history to JSON → Browser triggers a file download: `gto-idiot-history-YYYY-MM-DD.json`
8. User receives the file on their device

**Import (F-012):**
9. User taps the **ImportButton** (upload icon) in the top bar → **FilePickerDialog** opens for JSON file selection
10. User selects a previously exported JSON file → System validates the file structure
11. System merges imported data into existing localStorage history (deduplicates by hand ID) → **Toast**: "Imported 234 hands successfully! (12 duplicates skipped)"
12. **HandHistoryList** refreshes to show merged data

**Error States:**
- Import file is invalid/corrupt → **Toast** (error): "Invalid file format. Please select a GTO Idiot export file."
- Import file is too large for localStorage → **Toast** (error): "Not enough storage space. Try clearing old hands first."
- localStorage read error → **ErrorScreen**: "Couldn't load hand history. Your browser storage may be corrupted." + "Clear & Reset" button

**Empty State:**
- No hands recorded yet → **EmptyHistoryIllustration** (empty card table) + "No hands played yet. Start a game to build your history!" + "Play Now" CTA button

**Loading State:**
- Hand history list loading → **Skeleton** cards (3–5 pulsing placeholder cards) while reading from localStorage

---

### Flow: Hand Review & GTO Comparison (covers F-007, F-008, F-009, F-010)

**Happy Path:**
1. User selects a hand from history (or taps "Review Last Hand" after a session) → **HandReviewScreen** loads
2. User sees a **ReviewTableView** showing the table state at the first decision point (preflop, first to act). The board is empty, pot shows blinds only, and all players' positions and stack sizes are displayed. Hero's hole cards are visible
3. Below the table, a **DecisionTimeline** shows all decision points as dots on a horizontal track. The current point is highlighted. Streets are labeled (Preflop | Flop | Turn | River | Showdown)
4. On the right side (desktop) or below (mobile), the **GTOComparisonPanel** shows for the current decision point:
   - **"Your Action"** section: the action the user took (e.g., "Raise to 6")
   - **"GTO Recommendation"** section: the GTO-optimal action(s) with frequencies (e.g., "Raise 75%, Call 20%, Fold 5%") displayed as a horizontal stacked bar
   - **"EV Difference"** badge: the EV delta in BB (e.g., "+0.5 BB" in green, or "-1.2 BB" in red)
   - For preflop: label "Based on GTO preflop ranges for [Position]"
   - For postflop: label "Simplified GTO Approximation" with an info tooltip explaining the approximation
5. User clicks **"Next Decision →"** button → The **ReviewTableView** advances: new community cards appear if crossing a street boundary, pot updates, all player actions for skipped points are shown briefly, and the **GTOComparisonPanel** updates for the new decision point
6. User clicks **"← Previous Decision"** button → View reverts to the prior decision point
7. User can also tap any dot on the **DecisionTimeline** to jump directly to that decision point
8. At a preflop decision point, user sees a **"View Range Chart"** link → Tapping it opens the **RangeChartModal** pre-filtered to the user's position at that point (see Range Chart flow, F-009)
9. At any point, all player actions are visible in the **ActionLog** panel: a chronological list showing "UTG: Fold", "MP: Call 4", "Hero: Raise to 12", etc.
10. After stepping through all decision points (or pressing "Summary"), the **HandSummaryCard** appears:
    - Total EV lost/gained vs GTO across all decisions (e.g., "Net: -2.3 BB vs GTO")
    - GTO Deviation Score for this hand (0–100)
    - Worst decision highlighted with a link to jump back to it
    - Verdict text (e.g., "Solid hand! Your preflop play was on point, but the river call was too loose.")
11. Outcome: User understands each decision's quality relative to GTO and has a clear improvement takeaway

**Error States:**
- Hand data is corrupted or incomplete in localStorage → **ErrorScreen**: "This hand's data appears corrupted and can't be reviewed." + "Back to History" button
- GTO data unavailable for an unusual board state → **GTOComparisonPanel** shows: "GTO approximation unavailable for this spot" with the user's action still displayed

**Empty State:**
- N/A — user always enters from a selected hand

**Loading State:**
- Review screen initial load → **ReviewTableView** skeleton (table outline + placeholder cards) + spinner in **GTOComparisonPanel**, resolves within 300ms

---

### Flow: Preflop Range Chart Reference (covers F-009)

**Happy Path:**
1. User taps "Charts" tab in navigation → **RangeChartScreen** loads
2. User sees a **PositionSelector** — 6 buttons for UTG, MP, CO, BTN, SB, BB. Default: UTG selected
3. Below, the **RangeGrid** displays a 13x13 grid of all 169 starting hand combinations. Rows = first card rank (A down to 2), Columns = second card rank (A down to 2). Diagonal = pocket pairs. Above diagonal = suited. Below diagonal = offsuit
4. Each cell is color-coded by recommended action:
   - **Raise**: bold color (e.g., green)
   - **Call**: medium color (e.g., blue)
   - **Fold**: muted color (e.g., gray)
   - Mixed actions show a split/gradient proportional to frequencies
5. User taps a different position (e.g., "BTN") → **RangeGrid** updates with new color coding. A **RangeSummary** label shows "Open-raise: 42% of hands" for the selected position
6. User hovers (desktop) or long-presses (mobile) a hand combination cell (e.g., "AJs") → A **HandTooltip** appears showing:
   - Hand name: "Ace-Jack suited"
   - Action frequencies: "Raise 85%, Call 10%, Fold 5%"
   - Contextual note for the position
7. User can toggle between views: "Opening Ranges" (RFI — raise first in) and "Vs Raise" (facing a single raise) using the **RangeViewToggle**
8. Outcome: User has a clear reference for GTO preflop strategy by position

**Accessed from Hand Review (F-009 + F-008):**
- When opened from the review screen, the **RangeChartModal** appears as an overlay (not full navigation)
- The position is pre-selected to match the user's position in the reviewed hand
- The user's actual hand combination is highlighted with a border/marker on the grid
- User can close the modal to return to the review

**Error States:**
- Range data fails to load (bundled JSON corrupt) → **ErrorScreen**: "Range data couldn't be loaded. Try refreshing the page."

**Empty State:**
- N/A — range data is always bundled with the app

**Loading State:**
- Range grid rendering → **Skeleton** 13x13 grid placeholder (gray cells) for < 200ms

---

## Component Inventory

### Layout & Navigation
| Component | Description |
|-----------|-------------|
| **AppShell** | Root layout with top nav (desktop) or bottom tab bar (mobile) |
| **TopNavBar** | Desktop navigation: logo + tabs (Play, History, Charts, Stats) |
| **BottomTabBar** | Mobile navigation: 4 icon+label tabs |
| **TabItem** | Individual navigation tab with icon and label |

### Onboarding
| Component | Description |
|-----------|-------------|
| **TutorialOverlay** | Full-screen modal with step-by-step onboarding content |
| **TutorialStep** | Individual tutorial page with illustration + text + next button |
| **SkipButton** | "Skip Tutorial" link at top-right of tutorial overlay |

### Game Setup
| Component | Description |
|-----------|-------------|
| **GameSetupScreen** | Full setup page with bot config + game settings + start button |
| **BotDifficultyPanel** | Panel showing 5 bot seats with difficulty selectors |
| **BotSeatConfig** | Individual bot seat with avatar + difficulty dropdown |
| **DifficultyDropdown** | Dropdown selector: Fish / Regular / GTO |
| **SetAllDropdown** | "Set All Bots" bulk difficulty selector |
| **GameSettingsPanel** | Panel with blind level, stack size, speed controls |
| **BlindLevelSelector** | Radio group: 1/2, 2/5, 5/10 |
| **StackSizeSelector** | Radio group: 100BB, 200BB |
| **GameSpeedSelector** | Radio group: Slow, Normal, Fast |
| **StartGameButton** | Primary CTA: "Deal Me In!" with loading spinner state |
| **MiniTablePreview** | Small visual preview of table reflecting current settings |

### Poker Table
| Component | Description |
|-----------|-------------|
| **PokerTableScreen** | Main gameplay screen with table + action panel |
| **TableLayout** | Oval table with 6 positioned seats |
| **PlayerSeat** | Individual seat showing avatar, name, chip count, position label, cards |
| **HeroSeat** | User's seat variant with face-up hole cards |
| **BotSeat** | BOT seat variant with face-down cards and difficulty tier avatar |
| **HoleCard** | Playing card component (face-up or face-down) with suit/rank |
| **CommunityCardArea** | Center area showing flop/turn/river cards |
| **PotDisplay** | Central pot total with chip icon |
| **SidePotDisplay** | Side pot indicator with amount and eligible players |
| **DealerButton** | "D" button at the current dealer position |
| **PositionLabel** | Text label: UTG/MP/CO/BTN/SB/BB |
| **TurnIndicator** | Glowing border/highlight on the currently-acting player |
| **ThinkingIndicator** | Pulsing dots animation on BOT avatar when deciding |
| **ActionChip** | Floating label showing a player's last action (e.g., "Raise 12") |
| **HandRankLabel** | Text label at showdown showing hand rank (e.g., "Two Pair") |
| **HandResultBanner** | Overlay banner showing hand result: "+24 chips" / "-12 chips" |
| **BustedOverlay** | Full-screen overlay when user runs out of chips |
| **HandNumberBadge** | Small indicator showing current hand number |

### Action Panel
| Component | Description |
|-----------|-------------|
| **ActionPanel** | Slide-up panel with action buttons during user's turn |
| **FoldButton** | Red "Fold" action button |
| **CheckButton** | Gray "Check" action button |
| **CallButton** | Blue "Call [amount]" action button |
| **RaiseButton** | Green "Raise to [amount]" action button that opens slider |
| **AllInButton** | Orange "All-In [amount]" action button |
| **RaiseSlider** | Slider control for raise amount: min-raise to all-in |
| **RaiseAmountInput** | Numeric input field for exact raise amount |
| **PotSizeShortcuts** | Quick-bet buttons: 1/3 pot, 1/2 pot, 2/3 pot, pot |

### Session Stats
| Component | Description |
|-----------|-------------|
| **SessionStatsScreen** | Full stats page with current session + overall stats |
| **CurrentSessionCard** | Card showing live session metrics |
| **OverallStatsCard** | Card showing aggregate cross-session metrics |
| **StatItem** | Individual stat display: label + value + optional bar/gauge |
| **VPIPBar** | Horizontal bar showing VPIP percentage |
| **PFRBar** | Horizontal bar showing PFR percentage |
| **GTOScoreGauge** | Circular gauge showing GTO deviation score (0–100) |
| **DeviationTrendChart** | Line chart showing GTO scores over sessions |
| **SessionSummaryOverlay** | Modal shown at session end with summary stats |
| **ProgressionHintBanner** | Suggestion banner to try harder bots |

### Hand History
| Component | Description |
|-----------|-------------|
| **HandHistoryScreen** | Full page with history list + summary + export/import |
| **HistorySummaryBar** | Top bar: total hands, win rate, total P/L |
| **HandHistoryList** | Scrollable list of hand cards with infinite scroll |
| **HandHistoryCard** | Individual hand summary: cards, result, score badge |
| **GTOScoreBadge** | Color-coded badge showing hand's GTO deviation score |
| **ExportButton** | Download icon button to export history as JSON |
| **ImportButton** | Upload icon button to import history from JSON |
| **FilePickerDialog** | Browser file picker for JSON import |
| **EmptyHistoryIllustration** | Illustration + CTA for empty hand history state |

### Hand Review
| Component | Description |
|-----------|-------------|
| **HandReviewScreen** | Full review page with table view + comparison + timeline |
| **ReviewTableView** | Non-interactive table showing board state at a decision point |
| **DecisionTimeline** | Horizontal track of decision point dots, grouped by street |
| **TimelineDot** | Individual clickable dot on the timeline (active/inactive/hero) |
| **GTOComparisonPanel** | Side panel showing user action vs GTO recommendation |
| **YourActionDisplay** | Section showing the user's actual action |
| **GTORecommendationDisplay** | Section showing GTO-optimal actions with frequency bars |
| **FrequencyBar** | Horizontal stacked bar showing action frequency percentages |
| **EVDifferenceBadge** | Color-coded badge: "+0.5 BB" (green) or "-1.2 BB" (red) |
| **ApproximationDisclaimer** | Info label: "Simplified GTO Approximation" with tooltip |
| **ActionLog** | Chronological list of all player actions at current decision |
| **HandSummaryCard** | End-of-review summary: net EV, score, worst decision, verdict |
| **NextDecisionButton** | "Next Decision →" navigation button |
| **PrevDecisionButton** | "← Previous Decision" navigation button |
| **ViewRangeChartLink** | Link to open range chart from preflop review points |

### Range Chart
| Component | Description |
|-----------|-------------|
| **RangeChartScreen** | Full page with position selector + range grid |
| **RangeChartModal** | Modal variant of range chart (opened from hand review) |
| **PositionSelector** | 6-button group for selecting table position |
| **RangeViewToggle** | Toggle between "Opening Ranges" and "Vs Raise" views |
| **RangeGrid** | 13x13 grid of 169 hand combinations with color-coding |
| **RangeCell** | Individual cell in the grid (color-coded by action) |
| **HandTooltip** | Hover/long-press tooltip with action frequencies |
| **RangeSummary** | Text label showing range width (e.g., "Open-raise: 42%") |
| **HighlightedHandMarker** | Border/marker on grid when accessed from review |

### Shared / Common
| Component | Description |
|-----------|-------------|
| **Toast** | Floating notification for success/error/info messages |
| **ConfirmationDialog** | Modal dialog for destructive action confirmation |
| **ErrorScreen** | Full-screen error with message + recovery action |
| **ErrorBanner** | Non-blocking warning banner (e.g., localStorage unavailable) |
| **EmptyStatsIllustration** | Illustration + CTA for empty stats state |
| **Spinner** | Generic loading spinner |
| **SkeletonCard** | Pulsing placeholder for loading card content |
| **SkeletonGrid** | Pulsing placeholder for loading grid content |