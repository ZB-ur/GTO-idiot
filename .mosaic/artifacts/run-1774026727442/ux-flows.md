## User Journeys

### Flow 1: Game Setup & Launch (game-setup-flow)
**Covers: F-009, F-003, F-010**

1. 用户进入应用首页（游戏大厅）→ 看到快速开始入口 + 历史统计摘要
2. 点击「开始牌局」→ 进入开局设置面板
3. 选择座位位置（6 选 1：UTG / MP / CO / BTN / SB / BB）→ 牌桌预览高亮选中座位
4. 为 5 个对手分别选择 Bot 风格（GTO / LAG / TAG / Fish）→ 每个座位显示风格标签
5. 确认设置 → 点击「开始」→ 进入牌桌界面，Session 开始，首手牌发出

### Flow 2: Playing a Hand (hand-play-flow)
**Covers: F-001, F-002, F-008, F-010**

1. 系统发牌（Preflop）→ 用户看到自己的两张底牌（明牌），对手显示牌背
2. 按照位置顺序行动 → Bot 依次做出决策（动画展示）→ 轮到用户
3. 操作栏显示当前可用动作（Fold / Check / Call / Bet / Raise / All-in）+ 合法下注范围滑块
4. 用户选择动作 → 底池和筹码即时更新 → 进入下一位玩家或下一 street
5. Flop 发出 3 张公共牌 → 重复行动流程
6. Turn 发出第 4 张 → 重复行动流程
7. River 发出第 5 张 → 重复行动流程
8. 摊牌 → 对手手牌翻开 → 比牌结果 → 底池分配（含边池）→ 赢/输金额动画
9. 短暂结算展示 → 自动进入下一手 OR 用户选择暂停/结束 Session

### Flow 3: Session Management (session-flow)
**Covers: F-010, F-005**

1. Session 进行中 → 顶部状态栏持续显示：当前手数、Session 盈亏、当前筹码
2. 用户点击「暂停」→ 弹出确认 → Session 状态保存到 localStorage → 返回大厅
3. 大厅显示「继续上次牌局」入口 → 点击恢复 → 从暂停点继续
4. 用户点击「结束 Session」→ 展示 Session 汇总面板（总手数、盈亏、GTO 符合率）
5. 汇总面板提供「再来一局」和「查看复盘」入口

### Flow 4: Hand History Browsing (history-flow)
**Covers: F-005**

1. 从大厅或导航进入「牌局历史」页面
2. 默认按时间倒序展示牌局列表 → 每条显示：牌局编号、日期、位置、起手牌缩写、结果（+/- 金额）
3. 使用筛选栏：按日期范围 / 座位位置 / 结果（盈利/亏损）过滤
4. 点击某一手牌 → 展开详情：完整的每 street 动作序列、公共牌、最终结果
5. 详情中提供「进入复盘」按钮 → 跳转到复盘模式
6. 支持「导出 JSON」按钮 → 下载全部或筛选后的历史记录
7. 支持「清理历史」→ 二次确认弹窗 → 清除 localStorage 数据

### Flow 5: Hand Review / Replay (review-flow)
**Covers: F-006, F-004**

1. 从历史详情或 Session 汇总进入复盘模式
2. 牌桌以回放模式加载 → 初始状态：Preflop 发牌前
3. 点击「下一步」→ 逐动作回放（每个玩家的每个动作）
4. 到达用户决策点 → 高亮标注区域显示：
   - 用户实际动作（如 "Raise 3BB"）
   - GTO 推荐动作（如 "Call" 或 "Raise 2.5-3.5BB"）
   - 偏差判定图标：✓ 正确 / △ 可接受 / ✗ 错误
   - 近似 EV 损失数值（如 "-0.5BB"）
5. 点击「上一步」可回退到前一动作
6. Street 导航条可直接跳转到 Preflop / Flop / Turn / River
7. 复盘结束 → 显示本手牌的整体评分和所有决策点汇总列表
8. 底部注明"简化 GTO 参考，非 solver 精确解"

