## Goal
GTO Idiot is a free, browser-based Texas Hold'em GTO strategy trainer that lets players practice against configurable AI opponents at a 6-max table, record hand histories, and review post-game analysis highlighting deviations from GTO reference strategies — solving the lack of accessible, zero-cost GTO practice tools.

## Target Users
- **Primary persona:** Intermediate Texas Hold'em players who understand position, ranges, pot odds, and basic strategy concepts, but want structured practice to move their game toward GTO. They play online or live, use a desktop or laptop browser, and are unwilling to pay $35+/mo for cloud trainers or install heavyweight desktop solvers. Technical level: comfortable using web apps, no programming knowledge required.

## Features

### F-001 game-table-ui (P0)
Interactive 6-max poker table interface showing player seat, 5 BOT seats, community cards, pot size, player stack sizes, and action buttons.

**Acceptance Criteria:**
- GIVEN the game table is loaded, WHEN the player views the screen, THEN they see 6 seats arranged around a table with positions labeled (BTN, SB, BB, UTG, MP, CO), their own hole cards (face up), BOT cards (face down), community cards area, pot display, and each player's chip stack
- GIVEN it is the player's turn to act, WHEN the action prompt appears, THEN buttons for Fold, Check (when available), Call (showing amount), Raise (with adjustable sizing), and All-in are displayed
- GIVEN a raise action is selected, WHEN the player adjusts the raise amount, THEN a slider or input allows choosing any legal raise size between the minimum raise and their remaining stack
- GIVEN it is not the player's turn, WHEN a BOT is acting, THEN the BOT's action is displayed with a brief visual indication before the game advances
- GIVEN a hand is in progress, WHEN cards are dealt or community cards revealed, THEN a dealing animation or visual transition makes the game flow clear

### F-002 game-engine (P0)
Complete NL Hold'em game engine handling deck shuffling, card dealing, betting rounds (preflop → flop → turn → river), pot management, side pot calculation, showdown evaluation, and position rotation.

