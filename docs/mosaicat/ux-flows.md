# UX Flows — GTO Idiot

## Interaction Patterns

| Pattern | Implementation |
|---------|---------------|
| Form validation | Real-time per-field on blur + full validation on submit |
| Error display | Inline below the field (form) / toast (action) / full-screen (fatal) |
| Loading — data | Skeleton screen for lists and dashboards |
| Loading — buttons | Spinner inside button, button disabled |
| Loading — game init | Progress bar with step labels ("Shuffling deck…", "Seating bots…") |
| Empty state | Illustration + descriptive text + primary action button |
| Navigation | Top nav bar with: Home, Play, History, Statistics, GTO Reference, Settings |
| Destructive actions | Confirmation dialog before execution |
| Game actions | Large, clearly labeled action buttons with amounts; keyboard shortcuts |
| Language toggle | Persistent toggle in top nav; changes apply immediately without reload |
| Card animations | Brief flip/slide animations for dealing and reveals (≤300ms) |

---

## User Journeys

### Flow: Home & Navigation (covers F-003, F-012)

**Happy Path:**
1. User opens the app → System loads persisted data from local storage, displays Home screen with top nav (Home, Play, History, Statistics, GTO Reference, Settings) and a hero section with "Start Session" CTA
2. If previous sessions exist, Home screen shows a "Recent Sessions" card list (last 5 sessions with date, hands played, net result)
3. User clicks "Start Session" → System navigates to Session Setup screen

**Error States:**
- Local storage corrupted or unavailable → User sees full-screen error: "Unable to load saved data. Your browser storage may be full or disabled." with "Clear Data & Restart" and "Try Again" buttons
- Browser does not support required APIs (IndexedDB) → User sees full-screen error: "Your browser is not supported. Please use a modern browser (Chrome, Firefox, Safari, Edge)."

**Empty State:**
- When no sessions have been played → Home screen shows poker chip illustration + "No sessions yet" + "Start your first session to begin improving your game" + "Start Session" primary button

**Loading State:**
- Initial app load: skeleton screen for Recent Sessions card area; top nav renders immediately
- Data hydration from IndexedDB: spinner overlay with "Loading your data…" (typically <500ms)

---

### Flow: Session Setup (covers F-011, F-015, F-002)

**Happy Path:**
1. User sees Session Setup screen with two sections: "Table Settings" and "Bot Configuration"
2. In Table Settings: user sets Starting Stack (dropdown: 50BB / 100BB / 200BB, default 100BB) and Blind Level (dropdown: 1/2, 2/5, 5/10, default 1/2)
3. In Bot Configuration: 5 bot seat cards displayed in a row. Each card shows seat number, a profile dropdown (TAG / LAG / Fish / Nit / Maniac), and a bot avatar/icon matching the profile
4. Default bot mix is pre-filled: Seat 1=TAG, Seat 2=LAG, Seat 3=Fish, Seat 4=Nit, Seat 5=TAG
5. User optionally changes bot profiles by selecting from dropdowns
6. User clicks "Start Game" → System creates table, assigns positions, shuffles deck, deals first hand → Navigates to Table View

**Error States:**
- Invalid configuration (should not occur with dropdowns, but defensive) → Inline error below the field: "Please select a valid option"

**Empty State:**
- N/A — form always has defaults pre-filled

**Loading State:**
- "Start Game" button: spinner inside button + "Setting up table…" text, button disabled during initialization (~1-2s for engine setup)

---

### Flow: Playing a Hand (covers F-001, F-002, F-003, F-004, F-013)

