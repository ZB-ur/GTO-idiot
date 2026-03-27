## Goal
GTO Idiot 是一个免费的德州扑克GTO策略练习器，让初学者在6人桌现金桌中与不同风格的BOT对战，打完后通过逐手复盘对比标准GTO策略，以"先打后学"的方式帮助用户理解和内化GTO决策。

## Target Users
- **Primary persona**: 德州扑克初学者，刚接触GTO概念，了解基本规则但不熟悉最优策略。通过桌面浏览器访问，技术水平一般，需要清晰的中文引导和解释。期望零成本、无安装的练习环境。
- **Secondary persona**: 休闲玩家，有一定扑克经验但从未系统学习GTO，希望通过对战+复盘发现自己的策略漏洞。

## Features

### F-001 poker-table-ui (P0)
6人桌现金桌的可视化牌桌界面，展示座位、玩家信息、公共牌、底池、筹码和当前操作状态。

**Acceptance Criteria:**
- GIVEN 用户进入牌桌页面, WHEN 牌局开始, THEN 界面显示6个座位（用户+5个BOT），每个座位显示玩家昵称、筹码数量和位置标签（UTG/HJ/CO/BTN/SB/BB）
- GIVEN 牌局进行中, WHEN 公共牌发出, THEN 牌桌中央依次显示翻牌（3张）、转牌（1张）、河牌（1张），牌面清晰可辨
- GIVEN 牌局进行中, WHEN 任何玩家下注或加注, THEN 底池数额实时更新，下注筹码在对应玩家位置可见
- GIVEN 牌局进行中, WHEN 轮到某个玩家行动, THEN 该玩家座位有明确的高亮指示，显示剩余思考时间或行动状态

### F-002 player-actions (P0)
用户在每个决策点可执行弃牌（fold）、跟注（call）、加注（raise）操作，牌局中不提供任何GTO提示。

**Acceptance Criteria:**
- GIVEN 轮到用户行动, WHEN 用户面对下注, THEN 显示三个操作按钮：弃牌（fold）、跟注（call，显示需跟注金额）、加注（raise，可输入加注金额）
- GIVEN 轮到用户行动, WHEN 无人开池（翻前）或前面全部过牌, THEN 显示两个操作按钮：过牌（check）、下注/加注（bet/raise，可输入金额）
- GIVEN 用户选择加注, WHEN 输入的加注金额低于最小加注额或高于剩余筹码, THEN 显示明确的金额限制提示，阻止提交
- GIVEN 牌局进行中, WHEN 不轮到用户行动, THEN 操作按钮不可点击或隐藏，用户只能观察BOT行动

### F-003 game-engine (P0)
完整的6人桌No-Limit Hold'em现金桌牌局引擎，固定1/2盲注、200BB买入，处理发牌、下注轮次、摊牌和底池分配。

**Acceptance Criteria:**
- GIVEN 新牌局开始, WHEN 引擎初始化, THEN 每位玩家分配200BB（400筹码），庄位按顺时针轮转，小盲1/大盲2自动下注
- GIVEN 翻前阶段, WHEN 所有玩家完成行动, THEN 引擎正确判断是否进入翻牌阶段（至少2名玩家未弃牌且下注金额一致）
- GIVEN 牌局进行到摊牌, WHEN 多名玩家未弃牌, THEN 引擎正确比较手牌大小，将底池分配给赢家；平局时平分底池
- GIVEN 某玩家全押（all-in）, WHEN 其他玩家继续下注, THEN 引擎正确创建和分配边池（side pot）
- GIVEN 只剩一名玩家未弃牌, WHEN 其他所有玩家弃牌, THEN 该玩家赢得底池，不进行摊牌
- GIVEN 一手牌结束, WHEN 底池分配完成, THEN 自动开始下一手牌，庄位顺时针移动一位，筹码量从上一手延续

### F-004 bot-players (P0)
5个不同风格的BOT玩家，基于内置GTO策略表加风格参数偏移做出决策，提供多样化的对战体验。

