## Goal
A poker GTO strategy practice application called "GTO Idiot" that lets intermediate poker players play full 6-max No-Limit Hold'em sessions against AI bots, track their results over time, and review each hand post-session with side-by-side GTO strategy comparison — bridging the gap between raw solvers and isolated spot drills.

## Target Users
- **Primary persona:** Intermediate Texas Hold'em players (1-3 years experience) who understand basic poker concepts (position, pot odds, hand ranges) but want to improve their game toward GTO-optimal play. Comfortable with web applications, play online poker regularly, and seek structured practice without the cost or complexity of premium solvers. May be English or Chinese speaking.
- **Secondary persona:** Advanced recreational players who want a quick, game-like way to warm up or test specific strategies against different opponent types before real sessions.

## Features

### F-001 poker-game-engine (P0)
A complete 6-max No-Limit Hold'em game engine that manages the deck, dealing, blinds, betting rounds (preflop, flop, turn, river), pot calculation including side pots, and showdown logic.

**Acceptance Criteria:**
- GIVEN a new hand starts, WHEN cards are dealt, THEN each of the 6 seats receives 2 hole cards and community cards are dealt progressively across rounds
- GIVEN a betting round, WHEN a player acts, THEN only legal actions are available (fold, check, call, bet, raise, all-in) based on current game state
- GIVEN one or more players are all-in with unequal stacks, WHEN the hand reaches showdown, THEN side pots are calculated correctly and awarded to the appropriate winners
- GIVEN all betting is complete or all but one player has folded, WHEN the hand ends, THEN the pot is awarded to the correct winner(s) including split pot scenarios
- GIVEN a 6-max table, WHEN positions rotate each hand, THEN dealer button, small blind, and big blind rotate correctly clockwise

### F-002 bot-opponents (P0)
AI bot opponents that fill the remaining 5 seats at the 6-max table, each with a distinct and consistent play style that feels like a real opponent.

**Acceptance Criteria:**
- GIVEN a 6-max table, WHEN a session starts, THEN 5 bot opponents are seated with assigned play style profiles
- GIVEN a bot with a TAG (Tight-Aggressive) profile, WHEN it acts preflop, THEN it plays a narrow range of hands but bets/raises aggressively with those hands
- GIVEN a bot with a LAG (Loose-Aggressive) profile, WHEN it acts, THEN it plays a wider range of hands with frequent aggression
- GIVEN a bot with a Fish (Loose-Passive) profile, WHEN it acts, THEN it calls too often and rarely raises
- GIVEN a bot with a Nit (Ultra-Tight) profile, WHEN it acts, THEN it only plays premium hands
- GIVEN a bot with a Maniac profile, WHEN it acts, THEN it bets and raises with a very wide range including many bluffs
- GIVEN any bot, WHEN it makes a decision, THEN the action includes appropriate randomization to avoid deterministic, exploitable patterns

### F-003 game-session-flow (P0)
The user can start, play through, and end a continuous multi-hand poker session against bots, experiencing a flow similar to a real online poker session.

**Acceptance Criteria:**
- GIVEN the user is on the home screen, WHEN they click "Start Session", THEN a new 6-max table is created with the user seated and 5 bots assigned
- GIVEN a session is active, WHEN a hand completes, THEN the next hand begins automatically with rotated positions
- GIVEN a session is active, WHEN the user clicks "End Session", THEN the session concludes and all hand data is saved for review
- GIVEN a session is active, WHEN it is the user's turn to act, THEN available actions are clearly displayed with the required amounts (call amount, min raise, pot-size bet)
- GIVEN a session is active, WHEN community cards are revealed, THEN they appear with a clear visual progression (flop shows 3 cards, turn adds 1, river adds 1)

### F-004 hand-history-recording (P0)
Every hand played is recorded with full game state at each decision point, enabling post-session replay and analysis.

**Acceptance Criteria:**
- GIVEN a hand is played, WHEN any action occurs (deal, bet, fold, etc.), THEN the complete game state is captured (player cards, community cards, pot size, stack sizes, action taken)
- GIVEN a session ends, WHEN the user navigates to hand history, THEN all hands from the session are listed with summary info (hand number, result, amount won/lost)
- GIVEN a completed session, WHEN the user selects a specific hand, THEN the full action sequence is displayed with all game states at each decision point