**Happy Path:**
1. User sees the Table View: oval table with 6 seats arranged around it. Each seat shows: player name (User or bot name+style), stack size in chips, position label (BTN/SB/BB/UTG/MP/CO). Pot display in center. Community card area above pot. Action panel at bottom of screen.
2. Hand begins: blinds are posted automatically (SB and BB amounts deducted and shown). User's hole cards animate face-up. Bot cards shown face-down. Hand number displayed in corner.
3. **Preflop:** Action proceeds clockwise from UTG.
   - When a bot acts → bot's action label appears at their seat (e.g., "Fold", "Raise to 6") with a brief highlight animation (~500ms). Action log updates in a side panel.
   - When it is User's turn → Action Panel at bottom highlights/activates with available actions as large buttons:
     - "Fold" (always available, styled in muted/red)
     - "Check" (if no bet to call) or "Call [amount]" (green)
     - "Bet" or "Raise" with a slider/input for sizing (blue/primary). Min raise and pot-size shortcuts shown.
     - "All-In [amount]" if applicable
   - User selects action → System records action to hand history, updates pot, advances to next player
4. **Flop:** After preflop betting completes → 3 community cards animate onto the table. New betting round begins from first active player left of dealer.
5. **Turn:** 1 community card added with animation. Betting round.
6. **River:** 1 community card added with animation. Final betting round.
7. **Showdown:** If 2+ players remain → bot hole cards flip face-up with animation → Winner determined → Chips animate to winner's stack → Result banner appears briefly ("You won 45 chips!" or "Bot-TAG wins 45 chips")
8. **Fold victory:** If all but one player folds → Pot awarded immediately to remaining player → No showdown
9. **Side pots:** When all-in situations occur → side pot amounts displayed separately on table → Each pot awarded to correct winner at showdown
10. After hand concludes → Positions rotate clockwise (dealer button moves) → Next hand auto-deals after 2-second pause

**Error States:**
- Game engine error during hand → Toast notification: "An error occurred processing this hand. Restarting hand." → Hand is voided, re-dealt
- Invalid action attempted (defensive, UI should prevent) → Toast: "That action is not available right now"

**Empty State:**
- N/A — table always has active game state during session

**Loading State:**
- Between hands: brief "Dealing…" text with card shuffle animation (1-2s)
- Bot thinking: pulsing "thinking" indicator at bot's seat (~0.5-1.5s randomized delay to feel natural)
- Side pot calculation: instantaneous, no loading needed

---

### Flow: End Session (covers F-003, F-004, F-009)

