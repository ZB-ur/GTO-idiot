## Market Overview

Texas Hold'em GTO 训练工具市场正处于快速增长期，GTO Wizard 以浏览器端预计算解决方案库主导市场（月活跃用户估计数十万级），高端订阅价格达 $206/月。市场呈现明显分层：

- **高端（$100+/月）**：GTO Wizard、PioSOLVER —— 面向职业/半职业玩家
- **中端（$10-30/月）**：DTO Poker、PokerSnowie —— 面向进阶玩家
- **免费/低成本**：Poker Trainer、Optima —— 功能极其基础，缺乏实战对比

**机会点**：免费/低成本浏览器端细分市场存在显著空白。现有免费工具要么仅提供静态 range 图表，要么缺少完整的游戏引擎 + GTO 对比功能。GTO Idiot 可以填补"免费 + 完整牌局 + 即时 GTO 复盘"的空白，成为初学者入门 GTO 学习的首选工具。

## Competitor Analysis

| Competitor | Core Features | Strengths | Weaknesses | Opportunity |
|---|---|---|---|---|
| **GTO Wizard** | 1000万+ 预解场景、Practice Mode、Hand Analyzer、PokerArena 对战、聚合报告 | 最大的预计算库；浏览器端无需安装；优秀的 UX 和 gamification；覆盖 Cash/MTT/Spins 全格式 | 高价（$35-206/月）；免费版功能极受限；偏向"学习"而非"实战"；初学者容易被海量数据淹没 | GTO Idiot 免费提供完整牌局体验 + 简化的 GTO 对比，降低入门门槛 |
| **PokerSnowie** | AI Challenge Mode、场景模拟、手牌历史导入分析、Preflop 建议表 | 神经网络方法产生实用建议；手牌历史分析找漏洞；价格比 GTO Wizard 低 | 非真正 GTO（神经网络近似）；仅 Windows 桌面端；功能集较小；界面过时；评分仅 6/10 | GTO Idiot 浏览器端跨平台 + 真正基于 GTO range 数据 |
| **PioSOLVER** | 实时纳什均衡求解器、完全自定义 game tree、EV/频率输出、Nodelock 剥削策略 | 行业金标准准确度；一次性购买（$249+）；职业选手和教练信赖 | 仅 HU（无多人）；学习曲线极陡；需要强力硬件；仅 Windows；纯分析工具无训练模式 | GTO Idiot 面向初学者，提供"玩中学"体验而非纯分析工具 |
| **DTO Poker** | 免费 Preflop Range、GTO Bot 对战、虚拟教练解释、手机优先 | 免费 preflop 永久可用；移动端体验好；职业选手创建，内容权威 | 移动端优先，Web 体验次要；Postflop 需付费；社区较小 | GTO Idiot 专注 Web 端完整六人桌体验，而非移动端碎片化训练 |
| **Poker Trainer** | 5 种训练练习/测验、GTO Range 练习、跨平台 | 完全免费；简单轻量；适合初学者 | 功能极基础；无完整牌局模拟；无对战体验；无复盘功能 | GTO Idiot 在同等价位（免费）提供完整游戏 + 复盘，远超其功能 |

## Technical Feasibility

- **Overall: HIGH**（Preflop GTO 对比）/ **MEDIUM**（Postflop 简化 GTO 对比）

### 关键技术挑战与缓解策略

1. **德州扑克游戏引擎（难度：中）**
   - 需实现完整的发牌、下注轮、底池计算、showdown 判定
   - **缓解**：TypeScript 生态有成熟的手牌评估库（`pokersolver`、`poker-evaluator-ts`），game loop 逻辑可参考开源项目 `node-poker`、`poker-holdem-engine`
   - 核心模块：Deck → Dealer → BettingRound → PotCalculator → HandEvaluator → Showdown

2. **GTO 预计算数据（难度：中-高）**
   - **Preflop（可行）**：169 个起手牌 × 6 位置 × ~4 actions × 频率 = 几百 KB，完全可嵌入前端
   - **Postflop（需简化）**：完整 postflop GTO 数据需要 TB 级存储，不可能纯前端承载
   - **缓解策略**：MVP 阶段 postflop 使用规则化的简化策略（基于 SPR/底池赔率/牌面类型的决策树），而非精确 GTO 解。标注为"简化 GTO 建议" [NEEDS VERIFICATION: 是否对初学者足够有用需要用户验证]

3. **BOT AI 决策（难度：中）**
   - BOT 需要基于 GTO 策略进行合理决策
   - **缓解**：Preflop 直接查表（range chart）；Postflop 使用基于规则的简化策略（c-bet 频率、check-raise 频率等硬编码参数），足以为初学者提供有意义的对手

4. **手牌评估性能（难度：低）**
   - `pokersolver` 或 `phe` 库在浏览器端评估速度足够（每秒可评估数十万手）
   - Two Plus Two 查找表算法在 WebAssembly 中可达到 C++ 级性能

### 所需库与成熟度

| 库 | 用途 | 成熟度 | 备注 |
|---|---|---|---|
| `pokersolver` | 手牌评估、比较 | ⭐⭐⭐⭐ 成熟 | 支持 7 张牌评估，浏览器/Node 双端 |
| `poker-evaluator-ts` | TypeScript 手牌评估 | ⭐⭐⭐ 中等 | TS 原生，Two Plus Two 算法 |
| React + TypeScript | UI 框架 | ⭐⭐⭐⭐⭐ 成熟 | 项目约束 |
| Tailwind CSS | 样式 | ⭐⭐⭐⭐⭐ 成熟 | 项目约束 |
| Zustand 或 useReducer | 状态管理 | ⭐⭐⭐⭐⭐ 成熟 | 游戏状态复杂，建议用 Zustand |
| localStorage | 持久化 | ⭐⭐⭐⭐⭐ 原生 | 5-10 MB 限制，足够存数千手历史 |

