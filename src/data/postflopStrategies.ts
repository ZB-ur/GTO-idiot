import type { PostflopStrategyData, PostflopGtoResult } from '../types';

// Helper to build a PostflopGtoResult entry
function entry(
  boardTexture: PostflopGtoResult['boardTexture'],
  position: PostflopGtoResult['position'],
  sprRange: PostflopGtoResult['sprRange'],
  street: PostflopGtoResult['street'],
  facingAction: PostflopGtoResult['facingAction'],
  recommendedActions: PostflopGtoResult['recommendedActions'],
  keyPrinciple: string,
  keyPrincipleZh: string
): PostflopGtoResult {
  return {
    boardTexture,
    position,
    sprRange,
    street,
    facingAction,
    recommendedActions,
    keyPrinciple,
    keyPrincipleZh,
    isSimplified: true,
  };
}

// ──────────────────────────── DRY BOARD STRATEGIES ────────────────────────────

const dryIpHighFlopFirst = entry('dry', 'IP', 'high', 'flop', 'first_to_act', [
  { actionType: 'bet', frequency: 0.65, sizing: '1/3 pot' },
  { actionType: 'check', frequency: 0.35 },
], 'Bet small and frequently on dry boards when in position', '有位置时在干燥牌面小额高频下注');

const dryIpHighFlopFacingBet = entry('dry', 'IP', 'high', 'flop', 'facing_bet', [
  { actionType: 'call', frequency: 0.50 },
  { actionType: 'raise', frequency: 0.15, sizing: '3x' },
  { actionType: 'fold', frequency: 0.35 },
], 'Call with draws and medium pairs; raise with strong hands and some bluffs', '用听牌和中等对子跟注；用强牌和部分诈唬加注');

const dryIpHighFlopFacingRaise = entry('dry', 'IP', 'high', 'flop', 'facing_raise', [
  { actionType: 'call', frequency: 0.40 },
  { actionType: 'fold', frequency: 0.50 },
  { actionType: 'raise', frequency: 0.10, sizing: 'all-in' },
], 'Narrow your continuing range against raises on dry boards', '面对干燥牌面加注时收紧继续范围');

const dryIpHighTurnFirst = entry('dry', 'IP', 'high', 'turn', 'first_to_act', [
  { actionType: 'bet', frequency: 0.55, sizing: '2/3 pot' },
  { actionType: 'check', frequency: 0.45 },
], 'Continue betting with value hands; check back some medium strength', '用价值手牌继续下注；部分中等牌力过牌');

const dryIpHighTurnFacingBet = entry('dry', 'IP', 'high', 'turn', 'facing_bet', [
  { actionType: 'call', frequency: 0.45 },
  { actionType: 'fold', frequency: 0.40 },
  { actionType: 'raise', frequency: 0.15, sizing: '2.5x' },
], 'Turn ranges narrow; call with good draws and top pairs', '转牌范围收紧；用好的听牌和顶对跟注');

const dryIpHighRiverFirst = entry('dry', 'IP', 'high', 'river', 'first_to_act', [
  { actionType: 'bet', frequency: 0.45, sizing: '2/3 pot' },
  { actionType: 'check', frequency: 0.55 },
], 'Value bet strong hands; check medium strength hands for showdown', '用强牌价值下注；中等牌力过牌摊牌');

const dryIpHighRiverFacingBet = entry('dry', 'IP', 'high', 'river', 'facing_bet', [
  { actionType: 'call', frequency: 0.35 },
  { actionType: 'fold', frequency: 0.55 },
  { actionType: 'raise', frequency: 0.10, sizing: '2.5x' },
], 'Call with bluff catchers; fold weak hands facing river bets', '用抓诈牌跟注；面对河牌下注弃掉弱牌');

const dryIpMedFlopFirst = entry('dry', 'IP', 'medium', 'flop', 'first_to_act', [
  { actionType: 'bet', frequency: 0.60, sizing: '1/3 pot' },
  { actionType: 'check', frequency: 0.40 },
], 'C-bet frequently with small sizing on dry boards', '干燥牌面高频小额持续下注');

