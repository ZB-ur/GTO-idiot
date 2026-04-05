## Goal
GTO Idiot 是一个纯浏览器端的德州扑克GTO策略练习器，让初学者通过六人桌现金局对战、手牌记录和赛后逐手复盘，直观理解自己决策与GTO最优策略的偏差，零成本、零安装地掌握GTO基础。

## Target Users
- **Primary persona**: 德州扑克初学者，刚接触GTO概念，了解基本规则但不熟悉位置策略和范围平衡。使用桌面或平板浏览器，需要清晰的术语解释和渐进式引导。
- **Secondary persona**: 有一定经验的休闲玩家，想系统化校准自己的决策与GTO策略的偏差，用于自我检测。

## Features

### F-001 poker-table-game (P0)
六人桌现金局对战：用户选择座位，设定买入筹码，与5个GTO BOT进行完整牌局对战。固定盲注，标准100BB买入。

**Acceptance Criteria:**
- GIVEN 用户进入游戏界面, WHEN 用户选择一个空座位并确认买入金额, THEN 用户入座该位置，其余5个座位由BOT占据，牌局开始
- GIVEN 牌局进行中, WHEN 庄家按钮移动到新位置, THEN 各玩家位置标签（UTG/MP/CO/BTN/SB/BB）正确更新
- GIVEN 用户坐下后, WHEN 新一手牌开始, THEN 盲注自动扣除，每位玩家发两张底牌（用户可见自己的牌，BOT牌面朝下）
- GIVEN 一手牌结束（摊牌或所有对手弃牌）, WHEN 底池分配完成, THEN 显示赢家和赢得的筹码数，自动开始下一手牌
- GIVEN 用户筹码归零, WHEN 手牌结束, THEN 提示用户重新买入或结束本次session

### F-002 player-action-ui (P0)
每个决策点（Preflop/Flop/Turn/River）用户通过清晰的UI选择 Fold/Check/Call/Raise，并显示当前底池、自己筹码、需要跟注的金额等关键信息。

**Acceptance Criteria:**
- GIVEN 轮到用户行动, WHEN 决策面板出现, THEN 仅显示当前合法动作按钮（如有人加注时不显示Check，显示Call/Raise/Fold）
- GIVEN 用户选择Raise, WHEN 加注滑块出现, THEN 显示最小加注额和最大加注额（All-in），用户可通过滑块或输入框指定加注金额
- GIVEN 用户做出决策, WHEN 点击动作按钮, THEN 动作立即生效，游戏推进到下一个行动者或下一条街
- GIVEN 任意决策点, WHEN 决策面板可见, THEN 同时显示当前底池大小、用户剩余筹码、需要跟注的金额（如适用）

### F-003 bot-gto-decision (P0)
5个BOT根据内置GTO策略表自动做出决策，Preflop使用完整范围表，Postflop使用常见spot策略表，决策包含混合策略随机化。

**Acceptance Criteria:**
- GIVEN 轮到某BOT行动（Preflop阶段）, WHEN BOT查询GTO策略表, THEN BOT根据其位置和手牌在范围表中的策略频率（如 Raise 60%/Call 30%/Fold 10%）随机选择一个动作
- GIVEN 轮到某BOT行动（Postflop阶段且命中常见spot）, WHEN BOT查询Postflop策略表, THEN BOT按对应频率随机选择动作
- GIVEN 轮到某BOT行动（Postflop阶段且未命中策略表）, WHEN 策略表无对应spot, THEN BOT使用简化fallback规则做出合理决策
- GIVEN BOT做出决策, WHEN 动作执行, THEN 决策过程中的GTO查表结果（频率分布）被记录到手牌历史中以供复盘使用

### F-004 gto-strategy-data (P0)
内置预计算GTO策略数据：Preflop完整范围表（169种起手牌 × 6个位置 × 常见场景）和Postflop常见spot策略表。

**Acceptance Criteria:**
- GIVEN 应用加载, WHEN GTO策略数据初始化, THEN Preflop范围表覆盖所有169种起手牌在6个位置（UTG/MP/CO/BTN/SB/BB）的开局（open raise）策略频率
- GIVEN Preflop范围表, WHEN 查询某位置某手牌, THEN 返回各动作（Fold/Call/Raise）的频率分布，频率之和为100%
- GIVEN Postflop策略表, WHEN 查询某个常见spot, THEN 返回对应的动作频率分布
- GIVEN 策略数据文件, WHEN 首次加载页面, THEN 策略数据总大小不超过2MB（压缩后），不阻塞首屏渲染

### F-005 hand-history-storage (P0)
自动保存每手牌的完整历史到浏览器本地（IndexedDB），包括动作序列、公共牌、底池变化、各玩家手牌（摊牌时）、最终结果。

