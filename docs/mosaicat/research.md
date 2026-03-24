## Market Overview

德州扑克GTO训练工具市场正处于高速增长期。GTO Wizard 作为行业领导者，已覆盖超过数十亿预解决场景，定价 $35-$206/月，表明市场对高质量GTO训练工具有强劲付费意愿。然而，现有工具存在明显的**初学者门槛问题**：PioSOLVER/GTO+ 面向专业玩家，GTO Wizard 免费层功能受限，PokerSnowie 需要桌面安装。

**市场机会**：目前没有一款**免费、纯浏览器、专为初学者设计的GTO练习器**同时提供对战+实时教学+赛后复盘。PokerTrainer.se 最接近但不基于完整GTO解，LibreGTO 免费但无对战模式。GTO Idiot 定位于这个空白——零成本、零安装、教学优先的GTO练习入口。

**目标用户规模**：全球在线扑克活跃玩家估计数千万，其中初学者占大多数。中国德扑社区近年快速增长，对中文GTO学习工具需求尚未被满足 [NEEDS VERIFICATION: 具体市场规模数据]。

## Competitor Analysis

| Competitor | Core Features | Strengths | Weaknesses | Opportunity |
|---|---|---|---|---|
| **GTO Wizard** ($35-206/mo) | Pre-solved GTO数据库、Trainer模式、Hand History分析、PokerArena竞技、视频教程 | 行业最全功能集；Web+移动+桌面全平台；数十亿场景覆盖；实时GTO反馈 | 免费层postflop极度受限；高级功能昂贵($62+/mo)；功能过多对初学者可能overwhelming | **价格门槛**：GTO Idiot完全免费，零付费墙；**教学优先**：简化界面专注初学者，不堆砌专业功能 |
| **PokerSnowie** ($99-230/yr) | 神经网络AI对战、实时建议、手牌导入分析、详细错误报告 | AI对手提供真实练习体验；神经网络自学习而非查表；22万+用户 | 仅桌面端（Windows/Mac安装）；界面过时对初学者不友好；非真正GTO（神经网络近似）；仅支持NL Hold'em | **零安装**：纯浏览器即用；**真正GTO基准**：使用预计算GTO策略表而非近似；**现代UI**：教学导向的友好界面 |
| **PokerTrainer.se** (Free/Premium) | 浏览器练习、即时反馈、等级进度、Preflop范围图、赔率计算器 | 最低使用门槛；免费无需注册即可试用；跨设备同步；初学者友好 | 每日手数限制（免费层）；非完整GTO解（简化策略）；无BOT对战模拟；无完整牌局流程；复盘功能有限 | **完整牌局体验**：不是碎片化练习而是完整六人桌对战；**GTO对比复盘**：逐手回放标注GTO偏差；**多风格BOT**：模拟真实牌桌动态 |
| **Simple GTO Trainer** ($50-150 one-time) | CFR solver、预计算解决方案包、特定场景钻取练习、EV分析 | 一次性购买无订阅；专业级solver；预计算方案包可用 | 仅Windows桌面；学习曲线高；无手牌历史导入；需要扑克知识基础 | **Web可用**：无需安装；**引导式学习**：不假设用户已有GTO知识 |
| **LibreGTO** (Free, MIT) | 免费开源、Preflop范围、位置玩法、手牌强度、权益计算 | 完全免费开源；浏览器使用；MIT许可 | 无postflop solver；无对战模式；教育功能有限；深度不足 | **全街覆盖**：Preflop到River完整对战；**对战+复盘**：不仅学理论还能实践验证 |

## Technical Feasibility

- **Overall: MEDIUM-HIGH**

### Key Challenges and Mitigation

| Challenge | Difficulty | Mitigation |
|---|---|---|
| **GTO策略数据构建** | HIGH | 最大技术挑战。完整GTO解需要TB级计算资源。**缓解方案**：(1) MVP仅覆盖最常见spot（按位置×有效筹码深度×简化动作树），估计覆盖Preflop全量 + Postflop Top 200-500个常见场景；(2) 使用简化的动作抽象（3个bet sizing而非连续sizing）；(3) Preflop数据可参考公开的GTO preflop chart（6-max范围已被广泛研究和公开）；(4) Postflop数据使用开源solver（TexasSolver）离线预计算后打包为JSON |
| **BOT AI 决策引擎** | MEDIUM | 需要实现5种不同风格的BOT。**缓解方案**：基于规则引擎+参数化设计（VPIP/PFR/AF等风格参数），不需要真实GTO计算。TAG/LAG/Fish等风格用概率权重调整即可 |
| **牌局状态机** | MEDIUM | 完整的六人桌NL Hold'em状态管理（盲注、底池、side pot、all-in等）。**缓解方案**：可使用 `poker-ts` 库作为状态机基础，或自建轻量状态机 |
| **GTO策略数据体积** | MEDIUM | 预计算策略表可能很大。**缓解方案**：(1) 数据压缩（策略频率用uint8编码而非float64）；(2) 按需lazy loading；(3) 使用trie/hash索引减少冗余；(4) MVP限制覆盖范围控制在10-50MB |
| **复盘回放引擎** | LOW-MEDIUM | 需要完整记录和回放每个决策点。**缓解方案**：每手牌记录为结构化事件流（action log），回放是确定性重放 |
| **教学UI** | LOW-MEDIUM | 大量注释、提示、GTO可视化。**缓解方案**：React组件化设计，Tailwind CSS快速样式 |

### Required Libraries and Maturity

