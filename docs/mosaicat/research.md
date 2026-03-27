## Market Overview

德州扑克GTO训练工具是一个成熟且活跃的市场。2026年，GTO Wizard 已成为行业领导者，月活跃用户覆盖从初学者到职业选手。市场呈现明显的分层：

- **高端Solver市场**（PioSolver、MonkerSolver）：面向职业选手，售价$200+，需要高端硬件
- **中端训练平台**（GTO Wizard、GTOBase、PokerSnowie）：$35-150/月订阅制，覆盖学习+训练+分析
- **低端/免费工具**（Solver+移动端、免费翻前范围表）：功能有限，主要是翻前范围查询

**市场缺口**：目前没有一款产品提供"免费/低成本的6人桌BOT对战 + 赛后GTO复盘"的组合体验。现有工具要么是纯Solver（输入场景，输出策略），要么是训练模式（单个决策点练习），缺少完整牌局对战+事后逐手复盘的闭环体验。GTO Idiot 瞄准的是"先打后学"这个差异化切入点。

## Competitor Analysis

| Competitor | Core Features | Strengths | Weaknesses | Opportunity |
|---|---|---|---|---|
| **GTO Wizard** ($39+/月) | 1000万+预解场景库、Trainer模式（单决策点练习）、手牌分析、1v1对战(PokerArena)、手牌历史上传 | 业界最全的GTO解决方案库；Trainer模式评分系统成熟（Best/Correct/Inaccuracy/Wrong/Blunder）；支持3-way场景；UI精美 | 价格高（$39/月起）；Trainer是单决策点而非完整牌局；初学者学习曲线陡峭；需要一定扑克基础才能有效使用 | GTO Idiot提供免费的完整牌局体验，"先打完再复盘"更符合初学者学习习惯；不需要理解solver概念即可开始 |
| **PokerSnowie** ($99-230/年) | 神经网络AI对手、自定义场景训练、实时GTO建议、手牌分析、现金桌+锦标赛支持 | 价格相对合理；AI对手模拟真实人类决策；支持自定义场景训练 | 界面被评价为对初学者过于复杂（2026评分6/10）；桌面应用需安装；GTO策略基于神经网络近似而非精确解 | GTO Idiot的Web无安装体验+极简UI+初学者友好定位是明确差异化 |
| **GTOBase** ($150/月) | 22100种flop全解、GTO Trainer多模式训练、手牌历史分析、AI对战(MTT/HU/6-Max/Spin&Go) | 覆盖几乎所有扑克格式；Trainer有实时反馈；手牌历史分析功能强大 | 价格极高（$150/月）；面向有经验玩家；浏览器应用但UI偏专业 | 价格是最大差异——GTO Idiot定位免费/低成本，覆盖GTOBase高价位无法触达的初学者人群 |
| **Solver+** (移动App，免费+内购) | 完整翻前范围表、翻后solver输出、6-max现金桌多种筹码深度 | 移动端便捷；免费基础功能；界面简洁 | 仅查询工具，没有对战/练习模式；没有手牌记录和复盘；被动学习 | GTO Idiot提供主动学习体验（打牌→复盘），比被动查表更有效 |
| **wasm-postflop** (开源免费) | 浏览器端GTO Solver、WebAssembly多线程、Discounted CFR算法 | 完全免费开源；浏览器端运行无需安装；算法先进 | 开发已暂停（2023年10月）；纯Solver工具无训练模式；需要用户自行设置场景；AGPL-3.0许可证限制 | 技术参考价值高，但产品定位完全不同；GTO Idiot提供的是完整产品体验而非Solver工具 |

## Technical Feasibility

- **Overall: HIGH**
- 核心功能（牌局引擎、BOT决策、GTO范围表、复盘UI）均可在React+TypeScript+Node.js技术栈内实现，无需依赖外部Solver或特殊硬件。

### Key Challenges & Mitigation

| Challenge | Difficulty | Mitigation |
|---|---|---|
| **牌局引擎实现** | 中 | 多个成熟npm库可用：`poker-ts`（TypeScript原生）、`@chevtek/poker-engine`（完整状态机）。建议基于现有库构建或参考其架构自行实现，以保持对下注逻辑的完全控制 |
| **手牌评估** | 低 | `pokersolver`（生产验证，用于CasinoRPG）或`poker-evaluator`（Two Plus Two算法，22M hands/sec）均可直接使用 |
| **简化GTO策略表** | 中-高 | 这是最核心的领域挑战。需要内置翻前范围表（6个位置 × 多种场景）和翻后简化决策树。翻前数据可从公开的简化GTO范围表整理（13×13矩阵，约169种组合×6位置×多种动作场景）。翻后策略需要大幅简化——建议基于牌面纹理分类（干燥/湿润/配对）+ SPR区间 + 位置的决策矩阵 |
| **BOT AI决策** | 中 | 基于GTO策略表+风格参数偏移。TAG/LAG/Fish风格通过调整翻前范围宽度、下注频率、bluff频率等参数实现。不需要实时计算，只需查表+参数调整 |
| **EV差异计算** | 中-高 | 复盘时需要计算用户选择vs GTO选择的EV差异。简化方案：翻前可基于范围对范围的equity计算；翻后可基于简化策略树的期望值差。不需要solver级精度，但需要合理近似 |
| **牌桌UI渲染** | 中 | React + CSS/Canvas实现6人桌布局、发牌动画、筹码变化。可使用CSS动画或轻量Canvas库，无需3D渲染 |

### Required Libraries & Maturity

