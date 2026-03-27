## Market Overview

德州扑克GTO训练工具是一个成熟且高度商业化的市场。头部产品（GTO Wizard）月费高达$206，主要面向中高级玩家。市场存在一个明显的空白：**面向初学者的免费/低成本、纯浏览器端GTO练习工具**。现有产品要么需要安装桌面软件（PioSOLVER, GTO+, Simple GTO Trainer），要么订阅费用高昂（GTO Wizard, Deepsolver），要么不提供实战练习模式（PioSOLVER, GTO+）。

GTO Idiot 的定位——免费、纯浏览器、六人桌对战+复盘、面向初学者——在现有市场中没有直接竞品。最接近的是 GTO Wizard 的 Trainer 模式，但其面向进阶玩家且需付费。

## Competitor Analysis

| Competitor | Core Features | Strengths | Weaknesses | Opportunity |
|---|---|---|---|---|
| **GTO Wizard** ($26-206/mo) | 10M+预解GTO场景、Trainer钻练模式、范围浏览器、聚合报告、手牌分析 | 最大预解库、UI精良、移动端支持、行业标杆 | 昂贵、初学者信息过载、无完整牌局对战模式 | 提供免费的"完整牌局对战"体验，而非孤立spot训练；面向初学者简化UI |
| **PokerSnowie** ($99-230/yr) | AI对手对战、泄漏检测、Preflop范围表、手牌导入分析 | 价格适中、有对战模式、AI可模拟真实对手 | 非真正GTO（神经网络近似）、桌面应用、界面老旧 | 提供真正基于GTO表的策略对比，无需安装 |
| **Simple GTO Trainer** ($59-199) | GTO策略实时反馈、预建练习场景、进度追踪、支持导入PioSolver文件 | 专注训练/钻练、进度追踪、多种训练包 | Windows Only、UI过时、需单独购买训练包 | 零安装Web体验 + 内置GTO数据，无需额外购买 |
| **Deepsolver** ($19+/mo) | 教育+挑战双模式、自定义下注尺寸、聚合翻牌报告、云端快速解算 | 价格入门低、挑战模式创新、现代UI | 低级订阅有计算限制、较新产品库小 | 完全免费 + 离线可用（纯前端）+ 完整牌局而非spot训练 |
| **PioSOLVER** ($249-549) | 实时自定义GTO解算、手牌范围输入、批量处理 | 精度行业金标准、深度定制、一次性购买 | 学习曲线极陡、Windows Only、无训练模式、硬件需求高 | 完全不同的产品形态：GTO Idiot是"学"，PioSOLVER是"算" |
| **GTO+** ($75) | 快速GTO解算、低内存需求、决策树构建 | 极便宜（一次性$75）、高效解算 | Windows Only、无训练模式、无预解库 | 同上，GTO Idiot填补"练习/学习"空缺 |

## Technical Feasibility

- **Overall: HIGH**

### Key Challenges and Mitigations

1. **GTO策略数据来源（核心挑战 — 中等难度）**
   - 完整GTO解算需要大量计算资源，不可能在浏览器实时完成
   - **Mitigation**: MVP使用预计算JSON策略表。Preflop范围表（169种起手牌 × 6个位置 × 常见场景）数据量可控（~500KB JSON）。Postflop仅覆盖高频spot（常见翻牌纹理 × 常见底池情况），以简化的策略频率表形式存储
   - Preflop GTO范围表在扑克社区有广泛共识，可基于公开资源构建 [NEEDS VERIFICATION: 具体数据源需确认是否有版权问题]
   - 开源solver（TexasSolver, WASM Postflop）可用于预计算postflop spot

2. **牌局引擎（低难度）**
   - 成熟的TypeScript扑克引擎库可用：`@idealic/poker-engine`（专业级、TS原生、可序列化手牌历史）或 `@chevtek/poker-engine`
   - 手牌评估：`pokersolver` 或 `@poker-apprentice/hand-evaluator`（TS原生）
   - **Recommendation**: 使用 `@idealic/poker-engine` 作为游戏引擎基础，可能需要扩展以支持GTO查表

3. **BOT决策引擎（中等难度）**
   - BOT需要根据GTO策略表做决策，并加入适当随机化（混合策略）
   - **Mitigation**: 查表后按GTO频率随机选择动作（如Raise 60%/Call 30%/Fold 10%时生成随机数决定）
   - 需处理策略表未覆盖的spot → fallback到简化规则

4. **数据持久化（低难度）**
   - IndexedDB 完全适合此场景，`idb` 库提供Promise API封装
   - 每手牌记录约2-5KB，IndexedDB容量通常>50MB，足够存储10000+手牌

5. **卡牌UI渲染（低难度）**
   - `@letele/playing-cards` 提供高质量React SVG卡牌组件
   - 牌桌UI需自定义，但属于标准React+CSS工作

6. **复盘回放引擎（中等难度）**
   - 需要逐动作状态重建 + GTO偏差计算
   - **Mitigation**: 牌局记录时保存完整状态快照序列，复盘时直接回放；GTO偏差=用户动作 vs 查表结果的对比

