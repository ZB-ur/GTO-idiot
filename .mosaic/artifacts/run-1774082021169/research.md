## Market Overview

德州扑克 GTO 训练工具市场在 2024-2026 年持续增长，主要驱动力包括：在线扑克玩家群体扩大、GTO 策略从高端职业圈向大众普及、以及 AI/云计算降低了 solver 使用门槛。

**市场现状：**
- 头部产品（GTO Wizard）已积累超过 1000 万预计算解法，订阅制定价 $26-$206/月
- 市场以"查表型训练器"为主（用户查询特定 spot 的 GTO 策略），缺乏"实战对抗 + 即时反馈"的沉浸式练习模式
- 大部分工具需要付费订阅，免费方案功能极为有限
- 纯浏览器端运行的免费 GTO 练习工具几乎为空白——现有浏览器端方案（如 WASM Postflop）偏向 solver 工具，非游戏化练习

**GTO Idiot 的机会窗口：**
1. **差异化定位**：市场上没有"免费 + 纯前端 + 6 人桌 BOT 实战 + 逐手 GTO 复盘"的一站式产品
2. **降低门槛**：现有工具学习曲线陡峭（需理解 range/node tree），GTO Idiot 以"打牌 → 复盘"的自然流程降低认知负担
3. **零成本部署**：纯前端架构意味着无服务器成本，可作为免费开源项目快速积累用户

## Competitor Analysis

| Competitor | Core Features | Strengths | Weaknesses |
|---|---|---|---|
| **GTO Wizard** ($26-206/mo) | 1000 万+ 预解法库、AI Solver、Hand History 分析、Trainer 模式、移动端 | 解法精度最高；覆盖 Cash/MTT/Spin&Go；社区庞大 | 高价付费墙；无实战对抗体验；查表模式学习曲线陡 |
| **DTO Poker** ($25-50/mo) | GTO Trainer + Explorer、锦标赛专注 | 锦标赛 ICM 覆盖好；UI 直观 | 仅锦标赛场景；无现金桌支持；付费 |
| **GTOBase** ($20-40/mo) | GTO 策略浏览器、多模式训练、HH 分析 | 多种训练模式；支持多种游戏格式 | 非实战练习；依赖预计算库 |
| **Fearless River (WPT)** (免费/付费) | 逐手 GTO 反馈、预解法场景练习 | 品牌背书（WPT）；部分免费内容 | 场景有限；非完整牌局体验 |
| **InstaGTO** ($15-30/mo) | 快速 GTO 策略浏览、多游戏格式 | 响应速度快；覆盖面广 | 纯查表工具；无练习/对抗功能 |
| **GTO LAB** ($50-100/mo) | 职业玩家教练、高级 ICM 训练 | 顶级教练内容；锦标赛深度 | 定价极高；面向高端用户 |
| **WASM Postflop** (免费开源) | 浏览器端 GTO Solver、WebAssembly | 免费开源；浏览器运行；高精度 | 纯 solver 工具；无游戏化体验；需用户自行设置博弈树 |
| **PeakGTO** ($30-60/mo) | 云端 solver、训练平台 | 无需高端硬件；快速求解 | 付费；无实战模式 |

**竞争格局总结：** 所有主流竞品要么是"查表/solver 工具"（查询策略），要么是"场景训练器"（练习特定 spot）。没有任何产品提供"与多风格 BOT 打完整六人桌 → 赛后逐手 GTO 复盘"的完整游戏循环。这是 GTO Idiot 的核心差异化。

## Feasibility

### 技术可行性：**中等偏高**

**前端游戏引擎（高可行性）：**
- 德州扑克规则引擎纯逻辑实现，无性能瓶颈
- 成熟 npm 库可用：`pokersolver`（手牌比较）、`poker-odds-calc`（equity 计算）、`poker-evaluator`（手牌评估）
- React + TypeScript + Tailwind 技术栈完全匹配 SPA 游戏应用

