# GTO Idiot — Product Requirements Document

## Goal
为德州扑克初学者提供一个免费、零安装的六人桌BOT对战练习器，通过完整牌局对战+赛后GTO复盘，帮助用户直观理解自己的决策与GTO最优策略的差距，快速掌握GTO基础。

## Target Users
- **Primary persona**: 德州扑克初学者，刚接触GTO概念（1-6个月经验），了解基本规则但不熟悉位置策略和数学最优解，希望通过低压力的BOT对战反复练习。技术水平：能使用现代浏览器，无需任何安装或注册。设备：桌面浏览器为主。
- **Secondary persona**: 有一定经验的休闲玩家，希望用碎片时间复习preflop range和检验自己的决策习惯。

## Features

### F-001 game-table-setup (P0)
六人桌现金桌创建与配置。用户选择座位、设定买入筹码量，开始与5个BOT的固定盲注现金桌对战。

**Acceptance Criteria:**
- GIVEN 用户在主页，WHEN 点击"开始对战"，THEN 显示六人桌座位选择界面，6个座位位置标注为UTG/MP/CO/BTN/SB/BB
- GIVEN 座位选择界面，WHEN 用户点击一个空座位，THEN 该座位被选中并高亮，其余5个座位自动分配不同风格的BOT
- GIVEN 用户已选座位，WHEN 用户确认买入筹码量（默认100BB），THEN 牌局开始，所有玩家筹码就位
- GIVEN 牌局进行中，WHEN 用户想切换座位，THEN 需等待当前手牌结束后才能更换

### F-002 poker-engine (P0)
完整的六人桌德州扑克游戏引擎，管理发牌、下注轮次、底池计算和摊牌判定。

**Acceptance Criteria:**
- GIVEN 新一手牌开始，WHEN 系统发牌，THEN 每位玩家收到2张底牌，公共牌区为空，小盲和大盲自动下注
- GIVEN 任意下注轮次，WHEN 所有未弃牌玩家完成行动且下注额一致，THEN 进入下一轮次（preflop→flop→turn→river）或进入摊牌
- GIVEN flop轮开始，WHEN 系统翻牌，THEN 公共牌区显示3张牌；turn显示第4张；river显示第5张
- GIVEN 摊牌阶段，WHEN 系统比较所有未弃牌玩家手牌，THEN 最佳5张牌组合的玩家赢得底池，平手则均分
- GIVEN 某玩家all-in且有多个对手，WHEN 存在筹码差异，THEN 正确计算主池和边池并分别判定赢家
- GIVEN 仅剩一名玩家未弃牌，WHEN 其他所有玩家fold，THEN 该玩家直接赢得底池，无需摊牌

### F-003 player-actions (P0)
玩家在每个行动点（preflop/flop/turn/river）做出决策：fold、check、call、bet、raise、all-in。

**Acceptance Criteria:**
- GIVEN 轮到用户行动，WHEN 行动按钮出现，THEN 仅显示当前合法的行动选项（如无人下注时不显示call，显示check和bet）
- GIVEN 用户可以raise，WHEN 用户点击raise，THEN 出现筹码滑块，可选择加注额（最小加注到all-in），并显示底池比例参考（1/3 pot, 1/2 pot, 2/3 pot, pot）
- GIVEN 用户选择一个行动，WHEN 点击确认，THEN 行动生效，筹码从用户stack扣除，底池更新，轮到下一位玩家行动
- GIVEN 非用户行动回合，WHEN 等待BOT行动，THEN 用户的行动按钮不可点击，界面显示当前行动的BOT

### F-004 bot-ai (P0)
5个不同风格的BOT对手，各有独特的决策倾向，模拟真实牌桌的对手多样性。

**Acceptance Criteria:**
- GIVEN 牌局开始，WHEN 5个BOT就位，THEN 每个BOT有独特的名字、头像标识和风格标签（TAG紧凶/LAG松凶/Nit紧弱/Fish松弱/GTO平衡）
- GIVEN BOT为TAG风格，WHEN 在preflop阶段，THEN 其入池率(VPIP)明显低于LAG和Fish，但加注率(PFR)较高
- GIVEN BOT为Fish风格，WHEN 在任意阶段，THEN 其入池率高、加注率低，经常做出被动的call行为
- GIVEN BOT为GTO风格，WHEN 在preflop阶段，THEN 其行动与内置GTO range表高度一致
- GIVEN 任意BOT在任意行动点，WHEN 做出决策，THEN 决策在合理时间内完成，不应出现非法操作（如check when facing a bet）

### F-005 observation-mode (P0)
BOT行动带短暂停顿的观察模式，模拟真实牌桌节奏，让初学者有时间观察和思考。

**Acceptance Criteria:**
- GIVEN BOT轮到行动，WHEN BOT做出决策，THEN 行动前有可配置的停顿时间，期间高亮当前行动的BOT座位
- GIVEN 设置界面，WHEN 用户选择速度档位，THEN 提供3档选择：慢速观察（BOT行动间隔2秒）、正常（1秒）、快速（0.3秒）
- GIVEN 默认设置，WHEN 用户首次开始对战，THEN 速度默认为慢速观察档
- GIVEN BOT做出行动，WHEN 行动动画完成，THEN 行动类型和金额以文字标注短暂显示在BOT座位旁