**Happy Path:**
1. User clicks "End Session" button (top-right of table view, styled as secondary/outline button)
2. System shows confirmation dialog: "End this session? Your hand history will be saved for review." with "End Session" (primary) and "Keep Playing" (secondary) buttons
3. User confirms → System saves all hand data to local storage → Navigates to Session Summary screen
4. Session Summary shows:
   - Total hands played (number)
   - Net result (chips won/lost, green if positive, red if negative)
   - Biggest winning hand (hand # and amount, clickable)
   - Biggest losing hand (hand # and amount, clickable)
   - GTO Alignment Score (percentage with circular progress indicator, e.g., "72% GTO Aligned")
5. Below summary: "Review Hands" button (primary) and "Back to Home" button (secondary)
6. User clicks on a notable hand → System navigates directly to Hand Replay for that hand

**Error States:**
- Save failure (storage full) → Modal: "Unable to save session data. Your browser storage may be full. Please free up space and try again." with "Try Again" and "Discard Session" buttons

**Empty State:**
- N/A — summary always has data from the just-completed session

**Loading State:**
- After confirming end: full-screen overlay with "Saving session…" spinner (~1s)
- GTO alignment calculation: skeleton placeholder for score, fills in after computation (~1-2s)

---

### Flow: Hand History Browser (covers F-004, F-005)

**Happy Path:**
1. User clicks "History" in top nav → System displays Hand History page
2. Page shows a list of sessions, each as an expandable card: date, hands played, net result, GTO alignment %
3. User clicks a session → Card expands to show a scrollable list of hands within that session: hand #, positions, result (+/- chips), and a brief tag (e.g., "Showdown", "Folded preflop")
4. User clicks a specific hand → Navigates to Hand Replay view for that hand

**Error States:**
- Data load failure → Toast: "Failed to load hand history. Please try again." with retry action in toast

**Empty State:**
- When no sessions exist → Illustration of empty notebook + "No hands recorded yet" + "Play your first session to build your history" + "Start Session" primary button

**Loading State:**
- Session list: skeleton cards (3 placeholders) while loading from IndexedDB
- Hand list within session: skeleton rows while loading hand details

---

### Flow: Hand Replay (covers F-005, F-006, F-007)

**Happy Path:**
1. User enters replay view → System shows the table state at the beginning of the hand (initial deal). Navigation controls at bottom: "◀ Previous" | step indicator "1 / 24" | "Next ▶". A timeline bar shows all events as dots; user's decision points are marked with a diamond icon.
2. User clicks "Next" → Table advances to next event (e.g., UTG folds, shown with seat highlight and action label)
3. User continues stepping through → Each action/event updates the table state: cards revealed, pot updated, stacks adjusted
4. **At a User decision point:**
   - The action the user actually took is highlighted with a label (e.g., "You raised to 12")
   - A GTO Panel slides in from the right side showing:
     - **User's Action:** "Raise to 12" with result indicator
     - **GTO Recommendation:** "Raise 65% | Call 30% | Fold 5%"
     - If user matched GTO → Green "✓ GTO Aligned" badge on the action
     - If user deviated → Orange/Red "✗ Deviation" badge with the preferred action shown
   - **Preflop decisions:** GTO Panel includes a mini 13x13 Range Matrix (F-007) with the user's hand cell highlighted. Color coding: green=raise, blue=call, gray=fold with opacity indicating frequency.
   - **Postflop decisions:** GTO Panel shows "Approximate GTO" label clearly, with simplified action categories and frequencies
5. User can click on the mini Range Matrix → Expands to full-screen Range Matrix overlay with hover tooltips showing exact hand combos and frequencies
6. User clicks "Previous" → Steps backward through events, GTO panel updates accordingly
7. User can click timeline dots to jump to any point in the hand
8. User clicks "Back to History" or "Next Hand" / "Previous Hand" to navigate between hands

**Error States:**
- GTO data unavailable for a spot → GTO Panel shows: "GTO data not available for this spot" with gray placeholder. Hand replay still functions for all other aspects.
- Hand data corrupted → Full-screen error: "This hand could not be loaded. The data may be corrupted." with "Back to History" button

**Empty State:**
- N/A — replay always has hand data

**Loading State:**
- Initial replay load: skeleton table + "Loading hand…" (~500ms)
- GTO computation for each step: small spinner in GTO Panel corner (should be <200ms from precomputed data)

---

### Flow: GTO Reference Browser (covers F-010, F-007)

**Happy Path:**
1. User clicks "GTO Reference" in top nav → System displays the Reference Browser page
2. Page shows two control sections at top:
   - Position selector: 6 buttons in a row (UTG, MP, CO, BTN, SB, BB) — default: UTG selected
   - Scenario selector: dropdown with options like "Open Raise (RFI)", "Facing 3-Bet", "Facing Open from EP", etc. — default: "Open Raise (RFI)"
3. Below controls: full 13x13 Range Matrix displayed large. Rows = first card (A through 2), Columns = second card (A through 2). Upper-right triangle = suited hands (labeled "s"), lower-left = offsuit ("o"), diagonal = pairs.
4. Each cell color-coded by action frequency: raise color intensity, call color intensity, fold color intensity. Legend shown below matrix.
5. User changes position → Matrix updates to show that position's range for the selected scenario
6. User changes scenario → Matrix updates for the new scenario at the selected position
7. User hovers over a cell → Tooltip appears: "AKs — Raise: 85%, Call: 15%, Fold: 0%"
8. User can click a cell to pin the tooltip for comparison

**Error States:**
- Range data file failed to load → Inline error replacing matrix: "Unable to load GTO range data. Please refresh the page." with "Refresh" button

**Empty State:**
- N/A — reference data is bundled with the app, always available

**Loading State:**
- Initial page load: skeleton matrix (13x13 gray grid) while range data loads from bundled JSON (~300ms)
- Position/scenario change: brief matrix fade-transition (150ms)

---

### Flow: Session Statistics Dashboard (covers F-008)

**Happy Path:**
1. User clicks "Statistics" in top nav → System displays Statistics page
2. Page is divided into sections:
   - **Bankroll Graph:** Line chart showing cumulative chip results over time (x-axis: hands or sessions, y-axis: chips). Hoverable data points showing session details.
   - **Key Metrics Cards:** 4 cards in a row:
     - Total Hands Played (number)
     - Win Rate (BB/100, green if positive, red if negative)
     - VPIP % (Voluntarily Put $ In Pot)
     - PFR % (Pre-Flop Raise)
   - **Per-Position Stats Table:** 6-row table (UTG/MP/CO/BTN/SB/BB) with columns: Hands, Win Rate, VPIP, PFR
   - **Aggression Factor:** Single metric card
   - **Biggest Leaks Section:** Up to 3 cards, each describing a leak:
     - Leak title (e.g., "Folding too much from BB to steals")
     - Deviation description and how to improve
     - Severity indicator (High/Medium/Low)
3. User can hover over chart data points for details
4. User can click on a position row to filter hand history to that position

**Error States:**
- Statistics computation fails → Toast: "Error calculating statistics. Some data may be incomplete." Partial data still displayed where available.

**Empty State:**
- When no sessions played → Illustration of bar chart with flat line + "No statistics yet" + "Play at least one session to see your stats" + "Start Session" primary button
- When insufficient data for "Biggest Leaks" (< 50 hands) → Leaks section shows: "Play more hands to unlock leak analysis (minimum 50 hands)" with progress bar showing current count

**Loading State:**
- Bankroll graph: skeleton chart area with animated shimmer
- Metric cards: skeleton number placeholders
- Per-position table: skeleton rows
- Biggest Leaks: skeleton cards
- All load from IndexedDB, typically <1s

---

### Flow: Language Settings (covers F-014)

**Happy Path:**
1. User clicks "Settings" in top nav (or gear icon) → System shows Settings page
2. Settings page includes Language section with two options: "English" and "中文" as toggle buttons. Current selection highlighted.
3. User clicks the other language → All UI text immediately switches to the selected language. Preference saved to local storage.

**Error States:**
- Language file failed to load → Toast: "Language change failed. Using default language." Falls back to English.

**Empty State:**
- N/A — settings always have defaults

**Loading State:**
- Language switch: no visible loading (strings are bundled, swap is instant)

---

### Flow: Data Persistence & Recovery (covers F-012)

**Happy Path:**
1. User plays sessions over multiple browser visits → System auto-saves to IndexedDB after each hand and at session end
2. User closes browser, returns later → System loads all data on app init transparently
3. All sessions, hand histories, and statistics are intact

**Error States:**
- IndexedDB write fails mid-session → Toast: "Warning: Unable to save data. Your progress may not be preserved. Please check your browser storage." Session continues but data at risk.
- IndexedDB read fails on load → Full-screen error with "Clear Data & Restart" option (see Home flow)
- Storage quota exceeded → Modal: "Storage is full. You can export your data or delete old sessions to free space." with "Manage Sessions" link

**Empty State:**
- First visit with no data → App initializes cleanly, shows Home empty state

**Loading State:**
- Initial data load on app start: splash screen with app logo + "Loading GTO Idiot…" progress bar

---

## Component Inventory

### Layout Components
| Component | Description | Used In |
|-----------|-------------|---------|
| TopNav | Main navigation bar with app logo, nav links (Home, Play, History, Statistics, GTO Reference, Settings), language toggle shortcut | All pages |
| PageLayout | Standard page wrapper with TopNav + content area + responsive padding | All pages |
| ConfirmDialog | Modal dialog with title, message, primary + secondary buttons | End Session, destructive actions |
| ToastNotification | Non-blocking notification bar (success/warning/error variants) | Throughout app |
| FullScreenError | Full-page error state with icon, message, and action buttons | Fatal errors |
| SplashScreen | App loading screen with logo and progress bar | Initial app load |

### Home & Setup Components
| Component | Description | Used In |
|-----------|-------------|---------|
| HeroSection | Large CTA area with "Start Session" button and tagline | Home |
| RecentSessionCard | Card showing session date, hands played, net result | Home |
| EmptyStatePanel | Illustration + message + CTA button for empty data states | Home, History, Statistics |
| SessionSetupForm | Form with table settings and bot configuration | Session Setup |
| StackSizeSelector | Dropdown for selecting starting stack (50/100/200 BB) | Session Setup |
| BlindLevelSelector | Dropdown for selecting blind level | Session Setup |
| BotSeatCard | Card per bot seat showing seat #, profile dropdown, avatar | Session Setup |
| BotProfileDropdown | Dropdown to select bot play style (TAG/LAG/Fish/Nit/Maniac) | Session Setup |

### Table & Game Components
| Component | Description | Used In |
|-----------|-------------|---------|
| PokerTable | Oval table surface with 6 seat positions arranged around it | Playing, Replay |
| PlayerSeat | Seat display: name, stack, position label, action label, cards area | Playing, Replay |
| HoleCards | Two-card display, face-up (user) or face-down (bots until showdown) | Playing, Replay |
| CommunityCards | 5-card area in table center, progressively revealed | Playing, Replay |
| PotDisplay | Central pot amount display, supports multiple side pots | Playing, Replay |
| DealerButton | Small "D" chip indicating dealer position | Playing, Replay |
| ActionPanel | Bottom bar with action buttons (Fold/Check/Call/Bet/Raise/All-In) | Playing |
| BetSlider | Slider + number input for bet/raise sizing with preset shortcuts | Playing |
| BetPresetButton | Quick-select buttons (Min, 1/2 Pot, 3/4 Pot, Pot, All-In) | Playing |
| ActionLabel | Temporary label at player seat showing last action + amount | Playing, Replay |
| HandNumberBadge | Small badge showing current hand number | Playing |
| BotThinkingIndicator | Pulsing dots animation at bot seat during "thinking" | Playing |
| ResultBanner | Animated banner showing hand result ("You won 45 chips!") | Playing |
| EndSessionButton | Secondary button to end current session | Playing |
| ActionLog | Scrollable side panel listing all actions in current hand | Playing |

### Replay Components
| Component | Description | Used In |
|-----------|-------------|---------|
| ReplayControls | Previous/Next buttons + step indicator + timeline bar | Replay |
| ReplayTimeline | Horizontal bar with event dots; user decisions marked as diamonds | Replay |
| GTOPanel | Right-side panel showing GTO recommendation vs user action | Replay |
| GTOActionComparison | Side-by-side display of user action and GTO recommendation | Replay |
| GTOAlignmentBadge | Green "✓ Aligned" or Red "✗ Deviation" indicator | Replay |
| ApproximateGTOLabel | "Approximate GTO" disclaimer label for postflop spots | Replay |
| MiniRangeMatrix | Small 13x13 matrix with user's hand highlighted | Replay |
| HandNavigator | "Previous Hand" / "Next Hand" buttons for browsing hands | Replay |

### Range Matrix Components
| Component | Description | Used In |
|-----------|-------------|---------|
| RangeMatrix | Full 13x13 hand grid with color-coded action frequencies | GTO Reference, Replay |
| RangeMatrixCell | Individual cell: hand label + color fill by frequency | GTO Reference, Replay |
| RangeMatrixTooltip | Hover/click tooltip with exact hand combo + action percentages | GTO Reference, Replay |
| RangeMatrixLegend | Color legend for raise/call/fold frequency mapping | GTO Reference, Replay |
| RangeMatrixOverlay | Full-screen expanded matrix (from mini matrix click) | Replay |
| PositionSelector | Row of 6 position buttons (UTG/MP/CO/BTN/SB/BB) | GTO Reference |
| ScenarioDropdown | Dropdown for selecting action scenario | GTO Reference |

### History Components
| Component | Description | Used In |
|-----------|-------------|---------|
| SessionListCard | Expandable card: date, hands, net result, GTO alignment % | History |
| HandListItem | Row in expanded session: hand #, position, result, outcome tag | History |
| OutcomeTag | Small tag (e.g., "Showdown", "Folded preflop", "All-in") | History |

### Statistics Components
| Component | Description | Used In |
|-----------|-------------|---------|
| BankrollGraph | Line chart of cumulative results over time with hover tooltips | Statistics |
| MetricCard | Single stat card: label + value + optional trend indicator | Statistics |
| PositionStatsTable | 6-row table with per-position metrics | Statistics |
| LeakCard | Card describing a detected leak: title, description, severity | Statistics |
| LeakSeverityBadge | High/Medium/Low severity indicator | Statistics |
| ProgressIndicator | Progress bar showing hands played toward leak analysis threshold | Statistics |

### Session Summary Components
| Component | Description | Used In |
|-----------|-------------|---------|
| SessionSummaryPanel | Full summary: hands, result, notable hands, GTO score | Session Summary |
| GTOAlignmentCircle | Circular progress indicator showing GTO alignment percentage | Session Summary |
| NotableHandCard | Clickable card showing notable hand (biggest win/loss) | Session Summary |
| NetResultDisplay | Large +/- chip display with green/red coloring | Session Summary |

### Settings Components
| Component | Description | Used In |
|-----------|-------------|---------|
| SettingsPage | Settings page layout with sections | Settings |
| LanguageToggle | Two-option toggle: English / 中文 | Settings, TopNav |

### Shared / Utility Components
| Component | Description | Used In |
|-----------|-------------|---------|
| SkeletonCard | Animated placeholder card for loading states | Throughout |
| SkeletonRow | Animated placeholder row for loading states | Throughout |
| SkeletonChart | Animated placeholder chart area | Statistics |
| SkeletonMatrix | 13x13 gray grid placeholder | GTO Reference |
| SpinnerButton | Button with inline spinner and disabled state | Session Setup, forms |
| ProgressBar | Horizontal progress bar with optional label | App load, data thresholds |
| ChipAmount | Formatted chip count display with icon | Throughout |
| CardImage | Individual playing card visual (rank + suit) | Throughout |

---

## Feature Coverage Verification

| Feature ID | Feature Name | Covered By Flows |
|------------|-------------|-----------------|
| F-001 | poker-game-engine | Playing a Hand |
| F-002 | bot-opponents | Session Setup, Playing a Hand |
| F-003 | game-session-flow | Home & Navigation, Session Setup, Playing a Hand, End Session |
| F-004 | hand-history-recording | Playing a Hand, End Session, Hand History Browser |
| F-005 | hand-replay | Hand History Browser, Hand Replay |
| F-006 | gto-comparison | Hand Replay |
| F-007 | preflop-range-matrix | Hand Replay, GTO Reference Browser |
| F-008 | session-statistics | Session Statistics Dashboard |
| F-009 | session-summary | End Session |
| F-010 | gto-reference-browser | GTO Reference Browser |
| F-011 | bot-profile-selection | Session Setup |
| F-012 | data-persistence | Home & Navigation, Data Persistence & Recovery |
| F-013 | table-ui | Playing a Hand |
| F-014 | i18n-support | Language Settings |
| F-015 | session-configuration | Session Setup |