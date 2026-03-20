## User Journeys

### Flow 1: 首次启动与牌局配置 (First Launch & Game Setup)
**首页/大厅** → 点击「新建牌局」→ **牌局配置面板**（选择现金桌/锦标赛、设定盲注结构、起始筹码）→ **BOT 难度配置**（为 5 个 BOT 分别选择鱼/TAG/GTO 难度）→ **GTO 策略源选择**（内置预计算 / PioSOLVER UPI）→ 若选 UPI：配置 PioSOLVER 路径 + 加载 .cfr 文件 → 点击「开始牌局」→ 进入 **牌桌界面**

### Flow 2: 核心对战循环 (Core Gameplay Loop)
**牌桌界面**加载 → 系统自动发牌（发牌动画）→ **Preflop 阶段**：按位置顺序行动，BOT 自动决策，轮到玩家时高亮动作按钮区（Fold/Check/Call/Raise/All-in + 加注滑块）→ 玩家选择动作 → 若分析模式开启：**分析叠加层**实时显示 GTO 建议频率 → **Flop/Turn/River** 重复决策流程 → **Showdown**：翻牌比较 → **结算动画**（筹码移动）→ 显示本手牌 **GTO 对比摘要卡片** → 玩家点击「下一手」或「详细分析」

### Flow 3: 手牌结束 GTO 分析 (Post-Hand GTO Analysis)
手牌结束 → 自动弹出 **GTO 对比摘要卡片**（总 EV 损失、关键失误节点数）→ 点击「详细分析」→ 进入 **逐节点对比时间线**：每个决策点展示玩家动作 vs GTO 最优动作 + 频率饼图 + EV 差值柱状图 → 点击某决策点 → 展开 **范围矩阵视图**（13×13 手牌网格，颜色标注各动作频率）→ 点击「返回牌桌」→ 回到对战循环

### Flow 4: 手牌历史回放 (Hand History & Replay)
**主导航** → 点击「历史记录」→ **手牌列表页**（按时间倒序，显示手牌号、位置、结果、EV 损失）→ 使用筛选器（时间范围/位置/盈亏结果）过滤 → 点击某手牌 → 进入 **手牌回放视图**：牌桌快照 + 逐步播放控制条（上一步/下一步/自动播放）→ 每步同步显示 GTO 对比数据 → 点击「返回列表」

### Flow 5: 统计面板与 Leak 分析 (Stats Dashboard & Leak Detection)
**主导航** → 点击「统计」→ **统计面板**：顶部总览卡片（总手数、整体胜率、累计盈亏）→ **EV 损失趋势图**（折线图，X 轴时间/手数，Y 轴累计 EV 损失）→ **位置表现雷达图/对比柱状图**（6 个位置的胜率/EV 对比）→ **Leak 汇总表**（按场景聚合，如 "CO vs 3bet fold 频率 78%，GTO 建议 45%"，按严重程度排序）→ 使用时间范围筛选器调整分析区间

### Flow 6: 会话管理 (Session Management)
**主导航** → 点击「会话」→ **会话列表**（显示保存时间、盲注、筹码状态、进度）→ 点击「恢复」→ 加载牌局状态回到 **牌桌界面** 继续对战 | 或点击「删除」→ 确认弹窗 → 删除会话 | 在牌桌界面中：点击「保存并退出」→ 保存当前进度 → 返回大厅

### Flow 7: PioSOLVER UPI 高级配置 (PioSOLVER Bridge Setup)
**牌局配置面板** → GTO 策略源选择「PioSOLVER UPI」→ **UPI 配置面板**：输入 PioSOLVER 可执行文件路径 → 点击「测试连接」→ 显示连接状态（成功/失败 + 错误信息）→ 加载 .cfr 文件（文件选择器）→ 显示加载进度和策略树信息摘要 → 确认配置 → 返回牌局配置流程

### Flow 8: 对战中模式切换 (In-Game Mode Toggle)
牌桌界面 → 点击「分析模式」开关 → **沉浸模式**（纯牌桌，无 GTO 信息叠加）⇄ **分析模式**（叠加 GTO 建议、频率、EV）→ 分析叠加层可折叠/展开 | 点击「BOT 设置」→ **BOT 难度快捷面板**（仅在手牌间可操作）→ 调整难度 → 下手生效

---

## Interaction Rules

### 表单与配置
- IR-001: 牌局配置表单使用 progressive validation：首次提交后实时校验，盲注/筹码输入框在 blur 时校验数值合法性（正整数、大盲 > 小盲、筹码 ≥ 10BB）
- IR-002: PioSOLVER 路径输入在 blur 时自动检测文件是否存在，「测试连接」按钮仅在路径有效时可点击
- IR-003: .cfr 文件加载使用 progress bar + 预计时间，加载失败显示具体 UPI 错误信息并提供重试按钮

