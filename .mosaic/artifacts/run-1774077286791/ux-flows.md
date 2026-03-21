## User Journeys

### Flow 1: Session Start & Table Setup
**Covers: F-010, F-004**

Landing Page → Click "开始新 Session" → 初始化 6 人桌（玩家 100BB + 5 BOT 100BB）→ 分配座位（随机或固定 Seat 1）→ 设置庄位 → 进入牌桌界面 → 显示盲注 1/2、各玩家筹码 200

**恢复流程：** Landing Page → 检测到未完成 Session → 提示"继续上次 Session？" → 是 → 恢复牌桌状态 / 否 → 开始新 Session

---

### Flow 2: Single Hand Gameplay
**Covers: F-001, F-002, F-003, F-004**

发牌动画（2 张底牌）→ Preflop 行动轮开始（UTG 先行动）→ 
  - 轮到 BOT → BOT 基于 GTO 规则引擎自动决策（200ms 内）→ 显示 BOT 操作动画 → 下一位
  - 轮到玩家 → 操作面板亮起（仅显示合法操作）→ 玩家选择操作 → 确认 → 更新底池/筹码 → 下一位
→ Preflop 结束 → 发 Flop（3 张公共牌动画）→ Flop 行动轮 → 发 Turn → Turn 行动轮 → 发 River → River 行动轮 → 摊牌/结算

**提前结束：** 任意轮次所有人 Fold 仅剩一人 → 直接结算，不摊牌

**All-in 场景：** All-in 后无需继续操作 → 自动发完剩余公共牌 → 摊牌结算（含边池计算）

---

### Flow 3: Hand Result & Continuation
**Covers: F-005, F-006, F-010**

结算 → 显示结果弹窗（赢家、牌型、筹码变化）→ 数据写入 IndexedDB → 
  - 点击"下一局" → 庄位轮转 → 回到 Flow 2
  - 点击"结束 Session" → 显示 Session 总结（局数、累计盈亏）→ 回到 Landing Page

**自动补位：** BOT 筹码归零 → 下局自动重新买入 100BB（保持 6 人满桌）

---

### Flow 4: Post-Hand GTO Review (Replay)
**Covers: F-007, F-008**

从结果弹窗点击"复盘本局" 或 从历史列表进入 →
加载牌局数据 → 进入复盘模式 →
显示决策点 1（Preflop）→ 展示分屏：左侧「你的选择」/ 右侧「GTO 推荐」→ 颜色编码（绿/黄/红）→ 显示 EV 差值 → 展示策略解释文字 →
点击"下一步" → 决策点 2 → ... → 最后决策点 →
显示本局汇总（累计 EV 损失、决策质量评分）→
点击"返回" → 回到历史列表 或 牌桌

**步进控制：** 支持「上一步 / 下一步 / 跳到开头 / 跳到结尾」

---

### Flow 5: History Browsing & Filtering
**Covers: F-009, F-006**

导航栏点击"历史记录" → 加载历史牌局列表（时间倒序、分页）→ 
每条显示：日期时间 | 盈亏（+/- 标色）| 关键手牌数 →
可选：输入日期范围筛选 → 列表更新 →
点击任意一局 → 进入 Flow 4 复盘模式

---

## Interaction Rules

### 表单与输入
- 操作面板：玩家轮次时亮起，非轮次时灰显禁用
- Bet/Raise 金额输入：提供滑块 + 快捷按钮（1/3 pot, 1/2 pot, 2/3 pot, pot, all-in）+ 手动输入框
- Raise 金额约束：最小值为上次加注的 2 倍（min-raise），最大值为玩家剩余筹码（all-in）；输入框实时校验，非法金额禁用确认按钮
- 日期范围筛选：两个日期选择器（起始/结束），选择后立即过滤，无需提交按钮

### 操作确认
- Fold 操作：如果玩家已投入大量筹码（> 20BB），显示确认对话框："确定要弃牌吗？你已投入 XXbb"
- All-in 操作：始终显示确认对话框："确定 All-in？当前筹码 XXbb"
- 结束 Session：显示确认对话框，包含当前盈亏摘要

### 错误与边界处理
- 非法操作（如有人加注时点 Check）：按钮直接隐藏，不显示错误提示
- IndexedDB 写入失败：顶部 toast 提示"数据保存失败，请检查浏览器存储空间"，不阻断游戏
- 浏览器刷新/关闭：beforeunload 提示"当前牌局进行中，离开将丢失本局进度"

### Loading 状态
- BOT 决策中：显示当前行动 BOT 的思考动画（省略号脉冲），持续 0.5-1.5 秒（含人工延迟，避免瞬间响应不自然）
- 发牌动画：每张牌 0.2 秒翻转动画
- 复盘数据加载：骨架屏（skeleton）占位
- 历史列表加载：列表区域骨架屏，首屏 20 条

