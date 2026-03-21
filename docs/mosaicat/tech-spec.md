## Architecture Overview

GTO Idiot 是一个纯浏览器端的德州扑克GTO策略练习器。架构采用**分层服务架构**：UI层（React组件）→ 服务层（TypeScript模块，实现API契约）→ 存储层（IndexedDB）。核心计算密集型任务（CFR求解）通过Web Worker隔离，避免阻塞UI主线程。

**关键架构决策：**
- **服务层模拟API**：虽然无后端，但按api-spec.yaml定义的契约实现服务层，所有组件通过服务层访问数据，为未来后端化预留接口
- **Web Worker隔离计算**：CFR求解器运行在独立Worker线程，通过postMessage通信，主线程保持响应
- **IndexedDB异步存储**：手牌历史、session数据持久化到IndexedDB，使用Dexie.js简化操作
- **状态管理用Zustand**：轻量级，适合游戏状态频繁更新的场景，避免Redux的样板代码开销
- **预计算翻前范围表**：169×6×4的静态JSON数据，构建时内联，运行时O(1)查表

```
┌─────────────────────────────────────────────────────┐
│                    UI Layer (React)                  │
│  AppShell / GamePage / HistoryPage / ReplayPage ... │
├─────────────────────────────────────────────────────┤
│               State Management (Zustand)            │
│  gameStore / sessionStore / statsStore / uiStore    │
├─────────────────────────────────────────────────────┤
│              Service Layer (API契约实现)              │
│  SessionService / GameEngine / GTOService /         │
│  HistoryService / ReplayService / StatsService      │
├──────────────────────┬──────────────────────────────┤
│   Storage (Dexie/    │   Compute (Web Worker)       │
│   IndexedDB)         │   CFR Solver / Hand Eval     │
└──────────────────────┴──────────────────────────────┘
```

## Tech Stack

| 技术 | 用途 | 理由 |
|------|------|------|
| TypeScript | 全栈语言 | PRD约束；类型安全对复杂扑克状态机至关重要 |
| React 18 | UI框架 | PRD约束；组件化适合牌桌复杂UI |
| Tailwind CSS | 样式 | PRD约束；快速实现深色主题和响应式布局 |
| Vite | 构建工具 | 快速HMR，原生支持Web Worker和TypeScript |
| Zustand | 状态管理 | 轻量（<1KB），适合游戏状态高频更新，比Redux简洁 |
| Dexie.js | IndexedDB封装 | 类型安全的IndexedDB操作，支持索引查询和分页 |
| Recharts | 图表 | React原生图表库，满足盈亏曲线和柱状图需求 |
| Web Worker API | 并行计算 | 浏览器原生，CFR求解不阻塞UI（PRD约束） |
| @tanstack/react-virtual | 虚拟滚动 | 10000手牌历史列表性能保障 |
| poker-hand-evaluator (自实现) | 牌力评估 | 无合适的轻量库，需自实现7张牌评估器 |

## Module Breakdown

### Module: game-engine
- **Responsibility**: 完整的6-max Texas Hold'em状态机，管理牌局生命周期：洗牌发牌、盲注收取、四轮下注（preflop/flop/turn/river）、底池计算（含边池）、摊牌和胜负判定。位置轮转、合法行动验证。
- **Key interfaces**:
  - `GameEngine.startHand(): HandState` — 开始新手牌
  - `GameEngine.performAction(action): ActionResult` — 执行玩家行动
  - `GameEngine.triggerBotAction(): ActionResult` — 触发BOT行动
  - `HandEvaluator.evaluate(cards: Card[]): HandRank` — 7张牌牌力评估
  - `Deck.shuffle() / deal()` — 洗牌发牌
- **Key files**: `src/engine/game-engine.ts`, `src/engine/hand-evaluator.ts`, `src/engine/deck.ts`, `src/engine/pot-calculator.ts`
- **Covers**: F-001

### Module: bot-ai
- **Responsibility**: BOT对手决策系统，支持三种难度级别。鱼（随机策略+松散范围）、常规（基于范围表+位置感知+底池赔率的TAG策略）、GTO（调用CFR求解器的均衡策略）。决策需在200ms内完成。
- **Key interfaces**:
  - `BotStrategy` interface — 策略抽象接口
  - `FishStrategy.decide(state): Action` — 鱼策略
  - `RegularStrategy.decide(state): Action` — 常规TAG策略
  - `GTOStrategy.decide(state): Action` — GTO策略（调用CFR）
  - `BotManager.createBots(configs): Bot[]` — BOT工厂
