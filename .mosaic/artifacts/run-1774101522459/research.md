## Market Overview

德州扑克 GTO 训练工具市场在 2024-2026 年持续增长，已形成以 GTO Wizard 为首的成熟竞争格局。市场主要分为三个层次：

1. **高端专业 Solver**（$35-$206/月）：GTO Wizard、PeakGTO、Deepsolver — 面向中高级玩家，提供千万级预计算解决方案
2. **中端训练器**（$10-$30/月）：DTO Poker、GTOBase、InstaGTO — 聚焦特定场景训练
3. **免费/开源工具**：LibreGTO、Poker Trainer — 功能有限但零成本

**市场机会**：现有工具普遍采用"查表式"学习（查看预计算的 GTO 解），缺乏**沉浸式实战对练**体验。大多数工具要求用户在特定场景中选择动作，而非完整牌局流程。GTO Idiot 的差异化在于：完整 6 人桌实战对练 + 多风格 BOT + 赛后 EV 复盘，且纯浏览器端免费运行，降低入门门槛。

## Competitor Analysis

| Competitor | Core Features | Strengths | Weaknesses |
|---|---|---|---|
| **GTO Wizard** ($35-206/月) | 1000万+预解方案、Practice Mode、Hand History 分析、多游戏类型 | 最精确的 Nash Distance (0.21%)、全面的场景覆盖、云端计算 | 价格昂贵、非完整牌局对练、需订阅 |
| **DTO Poker** ($10-30/月) | GTO Trainer + Explorer、3-Way 模拟、移动端支持 | 价格适中、支持 3-way 场景、移动端体验好 | 场景有限、非完整牌局流程 |
| **Deepsolver** (订阅制) | 云端求解、GTO Trainer、多桌练习 | 纯浏览器、快速求解、可自定义场景 | 非对战模式、无 BOT 对练 |
| **GTOBase** (订阅制) | 策略浏览器、HH 分析、多种数据视图 | 数据可视化强、多维度分析 | 偏重分析而非练习 |
| **LibreGTO** (免费开源) | Preflop 范围训练、手牌强度、位置练习 | 完全免费、开源 | 仅 Preflop、无对战、功能简陋 |
| **Poker Trainer** (免费开源) | 6-max 对战、决策评分、AI 对手 | 免费、完整牌局、有评分 | GTO 精度不明、无详细 EV 分析、UI 简陋 |
| **PokerSnowie** (订阅制) | AI 训练、错误分析、Hand History 导入 | 基于神经网络的 AI、成熟产品 | 非纯 GTO、需安装客户端 |
| **PeakGTO** (订阅制) | 云端求解、训练器、ICM 分析 | 快速求解、由职业选手参与 | 偏重锦标赛、价格较高 |

**竞争定位**：GTO Idiot 最接近的竞品是 Poker Trainer（免费、6-max、AI 对战），但 GTO Idiot 的差异化在于：多风格 BOT（TAG/LAG/TP/LP/GTO）、详细的 EV 差值复盘、GTO 策略对比可视化。

## Feasibility

### 技术可行性：**中等** (Medium)

**核心技术挑战：**

1. **GTO Solver（最大挑战）**
   - 完整的 6 人桌 GTO solver 在浏览器端不可行 — 专业 solver（如 PioSolver）需要数 GB 内存和数小时计算
   - **可行方案**：采用简化版 CFR（Counterfactual Regret Minimization）算法 + 预计算查找表
   - Preflop：使用预计算的 6-max GTO 范围表（开源数据可用）
   - Postflop：简化为 2-3 个 bet sizing、抽象化手牌分组，使用 Monte Carlo CFR 在 Web Worker 中运行
   - 精度目标：不追求 0.21% Nash Distance（GTO Wizard 级别），而是提供"方向性正确"的 GTO 建议（~5-10% Nash Distance 可接受）

2. **手牌评估**
   - 已有成熟的 JS 库：`pokersolver`（浏览器/Node 双端）、`phe`（高性能哈希算法）、`poker-evaluator`（Two Plus Two 算法，22M hands/sec）
   - **完全可行**，直接使用现有 npm 包

