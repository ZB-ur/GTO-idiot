## Goal
GTO Idiot 是一款免费的浏览器端德州扑克 GTO 策略练习器，让初学者通过与 BOT 对战六人桌并在赛后即时对比 GTO 推荐操作，在实战中零成本学习最优策略。

## Target Users
- **Primary persona**: 德州扑克初学者，已掌握基本规则但尚未系统学习 GTO 策略，希望通过实战练习提升水平。使用桌面浏览器访问，无需安装，技术水平一般。
- **Secondary persona**: 有一定经验的休闲玩家，希望检验自己的决策是否符合 GTO，用于自我纠错和复习。

## Features

### F-001 game-table-setup (P0)
创建并加入六人桌现金桌，设定盲注和买入筹码，1 名玩家 vs 5 个 AI BOT。

**Acceptance Criteria:**
- GIVEN 用户在主界面，WHEN 用户点击"开始牌局"，THEN 显示六人桌设置界面，包含盲注选择和买入筹码输入
- GIVEN 用户在设置界面，WHEN 用户选择盲注（如 1/2、2/5、5/10）并输入买入筹码（范围为 20-100 BB），THEN 创建六人桌，用户和 5 个 BOT 各就各位
- GIVEN 牌桌已创建，WHEN 牌局开始，THEN 6 个座位按 UTG/UTG+1/MP/CO/BTN/SB/BB 标注位置，庄家按钮（Button）位置清晰可见
- GIVEN 用户在牌桌中，WHEN 用户点击"离开牌桌"，THEN 当前筹码和对局记录自动保存，用户返回主界面

### F-002 poker-engine (P0)
完整的德州扑克游戏引擎，支持 Preflop → Flop → Turn → River 全流程，包括发牌、下注轮、底池计算、胜负判定。

**Acceptance Criteria:**
- GIVEN 一局开始，WHEN 发牌阶段，THEN 每位玩家收到 2 张底牌，公共牌按 Flop（3 张）、Turn（1 张）、River（1 张）依次翻出
- GIVEN 当前为某位玩家的行动回合，WHEN 轮到该玩家操作，THEN 根据当前情况显示合法操作选项（Fold/Check/Call/Bet/Raise/All-in）
- GIVEN 玩家选择 Raise，WHEN 输入加注金额，THEN 系统验证金额合法性（不低于最小加注、不超过玩家筹码）
- GIVEN 所有活跃玩家在当前下注轮完成操作，WHEN 下注轮结束，THEN 正确计算底池金额并进入下一阶段
- GIVEN 有玩家 All-in 且其他玩家筹码不同，WHEN 产生 side pot，THEN 正确计算主池和边池（MVP 支持最多 1 个边池）
- GIVEN 到达 Showdown，WHEN 比较所有未弃牌玩家的手牌，THEN 正确判定最佳 5 张牌组合并确定赢家
- GIVEN 两名或以上玩家手牌相同强度，WHEN Showdown 判定，THEN 正确执行平分底池（Split Pot）
- GIVEN 所有其他玩家均已 Fold，WHEN 仅剩一名玩家，THEN 该玩家直接赢得底池，无需 Showdown

### F-003 bot-ai (P0)
5 个 AI BOT 基于 GTO 策略进行决策，作为用户的对手。

**Acceptance Criteria:**
- GIVEN BOT 在 Preflop 阶段，WHEN 轮到 BOT 操作，THEN BOT 根据其位置和起手牌查询 GTO range 表做出决策（Open/3-Bet/Call/Fold）
- GIVEN BOT 在 Postflop 阶段，WHEN 轮到 BOT 操作，THEN BOT 根据简化的规则策略（基于牌面类型、位置、SPR）做出决策
- GIVEN BOT 做出决策，WHEN 执行操作，THEN 操作在合理的短暂延迟后执行（模拟思考时间），而非瞬间响应
- GIVEN BOT 使用 GTO range 决策，WHEN 实际执行操作，THEN 在 GTO 基础频率上加入可控随机偏差，使初学者有约 40-50% 的合理胜率 [NEEDS CLARIFICATION: 具体胜率平衡需要 playtesting 验证]

### F-004 gto-preflop-data (P0)
内置完整的 6-max Preflop GTO range 数据，覆盖所有位置和常见场景。

