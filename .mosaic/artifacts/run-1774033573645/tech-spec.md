## Architecture Overview

GTO Idiot 是一个纯浏览器端的德州扑克 GTO 策略练习器。架构采用 **Next.js 静态导出 + 客户端服务层** 模式：所有逻辑在浏览器内运行，API spec 中定义的接口实现为本地 TypeScript 服务类（非 HTTP 请求），数据持久化使用 IndexedDB（Dexie.js）。

**关键架构决策：**
1. **服务层模式**：API spec 中的每个 tag 对应一个 Service 类，组件通过 React hooks 调用 Service，Service 操作引擎和数据库。这保持了清晰的关注点分离，且未来可无缝迁移到真实后端。
2. **游戏引擎独立**：扑克引擎作为纯函数式状态机，不依赖 UI 或存储层，便于单元测试。
3. **GTO 数据静态加载**：预计算 GTO 数据以 JSON 文件形式打包进 bundle，按需懒加载（preflop ~50KB, postflop ~200-500KB）。
4. **状态管理**：使用 Zustand 管理全局游戏状态，避免 prop drilling，保持轻量。

```
┌─────────────────────────────────────────────────┐
│                   Next.js Pages                  │
│  HomePage │ GameTable │ HandHistory │ Stats │ ... │
├─────────────────────────────────────────────────┤
│              React Hooks Layer                   │
│  useSession │ useGame │ useReplay │ useStats     │
├─────────────────────────────────────────────────┤
│              Service Layer (内部 API)             │
│  SessionService │ GameService │ GTOService │ ... │
├──────────┬──────────┬───────────┬───────────────┤
│ Poker    │ BOT      │ GTO Data  │ Stats         │
│ Engine   │ Engine   │ Provider  │ Aggregator    │
├──────────┴──────────┴───────────┴───────────────┤
│           Dexie.js (IndexedDB)                   │
│  sessions │ hands │ actions │ stats_cache        │
└─────────────────────────────────────────────────┘
```

## Tech Stack

| 技术 | 用途 | 理由 |
|------|------|------|
| **Next.js 14** (App Router, static export) | 框架 | PRD 指定；静态导出满足纯浏览器端约束 |
| **React 18** | UI | PRD 指定 |
| **TypeScript** (strict mode) | 语言 | PRD 指定；类型安全对扑克引擎复杂逻辑至关重要 |
| **Tailwind CSS** | 样式 | PRD 指定；快速构建牌桌 UI |
| **Zustand** | 状态管理 | 轻量，适合游戏状态频繁更新，比 Context 性能更好 |
| **Dexie.js** | IndexedDB 封装 | PRD 指定；提供类 ORM 查询能力 |
| **Recharts** | 图表 | PRD 指定；统计面板柱状图/雷达图/折线图 |
| **Framer Motion** | 动画 | 发牌、筹码移动等游戏动画，声明式 API |
| **uuid** | ID 生成 | API spec 中所有实体使用 UUID |
| **vitest** | 测试 | 快速，原生 TypeScript 支持，适合测试扑克引擎 |

## Module Breakdown

### Module: poker-engine
- **职责**：完整的 6-max NLHE 牌局引擎——洗牌、发牌、下注轮管理、底池/边池计算、摊牌比牌、筹码结算。纯函数式状态机，输入当前 GameState + Action，输出新 GameState。
- **关键接口**：
  - `createDeck(): Card[]` — 生成并洗牌
  - `dealHand(session: Session): GameState` — 发新手牌，初始化 preflop
  - `applyAction(state: GameState, action: PlayerAction): GameState` — 应用玩家/BOT 动作，推进状态
  - `getAvailableActions(state: GameState, seatIndex: number): AvailableAction[]` — 计算合法动作
  - `evaluateHand(cards: Card[]): HandRanking` — 5/7 张牌取最优牌型
  - `resolveShowdown(state: GameState): HandResult` — 摊牌比牌+边池分配
  - `calculatePots(state: GameState): PotInfo` — 主池+边池计算
