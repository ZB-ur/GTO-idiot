Now I have enough data. Let me compile the research report.

## Market Overview

GTO (Game Theory Optimal) 扑克训练市场在过去几年快速增长，已成为线上扑克生态中最重要的学习工具品类。核心驱动因素：线上扑克玩家池竞争加剧，GTO 从高端玩家专属工具逐渐下沉到初中级市场。

当前市场格局：头部产品（GTO Wizard）以订阅制为主，$39-$129/月；中腰部产品分化为 solver 型和 trainer 型两大赛道。**关键缺口**：几乎所有产品都定位为"学习工具"而非"实战模拟器"——用户在独立场景中做选择题，而非在完整牌局中与 BOT 对打并实时体验决策后果。

GTO Idiot 的定位——免费、浏览器端、完整牌局 + 赛后 GTO 复盘——在市场中尚无直接对标产品，属于"practice by playing"赛道的空白点。

## Competitor Analysis

| Competitor | Core Features | Strengths | Weaknesses | Opportunity |
|---|---|---|---|---|
| **GTO Wizard** ($39-129/mo) | Pre-solved GTO 库（1000 万+ spot）、Trainer（逐手选择题）、Hand Analyzer、Range Builder | 最全面的 GTO 数据库、浏览器端、AI solver 精度极高（Nash Distance 0.21%）、支持 Cash/MTT/Spin | 价格高门槛（$39/月起）；Trainer 是选择题模式非实战；对新手学习曲线陡峭；无完整牌局对战体验 | **免费 + 完整牌局体验**：用户在真实牌局中做决策，而非孤立的 spot 训练 |
| **PokerSnowie** (~$99/yr) | 神经网络 AI 对手、实战对打模式、hand history 分析、错误反馈 | 有完整牌局对战功能；AI 基于神经网络更接近真实对手；对新手友好 | AI 并非严格 GTO（是近似策略）；桌面端应用（非浏览器）；UI 较老旧；不提供逐 spot 的 GTO 频率对比 | **浏览器端 + GTO 精确对比**：PokerSnowie 只有近似 AI 反馈，不对比标准 GTO 解 |
| **GTOBase** ($19.99/mo) | GTO 策略浏览器、Training 模式、Hand History 分析（300手/分钟）、多种可视化 | 灵活的策略浏览、支持多种扑克变体、价格适中 | 纯学习/浏览工具，无实战对打；需要自行导入 hand history；无 BOT 对手 | **实战 + 即时复盘闭环**：用户无需先打牌再导入，直接在产品内完成对战→复盘全流程 |
| **Fearless River / WPT GTO Trainer** | Pre-solved 手牌练习、EV loss 反馈、structured study plans | 学习路径清晰、即时 EV 反馈 | 选择题模式、无完整牌局、覆盖 spot 有限 | 完整牌局体验 + 更丰富的 BOT 风格 |
| **PureGTO** | HU/Spin GTO trainer、vs BOT 对打 | 有 BOT 对战、即时反馈 | 仅支持 HU 和 Spin（非 6-max）；覆盖场景窄 | **6-max Cash Game 专精**：最主流的线上扑克格式 |

## Technical Feasibility

- **Overall: HIGH**

### Key Challenges & Mitigation

