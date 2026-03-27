# UX Flows — GTO Idiot

## Interaction Patterns

| Pattern | Implementation |
|---------|---------------|
| Form validation | Real-time per-field on blur + full validation on submit |
| Error display | Inline below field (config) / toast (game actions) / modal (fatal) |
| Loading — app | Splash screen with progress bar (loading strategy data) |
| Loading — buttons | Spinner inside button, button disabled |
| Empty state | Illustration + descriptive text + primary action CTA |
| Navigation | Top nav bar with: Logo, New Session, Hand History, Settings |
| Destructive actions | Confirmation dialog (end session, clear history) |
| Game actions | Large tap-friendly buttons with amount labels, disabled when not player's turn |
| Animations | Card dealing: slide-in 200ms; chip movement: ease 300ms; BOT action: fade-in label 150ms + configurable delay |

---

## User Journeys

### Flow: App Launch & Landing (covers F-009, F-003)

**Happy Path:**
1. User opens app URL → Browser loads SPA; splash screen shows "Loading GTO Idiot..." with progress bar while strategy data (F-008) and IndexedDB initialize
2. Splash completes → User sees **Landing Screen**: app logo "GTO Idiot", tagline "Practice GTO. Get Roasted.", two prominent buttons: **[Quick Start]** and **[New Session]**, and below them a **[Hand History]** link if previous sessions exist
3a. User clicks **[Quick Start]** → System randomly assigns player to a seat, assigns default BOT mix (1 TAG, 1 LAG, 1 Fish, 1 Nit, 1 Calling Station), starts session immediately with blinds 1/2 and 200-chip stacks → transitions to Game Table (F-001)
3b. User clicks **[New Session]** → transitions to Session Configuration flow

**Error States:**
- IndexedDB unavailable (private browsing) → User sees **ErrorBanner**: "Storage unavailable. Your hand history won't be saved this session. You can still play." with **[Continue Anyway]** button
- Strategy data fails to load → User sees **ErrorModal**: "Failed to load GTO strategy data. Please refresh the page." with **[Refresh]** button
- Browser incompatible (no crypto.getRandomValues) → User sees **ErrorModal**: "Your browser doesn't support secure randomization. Please use Chrome 80+, Firefox 80+, Safari 14+, or Edge 80+."

**Empty State:**
- First visit, no history → Landing screen shows Quick Start and New Session only; Hand History link is hidden

**Loading State:**
- App initialization: centered splash with logo + progress bar showing "Loading strategy data..." then "Initializing..." then done

---

### Flow: Session Configuration (covers F-003)

**Happy Path:**
1. User sees **ConfigScreen**: a visual 6-seat table layout with positions labeled (BTN, SB, BB, UTG, MP, CO). All seats show a **[Select]** button. Below the table: **[Start Session]** button (disabled until config valid)
2. User clicks a seat → That seat highlights as "You" with a player avatar; the other 5 seats each show a **BotStyleDropdown** defaulting to a balanced mix
3. User clicks a BOT seat's dropdown → Options appear: TAG ("Tight-Aggressive: Selective but fierce"), LAG ("Loose-Aggressive: Wide and wild"), Fish ("Loose-Passive: Calls everything"), Nit ("Ultra-tight: Only premiums"), Calling Station ("Passive caller: Won't fold, won't raise"). User selects a style → seat label updates
4. User repeats for other BOT seats as desired → **[Start Session]** button becomes enabled (player seated + all BOTs assigned)
5. User clicks **[Start Session]** → Session initializes: all stacks set to 200, blinds 1/2, dealer button randomly placed → transitions to Game Table

**Error States:**
- User clicks **[Start Session]** without selecting a seat → Inline error below table: "Pick your seat first"
- User clicks **[Start Session]** with a BOT seat unassigned → Inline error: "Assign a style to every BOT seat"

**Empty State:**
- N/A — configuration always has default state

**Loading State:**
- **[Start Session]** button shows spinner + "Starting..." while session initializes (~100ms, barely visible)

---

### Flow: Game Play — Hand Lifecycle (covers F-001, F-002, F-004, F-008, F-012)