- **关键文件**：
  - `src/engine/deck.ts` — 洗牌与发牌
  - `src/engine/state-machine.ts` — 游戏状态机核心
  - `src/engine/pot-calculator.ts` — 底池/边池计算
  - `src/engine/hand-evaluator.ts` — 牌型评估（基于查表法）
  - `src/engine/showdown.ts` — 摊牌逻辑
  - `src/engine/types.ts` — 引擎内部类型
- **Covers**: F-001

### Module: bot-ai
- **职责**：5 种风格 BOT 的决策引擎。每种 BOT 基于手牌范围 + 风格参数的决策树，输入游戏上下文，输出动作。
- **关键接口**：
  - `BotEngine.decide(request: BotDecisionRequest): BotDecisionResponse` — 统一决策入口
  - `BotProfile` — 风格参数配置（VPIP、PFR、aggression factor、bluff frequency 等）
  - `HandRangeTable` — 各风格各位置的手牌范围表
- **关键文件**：
  - `src/bot/bot-engine.ts` — BOT 决策入口 + 策略分发
  - `src/bot/profiles.ts` — 5 种 BOT 风格参数定义
  - `src/bot/hand-ranges.ts` — 各风格手牌范围表
  - `src/bot/decision-tree.ts` — 通用决策树框架
  - `src/bot/postflop-logic.ts` — 翻后决策逻辑（C-bet、bluff、value bet）
- **Covers**: F-002

### Module: gto-data
- **职责**：GTO 策略数据的存储、加载与查询。提供 preflop 和 postflop 的 GTO 策略查表、玩家决策 vs GTO 对比评估、EV 分析计算。
- **关键接口**：
  - `GTOProvider.getPreflopStrategy(position, scenario, openerPosition?): PreflopStrategy`
  - `GTOProvider.getPostflopStrategy(scenario, position, street, boardTexture?): PostflopStrategy`
  - `GTOEvaluator.evaluateDecision(hand, decisionIndex): GTOEvaluation`
  - `EVCalculator.calculateEV(playerAction, gtoActions, potSize): EVAnalysis`
- **关键文件**：
  - `src/gto/provider.ts` — GTO 数据加载与查询
  - `src/gto/evaluator.ts` — 决策评估逻辑
  - `src/gto/ev-calculator.ts` — EV 计算
  - `src/gto/data/preflop/` — Preflop 策略 JSON 文件（按位置×场景组织）
  - `src/gto/data/postflop/` — Postflop 策略 JSON 文件（按场景×街道组织）
- **Covers**: F-003, F-007

### Module: game-service
- **职责**：对战流程编排层，桥接 UI hooks 与底层引擎。管理牌局生命周期（发牌→下注轮→摊牌→结算→下一手），协调 poker-engine 和 bot-ai 的调用，生成 BOT 动作事件序列供 UI 动画消费。
- **关键接口**：
  - `GameService.dealNewHand(sessionId): GameState`
  - `GameService.submitPlayerAction(sessionId, action): ActionResult`
  - `GameService.getCurrentState(sessionId): GameState`
- **关键文件**：
  - `src/services/game-service.ts` — 对战流程编排
  - `src/services/session-service.ts` — Session CRUD + 状态管理
- **Covers**: F-001, F-002, F-009

### Module: data-layer
- **职责**：IndexedDB 数据持久化层。定义数据库 schema，提供 CRUD 操作，管理 session/hand/action 的存储与查询。
- **关键接口**：
  - `db.sessions` — Session 表 CRUD
  - `db.hands` — Hand 表 CRUD + 筛选查询
  - `db.actions` — Action 表（嵌入 Hand 中或独立索引）
  - `HandHistoryService.listHands(filters): HandListResponse`
  - `HandHistoryService.getHand(handId): Hand`
  - `HandHistoryService.saveHand(hand): void`