| Challenge | Difficulty | Mitigation |
|---|---|---|
| **牌局引擎（Game Engine）** | LOW | npm 生态有成熟方案：`poker-ts`（TypeScript，状态机模型）、`pokersolver`（手牌评估）。自建也可控——Hold'em 规则明确，6-max 状态机约 200-300 行核心逻辑 |
| **手牌评估（Hand Evaluation）** | LOW | `pokersolver` 或 `phe` 库成熟可靠，支持 5-7 张牌评估，浏览器端运行无性能问题 |
| **GTO 预计算策略表** | MEDIUM | MVP 策略：预计算常见 spot 的 GTO 数据，以 JSON 格式内置。Preflop 范围可从公开 GTO charts 手动编码（6 位置 × RFI/3bet/call 场景，约 50-100 个 spot）。Postflop 简化为常见翻牌面分类 + SPR 区间的标准策略。**风险**：完整 postflop GTO 解空间巨大（数十亿 spot），MVP 只能覆盖高频场景 |
| **BOT AI 实现** | MEDIUM | 不需要真正的 GTO solver。BOT 基于预设风格参数（VPIP/PFR/Agg 等）+ 简单规则引擎即可：TAG 打紧凶范围、LAG 扩大范围加频率、鱼被动跟注。这是确定性行为树，不需要 AI/ML |
| **赛后复盘 UI** | MEDIUM | 需要设计手牌回放器 + GTO 对比可视化。技术上直接用 React 组件实现，核心是数据结构设计——每个决策点记录 `{action, gtoRecommendation, eV}` |
| **数据持久化** | LOW | IndexedDB + localStorage 完全满足需求。可用 `idb` 库简化 IndexedDB 操作。牌局记录估算：每局 ~2-5KB JSON，1000 局 = ~5MB，远在浏览器存储限制内 |
| **牌桌 UI 渲染** | MEDIUM | 需要自定义 6-max 牌桌组件（座位布局、筹码动画、发牌动画）。无成熟 React 扑克 UI 库，需自建。但纯 CSS/SVG 实现完全可行，不需要 Canvas/WebGL |

### Required Libraries & Maturity

| Library | Purpose | Maturity | Notes |
|---|---|---|---|
| `pokersolver` | 手牌评估 & 比较 | ⭐⭐⭐⭐ 成熟稳定 | 2.4k+ GitHub stars，支持所有 Hold'em 手牌 |
| `idb` | IndexedDB wrapper | ⭐⭐⭐⭐⭐ 工业级 | Google Chrome 团队维护 |
| React + TypeScript + Tailwind | UI 框架 | ⭐⭐⭐⭐⭐ | 项目约束，无需评估 |
| 自建：Game Engine | 牌局状态机 | N/A | 建议自建而非依赖第三方——规则简单明确，自建可完全控制牌局逻辑和事件钩子 |
| 自建：GTO Strategy Tables | 预计算 GTO 数据 | N/A | JSON 格式，手动编码 + 公开 GTO charts 数据 |

### Browser Compatibility
- 纯 React SPA，无特殊浏览器 API 依赖
- IndexedDB：所有现代浏览器支持
- 无 WebAssembly/WebGL 依赖
- **兼容性风险：LOW**

## Key Insights

1. **"Practice by Playing"赛道空白**：现有 GTO 训练器全部是"选择题"模式（给你一个 spot，你选动作），没有产品让用户打完整牌局后再对比 GTO。GTO Idiot 的完整牌局 + 赛后复盘闭环是核心差异化点。→ **PRD 建议：将"完整牌局体验"作为 F-001 核心特性，不可降级为选择题模式**

2. **GTO 数据覆盖度是 MVP 最大技术权衡**：完整 postflop GTO 解需要 solver 计算（如 PioSolver），数据量以 TB 计。MVP 必须大幅简化——Preflop 全覆盖（~100 spot）+ Postflop 仅覆盖高频牌面分类（high/mid/low/monotone/paired 等 ~20 类 × 常见 SPR 区间）。→ **PRD 建议：明确标注 GTO 覆盖范围为"常见 spot 的简化解"，UI 中对未覆盖 spot 显示"无 GTO 参考数据"而非沉默**

3. **Preflop GTO 数据可公开获取**：PokerCoaching、FreeBetRange 等提供免费的 6-max 100BB preflop GTO charts（RFI/3bet/call/4bet 全位置）。这些数据可直接编码为 JSON。→ **PRD 建议：Preflop 阶段可做到接近完整覆盖，作为 MVP 复盘功能的核心亮点**

4. **BOT 不需要真 AI，规则引擎即可**：PokerSnowie 用神经网络做 AI 是因为要"近似真实玩家"。GTO Idiot 的 BOT 目的是提供对手让用户练习，用 VPIP/PFR/Aggression 参数化的规则引擎（if-else + 随机化）完全足够，开发成本远低于 ML 方案。→ **PRD 建议：BOT 实现为参数化规则引擎，每个 BOT 风格是一组参数配置文件**

