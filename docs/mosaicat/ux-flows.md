## User Journeys

### Flow 1: Game Setup & Table Entry (New Session)
Step 1: 用户打开应用 → 进入主界面（Landing/Dashboard）
Step 2: 点击"开始新牌局" → 弹出游戏设置面板
Step 3: 选择盲注级别（1/2、2/5、5/10）→ 调整起始筹码（50-200BB）→ 设置牌局速度
Step 4: 点击"入座" → 系统随机分配玩家座位和5个BOT（随机风格，不显示标签）
Step 5: 牌桌加载完成 → 显示椭圆形六人桌，玩家和BOT就位 → 自动开始第一手牌

### Flow 2: Single Hand Gameplay Loop
Step 1: 系统发牌 → 玩家看到自己2张手牌（BOT手牌背面朝上）→ 盲注自动扣除
Step 2: **Preflop** → 按位置顺序行动 → 轮到玩家时高亮座位 + 显示操作面板（Fold/Check/Call/Raise）
Step 3: 若选择Raise → 弹出加注金额选择器（预设1/3 pot、1/2 pot、2/3 pot、pot、all-in + 自定义输入）→ 确认
Step 4: BOT按序行动（带思考动画，时长由速度设置控制）→ 底池实时更新
Step 5: Preflop结束 → 发3张公共牌 → **Flop** → 重复决策流程
Step 6: Flop结束 → 发Turn牌 → **Turn** → 重复决策流程
Step 7: Turn结束 → 发River牌 → **River** → 重复决策流程
Step 8: 摊牌/所有对手弃牌 → 手牌评估 → 显示赢家和赢得金额 → 更新筹码
Step 9: 短暂结算展示（2-3秒）→ 自动开始下一手（按钮轮转）

### Flow 3: Hand History Browsing
Step 1: 从主界面或牌桌内点击"牌局记录"图标 → 进入历史记录页
Step 2: 顶部显示累计统计卡片（总手数、总盈亏、每手平均盈亏）
Step 3: 筛选栏：按日期范围 / 盲注级别 / 盈亏正负 筛选
Step 4: 分页列表展示匹配牌局（每行：日期时间、盲注、手牌缩写、结果金额颜色编码）
Step 5: 点击某手牌 → 进入该手牌复盘详情（Flow 4）

### Flow 4: Single Hand Replay & GTO Review
Step 1: 进入复盘视图 → 显示牌桌快照（所有玩家位置、手牌全部翻开、BOT风格标签揭示）
Step 2: 逐街回放控制栏：Preflop → Flop → Turn → River（可点击跳转或按序播放）
Step 3: 选中某街 → 展示该街公共牌面、底池、各玩家动作序列时间线
Step 4: 每个**玩家决策点**标注颜色编码：🟢绿色=GTO一致 / 🟡黄色=轻微偏离 / 🔴红色=严重偏离
Step 5: 点击某个偏离标记 → 展开GTO对比详情卡片（实际操作 vs GTO推荐 + 频率说明 + 简要文字解释）
Step 6: 底部汇总本手GTO符合率 → 可点击"返回列表"或"下一手"

### Flow 5: GTO Compliance Report
Step 1: 从主界面或历史记录页点击"GTO报告" → 进入报告页
Step 2: 顶部选择分析范围（最近50/100/200手 或 自定义范围）
Step 3: 总览区：GTO总体符合率百分比（大号数字 + 环形进度）
Step 4: 按街符合率柱状图（Preflop / Flop / Turn / River 四根柱子）
Step 5: 按决策类型符合率雷达图（Open / 3bet / C-bet / Check-raise / Fold-to-3bet 等维度）
Step 6: 最薄弱场景 Top 5 排行列表（每项含场景描述 + 符合率 + 改进建议）
Step 7: 可点击某个薄弱项 → 跳转到相关历史牌局筛选结果

### Flow 6: Settings Management
Step 1: 从主界面或牌桌内点击齿轮图标 → 进入/弹出设置面板
Step 2: 游戏设置区：盲注级别、起始筹码倍数、牌局速度
Step 3: 偏好设置区：音效开关
Step 4: 数据管理区：清除历史数据（二次确认弹窗）
Step 5: 设置自动保存至 localStorage → 返回上一页面