- **关键文件**：
  - `src/db/database.ts` — Dexie 数据库定义 + migration
  - `src/db/schema.ts` — 表结构类型定义
  - `src/services/hand-history-service.ts` — 牌局历史查询服务
- **Covers**: F-005

### Module: replay
- **职责**：复盘数据组装。从历史牌局数据构建完整复盘视图——每个决策点的牌桌快照、GTO 评估、EV 分析。
- **关键接口**：
  - `ReplayService.getHandReplay(handId): HandReplay`
  - `ReplayService.getHandEVSummary(handId): HandEVSummary`
  - `buildDecisionPoints(hand: Hand): DecisionPoint[]` — 从原始牌局提取人类玩家决策点
  - `buildTableSnapshot(hand: Hand, actionIndex: number): TableSnapshot`
- **关键文件**：
  - `src/services/replay-service.ts` — 复盘数据组装
  - `src/services/ev-summary-service.ts` — EV 汇总计算
- **Covers**: F-006, F-007

### Module: stats
- **职责**：长期统计聚合。从历史牌局数据计算各维度统计（按位置/街道/场景），与 GTO 标准频率对比，支持下钻。
- **关键接口**：
  - `StatsService.getOverview(handRange): OverviewStats`
  - `StatsService.getByPosition(handRange): PositionStats`
  - `StatsService.getByStreet(handRange): StreetStats`
  - `StatsService.getByScenario(handRange): ScenarioStats`
  - `StatsService.getDrilldown(scenario, handRange): DrilldownResponse`
- **关键文件**：
  - `src/services/stats-service.ts` — 统计聚合逻辑
  - `src/services/stats-cache.ts` — 统计缓存（避免重复聚合）
- **Covers**: F-008

### Module: export
- **职责**：数据导出。将牌局数据转换为标准 Hand History 文本格式或 JSON 格式，触发浏览器下载。
- **关键接口**：
  - `ExportService.exportHands(request): ExportResult`
  - `ExportService.exportStats(request): StatsExportResult`
  - `HHFormatter.formatHand(hand: Hand): string` — 单手牌 HH 文本格式化
- **关键文件**：
  - `src/services/export-service.ts` — 导出编排
  - `src/export/hh-formatter.ts` — Hand History 文本格式化器
  - `src/export/download.ts` — 浏览器文件下载工具
- **Covers**: F-010

### Module: game-ui
- **职责**：对战界面 UI 组件。牌桌渲染、玩家座位、操作面板、动画效果。
- **关键文件**：
  - `src/components/game/GameTable.tsx` — 牌桌主容器
  - `src/components/game/PokerTable.tsx` — 牌桌可视化（椭圆 + 6 座位）
  - `src/components/game/PlayerSeat.tsx` — 座位组件
  - `src/components/game/CommunityCards.tsx` — 公共牌
  - `src/components/game/PotDisplay.tsx` — 底池展示
  - `src/components/game/PlayingCard.tsx` — 扑克牌组件
  - `src/components/game/ActionPanel.tsx` — 操作面板
  - `src/components/game/RaiseSlider.tsx` — 加注滑块
  - `src/components/game/ShowdownOverlay.tsx` — 摊牌浮层
  - `src/components/game/BetTimeline.tsx` — 下注时间线
- **Covers**: F-004

### Module: session-ui
- **职责**：Session 管理相关 UI——首页、Session 配置/暂停/汇总弹窗。
- **关键文件**：
  - `src/app/page.tsx` — 首页
  - `src/components/session/SessionConfigModal.tsx`
  - `src/components/session/SessionPauseModal.tsx`
  - `src/components/session/SessionSummaryModal.tsx`
  - `src/components/session/SessionProfitChart.tsx`
  - `src/components/home/RecentSessionCard.tsx`
  - `src/components/home/QuickStartPanel.tsx`
- **Covers**: F-009, F-004