5. **免费 + 浏览器端是对 GTO Wizard 的精准降维打击**：GTO Wizard 起步 $39/月，是新手的主要门槛。GTO Idiot 定位免费工具，覆盖"想学 GTO 但不愿付费"的大量潜在用户。→ **PRD 建议：首页明确强调"免费、无需注册、浏览器即开即玩"**

6. **复盘 UI 是留存关键，必须做到"一目了然"**：GTO Wizard 的复盘功能虽然强大但"Hard to learn for new users"。GTO Idiot 面向新手，复盘界面必须极简——每个决策点用红/黄/绿三色标注（GTO 符合/偏差/严重偏差），点击展开详情。→ **PRD 建议：复盘默认视图为简化的"红绿灯"模式，高级详情（频率分布、EV loss）可选展开**

7. **自建牌局引擎优于引入第三方库**：`poker-ts` 等库功能完整但引入外部依赖增加维护风险且难以定制。Hold'em 6-max 规则明确（发牌、下注轮、边池计算），自建引擎约 500-800 行 TypeScript，可完全控制事件钩子和状态序列化（复盘所需）。→ **PRD 建议：牌局引擎自建，手牌评估可用 `pokersolver` 库**

## Risks

| Risk | Type | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| **Postflop GTO 数据不足导致复盘价值低** | Technical | HIGH | HIGH | MVP 明确限定 preflop 为复盘核心；postflop 仅覆盖高频分类并标注覆盖范围；后续版本可集成 WASM solver |
| **GTO 策略表手动编码错误** | Technical | MEDIUM | HIGH | 交叉验证多个公开来源（PokerCoaching、FreeBetRange、GTO Wizard free tier）；编写单元测试验证范围一致性 |
| **牌桌 UI 自定义开发工作量大** | Technical | MEDIUM | MEDIUM | 优先实现功能性布局（CSS Grid/Flexbox），视觉动画作为 P1 后续优化 |
| **BOT 行为不够真实影响练习体验** | Product | MEDIUM | MEDIUM | 初版用经典 VPIP/PFR 参数化，通过用户反馈迭代调优；不追求"像真人"，追求"提供有意义的决策场景" |
| **pokersolver 库停止维护** | Dependency | LOW | LOW | 库功能稳定、无已知 bug；必要时可 fork 或替换为 `phe` |
| **IndexedDB 存储限制** | Technical | LOW | LOW | 单局 ~5KB，1000 局 = 5MB，远低于浏览器配额（通常 50MB+） |
| **市场教育成本：用户不理解"简化 GTO"** | Market | MEDIUM | MEDIUM | UI 明确标注数据来源和覆盖范围；引导用户理解 MVP 定位为"入门级 GTO 参考" |

```json
{
  "competitors": ["GTO Wizard", "PokerSnowie", "GTOBase", "Fearless River (WPT GTO Trainer)", "PureGTO"],
  "key_insights": [
    "Practice-by-playing赛道无直接竞品，完整牌局+赛后GTO复盘是核心差异化",
    "Preflop GTO数据可从公开charts编码，覆盖度高；Postflop需大幅简化只覆盖高频分类",
    "BOT用参数化规则引擎即可，无需ML/AI",
    "免费+浏览器端精准对标GTO Wizard $39/月门槛",
    "复盘UI需极简红绿灯模式，降低新手理解门槛",
    "牌局引擎建议自建，手牌评估用pokersolver库",
    "GTO数据覆盖范围必须在UI中明确标注"
  ],
  "feasibility": "high",
  "risks": [
    "Postflop GTO数据覆盖不足导致复盘价值受限（HIGH likelihood, HIGH impact）",
    "GTO策略表手动编码可能存在错误（MEDIUM likelihood, HIGH impact）",
    "牌桌UI自定义开发工作量（MEDIUM likelihood, MEDIUM impact）",
    "BOT行为真实度影响练习体验（MEDIUM likelihood, MEDIUM impact）"
  ]
}
```