const dryIpMedFlopFacingBet = entry('dry', 'IP', 'medium', 'flop', 'facing_bet', [
  { actionType: 'call', frequency: 0.50 },
  { actionType: 'raise', frequency: 0.15, sizing: '3x' },
  { actionType: 'fold', frequency: 0.35 },
], 'Defend wider in position against c-bets on dry boards', '有位置时对干燥牌面持续下注宽防守');

const dryIpMedTurnFirst = entry('dry', 'IP', 'medium', 'turn', 'first_to_act', [
  { actionType: 'bet', frequency: 0.50, sizing: '1/2 pot' },
  { actionType: 'check', frequency: 0.50 },
], 'Polarize your betting range on the turn', '转牌极化你的下注范围');

const dryIpMedRiverFirst = entry('dry', 'IP', 'medium', 'river', 'first_to_act', [
  { actionType: 'bet', frequency: 0.40, sizing: '2/3 pot' },
  { actionType: 'check', frequency: 0.60 },
], 'Bet for value or bluff; check medium strength', '价值下注或诈唬；中等牌力过牌');

const dryIpLowFlopFirst = entry('dry', 'IP', 'low', 'flop', 'first_to_act', [
  { actionType: 'bet', frequency: 0.50, sizing: '1/3 pot' },
  { actionType: 'check', frequency: 0.30 },
  { actionType: 'all_in', frequency: 0.20 },
], 'With low SPR, consider committing with strong hands', '低SPR时考虑用强牌全部投入');

const dryOopHighFlopFirst = entry('dry', 'OOP', 'high', 'flop', 'first_to_act', [
  { actionType: 'check', frequency: 0.70 },
  { actionType: 'bet', frequency: 0.30, sizing: '1/3 pot' },
], 'Check frequently out of position on dry boards; bet selectively', '没位置在干燥牌面高频过牌；选择性下注');

const dryOopHighFlopFacingBet = entry('dry', 'OOP', 'high', 'flop', 'facing_bet', [
  { actionType: 'call', frequency: 0.45 },
  { actionType: 'fold', frequency: 0.40 },
  { actionType: 'raise', frequency: 0.15, sizing: '3x' },
], 'Defend with pairs and draws; check-raise for value and bluffs', '用对子和听牌防守；过牌加注用于价值和诈唬');

const dryOopHighTurnFirst = entry('dry', 'OOP', 'high', 'turn', 'first_to_act', [
  { actionType: 'check', frequency: 0.65 },
  { actionType: 'bet', frequency: 0.35, sizing: '1/2 pot' },
], 'Continue to play defensively OOP; lead with strong hands occasionally', '没位置继续防守；偶尔用强牌领先下注');

const dryOopHighRiverFirst = entry('dry', 'OOP', 'high', 'river', 'first_to_act', [
  { actionType: 'check', frequency: 0.60 },
  { actionType: 'bet', frequency: 0.40, sizing: '2/3 pot' },
], 'Block bet or check to induce; value bet strong holdings', '阻断下注或过牌诱导；用强牌价值下注');

const dryOopMedFlopFirst = entry('dry', 'OOP', 'medium', 'flop', 'first_to_act', [
  { actionType: 'check', frequency: 0.65 },
  { actionType: 'bet', frequency: 0.35, sizing: '1/3 pot' },
], 'Check more often OOP on dry boards with medium SPR', '中SPR没位置时在干燥牌面更多过牌');

const dryOopLowFlopFirst = entry('dry', 'OOP', 'low', 'flop', 'first_to_act', [
  { actionType: 'check', frequency: 0.50 },
  { actionType: 'all_in', frequency: 0.25 },
  { actionType: 'bet', frequency: 0.25, sizing: '1/2 pot' },
], 'Low SPR OOP: check-shove strong hands or bet small', '低SPR没位置：强牌过牌全下或小额下注');

