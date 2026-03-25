## Goal
GTO Idiot is a free, browser-based Texas Hold'em GTO strategy trainer that lets beginner players practice against bots at a 6-max cash game table, record hand histories, and review each decision against simplified GTO optimal play — bridging the gap between learning poker rules and understanding GTO strategy, with zero cost and zero setup.

## Target Users
- **Primary persona**: Beginner poker players who have just learned Texas Hold'em rules and want to systematically learn GTO strategy concepts through gameplay. Non-technical, accessing via desktop/mobile browser, no installation tolerance. They don't know what GTO means yet but want to "play like the pros."
- **Secondary persona**: Casual poker players who play recreationally and want a free tool to check whether their decisions align with GTO principles, without committing to expensive training subscriptions.

## Features

### F-001 poker-game-engine (P0)
Core 6-max No-Limit Texas Hold'em cash game engine running entirely in-browser. Manages dealing, blinds (SB/BB), betting rounds (preflop/flop/turn/river), pot calculation, side pots for all-in scenarios, showdown, and winner determination. Fixed blind structure with configurable buy-in.

**Acceptance Criteria:**
- GIVEN the user starts a new game session, WHEN the table loads, THEN 6 seats are shown with the user in one seat and 5 BOTs in the remaining seats, each with a starting chip stack
- GIVEN a hand begins, WHEN cards are dealt, THEN the user receives 2 hole cards face-up and each BOT receives 2 hole cards face-down
- GIVEN a betting round is active, WHEN all players have acted (fold/call/raise/check/all-in), THEN the next street's community cards are dealt or showdown occurs
- GIVEN one or more players are all-in with unequal stacks, WHEN the hand completes, THEN side pots are correctly calculated and awarded to the appropriate winners
- GIVEN only one player remains (all others folded), WHEN the last fold occurs, THEN that player wins the pot without showdown
- GIVEN a showdown occurs, WHEN hands are compared, THEN the best 5-card hand from each player's 2 hole cards + 5 community cards determines the winner(s)
- GIVEN the blind structure is fixed, WHEN a new hand starts, THEN the dealer button rotates clockwise and SB/BB are posted by the correct positions

### F-002 player-actions (P0)
User interface for the human player to make decisions at each decision point: fold, check, call, raise (with amount selection), and all-in.

**Acceptance Criteria:**
- GIVEN it is the user's turn to act, WHEN the action panel appears, THEN only legal actions are enabled (e.g., "check" only when no bet to call; "call" shows the exact amount)
- GIVEN the user wants to raise, WHEN they adjust the raise amount, THEN a slider or input shows min-raise to all-in range and the selected amount is clearly displayed
- GIVEN the user selects an action, WHEN they confirm it, THEN the game engine processes the action and play continues to the next player
- GIVEN it is not the user's turn, WHEN BOTs are acting, THEN the user's action panel is disabled and a visual indicator shows which BOT is deciding

### F-003 bot-ai-difficulty (P0)
Three tiers of BOT opponents — Fish (loose-passive), Regular (tight-aggressive), and GTO (near-optimal) — that the user can configure before starting a session.

**Acceptance Criteria:**
- GIVEN the user is on the game setup screen, WHEN they select BOT difficulty, THEN they can choose from Fish, Regular, or GTO for each BOT or apply one setting to all 5 BOTs
- GIVEN a Fish BOT is in a hand, WHEN it makes decisions, THEN it plays loose-passive: calls too often, rarely raises, folds too infrequently preflop, and makes predictable postflop errors
- GIVEN a Regular BOT is in a hand, WHEN it makes decisions, THEN it plays tight-aggressive: opens a narrower range of hands positionally, c-bets frequently, and folds to aggression with weak holdings
- GIVEN a GTO BOT is in a hand, WHEN it makes decisions, THEN it follows the internal GTO strategy tables for preflop ranges and simplified postflop decision trees with balanced frequencies
- GIVEN BOTs are making decisions, WHEN they act, THEN a brief delay simulates "thinking time" to feel more realistic

### F-004 poker-table-ui (P0)
Visual representation of the 6-max poker table including: card rendering (hole cards and community cards), chip stacks, pot size, dealer button position, player positions (UTG/MP/CO/BTN/SB/BB), and current betting round indicator.

