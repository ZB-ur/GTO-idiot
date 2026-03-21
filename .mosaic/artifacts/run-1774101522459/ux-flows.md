## User Journeys

### Flow 1: New Session & Game Play (game-session-flow)
**Covers: F-001, F-002, F-004, F-008**

1. **Landing / Dashboard** → 用户点击「开始新牌局」按钮
2. **Seat Selection** → 选择座位（自动分配 or 手动选座），系统分配 5 个不同风格 BOT（TAG/LAG/TP/LP/GTO）
3. **Game Table** → 进入 6 人桌牌桌视图，所有玩家 100BB 起始筹码，盲注自动扣除
4. **Preflop Action** → 用户查看手牌，根据位置依次行动（UTG→MP→CO→BTN→SB→BB），用户通过行动按钮决策（Fold/Check/Call/Bet/Raise/All-in），Raise 使用金额滑块调整
5. **Flop / Turn / River** → 公共牌依次翻出，每轮重复下注流程，底池实时更新
6. **Showdown & Settlement** → 摊牌比大小，筹码结算动画，显示赢家及筹码变动
7. **Next Hand** → 自动开始下一手（位置轮转 BTN+1），循环回到步骤 3
8. **Pause / End Session** → 用户可随时暂停或结束会话 → 显示本次会话统计摘要（手数、盈亏、时长）

**异常分支：**
- 用户 All-in → 触发边池计算逻辑
- 所有对手 Fold → 用户直接赢得底池，跳过摊牌
- 用户 Fold → 旁观剩余玩家行动至本手结束

---

### Flow 2: Hand History Browsing (hand-history-flow)
**Covers: F-005**

1. **Dashboard** → 用户点击「历史牌局」标签
2. **History List** → 按时间倒序展示牌局列表（牌局 ID、时间、结果摘要、盈亏）
3. **Hand Detail** → 点击单条记录查看完整牌局信息（座位、手牌、公共牌、行动序列、最终结果）
4. **Delete Record** → 用户可删除单条历史记录，确认弹窗后执行
5. **Enter Replay** → 从详情页点击「复盘」进入回放模式（→ Flow 3）

---

### Flow 3: Hand Replay & GTO Review (hand-replay-flow)
**Covers: F-003, F-006**

1. **Enter Replay** → 从历史牌局详情或牌局结束后进入回放
2. **Timeline View** → 展示牌局完整时间线（Preflop → Flop → Turn → River → Showdown），可点击任意决策点跳转
3. **Decision Point View** → 每个决策点展示：
   - 当时游戏状态（底池、各玩家筹码、公共牌）
   - 用户实际选择的行动（高亮标注）
   - GTO 推荐的行动 + 各动作 EV 值（以 BB 为单位）
   - EV 差值 = 用户行动 EV − GTO 最优 EV
4. **Quality Color Coding** → 决策质量颜色标注：🟢 绿色（EV 差 < 0.5BB）、🟡 黄色（0.5-2BB）、🔴 红色（> 2BB）
5. **Step Navigation** → 前进/后退按钮逐步回放，支持键盘快捷键（←/→）
6. **Return** → 回到历史列表或继续下一局

---

### Flow 4: Statistics Dashboard (stats-dashboard-flow)
**Covers: F-007**

1. **Dashboard** → 用户点击「统计面板」标签
2. **Overview Stats** → 展示总览数据：总牌局/手数、胜率、累计盈亏(BB)、累计 EV 损失
3. **Position Breakdown** → 按位置（BTN/SB/BB/UTG/MP/CO）分组的胜率和 EV 损失
4. **Street Breakdown** → 按街（Preflop/Flop/Turn/River）的 EV 损失分布柱状图
5. **Trend Chart** → 盈亏趋势折线图（按手数或会话）
6. **Drill Down** → 点击某个位置/街可筛选对应的历史牌局列表（→ Flow 2）

---

### Flow 5: Session Management (session-mgmt-flow)
**Covers: F-008**

1. **Resume Session** → Dashboard 检测到未完成会话 → 显示「继续上次牌局」入口
2. **Pause** → 牌局进行中点击暂停 → 保存当前状态 → 可随时返回 Dashboard
3. **End Session** → 点击结束 → 显示会话统计摘要弹窗（起止时间、手数、盈亏、平均 EV 损失）→ 确认后回到 Dashboard

---

## Interaction Rules

### 表单与输入
- **Raise 金额滑块**：最小值 = 当前最小加注额，最大值 = 玩家当前筹码（All-in），步进为 0.5BB；支持手动输入精确金额，输入失焦时校验范围合法性
- **座位选择**：点击空座位即选定，已有 BOT 的座位不可选；默认自动分配随机座位

### 行动按钮状态
- 当前非用户行动回合 → 所有行动按钮禁用（灰色）
- 行动按钮仅显示当前合法动作（如：面对加注时不显示 Check，仅显示 Fold/Call/Raise）
- Bet/Raise 按钮点击后展开金额滑块面板，确认后提交
- All-in 按钮需二次确认（防误操作）

