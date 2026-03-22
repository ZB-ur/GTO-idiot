## Goal
构建一款名为 GTO Idiot 的免费纯浏览器端德州扑克 GTO 策略练习器，让玩家通过与 5 个 GTO BOT 进行 6 人桌对战、赛后复盘对比 GTO 最优决策，系统性提升策略水平。

## Features

- F-001 game-engine: 完整的 6 人桌德州扑克牌局引擎，支持 Preflop → Flop → Turn → River 四条街，包含发牌、下注轮（fold/check/call/bet/raise/all-in）、底池计算、边池处理、摊牌比牌。6 个位置为 UTG / HJ / CO / BTN / SB / BB，固定盲注结构，每位玩家 100BB 起始筹码。
- F-002 gto-lookup-table: 预计算 GTO 策略查找表，分为两部分：(a) Preflop 表——6 个位置 × 169 种起手牌，覆盖 open raise / 3-bet / call / fold 等场景；(b) Postflop 简化表——按翻牌面纹理分类（高/低牌、同花/彩虹、连接/断裂）× 手牌强度分级（坚果/强牌/中等/弱牌/空气）映射到简化动作（check / bet small / bet big / fold）。UI 中明确标注为"简化 GTO 参考"。
- F-003 bot-decision-engine: 5 个 GTO BOT 对手的决策引擎。Preflop 阶段直接查表行动；Postflop 阶段基于手牌强度 + 底池赔率 + 位置 + 翻牌面纹理做简化 GTO 决策。BOT 行为需"合理且一致"，不追求完美纳什均衡但不做明显反 GTO 操作。
- F-004 table-ui: 牌桌主界面，包含：6 人桌布局（玩家位置、筹码显示、庄家按钮）、公共牌展示区、底池显示、玩家手牌展示、操作按钮面板（Fold / Check / Call / Bet / Raise 滑块 / All-in）、当前下注轮指示、倒计时或行动提示。支持响应式布局适配桌面端浏览器。
- F-005 hand-history-record: 对战结果记录系统，自动记录每手牌的完整信息：手牌编号、参与玩家及位置、起手牌、每条街的公共牌和所有玩家行动序列、底池大小、最终结果（胜负及赢取筹码）、每个决策点的用户实际操作。数据持久化到 IndexedDB。
- F-006 session-management: 对战会话管理，支持：开始新会话（新的 100BB 起始）、会话内连续打多手牌、手动结束会话、会话内筹码在手牌间延续、会话列表展示（时间、手数、盈亏）。
- F-007 post-game-review: 赛后复盘功能，支持：(a) 逐手牌回放——按街逐步展示公共牌和每位玩家行动；(b) GTO 对比标注——在用户每个决策点显示"你的操作"vs"GTO 建议操作"，标注偏差程度（如"你 fold 了，GTO 建议 raise 到 2.5BB"）；(c) 偏差分级——将偏差标注为符合 GTO / 轻微偏差 / 严重偏差；(d) 单手牌 EV 损失估算（简化计算）。
- F-008 history-stats: 历史对战统计面板，展示：总手数、总盈亏、GTO 符合度百分比（按 session 和总计）、GTO 符合度变化趋势折线图、按位置的 GTO 符合度分布、最常见偏差类型排行（如"Preflop 过多 fold"）、按街（Preflop/Flop/Turn/River）的符合度拆分。

## Constraints

- 纯浏览器端运行（纯静态站点），无后端服务器，所有游戏逻辑、GTO 计算和数据存储在客户端完成
- 技术栈限定 React + TypeScript + Tailwind CSS
- 数据持久化使用 IndexedDB（手牌历史、会话数据、统计数据）
- GTO 策略使用预计算查找表实现（JSON 格式），非实时求解器，Preflop 表小于 500KB，Postflop 简化表小于 1MB
- 仅支持 6 人桌（6-max），固定盲注，100BB 起始筹码
- Postflop GTO 策略为简化版本，UI 中需明确标注为简化 GTO 参考而非精确 GTO 解
- 可使用成熟开源扑克库（如 pokersolver、phe）加速手牌评估开发
- 部署为纯静态站点（适合 GitHub Pages / Vercel / Netlify）

## Out of Scope

- 多桌（Multi-table）、单挑（Heads-up）或其他桌型（9-max 等）
- 盲注递增 / 锦标赛模式（MTT / SNG）/ ICM 计算
- 完整纳什均衡实时求解器
- 高级统计分析（HUD 风格的实时数据叠加）
- 多人在线对战 / 联网功能
- 自定义 BOT 难度或非 GTO 策略 BOT
- 手牌导入/导出（PokerStars 手牌格式等）
- 移动端专属适配
- 用户账号系统 / 云端数据同步
- 付费功能 / 变现系统
- 语音 / 聊天功能
- 自定义盲注结构或起始筹码