// ──────────────────────────── WET BOARD STRATEGIES ────────────────────────────

const wetIpHighFlopFirst = entry('wet', 'IP', 'high', 'flop', 'first_to_act', [
  { actionType: 'bet', frequency: 0.50, sizing: '2/3 pot' },
  { actionType: 'check', frequency: 0.50 },
], 'On wet boards, use larger sizing but lower frequency', '在湿润牌面使用更大尺寸但更低频率');

const wetIpHighFlopFacingBet = entry('wet', 'IP', 'high', 'flop', 'facing_bet', [
  { actionType: 'call', frequency: 0.50 },
  { actionType: 'raise', frequency: 0.20, sizing: '3x' },
  { actionType: 'fold', frequency: 0.30 },
], 'Raise more with strong draws and sets on wet boards', '在湿润牌面用强听牌和三条更多加注');

const wetIpHighTurnFirst = entry('wet', 'IP', 'high', 'turn', 'first_to_act', [
  { actionType: 'bet', frequency: 0.50, sizing: '2/3 pot' },
  { actionType: 'check', frequency: 0.50 },
], 'Continue betting draws that picked up equity; check back weak draws', '继续下注获得了赢率的听牌；弱听牌过牌');

const wetIpHighTurnFacingBet = entry('wet', 'IP', 'high', 'turn', 'facing_bet', [
  { actionType: 'call', frequency: 0.40 },
  { actionType: 'fold', frequency: 0.45 },
  { actionType: 'raise', frequency: 0.15, sizing: '2.5x' },
], 'Be more selective continuing on wet turn cards', '在湿润转牌更有选择地继续');

const wetIpHighRiverFirst = entry('wet', 'IP', 'high', 'river', 'first_to_act', [
  { actionType: 'bet', frequency: 0.50, sizing: '3/4 pot' },
  { actionType: 'check', frequency: 0.50 },
], 'Bet polarized: strong value or missed draws as bluffs', '极化下注：强价值或未中听牌作为诈唬');

const wetIpMedFlopFirst = entry('wet', 'IP', 'medium', 'flop', 'first_to_act', [
  { actionType: 'bet', frequency: 0.45, sizing: '1/2 pot' },
  { actionType: 'check', frequency: 0.55 },
], 'Medium SPR wet boards: bet with draws and made hands', '中SPR湿润牌面：用听牌和成手牌下注');

const wetIpLowFlopFirst = entry('wet', 'IP', 'low', 'flop', 'first_to_act', [
  { actionType: 'all_in', frequency: 0.30 },
  { actionType: 'bet', frequency: 0.35, sizing: '1/2 pot' },
  { actionType: 'check', frequency: 0.35 },
], 'Low SPR wet: consider shoving with strong hands and combo draws', '低SPR湿润：考虑用强牌和组合听牌全下');

const wetOopHighFlopFirst = entry('wet', 'OOP', 'high', 'flop', 'first_to_act', [
  { actionType: 'check', frequency: 0.60 },
  { actionType: 'bet', frequency: 0.40, sizing: '1/2 pot' },
], 'OOP on wet boards: donk bet more with strong draws and sets', '没位置在湿润牌面：用强听牌和三条更多领先下注');

const wetOopHighFlopFacingBet = entry('wet', 'OOP', 'high', 'flop', 'facing_bet', [
  { actionType: 'call', frequency: 0.40 },
  { actionType: 'raise', frequency: 0.25, sizing: '3x' },
  { actionType: 'fold', frequency: 0.35 },
], 'Check-raise more aggressively on wet boards with draws', '在湿润牌面用听牌更积极地过牌加注');

const wetOopHighTurnFirst = entry('wet', 'OOP', 'high', 'turn', 'first_to_act', [
  { actionType: 'check', frequency: 0.55 },
  { actionType: 'bet', frequency: 0.45, sizing: '2/3 pot' },
], 'Lead turn with strong hands that need protection on wet boards', '在湿润牌面用需要保护的强牌领先下注转牌');