### 浏览器兼容性

- 纯 React + TS + Tailwind，所有现代浏览器（Chrome/Firefox/Safari/Edge）完全支持
- 无 WebAssembly/WebGL 依赖，兼容性风险极低
- localStorage 在所有目标浏览器中可用（隐私模式下可能受限，需处理降级）

## Key Insights

1. **Preflop GTO 数据是 MVP 的核心差异化要素，且技术完全可行**：完整 6-max preflop range 数据仅需几百 KB，可内嵌到前端 bundle。这使得"每手牌结束后对比你的 preflop 决策 vs GTO 推荐"成为零成本功能。→ **PRD 建议：MVP 必须包含完整的 preflop GTO action 对比，覆盖所有 6 个位置和常见场景（open/3bet/call）**

2. **Postflop GTO 对比需大幅简化，避免陷入求解器泥潭**：GTO Wizard 用了 10M+ 预计算场景和 87M 节点的 game tree，这不是前端独立应用可以复制的。但初学者不需要精确到频率百分比的 GTO——他们需要的是"这个 spot 应该 bet 还是 check"级别的方向性建议。→ **PRD 建议：Postflop GTO 用基于规则的简化建议（如"在干燥牌面 IP c-bet 较多，在湿润牌面 check 较多"），明确标注为"简化 GTO 参考"而非精确解**

3. **市场在"免费 + 完整牌局 + GTO 对比"的交叉点存在真空**：GTO Wizard 有完整 GTO 但昂贵；Poker Trainer 免费但无实战；DTO 有实战但偏移动端且 postflop 收费。GTO Idiot 的定位是"免费的 GTO 入门实战训练器"。→ **PRD 建议：强调"零成本入门"和"边打边学"作为核心卖点，不追求 GTO 精度而追求学习体验**

4. **BOT 行为直接影响学习效果，需要分级设计**：如果 BOT 完全按 GTO 打，初学者会被碾压失去信心；如果 BOT 打得太弱，学不到东西。→ **PRD 建议：MVP 的 BOT 使用基于 GTO range 的决策但加入可控的随机偏差，让初学者有合理胜率（约 40-50%），同时仍能展示 GTO 概念** [NEEDS VERIFICATION: 具体胜率平衡需要 playtesting]

5. **复盘界面是用户留存的关键差异化功能**：现有免费工具几乎都缺乏结构化的"每手牌 GTO 对比"视图。简单展示"你的操作 vs GTO 推荐操作"就能提供巨大价值。→ **PRD 建议：每手牌结束后自动弹出简洁的决策对比卡片（你的 action / GTO action / 位置 / 手牌），而非需要用户主动去查看**

6. **六人桌位置系统是教学的天然框架**：GTO 策略本质上是 position-based 的，6-max 的 UTG→BB 位置系统天然提供了学习路径（从紧位开始学习逐渐到宽位）。→ **PRD 建议：在 GTO 复盘中突出位置信息，帮助用户理解"为什么在 UTG 要比 BTN 打得更紧"**

7. **localStorage 的 5-10MB 限制足够 MVP 但需要设计数据清理策略**：每手牌的历史记录（52 张牌 + actions + 结果）约 1-2 KB，可存数千手。但长期使用可能触及限制。→ **PRD 建议：实现自动清理策略（保留最近 N 手 + 统计摘要），并在接近存储限制时提示用户**

8. **扑克牌 UI 有成熟的设计模式，不需要从零设计**：CSS-only 扑克牌渲染、SVG 牌面都有现成方案。关键 UI 挑战是在移动端小屏幕上清晰展示 6 人桌。→ **PRD 建议：优先桌面端体验，移动端作为 nice-to-have；桌面端使用经典椭圆桌布局**

## Risks

### 技术风险
| 风险 | 可能性 | 影响 | 缓解措施 |
|---|---|---|---|
| Postflop 简化 GTO 建议准确度不足以提供有意义的教学价值 | 中 | 高 | 明确标注为"简化参考"；MVP 先上线 preflop 对比，postflop 对比作为迭代目标 |
| 游戏引擎边界情况（side pot、all-in equity run-out、split pot）实现复杂度超预期 | 中 | 中 | 使用经过验证的开源手牌评估库；MVP 阶段简化 side pot 逻辑（最多 1 个 side pot） |
| BOT 决策行为不够"真实"，导致用户体验差 | 中 | 中 | 在 GTO range 基础上加入受控随机性；收集用户反馈持续调优 |
| 浏览器端 localStorage 在隐私模式/Safari 中行为不一致 | 低 | 低 | 实现 try-catch 降级处理；提示用户不在隐私模式下使用 |

### 市场风险
| 风险 | 可能性 | 影响 | 缓解措施 |
|---|---|---|---|
| GTO Wizard 推出免费版或大幅降价，挤压低端市场 | 中 | 高 | 差异化定位于"实战训练"而非"GTO 百科全书"；保持轻量和免费 |
| 目标用户（初学者）对 GTO 概念接受度低，觉得太抽象 | 中 | 中 | 用"推荐操作"替代"GTO 最优解"等专业术语；提供新手引导 |

### 依赖风险
| 风险 | 可能性 | 影响 | 缓解措施 |
|---|---|---|---|
| `pokersolver` 或 `poker-evaluator-ts` 库停止维护或有 bug | 低 | 中 | 这些库功能稳定不需频繁更新；必要时可 fork 维护 |
| Preflop GTO range 数据来源的准确性存疑 | 低 | 中 | 交叉验证多个公开来源（GTO Wizard 免费数据、BBZ Poker、Red Chip Poker） |