### F-006 hand-history-recording (P0)
完整记录每一手牌的所有行动历史，用于赛后复盘。

**Acceptance Criteria:**
- GIVEN 一手牌进行中，WHEN 任意玩家做出行动，THEN 系统记录：手牌编号、玩家位置、行动类型、金额、当前底池、公共牌、时间戳
- GIVEN 一手牌结束，WHEN 进入下一手或用户退出，THEN 完整手牌记录（包括所有玩家底牌、最终结果、底池归属）被持久化存储
- GIVEN 用户使用应用超过500手，WHEN 存储空间接近上限，THEN 自动清理最旧的记录并提示用户

### F-007 hand-replay (P0)
赛后逐手回放，在每个决策点对比用户实际选择与GTO最优选择。

**Acceptance Criteria:**
- GIVEN 用户进入复盘界面，WHEN 选择一手历史牌局，THEN 牌桌以初始状态展示，可逐步推进每个行动
- GIVEN 回放到用户的某个决策点，WHEN 该决策点显示，THEN 同时展示：用户的实际选择、GTO推荐行动、三色标注（绿色=GTO一致，黄色=可接受偏差，红色=严重错误）
- GIVEN 回放中某个决策被标注为红色，WHEN 用户查看该决策，THEN 显示一句话GTO理由说明（如"此位置GTO建议fold，因为手牌不在UTG开牌范围内"）
- GIVEN 回放界面，WHEN 用户点击"上一步"或"下一步"，THEN 牌桌状态相应前进或后退一个行动
- GIVEN 一手牌的回放，WHEN 回放结束，THEN 显示该手牌的GTO吻合度分数和关键偏差总结

### F-008 gto-comparison (P0)
内置预计算GTO策略表，用于对比用户决策与GTO最优策略。

**Acceptance Criteria:**
- GIVEN 用户在preflop做出决策，WHEN 系统进行GTO对比，THEN 基于用户位置、面对的行动（open/facing raise等）和手牌，从preflop range表中查询GTO推荐行动
- GIVEN 用户在postflop做出决策，WHEN 系统进行GTO对比，THEN 基于牌面texture分类、位置、SPR等维度，从简化postflop策略表中查询近似GTO建议
- GIVEN GTO对比结果为postflop建议，WHEN 显示给用户，THEN 明确标注"简化GTO参考"字样，说明这是近似值而非精确solver计算结果
- GIVEN 用户决策与GTO推荐一致，WHEN 标注结果，THEN 显示绿色标识；偏差在可接受范围内显示黄色；严重偏离显示红色

### F-009 statistics-dashboard (P0)
统计面板展示用户的整体表现数据和进步轨迹。

**Acceptance Criteria:**
- GIVEN 用户进入统计页面，WHEN 数据加载完成，THEN 显示以下核心指标：总手数、总盈亏（BB计）、整体胜率、GTO吻合度百分比
- GIVEN 用户有至少10手历史记录，WHEN 查看GTO吻合度，THEN 显示历史趋势折线图（按每10手/每局为单位）
- GIVEN 统计页面，WHEN 显示常见错误类型，THEN 按错误频率排序展示分类（如"UTG位置过度open"、"面对3-bet过多call"等），每类显示发生次数和占比
- GIVEN 用户无任何历史数据，WHEN 进入统计页面，THEN 显示空状态引导，建议用户先完成一局对战

### F-010 preflop-range-chart (P1)
内置可视化的13×13 preflop range chart，支持按位置筛选，作为学习参考。

**Acceptance Criteria:**
- GIVEN 用户打开range chart页面，WHEN 页面加载，THEN 显示13×13的起手牌矩阵（AA到72o），同花牌和非同花牌有视觉区分
- GIVEN range chart显示中，WHEN 用户选择某个位置（UTG/MP/CO/BTN/SB/BB），THEN 矩阵中属于该位置开牌范围的手牌高亮着色，范围外的手牌灰显
- GIVEN range chart显示中，WHEN 用户选择不同的行动场景（open raise/facing 3-bet/etc），THEN 高亮范围相应更新
- GIVEN 牌局进行中，WHEN 用户想查看range chart，THEN 可通过快捷入口调出chart作为浮层参考，不中断牌局

### F-011 poker-table-ui (P0)
暗色扑克桌视觉风格的六人桌界面，包含桌面、座位、公共牌区、底池显示、扑克牌渲染。

**Acceptance Criteria:**
- GIVEN 牌局界面，WHEN 页面渲染完成，THEN 显示椭圆形暗绿色牌桌，6个座位均匀分布，每个座位显示玩家名称、筹码量、当前状态
- GIVEN 牌局界面，WHEN 公共牌翻出，THEN 牌面以清晰可辨的扑克牌样式显示在桌面中央，花色用颜色区分（红心/方块红色，黑桃/梅花黑色）
- GIVEN 用户的底牌区域，WHEN 用户收到底牌，THEN 底牌以较大尺寸显示在界面底部，便于查看
- GIVEN 底池区域，WHEN 有下注行为，THEN 底池总额实时更新并居中显示，各玩家当前轮下注额显示在座位前方
- GIVEN 暗色主题，WHEN 任何页面显示，THEN 整体色调为深色背景，文字和关键元素有足够对比度，护眼且符合扑克桌氛围