### Required Libraries and Maturity

| Library | Purpose | Maturity | npm Weekly Downloads |
|---|---|---|---|
| `pokersolver` | 手牌评估 | Stable, widely used | ~5K [NEEDS VERIFICATION] |
| `@idealic/poker-engine` | 游戏引擎 | Active, TS native | Newer library |
| `@letele/playing-cards` | 卡牌SVG渲染 | Stable | Moderate |
| `idb` | IndexedDB封装 | Very mature | ~500K |
| `zustand` or `jotai` | 状态管理 | Very mature | ~1M+ |
| `tailwindcss` | CSS框架 | Very mature | Standard |

### Browser Compatibility

- 目标：现代浏览器（Chrome 90+, Firefox 90+, Safari 15+, Edge 90+）
- IndexedDB：所有现代浏览器完全支持
- SVG渲染：无兼容性问题
- 无WebAssembly依赖（MVP不使用WASM solver）

## Key Insights

1. **现有GTO训练工具均为"孤立spot训练"，缺少"完整牌局对战"模式** → GTO Idiot应强调"完整六人桌牌局"作为核心差异化。用户在完整牌局中学习上下文感知的GTO决策，而非脱离语境的spot钻练。PRD应将"连续牌局对战"作为F-001核心功能。

2. **GTO策略是混合策略（频率分布），初学者难以理解"为什么Raise 60%而不是100%"** → 复盘界面必须可视化频率分布（如饼图/条形图），并用自然语言解释混合策略的原因（如"这手牌在GTO中Raise 60%是因为需要保持范围平衡"）。PRD应要求F-NNN包含频率可视化和自然语言解释。

3. **Preflop GTO范围表数据量可控（~500KB），但Postflop策略空间爆炸性增长** → MVP的Postflop GTO对比应限于"常见spot"（如C-bet频率、check-raise频率等聚合统计），而非试图覆盖所有翻牌纹理。PRD应明确Postflop覆盖范围的边界。

4. **竞品最大痛点是"信息过载"和"学习曲线陡峭"** → GTO Idiot面向初学者，UI必须极度简化。每个决策点只展示"你的选择 vs GTO建议"，复盘时逐步引导，而非一次性展示全部信息。PRD应包含"渐进式信息展示"设计原则。

5. **`@idealic/poker-engine` 提供可序列化手牌历史，天然适合复盘回放** → 技术选型应优先使用此引擎，其手牌记录格式可直接用于复盘状态重建，减少自定义序列化工作。Tech spec应指定此库。

6. **所有竞品都需要付费或安装，纯免费+纯浏览器的组合在市场中空白** → 这是核心竞争力。PRD应明确"零成本、零安装"作为产品原则，IndexedDB本地存储确保隐私。

7. **BOT的GTO混合策略需要随机化，但随机化可能让初学者困惑（"为什么BOT同样的情况做了不同的决定"）** → 复盘中应展示BOT的决策逻辑："BOT在此spot的GTO策略为Raise 60%/Call 40%，本次随机到了Call"。PRD应要求BOT决策透明化。

8. **位置感知是GTO策略的核心维度，六人桌6个位置（UTG/MP/CO/BTN/SB/BB）决定了截然不同的范围** → UI必须始终清晰标注每个玩家的位置，复盘时按位置筛选手牌历史。PRD应包含位置标注和位置筛选功能。

## Risks

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Postflop GTO策略表数据量过大（>10MB），影响首次加载 | Medium | Medium | 按需加载（lazy load by flop texture）；MVP限制覆盖的spot数量；使用压缩JSON |
| 现有poker engine库不完全满足需求（如不支持GTO查表集成） | Medium | Low | 这些库主要处理游戏流程，GTO查表是独立模块，松耦合集成 |
| Preflop GTO范围表的数据准确性难以验证 | Low | High | 参考多个公开来源交叉验证；标注数据来源；标记为"近似GTO"而非"精确GTO" |
| IndexedDB在Safari Private Browsing中容量受限（~50MB→实际可能更少） | Low | Low | 添加存储容量检测和警告；提供导出/清理功能 |

### Market Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| GTO Wizard推出免费初学者版本 | Medium | High | 差异化在"完整牌局对战"而非"spot训练"；快速占领初学者市场 |
| 初学者对GTO概念兴趣有限，更偏好"赢钱策略" | Low | Medium | UI强调"学会GTO=长期赢钱"；展示EV数据让学习成果可感知 |

### Dependency Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `@idealic/poker-engine` 维护停滞或有关键bug | Medium | Medium | 该库代码量不大，必要时fork维护；或退回到 `@chevtek/poker-engine` |
| 卡牌渲染库样式不满足需求 | Low | Low | SVG卡牌可自定义或使用纯CSS方案替代 |
| GTO策略数据无法免费获取足够精度 | Low | High | Preflop范围表社区共识度高，可靠来源充足；Postflop MVP仅覆盖简化策略 |