- **Key files**: `src/bot/bot-manager.ts`, `src/bot/strategies/fish.ts`, `src/bot/strategies/regular.ts`, `src/bot/strategies/gto-bot.ts`
- **Covers**: F-002

### Module: gto-engine
- **Responsibility**: GTO计算核心，包含翻前预计算范围表和翻后CFR求解器。翻前范围表覆盖169种起手牌×6位置×主要场景。翻后CFR使用Discounted CFR算法，简化博弈树（33%/66%/100%下注尺度），Web Worker中运行，目标<500ms。
- **Key interfaces**:
  - `PreflopRangeTable.query(position, scenario): HandRangeEntry[]` — 翻前查表
  - `PreflopAdvisor.getAdvice(request): GTOAdvice` — 翻前建议
  - `PostflopSolver.solve(request): GTOAdvice` — 翻后CFR求解
  - `CFRWorker` — Web Worker入口，接收求解请求返回结果
- **Key files**: `src/gto/preflop-ranges.ts`, `src/gto/preflop-advisor.ts`, `src/gto/postflop-solver.ts`, `src/gto/cfr-worker.ts`, `src/gto/game-tree.ts`
- **Covers**: F-003, F-004, F-005

### Module: storage
- **Responsibility**: IndexedDB数据持久化层，使用Dexie.js封装。管理sessions、hand_histories两个主要表，支持索引查询、分页、筛选。存储上限管控（10000手牌），自动清理最旧记录。
- **Key interfaces**:
  - `Database` — Dexie数据库定义（表结构、索引）
  - `SessionRepository.create/get/update/list()` — Session CRUD
  - `HandRepository.save/get/list/filter()` — 手牌历史CRUD
  - `StorageManager.getUsage() / cleanup()` — 存储管控
- **Key files**: `src/storage/database.ts`, `src/storage/session-repository.ts`, `src/storage/hand-repository.ts`
- **Covers**: F-006, F-010

### Module: session
- **Responsibility**: 牌局会话管理，包括创建session（配置BOT和盲注）、暂停/继续/结束session、session恢复（异常中断检测）、session小结生成。协调game-engine和storage模块。
- **Key interfaces**:
  - `SessionService.create(config): Session` — 创建session
  - `SessionService.pause/resume/end(id)` — 状态管理
  - `SessionService.recover(): RecoverSessionResponse` — 恢复检测
  - `SessionService.getSummary(id): SessionSummary` — 小结生成
- **Key files**: `src/services/session-service.ts`
- **Covers**: F-010

### Module: replay
- **Responsibility**: 手牌回放与GTO偏差分析。将手牌历史转换为逐步回放数据（ReplayStep[]），在每个用户决策点调用GTO引擎计算偏差。偏差分三级（轻微<15%/中等15-40%/严重>40%），估算EV损失。
- **Key interfaces**:
  - `ReplayService.getReplayData(handId): ReplayData` — 生成回放数据
  - `DeviationAnalyzer.analyze(hand): DeviationAnalysis` — 偏差分析
  - `DeviationAnalyzer.calculateEVLoss(deviation): number` — EV损失估算
- **Key files**: `src/services/replay-service.ts`, `src/services/deviation-analyzer.ts`
- **Covers**: F-007, F-008

### Module: stats
- **Responsibility**: 统计数据聚合与计算。从IndexedDB读取手牌历史，计算总览指标（手数/胜率/盈亏）、关键扑克指标（VPIP/PFR/3Bet%/WTSD%等）、盈亏曲线、位置分布、偏差TOP5排行。支持时间/手数范围筛选。
- **Key interfaces**:
  - `StatsService.getSummary(filter): StatsSummary` — 总览
  - `StatsService.getProfitCurve(filter): ProfitCurveResponse` — 盈亏曲线
  - `StatsService.getKeyMetrics(filter): KeyMetrics` — 关键指标
  - `StatsService.getTopDeviations(filter): TopDeviationsResponse` — 偏差排行
  - `StatsService.getPositionStats(filter): PositionStatsResponse` — 位置统计
