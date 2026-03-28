## Goal
为扑克新手/初中级玩家提供一个免费、浏览器端的六人桌德州扑克GTO策略练习器，通过与不同风格BOT实战对打+赛后逐手GTO复盘，快速提升决策水平。

## Target Users
- **Primary persona**: 扑克新手/初中级玩家，刚接触GTO概念，有基本的德州扑克规则认知但缺乏系统性GTO训练，希望通过"打牌→复盘"闭环学习。使用桌面浏览器访问，无需安装或注册。
- **Secondary persona**: 有一定经验的休闲玩家，想验证自己的决策是否符合GTO标准，需要便捷的对比工具。

## Features

### F-001 game-engine (P0)
完整的6-max No-Limit Hold'em Cash Game牌局引擎，支持从preflop到river的完整牌局流程。100BB起始筹码，固定盲注结构。

**Acceptance Criteria:**
- GIVEN 用户点击"开始新牌局", WHEN 牌局初始化完成, THEN 6个座位各有100BB筹码，SB/BB自动下盲注，每位玩家收到2张底牌
- GIVEN 牌局进行中, WHEN 一个下注轮所有玩家行动完毕, THEN 自动进入下一阶段（preflop→flop→turn→river）并发出相应公共牌
- GIVEN 多个玩家all-in, WHEN 存在筹码差异, THEN 正确计算主池和边池，并将筹码分配给相应获胜者
- GIVEN 仅剩一个玩家未fold, WHEN 其余玩家全部fold, THEN 该玩家赢得底池，牌局结束
- GIVEN 牌局到达showdown, WHEN 比较所有未fold玩家的手牌, THEN 正确判定最佳5张牌组合并将底池分配给获胜者（平分池处理平局）
- GIVEN 一局结束, WHEN 筹码结算完毕, THEN 庄位按顺时针移动一位，开始下一局

### F-002 player-actions (P0)
用户在牌局中的决策操作界面，支持fold/check/call/bet/raise/all-in。

**Acceptance Criteria:**
- GIVEN 轮到用户行动, WHEN 面对加注, THEN 显示可用操作为fold/call/raise，call金额和最小raise金额正确显示
- GIVEN 轮到用户行动, WHEN 无人加注（checked to player）, THEN 显示可用操作为check/bet
- GIVEN 用户选择raise/bet, WHEN 输入金额, THEN 提供滑块和快捷按钮（1/3 pot, 1/2 pot, 2/3 pot, pot, all-in），金额不得低于最小加注额或高于用户当前筹码
- GIVEN 非用户行动回合, WHEN 等待BOT或其他流程, THEN 操作按钮置灰不可点击

### F-003 bot-opponents (P0)
5个不同风格的BOT对手，基于参数化规则引擎实现，提供有意义的对战场景。

**Acceptance Criteria:**
- GIVEN 牌局开始, WHEN 5个BOT座位分配完成, THEN 每个BOT有独立的昵称和风格标识（如TAG/LAG/鱼等）
- GIVEN BOT轮到行动, WHEN 根据其风格参数（VPIP/PFR/Aggression等）计算决策, THEN 在合理时间内（< 2秒）做出fold/call/raise决策
- GIVEN TAG风格BOT, WHEN preflop面对RFI场景, THEN 其入池范围明显窄于LAG风格BOT（符合紧凶特征）
- GIVEN 鱼风格BOT, WHEN 面对加注, THEN 倾向于被动跟注而非加注或弃牌（符合跟注站特征）
- GIVEN 任意BOT, WHEN 决策包含随机化, THEN 同一场景下不总是做出相同动作（行为具有适当的随机性）

### F-004 table-ui (P0)
6-max牌桌可视化界面，显示座位、筹码、公共牌、底池等信息。

**Acceptance Criteria:**
- GIVEN 牌局进行中, WHEN 牌桌渲染, THEN 清晰显示6个座位位置（UTG/HJ/CO/BTN/SB/BB）、每个玩家的筹码量、当前庄位标记
- GIVEN 用户有底牌, WHEN 牌桌渲染, THEN 用户底牌面朝上显示，BOT底牌面朝下（showdown除外）
- GIVEN flop/turn/river阶段, WHEN 公共牌发出, THEN 公共牌在牌桌中央清晰显示
- GIVEN 有玩家下注/加注, WHEN 行动完成, THEN 底池金额实时更新，当前下注额显示在对应玩家位置旁
- GIVEN 当前轮到某玩家行动, WHEN 牌桌渲染, THEN 该玩家座位有明显的高亮标识

### F-005 hand-history-storage (P0)
牌局历史记录本地持久化存储，记录每局完整的行动序列和结果。

**Acceptance Criteria:**
- GIVEN 一局牌结束, WHEN 结果结算完毕, THEN 完整的牌局数据（底牌、公共牌、每个决策点的行动、底池变化、最终结果）自动保存到IndexedDB
- GIVEN 用户打开历史记录页面, WHEN 加载历史数据, THEN 按时间倒序显示所有已保存的牌局，每条记录显示日期、盈亏、关键信息摘要
- GIVEN 用户已保存1000局以上, WHEN 访问历史记录, THEN 加载时间不超过3秒，支持分页浏览
- GIVEN 用户清除浏览器数据, WHEN 重新访问应用, THEN 历史记录被清除（无云端备份，本地存储预期行为）

### F-006 post-game-review (P0)
赛后逐手复盘功能，回放牌局并在每个决策点对比GTO推荐动作。