**Acceptance Criteria:**
- GIVEN a game is in progress, WHEN the user views the table, THEN all 6 player positions are displayed in a table layout with seat labels (UTG/MP/CO/BTN/SB/BB), chip counts, and current bet amounts
- GIVEN cards are dealt, WHEN the user views their hand, THEN hole cards are rendered with recognizable suit symbols and rank values in a standard playing card visual style
- GIVEN community cards are dealt, WHEN flop/turn/river appear, THEN cards animate into the center of the table in sequence
- GIVEN a player bets or raises, WHEN chips go into the pot, THEN the pot total is updated and clearly visible at the center of the table
- GIVEN the dealer button rotates, WHEN a new hand starts, THEN the BTN indicator moves to the next position and all position labels update accordingly

### F-005 hand-history-recording (P0)
Automatic recording of every completed hand to localStorage, capturing all decision points, actions taken by all players, community cards, pot sizes, and outcomes.

**Acceptance Criteria:**
- GIVEN a hand completes (showdown or all-fold), WHEN the result is determined, THEN the complete hand history is serialized and saved to localStorage automatically
- GIVEN the user has played multiple sessions, WHEN they open the hand history list, THEN all saved hands are displayed in reverse chronological order with date, hand number, result (won/lost), and profit/loss amount
- GIVEN the user wants to filter history, WHEN they browse the list, THEN they can see summary statistics: total hands played, win rate, total profit/loss
- GIVEN localStorage contains hand data, WHEN the user closes and reopens the browser, THEN all previously saved hands are still available

### F-006 session-stats (P0)
Summary statistics for the current session and overall play history, showing key performance metrics.

**Acceptance Criteria:**
- GIVEN a session is in progress, WHEN the user views session stats, THEN they see: hands played this session, session profit/loss, VPIP% (voluntarily put money in pot), PFR% (preflop raise), and win rate
- GIVEN the user has historical data, WHEN they view overall stats, THEN they see aggregate metrics across all sessions: total hands, overall profit/loss, average GTO deviation score

### F-007 hand-replay-review (P0)
Post-game review mode that replays a selected hand step-by-step through each decision point, showing the board state at each street.

**Acceptance Criteria:**
- GIVEN the user selects a hand from history, WHEN the review screen opens, THEN the hand is displayed at the first decision point (preflop action) with the board state at that moment
- GIVEN the user is reviewing a hand, WHEN they click "next decision," THEN the view advances to the next action point showing the updated board, pot, and player actions taken
- GIVEN the user is reviewing a hand, WHEN they click "previous decision," THEN the view goes back to the prior decision point
- GIVEN the user is reviewing any decision point, WHEN they view the replay, THEN all player actions at that point are visible (who folded, called, raised, and amounts)

### F-008 gto-comparison (P0)
At each decision point in the review, display the user's actual action side-by-side with the GTO-recommended action(s) and their frequencies, plus the EV difference.

**Acceptance Criteria:**
- GIVEN the user is reviewing a decision point where they acted, WHEN the comparison panel shows, THEN it displays: "Your Action: [action]" and "GTO Recommendation: [action(s) with frequency %]"
- GIVEN a preflop decision point, WHEN GTO comparison is shown, THEN the recommendation is based on the preflop range chart for the user's position and hand
- GIVEN a postflop decision point, WHEN GTO comparison is shown, THEN the recommendation is based on simplified postflop heuristics (board texture + pot geometry), clearly labeled as "Simplified GTO Approximation"
- GIVEN an EV difference exists, WHEN the comparison panel shows, THEN the EV delta is displayed (e.g., "+0.5 BB" or "-1.2 BB") with color coding (green for good, red for costly deviations)
- GIVEN the user reviews a full hand, WHEN all decision points are reviewed, THEN a hand summary shows total EV lost/gained vs GTO across all decisions in that hand

### F-009 preflop-range-chart (P1)
Standalone viewable preflop range chart showing GTO opening/calling/3-betting ranges for each of the 6 positions, accessible outside of gameplay as a reference tool.

**Acceptance Criteria:**
- GIVEN the user navigates to the range chart section, WHEN the chart loads, THEN a 13x13 grid of all 169 hand combinations is displayed
- GIVEN the user selects a position (UTG/MP/CO/BTN/SB/BB), WHEN the chart updates, THEN hands are color-coded by recommended action: raise (one color), call (another color), fold (another color) with frequency percentages
- GIVEN the user hovers over a hand combination, WHEN the tooltip appears, THEN it shows the specific action frequencies (e.g., "Raise 85%, Call 10%, Fold 5%") for the selected position
- GIVEN the user is reviewing a hand (F-008), WHEN a preflop decision point is active, THEN a link/button opens the range chart pre-filtered to the relevant position

