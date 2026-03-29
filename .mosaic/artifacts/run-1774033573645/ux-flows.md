## User Journeys

### Flow 1: 首页与 Session 管理 (Home & Session Management)
**进入应用 → 选择操作路径**

```
打开应用
  → 首页（展示最近 session 摘要 + 快捷入口）
  → [开始新牌局] → SessionConfigModal（设置起始筹码深度 e.g. 100BB）→ 进入对战界面
  → [继续未完成 session] → 恢复对战界面
  → [历史记录] → 进入 HandHistoryList
  → [统计面板] → 进入 StatsDashboard
```

### Flow 2: 六人桌对战 (Game Play)
**核心对战循环：发牌 → 下注轮 → 摊牌 → 结算**

```
进入对战界面（GameTable）
  → 自动发手牌（Preflop）
  → 等待行动轮转（BOT 自动决策，延迟模拟思考）
  → 轮到玩家行动 → ActionPanel 高亮激活
    → 选择操作：Fold / Check / Call / Raise（滑块+输入框调整金额）/ All-in
    → 确认操作 → 提交决策
  → 进入下一街（Flop → Turn → River）重复行动轮
  → 摊牌 / 所有人弃牌 → ShowdownOverlay（展示赢家、赢得金额）
  → 筹码结算动画 → 自动开始下一手
  → [暂停] → SessionPauseModal（暂停/结束 session 选项）
  → [结束 Session] → SessionSummaryModal（盈亏曲线、手数、关键决策统计）→ 返回首页
```

### Flow 3: 历史牌局浏览 (Hand History Browsing)
**查看、筛选、导出历史牌局**

```
进入历史记录页（HandHistoryList）
  → 展示牌局列表（按 session 分组，显示日期/盈亏/关键标签）
  → [筛选] → FilterPanel（日期范围、场景类型、盈亏筛选）
  → 选择某手牌 → HandSummaryCard（快速预览）
    → [进入复盘] → 跳转 Flow 4: HandReplay
    → [导出] → 导出单手 HH 文本 / JSON
  → [批量导出] → ExportModal（选择格式：HH文本 / JSON）→ 下载文件
```

### Flow 4: 逐手复盘与 GTO 对比 (Hand Replay & GTO Review)
**逐决策点回放，对比 GTO 策略**

```
进入复盘界面（HandReplayView）
  → 加载牌局数据 → 从 Preflop 第一个决策点开始
  → 展示牌桌快照（当前街公共牌、各玩家筹码、底池）
  → 决策点详情面板（DecisionPointPanel）：
    → 左侧：用户实际操作（高亮显示）
    → 右侧：GTO 推荐（各动作频率分布柱状图，如 raise 40% / call 35% / fold 25%）
    → 偏差颜色标注（绿/黄/红）
    → EV 分析卡片：用户 EV vs GTO 最优 EV，EV loss 数值
  → [下一步] → 前进到下一决策点
  → [上一步] → 回退到上一决策点
  → 街道跳转导航条（点击 Preflop/Flop/Turn/River 快速跳转）
  → 牌局结束 → HandSummaryFooter（总 EV 损失汇总、关键偏差点列表）
  → [返回列表] → 回到 HandHistoryList
  → [下一手] → 加载下一手牌局复盘
```

### Flow 5: 统计面板 (Stats Dashboard)
**长期数据分析与 GTO 偏差可视化**

```
进入统计面板（StatsDashboard）
  → 顶部：时间范围选择器（近 100 手 / 近 500 手 / 全部）
  → 总览卡片区：总手数、总盈亏、平均 EV loss/手
  → 按位置频率分布（PositionStatsChart）：
    → 柱状图：各位置（UTG/HJ/CO/BTN/SB/BB）的操作频率 vs GTO 标准
  → 按街道频率分布（StreetStatsChart）：
    → 柱状图：各街道的操作频率 vs GTO 标准
  → 按场景分析（ScenarioRadarChart）：
    → 雷达图：open raise / 3-bet / C-bet / check-raise / river bluff 等维度
    → 用户频率 vs GTO 频率 overlay
  → [点击某维度] → DrilldownPanel（展示该场景下的详细手牌列表）
  → [导出统计] → 下载 JSON 格式统计数据
```

