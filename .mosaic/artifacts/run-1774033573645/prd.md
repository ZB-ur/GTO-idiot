## Goal
构建一个名为 GTO Idiot 的纯浏览器端德州扑克 GTO 策略练习器，让中高级玩家通过与多风格 BOT 的六人桌对战、赛后逐手复盘与 GTO 策略对比，系统性发现并修正自身策略偏差。

## Features

- F-001 poker-engine: 完整的六人桌（6-max）No-Limit Hold'em 牌局引擎，包括发牌（洗牌+随机发牌）、四条街（Preflop/Flop/Turn/River）下注轮、底池计算、边池（side pot）处理、摊牌比牌、筹码结算。支持标准操作：fold / check / call / raise / all-in。
- F-002 bot-ai: 5 种不同风格的 BOT 对手引擎——TAG（紧凶）、LAG（松凶）、Nit（极紧）、Fish（松被动）、GTO-based（接近均衡）。每种 BOT 基于预设手牌范围 + 风格参数的决策树，输入（手牌、位置、底池大小、对手动作历史、牌面纹理）输出动作及金额。各 BOT 需有可感知的行为个性（如 Fish 会 limp-call 弱牌、Nit 翻后几乎不 bluff）。
- F-003 gto-data: 内置预计算 GTO 策略数据库。Preflop 部分：6-max 各位置（UTG/HJ/CO/BTN/SB/BB）的 open range、3-bet range、4-bet range、facing 3-bet 策略（call/fold/4-bet 频率）。Postflop 部分：覆盖常见 spot——SRP IP C-bet、SRP OOP facing C-bet（call/raise/fold）、3-bet pot C-bet、donk bet、probe bet。数据格式为 JSON，按「位置 × 场景 × 动作」索引，含各动作频率分布。
- F-004 game-ui: 六人桌对战界面。展示牌桌布局（6 个座位+位置标签）、玩家手牌、公共牌、底池大小、各玩家筹码量、当前行动玩家高亮、操作面板（fold/check/call/raise 滑块+金额输入）、下注时间线。牌局进行中实时更新状态。
- F-005 hand-history: 牌局数据记录与持久化。每手牌记录完整状态快照：每条街的公共牌、每个玩家每个决策点的动作与金额、底池变化、最终结果（赢家+赢得金额）。所有数据存储在 IndexedDB（使用 Dexie.js 封装），支持按日期、场景类型（如 3-bet pot、river bluff）、盈亏筛选浏览历史牌局列表。
- F-006 hand-replay: 赛后逐手复盘模式。支持从历史记录中选择任意牌局进入回放，逐决策点前进/后退。在每个关键决策点并排展示：用户实际操作 vs GTO 推荐操作（含各动作频率分布，如 raise 40% / call 35% / fold 25%）。用颜色标注偏差程度（绿色=符合GTO、黄色=轻微偏差、红色=严重偏差）。
- F-007 ev-analysis: EV（期望值）分析功能。复盘中每个决策点计算并展示：用户选择动作的 EV vs GTO 最优动作的 EV，量化 EV 损失（EV loss）。基于预存策略的 EV 查表实现。单手牌汇总展示总 EV 损失。
- F-008 stats-dashboard: 长期统计面板。展示用户历史操作频率分布图表 vs GTO 标准频率分布，维度包括：按位置（UTG/HJ/CO/BTN/SB/BB）、按街道（Preflop/Flop/Turn/River）、按场景（open raise/3-bet/C-bet/check-raise/river bluff 等）。使用图表（柱状图+雷达图）直观展示偏差。支持时间范围筛选（近 100 手 / 近 500 手 / 全部）。
- F-009 session-management: 对战场次管理。用户可以开始新牌局 session（设置起始筹码深度，如 100BB）、暂停/继续 session、结束 session 查看本场汇总。展示每场 session 的盈亏曲线、手数、关键决策统计。
- F-010 data-export: 牌局数据导出。支持将选定牌局导出为标准 Hand History (HH) 文本格式，兼容主流扑克分析工具导入。支持统计数据导出为 JSON 格式。

## Constraints

- 纯浏览器端运行，无需后端服务器；采用 Next.js 静态导出，零服务器依赖
- GTO 策略数据为预计算简化版，内置于前端 bundle（Preflop 约 50KB + 常见 Postflop spot 约 200-500KB），非实时 solver 计算
- 所有用户数据（对战记录、统计）使用 IndexedDB + Dexie.js 本地持久化，无需登录注册
- 仅支持六人桌（6-max）No-Limit Hold'em，不支持其他桌型或游戏变种
- BOT 决策逻辑需在浏览器端 JS 实时运算，单次决策延迟 < 200ms
- 技术栈：Next.js + React + TypeScript + Tailwind CSS + Dexie.js (IndexedDB) + Recharts (图表)
- 仅支持桌面浏览器（Chrome/Firefox/Safari/Edge 最新版本），不做移动端适配

## Out of Scope

- 在线多人真人对战
- 实时 solver 计算（如接入 wasm-postflop）
- 用户账号系统与云端数据同步
- 移动端 / 响应式适配
- 锦标赛（MTT）模式与 ICM 计算
- 筹码兑换与真金博弈
- PioSolver 解法文件导入
- 自定义 BOT 风格参数
- 多语言国际化（MVP 仅中文）
- 游戏化元素（评分升级、成就系统）