### Module: history-ui
- **职责**：历史牌局浏览 UI——列表、筛选、摘要卡片。
- **关键文件**：
  - `src/app/history/page.tsx` — 历史记录页
  - `src/components/history/HandHistoryList.tsx`
  - `src/components/history/HandHistoryCard.tsx`
  - `src/components/history/HandHistoryFilter.tsx`
  - `src/components/history/ScenarioTag.tsx`
- **Covers**: F-005

### Module: replay-ui
- **职责**：复盘界面 UI——牌桌快照、决策点对比、EV 分析、导航控制。
- **关键文件**：
  - `src/app/replay/[handId]/page.tsx` — 复盘页
  - `src/components/replay/HandReplayView.tsx`
  - `src/components/replay/ReplayTableSnapshot.tsx`
  - `src/components/replay/DecisionPointPanel.tsx`
  - `src/components/replay/GTOFrequencyChart.tsx`
  - `src/components/replay/DeviationBadge.tsx`
  - `src/components/replay/EVAnalysisCard.tsx`
  - `src/components/replay/ReplayNavBar.tsx`
  - `src/components/replay/StreetJumpNav.tsx`
  - `src/components/replay/DecisionTimeline.tsx`
  - `src/components/replay/HandSummaryFooter.tsx`
- **Covers**: F-006, F-007

### Module: stats-ui
- **职责**：统计面板 UI——概览卡片、各维度图表、下钻面板。
- **关键文件**：
  - `src/app/stats/page.tsx` — 统计面板页
  - `src/components/stats/StatsDashboard.tsx`
  - `src/components/stats/TimeRangeSelector.tsx`
  - `src/components/stats/OverviewStatsCards.tsx`
  - `src/components/stats/PositionStatsChart.tsx`
  - `src/components/stats/StreetStatsChart.tsx`
  - `src/components/stats/ScenarioRadarChart.tsx`
  - `src/components/stats/DrilldownPanel.tsx`
- **Covers**: F-008

### Module: shared-ui
- **职责**：通用 UI 组件——布局、模态框、Toast、骨架屏等。
- **关键文件**：
  - `src/components/layout/AppShell.tsx`
  - `src/components/layout/TopNav.tsx`
  - `src/components/layout/PageContainer.tsx`
  - `src/components/common/Modal.tsx`
  - `src/components/common/Toast.tsx`
  - `src/components/common/ConfirmDialog.tsx`
  - `src/components/common/Skeleton.tsx`
  - `src/components/common/EmptyState.tsx`
  - `src/components/common/ChipStack.tsx`
  - `src/components/common/Tooltip.tsx`
  - `src/components/export/ExportModal.tsx`
  - `src/components/export/ExportButton.tsx`
- **Covers**: F-004, F-005, F-006, F-008, F-010

### Module: hooks
- **职责**：React hooks 层，桥接 UI 组件与 Service 层。管理加载/错误状态。
- **关键文件**：
  - `src/hooks/useSession.ts` — Session 操作 hook
  - `src/hooks/useGame.ts` — 对战状态 + 动作提交 hook
  - `src/hooks/useHandHistory.ts` — 历史牌局查询 hook
  - `src/hooks/useReplay.ts` — 复盘数据 + 导航 hook
  - `src/hooks/useStats.ts` — 统计数据 hook
  - `src/hooks/useExport.ts` — 导出操作 hook
- **Covers**: F-001, F-004, F-005, F-006, F-008, F-009

### Module: store
- **职责**：Zustand 全局状态管理。游戏状态、当前 session、UI 状态。
- **关键文件**：
  - `src/store/game-store.ts` — 当前游戏状态 store
  - `src/store/session-store.ts` — 当前 session store
  - `src/store/ui-store.ts` — UI 状态（toast queue、modal stack）
- **Covers**: F-001, F-004, F-009

## Implementation Tasks

