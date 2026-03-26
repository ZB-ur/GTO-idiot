## Market Overview

德州扑克GTO训练器市场正处于成熟增长期。GTO Wizard、DTO Poker、GTOBase等主流产品均采用**订阅制SaaS模式**，月费$35-$129不等，面向中高级玩家。市场存在一个明显缺口：**免费/低门槛的初学者GTO练习工具**。现有产品要么价格高昂（GTO Wizard Premium $69/月），要么界面复杂不适合新手。

GTO Idiot的机会在于：纯前端、零成本部署、专注初学者的GTO练习器，填补"免费+简单+有实战感"的市场空白。

## Competitor Analysis

| Competitor | Core Features | Strengths | Weaknesses | Opportunity |
|---|---|---|---|---|
| **GTO Wizard** ($39-$129/月) | AI solver、preflop/postflop range explorer、GTO trainer（限10手/天免费）、手牌分析 | 业界最全面的GTO解决方案；UI精美；支持Web+移动端；社区庞大 | 价格高昂，免费版极度受限（10手/天）；功能过于复杂，初学者上手困难；无完整牌局对战体验 | GTO Idiot提供**完整6人桌对战体验**而非孤立场景练习；完全免费；专注初学者友好的解释 |
| **DTO Poker** (~$15-$30/月) | GTO bot对战、即时反馈、策略探索器、虚拟教练解释、Cash/MTT模式 | 有实际对战体验；虚拟教练提供解释；支持3-way模拟（独家）；beginner tier设计 | 仍需付费订阅；仅提供固定"spots"而非完整牌局；被评价为"黑盒"缺乏透明解释；31个场景（初级版）有限 | GTO Idiot提供**连续完整牌局**而非离散场景；复盘解释更透明；完全免费无订阅门槛 |
| **FreeBetRange** (Free+Premium) | Preflop range builder、GTO chart库、game-like simulator练习、range管理 | 免费版功能较多；preflop范围全面；浏览器直接使用；包含简化GTO chart | 仅关注preflop阶段；无postflop对战；无完整牌局体验；UI偏工具向非游戏向 | GTO Idiot覆盖**完整4条街**的对战+复盘；游戏化体验更强 |
| **Fearless River** (WPT GTO Trainer) | 预解好的手牌场景、即时GTO反馈、漏洞识别 | WPT品牌背书；场景质量高 | 预设场景有限；无自由对战；需付费 | GTO Idiot提供自由的6人桌对战而非固定场景 |
| **GTO Sensei** (Mobile) | 移动端GTO训练、preflop drill | 移动端体验好 | 功能单一；仅preflop；无Web版 | GTO Idiot为Web端完整体验 |

## Technical Feasibility

- **Overall: MEDIUM-HIGH**

### Key Challenges & Mitigations

| Challenge | Difficulty | Mitigation |
|---|---|---|
| **GTO策略近似算法** | HIGH | 不实现完整solver。采用**预计算策略表**方案：预设各位置的preflop opening range（基于公开简化GTO图表，将混合频率四舍五入到0/25/50/75/100%）+ postflop基于pot odds和board texture的启发式决策树。这是核心技术挑战 |
| **扑克游戏引擎** | MEDIUM | 自实现NL Hold'em规则引擎（发牌、下注轮次、showdown）。规则确定性强，复杂度可控。6-max固定盲注简化了很多边界情况 |
| **手牌评估** | LOW | 成熟npm库可用：`pokersolver`（浏览器兼容，支持5-7张牌评估）或 `poker-evaluator-ts`（TypeScript原生，Two Plus Two算法，22M手/秒） |
| **复盘对比系统** | MEDIUM | 记录每个决策点的game state，重放时将用户action与GTO推荐action对比。需要设计清晰的hand history数据结构 |
| **localStorage持久化** | LOW | 标准Web API，但需注意5MB限制。约可存储~2000-5000手牌历史（JSON格式），MVP足够 |

### Required Libraries & Maturity

| Library | Purpose | Maturity | Notes |
|---|---|---|---|
| `pokersolver` (npm) | 手牌比较和胜负判定 | ★★★★☆ 成熟 | 浏览器+Node双端兼容，GitHub 300+ stars |
| `poker-evaluator-ts` (npm) | TypeScript手牌评估 | ★★★☆☆ 稳定 | TypeScript原生，基于Two Plus Two算法 |
| React + TypeScript | UI框架 | ★★★★★ 非常成熟 | 标准技术栈，无风险 |
| Tailwind CSS | 样式 | ★★★★★ 非常成熟 | 标准技术栈，无风险 |
| 自实现：GTO策略表 | 简化GTO近似 | N/A（自建） | 基于公开简化GTO范围表，hardcode为JSON数据 |
| 自实现：游戏引擎 | 牌局逻辑 | N/A（自建） | NL Hold'em规则自实现，约1000-2000行代码 |

