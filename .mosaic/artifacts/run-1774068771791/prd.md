## Goal
为中级德州扑克玩家提供一款免费、纯前端的六人桌GTO策略练习器（GTO Idiot），通过与BOT实战对战、赛后逐手逐街GTO对比复盘、历史统计分析，帮助用户系统性内化GTO思维。

## Features

- F-001 poker-engine: 核心对战引擎 — 完整的六人桌（1人类+5BOT）Cash Game引擎，包含52张牌的Fisher-Yates洗牌发牌、固定盲注1/2、四条街（preflop/flop/turn/river）下注轮次流转、底池计算（含side pot）、摊牌比牌逻辑。玩家可执行fold/check/call/raise/all-in动作，每轮按位置顺序行动。
- F-002 hand-evaluator: 手牌评估器 — 实现7张牌（2手牌+5公共牌）的最佳5张牌型识别与排名，支持所有标准牌型（高牌到皇家同花顺），用于摊牌时判定胜负及复盘中的手牌强度分类。
- F-003 position-system: 位置系统 — 六人桌6个位置（UTG/MP/CO/BTN/SB/BB）的完整轮转，每手牌dealer button顺移，正确处理盲注强制下注和行动顺序。
- F-004 bot-ai: BOT决策AI — 5个BOT基于内置简化GTO策略表做出决策：Preflop根据位置和手牌查表决定open/3-bet/call/fold；Postflop根据牌面纹理分类（干燥/湿润/配对等）和手牌强度分类（强牌/中等牌/弱牌/听牌）查表决定动作。动作频率按25%粒度简化，通过随机数实现混合策略，避免完全确定性行为。
- F-005 gto-strategy-tables: GTO策略数据表 — 内置预计算的简化GTO策略JSON数据：(a) Preflop开局范围表，覆盖169种起手牌×6个位置×常见场景（open/facing-raise/facing-3bet）；(b) Postflop策略表，按牌面纹理分类×手牌强度分类×位置×动作历史，给出推荐动作及频率。数据用于BOT决策和复盘对比，总量控制在500KB以内。
- F-006 game-table-ui: 牌桌界面 — 六人桌可视化界面，展示：各位置玩家（含BOT）的座位和筹码量、公共牌区域、底池金额、当前行动玩家高亮、用户手牌展示、动作按钮（fold/check/call/raise滑块/all-in）、当前下注轮次标识。使用React+Tailwind实现响应式桌面端布局。
- F-007 game-history-recording: 对战记录存储 — 每手牌完整记录存入localStorage：手牌ID、各玩家起手牌、公共牌序列、每条街每个玩家的动作序列（含下注金额）、底池变化、最终结果（赢家/输家/金额）。每手牌约1-2KB，支持存储至少2000手。提供旧数据自动清理策略（超出容量时删除最早记录）。
- F-008 hand-review: 逐手复盘 — 牌局结束后或从历史记录进入复盘界面：以时间线形式逐街（preflop→flop→turn→river）回放每个决策点，展示当时的牌面状态、底池大小、各玩家动作。在每个用户决策点并排显示「用户实际动作」vs「GTO推荐动作」，用颜色标注偏离程度（绿色=符合GTO、黄色=轻微偏离、红色=严重偏离）。展示GTO推荐的动作分布（如raise 50%/call 25%/fold 25%）。
- F-009 session-stats: 对战统计面板 — 展示整体和分段统计数据：总手数、总盈亏、每手平均盈亏、VPIP（主动入池率）、PFR（翻前加注率）、AF（攻击频率）、GTO符合率（用户动作与GTO推荐一致的比例）、按位置的胜率和GTO符合率分布、按牌力的决策质量分布。数据从localStorage的历史记录中实时聚合计算。
- F-010 app-navigation: 应用导航与页面结构 — 三个主页面：(a) 主页/大厅页 — 开始新牌局、查看历史记录入口、统计概览；(b) 牌桌页 — 实时对战界面；(c) 复盘/统计页 — 历史手牌列表、逐手复盘、统计面板。顶部导航栏含应用名"GTO Idiot"和页面切换。

## Constraints
- 纯前端Web应用，无后端服务，所有数据存储使用浏览器localStorage
- GTO策略为内置预计算的简化策略表（频率按25%粒度四舍五入），非实时求解器计算，应明确标注为"简化GTO参考"
- 技术栈限定React + TypeScript + Tailwind CSS
- 仅支持六人桌No-Limit Hold'em Cash Game，固定盲注1/2，固定起始筹码200BB
- 手牌评估使用查表法或确定性算法，不使用蒙特卡洛模拟，确保浏览器端毫秒级响应
- 应用语言为中文界面，扑克术语保留英文（如fold/call/raise/flop/turn/river）

## Out of Scope
- 多桌同时进行或锦标赛（MTT/SNG）模式
- BOT难度分级或可调节的对手风格
- 实时求解器级别的精确GTO策略计算
- 多人在线对战或联网功能
- 移动端适配或原生App
- 用户账号注册/登录系统
- 手牌历史导入（如PokerStars HH格式）
- 社区功能（排行榜、分享手牌等）
- Pot Odds / EV计算器等辅助工具
- 国际化/多语言支持
