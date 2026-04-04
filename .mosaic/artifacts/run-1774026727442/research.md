## Market Overview

德州扑克 GTO 训练工具市场近年来快速增长，2026 年已形成以 GTO Wizard 为龙头、多家垂直工具并存的竞争格局。市场主要分为三个层次：

1. **专业 Solver 工具**（PioSolver、MonkerSolver）— 面向高阶玩家，需要强大硬件，价格高
2. **云端训练平台**（GTO Wizard、DTO Poker、GTOBase）— SaaS 订阅制，覆盖 preflop + postflop，是主流选择
3. **轻量练习工具**（FreeBetRange、Poker Trainer、Simple GTO Trainer）— 免费或低价，功能聚焦单一场景

**市场机会**：当前主流工具普遍以"查表/做题"模式为核心（给定牌面选最优动作），缺少**完整牌局对战模拟 + 赛后 GTO 偏差复盘**的一体化体验。GTO Idiot 的差异化在于"打牌 → 复盘"闭环，降低学习门槛，让玩家在实战中自然掌握 GTO 概念。

**目标市场规模**：全球在线扑克玩家约 1 亿+，其中关注策略提升的活跃学习者估计 500 万-1000 万。免费 Web 工具可快速获取入门到中级玩家群体。

Sources: [PokerNews - Best Poker Tools 2026](https://www.pokernews.com/poker-tools/), [HUDStore - Best GTO Solvers](https://www.hudstore.poker/5-best-gto-poker-solvers)

---

## Competitor Analysis

| Competitor | Core Features | Strengths | Weaknesses |
|---|---|---|---|
| **GTO Wizard** | 1000万+ 预解库、手牌上传分析、Preflop/Postflop 训练、多格式支持（Cash/MTT/Spin） | 最全面的 GTO 解库；UI 精美；移动端支持；社区认可度最高 | 价格高（$26-206/月）；无实战对战模式；学习曲线陡峭 |
| **DTO Poker** | GTO Bot 练习、Explorer 浏览器、3-way/ICM 模拟、Cash + MTT | 支持 vs GTO Bot 练习；覆盖 300+ 翻面；界面简洁 | 订阅制收费；练习模式为单手牌场景非完整牌局；Bot 风格单一（仅 GTO） |
| **FreeBetRange** | Preflop Range 构建器、GTO 策略学习、游戏模拟器 | 完全免费；浏览器直接使用；范围可视化好 | 仅覆盖 Preflop；无 Postflop 训练；无复盘功能 |
| **Simple GTO Trainer** | 实时 GTO 反馈、自定义训练场景、预建训练集 | 即时反馈；可自定义场景；桌面端性能好 | 需要导入 solver 解；非独立工具依赖 PioSolver；无牌局模拟 |
| **PokerSnowie** | AI 分析、手牌评估、实时建议、对战训练 | 基于 AI 的策略建议；支持对战训练；适合新手 | 非严格 GTO（基于神经网络）；界面较旧；订阅制 |
| **Poker Trainer (pokertrainer.se)** | 免费练习、Preflop 训练、位置练习 | 完全免费；简单易用；浏览器端 | 功能非常基础；仅 Preflop；无 Bot 对战；无复盘 |
| **Postflop+** | Postflop GTO 训练、移动端 App | 专注 Postflop；移动端体验好 | 仅移动端；无完整牌局；无赛后分析 |

Sources: [GTO Wizard](https://gtowizard.com/), [DTO Poker](https://www.dtopoker.com/), [FreeBetRange](https://freebetrange.com/en), [Simple GTO Trainer](https://simplepoker.com/en/Solutions/Simple_GTO_Trainer), [Poker Trainer](https://pokertrainer.se/)

---

## GTO Idiot 差异化定位

| 维度 | 竞品主流模式 | GTO Idiot |
|---|---|---|
| 练习方式 | 单手牌做题 / 查表 | 完整六人桌牌局对战 |
| Bot 多样性 | 通常仅 GTO Bot | GTO / LAG / TAG / Fish 多风格 |
| 复盘体验 | 手牌上传后分析 | 内置赛后逐手复盘 + EV 偏差可视化 |
| 价格 | $10-200/月订阅 | 免费（纯前端，无服务器成本） |
| 部署方式 | 需注册 / 下载 | 浏览器直接打开，localStorage 持久化 |
| GTO 精度 | Solver 精确解 | 简化规则版（Range Chart + 决策树） |

---

## Feasibility

### 技术可行性：**高**

1. **牌局引擎**：Texas Hold'em 游戏逻辑成熟，开源实现丰富（GitHub 上有 node-poker-stack、JsPoker、texas-holdem 等项目可参考）。六人桌 NL Hold'em 的发牌、下注轮、底池计算、摊牌逻辑均为确定性算法，纯前端 JS/TS 完全可实现。

2. **Bot AI（简化 GTO）**：
   - **Preflop**：基于标准 GTO preflop range chart（按位置 + 前位动作查表），数据量可控（~170 起手牌 × 6 位置 × 若干场景），可硬编码为 JSON。
   - **Postflop**：简化决策树方案可行 — 基于 pot odds、SPR、board texture 等因素的规则引擎。不追求 solver 精度，而是提供合理的 GTO 近似。
   - **多风格 Bot**：在 GTO 基线上调整参数（开牌范围宽窄、激进度、bluff 频率）即可派生 LAG/TAG/Fish 风格。

3. **GTO 偏差分析**：
   - 记录玩家每个决策点的动作 vs GTO 推荐动作
   - EV 损失计算可用简化公式（基于 range equity + pot size 的近似 EV）
   - 数据结构：每手牌存储为结构化 JSON，含所有 street 的动作序列

4. **UI 实现**：
   - React + Tailwind CSS 可快速实现经典牌桌 UI
   - Canvas 或 SVG 绘制牌桌、扑克牌
   - localStorage 存储历史牌局数据（单局约 1-2KB，可存数千局）

5. **性能**：纯前端运行，无网络延迟，Bot 决策为查表 + 规则计算，响应即时。

### 业务可行性：**中高**

- **优势**：零服务器成本、零获客成本（免费工具引流）、差异化明确
- **挑战**：简化 GTO 的精度可能被高阶玩家质疑；与 GTO Wizard 等工具的品牌认知差距大
- **变现路径**（非 MVP）：高级 Bot 风格包、详细统计报告、solver 精确解接入

### 技术风险

| 风险 | 影响 | 缓解措施 |
|---|---|---|
| Postflop GTO 简化精度不足 | 中 | 明确标注为"简化 GTO 参考"，非 solver 精确解；聚焦常见场景 |
| localStorage 容量限制（5-10MB） | 低 | 单局数据压缩；提供导出/清理功能；10MB 可存 5000+ 局 |
| 牌桌 UI 交互复杂度 | 中 | 优先实现核心交互，渐进增强动画和视觉效果 |
| Bot 行为不够真实 | 中 | 从已知策略资料构建 range chart；多轮测试调优参数 |

---

## Key Insights

1. **"打牌+复盘"闭环是核心差异化**：市场上的 GTO 训练工具几乎全部是"做题模式"（给定牌面选动作），没有工具提供完整六人桌牌局体验 + 赛后 GTO 偏差分析。GTO Idiot 填补了"在模拟实战中学习 GTO"这一空白。

2. **免费 + 零注册是获客利器**：GTO Wizard 最低 $26/月、DTO Poker 需要订阅。GTO Idiot 作为免费浏览器工具，可以吸引大量入门玩家和付费工具的潜在用户。

3. **多风格 Bot 是教学亮点**：现有工具的 Bot 通常仅有 GTO 风格。提供 LAG/TAG/Fish 等风格让用户理解"GTO 策略如何应对不同类型对手"，这是实际牌桌上更需要的能力。

4. **简化 GTO 足够 MVP**：目标用户是入门到中级玩家，Preflop range chart + 简化 postflop 决策树已足够提供有价值的学习反馈。高阶精度可作为后续迭代方向（接入 solver API）。

5. **技术栈完全可行**：React + TypeScript 纯前端方案成熟，开源扑克引擎可参考，开发周期可控。核心挑战在于 postflop 决策树的设计质量和 Bot 行为的合理性。

6. **复盘数据可视化是留存关键**：用户留存取决于复盘体验的价值感 — 需要清晰展示每个决策点的 GTO 推荐 vs 实际选择、EV 损失量化、以及长期趋势统计。

7. **潜在扩展方向**：手牌导入（从在线扑克平台导出手牌历史进行复盘）、tournament 模式、solver API 接入、社区排行榜等，均可在 MVP 验证后逐步实现。