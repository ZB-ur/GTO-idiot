## Market Overview

德州扑克GTO训练工具市场在2024-2026年持续增长，由GTO Wizard主导（月订阅$39-$129），ThinkGTO和GTOBase等移动端/Web端产品紧随其后。市场呈现明显的两极分化：

- **高端市场**：GTO Wizard、PioSolver、MonkerSolver 面向中高级玩家，功能强大但价格高、学习曲线陡峭
- **移动端市场**：ThinkGTO Postflop+、GTO Preflop Ranges 等针对碎片化学习场景
- **空白地带**：缺乏一款**免费、零门槛、纯浏览器端**的初学者GTO练习器，以"对战+复盘"为核心体验

GTO Idiot 的机会在于：填补"免费+初学者友好+完整对战体验+GTO复盘"这一细分空白。现有产品要么收费（$35+/月），要么只提供孤立的range训练（非完整牌局），要么需要安装桌面软件。

## Competitor Analysis

| Competitor | Core Features | Strengths | Weaknesses | Opportunity |
|---|---|---|---|---|
| **GTO Wizard** | 海量预解GTO库、GTO Trainer对战、手牌分析、Preflop/Postflop range浏览器 | 最全面的GTO数据库；AI对手使用GTO策略；即时反馈（blunder/wrong/correct标注）；支持Cash/MTT/Spin&Go多种格式 | 收费门槛高（$39-$129/月）；功能过于专业，初学者容易迷失；无完整六人桌对战体验（更偏向单个spot训练） | 提供**免费**的完整六人桌对战+复盘体验，面向初学者降低学习门槛 |
| **ThinkGTO Postflop+** | GTO Bot对战训练、ELO评分追踪、Range拆分分析、EV/Equity Explorer、离线可用 | 移动端体验优秀；离线可用；ELO追踪有激励性；Board定制化训练 | 仅移动端App（iOS/Android）；免费功能有限；缺乏完整牌局流程（侧重单个postflop spot） | 提供**Web端**完整牌局体验，无需下载App；提供多BOT风格对手而非纯GTO对手 |
| **GTOBase** | GTO策略浏览器、手牌历史分析器、多种数据展示方式 | 覆盖几乎所有扑克变体；数据展示丰富 | 以"查阅"为主，缺乏互动训练；对初学者不够直观；无对战模式 | 将GTO数据以"对战复盘"的形式呈现，比纯查表更直观易学 |
| **Simple GTO Trainer** | 桌面端GTO训练器、自定义spot训练 | 功能专业、可自定义 | 需要桌面安装；学习曲线陡；需配合PioSolver使用 | 零安装、浏览器直接使用的轻量替代方案 |
| **PokerSnowie** | AI对战训练、错误检测、手牌分析 | AI基于神经网络训练，策略接近GTO；支持锦标赛和现金桌 | 收费产品；桌面端软件；UI较为陈旧；初学者引导不足 | 现代Web UI + 初学者友好的引导设计 |

## Technical Feasibility

- **Overall: HIGH**

GTO Idiot 的核心技术挑战均可在纯浏览器端用 React + TypeScript 解决，无需后端服务。

### Key Challenges & Mitigation

| Challenge | Difficulty | Mitigation |
|---|---|---|
| **Preflop GTO Range数据** | 低 | 六人桌6-max preflop ranges是公开的、已充分研究的数据。可硬编码 169 种起手牌 × 6 个位置 × 多种场景的action频率表（约2000条数据），JSON格式内置即可。参考来源：BBZ Poker Charts、PokerCoaching preflop charts |
| **简化Postflop GTO策略** | 中 | 完整postflop GTO需要solver实时计算（不可行于浏览器端）。MVP策略：使用预计算的简化决策树——按牌面texture分类（dry/wet/monotone等）× 位置 × SPR范围，给出简化的频率建议。标注为"简化GTO参考"而非"精确GTO解"。[NEEDS VERIFICATION] 需确认简化策略表的具体粒度和数据量 |
| **扑克游戏引擎** | 中 | 需自行实现：发牌、下注轮次管理、底池计算、showdown判定。npm库`pokersolver`可处理手牌评估（支持5-7张牌评估），但完整的betting round管理需自行编写。预计1500-2500行核心逻辑 |
| **BOT AI决策** | 中 | 5种风格BOT不需要真正的GTO solver。策略：基于preflop range表 + 简化postflop规则树实现。每种风格通过调整参数（VPIP/PFR/AF等）来区分：TAG(紧凶)低VPIP高AF、LAG(松凶)高VPIP高AF、Fish(松弱)高VPIP低AF等 |
| **手牌回放与GTO对比** | 低 | 每手牌记录完整action history到内存/localStorage，回放时逐步展示并查表对比GTO推荐action。数据结构清晰，实现难度低 |
| **扑克桌UI渲染** | 中 | 需要自绘六人桌布局（椭圆桌 + 6个座位 + 公共牌区 + 底池显示）。使用CSS/SVG实现，无需Canvas/WebGL。扑克牌渲染可用CSS实现或使用SVG扑克牌素材 |
| **localStorage持久化** | 低 | 对战记录、统计数据序列化为JSON存储。localStorage限制约5MB，足以存储数千手牌记录 |

