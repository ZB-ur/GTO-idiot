The React component at `components/table/PokerTableScreen.tsx` implements the full main gameplay screen with:

- **State management** — tracks `HandState`, `LegalActions`, game session, and all overlay states
- **API integration** — consumes `getCurrentHand`, `getLegalActions`, `submitAction`, `dealHand`, `triggerBotAction` from the service layer (matching `api-spec.yaml` contracts)
- **Child composition** — renders `TableLayout` (felt + seats + community cards), `ActionPanel` (fixed bottom action bar), `HandResultBanner` (profit/loss flash), `HandNumberBadge` (top-left badge), `BustedOverlay` (rebuy/end dialog), and `SessionSummaryOverlay` (end-of-session stats)
- **Bot auto-play** — 800ms deliberation delay before triggering bot actions via `useEffect`
- **Hero turn detection** — shows/hides `ActionPanel` based on `currentActorSeatIndex`
- **Consistent styling** — dark theme (`bg-gray-900`), emerald felt accents, same border/shadow patterns as sibling `GameTable`, `ShowdownOverlay`, and `ActionPanel` components