### Browser Compatibility

- 纯前端React应用，所有现代浏览器完全兼容
- localStorage为Web标准API，兼容性无忧
- 无WebGL/Canvas硬性依赖（UI可用纯CSS/SVG实现扑克桌和牌面）

## Key Insights

1. **竞品全部采用"离散场景"模式，GTO Idiot应主打"连续牌局"体验** — GTO Wizard/DTO/Fearless River都是让用户在预设场景中做单次决策。GTO Idiot的核心差异化是提供**完整6人桌连续对战**，让初学者感受真实牌局节奏。→ PRD应将"连续牌局对战"作为F-001核心Feature，而非场景练习模式。

2. **简化GTO范围表应采用"频率四舍五入到25%"的业界标准做法** — Red Chip Poker和FreeBetRange等平台已验证：将混合频率（如raise 73%/fold 27%）简化为最近25%增量（raise 75%/fold 25%）对初学者足够准确。→ PRD中BOT策略精度定义应明确采用此简化标准，降低实现复杂度。

3. **复盘解释是初学者最大痛点，DTO的"黑盒"问题是警示** — DTO被用户批评为只告诉"你错了"但不解释"为什么错"。GTO Idiot的复盘必须包含：(a) 用户操作 vs GTO推荐操作对比 (b) **简短文字解释为什么GTO推荐该操作**（如"在CO位置，A5s属于开局范围，fold是过紧的偏离"）。→ PRD复盘Feature应明确包含"解释层"，不仅标注对错。

4. **Preflop阶段的GTO数据公开且标准化，Postflop需要简化启发式** — Preflop各位置的GTO opening/3bet/call范围有大量公开数据可直接使用。Postflop的GTO策略计算极其复杂（完整solver需要TB级计算），MVP应采用简化启发式：基于pot odds、board texture（dry/wet）、SPR（stack-to-pot ratio）的规则化决策。→ PRD应将Preflop和Postflop的GTO精度分层定义：Preflop高精度（基于标准范围表），Postflop中等精度（启发式近似）。

5. **手牌评估有成熟TypeScript库，不需要自实现** — `poker-evaluator-ts`提供TypeScript原生支持，基于Two Plus Two算法，性能22M手/秒，完全满足浏览器端需求。→ 技术规格应明确使用此库而非自实现手牌评估。

6. **localStorage的5MB限制约束了手牌历史存储量** — JSON格式的单手牌历史约1-2KB，5MB可存约2500-5000手。对MVP期的练习用途足够，但应设计数据管理策略（如自动清理最旧记录、导出功能）。→ PRD应包含手牌历史的存储上限提示和基本数据管理Feature。

7. **6-max位置差异是初学者最需要理解的GTO概念** — 所有竞品都强调位置（UTG到BTN）对策略的影响。GTO Idiot的座位选择功能应突出展示不同位置的策略差异。→ PRD座位选择Feature应支持用户切换位置，并在复盘中标注位置相关的策略要点。

8. **免费+浏览器直接使用是最强获客优势** — GTO Wizard免费版仅10手/天，DTO需月费$15+。GTO Idiot完全免费+无需注册+浏览器直接使用，对初学者的转化率将显著高于竞品。→ PRD应明确"零门槛"作为产品原则，不设任何使用限制。

## Risks

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Postflop GTO近似精度不足，导致BOT策略明显不合理** | MEDIUM | HIGH | 采用保守启发式（偏向check/fold），辅以board texture分类。在UI中明确标注"近似GTO策略"而非"精确GTO" |
| **游戏引擎边界情况（all-in、side pot、multiple raises）实现复杂** | MEDIUM | MEDIUM | MVP先限制raise cap（3-bet cap），side pot作为已知简化。逐步完善 |
| **手牌历史数据结构设计不当导致复盘功能受限** | LOW | HIGH | 前期设计好action-level的hand history schema，记录每个决策点的完整game state |

### Market Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **初学者可能认为"简化GTO"不权威** | MEDIUM | MEDIUM | 明确产品定位为"练习器"而非"solver"，在UI中说明简化方法论 |
| **GTO Wizard推出免费tier扩大** | LOW | MEDIUM | 差异化竞争：完整牌局体验 vs 离散场景练习 |

### Dependency Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **pokersolver/poker-evaluator-ts库停止维护** | LOW | LOW | 这些库功能稳定（扑克规则不会变），即使停止维护也可继续使用。必要时fork |
| **localStorage API限制或浏览器策略变更** | VERY LOW | MEDIUM | 标准Web API，短期内不会有breaking change |