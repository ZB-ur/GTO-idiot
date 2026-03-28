## Goal
为德州扑克初学者提供一个免费、零门槛的GTO策略练习器（GTO Idiot），通过6人桌连续牌局对战、手牌记录和赛后逐手复盘对比GTO标准，帮助用户在实战中理解和纠正策略偏离。

## Target Users
- **Primary persona:** 德州扑克初学者，刚接触GTO概念，了解基本规则但不熟悉最优策略，需要大量引导和简洁易懂的解释，通过桌面浏览器访问使用，无需注册或付费。

## Features

### F-001 poker-game-engine (P0)
6人桌NL Hold'em牌局对战引擎。用户在固定盲注（100BB起始深度）的6-max桌上与5个GTO BOT进行连续牌局对战，完整覆盖preflop/flop/turn/river四个街。

**Acceptance Criteria:**
- GIVEN 用户进入牌局，WHEN 牌局开始，THEN 系统自动为6名玩家发2张底牌，按正确顺序（SB→BB→UTG→...）执行盲注
- GIVEN 当前轮到用户行动，WHEN 用户选择fold/check/call/bet/raise，THEN 系统记录该操作并推进到下一位行动玩家
- GIVEN 一手牌结束（所有人fold或showdown），WHEN 胜负判定完成，THEN 系统按规则分配底池并自动开始下一手牌，庄位顺移
- GIVEN 牌局进行中，WHEN 出现all-in情况，THEN 系统正确处理all-in逻辑（MVP可简化side pot处理）
- GIVEN 当前不是用户行动，WHEN BOT需要做决策，THEN BOT在合理时间内（<1秒）完成决策并显示操作

### F-002 seat-selection (P0)
用户可在牌局开始前选择座位位置（UTG/MP/CO/BTN/SB/BB），体验不同位置的GTO策略差异。

**Acceptance Criteria:**
- GIVEN 用户在牌局开始前的座位选择界面，WHEN 用户点击任意一个座位位置，THEN 该座位被选中并高亮显示，其余座位分配给BOT
- GIVEN 用户已选择座位，WHEN 牌局开始，THEN 用户固定在所选位置，庄位按正常规则轮转
- GIVEN 用户希望更换位置，WHEN 用户返回座位选择界面，THEN 可以重新选择不同位置开始新的牌局session

### F-003 game-table-ui (P0)
牌局进行中的实时界面，直观展示牌面、筹码、下注、玩家状态等所有牌局信息。

**Acceptance Criteria:**
- GIVEN 牌局进行中，WHEN 任意时刻，THEN 界面显示：公共牌区域、每位玩家的筹码数量、当前底池大小、每位玩家本轮下注额、当前行动玩家标识
- GIVEN 轮到用户行动，WHEN 界面呈现操作选项，THEN 显示可用操作按钮（fold/check/call/bet/raise）及对应金额，不可用操作置灰
- GIVEN 用户需要选择raise金额，WHEN 用户操作raise控件，THEN 提供滑块或预设金额选项（如 2x/3x/pot），金额不低于最小加注额
- GIVEN 一手牌进入showdown，WHEN 牌面翻开，THEN 显示所有未fold玩家的底牌，标注获胜者和获胜牌型

### F-004 gto-bot-strategy (P0)
5个BOT使用简化GTO近似策略进行决策。Preflop基于标准位置范围表（混合频率四舍五入到25%增量），Postflop基于pot odds和board texture的启发式决策。

**Acceptance Criteria:**
- GIVEN BOT在preflop阶段需要决策，WHEN 根据其位置和手牌，THEN BOT按照对应位置的GTO opening/3bet/call范围表做出决策，混合频率以25%为最小增量
- GIVEN BOT在postflop阶段需要决策，WHEN 根据牌面、底池赔率和牌面结构，THEN BOT基于启发式规则做出合理决策（bet/check/call/fold/raise）
- GIVEN BOT做出决策，WHEN 决策完成，THEN 决策过程对用户不可见（黑盒执行），但决策数据被记录用于复盘

### F-005 hand-history-recording (P0)
自动记录每手牌的完整历史，包括每个决策点的game state和玩家操作，持久化存储到localStorage。

**Acceptance Criteria:**
- GIVEN 一手牌进行中，WHEN 任意玩家做出操作，THEN 系统记录该决策点的完整状态（公共牌、各玩家筹码、底池、操作类型和金额）
- GIVEN 一手牌结束，WHEN 结果判定完成，THEN 完整手牌历史自动保存到localStorage，包含时间戳和session标识
- GIVEN localStorage中已有历史记录，WHEN 用户重新打开应用，THEN 历史记录仍然可用
- GIVEN localStorage接近存储上限，WHEN 新手牌需要保存，THEN 系统提示用户存储空间不足并建议清理旧记录

### F-006 hand-review-replay (P0)
赛后逐手回放复盘，在每个决策点对比用户操作与GTO推荐操作，标注偏离/正确，显示推荐操作和简短文字解释。