const wetOopHighRiverFirst = entry('wet', 'OOP', 'high', 'river', 'first_to_act', [
  { actionType: 'check', frequency: 0.55 },
  { actionType: 'bet', frequency: 0.45, sizing: '2/3 pot' },
], 'Block bet or check-call on wet rivers; avoid check-folding strong hands', '在湿润河牌阻断下注或过牌跟注；避免过牌弃牌强牌');

const wetOopMedFlopFirst = entry('wet', 'OOP', 'medium', 'flop', 'first_to_act', [
  { actionType: 'check', frequency: 0.55 },
  { actionType: 'bet', frequency: 0.45, sizing: '1/2 pot' },
], 'Medium SPR OOP: donk bet more on wet textures', '中SPR没位置：在湿润牌面更多领先下注');

const wetOopLowFlopFirst = entry('wet', 'OOP', 'low', 'flop', 'first_to_act', [
  { actionType: 'check', frequency: 0.40 },
  { actionType: 'all_in', frequency: 0.35 },
  { actionType: 'bet', frequency: 0.25, sizing: '1/2 pot' },
], 'Low SPR OOP wet: check-shove draws and strong hands', '低SPR没位置湿润：过牌全下听牌和强牌');

// ──────────────────────────── MONOTONE BOARD STRATEGIES ────────────────────────────

const monoIpHighFlopFirst = entry('monotone', 'IP', 'high', 'flop', 'first_to_act', [
  { actionType: 'check', frequency: 0.55 },
  { actionType: 'bet', frequency: 0.45, sizing: '1/3 pot' },
], 'On monotone boards, check more often; nut flush advantage matters', '在同花牌面更多过牌；坚果同花优势很重要');

const monoIpHighFlopFacingBet = entry('monotone', 'IP', 'high', 'flop', 'facing_bet', [
  { actionType: 'call', frequency: 0.45 },
  { actionType: 'fold', frequency: 0.40 },
  { actionType: 'raise', frequency: 0.15, sizing: '3x' },
], 'Call with flush draws and strong pairs; raise with made flushes', '用同花听牌和强对子跟注；用成花加注');

const monoIpHighTurnFirst = entry('monotone', 'IP', 'high', 'turn', 'first_to_act', [
  { actionType: 'bet', frequency: 0.45, sizing: '1/2 pot' },
  { actionType: 'check', frequency: 0.55 },
], 'Bet with flushes and strong hands; check back one-card draws', '用同花和强牌下注；单张听牌过牌');

const monoIpHighRiverFirst = entry('monotone', 'IP', 'high', 'river', 'first_to_act', [
  { actionType: 'bet', frequency: 0.40, sizing: '2/3 pot' },
  { actionType: 'check', frequency: 0.60 },
], 'Value bet flushes; careful with non-flush strong hands', '用同花价值下注；非同花强牌要小心');

const monoIpMedFlopFirst = entry('monotone', 'IP', 'medium', 'flop', 'first_to_act', [
  { actionType: 'check', frequency: 0.50 },
  { actionType: 'bet', frequency: 0.50, sizing: '1/3 pot' },
], 'Medium SPR monotone: balance between betting and checking', '中SPR同花牌面：平衡下注和过牌');

const monoIpLowFlopFirst = entry('monotone', 'IP', 'low', 'flop', 'first_to_act', [
  { actionType: 'all_in', frequency: 0.25 },
  { actionType: 'bet', frequency: 0.35, sizing: '1/2 pot' },
  { actionType: 'check', frequency: 0.40 },
], 'Low SPR monotone: commit with flushes and nut draws', '低SPR同花牌面：用同花和坚果听牌投入');

const monoOopHighFlopFirst = entry('monotone', 'OOP', 'high', 'flop', 'first_to_act', [
  { actionType: 'check', frequency: 0.70 },
  { actionType: 'bet', frequency: 0.30, sizing: '1/3 pot' },
], 'Check frequently OOP on monotone boards; protect checking range', '没位置在同花牌面高频过牌；保护过牌范围');