### F-012 i18n-bilingual (P1)
支持中文和英文双语切换，所有界面文案、GTO提示、错误分类均支持两种语言。

**Acceptance Criteria:**
- GIVEN 应用任意页面，WHEN 用户点击语言切换按钮，THEN 界面所有文案立即切换为目标语言，无需刷新页面
- GIVEN 用户首次访问，WHEN 检测浏览器语言偏好，THEN 自动选择匹配的语言（中文浏览器默认中文，其余默认英文）
- GIVEN 用户切换语言后，WHEN 下次打开应用，THEN 记住用户的语言选择
- GIVEN GTO复盘的理由说明，WHEN 以任一语言显示，THEN 文案自然流畅，扑克术语使用该语言的惯用表达

### F-013 data-persistence (P0)
使用localStorage持久化所有用户数据，包括对战记录、统计数据和用户设置。

**Acceptance Criteria:**
- GIVEN 用户完成一手牌，WHEN 数据写入localStorage，THEN 手牌记录被序列化为JSON并成功存储
- GIVEN 用户关闭浏览器后重新打开，WHEN 应用加载，THEN 所有历史对战记录、统计数据和设置恢复到上次状态
- GIVEN localStorage数据量超过4MB，WHEN 系统检测到存储接近上限，THEN 自动清理最旧的手牌记录，保留最近500手，并提示用户
- GIVEN 用户想重置所有数据，WHEN 在设置中点击"清除数据"，THEN 弹出确认对话框，确认后清除所有存储数据

### F-014 speed-settings (P1)
游戏速度和显示偏好的设置面板。

**Acceptance Criteria:**
- GIVEN 设置页面，WHEN 用户调整BOT行动速度，THEN 提供3档选择并实时生效
- GIVEN 设置页面，WHEN 用户调整的任何设置，THEN 修改立即保存到localStorage

### F-015 landing-page (P1)
首页/落地页，突出"免费、无需注册、打开即玩"的核心价值主张，引导用户快速开始对战。

**Acceptance Criteria:**
- GIVEN 用户首次访问应用，WHEN 首页加载完成，THEN 显示产品名称"GTO Idiot"、简短slogan、核心卖点（免费/无需注册/打开即玩）和醒目的"开始对战"按钮
- GIVEN 首页，WHEN 用户点击"开始对战"，THEN 直接进入座位选择流程，无需注册或登录
- GIVEN 用户已有历史对战数据，WHEN 回到首页，THEN 显示"继续对战"按钮和上次对战的简要统计摘要

### F-016 postflop-strategy-reference (P2)
简化的postflop策略参考表，按牌面texture、位置、SPR等维度提供基本策略指引。

**Acceptance Criteria:**
- GIVEN 用户在学习区域，WHEN 打开postflop策略参考，THEN 按牌面类型分类（dry/wet/monotone）展示基本策略建议
- GIVEN 策略参考内容，WHEN 显示给用户，THEN 每条建议标注"简化GTO参考"，明确说明为近似值

### F-017 error-type-learning (P2)
基于用户常见错误的针对性学习建议。

**Acceptance Criteria:**
- GIVEN 统计页面显示常见错误列表，WHEN 用户点击某类错误，THEN 展示该类错误的简要解释和改进建议

## Constraints

- **平台约束**: 纯浏览器端Web应用，无后端服务，所有计算在客户端完成
- **存储约束**: 使用localStorage（约5MB上限），自动清理机制保留最近500手记录
- **GTO数据约束**: Preflop range使用公开的预计算数据（169种起手牌 × 6位置 × 多场景）；Postflop策略使用简化规则树（基于牌面texture/位置/SPR的近似建议），非精确solver计算
- **语言约束**: 支持中文和英文双语
- **视觉约束**: 暗色扑克桌风格，深色背景为主
- **用户引导约束**: 面向初学者，所有GTO术语和决策理由需提供易懂的解释
- **浏览器兼容**: Chrome/Edge/Firefox/Safari 最近2个版本
- **side pot简化**: MVP阶段先实现基础all-in和side pot计算，边界情况（多人all-in不同筹码量）可标注为后续迭代 [NEEDS CLARIFICATION: side pot完整实现的优先级]

## Out of Scope

- 锦标赛模式（SNG/MTT）— 仅支持现金桌
- 多人在线对战 — 仅单人vs BOT
- 高级GTO solver实时计算 — 使用预计算简化策略表
- 自定义BOT策略 — BOT风格固定为5种预设
- 排行榜/社交功能 — 无多用户交互
- 移动端原生App — 仅Web浏览器端
- 云端数据同步 — 仅localStorage本地存储
- 用户注册/登录系统 — 无账户体系
- 真金游戏/虚拟货币购买 — 纯练习工具
- 多桌同时对战 — 仅单桌