### F-005 hand-replay (P0)
A step-by-step hand replay interface that allows the user to walk through each decision point of a completed hand.

**Acceptance Criteria:**
- GIVEN the user selects a hand for replay, WHEN the replay loads, THEN the hand starts from the initial deal state
- GIVEN the user is in replay mode, WHEN they click "Next", THEN the game state advances to the next action/event in the hand
- GIVEN the user is in replay mode, WHEN they click "Previous", THEN the game state returns to the prior action/event
- GIVEN the user is in replay mode at a decision point, THEN the actual action taken is highlighted along with the pot size, stack sizes, and position context

### F-006 gto-comparison (P0)
At each user decision point during replay, display the GTO-recommended action alongside the user's actual action for comparison.

**Acceptance Criteria:**
- GIVEN the user is replaying a hand at a preflop decision point, WHEN GTO data is available for that spot, THEN the recommended preflop action (fold/call/raise) with frequencies is displayed alongside the user's actual action
- GIVEN the user is replaying a hand at a postflop decision point, WHEN simplified GTO guidance is available, THEN an approximate recommended action category (bet/check/fold with frequencies) is displayed, clearly labeled as "Approximate GTO"
- GIVEN the user's action matched the GTO recommendation, WHEN displayed in replay, THEN it is visually indicated as aligned (e.g., green highlight)
- GIVEN the user's action deviated from the GTO recommendation, WHEN displayed in replay, THEN it is visually indicated as a deviation (e.g., red/orange highlight) with the recommended alternative shown

### F-007 preflop-range-matrix (P0)
A 13x13 hand matrix visualization showing preflop ranges, used in GTO reference display and hand review.

**Acceptance Criteria:**
- GIVEN the user views a preflop GTO reference, WHEN a position and action scenario is selected, THEN a 13x13 matrix displays the recommended range with color-coded action frequencies (raise/call/fold)
- GIVEN the user is in hand replay at a preflop decision, WHEN they view the GTO overlay, THEN the range matrix highlights the user's specific hand within the recommended range
- GIVEN the range matrix is displayed, WHEN the user hovers over a cell, THEN the exact hand combination and action frequencies are shown (e.g., "AKs: Raise 85%, Call 15%")

### F-008 session-statistics (P1)
A statistics dashboard showing performance metrics across sessions, helping users identify trends and leaks in their play.

**Acceptance Criteria:**
- GIVEN the user navigates to the statistics page, WHEN sessions have been played, THEN a bankroll graph over time is displayed showing cumulative results
- GIVEN session data exists, WHEN the user views statistics, THEN per-position stats are shown (win rate from UTG, MP, CO, BTN, SB, BB)
- GIVEN session data exists, WHEN the user views statistics, THEN key metrics are displayed: total hands played, overall win rate (BB/100), VPIP, PFR, aggression factor
- GIVEN sufficient session data exists, WHEN the user views statistics, THEN a "Biggest Leaks" section identifies the top 3 areas where the user deviates most from GTO (e.g., "Folding too much from BB to steals", "Not c-betting enough on dry boards")

### F-009 session-summary (P1)
An end-of-session summary showing key results and notable hands before the user dives into detailed replay.

**Acceptance Criteria:**
- GIVEN a session has just ended, WHEN the summary screen appears, THEN it shows: total hands played, net result (chips won/lost), biggest winning hand, biggest losing hand, and overall GTO alignment score (percentage of decisions matching GTO)
- GIVEN a session summary is displayed, WHEN the user clicks on a notable hand, THEN they are taken directly to the replay for that hand

### F-010 gto-reference-browser (P1)
A standalone section where users can browse GTO preflop ranges by position, stack depth, and scenario without playing a hand.

**Acceptance Criteria:**
- GIVEN the user navigates to the GTO Reference section, WHEN they select a position (UTG through BB), THEN the recommended opening range is displayed as a 13x13 matrix
- GIVEN a position is selected, WHEN the user selects a scenario (e.g., "Facing 3-bet"), THEN the matrix updates to show the appropriate range for that scenario
- GIVEN a range is displayed, WHEN the user views it, THEN action frequencies are color-coded (raise = one color, call = another, fold = another)

