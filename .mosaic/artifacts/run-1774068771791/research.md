## Market Overview

德州扑克GTO训练工具市场在2024-2026年持续增长，主要由中高级玩家对系统化学习的需求驱动。市场呈现明显的**高端付费主导**格局：头部产品（GTO Wizard）月费$39-$129，一次性买断产品（PioSolver、GTO+）售价$75-$475。这为一款**免费、低门槛、纯前端**的GTO练习工具留下了清晰的市场空位。

**市场机会：**
- 现有工具侧重"查阅解法"（solver模式），缺少"实战练习+即时反馈"的闭环体验
- GTO Wizard虽有Trainer模式，但免费版每日仅10手，付费门槛高
- 没有主流产品提供"六人桌全程对战 → 赛后逐手GTO复盘"的完整练习循环
- 纯前端、零注册、开箱即用的定位在现有竞品中几乎空白

## Competitor Analysis

| Competitor | Core Features | Strengths | Weaknesses |
|---|---|---|---|
| **GTO Wizard** ($39-129/mo) | 1000万+预解场景、GTO Trainer对战、手牌分析、多格式支持 | 业界最全解法库；AI对手训练；专业级精度；覆盖Cash/MTT/Spin | 高价付费墙；免费版仅10手/天；偏"查表"非沉浸式对战；需联网 |
| **GTO+** ($75一次性) | 本地GTO求解器、可视化决策树、自定义场景 | 一次性付费；深度可定制；离线可用 | 学习曲线陡；无内置对战模式；仅Windows；非实时练习 |
| **PioSolver** ($249-475) | 专业级求解器、精确GTO计算、高级节点锁定 | 业界精度标杆；专业玩家首选 | 极高价格；需高端硬件；无对战/练习模式；纯分析工具 |
| **FreeBetRange** (免费/付费) | Preflop范围构建、简化GTO图表（25%频率四舍五入）、范围练习器 | 免费基础版；简化频率易记忆；有游戏化练习 | 仅Preflop；无翻后策略；无完整对战体验 |
| **GTOBase** (免费基础) | GTO策略查看器、内置Trainer、手牌历史分析 | 永久免费HU Cash库；多模式训练 | 免费内容有限；偏查阅非对战；无六人桌模拟 |
| **GTO LAB** ($49-149/mo) | MTT专项教练、全桌ICM训练、顶级教练内容 | 精英教练团队；MTT深度最强 | 仅MTT/锦标赛；非Cash Game；高价 |
| **Poker Academy** (免费) | 150万+ Preflop图表、按位置/深度分类 | 海量免费图表；覆盖全面 | 纯静态图表；无对战；无复盘功能 |

**GTO Idiot的差异化定位：**
- ✅ 完全免费，纯前端，零注册
- ✅ 六人桌沉浸式对战（非"选择题"式训练）
- ✅ 赛后逐手逐街GTO对比复盘
- ✅ 对战+复盘+统计闭环，而非单一solver/查表工具

## Feasibility

### 技术可行性：高 ✅

**1. 核心对战引擎（发牌/下注/底池）**
- 德州扑克游戏逻辑是成熟领域，规则确定性强
- 纯前端TypeScript实现完全可行，无计算密集型瓶颈
- 发牌使用Fisher-Yates洗牌算法，底池计算为简单算术

**2. 手牌评估**
- npm生态有成熟库可参考：`pokersolver`（浏览器+Node.js兼容）、`poker-evaluator`（Two Plus Two算法，22M手/秒）
- 可直接使用或参考实现，7张牌评估在浏览器中毫秒级完成
- 来源：[pokersolver](https://github.com/goldfire/pokersolver)、[poker-evaluator](https://www.npmjs.com/package/poker-evaluator)

**3. 简化GTO策略表**
- MVP不需要实时求解，使用预计算的简化策略表即可
- Preflop：按6个位置的开局/3-bet/call范围（约169种起手牌×6位置×若干场景）
- Postflop：常见牌面纹理+手牌强度分类的推荐动作频率
- 参考FreeBetRange的简化方式：频率四舍五入到25%粒度
- **数据量预估**：Preflop表约50-100KB JSON；Postflop简化表约200-500KB JSON，完全适合内置

**4. 数据存储**
- localStorage 限制通常为5-10MB
- 每手牌记录（动作序列+结果）约1-2KB，可存储数千手
- 可选IndexedDB做后备扩展

**5. UI/UX**
- React + Tailwind CSS完全胜任扑克桌UI
- 复盘界面为标准的时间线+对比展示，无特殊技术挑战

### 技术风险点

| 风险 | 等级 | 缓解策略 |
|---|---|---|
| 简化GTO表的质量和覆盖面 | 中 | MVP先覆盖Preflop全场景+Postflop高频场景，标注"简化策略"而非"精确GTO" |
| BOT行为真实性 | 中 | 基于简化GTO表+随机化频率实现，明确定位为"练习对手"而非"完美GTO对手" |
| Postflop场景组合爆炸 | 中 | 按牌面纹理分类（干燥/湿润/配对等）+手牌强度分类（强/中/弱/听牌），控制在可管理的策略矩阵内 |
| localStorage容量限制 | 低 | 实现数据压缩+旧数据清理策略；必要时迁移IndexedDB |
| 手牌胜率计算性能 | 低 | 使用查表法（非蒙特卡洛模拟），浏览器端毫秒级响应 |

### 业务可行性：高 ✅

- 开发成本低：纯前端，无服务器/运维成本
- 目标明确：六人桌Cash Game，范围可控
- 差异化清晰：免费+对战+复盘的组合在市场中独特
- 用户获取：扑克社区活跃，免费工具易于传播

## Key Insights

1. **市场空白确认**：现有GTO工具生态中，"免费+六人桌实战对战+赛后GTO复盘"这一组合没有直接竞品。GTO Wizard最接近但受限于高价付费墙和每日手数限制。

2. **简化策略是正确的MVP策略**：FreeBetRange验证了"简化GTO频率（25%粒度）"对中级玩家的学习价值。MVP不需要solver级精度，需要的是"足够好"的参考标准来帮助用户识别明显偏离。

3. **Preflop优先，Postflop渐进**：Preflop GTO范围是确定性最高、数据最成熟的部分（大量免费公开图表可参考）。Postflop策略应从高频简单场景开始，逐步扩展。

4. **复盘是核心差异化功能**：竞品的"Trainer"多为单手选择题模式。GTO Idiot的"连续对战→赛后完整复盘"模式更接近真实学习循环，这是产品最大卖点。

5. **技术栈完全匹配**：React+TypeScript+Tailwind纯前端方案成熟可靠，npm生态有现成的手牌评估库，开发风险极低。

6. **命名"GTO Idiot"具有记忆点**：自嘲式命名在扑克社区文化中容易引发共鸣（暗示"我们都是GTO白痴，需要练习"），有利于传播。

7. **开源策略库可作参考**：WASM Postflop（开源GTO solver）和TexasSolver的策略输出可作为构建简化策略表的参考数据来源。来源：[wasm-postflop](https://github.com/b-inary/wasm-postflop)、[TexasSolver](https://github.com/bupticybee/TexasSolver)

8. **扩展路径清晰**：MVP之后可自然扩展至BOT难度分级、锦标赛模式、导入手牌历史、社区排行榜等，每一步都有对标竞品的功能参考。