**BOT AI 引擎（中等可行性）：**
- 不同风格 BOT（TAG/LAG/Fish）可通过参数化策略实现：基于位置的 preflop range 表 + 基于 pot odds/equity 的 postflop 决策树
- 不需要实时 GTO solving，BOT 行为基于预定义策略配置文件
- 挑战：BOT 行为的真实感需要仔细调参（下注大小变化、时机随机化等）

**简化 GTO 近似引擎（核心技术挑战，中等可行性）：**
- **Preflop**：可用预计算 range 表（如 6-max 各位置 RFI/3bet/call range），数据量小（< 100KB），前端直接查表
- **Postflop**：完全精确的 GTO 求解需要 CFR 算法迭代（WASM Postflop 方案），对 MVP 过重
- **MVP 推荐方案**：预翻牌使用标准 range 表；翻后使用简化启发式（基于 equity bucket + pot odds + board texture 分类的策略映射表）
- 可后续集成 WASM Postflop（MIT 开源）提升精度

**数据持久化（高可行性）：**
- IndexedDB 可存储数千局完整牌局记录
- 结构化数据（每局 ~2-5KB），本地存储完全够用

**复盘系统（高可行性）：**
- 牌局回放是纯 UI 渲染 + 数据遍历
- EV 对比需要在每个决策点计算 GTO 推荐动作的 EV vs 用户实际动作的 EV
- 可通过 Monte Carlo 模拟（`poker-odds-calc`）近似计算 equity

### 业务可行性：**高**
- 零服务器成本，可托管在 GitHub Pages / Vercel 免费层
- 开源 + 免费策略可快速获取扑克社区关注（Reddit r/poker, 2+2 论坛）
- 变现路径：高级 GTO 解法包（付费解锁更精确的 postflop solver）、去广告、高级统计面板

### 关键技术依赖

| 依赖 | 用途 | 许可证 | 风险 |
|---|---|---|---|
| `pokersolver` | 手牌比较/胜负判定 | MIT | 低 |
| `poker-odds-calc` | Equity 计算 | MIT | 低 |
| WASM Postflop (可选) | 精确 GTO 求解 | AGPL-3.0 | 中（AGPL 传染性，需评估） |
| React + Tailwind | UI 框架 | MIT | 低 |
| IndexedDB (Dexie.js) | 本地数据持久化 | Apache-2.0 | 低 |

## Key Insights

1. **"Play-then-Review"是未被满足的核心需求**：现有工具都是"先学策略再去打牌"，GTO Idiot 反转为"先打牌再学策略"，更符合人类学习的自然循环（体验 → 反馈 → 改进）

2. **简化 GTO 足以满足目标用户**：初学者到中级玩家不需要精确到小数点后三位的 GTO 解法——preflop range 表 + 简化 postflop 启发式已能覆盖 80% 的学习场景。精确 solver 可作为 v2 功能

3. **BOT 风格多样性是留存关键**：5 个不同风格 BOT 不仅提供对抗乐趣，更教会用户"GTO 为什么是最优"——当用户用非 GTO 策略被 TAG BOT exploit 时，复盘中的 EV 差异最有说服力

4. **Preflop 范围表是最高 ROI 功能**：Preflop 决策占所有决策的 ~60%，标准 6-max range 表数据量极小且准确度高，MVP 应优先确保 preflop GTO 对比的完整性和精确性

5. **WASM Postflop 开源项目是技术加速器**：虽然 MVP 不需要完整 solver，但 WASM Postflop 的 Rust→WASM 架构证明浏览器端 GTO 计算完全可行，为未来升级留出清晰路径

6. **复盘 UX 决定产品口碑**：用户最记住的不是打牌过程，而是复盘时"啊原来这里应该 3bet"的顿悟时刻。复盘界面的信息密度和可读性（GTO 动作 vs 实际动作 vs EV 差异的视觉对比）是产品核心体验

7. **免费 + 纯前端是获客利器**：所有主流竞品都有付费墙（$20-200/月），一个高质量的免费替代品在扑克社区（Reddit r/poker 有 80 万+ 成员）有天然传播力

8. **AGPL 许可证需注意**：若未来集成 WASM Postflop，其 AGPL-3.0 许可证要求衍生作品也开源。若计划商业化，需考虑自研简化 solver 或使用其他许可证的替代方案