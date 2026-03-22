## Market Overview

德州扑克 GTO 训练工具市场在 2024-2026 年间持续增长，已形成以 GTO Wizard 为龙头的成熟竞争格局。主流产品均采用 SaaS 订阅模式（$39-$149/月），依赖云端算力进行实时求解。市场存在明显的价格门槛——入门级用户（目标用户群）面临高昂的月费和复杂的学习曲线。

**机会窗口：** 目前市场上缺少一款**免费、纯浏览器端、以"对战练习"为核心体验**的 GTO 训练工具。现有产品侧重"查表/解题"模式（explore solutions → drill spots），而非沉浸式牌局对战+赛后复盘的闭环体验。GTO Idiot 的差异化定位在于：**零成本 + 对战驱动 + 即时反馈**，降低 GTO 学习的入门门槛。

Sources: [PokerNews Best Tools 2026](https://www.pokernews.com/poker-tools/), [Cardplayer Lifestyle](https://cardplayerlifestyle.com/poker-software/)

## Competitor Analysis

| Competitor | Core Features | Strengths | Weaknesses |
|---|---|---|---|
| **GTO Wizard** ($39-$149/mo) | 海量预解库、GTO Trainer drill、AI 求解器、手牌分析 | 最大解库、AI 驱动、全格式支持 | 昂贵（$39+/月）、学习曲线陡、非对战模式 |
| **DTO Poker** ($29-$99/mo) | 锦标赛 GTO Trainer + Explorer、ICM 训练 | 锦标赛专精、一体化 | 偏锦标赛、无现金桌对战模式 |
| **GTOBase** ($25-$65/mo) | 策略浏览器、GTO Trainer 多模式、手牌分析 | 灵活训练模式、实时错误分析 | 无对战体验、需订阅 |
| **Deepsolver** ($30-$90/mo) | 云端求解、4桌 GTO Trainer、自定义场景 | 快速云端计算、多桌练习 | 依赖网络、价格较高 |
| **GTO LAB** ($50+/mo) | 职业教练内容、ICM Trainer、高级课程 | 顶级教练背书 | 高价、偏教学非练习 |
| **Poker Academy** (Free/Premium) | 150万+ Preflop 图表、浏览器端求解器 | 免费图表资源丰富 | 无对战模式、postflop 有限 |
| **FreeBetRange** (Freemium) | Preflop 范围构建器、GTO 练习模拟器 | 免费、可自定义范围 | 功能简单、无完整牌局 |
| **PokerSnowie** ($9-$30/mo) | AI 对战、错误评估、HUD | 有对战模式、适合新手 | 非 GTO（基于 AI 而非纳什均衡）、桌面端 |

**竞争定位总结：**
- 高端市场（$50+/月）：GTO Wizard、GTO LAB — 功能全面但门槛高
- 中端市场（$25-$50/月）：GTOBase、Deepsolver、DTO — 专项训练
- 低端/免费市场：Poker Academy（查表）、FreeBetRange（范围练习）— 功能碎片化
- **空白地带：免费 + 对战式 + 赛后 GTO 对比复盘 → GTO Idiot 的定位**

Sources: [GTO Wizard](https://gtowizard.com/), [GTOBase](https://gtobase.com/), [DTO Poker](https://www.dtopoker.com/), [Deepsolver](https://deepsolver.com/), [GTO LAB](https://gtolab.com/), [Poker Academy](https://poker.academy/preflop-charts), [FreeBetRange](https://freebetrange.com/en)

## Feasibility

### 技术可行性：**中等（Medium）**

**✅ 可行的部分：**

1. **牌局引擎（高可行性）**
   - JavaScript/TypeScript 生态有成熟的扑克引擎库：
     - [pokersolver](https://github.com/goldfire/pokersolver) — 手牌比较/求解，客户端可用
     - [@idealic/poker-engine](https://www.npmjs.com/package/@idealic/poker-engine) — TypeScript 完整游戏引擎，支持客户端
     - [phe](https://github.com/thlorenz/phe) — 高性能手牌评估（hash 算法）
   - 6人桌牌局逻辑（发牌、下注轮、底池计算、边池）是确定性算法，纯前端完全可实现

2. **Preflop GTO 查找表（高可行性）**
   - Preflop 6-max GTO 策略是已被广泛解决的问题
   - 可基于公开的 preflop chart（如 [GTO Charts](https://gtocharts.com/)、[PokerCoaching Charts](https://pokercoaching.com/preflop-charts)）构建查找表
   - 数据量可控：6个位置 × 169种起手牌 × 若干场景 ≈ 几千条记录，JSON 格式 < 500KB

3. **数据持久化（高可行性）**
   - IndexedDB 完全满足需求：存储手牌历史、统计数据
   - 单用户本地数据量预计 < 50MB（即使记录数千手牌）

4. **UI/UX（高可行性）**
   - React + Tailwind CSS 完全能实现牌桌 UI、手牌回放、统计图表
   - 可参考现有开源扑克 UI 组件

**⚠️ 有挑战的部分：**

5. **Postflop GTO 策略表（中等挑战）**
   - Postflop GTO 是组合爆炸问题：翻牌面 C(48,3)=17,296 种 × 范围组合
   - **MVP 简化方案：** 按翻牌面纹理分类（高牌/低牌、同花/彩虹、连接/断裂）+ 手牌强度分级（坚果/强牌/中等/弱牌/空气）→ 映射到简化动作（check/bet small/bet big）
   - 预估数据量：~50-100 种翻牌面类别 × 5-10 种手牌强度 × 位置 ≈ 几千条，可控
   - **风险：** 简化 GTO 策略的准确性有限，需在 UI 中明确标注"简化 GTO 参考"

6. **BOT 决策引擎（中等挑战）**
   - 5个 BOT 需要在所有街做出合理决策
   - Preflop：查表即可，问题不大
   - Postflop：需要一个合理的决策树——基于手牌强度 + 底池赔率 + 位置做简化决策
   - **关键取舍：** BOT 不需要完美 GTO（那需要实时求解器），但需要"合理且一致"

### 业务可行性：**高（High）**

- **零边际成本：** 纯前端静态站点，托管成本几乎为零（GitHub Pages / Vercel）
- **获客优势：** 免费 + 即开即玩，vs 竞品的注册 + 付费墙
- **增长路径：** MVP 免费 → 高级功能付费（详细统计、更精确的 GTO 表、自定义场景）
- **技术壁垒低但体验壁垒高：** 核心差异化在于"对战 + 复盘"的产品体验，而非算力

### 开发工作量估算

| 模块 | 估计工时 | 复杂度 |
|---|---|---|
| 牌局引擎（发牌/下注/底池） | 3-5 天 | 中 |
| Preflop GTO 查找表 | 2-3 天 | 低 |
| Postflop 简化策略表 | 3-5 天 | 中高 |
| BOT 决策引擎 | 3-5 天 | 中高 |
| 牌桌 UI | 3-5 天 | 中 |
| 对战记录 + 历史 | 2-3 天 | 低 |
| 赛后复盘（回放 + GTO 对比） | 3-5 天 | 中 |
| 统计/趋势图表 | 2-3 天 | 低 |
| **合计** | **~21-34 天** | — |

## Key Insights

1. **差异化定位清晰：** 市场缺少"免费 + 对战驱动 + GTO 对比复盘"的产品。现有工具要么昂贵（$39+/月），要么只提供查表/做题模式，没有沉浸式对战体验。GTO Idiot 填补了"GTO 学习入门级"的空白。

2. **Postflop 简化是核心技术风险：** MVP 的 GTO 策略必须足够简化以避免组合爆炸，但又要足够准确以提供有价值的学习反馈。建议采用"翻牌面纹理分类 + 手牌强度分级"的二维映射方案，并在 UI 中明确标注为"简化 GTO 参考"而非"精确 GTO 解"。

3. **JavaScript 扑克引擎生态成熟：** 存在多个可直接复用的开源库（pokersolver、phe、@idealic/poker-engine），可大幅减少牌局引擎开发工作量。建议评估 @idealic/poker-engine 作为游戏状态管理的基础。

4. **"对战→复盘→改进"闭环是产品核心价值：** 不要试图在 GTO 精确度上与 GTO Wizard 竞争（那是算力军备竞赛），而应聚焦于"打牌→看差距→再打牌"的学习循环体验。复盘界面的信息设计（如何直观展示"你的决策 vs GTO 建议"）是决定产品成败的关键。

5. **免费模式+未来付费墙是可行的商业路径：** MVP 全免费积累用户，后续可通过高级 GTO 表（更精确的 postflop 策略）、高级统计（HUD 风格数据）、导出/分享功能等实现变现。参考 Poker Academy 的 freemium 模式。

6. **Preflop 数据可获取但需注意版权：** 公开的 preflop GTO chart 资源丰富，但直接复制商业产品的解库可能有法律风险。建议基于公开学术研究和通用策略原则自行构建简化版本，或使用明确开源/CC 协议的资源。