- **Key files**: `src/services/stats-service.ts`, `src/services/metrics-calculator.ts`
- **Covers**: F-009

### Module: ui-game
- **Responsibility**: 游戏界面UI组件，包括牌桌（椭圆形6座位布局）、扑克牌渲染、公共牌区域、底池显示、行动面板（Fold/Call/Raise+滑块）、BOT行动动画、GTO提示浮层。深色主题，响应式桌面布局。
- **Key interfaces**:
  - `<PokerTable>` — 牌桌主组件
  - `<PlayerSeat>` — 座位组件
  - `<ActionPanel>` — 行动面板
  - `<HintPopover>` — GTO提示浮层
  - `<CardDisplay>` — 扑克牌渲染
  - `useGameStore()` — 游戏状态hook
- **Key files**: `src/components/game/PokerTable.tsx`, `src/components/game/PlayerSeat.tsx`, `src/components/game/ActionPanel.tsx`, `src/components/game/HintPopover.tsx`, `src/components/game/CardDisplay.tsx`
- **Covers**: F-011, F-005

### Module: ui-review
- **Responsibility**: 复盘与统计UI组件，包括牌局历史列表（虚拟滚动）、手牌回放器（步进控制+街跳转+偏差标记）、偏差详情面板、统计图表（盈亏曲线/指标卡片/位置分布/偏差排行）。
- **Key interfaces**:
  - `<HandList>` — 虚拟滚动历史列表
  - `<ReplayViewer>` — 回放器主容器
  - `<ReplayControls>` — 步进控制
  - `<DeviationDetail>` — 偏差详情
  - `<ProfitChart>` — 盈亏曲线图
  - `<StatsPage>` — 统计面板页
- **Key files**: `src/components/history/HandList.tsx`, `src/components/replay/ReplayViewer.tsx`, `src/components/stats/ProfitChart.tsx`, `src/components/stats/StatsPage.tsx`
- **Covers**: F-006, F-007, F-008, F-009

### Module: ui-shell
- **Responsibility**: 应用外壳和通用UI，包括路由、导航侧边栏、深色主题、模态弹窗、Toast通知、骨架屏加载、空状态。Session配置弹窗和Session控制栏。
- **Key interfaces**:
  - `<AppShell>` — 应用外壳（导航+路由+主题）
  - `<SessionConfigModal>` — Session配置弹窗
  - `<SessionControls>` — 暂停/继续/结束控制栏
  - `<Toast>` / `<Modal>` / `<LoadingSpinner>` — 通用UI
- **Key files**: `src/components/shell/AppShell.tsx`, `src/components/shell/NavSidebar.tsx`, `src/components/session/SessionConfigModal.tsx`
- **Covers**: F-010, F-011

## Implementation Tasks