| ID | Task | Module | Covers Features | Priority |
|---|---|---|---|---|
| T-001 | 项目脚手架：Next.js 14 + TypeScript strict + Tailwind CSS + Zustand + Dexie.js + Recharts + Framer Motion + Vitest 初始化 | core | F-001, F-004 | 1 |
| T-002 | 定义核心类型系统：Card, Player, GameState, Action, Position, Street 等 TypeScript 类型（对齐 API spec schemas） | core | F-001, F-002, F-003 | 2 |
| T-003 | 实现 Dexie 数据库层：定义 sessions/hands 表 schema，CRUD 操作，migration | data-layer | F-005, F-009 | 3 |
| T-004 | 实现洗牌与发牌模块：Fisher-Yates 洗牌，hole card 分发 | poker-engine | F-001 | 4 |
| T-005 | 实现牌型评估器：7 张取最优 5 张，支持所有标准牌型（高牌到皇家同花顺），基于查表法优化 | poker-engine | F-001 | 5 |
| T-006 | 实现游戏状态机核心：下注轮管理（preflop→flop→turn→river），合法动作计算，street 推进逻辑 | poker-engine | F-001 | 6 |
| T-007 | 实现底池计算与边池处理：支持多人 all-in 的正确边池分配 | poker-engine | F-001 | 7 |
| T-008 | 实现摊牌与结算：比牌逻辑 + 主池/边池筹码分配 + 平分池处理 | poker-engine | F-001 | 8 |
| T-009 | Poker Engine 单元测试：覆盖发牌、状态推进、边池、摊牌等核心场景 | poker-engine | F-001 | 9 |
| T-010 | 构建 GTO Preflop 策略数据集：6 位置 × 4 场景（open/vs_open/vs_3bet/vs_4bet）的手牌范围 + 动作频率 JSON | gto-data | F-003 | 10 |
| T-011 | 构建 GTO Postflop 策略数据集：7 场景 × 位置 × 街道 × 牌面纹理的动作频率 JSON | gto-data | F-003 | 11 |
| T-012 | 实现 GTO Provider：按需加载策略 JSON，查表返回策略数据 | gto-data | F-003 | 12 |
| T-013 | 实现 BOT 风格参数配置：5 种 BOT 的 VPIP/PFR/aggression/bluff frequency 等参数 + 手牌范围表 | bot-ai | F-002 | 13 |
| T-014 | 实现 BOT 决策引擎：通用决策树框架 + 各风格 Preflop/Postflop 逻辑，确保 <200ms 延迟 | bot-ai | F-002 | 14 |
| T-015 | BOT 行为个性化验证：Fish limp-call、Nit 不 bluff、LAG 宽范围 aggression 等行为测试 | bot-ai | F-002 | 15 |
| T-016 | 实现 GameService：编排发牌→玩家动作→BOT 动作→street 推进→摊牌完整流程 | game-service | F-001, F-002 | 16 |
| T-017 | 实现 SessionService：Session CRUD + 状态流转（active/paused/completed）+ 筹码初始化 | game-service | F-009 | 17 |
| T-018 | 实现通用 UI 组件：AppShell, TopNav, Modal, Toast, ConfirmDialog, Skeleton, EmptyState | shared-ui | F-004 | 18 |
| T-019 | 实现 PlayingCard 组件：正面（花色+点数+颜色）、背面、翻转动画 | game-ui | F-004 | 19 |
| T-020 | 实现 PokerTable + PlayerSeat：椭圆牌桌布局、6 座位定位、位置标签、筹码显示、状态指示 | game-ui | F-004 | 20 |
| T-021 | 实现 CommunityCards + PotDisplay + DealerButton | game-ui | F-004 | 21 |
| T-022 | 实现 ActionPanel + RaiseSlider：操作按钮、金额滑块联动、快捷金额按钮、合法性校验 | game-ui | F-004 | 22 |
| T-023 | 实现 GameTable 主容器 + useGame hook：集成所有游戏组件，管理对战状态流 | game-ui | F-001, F-004 | 23 |
| T-024 | 实现游戏动画：发牌飞入、筹码滑入底池、公共牌翻转、赢家高亮 + 筹码收回 | game-ui | F-004 | 24 |
| T-025 | 实现 ShowdownOverlay + BetTimeline | game-ui | F-004 | 25 |
| T-026 | 实现 BOT 思考动画：跳动圆点 + 500-1500ms 随机延迟 + 顺序播放 BOT 动作 | game-ui | F-002, F-004 | 26 |
| T-027 | 实现首页 + Session 管理 UI：HomePage, QuickStartPanel, RecentSessionCard, SessionConfigModal | session-ui | F-009 | 27 |
| T-028 | 实现 SessionPauseModal + SessionSummaryModal + SessionProfitChart | session-ui | F-009 | 28 |
| T-029 | 实现 HandHistoryService：牌局自动保存（每手结束写入 IndexedDB）+ 场景标签自动生成 | data-layer | F-005 | 29 |
| T-030 | 实现历史牌局 UI：HandHistoryList + HandHistoryCard + HandHistoryFilter + ScenarioTag | history-ui | F-005 | 30 |
| T-031 | 实现 GTO 评估器：玩家决策 vs GTO 策略对比，偏差程度判定（none/minor/major） | gto-data | F-006, F-007 | 31 |
| T-032 | 实现 EV 计算器：基于预存策略的 EV 查表 + EV loss 计算 | gto-data | F-007 | 32 |
| T-033 | 实现 ReplayService：从 Hand 数据构建 DecisionPoint 列表 + TableSnapshot + GTO 评估 | replay | F-006, F-007 | 33 |
| T-034 | 实现复盘 UI 核心：HandReplayView + ReplayTableSnapshot + DecisionPointPanel | replay-ui | F-006 | 34 |
| T-035 | 实现复盘 GTO 对比组件：GTOFrequencyChart + DeviationBadge + EVAnalysisCard | replay-ui | F-006, F-007 | 35 |
| T-036 | 实现复盘导航：ReplayNavBar + StreetJumpNav + DecisionTimeline + 键盘快捷键 + 自动回放 | replay-ui | F-006 | 36 |
| T-037 | 实现 HandSummaryFooter：总 EV 损失汇总 + 关键偏差点列表 | replay-ui | F-007 | 37 |
| T-038 | 实现 StatsService：按位置/街道/场景聚合统计 + GTO 标准频率对比 + 下钻查询 | stats | F-008 | 38 |
| T-039 | 实现统计面板 UI：StatsDashboard + TimeRangeSelector + OverviewStatsCards | stats-ui | F-008 | 39 |
| T-040 | 实现统计图表：PositionStatsChart + StreetStatsChart (柱状图) + ScenarioRadarChart (雷达图) | stats-ui | F-008 | 40 |
| T-041 | 实现 DrilldownPanel：场景下钻手牌列表 | stats-ui | F-008 | 41 |
| T-042 | 实现数据导出：HH 文本格式化器 + JSON 导出 + 浏览器下载触发 | export | F-010 | 42 |
| T-043 | 实现导出 UI：ExportModal + ExportButton | shared-ui | F-010 | 43 |
| T-044 | Session 暂停/恢复与数据持久化：浏览器关闭后重新打开可恢复未完成 session | data-layer | F-009 | 44 |
| T-045 | 全局错误处理：IndexedDB 不可用检测 + Toast 警告 + 引擎异常恢复 Modal | shared-ui | F-004 | 45 |
| T-046 | E2E 集成测试：完整对战流程 → 牌局保存 → 复盘 → 统计更新 | core | F-001, F-005, F-006, F-008 | 46 |