const monoOopHighFlopFacingBet = entry('monotone', 'OOP', 'high', 'flop', 'facing_bet', [
  { actionType: 'call', frequency: 0.40 },
  { actionType: 'fold', frequency: 0.40 },
  { actionType: 'raise', frequency: 0.20, sizing: '3x' },
], 'Check-raise with nut flushes and strong draws OOP', '没位置用坚果同花和强听牌过牌加注');

const monoOopHighTurnFirst = entry('monotone', 'OOP', 'high', 'turn', 'first_to_act', [
  { actionType: 'check', frequency: 0.60 },
  { actionType: 'bet', frequency: 0.40, sizing: '1/2 pot' },
], 'OOP turn on monotone: lead with flushes, check most other hands', '没位置同花牌面转牌：用同花领先下注，其他多数过牌');

const monoOopHighRiverFirst = entry('monotone', 'OOP', 'high', 'river', 'first_to_act', [
  { actionType: 'check', frequency: 0.55 },
  { actionType: 'bet', frequency: 0.45, sizing: '2/3 pot' },
], 'Block bet non-nut flushes; value bet the nuts', '非坚果同花阻断下注；坚果同花价值下注');

const monoOopMedFlopFirst = entry('monotone', 'OOP', 'medium', 'flop', 'first_to_act', [
  { actionType: 'check', frequency: 0.65 },
  { actionType: 'bet', frequency: 0.35, sizing: '1/3 pot' },
], 'Medium SPR OOP monotone: keep checking range strong', '中SPR没位置同花牌面：保持过牌范围强度');

const monoOopLowFlopFirst = entry('monotone', 'OOP', 'low', 'flop', 'first_to_act', [
  { actionType: 'check', frequency: 0.45 },
  { actionType: 'all_in', frequency: 0.30 },
  { actionType: 'bet', frequency: 0.25, sizing: '1/2 pot' },
], 'Low SPR OOP monotone: check-shove flushes and nut draws', '低SPR没位置同花牌面：用同花和坚果听牌过牌全下');

// ──────────────────────────── Fill missing facing_bet/facing_raise with defaults ────────────────────────────

function facingBetDefault(
  bt: PostflopGtoResult['boardTexture'],
  pos: PostflopGtoResult['position'],
  spr: PostflopGtoResult['sprRange'],
  st: PostflopGtoResult['street']
): PostflopGtoResult {
  return entry(bt, pos, spr, st, 'facing_bet', [
    { actionType: 'call', frequency: 0.45 },
    { actionType: 'fold', frequency: 0.40 },
    { actionType: 'raise', frequency: 0.15, sizing: '3x' },
  ], 'Call with medium+ strength; fold weak hands', '中等以上牌力跟注；弃掉弱牌');
}

function facingRaiseDefault(
  bt: PostflopGtoResult['boardTexture'],
  pos: PostflopGtoResult['position'],
  spr: PostflopGtoResult['sprRange'],
  st: PostflopGtoResult['street']
): PostflopGtoResult {
  return entry(bt, pos, spr, st, 'facing_raise', [
    { actionType: 'call', frequency: 0.35 },
    { actionType: 'fold', frequency: 0.55 },
    { actionType: 'raise', frequency: 0.10, sizing: 'all-in' },
  ], 'Narrow your continuing range against raises', '面对加注时收紧继续范围');
}

// ──────────────────────────── Build the full lookup table ────────────────────────────

type BT = PostflopGtoResult['boardTexture'];
type RP = PostflopGtoResult['position'];
type SPR = PostflopGtoResult['sprRange'];
type ST = PostflopGtoResult['street'];
type FA = PostflopGtoResult['facingAction'];