**Acceptance Criteria:**
- GIVEN 一手牌结束, WHEN 结果确定, THEN 自动将完整手牌记录写入IndexedDB，无需用户手动操作
- GIVEN 手牌记录, WHEN 存储完成, THEN 记录包含：手牌ID、时间戳、盲注级别、各玩家位置和起手牌（摊牌时可见的）、每条街的公共牌、每个动作（玩家/动作类型/金额/时间点）、最终底池和赢家
- GIVEN 用户关闭浏览器后重新打开, WHEN 进入手牌历史页面, THEN 之前所有手牌记录仍然存在
- GIVEN 存储空间不足, WHEN IndexedDB写入失败, THEN 向用户显示警告提示并建议清理旧记录

### F-006 hand-history-list (P0)
手牌列表浏览界面：按时间倒序显示已记录的所有手牌，每条显示关键摘要信息（时间、位置、起手牌、结果盈亏）。

**Acceptance Criteria:**
- GIVEN 用户进入手牌历史页面, WHEN 页面加载, THEN 显示按时间倒序排列的手牌列表，每条摘要包含：时间、用户位置、起手牌、最终盈亏（+/-筹码数）
- GIVEN 手牌列表, WHEN 用户点击某手牌, THEN 进入该手牌的详细复盘页面
- GIVEN 手牌列表较长（>50条）, WHEN 用户向下滚动, THEN 列表支持分页加载或虚拟滚动，不卡顿
- GIVEN 手牌列表页, WHEN 用户希望按位置筛选, THEN 可选择按位置（UTG/MP/CO/BTN/SB/BB）筛选手牌记录

### F-007 hand-replay (P0)
单手牌逐动作回放：从手牌记录中选择一手牌，按街和动作顺序逐步重建牌局状态，用户可前进/后退浏览每个动作点。

**Acceptance Criteria:**
- GIVEN 用户进入某手牌复盘页面, WHEN 页面加载, THEN 显示该手牌的初始状态（座位、筹码、盲注已扣除）
- GIVEN 复盘播放中, WHEN 用户点击"下一步", THEN 牌桌状态推进到下一个动作点（显示该动作：谁做了什么、底池变化）
- GIVEN 复盘播放中, WHEN 用户点击"上一步", THEN 牌桌状态回退到前一个动作点
- GIVEN 复盘播放至某条街的发牌点, WHEN 公共牌翻出, THEN 牌桌上显示对应的公共牌（Flop三张/Turn一张/River一张）
- GIVEN 复盘播放到摊牌, WHEN 最终结果展示, THEN 显示所有未弃牌玩家的手牌和最终牌型

### F-008 gto-deviation-analysis (P0)
在复盘回放中，每个用户决策点标注GTO最优策略及偏差程度：显示GTO建议的动作频率分布、用户实际选择、偏差评级。

**Acceptance Criteria:**
- GIVEN 复盘回放到用户的某个决策点, WHEN 该决策点高亮显示, THEN 同时展示用户的实际动作和GTO策略的频率分布（如：GTO建议 Raise 65% / Call 25% / Fold 10%，你选择了 Call）
- GIVEN GTO偏差标注, WHEN 用户选择了GTO低频动作（<20%频率）, THEN 标注为"显著偏差"（如红色标记）
- GIVEN GTO偏差标注, WHEN 用户选择了GTO高频动作（>40%频率）, THEN 标注为"符合GTO"（如绿色标记）
- GIVEN 某决策点的GTO策略表中无匹配spot（Postflop）, WHEN 无法提供精确GTO对比, THEN 显示"此spot暂无GTO数据"提示，不显示错误的偏差分析

### F-009 gto-explanation (P1)
在复盘中用自然语言解释GTO策略的原因：为什么GTO建议某个动作，展示范围表可视化和简要EV概念解释，面向初学者友好。

**Acceptance Criteria:**
- GIVEN 复盘中用户查看某Preflop决策点的GTO分析, WHEN 点击"为什么"按钮, THEN 展示该位置的范围表热力图（169种起手牌的动作分布），高亮用户当前手牌的位置
- GIVEN 复盘中展示GTO解释, WHEN 解释文本出现, THEN 使用初学者友好的自然语言（如"在CO位置，A5s是一手边缘手牌，GTO建议以60%的频率加注来保持范围平衡"），避免未解释的专业术语
- GIVEN 复盘中展示GTO解释, WHEN 涉及混合策略, THEN 解释为什么不是100%做某个动作（如"如果总是加注这手牌，对手可以利用你的范围过于偏向强牌"）

### F-010 poker-table-ui (P0)
牌桌视觉界面：椭圆牌桌、6个座位、卡牌渲染、筹码显示、公共牌区域、底池显示，清晰标注每个玩家的位置标签（UTG/MP/CO/BTN/SB/BB）。

**Acceptance Criteria:**
- GIVEN 游戏界面加载, WHEN 牌桌渲染完成, THEN 显示椭圆形牌桌，6个座位均匀分布，每个座位显示玩家名称、筹码数、位置标签
- GIVEN 牌局进行中, WHEN 用户拥有两张底牌, THEN 用户底牌以正面朝上的卡牌图形显示，BOT底牌以背面显示
- GIVEN 牌局进行中, WHEN 某玩家执行动作, THEN 该玩家座位旁短暂显示动作标签（如"Raise to 6BB"）
- GIVEN 任意游戏状态, WHEN 牌桌可见, THEN 底池金额在牌桌中央清晰显示，公共牌在底池上方横排展示