**Happy Path:**
1. User sees **GameTable**: oval table with 6 seats, each showing player name/style, chip stack. Dealer button on one seat. Pot display center (currently 0). Top bar: hand #, session profit/loss, **[End Session]** button, **[Settings]** gear icon
2. Hand begins → Dealing animation: SB and BB post blinds (chip animation to pot), 2 cards slide to each player. User's cards face up with rank/suit clearly visible. BOT cards face down. Pot updates to 3
3. *If hand strength indicator enabled (F-012)*: Below user's cards, a **HandStrengthBadge** shows "Hole Cards Only" preflop with no equity display
4. Preflop betting begins from UTG → When a BOT acts: BOT seat briefly highlights, action label appears (e.g., "Fold", "Raise to 6") with a configurable delay (F-011), then game advances to next player
5. User's turn arrives → **ActionPanel** appears at bottom of screen:
   - **[Fold]** button (always available)
   - **[Check]** button (only if no bet to call) OR **[Call $X]** button (showing exact amount)
   - **[Raise]** button → expands **RaiseControls**: slider (min raise to all-in) + text input for exact amount + preset buttons (2x, 3x, Pot, All-in) + **[Confirm Raise to $Y]** button
   - **[All-In $Z]** button (showing total stack)
6. User selects action → Action animates (chips move to pot, cards fold away, etc.), pot updates, game advances
7. When preflop betting completes → 3 community cards deal to center (flop animation). *If indicator enabled*: HandStrengthBadge updates to "Top Pair, Ace Kicker" or "Flush Draw" with equity %
8. Postflop betting rounds repeat steps 4-6 for flop, turn (1 card), river (1 card)
9. Showdown → All remaining players' cards flip face up. Winning hand highlights with a **WinnerBadge** showing hand name (e.g., "Two Pair, Kings and Fives"). Pot chips animate to winner(s). Side pots awarded sequentially if applicable
10. Hand summary briefly flashes at top: "+14 chips" or "-6 chips" → 1.5s pause → next hand begins (step 2), dealer button rotates clockwise