### 加载状态
- GTO 计算（Web Worker）进行中 → 回放页决策点显示「计算中...」骨架屏，计算完成后渐入显示 EV 数据
- 牌局历史加载 → 列表区域显示骨架屏占位符
- IndexedDB 初始化 → 首次加载显示简短初始化进度

### 错误处理
- IndexedDB 不可用 → 顶部 Toast 警告「存储不可用，历史记录将无法保存」，游戏仍可继续
- Web Worker 计算超时（>5s）→ 显示「计算超时，使用简化估算」，降级到快速启发式结果
- 数据损坏 → 单条记录加载失败时在列表中标注「数据异常」，不影响其他记录

### 动画与过渡
- 发牌 → 卡牌从牌堆飞入各玩家区域（200ms）
- 公共牌翻牌 → 卡牌翻转动画（150ms）
- 筹码变动 → 筹码数字滚动动画（300ms）
- 页面切换 → 淡入淡出（200ms）

### 回放交互
- 前进/后退 → 点击按钮或键盘 ←/→
- 时间线点击 → 直接跳转到对应决策点
- EV 差值 hover → Tooltip 展示详细计算依据

### 数据持久化
- 每手牌结束时自动写入 IndexedDB，无需用户手动保存
- 删除历史记录需确认弹窗，不可撤销
- 统计数据从历史记录实时聚合，不单独缓存

---

## Component Inventory

### 布局组件
- **AppShell**: 顶层布局容器，包含顶部导航栏和主内容区域，管理页面级路由（对战/历史/统计）
- **TopNav**: 顶部导航栏，包含 Logo、标签页切换（对战/历史/统计）、当前会话状态指示器

### 牌桌组件
- **PokerTable**: 6 人桌牌桌主视图（Canvas/SVG），渲染椭圆桌面、座位布局、公共牌区域、底池显示区
- **PlayerSeat**: 单个玩家座位组件，展示：玩家名/BOT 风格标识、筹码量、位置标签（BTN/SB/BB/UTG/MP/CO）、手牌（用户可见/BOT 背面）、当前行动状态高亮、Dealer Button 标记
- **CommunityCards**: 公共牌展示区域（最多 5 张），支持逐张翻牌动画
- **PotDisplay**: 底池金额显示，支持主池 + 边池分别展示
- **Card**: 单张扑克牌组件，支持正面/背面状态、翻转动画，花色颜色区分（红/黑）

### 行动组件
- **ActionPanel**: 用户行动操作面板，根据当前合法动作动态显示按钮组合
- **ActionButton**: 单个行动按钮（Fold/Check/Call/Bet/Raise/All-in），支持禁用态、激活态、金额显示
- **RaiseSlider**: 加注金额滑块，含最小/最大标记、当前值显示、快捷按钮（1/2 Pot, 3/4 Pot, Pot, All-in）、手动输入框
- **ConfirmDialog**: 通用确认弹窗，用于 All-in 确认、删除记录确认等

### 历史与回放组件
- **HandHistoryList**: 历史牌局列表，支持时间倒序排列、无限滚动加载、单条删除
- **HandHistoryItem**: 单条牌局摘要卡片，展示时间、手牌缩略、结果（赢/输）、盈亏金额
- **HandReplayViewer**: 回放主视图容器，包含牌桌快照 + 决策分析面板 + 时间线控制
- **ReplayTimeline**: 回放时间线控制条，标注各街和决策点，支持点击跳转
- **ReplayControls**: 前进/后退/播放/暂停按钮组
- **DecisionAnalysis**: GTO 决策分析面板，展示各动作 EV 值、用户实际选择、EV 差值、质量颜色标注

### 统计组件
- **StatsOverview**: 统计总览卡片组（总手数、胜率、累计盈亏、累计 EV 损失、平均每手 EV 损失）
- **StatCard**: 单个统计指标卡片，含标题、数值、趋势箭头
- **PositionStatsTable**: 按位置分组的统计表格（胜率 + EV 损失）
- **StreetEVChart**: 按街的 EV 损失分布柱状图
- **ProfitTrendChart**: 盈亏趋势折线图（X 轴=手数/会话，Y 轴=累计盈亏 BB）

### 会话组件
- **NewSessionDialog**: 新建牌局对话框，座位选择（自动/手动）
- **SessionStatusBar**: 当前会话状态栏，显示会话时长、当前手数、实时盈亏
- **SessionSummaryModal**: 会话结束统计摘要弹窗

### 通用组件
- **Toast**: 全局轻提示（成功/警告/错误）
- **Skeleton**: 骨架屏占位组件（用于 GTO 计算加载、列表加载等）
- **EmptyState**: 空状态占位（无历史记录、无统计数据时的引导提示）
- **Tooltip**: 悬浮提示组件（用于 EV 计算详情、BOT 风格说明等）
- **Badge**: 标签徽章（位置标识、BOT 风格标识、决策质量颜色标注）