### Flow 6: Practice Statistics (stats-flow)
**Covers: F-007**

1. 从大厅或导航进入「练习统计」页面
2. 顶部 KPI 卡片区：总手数 / 整体 GTO 符合率 / 累计 EV 损失
3. GTO 符合率按 street 分类展示（Preflop / Flop / Turn / River 四个指标）
4. 按位置的胜率分布（6 个位置的柱状图或表格）
5. 按 Bot 风格的胜率分布（4 种风格的对比数据）
6. 最近 N 局的 GTO 符合率趋势折线图（可选 N = 20 / 50 / 100）
7. 数据全部从 localStorage 历史记录实时计算

---

## Interaction Rules

### 表单与输入
- **座位选择**：点击牌桌上的空座位进行选择，一次只能选一个，选中态高亮显示
- **Bot 风格选择**：每个对手座位旁的下拉菜单独立选择，默认随机分配
- **下注金额输入**：滑块 + 数字输入框联动，范围限制为 min-raise 到 all-in，实时校验合法性
- **快捷下注按钮**：提供 1/3 Pot / 1/2 Pot / 2/3 Pot / Pot / All-in 快捷选项

### 操作反馈
- **玩家操作**：点击动作按钮后立即执行，无二次确认（Fold 除外，需确认弹窗防误触）
- **Fold 确认**：当用户持有较强手牌时（如顶对以上），Fold 操作弹出「确定要弃牌吗？」确认框
- **Bot 行动**：每个 Bot 动作间隔 0.5-1.5s 随机延迟，模拟思考时间
- **发牌动画**：每张牌 0.2s 飞入动画，公共牌依次翻开

### 加载与状态
- **牌局加载**：首次进入牌桌时显示短暂的洗牌动画（< 1s）
- **历史数据加载**：localStorage 读取，通常即时完成，超过 1000 条时显示加载指示器
- **Session 恢复**：从 localStorage 恢复状态，显示"恢复牌局中..."提示（< 0.5s）

### 错误处理
- **localStorage 满**：当存储接近上限时，提示用户导出并清理旧数据
- **Session 数据损坏**：检测到不完整的 Session 数据时，提示用户是否放弃该 Session
- **浏览器刷新保护**：牌局进行中刷新页面，通过 beforeunload 提示"牌局进行中，确定离开？"

### 导航规则
- **牌局进行中**：隐藏或禁用导航到其他页面的入口，仅显示「暂停」和「结束」按钮
- **复盘模式**：可随时退出返回历史列表，无需保存状态
- **页面间跳转**：大厅 ↔ 牌桌 ↔ 历史 ↔ 统计 之间自由导航（非牌局进行中时）

### 响应式适配
- **桌面端（≥1024px）**：牌桌完整展示，操作栏在桌面下方横向排列
- **平板端（768-1023px）**：牌桌等比缩放，操作栏按钮增大触摸区域
- **移动端（<768px）**：低优先级，基础可用即可，牌桌纵向紧凑布局

---

## Component Inventory

### 布局组件
- **AppShell**: 全局布局壳，包含顶部导航栏和主内容区，管理页面路由
- **TopNavBar**: 顶部导航栏，包含 Logo、页面导航链接（大厅/历史/统计）、当前 Session 状态指示

### 大厅页组件
- **GameLobby**: 游戏大厅主页面，整合快速开始入口、历史摘要和 Session 恢复入口
- **QuickStartCard**: 快速开始卡片，一键以默认设置开始牌局
- **SessionSetupPanel**: 开局设置面板，包含座位选择和 Bot 风格配置
- **SeatSelector**: 六座位可视化选择器，在迷你牌桌上点选座位
- **BotStylePicker**: 单个对手的风格下拉选择器（GTO / LAG / TAG / Fish）
- **ResumeSessionCard**: 恢复未完成 Session 的入口卡片，显示 Session 进度摘要

