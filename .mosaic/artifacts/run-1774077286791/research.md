## Market Overview

德州扑克 GTO 策略训练是一个快速增长的细分市场。随着在线扑克的普及和策略研究的深入，越来越多的玩家意识到学习 GTO（博弈论最优）策略的重要性。当前市场以 GTO Wizard、DTO Poker、PioSolver 等付费工具为主导，价格从 $39/月到 $129/月不等，对入门和中级玩家构成较高门槛。

**市场机会：** 目前缺乏一款免费、无需注册、纯浏览器端的 GTO 练习器，能让玩家在与 BOT 对战的实战场景中学习 GTO 策略。现有工具多聚焦于"查表学习"或"手牌分析"，而非"边打边学"的沉浸式体验。GTO Idiot 定位于填补这一空白——零门槛、即开即玩、赛后复盘对比 GTO。

Sources: [PokerNews - Best Poker Tools 2026](https://www.pokernews.com/poker-tools/), [GTO Wizard](https://gtowizard.com/), [DTO Poker](https://www.dtopoker.com/)

## Competitor Analysis

| Competitor | Core Features | Strengths | Weaknesses |
|---|---|---|---|
| **GTO Wizard** ($39-129/月) | GTO Trainer、Hand Analysis、Range Explorer、GTO Wizard AI 实时求解 | 业界最准确的 GTO 解；UI 友好；支持 Cash/MTT/Spin&Go；巨量预计算场景 | 价格高；需订阅；无实战对战模式（仅分析/训练单手牌）；需联网 |
| **DTO Poker** (免费+订阅) | GTO Bot 对战、Explorer、Preflop 范围表、错误反馈 | 有 GTO Bot 对战模式；移动端 App；免费入门内容 | 免费版功能有限；仅覆盖特定场景（非完整牌局）；单手牌训练而非完整牌局 |
| **PioSolver** ($249 一次性) | 专业级 GTO 求解器、自定义博弈树 | 精确求解；行业标杆 | 学习曲线陡峭；桌面端；无对战/练习模式；价格高 |
| **GTOBase** (免费+付费) | GTO Viewer、Trainer、Hand History 分析 | 浏览器可用；多训练模式 | 非实战对战；UI 较传统；社区较小 |
| **WASM Postflop** (免费开源) | 浏览器端 GTO 求解器 | 完全免费开源；浏览器运行；技术先进 | 开发已暂停；仅求解器无训练/对战功能；需要用户手动设置场景 |
| **Deepsolver** (免费试用) | 云端 GTO 求解、多桌训练 | 浏览器端；自定义训练 | 需联网云计算；非完整牌局对战 |
| **GTO LAB** (付费) | 职业选手教学、ICM Trainer | 顶级教练内容；高质量 MTT 训练 | 面向高级玩家；价格高；无自由对战模式 |

**GTO Idiot 差异化定位：**
- ✅ 完全免费、纯前端、零注册
- ✅ 完整 6 人桌牌局对战（非单手牌训练）
- ✅ 赛后逐手复盘 + GTO 对比 + EV 差值
- ✅ IndexedDB 本地持久化，隐私保护
- ❌ 非 solver 级精确计算（近似 GTO 规则）

Sources: [GTO Wizard Review](https://solvers.poker/review/gtowizard/), [DTO Poker](https://www.dtopoker.com/), [WASM Postflop GitHub](https://github.com/b-inary/wasm-postflop), [GTOBase](https://gtobase.com/)

## Feasibility

### 技术可行性：**高**

**1. 扑克引擎（高可行性）**
- 德州扑克规则引擎在前端实现是成熟的技术方案
- 发牌（洗牌算法 Fisher-Yates）、下注轮管理、底池计算等逻辑清晰
- npm 生态有多个牌力评估库可用：`pokersolver`（浏览器兼容）、`phe`（高性能哈希算法）、`poker-evaluator`（Two Plus Two 算法）

**2. 近似 GTO 规则引擎（中高可行性）**
- Preflop：基于公开的 6-max GTO 范围表（RFI/3-bet/call ranges per position），数据可从 PokerCoaching、FreeBetRange 等公开资源获取，假设 100bb 深度、2.5bb open
- Postflop：基于 SPR（筹码底池比）+ 底池赔率 + 手牌强度的决策树，分为 value bet / bluff / check-call / fold 区间
- 这种近似方案无法达到 solver 精度，但对入门-中级玩家的训练目的已足够
- 关键：需要明确标注为"近似 GTO"，避免用户误解为精确解

**3. 赛后复盘系统（高可行性）**
- 牌局中记录每个决策点的完整状态（公共牌、底池、有效筹码、位置、行动序列）
- 对比用户实际选择 vs GTO 规则引擎推荐选择
- EV 差值计算：基于简化的期望值模型（手牌胜率 × 底池 - 投入成本）
- 逐手回放 UI 是常见的前端交互模式

**4. 数据持久化（高可行性）**
- IndexedDB 完全满足需求，支持结构化数据存储
- 单局数据量约 5-20KB，本地存储可支撑数千局记录

**5. UI 实现（中高可行性）**
- React + Tailwind CSS 可高效实现牌桌 UI
- 牌面渲染（52 张扑克牌 SVG/CSS）、筹码动画、下注交互等均有成熟方案
- 复盘界面的时间轴/决策树展示需要精心设计

### 技术风险
- **GTO 精度问题**：近似规则引擎与真实 GTO 解有差距，可能导致用户学到次优策略。需明确产品定位为"入门练习"而非"精确训练"
- **BOT 行为真实性**：5 个 BOT 如果行为模式过于单一，会降低训练价值。需要为不同位置的 BOT 设计差异化的策略参数
- **EV 计算准确性**：简化的 EV 模型可能在复杂场景（多人底池、深筹码）中产生误导

### 业务可行性：**高**
- 纯前端应用，零运维成本
- 开源/免费模式可快速获取用户
- 后续可通过精确 solver 集成、高级分析功能等方式商业化

Sources: [pokersolver GitHub](https://github.com/goldfire/pokersolver), [phe GitHub](https://github.com/thlorenz/phe), [FreeBetRange Preflop Charts](https://blog.freebetrange.com/article/preflop-charts-open-raise-in-6-max-poker-cash-games), [PokerCoaching Charts](https://pokercoaching.com/preflop-charts)

## Key Insights

1. **差异化核心是"完整牌局对战 + 即时复盘"**：现有 GTO 训练工具多为单手牌/单场景训练，GTO Idiot 提供完整 6 人桌对战体验 + 赛后复盘是最大卖点，需重点打磨对战流畅度和复盘体验

2. **近似 GTO 需要透明化**：必须在产品中明确标注"基于规则的近似 GTO 策略"，并说明与 solver 精确解的区别。建议在复盘界面增加"置信度"标识，低置信场景提示用户参考专业工具

3. **Preflop 范围表是 MVP 核心资产**：6-max 各位置的 RFI/3-bet/call/fold 范围表数据质量直接决定 BOT 行为的可信度和训练价值。建议基于 100bb/2.5bb open 的公开 GTO 图表构建，这些数据在扑克社区已有广泛共识

4. **BOT 需要位置感知 + 随机化**：每个 BOT 应根据其位置（UTG/HJ/CO/BTN/SB/BB）执行不同的策略范围，并加入适当的随机化（混合策略），避免行为过于机械化

5. **复盘系统的 EV 差值是学习核心**：用户最关心"我的决策比 GTO 差多少"。EV 差值的呈现方式需要直观（颜色编码 + 数值），并附带简要的策略解释（如"此处 GTO 建议 check-raise 因为你的手牌处于极化范围"）

6. **前端性能是关键约束**：牌力评估（尤其是 River 阶段的多人 showdown）需要高效算法。建议使用 `pokersolver` 或 `phe` 库，而非自行实现。Monte Carlo 模拟如果用于 EV 计算，需控制采样次数以保证 UI 响应速度

7. **存量开源资源可加速开发**：`pokersolver`（手牌评估）、公开 GTO 范围表数据、CSS/SVG 扑克牌组件等均可复用，显著降低开发工作量

8. **后续增长路径清晰**：MVP 验证后可逐步添加——自定义盲注/深度、WASM solver 集成（参考 wasm-postflop）、手牌历史导入分析、移动端适配等