| ID | Task | Module | Covers Features | Priority |
|---|---|---|---|---|
| T-001 | 项目脚手架搭建：Vite + React + TypeScript + Tailwind CSS + 路由 + 深色主题基础配置 | ui-shell | F-011 | 1 |
| T-002 | IndexedDB数据库设计与Dexie封装：sessions表、hands表、索引定义、存储管控 | storage | F-006, F-010 | 1 |
| T-003 | 核心类型定义：Card, Position, Street, ActionType, HandState, Session等全局类型（对齐API Schema） | game-engine | F-001 | 1 |
| T-004 | 扑克牌组与发牌器：52张牌Deck类，Fisher-Yates洗牌，发牌接口 | game-engine | F-001 | 2 |
| T-005 | 7张牌牌力评估器：支持所有牌型（高牌到皇家同花顺），牌力比较，最佳5张选取 | game-engine | F-001 | 2 |
| T-006 | 6-max游戏状态机：位置分配、盲注收取、下注轮流转、合法行动验证、街转换逻辑 | game-engine | F-001 | 3 |
| T-007 | 底池计算器：主池+边池计算，All-in场景的边池分配，摊牌时底池分配 | game-engine | F-001 | 3 |
| T-008 | 翻前GTO范围表数据：169种起手牌×6位置×4场景的预计算范围JSON数据 | gto-engine | F-003 | 3 |
| T-009 | 翻前GTO查询与建议接口：范围表查询、翻前场景识别、GTOAdvice输出 | gto-engine | F-003, F-005 | 4 |
| T-010 | BOT鱼策略实现：松散被动/随机行动策略 | bot-ai | F-002 | 4 |
| T-011 | BOT常规策略实现：基于范围表+位置感知+底池赔率的TAG策略 | bot-ai | F-002 | 4 |
| T-012 | Session服务实现：创建/暂停/继续/结束/恢复、Session小结生成 | session | F-010 | 4 |
| T-013 | 扑克牌渲染组件：CardDisplay（正面花色点数+背面）、翻牌动画 | ui-game | F-011 | 4 |
| T-014 | 牌桌UI组件：PokerTable椭圆布局、6个PlayerSeat、CommunityCards、PotDisplay、DealerButton | ui-game | F-011 | 5 |
| T-015 | 行动面板组件：ActionPanel（Fold/Call/Raise按钮）、RaiseSlider（滑块+预设+输入框）、仅用户回合激活 | ui-game | F-011, F-001 | 5 |
| T-016 | 游戏状态管理（Zustand store）：gameStore管理当前HandState、用户行动dispatch、BOT行动触发 | ui-game | F-001, F-011 | 5 |
| T-017 | 游戏主循环集成：GamePage连接GameEngine+BotManager+GameStore，完整对战流程 | game-engine, ui-game | F-001, F-002, F-011 | 6 |
| T-018 | BOT行动动画：思考延迟(200-500ms)、行动结果显示动画 | ui-game | F-002, F-011 | 6 |
| T-019 | 手牌历史自动记录：每手牌结束后将HandHistory写入IndexedDB | storage | F-006 | 6 |
| T-020 | 应用外壳与导航：AppShell、NavSidebar（首页/游戏/历史/统计）、路由配置、深色主题 | ui-shell | F-011 | 5 |
| T-021 | Session配置弹窗：SessionConfigModal（BOT数量+难度+盲注）、表单验证 | ui-shell | F-010 | 5 |
| T-022 | Session控制栏：SessionControls（暂停/继续/结束）、SessionSummaryModal | ui-shell | F-010 | 6 |
| T-023 | 首页仪表盘：HomePage（快速开始入口、最近session概览、统计摘要） | ui-shell | F-010, F-009 | 7 |
| T-024 | 翻后CFR求解器核心算法：Discounted CFR实现，简化博弈树（33%/66%/100%下注尺度） | gto-engine | F-004 | 5 |
| T-025 | CFR Web Worker封装：Worker线程运行CFR求解，postMessage通信，超时降级处理（>2s） | gto-engine | F-004 | 6 |
| T-026 | GTO提示服务集成：翻前查表+翻后CFR统一入口，HintResponse生成，提示查看记录 | gto-engine | F-005 | 7 |
| T-027 | GTO提示UI组件：HintButton、HintPopover（频率分布柱状图+EV+近似说明）、加载状态 | ui-game | F-005 | 7 |
| T-028 | BOT GTO策略实现：调用CFR求解器的均衡策略，200ms超时降级到常规策略 | bot-ai | F-002 | 7 |
| T-029 | 牌局历史列表页：HistoryPage、HandList（虚拟滚动）、HandListFilter（时间/结果/位置筛选） | ui-review | F-006 | 7 |
| T-030 | 回放数据生成服务：将HandHistory转换为ReplayStep[]，街索引计算 | replay | F-007 | 7 |
| T-031 | 手牌回放器UI：ReplayViewer、ReplayControls（前进/后退/键盘快捷键）、StreetTimeline（街跳转） | ui-review | F-007 | 8 |
| T-032 | GTO偏差分析器：每个用户决策点的偏差计算、三级分类、EV损失估算、偏差描述生成 | replay | F-008 | 8 |
| T-033 | 偏差展示UI：DeviationMarker（时间轴彩色圆点）、DeviationDetail（侧边面板）、ActionComparison | ui-review | F-008 | 9 |
| T-034 | 统计服务实现：总览指标、VPIP/PFR/3Bet%/WTSD%计算、盈亏曲线数据、位置统计、偏差TOP5 | stats | F-009 | 8 |
| T-035 | 统计面板UI：StatsPage、StatsSummaryCards、ProfitChart、KeyMetricsPanel、PositionBreakdown、DeviationRanking、TimeRangeFilter | ui-review | F-009 | 9 |
| T-036 | Session异常恢复：页面关闭检测（beforeunload）、下次打开自动恢复提示 | session | F-010 | 9 |
| T-037 | 错误处理与边界场景：IndexedDB存储失败Toast、CFR超时降级UI、全局错误边界 | ui-shell | F-001, F-004, F-006 | 10 |
| T-038 | 性能优化：虚拟滚动调优、CFR Worker池化、IndexedDB批量读写、React.memo关键组件 | ui-review, gto-engine | F-004, F-006, F-009 | 10 |