### 牌桌交互
- IR-004: 非玩家回合时动作按钮区置灰不可点击，BOT 行动时显示 1-2 秒思考动画（延迟渐进，GTO BOT 略慢于鱼 BOT）
- IR-005: Raise 操作使用滑块 + 直接输入框双模式，滑块锚点标注常用尺寸（2.5x/3x/Pot），输入框 blur 时校验范围（min raise ≤ 值 ≤ all-in）
- IR-006: Fold 操作需要二次确认仅当玩家未面对加注时（即可以 check 但选择 fold 的场景），防止误操作
- IR-007: 动作按钮需有快捷键支持（F=Fold, C=Call/Check, R=Raise, A=All-in），并在按钮上显示快捷键标注
- IR-008: 发牌和筹码移动动画持续 300-500ms，可在设置中关闭动画

### 分析叠加层
- IR-009: 分析模式开关为全局 toggle，状态跨手牌保持（切换后记住偏好）
- IR-010: GTO 建议面板默认折叠为小面板（仅显示推荐动作 + EV），点击展开为完整视图（频率饼图 + 范围矩阵）
- IR-011: EV 差异使用颜色编码：≤ 0.5bb 绿色（最优或接近）、0.5-2bb 黄色（轻微失误）、> 2bb 红色（严重失误）
- IR-012: 手牌结束的 GTO 摘要卡片自动弹出，3 秒后可手动关闭或点击查看详情，不阻塞「下一手」按钮

### 加载与空状态
- IR-013: 牌局初始化（洗牌/发牌/BOT 计算）期间显示牌桌骨架屏 + 加载指示器
- IR-014: 手牌历史为空时显示空状态插图 + 引导文案「开始你的第一局对战」+ 跳转按钮
- IR-015: 统计面板在手数不足（< 20 手）时显示提示「数据量较少，统计结果仅供参考」
- IR-016: PioSOLVER 未安装/未配置时，UPI 相关功能入口显示灰色 + tooltip 说明前置条件

### 导航与会话
- IR-017: 牌局进行中尝试离开时弹出确认弹窗：「保存并退出」/「不保存退出」/「取消」
- IR-018: 会话删除使用二次确认弹窗，显示会话信息摘要（时间、手数、筹码）
- IR-019: 主导航始终可见（侧边栏或顶部 tab），当前页面高亮，牌桌页面导航缩小为 mini 模式避免遮挡

### 错误处理
- IR-020: PioSOLVER UPI 通信超时（> 10s）显示 inline 错误 + 自动降级到内置策略表 + toast 通知用户
- IR-021: SQLite 读写失败显示 toast 错误通知 + 自动重试 1 次，持续失败则弹出错误弹窗建议检查磁盘空间
- IR-022: Bet sizing 归类映射时，在 GTO 对比面板底部显示灰色小字注明实际下注与归类后的 solver line 的差异

---

## Component Inventory

### 布局组件
- AppShell: 应用顶层布局，包含侧边栏导航、顶部状态栏和主内容区，牌桌页面自动切换为全屏 mini-nav 模式
- SideNav: 侧边栏导航组件，包含大厅/牌桌/历史/统计/会话/设置等入口，支持折叠和当前页高亮
- PageHeader: 页面顶部标题栏，含面包屑和页面级操作按钮

### 牌桌核心组件 (F-010)
- PokerTable: 牌桌主容器，椭圆形桌面布局，管理 6 个座位的定位和公共区域
- PlayerSeat: 玩家/BOT 座位组件，显示头像、昵称、筹码量、当前动作标签、庄家/盲注标记，当前行动者高亮环
- HoleCards: 手牌显示组件，支持正面/背面/翻转动画，人类玩家始终显示，BOT 仅 showdown 时翻开
- CommunityCards: 公共牌区组件，居中显示 flop(3)/turn(1)/river(1)，支持逐张发牌动画
- PotDisplay: 底池显示组件，显示主池和边池金额，筹码堆叠视觉效果
- ActionPanel: 玩家动作面板，包含 Fold/Check/Call/Raise/All-in 按钮 + 加注滑块 + 金额输入框，非玩家回合置灰
- RaiseSlider: 加注滑块组件，带预设锚点（min raise/2.5x/3x/half pot/pot/all-in），支持拖拽和直接输入
- ChipAnimation: 筹码移动动画组件，处理下注、收池等筹码视觉过渡
- DealAnimation: 发牌动画组件，控制手牌和公共牌的发牌视觉效果
- BettingRoundIndicator: 当前下注轮次指示器（Preflop/Flop/Turn/River）