### Required Libraries & Maturity

| Library | Purpose | Maturity | Risk |
|---|---|---|---|
| `pokersolver` (npm) | 手牌评估与比较 | 成熟（8年+历史，广泛使用） | 低 — 可能需要fork添加TypeScript类型 |
| React 18+ | UI框架 | 非常成熟 | 无 |
| Tailwind CSS | 样式 | 非常成熟 | 无 |
| `i18next` / `react-i18next` | 中英双语 | 非常成熟 | 无 |
| `framer-motion` 或 CSS animations | 牌局动画（发牌、翻牌） | 成熟 | 低 |
| `zustand` 或 `useReducer` | 游戏状态管理 | 成熟 | 无 |

### Browser Compatibility
- 目标：Chrome/Edge/Firefox/Safari 最近2个版本
- 无特殊Web API依赖，纯React渲染，兼容性无忧
- localStorage所有现代浏览器均支持

## Key Insights

1. **竞品的核心弱点是"训练≠对战"** — GTO Wizard和ThinkGTO都侧重单个spot的训练（选一个场景练习），缺乏完整牌局的沉浸感。GTO Idiot应以"完整牌局对战"为核心差异化卖点，让用户在真实牌局节奏中自然学习GTO。→ **PRD建议：优先实现完整的六人桌对战流程，而非孤立的spot训练**

2. **GTO Wizard的即时反馈机制值得借鉴但需简化** — GTO Wizard在每个action后给出blunder/wrong/correct三级标注。对初学者，应进一步简化为直观的颜色标注（绿色=GTO一致，黄色=可接受偏差，红色=严重错误）并附带一句话解释。→ **PRD建议：复盘界面每个决策点用三色系统+简短文字解释GTO理由**

3. **Preflop是初学者最大的学习瓶颈** — 所有竞品都将preflop range chart作为核心功能。六人桌6-max的preflop strategy已被充分解决，可直接使用公开的GTO range数据。→ **PRD建议：内置可视化的13×13 preflop range chart，支持按位置筛选，作为学习参考随时可调出**

4. **BOT风格多样性增加训练价值** — 真实牌桌对手风格各异，纯GTO对手反而不够贴近实战。ThinkGTO只提供GTO对手，而GTO Idiot可提供多种风格BOT。→ **PRD建议：5个BOT分别对应TAG/LAG/Nit/Fish/GTO五种风格，每个BOT有名字和简短描述，用户逐渐学会识别对手类型**

5. **Postflop GTO的简化策略是最大技术挑战** — 完整的postflop GTO需要solver级计算（数十亿节点的博弈树），浏览器端无法实现。但可以使用"基于规则的简化策略"：按牌面类型、位置、SPR等维度给出近似GTO的action建议。→ **PRD建议：Postflop GTO对比标注为"简化GTO参考"，并在UI中明确告知用户这是近似值而非精确解。后续可考虑引入预计算的常见flop texture策略库**

6. **免费+零安装是关键获客优势** — 所有主流竞品都有付费墙（$35-$129/月）或需要下载安装。纯浏览器端、完全免费的定位可以快速获取初学者流量。→ **PRD建议：首页突出"免费、无需注册、打开即玩"的价值主张**

7. **ELO/进度追踪是用户粘性关键** — ThinkGTO的ELO评分系统被用户好评。GTO Idiot的"GTO吻合度"指标可作为类似的进度追踪机制。→ **PRD建议：每局结束显示本局GTO吻合度分数，历史趋势图展示进步轨迹，作为核心留存机制**

8. **观察模式的节奏控制影响学习效果** — BOT行动带短暂停顿可让初学者有时间思考和观察，但需要可调节速度。→ **PRD建议：提供3档速度（慢速观察/正常/快速），默认慢速，每个BOT行动显示1-2秒并高亮当前行动的BOT**

## Risks

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Postflop简化GTO策略准确性不足，被用户质疑 | 中 | 高 | 明确标注"简化GTO参考"；优先保证preflop range的准确性；postflop策略采用保守的、被广泛认可的基本原则 |
| 游戏引擎边界情况多（side pot、all-in equity run-out等） | 中 | 中 | MVP先实现基础场景（无side pot的简单all-in），边界情况标注为后续迭代 |
| localStorage数据量超限（长期使用后） | 低 | 低 | 实现自动清理旧数据策略；保留最近500手记录 |
| pokersolver库缺乏TypeScript类型定义 | 中 | 低 | 自行编写.d.ts声明文件或fork添加类型 |

### Market Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| GTO Wizard推出免费版覆盖初学者场景 | 低 | 高 | 差异化定位：完整对战体验 vs spot训练；中英双语覆盖中文市场 |
| 初学者市场天花板低，用户进阶后转向付费产品 | 中 | 中 | 定位为"入门漏斗"，与进阶产品形成生态互补而非竞争 |

### Dependency Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| 预计算GTO数据的来源和版权问题 | 低 | 中 | Preflop GTO ranges是公开数学结论而非受版权保护的内容 [NEEDS VERIFICATION]；postflop策略基于通用博弈论原则自行构建 |
| pokersolver库不再维护 | 低 | 低 | 库功能简单且稳定，必要时可内化（约500行核心代码） |