## Data Model

### IndexedDB Tables (via Dexie.js)

```
sessions
├── id: string (PK, UUID)
├── status: 'active' | 'paused' | 'completed'
├── config: { bots: BotConfig[], blinds: BlindsConfig, starting_stack: number }
├── hand_count: number
├── current_hand_id: string | null
├── player_stack: number
├── created_at: Date (INDEX)
├── updated_at: Date
└── INDEX: [status], [created_at]

hands
├── id: string (PK, composite: sessionId + handNumber)
├── session_id: string (INDEX)
├── hand_number: number
├── date: Date (INDEX)
├── dealer_seat: number
├── blinds: BlindsConfig
├── players: HandHistoryPlayer[]
├── community_cards: Card[]
├── actions: HandHistoryAction[]
├── pot_history: { street, pot_after }[]
├── result: HandResult
├── hero_position: Position (INDEX)
├── hero_result_bb: number (INDEX)
├── hero_hand: Card[] | null
├── street_reached: Street
├── has_deviation: boolean (INDEX)
├── max_deviation_severity: DeviationSeverity | null
├── hints_viewed: { street, decision_point }[]
├── deviations: Deviation[] (预计算缓存)
└── INDEX: [session_id], [date], [hero_position], [hero_result_bb], [has_deviation]
```

### In-Memory State (Zustand)

```
GameStore
├── currentSession: Session | null
├── currentHand: HandState | null
├── isUserTurn: boolean
├── availableActions: AvailableAction[]
├── hintData: GTOAdvice | null
├── isHintLoading: boolean
└── actions: { performAction, requestHint, startHand, ... }

SessionStore
├── sessions: Session[]
├── activeSession: Session | null
└── actions: { createSession, pauseSession, ... }

UIStore
├── currentPage: 'home' | 'game' | 'history' | 'replay' | 'stats'
├── toasts: Toast[]
├── modals: { sessionConfig: boolean, sessionSummary: boolean }
└── actions: { navigate, showToast, ... }
```

### 实体关系

```
Session 1──* Hand (一个session包含多手牌)
Hand 1──* Action (一手牌包含多个行动)
Hand 1──* Deviation (一手牌可能有多个偏差点)
Hand 1──* ReplayStep (回放时生成，非持久化)
Session 1──1 SessionSummary (结束时计算，非持久化)
```

## Non-Functional Requirements

### 性能目标
- **CFR求解响应**：<500ms（P95），超过2s降级返回简化建议（F-004约束）
- **BOT决策延迟**：<200ms计算时间 + 200-500ms模拟思考动画（F-002约束）
- **翻前范围表查询**：<1ms（O(1)查表）
- **UI交互响应**：<100ms行动反馈（按钮状态变化）
- **历史列表渲染**：10000手牌虚拟滚动，首屏<200ms
- **IndexedDB读写**：单手牌写入<10ms，列表查询<50ms

### 安全考虑
- 纯客户端应用，无敏感数据传输
- IndexedDB数据为游戏记录，无PII风险
- 随机数发牌使用`crypto.getRandomValues()`确保公平性
- 无XSS风险（无用户生成内容注入点）

### 可扩展性
- **后端化预留**：服务层按API契约设计，未来可替换为HTTP调用
- **WASM升级路径**：CFR求解器接口抽象，后续可替换为WebAssembly实现提升性能
- **范围表扩展**：翻前范围数据结构支持添加更多场景（如squeeze、cold 4bet等）
- **存储上限管控**：IndexedDB手牌历史上限10000手，自动清理最旧记录
- **BOT策略可插拔**：BotStrategy接口支持添加新难度级别