function buildTable(): PostflopStrategyData {
  const data: PostflopStrategyData = {};

  // Register all explicitly defined entries
  const explicit: PostflopGtoResult[] = [
    dryIpHighFlopFirst, dryIpHighFlopFacingBet, dryIpHighFlopFacingRaise,
    dryIpHighTurnFirst, dryIpHighTurnFacingBet,
    dryIpHighRiverFirst, dryIpHighRiverFacingBet,
    dryIpMedFlopFirst, dryIpMedFlopFacingBet, dryIpMedTurnFirst, dryIpMedRiverFirst,
    dryIpLowFlopFirst,
    dryOopHighFlopFirst, dryOopHighFlopFacingBet, dryOopHighTurnFirst, dryOopHighRiverFirst,
    dryOopMedFlopFirst, dryOopLowFlopFirst,
    wetIpHighFlopFirst, wetIpHighFlopFacingBet, wetIpHighTurnFirst, wetIpHighTurnFacingBet,
    wetIpHighRiverFirst, wetIpMedFlopFirst, wetIpLowFlopFirst,
    wetOopHighFlopFirst, wetOopHighFlopFacingBet, wetOopHighTurnFirst, wetOopHighRiverFirst,
    wetOopMedFlopFirst, wetOopLowFlopFirst,
    monoIpHighFlopFirst, monoIpHighFlopFacingBet, monoIpHighTurnFirst, monoIpHighRiverFirst,
    monoIpMedFlopFirst, monoIpLowFlopFirst,
    monoOopHighFlopFirst, monoOopHighFlopFacingBet, monoOopHighTurnFirst, monoOopHighRiverFirst,
    monoOopMedFlopFirst, monoOopLowFlopFirst,
  ];

  for (const e of explicit) {
    setEntry(data, e);
  }

  // Fill all remaining gaps with sensible defaults
  const boardTextures: BT[] = ['dry', 'wet', 'monotone'];
  const positions: RP[] = ['IP', 'OOP'];
  const sprRanges: SPR[] = ['low', 'medium', 'high'];
  const streets: ST[] = ['flop', 'turn', 'river'];
  const facingActions: FA[] = ['first_to_act', 'facing_bet', 'facing_raise'];

  for (const bt of boardTextures) {
    for (const pos of positions) {
      for (const spr of sprRanges) {
        for (const st of streets) {
          for (const fa of facingActions) {
            if (!getEntry(data, bt, pos, spr, st, fa)) {
              if (fa === 'facing_bet') {
                setEntry(data, facingBetDefault(bt, pos, spr, st));
              } else if (fa === 'facing_raise') {
                setEntry(data, facingRaiseDefault(bt, pos, spr, st));
              } else {
                // first_to_act default based on position
                const checkFreq = pos === 'OOP' ? 0.60 : 0.50;
                setEntry(data, entry(bt, pos, spr, st, fa, [
                  { actionType: 'check', frequency: checkFreq },
                  { actionType: 'bet', frequency: 1 - checkFreq, sizing: '1/2 pot' },
                ], pos === 'OOP'
                  ? 'Check more often when out of position'
                  : 'Balanced betting and checking in position',
                  pos === 'OOP'
                  ? '没位置时更多过牌'
                  : '有位置时平衡下注和过牌'));
              }
            }
          }
        }
      }
    }
  }

  return data;
}

function setEntry(data: PostflopStrategyData, e: PostflopGtoResult): void {
  const { boardTexture, position, sprRange, street, facingAction } = e;
  if (!data[boardTexture]) data[boardTexture] = {};
  if (!data[boardTexture][position]) data[boardTexture][position] = {};
  if (!data[boardTexture][position][sprRange]) data[boardTexture][position][sprRange] = {};
  if (!data[boardTexture][position][sprRange][street]) data[boardTexture][position][sprRange][street] = {};
  data[boardTexture][position][sprRange][street][facingAction] = e;
}

function getEntry(
  data: PostflopStrategyData,
  bt: string, pos: string, spr: string, st: string, fa: string
): PostflopGtoResult | undefined {
  return data[bt]?.[pos]?.[spr]?.[st]?.[fa];
}

export const POSTFLOP_STRATEGIES: PostflopStrategyData = buildTable();