| Library/Technology | Purpose | Maturity | Risk |
|---|---|---|---|
| `poker-evaluator-ts` | 手牌评估（Two Plus Two算法） | ✅ 成熟，~22M hands/sec | Low |
| `pokersolver` | 手牌比较和排名 | ✅ 成熟，Browser+Node | Low |
| `poker-ts` | 牌桌状态机 | ⚠️ 可用但可能需要定制 | Medium — 可能需要fork或自建 |
| IndexedDB (Dexie.js) | 本地数据持久化 | ✅ 成熟 | Low |
| React 18+ / TypeScript | 前端框架 | ✅ 成熟 | Low |
| Tailwind CSS | 样式系统 | ✅ 成熟 | Low |
| Custom GTO JSON data | GTO策略表 | ❌ 需自建 | HIGH — 这是最大的内容风险 |

### Browser Compatibility
- 目标：现代浏览器（Chrome 90+, Firefox 90+, Safari 15+, Edge 90+）
- IndexedDB：所有现代浏览器支持
- 无WASM依赖（MVP不做实时solver）
- 无WebGL依赖（2D UI即可）
- 预计无兼容性问题

## Key Insights

1. **GTO策略数据是核心壁垒也是最大风险**：完整GTO解不可能在前端实时计算，也没有可用的开源预计算数据集。→ **PRD建议**：MVP的GTO数据采用分层策略——Preflop使用公开的标准6-max GTO范围（已被广泛研究），Postflop使用简化的"常见spot策略指南"（按翻牌面纹理分类的通用策略），标注数据精度等级。明确告知用户这是"simplified GTO"而非solver精确解。

2. **市场空白在"免费+浏览器+初学者+完整牌局"的交叉点**：GTO Wizard功能强但贵，PokerTrainer.se免费但碎片化，没有产品同时满足这四个条件。→ **PRD建议**：将"零门槛"作为核心定位——无注册、无付费、无安装，打开即玩。首屏体验必须在30秒内让用户进入第一手牌。

3. **BOT风格多样性是教学价值的关键差异化**：PokerTrainer.se和大多数trainer只有单一对手风格，无法模拟真实牌桌动态。→ **PRD建议**：实现至少4种BOT风格（TAG/LAG/Fish/Nit），每种风格用可见标签展示，让用户理解不同对手类型。这是区别于竞品的核心教学功能。

4. **实时GTO提示是初学者最需要的功能，但需要分级**：GTO Wizard的反馈对初学者可能信息过载。→ **PRD建议**：实现3级提示系统——Level 1: 仅显示"推荐动作"（Fold/Call/Raise）；Level 2: 显示推荐动作+简短理由；Level 3: 显示完整GTO混合策略频率。默认Level 1，用户可切换。

5. **复盘功能的EV loss可视化是学习闭环的关键**：GTO Wizard的Analyzer是付费墙后最受欢迎的功能。→ **PRD建议**：每手牌结束后显示"GTO得分"（基于EV loss计算），复盘界面用红/黄/绿色标注每个决策点的偏差程度。这是免费产品中独有的功能。

6. **`poker-ts`库可加速游戏引擎开发但需评估适配性**：该库提供TypeScript状态机，但可能不完全匹配六人桌+BOT的需求。→ **PRD建议**：技术选型时先评估`poker-ts`适配度，如不满足则自建轻量状态机（德扑状态机逻辑清晰，自建工作量可控，约2-3天）。

7. **数据体积需要控制在合理范围以保证首次加载体验**：预计算GTO数据可能膨胀到数百MB。→ **PRD建议**：设定严格的数据预算——Preflop策略表 < 2MB，Postflop策略数据 < 20MB（lazy loaded）。超出预算时优先砍覆盖范围而非降低精度。

8. **中文本地化是差异化优势**：现有主流GTO工具（GTO Wizard, PokerSnowie等）均以英文为主，中文支持有限或无。→ **PRD建议**：MVP默认中文界面（含术语双语标注），所有GTO提示和教学内容使用中文。这在中文德扑社区中是独特优势。

## Risks

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| GTO数据精度不足导致教学误导 | HIGH | HIGH | 明确标注数据精度等级；Preflop使用成熟公开范围；Postflop标注为"simplified GTO guidance"；设置用户反馈机制 |
| Postflop GTO数据覆盖不足（常见场景遗漏） | HIGH | MEDIUM | MVP聚焦Top 100-200最常见flop纹理；未覆盖场景显示"此场景暂无GTO数据"而非猜测 |
| BOT AI行为不自然导致练习价值降低 | MEDIUM | MEDIUM | 基于真实玩家统计数据调校BOT参数；用户可调整BOT难度 |
| 前端性能问题（大量GTO数据+复杂UI） | LOW | MEDIUM | Lazy loading + Web Worker处理GTO查询 + 虚拟列表优化历史记录 |
| `poker-ts`库不满足需求需要自建 | MEDIUM | LOW | 工作量可控（~2-3天），德扑状态机逻辑清晰 |

### Market Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| GTO Wizard推出免费层扩展覆盖同类功能 | MEDIUM | HIGH | 差异化定位（教学优先+中文+完全免费）；快速迭代建立用户基础 |
| 目标用户（初学者）对GTO概念接受度低 | MEDIUM | MEDIUM | 渐进式教学设计；先教直觉再引入GTO术语；游戏化元素增加粘性 |

### Dependency Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `poker-evaluator-ts`停止维护 | LOW | LOW | Two Plus Two算法稳定，必要时可内联核心逻辑 |
| IndexedDB浏览器兼容性/限制 | LOW | LOW | 所有现代浏览器支持；数据量不大无配额风险 |
| 无成熟开源GTO数据源 | CERTAIN | HIGH | 这是已确认风险。需自建简化GTO数据集——Preflop参考公开chart，Postflop使用规则化的策略简化 |