---

## Interaction Rules

### 表单与输入
- **筹码深度设置**：输入框 + 预设按钮（50BB/100BB/150BB/200BB），范围限制 20-500BB，实时校验，非法输入即时红色提示
- **Raise 金额控制**：滑块 + 数字输入框联动，滑块范围 = [min raise, all-in]，输入框 blur 时校验合法性，非法金额自动修正到最近合法值
- **筛选器**：所有筛选条件变更后实时刷新列表，无需点击"搜索"按钮

### 操作面板 (ActionPanel)
- 仅在轮到玩家行动时激活，其余时间灰显禁用
- 不可用的操作自动隐藏（如无人下注时隐藏 Call，显示 Check）
- Raise 按钮点击展开金额选择区域（滑块 + 常用金额快捷按钮：1/3 pot, 1/2 pot, 2/3 pot, pot, all-in）
- 操作确认：单击即提交，无二次确认（保持游戏节奏）
- All-in 操作需二次确认（防止误操作）

### 加载状态
- 应用首次加载：全屏 Skeleton + Logo 动画
- 牌局加载中：牌桌 Skeleton（座位占位 + 牌占位）
- BOT 思考中：当前行动 BOT 座位显示思考动画（3 个跳动圆点），延迟 500-1500ms 模拟真实节奏
- 历史记录加载：列表 Skeleton（3-5 行占位）
- 统计图表加载：图表区域 Shimmer 占位
- 复盘数据加载：牌桌 + 决策面板 Skeleton

### 错误处理
- IndexedDB 不可用：首次进入显示 Toast 警告 "浏览器存储不可用，数据将无法保存"，允许继续使用但禁用保存相关功能
- 数据导出失败：Toast 错误提示 + 重试按钮
- 牌局引擎异常：弹出错误 Modal，提供"重新开始本手"选项

### 动画与过渡
- 发牌动画：牌从牌堆位置飞向各座位，翻转展示（~300ms/张）
- 筹码移动：下注时筹码从玩家位置滑入底池区（~200ms）
- 公共牌翻开：依次翻转动画（Flop 三张依次翻，Turn/River 单张翻）
- 页面切换：fade + slide 过渡（~200ms）
- 赢家高亮：底池筹码滑向赢家 + 赢家座位脉冲发光动画

### 复盘导航
- 键盘快捷键：← 上一步 / → 下一步 / Space 播放/暂停自动回放
- 自动回放模式：每个决策点停留 2 秒，可调速（1x/2x/3x）
- 决策点时间线：底部横向时间线，可点击任意决策点跳转
- 偏差高亮：严重偏差决策点在时间线上标红，便于快速定位

### 数据持久化
- 每手牌结束自动保存到 IndexedDB，无需用户手动触发
- Session 暂停时自动保存当前状态
- 浏览器关闭后重新打开可恢复未完成 session

### 空状态
- 历史记录为空：插画 + "还没有对战记录，开始你的第一局吧" + CTA 按钮
- 统计面板数据不足：提示 "至少完成 10 手牌才能生成有意义的统计"
- 筛选无结果："没有匹配的牌局记录，试试调整筛选条件"

---

## Component Inventory

### 布局组件
- **AppShell**: 全局布局容器，含顶部导航栏 + 主内容区，管理页面路由
- **TopNav**: 顶部导航栏，包含 Logo、主导航链接（对战/历史/统计）、当前 session 状态指示
- **PageContainer**: 页面内容区容器，统一内边距和最大宽度

### 首页组件
- **HomePage**: 首页主视图，展示快捷入口和最近 session 摘要
- **RecentSessionCard**: 最近 session 摘要卡片（盈亏、手数、日期）
- **QuickStartPanel**: 快捷操作面板（新牌局、继续、历史、统计）

