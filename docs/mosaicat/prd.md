## Goal
为德州扑克初学者提供一个零门槛（免费、无注册、纯浏览器）的GTO策略练习器，通过六人桌BOT对战、实时GTO教学提示和赛后逐手复盘，帮助新手在实战中系统学习最优策略。

## Target Users
- **Primary persona**: 德州扑克初学者——已了解基本规则但缺乏GTO知识的玩家，普通Web用户无需技术背景，使用桌面或移动端浏览器，需要中文界面和大量引导式教学
- **Secondary persona**: 有一定经验的休闲玩家——希望系统化检验自己打法与GTO标准的偏差，用于自我提升

## Features

### F-001 poker-game-engine (P0)
六人桌No Limit Hold'em完整牌局引擎，管理从Preflop到River全街的牌局状态，包括发牌、盲注、底池计算、side pot、all-in、摊牌和胜负判定。

**Acceptance Criteria:**
- GIVEN 用户点击"开始新牌局"，WHEN 牌局初始化完成，THEN 6个座位（含用户）各获得2张底牌，盲注自动下注，底池金额正确显示
- GIVEN 牌局进行中，WHEN 进入Flop/Turn/River阶段，THEN 分别发出3/1/1张公共牌并正确展示
- GIVEN 多个玩家all-in且筹码不等，WHEN 牌局结束摊牌，THEN side pot正确计算并分配给对应获胜者
- GIVEN 仅剩一名玩家未弃牌，WHEN 其余玩家全部Fold，THEN 该玩家赢得底池，牌局结束
- GIVEN 牌局到达摊牌阶段，WHEN 比较所有未弃牌玩家手牌，THEN 正确判定牌型大小并将底池分配给获胜者（含平分情况）

### F-002 bot-ai-opponents (P0)
5个不同风格的BOT对手，基于规则引擎和参数化风格实现，模拟真实牌桌动态。至少包含4种风格：TAG（紧凶）、LAG（松凶）、Fish/Calling Station（鱼）、Nit（极紧）。

**Acceptance Criteria:**
- GIVEN 牌局开始，WHEN 轮到BOT行动，THEN BOT在2秒内做出决策（Fold/Check/Call/Bet/Raise）
- GIVEN TAG风格BOT，WHEN 在Preflop持有边缘手牌（如K9o在UTG），THEN 大概率Fold（符合紧凶风格的窄范围）
- GIVEN Fish风格BOT，WHEN 面对加注持有弱牌，THEN 有较高概率Call（符合跟注站特征）
- GIVEN LAG风格BOT，WHEN 在有利位置（BTN/CO），THEN 比TAG风格有更宽的开牌和加注范围
- GIVEN 每个BOT，WHEN 在牌桌UI中显示，THEN 可见其风格标签（如"TAG-紧凶"）以帮助用户理解对手类型

### F-003 player-action-interface (P0)
用户在每个决策点进行操作的交互界面，支持Fold、Check、Call、Bet（含多种sizing选项：1/3 pot、1/2 pot、2/3 pot、pot）、Raise和All-in。

**Acceptance Criteria:**
- GIVEN 轮到用户行动，WHEN 决策面板出现，THEN 仅显示当前合法动作（如无人加注时不显示Call，已有人加注时不显示Check）
- GIVEN 用户选择Bet，WHEN 展开sizing选项，THEN 显示1/3 pot、1/2 pot、2/3 pot、pot预设按钮及自定义金额滑块
- GIVEN 用户选择一个动作，WHEN 点击确认，THEN 动作立即执行并更新底池、筹码显示，轮转到下一位玩家
- GIVEN 用户筹码不足以完成最小加注，WHEN 决策面板出现，THEN 显示All-in选项替代Raise

### F-004 gto-strategy-data (P0)
内置预计算GTO策略表，覆盖Preflop全量6-max标准GTO范围 + Postflop Top 100-200个常见场景的简化GTO策略。数据以JSON格式打包在前端资源中。

**Acceptance Criteria:**
- GIVEN 任意6-max位置（UTG/HJ/CO/BTN/SB/BB），WHEN 查询Preflop开牌范围，THEN 返回该位置的标准GTO开牌/3bet/cold call范围及对应频率
- GIVEN 一个常见的Postflop场景（翻牌面纹理+位置+动作历史），WHEN 查询GTO策略，THEN 返回各动作（Check/Bet各sizing/Raise/Fold/Call）的混合策略频率
- GIVEN 一个未覆盖的Postflop场景，WHEN 查询GTO策略，THEN 返回明确提示"此场景暂无GTO数据"而非猜测值
- GIVEN 应用首次加载，WHEN Preflop策略数据加载完成，THEN 数据体积不超过2MB
- GIVEN 用户进入Postflop阶段，WHEN 需要GTO数据，THEN 通过lazy loading按需加载，Postflop数据总量不超过20MB
- GIVEN GTO数据展示给用户，WHEN 显示策略建议，THEN 明确标注数据精度等级（如"标准GTO范围"或"简化GTO参考"）