### F-010 gto-deviation-scoring (P1)
A per-hand and per-session "GTO Deviation Score" that quantifies how far the user's play diverged from GTO, providing a single metric to track improvement over time.

**Acceptance Criteria:**
- GIVEN a hand is reviewed, WHEN the deviation score is calculated, THEN a score from 0-100 is shown (100 = perfect GTO play, 0 = maximum deviation) based on the aggregate EV difference across all decision points
- GIVEN a session is complete, WHEN the user views session stats, THEN an average GTO deviation score for the session is displayed
- GIVEN the user has multiple sessions, WHEN they view their history, THEN a trend of deviation scores over time is visible, showing improvement or regression

### F-011 difficulty-progression-hint (P1)
Based on the user's GTO deviation score trend, suggest when they should graduate to harder BOT opponents.

**Acceptance Criteria:**
- GIVEN the user's average GTO deviation score exceeds a threshold for their current BOT difficulty, WHEN a session ends, THEN a suggestion message appears recommending they try harder BOTs (e.g., "Your GTO score is consistently above 70 against Fish bots — try Regular bots!")
- GIVEN the user is playing against GTO bots with a high deviation score, WHEN a session ends, THEN no further difficulty suggestion is shown (already at max)

### F-012 hand-history-export (P2)
Allow users to export their hand history as a JSON file for backup, and import previously exported data.

**Acceptance Criteria:**
- GIVEN the user clicks "Export History," WHEN the export runs, THEN a JSON file containing all hand history data is downloaded to their device
- GIVEN the user has a previously exported JSON file, WHEN they click "Import History" and select the file, THEN the data is merged into their existing localStorage history without duplicates

### F-013 onboarding-tutorial (P1)
A brief first-time tutorial explaining what GTO is, how the app works, and recommending a starting difficulty.

**Acceptance Criteria:**
- GIVEN a new user opens the app for the first time (no localStorage data), WHEN the app loads, THEN a tutorial overlay appears explaining: what GTO means in plain language, how to play a hand, and how to review afterward
- GIVEN the tutorial is showing, WHEN the user clicks through each step or skips, THEN they land on the game setup screen with Fish difficulty pre-selected
- GIVEN the user has completed the tutorial, WHEN they return to the app, THEN the tutorial does not appear again (remembered in localStorage)

### F-014 game-settings (P1)
Configurable game parameters: blind levels, starting stack size, and game speed.

**Acceptance Criteria:**
- GIVEN the user is on the game setup screen, WHEN they adjust settings, THEN they can configure: blind level (e.g., 1/2, 2/5, 5/10), starting stack (e.g., 100BB, 200BB), and game speed (slow/normal/fast for BOT action delays)
- GIVEN settings are configured, WHEN the game starts, THEN the table uses the selected blind level, stack size, and speed

## Constraints
- Pure frontend web application — no backend server, no database, no API calls
- All data persistence via localStorage only; data is local to the user's browser and device
- GTO strategy data is pre-computed and bundled with the application (preflop range charts as JSON lookup tables; simplified postflop decision trees using board texture classification)
- Postflop GTO recommendations are simplified heuristic approximations, not solver-level computations — this must be clearly communicated to users in the UI
- All game logic (engine, BOT AI, GTO comparison, EV calculation) runs client-side in the browser
- Must support modern browsers (Chrome, Firefox, Safari, Edge) — no exotic APIs required
- localStorage budget: ~5-10MB, sufficient for ~5,000-10,000 hand histories at ~1KB per hand
- Zero-friction onboarding: no account creation, no login, no payment — open the URL and play immediately

## Out of Scope
- Multiplayer online play (real human opponents)
- Tournament formats (SNG, MTT, satellite)
- Real money or virtual currency wagering system
- Native mobile applications (iOS/Android) — web only
- Solver-level precise GTO calculations (real-time or precomputed full game tree)
- Social features (chat, friends list, player profiles)
- Leaderboards or ranking systems
- Hand history import from external poker platforms (e.g., PokerStars HH format)
- Heads-up or other table sizes (9-max, 10-max) — 6-max only
- Advanced statistics (HUD-style overlays, positional breakdowns by opponent)
- Server-side data backup or cloud sync
- Internationalization / multi-language support (MVP is single language)