3. **BOT AI 决策**
   - TAG/LAG/TP/LP 风格可通过参数化策略实现（调整 VPIP/PFR/AF 等指标）
   - GTO BOT 使用简化 solver 的输出
   - **可行**，工作量适中

4. **EV 计算与复盘**
   - 需要在每个决策点记录游戏状态和可选动作
   - EV 差值 = GTO 推荐动作 EV - 用户实际动作 EV
   - 使用 Monte Carlo 模拟估算 EV（精度取决于模拟次数）
   - **可行**，但计算量需要 Web Worker 异步处理

5. **前端技术栈**
   - React + TypeScript + Tailwind CSS — 成熟方案，完全可行
   - IndexedDB 存储牌局历史 — 足够支持数千局存储
   - Canvas/SVG 渲染牌桌 UI — 成熟方案

**开源资源：**
- 手牌评估：`pokersolver`、`phe`、`poker-evaluator`（npm）
- CFR 参考实现：`poker_ai`（Python）、`simple-poker-cfr`（Python）— 需移植到 TypeScript
- GTO 范围数据：多个开源 preflop range chart 可用

**性能约束：**
- 浏览器端 CFR 求解需限制游戏树深度和抽象粒度
- Web Worker 避免阻塞 UI 线程
- 预计算 + 运行时简化计算的混合策略

### 业务可行性：**高** (High)
- 纯浏览器端运行，无服务器成本
- 免费工具可快速获取用户
- 与现有付费工具形成差异化竞争

## Key Insights

1. **GTO 精度 vs 用户体验的权衡是核心决策**：不需要与 GTO Wizard 的 0.21% Nash Distance 竞争。对于练习目的，方向性正确的 GTO 建议（~5-10% ND）已足够有价值，且可在浏览器端实现。

2. **"完整牌局对练"是未被满足的需求**：现有 GTO 工具多为"场景训练"模式（跳到特定决策点），缺乏从 Preflop 到 River 的完整牌局体验。GTO Idiot 的完整对战流程 + 多风格 BOT 是明确的差异化。

3. **Preflop 范围可直接复用开源数据**：6-max cash game preflop GTO range 已有大量公开数据，无需自行求解。MVP 应优先使用预计算 preflop 范围表。

4. **Postflop GTO 是技术难点，建议分阶段实现**：MVP 阶段使用简化的策略规则（基于底池赔率、手牌强度、SPR 的启发式算法），后续版本逐步引入 CFR 近似求解。

5. **免费 + 浏览器端 = 低门槛获客**：市场领导者 GTO Wizard 起步价 $35/月，免费且无需安装的工具对入门-中级玩家有明显吸引力。

6. **BOT 风格差异化是教学利器**：让用户同时面对 TAG、LAG、TP、LP、GTO 五种风格的 BOT，本身就是一种策略学习工具 — 用户可以直观感受不同风格的优劣。

7. **EV 差值可视化是复盘的核心价值**：不仅告诉用户"GTO 应该怎么做"，更量化"你的决策损失了多少 EV"，这是最直观的学习反馈。

8. **现有 JS 生态足够支撑核心功能**：手牌评估（pokersolver/phe）、数据存储（IndexedDB）、异步计算（Web Workers）等基础设施均有成熟方案。

Sources:
- [GTO Wizard](https://gtowizard.com/)
- [DTO Poker](https://www.dtopoker.com/)
- [LibreGTO](https://libregto.com/)
- [Poker Trainer](https://pokertrainer-delta.vercel.app/)
- [pokersolver (npm)](https://www.npmjs.com/package/pokersolver)
- [phe - Poker Hand Evaluator](https://github.com/thlorenz/phe)
- [poker_ai - Open Source Texas Hold'em AI](https://github.com/fedden/poker_ai)
- [How Solvers Work - GTO Wizard](https://blog.gtowizard.com/how-solvers-work/)
- [CFR-Explained](https://github.com/brianberns/CFR-Explained)
- [Deepsolver](https://deepsolver.com/)
- [GTOBase](https://gtobase.com/)
- [PokerNews - Best Poker Tools 2026](https://www.pokernews.com/poker-tools/)
- [awesome-poker (GitHub)](https://github.com/apehex/awesome-poker)