**Acceptance Criteria:**
- GIVEN 牌桌初始化, WHEN 5个BOT就位, THEN 每个BOT有独立的昵称和可见的风格标签（如TAG紧凶、LAG松凶、Fish鱼等）
- GIVEN BOT风格为TAG（紧凶）, WHEN 翻前决策, THEN 其开牌范围比标准GTO范围收窄（更紧），翻后下注频率偏高（更凶）
- GIVEN BOT风格为Fish（鱼）, WHEN 面对加注, THEN 其跟注频率明显高于GTO建议（更松被动），极少使用加注和诈唬
- GIVEN 任何BOT, WHEN 轮到其行动, THEN 在合理的短暂延迟（模拟思考）后做出决策，决策结果（fold/call/raise及金额）在牌桌上可见
- GIVEN BOT做出决策, WHEN 决策过程执行, THEN 决策基于内置GTO策略表+该BOT的风格参数偏移计算，而非随机行动

### F-005 gto-strategy-data (P0)
内置简化GTO策略表，包含翻前范围表（6个位置×多种场景）和翻后简化策略树（基于牌面纹理分类），作为BOT决策和复盘对比的数据基础。

**Acceptance Criteria:**
- GIVEN 翻前场景, WHEN 查询某位置（UTG/HJ/CO/BTN/SB/BB）的GTO策略, THEN 返回该位置的开牌范围（13×13矩阵中的raise/call/fold建议）
- GIVEN 翻前面对3-bet场景, WHEN 查询GTO策略, THEN 返回对应位置的4-bet/call/fold范围
- GIVEN 翻后场景, WHEN 查询GTO策略, THEN 基于牌面纹理分类（干燥/湿润/配对）、SPR区间和位置返回简化的行动建议（check/bet及下注尺度）
- GIVEN GTO策略查询结果, WHEN 结果来自翻后简化策略树, THEN 结果标注置信度级别：翻前标注为"精确"，翻后标注为"近似参考"

### F-006 hand-history-storage (P0)
每手牌的完整hand history自动保存，包括所有玩家动作、公共牌、底池变化和最终结果。

**Acceptance Criteria:**
- GIVEN 一手牌进行中, WHEN 任何玩家执行动作, THEN 该动作（类型、金额、时间戳）被记录到当前手牌的历史数据中
- GIVEN 一手牌结束, WHEN 底池分配完成, THEN 完整的hand history（手牌ID、盲注级别、每位玩家的手牌和位置、所有街的公共牌、所有动作序列、底池变化、最终结果）保存到后端存储
- GIVEN hand history已保存, WHEN 用户后续请求查看, THEN 能够完整检索到该手牌的所有信息
- GIVEN 用户进行多个session的对战, WHEN 查看历史记录, THEN 所有session的hand history均被持久化保存，不因页面刷新或关闭而丢失

### F-007 hand-replay (P0)
逐手回放历史牌局，以时间轴方式呈现每个街（翻前→翻牌→转牌→河牌），每个决策点显示用户的实际选择与GTO推荐动作的对比。

**Acceptance Criteria:**
- GIVEN 用户选择回放某手牌, WHEN 复盘界面加载, THEN 显示时间轴导航（翻前→翻牌→转牌→河牌四个节点），用户可点击任意节点跳转到对应阶段
- GIVEN 复盘中的某个用户决策点, WHEN 用户查看该节点, THEN 同时显示：用户的实际选择、GTO推荐动作、两者之间的EV差异（标注为"估算EV"）
- GIVEN 复盘中的某个用户决策点, WHEN 显示GTO对比结果, THEN 使用3级评分：✅最优（符合GTO）、⚠️可接受（轻微偏离）、❌错误（严重偏离），并附带1-2句中文解释说明为什么GTO推荐该动作
- GIVEN 复盘中的某个决策点, WHEN GTO策略数据来自翻后简化策略树, THEN 界面标注"近似参考"，与翻前的"精确"区分

### F-008 session-stats (P1)
查看历史对战的盈亏记录和基本统计数据，帮助用户追踪学习进度。

**Acceptance Criteria:**
- GIVEN 用户打完至少一手牌, WHEN 用户查看统计页面, THEN 显示总盈亏金额（以BB为单位）、总手牌数、胜率（赢得底池的手牌比例）
- GIVEN 用户有多次对战记录, WHEN 用户查看统计页面, THEN 显示盈亏走势图（X轴为手牌数，Y轴为累计盈亏BB数）
- GIVEN 用户有复盘记录, WHEN 用户查看统计页面, THEN 显示GTO符合率（决策被评为✅最优的比例）和平均每手EV损失