**Error States:**
- User enters invalid raise amount (below min or above stack) → RaiseControls input border turns red, inline error: "Min raise is $X" or "Max is your stack ($Z)". **[Confirm Raise]** disabled
- User disconnects mid-hand (page refresh) → On reload, active session state lost; user returns to Landing Screen. Toast: "Previous session interrupted. Your completed hands are saved."
- Game engine error (shouldn't happen) → Toast: "Something went wrong. Hand voided." Hand is discarded, next hand dealt

**Empty State:**
- N/A — game table always has active game state during a session

**Loading State:**
- Between hands: brief dealing animation serves as natural loading indicator
- BOT thinking: pulsing "..." indicator on BOT's seat for the configurable delay duration

---

### Flow: End Session & Summary (covers F-010, F-007, F-005)

**Happy Path:**
1. User clicks **[End Session]** button on game table top bar → **ConfirmDialog**: "End this session? You've played X hands." with **[End Session]** and **[Keep Playing]** buttons
2. User confirms → Session ends, transitions to **SessionSummaryScreen**:
   - Header: "Session Complete"
   - Stats row: Hands played | Net P/L (colored green/red) | BB/100 win rate | VPIP% | PFR%
   - **GTO Deviation Summary** card: Blunders (red, count), Mistakes (orange, count), Minor (yellow, count)
   - **Profit Chart**: line chart of chip stack over hand numbers
   - **Notable Hands** section: top 3 biggest deviations as clickable cards showing hand #, hole cards, result, deviation severity
   - Buttons: **[Review Hands]** (→ Hand History), **[New Session]** (→ Config), **[Quick Start]** (→ new game immediately)
3. User clicks a notable hand card → transitions to Hand Replay with GTO analysis pre-loaded

**Error States:**
- Stats calculation fails → Toast: "Some stats couldn't be calculated." Available stats still displayed; missing ones show "—"

**Empty State:**
- Session with 0 completed hands (user ends immediately) → Summary shows "No hands played" with **[New Session]** button only

**Loading State:**
- After ending session: spinner + "Calculating session stats..." (GTO analysis runs on all hands)

---

### Flow: Hand History Browser (covers F-005, F-010)

**Happy Path:**
1. User navigates to Hand History (from nav bar or session summary) → **HandHistoryScreen** shows:
   - **SessionFilter** dropdown at top: "All Sessions" or specific session by date/time
   - **AggregateStatsBar**: Total hands, Overall BB/100, Total P/L, VPIP%, PFR%
   - **ProfitChart**: line graph of cumulative P/L across filtered hands
   - **HandList**: reverse-chronological list of hand cards, each showing: Hand #, hole cards (mini card icons), final board (mini cards), result (+/- chips, colored), action summary icon (e.g., "Raised preflop, called turn")
2. User scrolls the list → Infinite scroll loads more hands in batches of 50
3. User clicks a hand card → transitions to Hand Replay (F-006) for that hand

**Error States:**
- IndexedDB read error → Toast: "Failed to load hand history. Please try again." with **[Retry]** button
- Data corruption on a specific hand → That hand card shows "Hand data corrupted" in gray, non-clickable

**Empty State:**
- No hands recorded yet → Centered illustration (empty card table), text: "No hands played yet", **[Start Playing]** button

**Loading State:**
- Initial load: HandList shows 6 skeleton cards (gray rectangles pulsing)
- Infinite scroll: spinner at bottom of list while loading more
- Stats: skeleton placeholders for stat numbers

---

### Flow: Hand Replay (covers F-006)

**Happy Path:**
1. User selects a hand from history → **ReplayScreen** shows:
   - Game table rendered at preflop state (before any action)
   - All players' hole cards visible (if revealed at showdown) or face-down placeholder if folded before showdown
   - **ReplayControls** at bottom: **[⏮ Start]** **[◀ Prev]** **[▶ Next]** **[⏭ End]** + step counter "Step 1 of 24"
   - **ActionLog** panel on right side: scrollable list of all actions, current step highlighted
   - **[View GTO Analysis]** button at top right
2. User clicks **[▶ Next]** → Table advances one action: the acting player's seat highlights, action label appears, pot updates, community cards appear when new street begins. ActionLog scrolls to highlight current step
3. User clicks **[◀ Prev]** → Table reverts to previous state: pot, stacks, community cards all restore
4. User clicks **[⏮ Start]** → Returns to initial preflop state
5. User clicks **[⏭ End]** → Jumps to showdown/final state
6. User clicks **[View GTO Analysis]** → GTO annotations overlay onto the replay (see GTO Analysis flow)

**Error States:**
- Hand data incomplete/corrupted → Toast: "This hand's data is incomplete. Some steps may be missing." Replay shows available data only
- Navigation beyond bounds → Buttons disable at start (Prev/Start disabled) and end (Next/End disabled)

**Empty State:**
- N/A — replay always entered with a specific hand selected

**Loading State:**
- Initial render: table skeleton for ~200ms while parsing hand data
- Step transitions: instant (no loading needed, all data local)

---

### Flow: GTO Deviation Analysis (covers F-007, F-008)

**Happy Path:**
1. User enters GTO analysis (from session summary notable hand, or replay screen **[View GTO Analysis]**) → **GTOAnalysisView** overlays the replay:
   - At each of the player's decision points, a **GTOAnnotation** card appears next to the action panel showing:
     - "GTO Reference (simplified):" with action distribution bar (e.g., Raise 67% | Call 33% | Fold 0%)
     - "Your action:" with what the player did, highlighted green (matches GTO) or red/orange/yellow (deviation)
     - Deviation badge: **Blunder** (red), **Mistake** (orange), **Minor** (yellow), or **Good** (green)
2. User steps through the replay → GTOAnnotation updates at each player decision point; non-player actions show no annotation
3. User clicks a deviation badge → **DeviationDetail** expands below the annotation:
   - Explanation text (e.g., "In this spot from CO vs UTG open, GTO suggests 3-betting with AJs at high frequency. Your call is too passive for this holding and position.")
   - Estimated EV loss in bb/100
4. At any point, user sees the persistent label: "GTO Reference (simplified)" — not "GTO Solution"

**Error States:**
- GTO reference data missing for an unusual scenario → Annotation shows "No reference data for this spot" in gray; no deviation grading
- Strategy data not loaded → Toast: "GTO strategy data unavailable. Please refresh." **[Refresh]** button

**Empty State:**
- Hand with zero player decisions (player was sitting out / folded immediately preflop as first action) → "No decision points to analyze in this hand"

**Loading State:**
- GTO analysis computation: brief spinner on GTOAnnotation card "Analyzing..." (~100ms, precomputed lookup)

---

### Flow: Settings & Preferences (covers F-011)

**Happy Path:**
1. User clicks **[⚙ Settings]** gear icon (available from game table top bar and nav bar) → **SettingsPanel** slides in from right (or modal on smaller screens):
   - **Game Speed** section: three radio buttons — Fast (minimal delay), Normal (~1s delay, default), Slow (~2s delay)
   - **Sound Effects** section: toggle switch — On/Off (default: On)
   - **Hand Strength Indicator** section (F-012): toggle switch — On/Off (default: Off) with description: "Show your hand strength and equity during play"
   - **Theme** section: Light / Dark radio buttons (default: Dark — poker feels right in dark mode)
   - All changes apply immediately (no save button needed)
2. User changes game speed to Fast → BOT action delays update immediately in current session
3. User toggles sound off → Sound effects stop immediately
4. User closes settings (click outside or **[✕]** button) → Returns to previous screen

**Error States:**
- localStorage write fails (quota exceeded) → Toast: "Preferences couldn't be saved. They'll reset next visit."

**Empty State:**
- N/A — settings always have default values

**Loading State:**
- N/A — settings are instant (localStorage read/write)

---

### Flow: Hand Strength Indicator (covers F-012)

**Happy Path:**
1. User enables "Hand Strength Indicator" in Settings → Toggle turns on
2. During active hand, once community cards appear (flop+), **HandStrengthBadge** appears below player's hole cards:
   - Made hand label: e.g., "Top Pair, King Kicker", "Nut Flush Draw", "Set of Jacks"
   - Equity bar: approximate equity % vs random range displayed as a colored bar (red <30%, yellow 30-60%, green >60%)
3. On preflop: badge shows "Preflop" with no equity (insufficient context)
4. Badge updates automatically as new community cards are revealed
5. If disabled mid-session: badge disappears immediately

**Error States:**
- Hand evaluation error → Badge shows "—" instead of hand name

**Empty State:**
- Feature toggled off → No badge visible

**Loading State:**
- Equity calculation: instant (local computation)

---

### Flow: Data Persistence & Recovery (covers F-005, F-010)

**Happy Path:**
1. User plays multiple sessions over days/weeks → All hand history stored in IndexedDB, preferences in localStorage
2. User returns to app → Landing screen shows **[Hand History]** link; clicking it reveals all previous sessions and hands intact
3. User's aggregate stats reflect all historical data

**Error States:**
- IndexedDB storage quota approaching limit → Toast: "Storage nearly full. Oldest sessions may need to be cleared." with **[Manage Storage]** link → shows session list with **[Delete]** per session
- IndexedDB completely full → Toast: "Storage full. New hands cannot be saved. Clear old sessions to continue recording." Game still playable, just not recorded
- IndexedDB corrupted → Toast: "Hand history database corrupted." **[Reset Database]** button (confirmation dialog: "This will delete all saved data. Continue?" **[Delete All]** / **[Cancel]**)

**Empty State:**
- Fresh install, no data → All stats show 0, hand history empty (handled by individual flow empty states)

**Loading State:**
- Database initialization on app load: part of splash screen progress

---

## Component Inventory

### Layout Components
| Component | Description | Used In |
|-----------|-------------|---------|
| **AppShell** | Top nav bar + main content area wrapper | All screens |
| **NavBar** | Logo, New Session, Hand History, Settings links | All screens |
| **SplashScreen** | Centered logo + progress bar during app init | App Launch |

### Landing & Configuration
| Component | Description | Used In |
|-----------|-------------|---------|
| **LandingScreen** | Hero with Quick Start + New Session buttons | App Launch |
| **ConfigScreen** | 6-seat table layout for session setup | Session Configuration |
| **SeatSelector** | Clickable seat position on config table | ConfigScreen |
| **BotStyleDropdown** | Dropdown with 5 BOT style options + descriptions | ConfigScreen |

### Game Table
| Component | Description | Used In |
|-----------|-------------|---------|
| **GameTable** | Main poker table with 6 seats, pot, community cards | Game Play |
| **PlayerSeat** | Seat showing name/style, avatar, stack, cards, action label | GameTable |
| **HoleCards** | Two card display (face up for player, face down for BOTs) | PlayerSeat, ReplayScreen |
| **CommunityCards** | 5-card area in table center (progressive reveal) | GameTable, ReplayScreen |
| **PotDisplay** | Centered pot amount with chip icon | GameTable, ReplayScreen |
| **DealerButton** | "D" chip indicator on dealer seat | GameTable, ReplayScreen |
| **ActionPanel** | Bottom bar with Fold/Check/Call/Raise/All-in buttons | GameTable |
| **RaiseControls** | Slider + input + presets for raise sizing | ActionPanel |
| **HandStrengthBadge** | Made hand label + equity bar below player cards | GameTable |
| **BotActionLabel** | Floating label showing BOT's action (e.g., "Raise to 6") | PlayerSeat |
| **BotThinkingIndicator** | Pulsing "..." on BOT seat during delay | PlayerSeat |
| **WinnerBadge** | Hand name highlight on winning player at showdown | GameTable |
| **HandResultToast** | Brief "+14 chips" / "-6 chips" flash after hand | GameTable |
| **GameTopBar** | Hand #, session P/L, End Session button, Settings icon | GameTable |

### Session Summary
| Component | Description | Used In |
|-----------|-------------|---------|
| **SessionSummaryScreen** | Post-session stats, deviations, chart, notable hands | End Session |
| **StatsRow** | Horizontal stat cards (hands, P/L, BB/100, VPIP%, PFR%) | SessionSummaryScreen, HandHistoryScreen |
| **DeviationSummaryCard** | Blunder/Mistake/Minor counts with colored badges | SessionSummaryScreen |
| **ProfitChart** | Line chart of chip stack or cumulative P/L over time | SessionSummaryScreen, HandHistoryScreen |
| **NotableHandCard** | Clickable card showing hand #, cards, result, severity | SessionSummaryScreen |

### Hand History
| Component | Description | Used In |
|-----------|-------------|---------|
| **HandHistoryScreen** | List view of all hands with filters and stats | Hand History |
| **SessionFilter** | Dropdown to filter by session or "All Sessions" | HandHistoryScreen |
| **HandCard** | Summary card per hand (cards, board, result, actions) | HandHistoryScreen |
| **MiniCard** | Small card icon showing rank + suit | HandCard, NotableHandCard |

### Hand Replay
| Component | Description | Used In |
|-----------|-------------|---------|
| **ReplayScreen** | Table + replay controls + action log | Hand Replay |
| **ReplayControls** | Start/Prev/Next/End buttons + step counter | ReplayScreen |
| **ActionLog** | Scrollable action list with current step highlighted | ReplayScreen |

### GTO Analysis
| Component | Description | Used In |
|-----------|-------------|---------|
| **GTOAnnotation** | Action distribution bar + player action + deviation badge | ReplayScreen (GTO mode) |
| **DeviationBadge** | Colored severity label (Blunder/Mistake/Minor/Good) | GTOAnnotation, NotableHandCard |
| **ActionDistributionBar** | Segmented horizontal bar showing Raise%/Call%/Fold% | GTOAnnotation |
| **DeviationDetail** | Expandable explanation text + EV loss estimate | GTOAnnotation |
| **GTOReferenceLabel** | Persistent "GTO Reference (simplified)" disclaimer | GTOAnalysisView |

### Settings
| Component | Description | Used In |
|-----------|-------------|---------|
| **SettingsPanel** | Slide-in panel with all preference controls | Settings |
| **RadioGroup** | Grouped radio buttons (game speed, theme) | SettingsPanel |
| **ToggleSwitch** | On/Off toggle (sound, hand strength indicator) | SettingsPanel |

### Shared / Utility
| Component | Description | Used In |
|-----------|-------------|---------|
| **ConfirmDialog** | Modal with message + confirm/cancel buttons | End Session, Reset Database |
| **Toast** | Temporary notification bar (success, error, info) | Multiple flows |
| **ErrorBanner** | Persistent warning bar at top of screen | Storage unavailable |
| **ErrorModal** | Full-screen blocking error with action button | Fatal errors |
| **Spinner** | Inline loading spinner | Buttons, loading states |
| **SkeletonCard** | Gray pulsing placeholder for loading lists | HandHistoryScreen |
| **ProgressBar** | Horizontal bar with percentage | SplashScreen |
| **EmptyState** | Illustration + message + CTA button template | HandHistoryScreen |

---

## Feature Coverage Verification

| Feature ID | Feature Name | Covered In Flow(s) |
|------------|-------------|-------------------|
| F-001 | game-table-ui | Game Play — Hand Lifecycle |
| F-002 | game-engine | Game Play — Hand Lifecycle |
| F-003 | session-config | App Launch & Landing, Session Configuration |
| F-004 | bot-ai | Game Play — Hand Lifecycle |
| F-005 | hand-history-storage | Hand History Browser, End Session & Summary, Data Persistence & Recovery |
| F-006 | hand-replay | Hand Replay |
| F-007 | gto-deviation-analysis | GTO Deviation Analysis, End Session & Summary |
| F-008 | gto-strategy-data | Game Play — Hand Lifecycle, GTO Deviation Analysis |
| F-009 | quick-start | App Launch & Landing |
| F-010 | session-management | End Session & Summary, Hand History Browser, Data Persistence & Recovery |
| F-011 | settings-preferences | Settings & Preferences |
| F-012 | hand-strength-indicator | Hand Strength Indicator, Game Play — Hand Lifecycle |