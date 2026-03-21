// ============================================================
// GTO Idiot — Global Type Definitions
// Derived from the API spec (api-spec.yaml)
// ============================================================

// ---------- Enums / Unions ----------

export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Position = 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';
export type Street = 'preflop' | 'flop' | 'turn' | 'river';
export type ActionType = 'fold' | 'check' | 'call' | 'raise' | 'all_in';
export type BotDifficulty = 'fish' | 'regular' | 'gto';
export type DeviationSeverity = 'minor' | 'moderate' | 'severe';
export type SessionStatus = 'active' | 'paused' | 'completed';
export type HandStatus = 'in_progress' | 'showdown' | 'completed';
export type HandSortOrder = 'newest' | 'oldest' | 'biggest_win' | 'biggest_loss';
export type HandResultFilter = 'win' | 'lose' | 'break_even';
export type PreflopScenario = 'open' | 'vs_open' | 'vs_3bet' | 'vs_4bet';

// ---------- Common ----------

export interface Card {
  rank: Rank;
  suit: Suit;
}

export interface ApiError {
  code: string;
  message: string;
}

// ---------- Session ----------

export interface BotConfig {
  name: string;
  difficulty: BotDifficulty;
}

export interface BlindsConfig {
  small_blind: number;
  big_blind: number;
}

export interface CreateSessionRequest {
  bots: BotConfig[];
  blinds: BlindsConfig;
}

export interface UpdateSessionRequest {
  action: 'pause' | 'resume' | 'end';
}

export interface SessionConfig {
  bots: BotConfig[];
  blinds: BlindsConfig;
  starting_stack: number;
}

export interface Session {
  id: string;
  status: SessionStatus;
  config: SessionConfig;
  hand_count: number;
  current_hand_id: string | null;
  player_stack: number;
  created_at: string;
  updated_at: string;
}

export interface SessionListResponse {
  sessions: Session[];
  total: number;
}

export interface SessionSummary {
  session_id: string;
  hand_count: number;
  net_profit_bb: number;
  duration_minutes: number;
  win_rate: number;
  biggest_pot_hand_id?: string;
  key_deviations: DeviationSummaryItem[];
}

export interface RecoverSessionResponse {
  has_unfinished: boolean;
  session: Session | null;
}

// ---------- Game State ----------

export interface PlayerState {
  seat: number;
  name: string;
  position: Position;
  stack: number;
  hole_cards: Card[] | null;
  is_active: boolean;
  is_all_in: boolean;
  is_bot: boolean;
  current_bet: number;
  total_invested: number;
  last_action: string | null;
}

export interface SidePot {
  amount: number;
  eligible_seats: number[];
}

export interface AvailableAction {
  type: ActionType;
  amount: number | null;
}

export interface HandState {
  id: string;
  session_id: string;
  hand_number: number;
  street: Street;
  pot: number;
  side_pots?: SidePot[];
  community_cards: Card[];
  players: PlayerState[];
  current_player_seat: number | null;
  dealer_seat: number;
  is_user_turn: boolean;
  available_actions: AvailableAction[];
  min_raise: number | null;
  max_raise: number | null;
  status: HandStatus;
}

export interface PlayerActionRequest {
  action: ActionType;
  amount?: number | null;
}

export interface ActionTaken {
  player_seat: number;
  player_name: string;
  action: ActionType;
  amount: number | null;
  street: Street;
}

export interface ShowdownWinner {
  seat: number;
  name: string;
  amount_won: number;
  hand_rank?: string;
}

export interface ShowdownPlayerShown {
  seat: number;
  hole_cards: Card[];
  hand_rank?: string;
}

export interface ShowdownResult {
  winners: ShowdownWinner[];
  players_shown: ShowdownPlayerShown[];
}

export interface ActionResult {
  hand_state: HandState;
  action_taken: ActionTaken;
  hand_complete: boolean;
  showdown: ShowdownResult | null;
  next_actions?: ActionResult[];
}

export interface HandSummary {
  id: string;
  hand_number: number;
  session_id: string;
  date: string;
  position: Position;
  result_bb: number;
  street_reached: Street;
  has_deviation: boolean;
  max_deviation_severity: DeviationSeverity | null;
  hero_hand: Card[] | null;
}

export interface HandListResponse {
  hands: HandSummary[];
  total: number;
}

// ---------- GTO ----------

export interface HandRangeEntry {
  hand: string;
  actions: {
    fold: number;
    call: number;
    raise: number;
  };
}

export interface PreflopRangeTable {
  position: Position;
  scenario: string;
  open_position: Position | null;
  ranges: HandRangeEntry[];
}

export interface ActionRecord {
  seat: number;
  position: Position;
  action: ActionType;
  amount: number | null;
  street: Street;
}

export interface PreflopAdviceRequest {
  position: Position;
  hole_cards: Card[];
  action_history: ActionRecord[];
}

