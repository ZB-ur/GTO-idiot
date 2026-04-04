## Goal
提供一个免费的纯前端德州扑克 GTO 策略练习器（GTO Idiot），让入门到中级玩家在六人桌模拟对战中学习 GTO，并通过赛后逐手复盘量化策略偏差与 EV 损失。

## Features

- F-001 poker-engine: 六人桌 NL Hold'em 牌局引擎 — 完整的发牌（52 张标准牌组）、盲注结构、下注轮（Preflop → Flop → Turn → River）、底池计算、摊牌比牌、边池处理逻辑。用户可选择任意座位位置（UTG/MP/CO/BTN/SB/BB），默认起始筹码 100BB。
- F-002 player-actions: 玩家操作系统 — 支持 Fold / Check / Call / Bet / Raise / All-in 操作，根据当前游戏状态动态显示可用操作及合法下注范围（min-raise 到 all-in），操作后即时更新底池和筹码。
- F-003 bot-ai: 多风格 Bot AI — 实现 4 种 Bot 风格：GTO（均衡型，严格按 range chart + 决策树）、LAG（松凶，宽范围高频率加注）、TAG（紧凶，窄范围选择性激进）、Fish（鱼，随机化的被动弱打法）。Preflop 基于位置 range chart 查表决策；Postflop 基于 pot odds / SPR / board texture 的规则引擎决策。用户可在开局前选择 5 个对手的风格组合。
- F-004 gto-strategy-data: 简化 GTO 策略数据库 — 包含标准 6-max preflop range chart（169 种起手牌 × 6 位置 × 常见前位动作场景：RFI / vs RFI / vs 3bet 等），以及简化 postflop 决策树（基于牌面纹理分类、SPR 区间、range 优势的规则集）。数据以 JSON 格式硬编码，作为 GTO 偏差分析的参考基线。
- F-005 hand-history: 牌局历史记录 — 每手牌完整记录：牌局编号、日期时间、座位位置、起手牌、公共牌、每条 street 的所有玩家动作序列、底池变化、最终结果（赢/输金额）。数据以结构化 JSON 存储到 localStorage，支持按日期 / 位置 / 结果筛选浏览，支持导出为 JSON 文件，支持清理历史数据。
- F-006 hand-review: 赛后逐手复盘 — 选择任意历史牌局进入复盘模式，逐 street 回放牌局过程，每个用户决策点标注：用户实际动作、GTO 推荐动作、偏差判定（正确 ✓ / 可接受 △ / 错误 ✗），以及该决策点的近似 EV 损失（基于简化 range equity × pot size 计算）。支持逐步前进/后退浏览。
- F-007 practice-stats: 练习统计面板 — 展示汇总统计数据：总手数、GTO 符合率（按 street 分类：Preflop / Flop / Turn / River）、累计 EV 损失、按位置的胜率分布、按 Bot 风格的胜率分布、最近 N 局的 GTO 符合率趋势折线图。
- F-008 poker-table-ui: 经典牌桌界面 — 仿 PokerStars 风格的绿色椭圆形牌桌，6 个座位环绕排列，显示每个玩家的头像/昵称/筹码/当前动作/手牌（己方明牌，对手暗牌，摊牌时翻开）。公共牌居中展示，底池金额显示在牌桌中央。包含发牌、翻牌、下注等基础动画。响应式布局适配桌面端和平板。
- F-009 game-lobby: 游戏大厅 — 开局设置界面：选择座位位置（6 选 1）、设置对手 Bot 风格组合（每个对手独立选择风格）、确认开始牌局。同时作为应用首页，展示快速开始入口和历史统计摘要。
- F-010 session-management: 牌局会话管理 — 支持连续多手牌局（session），每 session 可打多手，中途可暂停/继续，筹码在 session 内累计变化。Session 结束时展示本次 session 的汇总（手数、盈亏、GTO 符合率）。

## Constraints
- 纯前端 Web 应用（React + TypeScript + Tailwind CSS），无需后端服务器，所有逻辑在浏览器端运行
- 数据持久化使用 localStorage（上限约 5-10MB，足够存储 5000+ 局），无需登录和云同步
- GTO 策略为简化规则版（preflop range chart + 简化 postflop 决策树），非 solver 精确解，UI 中需明确标注"简化 GTO 参考"
- 仅支持六人桌（6-max）No-Limit Hold'em，固定盲注结构（1/2 BB）
- UI 采用经典绿色牌桌风格，桌面端优先，需适配平板，移动端为低优先级
- Bot 决策为纯规则引擎（查表 + 参数化规则），不使用机器学习或外部 API
- 扑克牌渲染使用 SVG 或 CSS（不依赖外部图片资源）

## Out of Scope
- 真实 GTO solver 集成（PioSolver / MonkerSolver API）
- 多人在线实时对战
- 用户账号注册 / 登录系统
- 跨设备数据同步
- 锦标赛（MTT）/ Sit-and-Go（SNG）模式
- 筹码变动曲线图等高级可视化统计
- 手牌导入功能（从 PokerStars 等平台导入手牌历史）
- 社区功能（排行榜、分享手牌、讨论区）
- 移动端深度适配
- 多语言国际化（MVP 仅中文界面）
- 音效和高级动画效果