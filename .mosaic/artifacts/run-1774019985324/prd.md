## Goal
构建一个纯本地运行的德州扑克 GTO 策略练习器，让玩家通过与多难度 BOT 对战、即时 GTO 对比分析和 leak 追踪来系统性提升决策质量。

## Features

- F-001 game-engine: 6-max 牌局引擎，支持完整的 preflop → flop → turn → river 流程，处理 6 个位置（UTG/HJ/CO/BTN/SB/BB）、所有标准动作（fold/check/call/raise/all-in）、side pot 计算、牌力评估和胜负判定
- F-002 game-setup: 牌局配置与启动，支持选择牌局类型（现金桌/锦标赛）、盲注结构设定、起始筹码设定，1 人类 vs 5 BOT 的 6-max 单桌对战
- F-003 bot-ai: 三种难度 BOT AI 引擎：鱼（松散被动，随机化加宽范围）、普通 TAG（基于位置和手牌强度的范围表 + 决策树）、GTO（查询策略表按频率随机化动作），玩家可在牌局间切换每个 BOT 的难度
- F-004 gto-strategy-store: GTO 策略数据层，MVP 默认模式内置覆盖主要 preflop 场景和常见 flop texture 的预计算 GTO 策略（JSON 格式），支持 bet sizing 归类算法（将实际下注映射到最近的 solver betting line）
- F-005 pio-upi-bridge: PioSOLVER UPI 协议桥接（高级模式），通过 Node.js child_process 与本地 PioSOLVER 进程通信，支持 load_tree / show_strategy / calc_ev / show_node 等 UPI 命令，加载用户自定义 .cfr 文件获取完整策略树
- F-006 gto-comparison: 每手牌即时 GTO 对比分析，在每个决策点显示玩家实际操作 vs GTO 最优操作（动作 + 频率），计算每个决策点的 EV 差异，以范围矩阵、频率饼图、EV 柱状图等形式可视化
- F-007 hand-history: 对战历史记录与手牌回放，使用 SQLite 存储每手牌的完整动作序列、公共牌、结果和 GTO 对比数据，支持按时间/结果/位置筛选和逐步回放历史手牌
- F-008 stats-dashboard: 统计分析面板，以 leak 模式为核心展示：整体胜率、累计 EV 损失趋势图、各位置表现对比、按场景聚合的常见 leak 汇总（如 "CO vs 3bet 系统性 fold 过多"），支持时间范围筛选
- F-009 session-management: 会话管理，支持保存当前牌局进度（筹码/位置/盲注状态）、恢复未完成牌局、会话列表查看与删除
- F-010 poker-table-ui: 牌桌 UI 界面，React + Tailwind 实现的沉浸式牌桌视图，显示 6 个座位、公共牌区、底池、玩家手牌、筹码量和动作按钮，支持基本动画效果（发牌、筹码移动）
- F-011 analysis-overlay: 分析叠加视图，在牌桌 UI 上无缝叠加 GTO 分析信息，包含当前决策点的 GTO 建议动作频率、EV 值，手牌结束后的逐节点对比时间线，可折叠/展开以在沉浸模式和分析模式间切换

## Constraints
- 纯本地运行：React 前端 + Node.js 后端 + SQLite 数据库，不依赖任何云服务或网络连接
- MVP 默认 GTO 策略为内置预计算 JSON 策略表，PioSOLVER UPI 桥接为可选高级功能
- PioSOLVER UPI 桥接仅支持用户本地已安装 PioSOLVER 的环境（Windows），需用户自行提供 .cfr 文件
- Bet sizing 归类算法精度需明确文档化（如 40%-60% pot 归为 half pot），避免用户对 EV 差异产生误解
- EV 计算精度需与 solver 输出一致（UPI 模式下直接使用 solver 返回值，预计算模式下保留至少 2 位小数）
- 牌力评估使用成熟库（pokersolver 或 poker-evaluator），不自行实现核心算法
- 数据库使用 better-sqlite3，同步 API 简化牌局逻辑中的数据操作
- MVP 阶段前端运行在浏览器中，暂不打包为桌面应用（Electron/Tauri 留待后续）
- 预计算策略表需覆盖至少：所有 preflop 位置对的 open/3bet/call 范围 + 50 种以上常见 flop texture 的 c-bet 策略

## Out of Scope
- 多桌同时进行
- 在线多人对战 / 联网功能
- 自定义 BOT 策略编辑器
- GTO solver 实时计算（不嵌入 solver 引擎）
- 手机端适配 / 响应式移动布局
- ICM（Independent Chip Model）计算
- Solver 文件自动下载或更新
- Electron/Tauri 桌面应用打包
- 非 6-max 桌型（heads-up、9-max 等）
- 扑克网站手牌导入（PokerStars/GGPoker 等 HH 格式解析）
- 多语言国际化（MVP 仅中文界面）