### 牌桌组件
- **PokerTable**: 核心牌桌容器，绿色椭圆形桌面，管理所有桌面元素的布局
- **PlayerSeat**: 单个座位组件，显示头像、昵称、筹码、当前动作标签、手牌区域
- **PlayerCards**: 手牌显示组件，己方明牌/对手暗牌/摊牌翻开三种状态
- **CommunityCards**: 公共牌区域，居中展示最多 5 张牌，支持逐张翻开动画
- **PotDisplay**: 底池金额显示，位于牌桌中央，含主池和边池
- **PlayingCard**: 单张扑克牌 SVG 组件，支持正面/背面/翻转动画
- **DealerButton**: 庄家按钮位置标识

### 操作组件
- **ActionBar**: 玩家操作栏，横向排列所有可用动作按钮
- **ActionButton**: 单个操作按钮（Fold / Check / Call / Bet / Raise / All-in），根据状态启用/禁用
- **BetSlider**: 下注金额滑块 + 数字输入联动组件，含合法范围限制
- **QuickBetButtons**: 快捷下注按钮组（1/3 Pot / 1/2 Pot / 2/3 Pot / Pot / All-in）
- **FoldConfirmDialog**: Fold 确认弹窗，防止误操作

### Session 状态组件
- **SessionStatusBar**: Session 进行中的顶部状态栏，显示手数/盈亏/筹码
- **SessionSummaryPanel**: Session 结束时的汇总面板，显示总手数/盈亏/GTO 符合率
- **PauseOverlay**: 暂停时的覆盖层，提供继续/结束选项

### 历史记录组件
- **HandHistoryPage**: 历史记录页面容器
- **HistoryFilterBar**: 筛选栏（日期范围、座位位置、盈亏结果筛选）
- **HandHistoryList**: 牌局列表，虚拟滚动支持大量数据
- **HandHistoryCard**: 单条牌局摘要卡片（编号、日期、位置、起手牌、结果）
- **HandDetailPanel**: 牌局详情展开面板，显示完整动作序列
- **ExportButton**: 导出 JSON 按钮
- **ClearHistoryButton**: 清理历史数据按钮（含确认弹窗）

### 复盘组件
- **HandReviewPage**: 复盘模式页面容器
- **ReplayTable**: 回放模式的牌桌（基于 PokerTable，增加回放控制）
- **ReplayControls**: 回放控制条（上一步/下一步/播放/暂停）
- **StreetNavigator**: Street 快速跳转导航条（Preflop / Flop / Turn / River）
- **DecisionAnnotation**: 用户决策点标注组件，显示实际动作、GTO 推荐、偏差判定、EV 损失
- **DeviationBadge**: 偏差判定徽章（✓ 正确 / △ 可接受 / ✗ 错误）
- **EVLossIndicator**: EV 损失数值指示器
- **HandReviewSummary**: 单手复盘结束后的评分和决策点汇总
- **GTODisclaimerBanner**: "简化 GTO 参考"声明横幅

### 统计组件
- **PracticeStatsPage**: 统计面板页面容器
- **KPICardGroup**: 顶部 KPI 卡片组（总手数、GTO 符合率、累计 EV 损失）
- **KPICard**: 单个 KPI 数值卡片
- **StreetAccuracyChart**: 按 Street 分类的 GTO 符合率展示（四列指标）
- **PositionWinRateChart**: 按位置的胜率分布柱状图
- **BotStyleWinRateChart**: 按 Bot 风格的胜率分布图
- **GTOTrendLineChart**: 最近 N 局 GTO 符合率趋势折线图
- **TrendRangeSelector**: 趋势图的 N 值选择器（20 / 50 / 100）

### 通用组件
- **ConfirmDialog**: 通用确认弹窗（用于 Fold 确认、清理数据确认、离开牌局确认等）
- **LoadingSpinner**: 加载指示器
- **EmptyState**: 空状态占位（无历史记录时、无统计数据时）
- **StorageWarningBanner**: localStorage 接近上限时的警告横幅
- **TooltipPopover**: 通用工具提示气泡（用于 GTO 术语解释等）