### F-011 bot-profile-selection (P1)
Allow users to configure which bot profiles sit at their table before starting a session.

**Acceptance Criteria:**
- GIVEN the user is on the session setup screen, WHEN they configure the table, THEN they can assign a play style (TAG, LAG, Fish, Nit, Maniac) to each of the 5 bot seats
- GIVEN the user does not customize bots, WHEN they start a session, THEN a default mix of bot profiles is assigned automatically

### F-012 data-persistence (P0)
All session data, hand histories, and statistics persist locally across browser sessions.

**Acceptance Criteria:**
- GIVEN the user has played sessions, WHEN they close and reopen the browser, THEN all previous session data, hand histories, and statistics are preserved
- GIVEN data is stored locally, WHEN the storage is accessed, THEN no data is sent to any external server

### F-013 table-ui (P0)
A visual poker table interface showing player seats, cards, chips, pot, and community cards in a clear and readable layout.

**Acceptance Criteria:**
- GIVEN a session is active, WHEN the table is displayed, THEN all 6 seats are visible with player names, stack sizes, and position labels (BTN, SB, BB, UTG, MP, CO)
- GIVEN cards are dealt, WHEN the user views the table, THEN hole cards are displayed face-up for the user and face-down for bots (until showdown)
- GIVEN a player takes an action, WHEN it occurs, THEN the action and amount are visually indicated at the player's seat
- GIVEN a pot exists, WHEN displayed, THEN the current pot size is clearly visible at the center of the table

### F-014 i18n-support (P2)
Support for English and Chinese language interfaces.

**Acceptance Criteria:**
- GIVEN the user selects Chinese language, WHEN they navigate the application, THEN all UI text, labels, and messages appear in Chinese
- GIVEN the user selects English language, WHEN they navigate the application, THEN all UI text, labels, and messages appear in English

### F-015 session-configuration (P1)
Allow users to configure basic session parameters before starting.

**Acceptance Criteria:**
- GIVEN the user is starting a new session, WHEN they reach the setup screen, THEN they can configure starting stack size (in big blinds, e.g., 100BB)
- GIVEN the user is starting a new session, WHEN they reach the setup screen, THEN they can configure blind levels

## Constraints
- **6-max only:** The application supports exactly 6-player tables. No heads-up, full-ring, or other table sizes.
- **No-Limit Hold'em only:** No other poker variants (PLO, Stud, etc.).
- **Cash game format only:** No tournament, Sit & Go, or Spin & Go formats. No blind level increases.
- **Postflop GTO is approximate:** Postflop GTO guidance uses simplified hand strength categories and standard frequencies, not exact solver computations. Must be clearly labeled as "Approximate GTO" in the UI.
- **Preflop GTO is exact:** Preflop ranges use established, well-documented GTO solutions sourced from open data.
- **Client-side only:** All computation and data storage happens in the browser. No server-side backend required for MVP.
- **Local data only:** User data is stored locally (browser storage). No accounts, no cloud sync, no data sharing.
- **Single table:** User plays one table at a time. No multi-tabling.

## Out of Scope
- **Real-money play or gambling functionality** — this is a practice tool only
- **Multiplayer / online play against other humans** — bots only for MVP
- **Tournament / SNG / MTT formats** — cash game only
- **Other poker variants** (PLO, Short Deck, Stud, etc.)
- **Exact postflop GTO solver computations** — deferred to post-MVP; MVP uses approximate guidance
- **User accounts, authentication, or cloud storage** — all data is local
- **Mobile-native app** — web-based only (responsive design is acceptable but not required)
- **Hand import/export** from other poker tools or formats (e.g., PokerStars hand history)
- **Spot-by-spot drilling mode** — deferred to post-MVP (full session play is the MVP differentiator)
- **Custom range editing** — users cannot modify GTO reference ranges in MVP
- **Multi-tabling** — single table only
- **Heads-up or full-ring table sizes** — 6-max only