**Acceptance Criteria:**
- GIVEN GTO 数据模块，WHEN 应用加载，THEN 包含 169 种起手牌 × 6 个位置的 GTO action 频率数据（Open/3-Bet/Call/Fold）
- GIVEN 某个 Preflop 决策点，WHEN 查询 GTO 推荐，THEN 返回该位置、该手牌在面对特定行动（如面对 open raise、面对 3-bet）时的推荐操作
- GIVEN GTO 数据，WHEN 首次加载页面，THEN 数据从内嵌静态文件加载，无需网络请求，总体积不超过 500KB

### F-005 postflop-simplified-gto (P1)
Postflop 阶段基于规则的简化 GTO 建议，为用户提供方向性参考。

**Acceptance Criteria:**
- GIVEN Postflop 决策点，WHEN 查询简化 GTO 建议，THEN 根据牌面纹理（干燥/湿润）、玩家位置（IP/OOP）、SPR 范围返回方向性建议（如"建议 Bet"或"建议 Check"）
- GIVEN 简化 GTO 建议显示，WHEN 用户查看建议，THEN 明确标注为"简化 GTO 参考"而非"精确 GTO 解"
- GIVEN 典型 Postflop 场景（如 IP c-bet、OOP check-raise），WHEN 提供建议，THEN 建议附带一句简短解释（如"干燥牌面 IP 位置倾向于 c-bet"）

### F-006 hand-review (P0)
每手牌结束后自动展示 GTO 复盘，对比用户每个决策点的操作与 GTO 推荐操作。

**Acceptance Criteria:**
- GIVEN 一手牌结束（Showdown 或所有对手 Fold），WHEN 结果结算完毕，THEN 自动弹出决策对比卡片
- GIVEN 决策对比卡片，WHEN 用户查看，THEN 显示该手牌中用户的每个决策点：位置、手牌、用户实际操作、GTO 推荐操作
- GIVEN Preflop 决策点，WHEN 对比显示，THEN GTO 推荐操作基于内置 Preflop range 数据，标注为"GTO 推荐"
- GIVEN Postflop 决策点，WHEN 对比显示，THEN GTO 建议基于简化规则策略，标注为"简化 GTO 参考"
- GIVEN 用户操作与 GTO 推荐一致，WHEN 显示对比，THEN 该决策点标记为"符合 GTO"（绿色）
- GIVEN 用户操作与 GTO 推荐不一致，WHEN 显示对比，THEN 该决策点标记为"偏离 GTO"（黄色/红色），并显示 GTO 推荐的操作
- GIVEN 决策对比卡片，WHEN 用户点击"继续"或"下一手"，THEN 关闭卡片，开始下一手牌

### F-007 hand-history (P0)
记录所有对战历史，支持查看历史手牌和基础统计。

**Acceptance Criteria:**
- GIVEN 每手牌结束，WHEN 结果确定，THEN 自动保存完整手牌记录（底牌、公共牌、每个决策点的操作、底池大小、最终结果）到浏览器 localStorage
- GIVEN 用户在主界面，WHEN 点击"历史记录"，THEN 显示历史手牌列表，按时间倒序排列，每条显示日期、手牌、结果（赢/输/平）、盈亏筹码
- GIVEN 用户在历史列表中，WHEN 点击某手牌记录，THEN 展开显示该手牌的完整 GTO 对比复盘（同 F-006 的对比视图）

### F-008 session-stats (P0)
基础对战统计，包括胜负统计和筹码变化趋势。

**Acceptance Criteria:**
- GIVEN 用户有对战记录，WHEN 查看统计页面，THEN 显示总手数、胜率、总盈亏筹码
- GIVEN 用户有对战记录，WHEN 查看统计页面，THEN 显示筹码变化趋势图（X 轴为手数，Y 轴为累计盈亏）
- GIVEN 用户有对战记录，WHEN 查看统计页面，THEN 显示各位置的胜率统计（UTG/UTG+1/MP/CO/BTN/SB/BB）
- GIVEN 用户有对战记录，WHEN 查看统计页面，THEN 显示 GTO 符合率（用户操作与 GTO 推荐一致的比例）