**Acceptance Criteria:**
- GIVEN 用户选择一局已完成的牌局进入复盘, WHEN 复盘界面加载, THEN 显示该局的牌桌状态回放，可逐步前进/后退到每个决策点
- GIVEN 复盘中到达用户的某个决策点, WHEN 该spot有GTO参考数据, THEN 显示GTO推荐动作（fold/call/raise）及各动作的建议频率，同时标注用户的实际操作
- GIVEN 用户实际操作与GTO推荐一致, WHEN 复盘显示该决策点, THEN 以绿色标记（符合GTO）
- GIVEN 用户实际操作与GTO推荐有显著偏差, WHEN 复盘显示该决策点, THEN 以红色标记（严重偏差）并提示推荐动作
- GIVEN 用户实际操作与GTO推荐有轻微偏差, WHEN 复盘显示该决策点, THEN 以黄色标记（轻微偏差）
- GIVEN 某个决策点的spot未被GTO策略表覆盖, WHEN 复盘显示该决策点, THEN 显示"无GTO参考数据"提示，不做对比评判

### F-007 gto-strategy-data (P0)
内置预计算GTO策略表，覆盖Preflop全位置场景和Postflop高频场景分类。

**Acceptance Criteria:**
- GIVEN preflop场景, WHEN 查询GTO策略, THEN 覆盖6个位置的RFI/facing-RFI/3bet/facing-3bet场景（至少50个spot），每个spot返回各手牌的推荐动作和频率
- GIVEN postflop场景, WHEN 查询GTO策略, THEN 按牌面纹理分类（high/mid/low/monotone/paired等）和SPR区间提供简化的标准策略
- GIVEN 一个被覆盖的spot, WHEN 策略表返回数据, THEN 数据格式包含 `{actions: [{action: 'fold'|'call'|'raise', frequency: number}]}` 且频率之和为100%
- GIVEN 一个未覆盖的spot, WHEN 查询策略表, THEN 返回空结果（而非错误或虚假数据）

### F-008 session-stats (P1)
对战统计面板，显示累计和单次session的关键数据。

**Acceptance Criteria:**
- GIVEN 用户打开统计页面, WHEN 加载统计数据, THEN 显示累计手数、总盈亏（BB计）、每手牌平均盈亏（bb/100）
- GIVEN 用户有复盘过的牌局, WHEN 查看统计, THEN 显示GTO符合度（所有有GTO参考的决策点中，用户操作符合GTO的百分比）
- GIVEN 用户按位置筛选, WHEN 选择某个位置（如BTN）, THEN 仅显示该位置的统计数据

### F-009 key-hand-marking (P1)
关键手牌标记功能，自动和手动标记值得复盘的手牌。

**Acceptance Criteria:**
- GIVEN 一局牌结束, WHEN 用户盈亏超过一定阈值（如±20BB）, THEN 自动标记为"关键手牌"
- GIVEN 一局牌结束, WHEN 用户在某个决策点的操作与GTO推荐严重偏差, THEN 自动标记为"关键手牌"
- GIVEN 历史记录列表, WHEN 用户点击某局旁的标记按钮, THEN 可手动添加/移除"关键手牌"标记
- GIVEN 历史记录页面, WHEN 用户选择"仅显示关键手牌", THEN 列表过滤仅展示被标记的牌局

### F-010 landing-page (P1)
首页/落地页，传达产品价值主张并引导用户快速开始。

**Acceptance Criteria:**
- GIVEN 用户首次访问应用, WHEN 首页加载完成, THEN 清晰展示产品名称（GTO Idiot）、核心价值（免费GTO练习器）和"开始对战"入口按钮
- GIVEN 用户点击"开始对战", WHEN 导航完成, THEN 直接进入牌桌开始新牌局（无需注册或配置）

### F-011 gto-coverage-indicator (P2)
在复盘和对战中显示当前场景的GTO数据覆盖状态。

**Acceptance Criteria:**
- GIVEN 牌局进行中某个决策点, WHEN 该spot有GTO参考数据, THEN 在UI角落显示一个小图标表示"有GTO参考"
- GIVEN 牌局进行中某个决策点, WHEN 该spot无GTO参考数据, THEN 显示"无GTO数据"指示

### F-012 deal-animation (P2)
牌桌发牌和筹码移动的基础动画效果。

**Acceptance Criteria:**
- GIVEN 新一局开始, WHEN 发底牌, THEN 有简单的发牌动画（牌从牌堆移动到玩家位置）
- GIVEN 某玩家赢得底池, WHEN 底池分配, THEN 有简单的筹码移动动画

## Constraints
- 纯浏览器运行，无后端服务，所有计算在客户端完成
- 数据存储使用IndexedDB（主要）和localStorage（配置），无云同步
- GTO策略数据为预计算JSON，覆盖常见spot的简化解（非完整solver输出），Preflop高覆盖，Postflop仅高频分类
- 6人桌固定（不支持2/4/9人桌等其他桌型）
- Cash Game模式，100BB起始深度，固定盲注（如1/2）
- GTO数据覆盖范围必须在UI中明确标注，未覆盖spot不显示虚假数据
- 首次加载无需注册或登录，即开即玩
- 手牌评估可使用pokersolver库，牌局引擎自建

## Out of Scope
- 多人在线对战（联机模式）
- 锦标赛（MTT）/ Sit & Go（SNG）模式
- 自定义BOT参数（用户不可调整BOT风格设定）
- 高级GTO solver实时计算（如PioSolver级别的精确求解）
- 移动端适配 / 响应式手机布局
- 用户账号系统 / 云端数据同步
- 2人桌（HU）/ 4人桌 / 9人桌等其他桌型
- 筹码深度自定义（固定100BB）
- 盲注变化 / 时间限制 / 定时升盲
- 手牌导入/导出（如PokerStars hand history格式）
- 高级统计分析（如VPIP/PFR/WTSD等HUD数据）
- 社交功能（排行榜、好友对战等）
