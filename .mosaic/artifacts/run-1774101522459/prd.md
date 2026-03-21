## Goal
GTO Idiot 是一款纯浏览器端的德州扑克 GTO 策略练习器，通过 6 人桌 BOT 实战对练 + 赛后 EV 复盘，帮助入门到中级玩家在实践中量化自己与 GTO 最优策略的差距并提升决策水平。

## Features

- F-001 game-engine: 6人桌现金局对战引擎。管理完整牌局生命周期：洗牌发牌、盲注结构（固定盲注，100BB 深筹码）、Preflop→Flop→Turn→River 四轮下注、底池计算（含边池）、摊牌比大小、筹码结算。支持 Fold/Check/Call/Bet/Raise/All-in 六种玩家行动。6 个座位固定位置轮转：BTN/SB/BB/UTG/MP/CO。
- F-002 bot-ai: 5 种风格 BOT AI 决策系统。每个 BOT 具有独立的风格参数（VPIP/PFR/AF/3Bet%等），包括 TAG（紧凶）、LAG（松凶）、TP（紧弱）、LP（松弱）、GTO（均衡型）。BOT 基于手牌强度、位置、底池赔率、对手行动历史和自身风格参数做出决策。GTO BOT 使用简化 solver 输出作为决策依据。
- F-003 gto-solver: 简化版 GTO 策略引擎。Preflop 阶段使用预计算的 6-max GTO 范围表（开源数据）；Postflop 阶段使用基于底池赔率、手牌强度、SPR 的启发式策略规则，结合简化的 Monte Carlo 模拟估算各动作 EV。精度目标为方向性正确（~5-10% Nash Distance），非精确求解。所有计算在 Web Worker 中异步执行，不阻塞 UI。
- F-004 game-ui: 实时对战界面。Canvas/SVG 渲染的 6 人桌牌桌视图，展示：公共牌（翻牌/转牌/河牌）、底池金额、各玩家筹码量及位置标识、当前行动玩家高亮、用户手牌、行动按钮（Fold/Check/Call/Bet/Raise/All-in）及 Raise 金额滑块、计时提示。响应式布局适配桌面端浏览器。
- F-005 hand-history: 手牌历史记录与存储。每局牌局完整记录：牌局 ID、时间戳、座位分配、各玩家手牌、公共牌、每个决策点的游戏状态（底池、筹码、可选行动）和玩家实际行动、最终结果（赢家、筹码变动）。数据持久化到 IndexedDB，支持按时间倒序浏览历史牌局列表，支持删除单条记录。
- F-006 hand-replay: 赛后手牌回放复盘。逐步回放完整牌局流程，用户可前进/后退到任意决策点。每个决策点展示：当时的游戏状态（底池、筹码、公共牌）、用户实际选择的行动、GTO 推荐的行动及各动作的 EV 值、用户实际行动与 GTO 推荐行动的 EV 差值（以 BB 为单位）。用颜色标注决策质量（绿色=接近 GTO，黄色=轻微偏差，红色=重大偏差）。
- F-007 stats-dashboard: 对战统计面板。展示关键指标：总牌局数、总手数、胜率（赢得底池的比例）、累计盈亏（BB 单位）、累计 EV 损失（与 GTO 的总偏差）、平均每手 EV 损失、按位置统计的胜率和 EV 损失、按街（Preflop/Flop/Turn/River）统计的 EV 损失分布。数据从 IndexedDB 中的手牌历史聚合计算。
- F-008 session-management: 牌局会话管理。用户可开始新牌局会话（自动分配座位或手动选座）、暂停/继续当前会话、结束会话并查看本次会话统计摘要。每次会话记录起止时间和包含的手数。支持会话内连续对战（一手结束自动开始下一手）。

## Constraints
- 纯浏览器端运行（React + TypeScript + Tailwind CSS），无后端服务器依赖，所有数据使用 IndexedDB/LocalStorage 存储
- 固定 6 人桌（6-max）现金桌结构，100BB 深筹码，固定盲注，不支持其他桌型或结构
- GTO solver 为简化版启发式算法 + 预计算范围表，精度目标 ~5-10% Nash Distance，非精确求解
- GTO 计算和 EV 估算必须在 Web Worker 中异步执行，避免阻塞 UI 线程
- 手牌评估优先使用现有 npm 库（pokersolver/phe），不自行实现
- Preflop GTO 范围使用开源预计算数据，不运行时求解
- 浏览器端存储容量有限，IndexedDB 应能支撑至少 5000 局历史记录

## Out of Scope
- 多桌同时游戏
- 锦标赛模式（MTT/SNG/ICM）
- 用户自定义 BOT 风格或参数调整
- 高级 HUD（Heads-Up Display）统计
- 多设备数据同步或云端存储
- 社交功能、排行榜、多人在线对战
- 精确 GTO solver（PioSolver 级别精度）
- 移动端适配（MVP 仅桌面浏览器）
- Hand History 文件导入/导出（PokerStars/GGPoker 格式）
- 多语言支持（MVP 仅中文界面）
- 音效和动画特效