## Data Model

### IndexedDB Tables (Dexie.js)

```
sessions
├── id: string (PK, UUID)
├── status: 'active' | 'paused' | 'completed'
├── stackDepthBB: number
├── players: Player[]  (JSON, 6 players with current chips)
├── handCount: number
├── profitLossBB: number
├── currentHandId: string | null
├── dealerSeatIndex: number
├── profitCurve: {handNumber, profitBB}[]
├── createdAt: Date (indexed)
└── updatedAt: Date

hands
├── id: string (PK, UUID)
├── sessionId: string (indexed, FK → sessions)
├── handNumber: number
├── players: Player[] (JSON, snapshot at hand start)
├── streets: StreetData[] (JSON, all actions per street)
├── result: HandResult (JSON)
├── scenarioTags: string[] (multi-entry indexed)
├── profitLossBB: number (indexed)
├── dealerSeatIndex: number
├── humanPosition: Position
└── createdAt: Date (indexed)
```

**索引策略**：
- `sessions`: `id`, `status`, `createdAt`
- `hands`: `id`, `sessionId`, `createdAt`, `[sessionId+handNumber]`（复合索引），`scenarioTags`（多值索引），`profitLossBB`

**实体关系**：
```
Session 1 ──── N Hand
Hand 内嵌 StreetData[] → Action[]
Hand 内嵌 HandResult → Winner[] + HandRanking[]
```