### F-009 game-lobby (P1)
牌局大厅，用户可以开始新牌局或查看/继续之前的牌局session。

**Acceptance Criteria:**
- GIVEN 用户进入应用, WHEN 首页加载, THEN 显示"开始新牌局"按钮和历史session列表（如果有）
- GIVEN 用户点击"开始新牌局", WHEN 牌桌初始化, THEN 创建新的6人桌session，用户和5个BOT就位，第一手牌自动开始
- GIVEN 用户有未结束的session, WHEN 用户点击该session, THEN 可以选择"继续对战"或"查看复盘"

### F-010 gto-explanation (P1)
复盘中每个决策点的GTO建议附带简短中文解释，帮助初学者理解GTO推荐背后的逻辑。

**Acceptance Criteria:**
- GIVEN 复盘中显示GTO推荐动作, WHEN 推荐与用户选择不同, THEN 显示1-2句中文解释，说明推荐原因（如"在CO位置，ATs属于标准开牌范围，弃牌损失了+EV的机会"）
- GIVEN 翻前决策点, WHEN 显示GTO解释, THEN 解释包含位置和手牌强度的上下文（如"UTG位置开牌范围较紧，J9o不在开牌范围内"）
- GIVEN 翻后决策点, WHEN 显示GTO解释, THEN 解释包含牌面纹理和相对手牌强度的上下文（如"湿润牌面上，顶对弱踢脚应该选择过牌而非下注，因为下注会被更好的牌跟注、更差的牌弃牌"）

### F-011 hand-list-browser (P1)
浏览和筛选历史手牌列表，方便用户找到特定的牌局进行复盘。

**Acceptance Criteria:**
- GIVEN 用户进入复盘区域, WHEN 页面加载, THEN 显示所有已保存手牌的列表，按时间倒序排列，每条显示手牌ID、用户手牌、结果（赢/输及金额）、GTO评分摘要
- GIVEN 手牌列表, WHEN 用户点击某手牌, THEN 跳转到该手牌的详细复盘界面（F-007）
- GIVEN 手牌列表, WHEN 用户筛选"仅显示❌错误决策的手牌", THEN 列表过滤为包含至少一个❌评分决策点的手牌

### F-012 sound-effects (P2)
牌局中的音效反馈，包括发牌声、筹码声、操作确认声等，增强沉浸感。

**Acceptance Criteria:**
- GIVEN 牌局进行中, WHEN 发牌、下注、跟注、加注、弃牌等动作发生, THEN 播放对应的音效
- GIVEN 用户偏好, WHEN 用户点击静音按钮, THEN 所有音效关闭，再次点击恢复

### F-013 card-deal-animation (P2)
发牌和公共牌翻开的动画效果，提升牌桌视觉体验。

**Acceptance Criteria:**
- GIVEN 新一手牌开始, WHEN 系统发手牌, THEN 卡牌以动画方式从牌堆发到各个座位
- GIVEN 进入翻牌/转牌/河牌阶段, WHEN 公共牌翻开, THEN 公共牌以翻转动画方式展示

## Constraints

- 牌桌设置固定：1/2盲注，200BB买入（400筹码），不可自定义
- 仅支持6人桌（6-max）No-Limit Hold'em现金桌
- GTO策略数据为内置简化版本：翻前范围表为精确数据，翻后策略树为基于牌面纹理分类的近似数据，非solver级精确计算
- EV差异计算为估算值，基于简化模型而非精确solver计算
- 复盘对比的是标准GTO策略，而非BOT的实际决策策略
- Web应用，通过浏览器访问，无需安装；MVP阶段仅保证桌面端体验（最小宽度1024px）
- 界面语言为中文
- MVP阶段为完全免费产品

## Out of Scope

- 多桌同时进行
- 锦标赛（MTT/SNG）模式
- 自定义盲注级别或买入金额
- 牌局进行中的实时GTO提示或辅助
- 多人在线对战（仅支持单人vs BOT）
- 移动端适配和响应式小屏布局
- 高级统计分析指标（VPIP、PFR、3-bet%、WTSD%等）
- Solver级精确GTO计算
- Hand History导入/导出功能
- 用户账号注册/登录系统（MVP阶段数据存储在本地或匿名session）
- 国际化/多语言支持
- BOT风格自定义或难度调节
- 3-way及以上多人底池的翻后精确GTO策略