### F-009 data-persistence (P0)
浏览器端数据持久化，筹码和历史记录自动保存，支持自动清理。

**Acceptance Criteria:**
- GIVEN 用户进行牌局，WHEN 任何数据变化（筹码、手牌记录），THEN 自动保存到浏览器 localStorage
- GIVEN 用户关闭浏览器后重新打开，WHEN 访问应用，THEN 筹码余额和历史记录完整恢复
- GIVEN localStorage 存储接近容量限制（如超过 4MB），WHEN 保存新记录，THEN 自动清理最早的手牌详情记录，保留统计摘要
- GIVEN 浏览器处于隐私模式或 localStorage 不可用，WHEN 应用启动，THEN 显示友好提示告知数据无法持久保存，但仍可正常游戏

### F-010 table-ui (P0)
六人桌牌桌界面，清晰展示所有游戏信息。

**Acceptance Criteria:**
- GIVEN 牌局进行中，WHEN 用户查看牌桌，THEN 显示经典椭圆桌布局，6 个座位环绕，每个座位显示玩家名称、筹码数、位置标识
- GIVEN 牌局进行中，WHEN 用户查看牌桌，THEN 中央区域显示公共牌和当前底池金额
- GIVEN 轮到用户操作，WHEN 显示操作选项，THEN 在用户座位附近显示清晰的操作按钮（Fold/Check/Call/Raise/All-in），Raise 时提供金额输入
- GIVEN 轮到 BOT 操作，WHEN BOT 做出决策，THEN 在对应座位显示 BOT 的操作（如"Raise to 15"），并有简短动画反馈
- GIVEN 用户的底牌，WHEN 牌局进行中，THEN 用户的 2 张底牌以扑克牌图形清晰展示，其他玩家底牌显示为牌背
- GIVEN Showdown 阶段，WHEN 翻牌比较，THEN 所有参与 Showdown 的玩家底牌翻开展示

### F-011 newbie-guide (P1)
新手引导，帮助初学者理解界面和基本 GTO 概念。

**Acceptance Criteria:**
- GIVEN 用户首次访问应用，WHEN 应用加载完成，THEN 显示简短的新手引导（3-5 步），介绍牌桌界面、操作方式、GTO 复盘功能
- GIVEN 新手引导中，WHEN 介绍 GTO 概念，THEN 使用"推荐操作"等通俗用语替代"GTO 最优解"等专业术语
- GIVEN 用户已完成引导，WHEN 再次访问，THEN 不再自动显示引导，但可从设置中重新触发

### F-012 position-education (P2)
在 GTO 复盘中突出位置信息，帮助用户理解位置对策略的影响。

**Acceptance Criteria:**
- GIVEN GTO 复盘视图，WHEN 显示决策对比，THEN 每个决策点显著标注当前位置（如"BTN - 按钮位"）
- GIVEN 用户在某位置做出偏离 GTO 的操作，WHEN 显示对比，THEN 附带位置相关的简短提示（如"UTG 是最早行动的位置，通常需要更紧的 range"）

## Constraints
- 纯浏览器端运行，React + TypeScript + Tailwind CSS，无后端服务器
- GTO 数据为内置预计算静态数据，不依赖外部 API 或实时求解器
- Preflop GTO range 数据内嵌到前端 bundle，总体积不超过 500KB
- Postflop GTO 仅提供基于规则的简化建议，不提供精确频率/EV 计算
- 数据持久化使用 localStorage（5-10MB 限制），需实现自动清理策略
- Side pot 逻辑 MVP 阶段支持最多 1 个边池
- 优先桌面端浏览器体验，移动端适配为 nice-to-have
- 所有现代浏览器支持（Chrome/Firefox/Safari/Edge）

## Out of Scope
- 锦标赛（MTT）/ Sit & Go（SNG）模式
- 多人在线对战（仅单机 vs BOT）
- 高级 GTO 分析功能（精确 EV 计算、频率分布图、range 可视化矩阵）
- 服务器端存储、用户账号系统、跨设备数据同步
- 自定义 BOT 难度/风格调节
- 手牌导入/导出（HH 格式）
- 移动端优先适配
- 多语言国际化（MVP 仅中文）
- 实时求解器集成
- 社交功能（排行榜、好友对战）