---

## Interaction Rules

### Form & Input Validation
- Raise金额输入：实时校验，最小值为当前最低加注额，最大值为玩家当前筹码（all-in），非法输入时输入框红色描边 + inline提示
- 起始筹码滑块：范围50-200BB，步进10BB，实时显示当前值
- 日期筛选：结束日期不得早于开始日期，无数据范围时显示空状态提示
- 自定义分析范围输入：正整数，最小10手，不超过实际记录手数

### Error Display Patterns
- 网络无关（纯前端应用），主要错误场景为IndexedDB读写失败
- IndexedDB不可用时：顶部固定Toast警告"数据存储不可用，本次牌局不会被记录"，不阻塞游戏
- 数据损坏/读取失败：历史记录页显示inline错误卡片 + "重试"按钮
- GTO数据懒加载失败（Postflop JSON chunk）：复盘时对应街显示"GTO数据加载失败" + 重试链接，不阻塞其他街的展示

### Loading States
- 应用首次加载：全屏Logo + 进度条（加载Preflop GTO数据 <2MB）
- 牌桌初始化：椭圆牌桌骨架屏 + 座位占位符闪烁
- BOT决策中：当前行动BOT座位脉冲动画 + "思考中..."文字（时长由速度设置控制：快速0.3s / 正常1s / 慢速2s）
- 历史记录加载：列表骨架屏（5行占位）
- GTO报告生成：图表区域 shimmer 占位 + "正在分析..."
- Postflop GTO数据懒加载：复盘中对应街区域显示小型 spinner

### Animation & Transition Rules
- 发牌动画：手牌从牌堆滑入玩家位置（0.3s ease-out）
- 公共牌翻牌：卡片翻转动画（0.4s）
- 筹码移动：从玩家位置滑向底池（0.5s）
- 赢牌收取：底池筹码滑向赢家（0.5s + 金色闪光）
- 页面切换：fade transition（0.2s）
- 弃牌：手牌淡出 + 轻微缩小（0.3s）

### Decision Point Interaction Rules
- 玩家回合：操作按钮区域高亮激活，非玩家回合时按钮灰化禁用
- 操作确认：Fold操作需二次确认（"确定弃牌？"轻量弹窗），防止误触；All-in需二次确认
- 操作不可撤销：一旦确认，立即执行并进入下一动作
- 快捷预设Raise尺寸：点击预设按钮自动填充金额，再点"Raise"确认
- 超时机制：无（练习器不限时，但可考虑可选计时器显示当前思考时长）

### GTO Color Coding Rules
- 🟢 绿色（GTO一致）：玩家选择的动作在GTO推荐中频率 ≥ 50%
- 🟡 黄色（轻微偏离）：玩家选择的动作在GTO推荐中频率 10%-49%
- 🔴 红色（严重偏离）：玩家选择的动作在GTO推荐中频率 < 10% 或完全不在推荐内

### Responsive Behavior
- 桌面优先设计（≥1024px）：完整牌桌布局
- 平板（768-1023px）：牌桌等比缩小，操作按钮保持可触摸尺寸（≥44px）
- 小屏（<768px）：基础布局不崩溃，牌桌进一步缩放，可能隐藏部分装饰元素

---

## Component Inventory

### Layout Components
- **AppShell**: 应用顶层布局容器，含顶部导航栏和主内容区域路由
- **TopNav**: 顶部导航栏，包含Logo、当前页面标题、历史记录入口、GTO报告入口、设置齿轮图标
- **PageContainer**: 页面内容包裹器，统一最大宽度和内边距

