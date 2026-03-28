## Goal
GTO Idiot 是一款纯浏览器端的德州扑克 GTO 策略练习器，提供六人桌 BOT 实战对抗 + 赛后逐手 GTO 复盘的一站式免费练习体验，帮助初学者到中级玩家通过"打牌 → 复盘 → 改进"的自然循环提升 GTO 策略水平。

## Features

- F-001 game-engine: 德州扑克核心规则引擎 — 实现完整的 NL Hold'em 六人桌现金桌逻辑，包括发牌、盲注、四条街（Preflop/Flop/Turn/River）的完整流程、底池计算、手牌评估与胜负判定。支持固定盲注无限注模式。
- F-002 player-actions: 玩家操作系统 — 用户在每个决策点可执行 Fold/Check/Call/Raise(含自定义加注额)/All-in 操作，UI 实时显示当前底池大小、有效筹码、最小/最大加注范围，操作后即时更新牌桌状态。
- F-003 bot-opponents: 多风格 BOT 对手系统 — 提供 5 个不同风格的 AI 对手：TAG（紧凶）、LAG（松凶）、NIT（超紧被动）、Fish（松弱被动）、Maniac（超松超凶）。每个 BOT 基于参数化策略配置（位置感知的 preflop range 表 + 基于 pot odds/equity 的 postflop 决策树），行为包含适度随机化以增加真实感。
- F-004 table-ui: 六人桌牌桌界面 — 可视化展示六人桌布局（BTN/SB/BB/UTG/MP/CO 六个位置），显示每位玩家的筹码量、当前动作、下注额、公共牌、底池大小。用户可选择入座位置，支持牌局动画（发牌、翻牌、筹码移动）。
- F-005 gto-preflop: Preflop GTO 范围表引擎 — 内置标准 6-max 各位置（UTG/MP/CO/BTN/SB/BB）的 RFI/3bet/call/4bet range 表数据，根据位置和前序动作查表返回 GTO 推荐动作及对应频率。数据以静态 JSON 形式打包，前端直接查表。
- F-006 gto-postflop: Postflop 简化 GTO 启发式引擎 — 基于 equity bucket（强牌/中等牌/弱牌/听牌分类）+ pot odds + board texture（干燥/湿润/配对等分类）的策略映射表，为翻后每个决策点生成近似 GTO 推荐动作（check/bet 大小/raise/fold）及对应频率。非精确 solver，但覆盖主流场景。
- F-007 hand-recorder: 牌局记录系统 — 每局完整记录所有信息：每位玩家的底牌（摊牌时）、每条街的公共牌、每个决策点的动作序列（玩家+动作+金额+底池）、最终结果（赢家/输家/金额变化）。数据结构化存储，支持复盘回放。
- F-008 session-history: 对战历史与统计 — 浏览历史牌局列表（按时间倒序），每局显示摘要（日期、盈亏、关键手牌）。展示累计统计：总手数、胜率、VPIP、PFR、3bet%、平均每手盈亏趋势图。点击任意历史牌局可进入复盘。
- F-009 hand-replayer: 逐手复盘回放 — 牌局结束后或从历史记录进入复盘模式，以可视化牌桌界面逐街/逐动作回放整局过程。用户可前进/后退/跳转到任意决策点，回放时显示当时的底池、筹码、公共牌状态。
- F-010 gto-comparison: GTO 策略对比分析 — 复盘中每个用户决策点标注：用户实际动作 vs GTO 推荐动作（含频率），计算并显示两者的 EV 差异（通过 Monte Carlo equity 模拟近似）。用颜色编码决策质量（绿色=符合 GTO / 黄色=轻微偏离 / 红色=严重偏离）。
- F-011 leak-finder: Leak 识别与学习反馈 — 复盘总结中高亮用户偏离 GTO 最大的 Top 5 决策点，按 EV 损失排序。标注 leak 类型分类（如"过度弃牌 vs 3bet"、"河牌 bluff 频率过高"等），提供简明的改进建议文字。
- F-012 local-storage: 本地数据持久化 — 使用 IndexedDB（通过 Dexie.js）存储所有牌局记录、统计数据和用户设置。支持数据容量管理（提示用户清理旧数据），无需用户登录或注册。

## Constraints

- 纯浏览器端运行，零后端依赖，所有游戏逻辑和 GTO 计算在前端完成
- 技术栈限定 React + TypeScript + Tailwind CSS
- GTO 策略采用简化近似方案（preflop 查表 + postflop 启发式），非精确 CFR solver
- 数据持久化仅使用 IndexedDB，无需用户账号体系
- 仅支持六人桌 NL Hold'em 现金桌（固定盲注，无限注），不支持其他桌型或游戏变体
- 避免使用 AGPL 许可证依赖（WASM Postflop），MVP 使用自研简化方案
- 所有 npm 依赖须为 MIT 或 Apache-2.0 兼容许可证

## Out of Scope

- 精确 GTO solver（CFR 算法迭代求解）
- 多桌同时游戏
- 锦标赛模式（MTT/SNG/Spin&Go）
- 在线多人对战（玩家 vs 玩家）
- 用户自定义 BOT 风格/参数
- 移动端原生适配（响应式设计不在 MVP 范围）
- 数据导入导出（Hand History 文件导入等）
- 高级统计分析面板（HUD 风格的详细数据）
- 用户账号注册/登录系统
- 国际化/多语言支持
- 音效/语音功能
- 筹码购买/真金模式