**Acceptance Criteria:**
- GIVEN 用户进入复盘界面选择一手牌，WHEN 复盘开始，THEN 界面按时间顺序逐步重现该手牌的每个阶段（preflop→flop→turn→river）
- GIVEN 复盘回放到用户的一个决策点，WHEN 界面展示该决策点，THEN 同时显示：用户的实际操作、GTO推荐的最优操作、偏离/正确标注（视觉区分，如红色/绿色）
- GIVEN 用户操作与GTO推荐不同（偏离），WHEN 偏离标注显示，THEN 附带一段简短文字解释为什么GTO推荐该操作（如"在CO位置，A5s属于标准开局范围，fold是过紧的偏离"）
- GIVEN 用户操作与GTO推荐一致（正确），WHEN 正确标注显示，THEN 附带简短肯定说明（如"正确，BTN位置3bet AKo是标准打法"）
- GIVEN 复盘界面中，WHEN 用户点击前进/后退按钮，THEN 可以在决策点之间自由跳转

### F-007 hand-history-list (P1)
手牌历史列表界面，用户可浏览、筛选和选择历史手牌进入复盘。

**Acceptance Criteria:**
- GIVEN 用户进入手牌历史界面，WHEN 界面加载，THEN 显示所有已保存手牌的列表，按时间倒序排列，每条显示：日期时间、用户位置、结果（赢/输/金额）、手牌概要
- GIVEN 手牌列表中有多条记录，WHEN 用户点击某条手牌，THEN 进入该手牌的复盘回放界面（F-006）
- GIVEN 用户希望清理历史，WHEN 用户执行清理操作，THEN 可以删除选中的手牌记录或清空全部历史

### F-008 session-stats-summary (P1)
牌局session的统计摘要，展示本次session的对战表现概览。

**Acceptance Criteria:**
- GIVEN 用户完成一个牌局session（至少1手牌），WHEN 用户查看统计摘要，THEN 显示：总手牌数、盈亏总额、GTO偏离次数、GTO符合率（正确决策数/总决策数）
- GIVEN 统计摘要界面，WHEN 用户查看各位置的表现，THEN 按位置分组显示偏离率（如UTG偏离率20%、BTN偏离率5%）

### F-009 gto-accuracy-label (P1)
在应用中明确标注GTO策略的近似性质，管理用户预期。

**Acceptance Criteria:**
- GIVEN 用户首次进入应用或进入复盘界面，WHEN 界面加载，THEN 显示可见的说明文字表明"本应用使用简化GTO近似策略，适用于学习目的，非精确solver结果"
- GIVEN 复盘中显示GTO推荐操作，WHEN 推荐操作展示，THEN 标注"近似GTO"而非"精确GTO"

### F-010 app-navigation (P0)
应用的整体导航结构，用户可在牌局对战、手牌历史、座位选择等功能间切换。

**Acceptance Criteria:**
- GIVEN 用户在应用任意页面，WHEN 查看导航栏，THEN 可见且可点击的导航项包含：开始牌局、手牌历史、（当前牌局如有进行中）
- GIVEN 用户正在牌局中，WHEN 用户尝试离开牌局页面，THEN 系统提示"当前牌局进行中，离开将结束本局"并需用户确认

### F-011 storage-management (P2)
手牌历史的存储空间管理功能，包括存储使用量展示和数据导出。

**Acceptance Criteria:**
- GIVEN 用户在设置或历史界面，WHEN 查看存储状态，THEN 显示当前已用存储空间和大致剩余可存手牌数量
- GIVEN 用户希望备份数据，WHEN 用户点击导出按钮，THEN 手牌历史以JSON文件形式下载到本地

## Constraints
- 纯前端应用，所有逻辑在浏览器端运行，数据存储使用localStorage，无需后端服务器
- GTO策略使用简化近似算法：preflop基于公开标准范围表（混合频率四舍五入到25%增量），postflop基于pot odds和board texture的启发式决策树；明确标注为"近似GTO"
- 面向初学者，所有界面文案和复盘解释需使用简洁易懂的语言，避免专业术语堆砌
- 产品名称固定为"GTO Idiot"
- 零门槛使用：无需注册、无需付费、无使用次数限制
- localStorage 5MB限制约可存储2500-5000手牌历史，需在接近上限时提示用户
- MVP raise cap限制为3-bet cap以简化游戏引擎复杂度
- Side pot处理在MVP中可简化

## Out of Scope
- 多桌支持（仅单桌6-max）
- 锦标赛/SNG模式（仅现金桌）
- 详细EV计算图表和数学分析
- 社交功能（聊天、好友、排行榜）
- 移动端专门适配（仅桌面浏览器优先）
- 高级GTO solver精确计算（仅使用简化近似）
- 用户账号系统和登录注册
- 云端数据同步和跨设备数据迁移
- 多语言国际化（MVP仅中文）
- 不同盲注级别或筹码深度的选择（固定100BB）
- 不同人数桌型（仅6-max）
- 实时提示/教练模式（仅赛后复盘）
- 自定义BOT策略难度