### F-011 session-management (P1)
游戏session管理：用户可以开始新session（设定盲注和买入）、暂停/继续、结束session并查看本session汇总（总手数、盈亏）。

**Acceptance Criteria:**
- GIVEN 用户在主页, WHEN 点击"开始新游戏", THEN 显示设置面板，用户可选择盲注级别（预设选项如1/2, 2/5, 5/10）和买入金额（默认100BB）
- GIVEN 游戏进行中, WHEN 用户点击"结束session", THEN 显示session汇总：总手数、净盈亏、游玩时长
- GIVEN 用户正在游戏中, WHEN 用户关闭浏览器, THEN 下次打开应用时提示"是否继续上次session"或"开始新session"

### F-012 beginner-glossary (P1)
术语解释系统：游戏和复盘界面中的扑克术语（位置名、动作名、GTO概念）提供悬停/点击tooltip解释，面向初学者。

**Acceptance Criteria:**
- GIVEN 游戏或复盘界面中出现扑克术语（如UTG、3-bet、C-bet、EV等）, WHEN 用户悬停或点击术语, THEN 显示tooltip弹出框，包含该术语的简明中文解释
- GIVEN 术语tooltip, WHEN 弹出显示, THEN 解释文本不超过2句话，使用初学者能理解的语言
- GIVEN 用户是回访用户, WHEN 打开应用, THEN 术语tooltip默认开启，可在设置中关闭

### F-013 bot-decision-transparency (P1)
复盘中BOT决策透明化：展示BOT在每个决策点的GTO查表结果和实际随机到的动作，帮助用户理解混合策略的执行方式。

**Acceptance Criteria:**
- GIVEN 复盘回放到某BOT的决策点, WHEN 用户点击该BOT的动作, THEN 展示该BOT的GTO策略频率分布和实际执行的动作（如"GTO策略：Raise 60%/Call 40%，本次随机结果：Call"）
- GIVEN BOT决策透明展示, WHEN 显示频率分布, THEN 使用可视化图表（如条形图或饼图）而非纯文字

### F-014 position-filter (P2)
手牌历史支持多维度筛选：除按位置筛选外，支持按盈亏（赢/输）、按起手牌类型（口袋对、同花连张等）筛选。

**Acceptance Criteria:**
- GIVEN 手牌历史页面, WHEN 用户选择筛选条件, THEN 可组合筛选：位置 + 盈亏方向 + 起手牌类型
- GIVEN 筛选结果, WHEN 筛选完成, THEN 显示符合条件的手牌数量和列表

### F-015 hand-export (P2)
手牌记录导出：用户可将手牌历史导出为通用格式（如文本格式的手牌历史），便于分享或用其他工具分析。

**Acceptance Criteria:**
- GIVEN 手牌历史页面, WHEN 用户点击"导出", THEN 可选择导出全部或当前筛选结果
- GIVEN 导出操作, WHEN 用户确认导出, THEN 生成可下载的文本文件，格式为标准扑克手牌历史格式

## Constraints

- **纯浏览器端应用**：无后端服务，所有逻辑（牌局引擎、BOT决策、GTO查表、数据存储）在前端完成
- **数据持久化**：使用IndexedDB存储手牌记录，需处理存储容量检测和Safari Private Browsing限制
- **GTO策略精度**：使用预计算策略表（非实时solver），Preflop为近似GTO共识数据，Postflop仅覆盖常见spot，需标注为"近似GTO"
- **策略数据大小**：GTO策略JSON总大小不超过2MB（压缩后），Postflop策略按需加载避免阻塞首屏
- **面向初学者**：UI极度简化，术语提供解释，信息渐进式展示，避免一次性信息过载
- **语言**：界面主语言为中文
- **六人桌限定**：仅支持6-max现金局，不支持其他桌型
- **固定盲注**：现金局固定盲注，不支持盲注递增（锦标赛模式）

## Out of Scope

- **多桌同时游戏**：MVP仅支持单桌
- **锦标赛/SNG模式**：仅支持现金局
- **自定义BOT难度/风格**：BOT统一使用GTO策略，不支持调整为exploitative风格
- **在线多人对战**：纯单机，不支持玩家间联网对战
- **高级统计分析（HUD）**：不提供VPIP/PFR/3-bet%等实时统计面板
- **服务端存储或账号系统**：无云端同步、无登录注册
- **完整GTO solver**：不提供实时GTO解算，仅使用预计算策略表
- **移动端优化**：MVP优先桌面浏览器体验，移动端不做专门适配
- **多语言支持**：MVP仅支持中文界面
- **手牌导入**：不支持从其他平台导入手牌历史