### 对战界面组件
- **GameTable**: 六人桌主容器，管理牌桌布局和游戏状态展示
- **PokerTable**: 牌桌可视化（椭圆桌面 + 6 个座位布局 + 公共牌区 + 底池区）
- **PlayerSeat**: 单个座位组件（头像/BOT标签、昵称、筹码量、手牌展示区、位置标签如 BTN/SB/BB、当前行动高亮、思考动画）
- **CommunityCards**: 公共牌展示区（最多 5 张，按街道依次显示）
- **PotDisplay**: 底池金额展示（主池 + 边池分别显示）
- **PlayingCard**: 单张扑克牌组件（正面显示花色点数、背面显示牌背图案）
- **ActionPanel**: 玩家操作面板（Fold/Check/Call/Raise/All-in 按钮 + Raise 金额控制区）
- **RaiseSlider**: Raise 金额滑块 + 输入框 + 快捷金额按钮（1/3pot, 1/2pot, 2/3pot, pot）
- **BetTimeline**: 当前牌局下注时间线，展示各玩家各街道操作序列
- **ShowdownOverlay**: 摊牌结果浮层（展示赢家、牌型、赢得金额）
- **DealerButton**: 庄位按钮标识组件

### Session 管理组件
- **SessionConfigModal**: 新 session 配置弹窗（筹码深度设置）
- **SessionPauseModal**: 暂停/结束 session 弹窗
- **SessionSummaryModal**: Session 结束汇总弹窗（盈亏曲线、手数、关键统计）
- **SessionProfitChart**: Session 内盈亏曲线图（Recharts 折线图）

### 历史记录组件
- **HandHistoryList**: 历史牌局列表页主视图
- **HandHistoryCard**: 单手牌局摘要卡片（日期、位置、结果、盈亏、关键标签）
- **HandHistoryFilter**: 筛选面板（日期范围、场景类型 dropdown、盈亏范围）
- **ScenarioTag**: 场景标签组件（如 "3-bet pot"、"river bluff"）

### 复盘组件
- **HandReplayView**: 复盘主视图容器
- **ReplayTableSnapshot**: 复盘中的牌桌快照（复用 PokerTable 但为只读展示模式）
- **DecisionPointPanel**: 决策点对比面板（用户操作 vs GTO 推荐）
- **GTOFrequencyChart**: GTO 动作频率分布柱状图（各动作占比可视化）
- **DeviationBadge**: 偏差程度标记（绿/黄/红色 badge + 文字说明）
- **EVAnalysisCard**: EV 分析展示卡片（用户 EV、GTO EV、EV loss）
- **ReplayNavBar**: 复盘导航栏（上一步/下一步/播放/暂停 + 速度控制）
- **StreetJumpNav**: 街道快速跳转导航（Preflop/Flop/Turn/River 按钮）
- **DecisionTimeline**: 决策点时间线（横向可点击，偏差点标红）
- **HandSummaryFooter**: 牌局复盘总结栏（总 EV 损失、关键偏差点列表）

### 统计面板组件
- **StatsDashboard**: 统计面板主视图
- **TimeRangeSelector**: 时间/手数范围选择器（近100手/近500手/全部）
- **OverviewStatsCards**: 总览统计卡片组（总手数、总盈亏、平均 EV loss）
- **PositionStatsChart**: 按位置操作频率柱状图（用户 vs GTO，Recharts）
- **StreetStatsChart**: 按街道操作频率柱状图（用户 vs GTO，Recharts）
- **ScenarioRadarChart**: 场景维度雷达图（用户 vs GTO overlay，Recharts）
- **DrilldownPanel**: 维度下钻面板（展示该场景下具体手牌列表）

### 数据导出组件
- **ExportModal**: 导出配置弹窗（选择格式、选择范围）
- **ExportButton**: 导出触发按钮（通用，可放置于列表页/统计页）

### 通用组件
- **Toast**: 全局消息提示（成功/警告/错误）
- **Modal**: 通用模态弹窗容器
- **ConfirmDialog**: 二次确认对话框（用于 All-in 等高风险操作）
- **Skeleton**: 骨架屏加载占位组件
- **EmptyState**: 空状态插画 + 提示文案 + CTA 按钮
- **ChipStack**: 筹码堆可视化组件（不同面额不同颜色）
- **Tooltip**: 信息提示气泡（用于术语解释等）