## Validation Summary
- Status: FAIL
- Checks passed: 7/8 (LLM checks; programmatic checks 5–8 run separately)

## Detail

### Check 1: PRD ↔ UX Flows Coverage
- Status: **PASS**
- Coverage: 10/10 features covered
- Missing: none

| Feature | Covering UX Flow(s) |
|---------|---------------------|
| F-001 poker-engine | game-play |
| F-002 bot-ai | game-play |
| F-003 gto-data | game-play, hand-replay-gto-review, stats-dashboard |
| F-004 game-ui | game-play |
| F-005 hand-history | hand-history-browsing |
| F-006 hand-replay | hand-replay-gto-review |
| F-007 ev-analysis | hand-replay-gto-review |
| F-008 stats-dashboard | stats-dashboard |
| F-009 session-management | home-session-management, game-play |
| F-010 data-export | hand-history-browsing, stats-dashboard |

### Check 2: UX Flows ↔ API Endpoints Coverage
- Status: **PASS**
- Coverage: All 5 UX flows have corresponding API endpoints
- Missing: none

| UX Flow | Features | API Endpoints Present |
|---------|----------|-----------------------|
| home-session-management | F-009 | POST/GET/GET/{id}/PATCH/POST end sessions |
| game-play | F-001,F-002,F-003,F-004,F-009 | deal, current, action, bot/decide, gto/*, sessions/* |
| hand-history-browsing | F-005,F-010 | GET/GET/{id}/DELETE hands, export/hands |
| hand-replay-gto-review | F-003,F-006,F-007 | gto/evaluate, hands/{id}/replay, hands/{id}/ev-summary |
| stats-dashboard | F-003,F-008,F-010 | stats/overview, stats/by-*, stats/drilldown, export/stats |

### Check 3: API Models ↔ Components Consumption
- Status: **PASS**
- Coverage: All major API model groups have consuming UI components

| Model Group | Consuming Components |
|-------------|---------------------|
| Card, Player, Action, GameState | PlayingCard, PlayerSeat, ActionPanel, PokerTable, GameTable |
| Session, SessionSummary | RecentSessionCard, SessionConfigModal, SessionSummaryModal, HomePage |
| PotInfo, HandResult | PotDisplay, ShowdownOverlay, ChipStack |
| BotDecisionRequest/Response | PlayerSeat (BOT think animation), GameTable |
| PreflopStrategy, PostflopStrategy, ActionFrequency | GTOFrequencyChart, DecisionPointPanel |
| GTOEvaluation, EVAnalysis | EVAnalysisCard, DeviationBadge, HandSummaryFooter |
| Hand, HandReplay, DecisionPoint, TableSnapshot | HandHistoryCard, HandReplayView, ReplayTableSnapshot, DecisionTimeline |
| OverviewStats, PositionStats, StreetStats, ScenarioStats | OverviewStatsCards, PositionStatsChart, StreetStatsChart, ScenarioRadarChart |
| ExportResult, StatsExportResult | ExportModal, ExportButton |
| ErrorResponse | Toast, ConfirmDialog (engine error modal) |

### Check 4: Naming Consistency
- Status: **PASS**
- No inconsistencies found

Key terminology verified across all artifacts:
- **"session"** — consistent in PRD (F-009), UX flows (home-session-management, game-play), API (/sessions/*), components (SessionConfigModal, SessionPauseModal, etc.), tech-spec (game-service, data-layer, session-ui)
- **"hand"** — consistent across PRD (F-005/F-006), UX flows, API (/hands/*), components (HandHistoryCard, HandReplayView, etc.)
- **"GTO"** — consistent across PRD (F-003), UX flows, API (/gto/*), components (GTOFrequencyChart), tech-spec (gto-data)
- **"replay"** — consistent across PRD (F-006), UX flows (hand-replay-gto-review), API (/hands/{id}/replay), components (ReplayTableSnapshot, HandReplayView)
- **"scenario"** — consistent across UX flows, API (/stats/by-scenario, /stats/drilldown/{scenario}), components (ScenarioTag, ScenarioRadarChart)
- **"deviation"** — consistent in UX interaction rules, components (DeviationBadge), tech-spec (gto-data evaluator)

### Check 5: File Integrity
- Status: FAIL
- Missing files:
  - `screenshots/ActionPanel.png`
  - `screenshots/BetTimeline.png`
  - `screenshots/ShowdownOverlay.png`
  - `screenshots/RecentSessionCard.png`
  - `screenshots/QuickStartPanel.png`
  - `screenshots/HandHistoryCard.png`
  - `screenshots/HandHistoryFilter.png`
  - `screenshots/GTOFrequencyChart.png`
  - `screenshots/EVAnalysisCard.png`
  - `screenshots/DecisionPointPanel.png`
  - `screenshots/ReplayNavBar.png`
  - `screenshots/StreetJumpNav.png`
  - `screenshots/DecisionTimeline.png`
  - `screenshots/HandSummaryFooter.png`
  - `screenshots/TimeRangeSelector.png`
  - `screenshots/OverviewStatsCards.png`
  - `screenshots/PositionStatsChart.png`
  - `screenshots/StreetStatsChart.png`
  - `screenshots/ScenarioRadarChart.png`
  - `screenshots/DrilldownPanel.png`
  - `screenshots/SessionProfitChart.png`
  - `screenshots/SessionConfigModal.png`
  - `screenshots/SessionPauseModal.png`
  - `screenshots/SessionSummaryModal.png`
  - `screenshots/ExportModal.png`
  - `screenshots/PokerTable.png`
  - `screenshots/ReplayTableSnapshot.png`
  - `screenshots/GameTable.png`
  - `screenshots/HandReplayView.png`
  - `screenshots/HandHistoryList.png`
  - `screenshots/StatsDashboard.png`
  - `screenshots/HomePage.png`
  - `screenshots/AppShell.png`

### Check 6: Feature ID Traceability
- Status: PASS
- PRD defines 10 features: F-001, F-002, F-003, F-004, F-005, F-006, F-007, F-008, F-009, F-010
- UX flows cover all 10 features
- API endpoints cover all 10 features
- Components cover all 10 features

### Check 7: Tech-Spec Feature Coverage
- Status: PASS
- Tech-spec modules cover all 10 features

### Check 8: Code Task Coverage
- Status: PASS
- code.manifest.json unreadable — skipped (warning, stage may be skipped)