### F-005 realtime-gto-hints (P0)
在每个决策点提供实时GTO教学提示，支持3级提示系统：Level 1仅显示推荐动作，Level 2显示推荐动作+简短理由，Level 3显示完整GTO混合策略频率。默认Level 1。

**Acceptance Criteria:**
- GIVEN 用户处于决策点且提示级别为Level 1，WHEN GTO提示区域显示，THEN 仅显示推荐动作（如"建议：Raise"）
- GIVEN 用户处于决策点且提示级别为Level 2，WHEN GTO提示区域显示，THEN 显示推荐动作和简短理由（如"建议：Raise — 你在BTN位置持有强牌，GTO建议加注以获取价值"）
- GIVEN 用户处于决策点且提示级别为Level 3，WHEN GTO提示区域显示，THEN 显示完整混合策略频率（如"Fold 0% / Call 35% / Raise 65%"）
- GIVEN 用户点击提示级别切换控件，WHEN 在Level 1/2/3之间切换，THEN 提示内容立即更新为对应级别的详细程度
- GIVEN 当前场景无GTO数据覆盖，WHEN 提示区域显示，THEN 显示"此场景暂无GTO数据"而非不准确的建议

### F-006 hand-history-storage (P0)
每局结束后自动保存完整对战数据到浏览器IndexedDB，包括手牌、公共牌、每个决策点的动作序列、筹码变化、底池大小、最终结果。

**Acceptance Criteria:**
- GIVEN 一局牌结束，WHEN 胜负判定完成，THEN 完整手牌记录自动保存到IndexedDB，无需用户手动操作
- GIVEN 保存的手牌记录，WHEN 读取记录内容，THEN 包含：手牌ID、时间戳、每位玩家底牌（已摊牌的）、公共牌序列、每条街每个玩家的动作及金额、最终底池分配、用户盈亏
- GIVEN 用户关闭浏览器后重新打开，WHEN 访问历史记录，THEN 之前保存的所有手牌记录仍然可用
- GIVEN IndexedDB存储空间，WHEN 持续保存手牌记录，THEN 单条记录体积控制合理（不超过10KB），支持存储至少10000局

### F-007 post-game-review (P0)
赛后逐手复盘功能，逐步回放每个决策点，在每个节点标注GTO推荐动作 vs 用户实际动作，用红/黄/绿色可视化偏差程度。

**Acceptance Criteria:**
- GIVEN 用户进入复盘界面选择一手牌，WHEN 回放开始，THEN 按时间顺序逐步展示每个决策点的牌面状态
- GIVEN 回放到用户的某个决策点，WHEN 显示对比信息，THEN 同时展示"用户实际动作"和"GTO推荐动作"
- GIVEN 用户实际动作与GTO推荐完全一致，WHEN 显示该决策点，THEN 标注为绿色（正确）
- GIVEN 用户实际动作与GTO推荐有轻微偏差（如GTO建议Call 60%/Raise 40%，用户选了Raise），WHEN 显示该决策点，THEN 标注为黄色（可接受偏差）
- GIVEN 用户实际动作与GTO推荐严重偏离（如GTO建议Fold 90%+，用户选了Call），WHEN 显示该决策点，THEN 标注为红色（显著错误）
- GIVEN 一手牌回放完成，WHEN 显示总结，THEN 展示该手牌的"GTO得分"（基于各决策点偏差的综合评分）
- GIVEN 用户在复盘中，WHEN 点击前进/后退按钮，THEN 可以自由在各决策点之间跳转

### F-008 hand-history-browser (P1)
历史战绩浏览界面，列表展示所有已保存的手牌记录，支持按时间排序，显示关键摘要信息，点击可进入复盘。

**Acceptance Criteria:**
- GIVEN 用户进入历史记录页面，WHEN 页面加载完成，THEN 按时间倒序显示所有已保存手牌的列表
- GIVEN 历史记录列表中的每条记录，WHEN 展示摘要，THEN 显示：日期时间、用户手牌、最终结果（盈/亏金额）、GTO得分
- GIVEN 用户点击某条历史记录，WHEN 进入详情，THEN 跳转到该手牌的复盘界面（F-007）
- GIVEN 历史记录超过一屏，WHEN 用户滚动列表，THEN 列表流畅滚动无卡顿（支持虚拟列表优化）

### F-009 table-ui (P0)
教学导向的六人桌牌桌界面，显示6个座位、公共牌区、底池、筹码、玩家手牌（用户可见自己的底牌）、BOT风格标签、当前行动者高亮。