**设计决策**：
- Action 数据内嵌在 Hand.streets 中而非独立表，因为查询总是按整手牌读取
- Player 快照内嵌在 Hand 中（记录手牌开始时各玩家状态），避免跨表 join
- 统计数据按需从 hands 表聚合计算，可加 stats_cache 缓存层优化

### GTO 数据结构（静态 JSON）

```
gto/
├── preflop/
│   ├── open.json          # {[position]: HandRange[]}
│   ├── vs_open.json       # {[heroPosition]: {[openerPosition]: HandRange[]}}
│   ├── vs_3bet.json       # {[heroPosition]: {[3betterPosition]: HandRange[]}}
│   └── vs_4bet.json       # {[heroPosition]: HandRange[]}
└── postflop/
    ├── srp_ip_cbet.json
    ├── srp_oop_vs_cbet.json
    ├── 3bet_pot_cbet.json
    ├── 3bet_pot_vs_cbet.json
    ├── donk_bet.json
    ├── probe_bet.json
    └── check_raise.json
```

## Non-Functional Requirements

### Performance
- **BOT 决策延迟 < 200ms**：决策树为纯 JS 计算，无 I/O 阻塞，通过预加载手牌范围表确保查表速度。基准测试验证。
- **GTO 数据首次加载 < 500ms**：Preflop 数据 ~50KB 随 bundle 加载，Postflop 数据 ~200-500KB 按需动态 import，利用 Next.js 代码分割。
- **UI 渲染 60fps**：游戏动画使用 Framer Motion 的 GPU 加速 transform 动画，避免 layout thrashing。
- **IndexedDB 写入不阻塞 UI**：手牌保存在 requestIdleCallback 或 microtask 中异步完成。
- **统计聚合 < 1s**（1000 手以内）：若超过，引入 stats_cache 表缓存中间结果。

### Security
- **无敏感数据**：纯本地应用，无用户账号，无网络请求，无需 HTTPS/CORS/认证。
- **CSP 头设置**：Next.js 静态导出配置 Content-Security-Policy，禁止外部脚本注入。
- **洗牌随机性**：使用 `crypto.getRandomValues()` 而非 `Math.random()`，确保牌序不可预测。

### Scalability & 可维护性
- **模块隔离**：poker-engine、bot-ai、gto-data 三个核心模块零 UI 依赖，可独立测试和替换。
- **GTO 数据可扩展**：JSON 文件格式和查询接口设计支持未来增加更多 spot 覆盖或接入真实 solver 数据。
- **BOT 可扩展**：BotProfile 参数化设计，未来可开放自定义风格（当前 Out of Scope）。
- **数据库 migration**：Dexie.js 内置 version migration，支持 schema 演进。

### Browser Compatibility
- 目标：Chrome/Firefox/Safari/Edge 最新版本（桌面端）
- IndexedDB 兼容性检测 + 降级提示
- 不做移动端适配（PRD 约束）