### 分析叠加组件 (F-006, F-011)
- AnalysisOverlay: 分析叠加层主容器，覆盖在牌桌上方，支持折叠/展开切换
- AnalysisModeToggle: 沉浸模式/分析模式切换开关
- GTOSuggestionPanel: 当前决策点 GTO 建议面板，显示各动作推荐频率和 EV 值，折叠态仅显示推荐动作
- FrequencyPieChart: 动作频率饼图组件，显示 fold/check/call/raise 各频率占比
- EVBarChart: EV 对比柱状图，玩家实际 EV vs GTO 最优 EV
- RangeMatrix: 13×13 手牌范围矩阵组件，颜色编码各动作频率（渐变色深浅表示频率高低）
- PostHandSummaryCard: 手牌结束摘要卡片，显示总 EV 损失 + 关键失误数 + 查看详情入口
- DecisionTimeline: 逐节点对比时间线组件，横向排列每个决策点，点击展开详情
- EVDiffBadge: EV 差异标签组件，颜色编码（绿/黄/红）显示单个决策点的 EV 损失
- BetSizingNote: 归类映射注释组件，灰色小字显示实际下注到 solver line 的映射说明

### 配置组件 (F-002, F-003)
- GameSetupForm: 牌局配置表单，包含牌局类型选择、盲注结构、起始筹码设定
- GameTypeSelector: 现金桌/锦标赛类型选择器（单选卡片式）
- BlindsInput: 盲注结构输入组件（小盲/大盲联动输入框）
- StackInput: 起始筹码输入组件（数值输入 + BB 换算显示）
- BotDifficultyConfigurator: 5 个 BOT 难度配置面板，每个 BOT 一行，下拉选择难度（鱼/TAG/GTO）+ 难度说明 tooltip
- BotDifficultyBadge: BOT 难度标签组件，用图标+颜色区分（鱼=蓝/TAG=橙/GTO=红）
- BotQuickSettings: 牌局间 BOT 难度快捷调整浮层

### PioSOLVER 配置组件 (F-005)
- UPIConfigPanel: PioSOLVER UPI 配置面板，包含路径输入、连接测试、文件加载
- FilePathInput: 文件路径输入组件，带文件选择器按钮和路径有效性校验指示
- ConnectionTestButton: UPI 连接测试按钮，显示连接状态（idle/testing/success/failed）
- CFRFileLoader: .cfr 文件选择和加载组件，显示加载进度条和策略树信息摘要
- UPIStatusIndicator: UPI 连接状态全局指示器（已连接/未连接/错误）

### 历史记录组件 (F-007)
- HandHistoryList: 手牌历史列表组件，虚拟滚动，每行显示手牌摘要信息
- HandHistoryItem: 单条手牌记录，显示手牌号、日期、位置、手牌、结果（+/-筹码）、EV 损失
- HandHistoryFilter: 筛选器栏，包含时间范围选择器、位置多选、盈亏筛选（全部/盈利/亏损）
- HandReplayView: 手牌回放视图，在简化牌桌上逐步播放手牌进程
- ReplayControls: 回放控制条，上一步/下一步/自动播放/播放速度
- HandReplayTimeline: 回放进度时间线，标注每个 street 和决策点

### 统计组件 (F-008)
- StatsDashboard: 统计面板主容器，网格布局排列各统计卡片和图表
- OverviewCards: 总览卡片组（总手数、胜率、累计盈亏、平均 EV 损失/手）
- EVTrendChart: EV 损失趋势折线图，支持缩放和时间范围选择
- PositionPerformanceChart: 各位置表现对比图（柱状图/雷达图切换）
- LeakSummaryTable: Leak 汇总表格，按场景聚合，显示实际频率 vs GTO 频率 + 严重程度排序
- LeakItem: 单条 Leak 记录组件，显示场景描述、偏差幅度、出现次数
- TimeRangeFilter: 统计面板时间范围筛选器（今天/本周/本月/全部/自定义）
- InsufficientDataNotice: 数据量不足提示组件

### 会话管理组件 (F-009)
- SessionList: 会话列表组件，显示已保存会话卡片
- SessionCard: 单个会话卡片，显示保存时间、盲注、筹码分布、手数进度
- SessionActions: 会话操作按钮组（恢复/删除）
- SaveExitDialog: 牌局中退出确认弹窗（保存并退出/不保存退出/取消）

### 通用组件
- ConfirmDialog: 通用二次确认弹窗，支持自定义标题、描述、确认/取消按钮文案
- Toast: 全局 toast 通知组件，支持 success/warning/error 类型，自动消失
- LoadingSpinner: 通用加载指示器
- SkeletonScreen: 骨架屏组件，用于牌桌和列表的加载占位
- EmptyState: 空状态组件，含插图 + 描述 + 引导操作按钮
- Tooltip: 通用 tooltip 组件，用于难度说明、功能提示等
- ProgressBar: 通用进度条组件（用于 .cfr 文件加载等）
- KeyboardShortcutHint: 快捷键提示标注组件，显示在按钮角落
- PlayingCard: 单张扑克牌渲染组件，支持正面/背面/花色颜色