| Library/Tool | Purpose | Maturity | Risk |
|---|---|---|---|
| `pokersolver` | 手牌评估和比较 | 高（生产验证，CasinoRPG使用中） | 低 |
| `poker-ts` / `@chevtek/poker-engine` | 牌局引擎参考 | 中（TypeScript原生，但可能需要扩展） | 中——建议参考架构自行实现完整引擎以确保6-max规则完全正确 |
| React + TypeScript + Tailwind | 前端UI | 极高 | 低 |
| Node.js + Express/Fastify | 后端API | 极高 | 低 |
| SQLite / PostgreSQL | Hand History持久化 | 极高 | 低 |

### Browser Compatibility

- 现代浏览器全面支持（Chrome、Firefox、Safari、Edge）
- 无WebAssembly或WebGL依赖，兼容性风险极低
- CSS动画和Canvas API在所有现代浏览器上表现一致

## Key Insights

1. **"先打后学"是未被充分服务的学习模式** — 现有GTO工具以"先学后练"为主（查solver→练单点），但初学者更适合"先打完整牌局→事后逐手复盘"的体验式学习。GTO Idiot应将完整牌局体验作为核心卖点，复盘界面作为学习闭环。→ PRD应强调牌局流畅度优先，复盘界面是第二核心功能。

2. **GTO Wizard的评分系统值得借鉴但需简化** — GTO Wizard的5级评分（Best/Correct/Inaccuracy/Wrong/Blunder）对初学者认知负担过重。GTO Idiot应采用3级简化评分（✅最优 / ⚠️可接受 / ❌错误）+ 自然语言解释。→ PRD中复盘功能应包含简化评分机制和中文解释文案。

3. **翻前范围表是MVP可行的GTO数据核心** — 完整GTO策略需要solver级计算（不可行），但简化的翻前范围表（13×13矩阵，去除混合策略后的纯策略版本）是公开可得且足够MVP使用的。翻后策略需大幅简化为基于牌面纹理分类的决策矩阵。→ PRD应明确：翻前GTO对比精度高，翻后GTO对比为近似参考，UI中需标注精度级别。

4. **BOT风格差异化是提升趣味性的关键** — 5个BOT如果都打GTO会非常无聊。TAG/LAG/Fish等风格通过参数偏移实现（范围宽度±15%、下注频率±20%、bluff频率±25%），让每手牌体验不同。→ PRD中BOT设计应包含明确的风格参数定义和玩家可见的风格标签。

5. **价格是最大的差异化武器** — GTO Wizard $39/月、GTOBase $150/月、PokerSnowie $99/年。GTO Idiot作为免费/低成本工具，直接覆盖这些产品无法触达的价格敏感用户群（初学者、休闲玩家）。→ PRD应明确MVP为完全免费，未来可考虑高级功能付费。

6. **Hand History标准格式有助于未来扩展** — 扑克行业有标准的Hand History格式（PokerStars格式广泛使用）。即使MVP不支持导入/导出，内部存储采用结构化格式有利于未来添加导出功能和与其他工具互通。→ 技术规范应定义结构化的hand history数据模型。

7. **牌局引擎建议自行实现而非依赖第三方库** — 现有npm poker引擎库（poker-ts、@chevtek/poker-engine）虽然可用，但6-max现金桌的完整规则（side pot、all-in equity run-out、blinds rotation等）需要精确控制。自行实现可确保规则完全正确且易于扩展。手牌评估可使用`pokersolver`库。→ 技术规范应将牌局引擎列为核心自研模块。

8. **复盘界面应支持"时间轴导航"而非纯列表** — 竞品的手牌分析多为列表式回放。更好的初学者体验是可视化时间轴（翻前→翻牌→转牌→河牌），每个节点显示牌面状态+决策对比。→ PRD复盘功能应指定时间轴式UI而非纯文本列表。

## Risks

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **翻后GTO策略简化过度导致建议不合理** | 中 | 高——用户信任度受损 | 翻后策略分层实现：先覆盖高频场景（c-bet、check-raise），复杂场景标注"近似参考"；UI明确区分翻前（精确）和翻后（近似）的置信度 |
| **EV计算不够准确** | 中 | 中——影响复盘价值 | MVP阶段使用简化EV模型（基于手牌equity vs 范围），标注为"估算EV"；后续版本可引入更精确的计算 |
| **牌局引擎规则边界情况** | 中 | 高——影响游戏公平性 | 编写完整的单元测试覆盖所有边界情况（split pot、side pot、all-in、disconnection等）；参考PokerStars规则文档 |
| **6人桌UI在小屏幕上布局困难** | 低 | 中——MVP不要求移动端适配 | 先做桌面端响应式布局（最小宽度1024px），移动端适配作为后续版本 |

### Market Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **GTO Wizard推出免费层覆盖类似功能** | 中 | 高 | 差异化定位于"完整牌局对战+复盘"而非"solver查询"；GTO Wizard的免费层功能有限且不包含完整牌局模式 |
| **初学者可能不理解GTO概念，导致复盘价值不被感知** | 中 | 中 | 复盘界面加入"GTO小课堂"——每个决策点用1-2句话解释为什么GTO推荐这个动作 |

### Dependency Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **`pokersolver`库停止维护** | 低 | 低——手牌评估逻辑稳定，即使不更新也可持续使用 | 必要时fork并维护 |
| **简化GTO策略表数据质量** | 中 | 高——直接影响产品核心价值 | 基于多个公开来源交叉验证；首先覆盖翻前范围（数据可靠），翻后策略逐步补充 |