**Acceptance Criteria:**
- GIVEN 牌局进行中，WHEN 牌桌界面渲染，THEN 显示6个座位按标准位置排列（UTG/HJ/CO/BTN/SB/BB），每个座位显示玩家名称、筹码量、风格标签（BOT）
- GIVEN 用户坐在某个位置，WHEN 发牌完成，THEN 用户可见自己的2张底牌，其他玩家底牌显示为牌背
- GIVEN 当前轮到某位玩家行动，WHEN 牌桌渲染，THEN 该玩家座位有明显的高亮指示
- GIVEN 牌局处于某条街，WHEN 公共牌区域显示，THEN 正确显示已发出的公共牌和当前底池总额
- GIVEN 某位玩家执行动作，WHEN 动作完成，THEN 该位置短暂显示动作标签（如"Raise to 300"）

### F-010 session-management (P0)
牌局会话管理，用户可以开始新牌局、连续打多手牌、查看当前session的筹码变化。

**Acceptance Criteria:**
- GIVEN 用户在首页，WHEN 点击"开始对战"，THEN 初始化一个新session，所有玩家获得默认起始筹码（如100BB）
- GIVEN 一手牌结束，WHEN 结果结算完成，THEN 自动开始下一手牌，庄位按规则轮转
- GIVEN 用户正在session中，WHEN 查看界面，THEN 可见当前筹码量和本session盈亏

### F-011 chinese-localization (P0)
默认中文界面，所有UI文案、GTO提示、教学内容使用中文，扑克术语提供中英双语标注（如"翻牌 Flop"）。

**Acceptance Criteria:**
- GIVEN 用户首次打开应用，WHEN 界面加载完成，THEN 所有UI元素默认显示中文
- GIVEN 界面中出现扑克术语，WHEN 术语显示，THEN 同时标注中英文（如"翻前 Preflop"、"紧凶 TAG"）
- GIVEN GTO提示内容，WHEN 显示教学文案，THEN 使用中文描述策略建议和理由

### F-012 instant-play-experience (P1)
零门槛即时体验——无需注册、无需登录，打开浏览器即可开始第一手牌，首屏到第一手牌体验控制在30秒内。

**Acceptance Criteria:**
- GIVEN 用户首次访问应用URL，WHEN 页面加载完成，THEN 无任何注册/登录要求，直接显示开始游戏入口
- GIVEN 用户点击开始游戏，WHEN 从首屏到第一手牌发出，THEN 总耗时不超过30秒（含页面加载和初始化）

### F-013 learning-progress-tracking (P2)
追踪用户学习进度，统计常见错误模式（如特定位置频繁犯错、某类牌型决策偏差大），展示进步趋势。

**Acceptance Criteria:**
- GIVEN 用户打了多局牌，WHEN 查看学习进度页面，THEN 显示GTO得分趋势图（按时间）
- GIVEN 累积的历史数据，WHEN 分析错误模式，THEN 高亮显示用户最常犯错的场景类型（如"在SB位置3bet频率过低"）

### F-014 six-max-positions (P0)
正确实现六人桌位置系统（UTG、HJ/MP、CO、BTN、SB、BB），庄位按手数轮转，位置影响GTO策略查询和BOT决策。

**Acceptance Criteria:**
- GIVEN 牌局开始，WHEN 位置分配完成，THEN 6个座位分别标注UTG/HJ/CO/BTN/SB/BB
- GIVEN 一手牌结束开始下一手，WHEN 庄位轮转，THEN BTN顺时针移动一位，所有位置相应更新
- GIVEN BOT在某个位置，WHEN BOT做决策，THEN 其行为范围受当前位置影响（如UTG比BTN更紧）

## Constraints

- **纯前端应用**：无后端服务，所有逻辑在浏览器端运行
- **数据持久化**：仅浏览器本地存储（IndexedDB），换设备/清缓存数据丢失
- **GTO数据精度**：Preflop使用成熟公开的6-max标准GTO范围；Postflop为简化GTO参考（非solver精确解），需明确标注精度等级
- **GTO数据体积预算**：Preflop策略表 < 2MB，Postflop策略数据 < 20MB（lazy loaded）
- **仅支持6-max NL Hold'em**：不支持其他牌桌人数或游戏变体
- **BOT基于规则引擎**：非实时solver计算，通过风格参数化实现不同对手类型
- **浏览器兼容性**：Chrome 90+、Firefox 90+、Safari 15+、Edge 90+
- **首次加载性能**：首屏到可交互控制在合理时间内，GTO postflop数据按需加载
- **语言**：默认中文界面，术语中英双语标注

## Out of Scope

- 多人在线对战（仅单人 vs BOT）
- 自定义策略表上传/编辑
- 高级统计分析（HUD、详细VPIP/PFR/AF等统计面板）
- 锦标赛模式（MTT/SNG）
- 真金模式 / 任何涉及真实货币的功能
- 账号系统 / 用户注册登录
- 云端数据同步
- 移动端原生App（仅Web应用，但需响应式适配移动端浏览器）
- 实时solver计算（仅使用预计算数据）
- 英文或其他语言界面切换（MVP仅中文）
- Heads-up（单挑）或其他非6-max桌型
- 手牌历史导入（如PokerStars HH格式导入）