**Acceptance Criteria:**
- GIVEN a new hand starts, WHEN cards are dealt, THEN each player receives exactly 2 hole cards from a properly shuffled 52-card deck, and blinds (1/2) are posted by SB and BB
- GIVEN a betting round is in progress, WHEN a player acts, THEN legal actions are correctly enforced (minimum raise = previous raise size, call amount = current bet minus player's contribution, check only when no bet to call)
- GIVEN all betting is complete for a street, WHEN the next street begins, THEN the correct number of community cards are dealt (3 for flop, 1 for turn, 1 for river) and action starts from the first active player left of the dealer
- GIVEN one or more players are all-in with different stack sizes, WHEN the hand reaches showdown, THEN side pots are correctly calculated and awarded to the best hand eligible for each pot
- GIVEN only one player remains (all others folded), WHEN the hand ends, THEN that player wins the entire pot without showdown
- GIVEN a showdown occurs, WHEN hands are compared, THEN the correct hand ranking determines the winner (royal flush > straight flush > four of a kind > full house > flush > straight > three of a kind > two pair > one pair > high card), with proper kicker evaluation and split pot handling for ties
- GIVEN a hand ends, WHEN the next hand begins, THEN the dealer button moves one position clockwise, blinds rotate accordingly, and all players with chips remaining are dealt in

### F-003 session-config (P0)
Pre-game configuration allowing the player to select their seat position and assign BOT styles to each opponent seat before starting a session.

**Acceptance Criteria:**
- GIVEN the player opens the app, WHEN they choose to start a new session, THEN a configuration screen appears showing 6 seats with the player able to pick any one seat
- GIVEN the configuration screen, WHEN the player assigns BOT styles, THEN each of the 5 BOT seats can be assigned one of the available styles (TAG, LAG, Fish, Nit, Calling Station) with a brief description of each style's playing tendencies
- GIVEN a valid configuration (player seated, all BOTs assigned), WHEN the player clicks start, THEN a new session begins with fixed blinds 1/2 and 100BB (200 chips) starting stack for all players

### F-004 bot-ai (P0)
AI decision engine for 5 BOT opponents with distinct playing styles parameterized by VPIP, PFR, aggression frequency, and postflop tendencies.

**Acceptance Criteria:**
- GIVEN a TAG (Tight-Aggressive) BOT, WHEN it plays over 100+ hands, THEN its VPIP is approximately 16-22% and PFR is approximately 13-20%, with aggressive postflop betting when it enters a pot
- GIVEN a LAG (Loose-Aggressive) BOT, WHEN it plays over 100+ hands, THEN its VPIP is approximately 25-35% and PFR is approximately 20-28%, entering many pots with frequent raises and continuation bets
- GIVEN a Fish BOT, WHEN it plays over 100+ hands, THEN its VPIP is approximately 40-70% and PFR is approximately 3-10%, calling too often preflop, rarely raising, and making inconsistent postflop decisions
- GIVEN a Nit BOT, WHEN it plays over 100+ hands, THEN its VPIP is approximately 10-15% and PFR is approximately 8-13%, playing only premium hands and folding readily to aggression with marginal holdings
- GIVEN a Calling Station BOT, WHEN it plays over 100+ hands, THEN its VPIP is approximately 35-55% and PFR is approximately 5-12%, calling frequently both preflop and postflop but rarely raising
- GIVEN any BOT style, WHEN it makes decisions, THEN there is controlled randomization to prevent deterministic patterns while staying within style parameters

### F-005 hand-history-storage (P0)
Persistent storage of every completed hand including full action sequence, card data, pot progression, and results.

**Acceptance Criteria:**
- GIVEN a hand completes, WHEN the result is determined, THEN the complete hand record is saved including: hand ID, timestamp, all player positions and stack sizes, hole cards (revealed at showdown), all community cards, every action taken (player + street + action + amount), pot size at each street, final result and chip changes
- GIVEN hands have been stored, WHEN the player views their hand history, THEN hands are listed in reverse chronological order with summary info (hand number, result +/- chips, player's hole cards, final board)
- GIVEN hand history exists, WHEN the player views session statistics, THEN aggregate stats are shown including: total hands played, win rate (bb/100), total profit/loss, VPIP%, PFR%, and a profit/loss chart over time
- GIVEN the player has been playing across multiple sessions, WHEN they return to the app, THEN all previous hand history and statistics are preserved

### F-006 hand-replay (P1)
Street-by-street hand replay allowing the player to step through any saved hand and see the game state at each decision point.

**Acceptance Criteria:**
- GIVEN a saved hand, WHEN the player selects it for replay, THEN the table is rendered at the preflop state with all hole cards and no community cards
- GIVEN a hand replay is active, WHEN the player steps forward, THEN the next action is shown with updated pot size, player stacks, and any newly dealt community cards
- GIVEN a hand replay is active, WHEN the player steps backward, THEN the previous game state is restored
- GIVEN a hand replay is active, WHEN the player is at any decision point, THEN they can see what all players' hole cards were (if revealed at showdown)

### F-007 gto-deviation-analysis (P0)
Post-hand GTO deviation analysis comparing the player's actual decisions against precomputed GTO reference strategies, with severity-graded feedback.

**Acceptance Criteria:**
- GIVEN a completed hand, WHEN the player views the GTO analysis, THEN each of the player's decision points is annotated with the GTO reference action distribution (e.g., "GTO: Raise 67%, Call 33%, Fold 0%") and what the player actually did
- GIVEN a player decision deviates from GTO, WHEN the deviation is displayed, THEN it is categorized by severity: "Blunder" (estimated >10 EV bb/100 loss), "Mistake" (3-10 EV bb/100 loss), or "Minor" (<3 EV bb/100 loss)
- GIVEN a deviation is shown, WHEN the player views details, THEN a brief explanation is provided (e.g., "In this spot from CO vs UTG open, GTO suggests 3-betting with AJs at high frequency. Your call is too passive for this holding and position.")
- GIVEN a session ends or is paused, WHEN the player views the session summary, THEN the total number of Blunders, Mistakes, and Minor deviations are displayed alongside the overall session stats
- GIVEN the GTO reference strategy, WHEN displayed to the user, THEN it is clearly labeled as "GTO Reference (simplified)" not "GTO Solution" to set accurate expectations about precision

### F-008 gto-strategy-data (P0)
Precomputed GTO reference strategy data covering preflop ranges by position and simplified postflop heuristics by board texture and hand strength categories.

**Acceptance Criteria:**
- GIVEN preflop data, WHEN a player decision point occurs preflop, THEN the system has GTO reference actions for all 169 unique starting hands across all 6 positions for common scenarios (open raise, facing raise, facing 3-bet)
- GIVEN postflop data, WHEN a player decision point occurs postflop, THEN the system categorizes the situation by board texture, hand strength bucket, position, and pot type to retrieve a directional GTO reference action
- GIVEN the strategy data, WHEN loaded in the browser, THEN the total data size is under 200KB and does not noticeably impact page load time

### F-009 quick-start (P1)
One-click quick start option that begins a session with a default configuration (random player seat, balanced mix of BOT styles) for players who want to jump into practice immediately.

**Acceptance Criteria:**
- GIVEN the player opens the app, WHEN they click "Quick Start", THEN a session begins immediately with a randomly assigned player seat and a default BOT mix (e.g., 1 TAG, 1 LAG, 1 Fish, 1 Nit, 1 Calling Station)
- GIVEN a quick-start session, WHEN the player wants to change configuration, THEN they can end the current session and access the full configuration screen

### F-010 session-management (P1)
Ability to end a session, view session summary, and start a new session without losing historical data.

**Acceptance Criteria:**
- GIVEN a session is in progress, WHEN the player ends the session, THEN a session summary is shown with hands played, net profit/loss, key stats, and number of GTO deviations by severity
- GIVEN a session has ended, WHEN the player starts a new session, THEN they begin fresh with 100BB stacks while all previous hand history is preserved
- GIVEN multiple sessions exist, WHEN the player views history, THEN sessions are distinguishable with session-level aggregate statistics

### F-011 settings-preferences (P2)
User preferences for game speed (fast/normal/slow BOT action delay), sound effects toggle, and theme selection.

**Acceptance Criteria:**
- GIVEN the settings panel, WHEN the player adjusts game speed, THEN BOT action delay changes accordingly (fast: minimal delay, normal: ~1s, slow: ~2s)
- GIVEN the settings panel, WHEN the player toggles sound, THEN card dealing and chip sounds are enabled or disabled
- GIVEN any preference change, WHEN the player returns to the app later, THEN preferences are preserved

### F-012 hand-strength-indicator (P2)
Optional real-time display of the player's current hand strength relative to the board during active play.

**Acceptance Criteria:**
- GIVEN the player has toggled on the hand strength indicator, WHEN community cards are on the board, THEN a label shows the player's current made hand (e.g., "Top Pair, King Kicker" or "Flush Draw") and approximate equity percentage against a random hand range
- GIVEN the indicator is toggled off, WHEN the player is in a hand, THEN no hand strength information is displayed

## Constraints
- Pure browser-side application: no backend server, no API calls, no user accounts — works entirely offline after initial load
- Data persistence via IndexedDB (primary, for hand history) and localStorage (for user preferences only) — must gracefully handle storage quota limits
- GTO reference strategies are simplified directional heuristics based on precomputed range tables, explicitly NOT solver-grade solutions — must be clearly labeled as such throughout the UI
- Fixed game format: 6-max NL Hold'em, blinds 1/2, 100BB starting stacks — no configurable blind levels or stack depths in MVP
- All game logic (hand evaluation, pot calculation, AI decisions) must run in real-time with no perceptible delay on modern browsers (Chrome 80+, Firefox 80+, Safari 14+, Edge 80+)
- Estimated bundle size must remain under 1MB total including strategy data
- Card randomization must use cryptographically adequate randomness (crypto.getRandomValues) to prevent predictable deck sequences

## Out of Scope
- Real GTO solver integration or solver-grade strategy computation
- Multiplayer / online play with other human players
- Tournament mode (MTT or SIT-n-GO) — cash game only
- Mobile-responsive design or native mobile app
- User account system, authentication, or cloud sync
- HUD (Heads-Up Display) with real-time opponent statistics overlay
- Hand history import/export (PokerStars format, etc.)
- Configurable blind levels or stack depths
- Coaching or lesson content beyond GTO deviation feedback
- Internationalization / multi-language support