### 导航与布局
- 全局顶部导航栏：Logo | 牌桌（主页）| 历史记录 | 当前 Session 状态（局数/盈亏）
- 牌桌页面为全屏沉浸式，导航栏收缩为顶部窄条
- 复盘模式覆盖牌桌视图，底部固定步进控制条
- 响应式：最小宽度 1024px（桌面优先），小于此显示提示"请使用桌面浏览器"

### 颜色编码系统（复盘专用）
- 🟢 绿色（#22c55e）：决策完全符合 GTO（EV 差值 < 0.5BB）
- 🟡 黄色（#eab308）：轻微偏差（EV 差值 0.5-2BB）
- 🔴 红色（#ef4444）：严重偏差（EV 差值 > 2BB）

### EV 分析置信度标注
- 单挑底池（heads-up pot）：正常显示 EV
- 多人底池（3+ 玩家）：EV 旁显示⚠️图标 + tooltip "多人底池 EV 为近似值，建议参考专业 solver"
- 复杂边池场景：标注"边池场景，EV 计算仅供参考"

---

## Component Inventory

- **AppShell**: 全局布局容器，包含顶部导航栏和主内容区，管理路由状态（牌桌/历史/复盘）
- **TopNavBar**: 顶部导航栏，显示 Logo、页面导航链接、当前 Session 状态摘要（局数/盈亏）
- **LandingScreen**: 首页/启动页，显示"开始新 Session"按钮和"继续 Session"提示
- **PokerTable**: 6 人桌主渲染组件，椭圆形牌桌布局，管理 6 个座位位置和公共牌区域
- **PlayerSeat**: 单个玩家座位组件，显示头像、玩家名、筹码数、位置标签（UTG/HJ/CO/BTN/SB/BB）、当前状态（行动中/已弃牌/all-in）、庄位按钮
- **CardDisplay**: 单张扑克牌 SVG 渲染组件，支持正面/背面/翻转动画，52 张花色数字组合
- **CommunityCards**: 公共牌区域组件，管理 Flop/Turn/River 的发牌动画和布局
- **PotDisplay**: 底池显示组件，展示主池金额和边池列表
- **DealerButton**: 庄位按钮标记组件，跟随庄位座位显示
- **ActionIndicator**: 当前行动玩家指示器，高亮当前轮到的玩家座位
- **ActionPanel**: 玩家操作面板，根据当前游戏状态动态显示合法操作按钮（Fold/Check/Call/Bet/Raise/All-in）
- **BetSizer**: 下注金额选择器，包含滑块、快捷比例按钮（1/3 pot, 1/2 pot, 2/3 pot, pot）和手动输入框
- **ConfirmDialog**: 通用确认对话框，用于 Fold 大底池/All-in/结束 Session 等需要二次确认的场景
- **BotThinkingIndicator**: BOT 思考中动画组件，显示脉冲省略号效果
- **HandResultModal**: 单局结果弹窗，展示赢家/牌型/筹码变化/关键亮点，提供"下一局""复盘""结束 Session"按钮
- **SessionSummary**: Session 总结视图，显示总局数、累计盈亏、关键数据统计
- **ReplayView**: 复盘主视图容器，包含牌桌回放区域和策略对比面板
- **ReplayControls**: 复盘步进控制条（上一步/下一步/跳到开头/跳到结尾/进度条）
- **DecisionComparison**: 决策对比面板，左右分屏展示「你的选择」vs「GTO 推荐」，带颜色编码
- **EVDisplay**: EV 差值显示组件，展示数值、颜色编码、置信度标注
- **StrategyExplanation**: GTO 策略解释文字组件，展示当前决策点的推荐原因
- **HandSummaryCard**: 单局汇总卡片，显示累计 EV 损失和决策质量评分
- **HistoryList**: 历史牌局列表组件，支持虚拟滚动分页加载
- **HistoryListItem**: 历史列表单条记录，显示日期时间/盈亏/关键手牌数
- **DateRangeFilter**: 日期范围筛选器，双日期选择器
- **Toast**: 全局轻量提示组件（成功/警告/错误），用于数据保存失败等通知
- **SkeletonLoader**: 骨架屏占位组件，用于复盘加载和历史列表加载
- **DesktopOnlyGuard**: 屏幕宽度检测组件，小于 1024px 显示"请使用桌面浏览器"提示
- **ConfidenceBadge**: 置信度标注组件，显示⚠️图标和 tooltip，用于多人底池/边池场景的 EV 标注