### Game Table Components
- **PokerTable**: 椭圆形牌桌主容器，管理6个座位布局和公共区域
- **SeatPosition**: 单个座位组件——显示玩家/BOT头像、名称、筹码数、手牌（正面/背面）、庄家按钮(D)、当前行动高亮状态
- **PlayerCards**: 手牌渲染组件——2张牌横排展示，支持正面/背面/翻转动画
- **CommunityCards**: 公共牌区域——牌桌中央，最多5张牌，分阶段翻开动画
- **PlayingCard**: 单张扑克牌组件——花色(♠♥♦♣)颜色区分、点数清晰、正面/背面状态
- **PotDisplay**: 底池显示组件——牌桌中央，实时金额 + 筹码视觉堆叠
- **ChipStack**: 筹码堆叠视觉组件——根据数量渲染不同高度和颜色层
- **DealerButton**: 庄家按钮位标记组件

### Action Components
- **ActionPanel**: 玩家操作面板——含Fold/Check/Call/Raise按钮组 + Raise金额区域，仅在玩家回合激活
- **ActionButton**: 单个操作按钮——支持激活/禁用状态、快捷键提示
- **RaiseSlider**: 加注金额选择器——滑块 + 数字输入 + 预设快捷按钮(1/3 pot, 1/2 pot, 2/3 pot, pot, all-in)
- **ConfirmDialog**: 轻量二次确认弹窗（Fold/All-in确认）

### History Components
- **StatsCard**: 统计数据卡片——单个指标大号数字 + 标签（用于总手数、总盈亏、平均盈亏）
- **HandHistoryList**: 牌局历史列表——虚拟滚动分页，每行显示关键信息
- **HandHistoryItem**: 单行历史记录——日期、盲注、手牌图标、盈亏金额（绿色正/红色负）
- **HistoryFilter**: 筛选工具栏——日期范围选择器、盲注级别下拉、盈亏正负切换
- **EmptyState**: 空状态占位组件——插图 + 文字提示 + 操作引导

### Replay Components
- **ReplayView**: 复盘主视图——含牌桌快照 + 街导航 + 动作时间线
- **StreetNavigator**: 街切换导航——Preflop/Flop/Turn/River 四个步骤指示器，可点击跳转
- **ActionTimeline**: 动作序列时间线——纵向排列每个玩家动作节点
- **ActionNode**: 单个动作节点——玩家名、动作类型、金额、GTO颜色编码标记
- **GTOComparisonCard**: GTO对比详情卡片——展开式，显示实际操作 vs GTO推荐频率分布 + 文字说明
- **DeviationBadge**: 偏离程度徽章——绿/黄/红圆点 + 文字标签
- **BotStyleTag**: BOT风格标签——复盘时显示（TAG/LAG/Fish/Nit/Maniac）+ 简短说明tooltip

### Report Components
- **ComplianceScore**: GTO总体符合率组件——大号百分比数字 + 环形进度条
- **BarChart**: 柱状图组件——用于按街符合率展示（4柱：Preflop/Flop/Turn/River）
- **RadarChart**: 雷达图组件——用于按决策类型多维度符合率展示
- **WeaknessRanking**: 薄弱场景排行列表——Top 5项，每项含场景描述、符合率百分比、改进建议
- **RangeSelector**: 分析范围选择器——预设(50/100/200手) + 自定义输入

### Settings Components
- **SettingsPanel**: 设置面板容器——分组显示所有设置项
- **BlindLevelSelector**: 盲注级别选择器——单选按钮组 (1/2, 2/5, 5/10)
- **StackSizeSlider**: 筹码倍数滑块——50-200BB范围，步进10
- **SpeedSelector**: 牌局速度选择——三档（快速/正常/慢速）分段控制器
- **ToggleSwitch**: 开关切换组件（音效等布尔设置）
- **DangerAction**: 危险操作按钮（清除数据）——红色样式 + 触发ConfirmDialog

### Shared/Utility Components
- **Toast**: 顶部浮动通知——info/warning/error三种类型，自动消失
- **Skeleton**: 骨架屏加载占位组件——支持矩形/圆形/自定义形状
- **Spinner**: 小型加载旋转器
- **LoadingScreen**: 全屏加载页——Logo + 进度条（首次加载用）
- **Tooltip**: 悬浮提示组件——用于BOT风格说明、快捷键提示等
- **Modal**: 通用模态弹窗容器