export interface PostflopSolveRequest {
  hero_position: Position;
  hero_cards: Card[];
  community_cards: Card[];
  pot: number;
  effective_stack: number;
  street: Street;
  action_history: ActionRecord[];
  villain_range?: string | null;
}

export interface GTOActionFrequency {
  action: ActionType;
  frequency: number;
  ev: number;
  bet_size: string | null;
}

export interface GTOAdvice {
  actions: GTOActionFrequency[];
  recommended_action: ActionType;
  is_approximate: boolean;
  computation_time_ms?: number;
}

export interface GTOAdviceDegraded extends GTOAdvice {
  is_degraded: true;
  degradation_reason: string;
}

export interface HintResponse {
  hand_id: string;
  street: Street;
  decision_point: number;
  advice: GTOAdvice;
  hint_viewed: boolean;
  is_degraded: boolean;
}

// ---------- Hand History ----------

export interface HandHistoryPlayer {
  seat: number;
  name: string;
  position: Position;
  starting_stack: number;
  ending_stack?: number;
  hole_cards: Card[] | null;
  is_bot: boolean;
  bot_difficulty: BotDifficulty | null;
}

export interface HandHistoryAction {
  sequence: number;
  seat: number;
  player_name: string;
  position: Position;
  street: Street;
  action: ActionType;
  amount: number | null;
  pot_after: number;
  is_hero: boolean;
}

export interface HandResult {
  winners: ShowdownWinner[];
  final_pot: number;
  went_to_showdown: boolean;
}

export interface PotHistory {
  street: Street;
  pot_after: number;
}

export interface HintViewed {
  street: Street;
  decision_point: number;
}

export interface HandHistory {
  id: string;
  session_id: string;
  hand_number: number;
  date: string;
  dealer_seat: number;
  blinds: BlindsConfig;
  players: HandHistoryPlayer[];
  community_cards: Card[];
  actions: HandHistoryAction[];
  pot_history: PotHistory[];
  result: HandResult;
  hero_position: Position;
  hero_result_bb: number;
  hints_viewed: HintViewed[];
}

export interface HandHistoryListResponse {
  hands: HandSummary[];
  total: number;
  has_more: boolean;
}

// ---------- Replay & Deviation ----------

export interface ReplayTableState {
  pot: number;
  community_cards: Card[];
  players: PlayerState[];
}

export interface Deviation {
  decision_point: number;
  street: Street;
  severity: DeviationSeverity;
  hero_action: {
    action: ActionType;
    amount: number | null;
  };
  gto_advice: GTOActionFrequency[];
  frequency_diff: number;
  ev_loss: number;
  description: string;
}

export interface ReplayStep {
  index: number;
  type: 'deal_hole_cards' | 'post_blinds' | 'player_action' | 'deal_community' | 'showdown';
  street: Street;
  table_state: ReplayTableState;
  action: HandHistoryAction | null;
  is_hero_decision: boolean;
  deviation: Deviation | null;
}

export interface ReplayData {
  hand_id: string;
  steps: ReplayStep[];
  total_steps: number;
  street_indices: {
    preflop: number;
    flop: number | null;
    turn: number | null;
    river: number | null;
  };
}

export interface DeviationAnalysis {
  hand_id: string;
  deviations: Deviation[];
  total_ev_loss: number;
  deviation_count: {
    minor: number;
    moderate: number;
    severe: number;
  };
}

export interface DeviationSummaryItem {
  hand_id: string;
  hand_number?: number;
  street: Street;
  severity: DeviationSeverity;
  description: string;
  ev_loss: number;
}

// ---------- Statistics ----------

export interface StatsSummary {
  total_hands: number;
  win_rate: number;
  net_profit_bb: number;
  bb_per_100: number;
  sessions_count: number;
  avg_hands_per_session: number;
}

export interface ProfitDataPoint {
  x: number;
  y: number;
  hand_id?: string;
  session_id?: string;
}

export interface ProfitCurveResponse {
  data_points: ProfitDataPoint[];
}

export interface KeyMetrics {
  vpip: number;
  pfr: number;
  three_bet: number;
  wtsd: number;
  won_at_showdown: number;
  aggression_factor: number;
  cbet_flop?: number;
  fold_to_cbet?: number;
}

export interface TopDeviationEntry {
  type: string;
  count: number;
  total_ev_loss: number;
  avg_severity: DeviationSeverity;
  example_hand_ids: string[];
}

export interface TopDeviationsResponse {
  deviations: TopDeviationEntry[];
}

export interface PositionStat {
  position: Position;
  hands: number;
  net_profit_bb: number;
  bb_per_100?: number;
  vpip?: number;
  pfr?: number;
}

export interface PositionStatsResponse {
  positions: PositionStat[];
}

// ---------- Utility Types ----------

/** Compact card notation, e.g. "As" for Ace of spades */
export type CardNotation = string;

/** 169 starting hand notation, e.g. "AKs", "QTo", "88" */
export type StartingHand = string;

/** UUID string */
export type UUID = string;
