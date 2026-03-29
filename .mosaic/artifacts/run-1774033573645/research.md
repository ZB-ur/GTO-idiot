## Market Overview

德州扑克 GTO 训练工具市场在 2024-2026 年持续增长，主要驱动力包括：
- **GTO 策略主流化**：中高级玩家群体对 GTO 学习需求激增，从职业选手扩展到业余爱好者
- **工具订阅化趋势**：头部产品（GTO Wizard、DTO Poker）采用 SaaS 模式，月费 $35-$99，形成稳定收入
- **技术门槛下降**：WebAssembly 让浏览器端运行 solver 成为可能（wasm-postflop 项目已验证），预计算策略表方案更加成熟
- **市场缺口**：现有工具要么价格高昂（PioSolver $249-$1099），要么侧重"查表学习"而非"实战练习+复盘"的闭环体验。**纯免费、纯浏览器端、集对战+复盘+GTO 对比于一体的产品几乎空白**

**市场规模参考**：全球在线扑克玩家超 1 亿（含休闲玩家），其中对 GTO 有学习需求的中高级玩家估计数百万级。GTO Wizard 作为头部产品已拥有大量付费用户。

## Competitor Analysis

| Competitor | Core Features | Strengths | Weaknesses |
|---|---|---|---|
| **GTO Wizard** ($35-99/mo) | 1000万+ 预解 solution、交互式 trainer、手牌分析、ICM 计算、PokerArena 对战 | 最大 GTO solution 库；覆盖 cash/MTT/PKO；AI solver 速度快；社区活跃 | 订阅费用较高；偏重"查询+练习"模式，非完整牌局对战；学习曲线陡峭 |
| **DTO Poker** (subscription) | GTO 简化策略、Cash/Tournament trainer、最高 EV C-bet 尺寸推荐、Explorer 工具 | 策略简化易学；顶级职业选手背书；专注实用性而非理论完美 | 功能相对单一；缺少完整牌局模拟；价格信息不透明 |
| **PioSolver** ($249-1099) | 本地 postflop GTO solver、自定义范围/下注尺寸、脚本自动化 | 业界最强 postflop solver；完全自定义；职业选手标配 | 极高学习曲线；仅本地 Windows；无对战功能；价格昂贵；无训练/复盘功能 |
| **GTO+** ($75 一次性) | Postflop solver、可视化范围分析、性价比高 | 一次性买断；界面相对友好；适合预算有限玩家 | 功能不如 PioSolver 全面；无对战/训练功能；仅本地运行 |
| **GTOBase** (freemium) | GTO strategy viewer、实时分析训练、手牌历史分析 | 实时反馈训练错误；支持手牌导入分析 | 训练场景有限；非完整牌局模拟；社区较小 |
| **Poker Trainer** (free w/ limits) | 情景练习模拟、即时反馈、评分升级系统 | 免费使用；游戏化体验好；适合入门 | GTO 深度不足；每日免费手数限制；无复盘功能 |
| **PokerSnowie** (subscription) | AI 教练、实时建议、手牌评估 | AI 驱动非 GTO 查表；适合初学者 | 非严格 GTO（基于神经网络）；订阅制；桌面应用 |
| **Postflop+** (mobile app) | 移动端 GTO postflop 训练 | 移动端便捷；专注 postflop | 仅移动端；无完整牌局；场景有限 |

### 竞品差异化分析

**GTO Idiot 的独特定位**：
1. **完整牌局对战 + GTO 复盘闭环** — 竞品多为"查表/做题"模式，缺少与 BOT 的完整六人桌对战体验
2. **纯浏览器 + 免费** — 无需安装、无需订阅、无需注册，IndexedDB 本地存储
3. **多风格 BOT** — TAG/LAG/Nit/Fish/GTO-based 五种对手，模拟真实牌桌生态
4. **赛后深度复盘** — 逐手回放 + EV 分析 + 频率分布对比，而非简单对错判断

## Feasibility

### 技术可行性：**HIGH**

| 技术领域 | 可行性 | 方案 | 风险 |
|---|---|---|---|
| **牌局引擎** | ✅ 高 | 标准 NLHE 规则引擎，开源参考丰富（JsPoker、node-poker-stack 等） | 边界情况多（split pot、all-in side pot），需充分测试 |
| **BOT AI** | ✅ 高 | 基于预设范围 + 风格参数的决策树，无需 ML | 平衡趣味性和合理性；避免 BOT 行为过于机械 |
| **Preflop GTO 数据** | ✅ 高 | 公开 preflop chart 数据丰富（preflop-academy 等开源项目）；6-max 各位置 open/3bet/4bet range 已标准化 | 数据量可控（169 种起手牌 × 位置 × 场景） |
| **Postflop GTO 数据** | ⚠️ 中 | 预计算常见 spot（C-bet、facing C-bet、donk bet 等）的简化策略表；参考 DTO 的简化方法论 | 完整 postflop 解空间巨大，MVP 只能覆盖"常见 spot"；需明确 scope |
| **EV 计算** | ✅ 高 | 基于预存策略的 EV 查表 + Monte Carlo 简化估算 | 精度受限于预计算覆盖范围 |
| **浏览器端性能** | ✅ 高 | React + IndexedDB，无需 WebAssembly（不做实时 solve）；BOT 决策纯 JS 运算 | IndexedDB 大量牌局数据的查询性能需优化 |
| **数据可视化** | ✅ 高 | 频率分布图 + EV 曲线，标准图表库（Recharts/D3）即可 | 无特殊技术挑战 |
| **数据持久化** | ✅ 高 | IndexedDB + Dexie.js 封装，成熟方案 | 浏览器清除数据风险，可提供导出功能 |

### 业务可行性

- **开发周期**：MVP 估计 4-6 周（单人全栈），核心工作量在牌局引擎 + BOT AI + GTO 数据整理
- **分发渠道**：纯静态站点，可部署 Vercel/Netlify，零运维成本
- **盈利模式**（非 MVP）：高级 BOT 风格解锁、更多 postflop spot 覆盖、手牌导入分析
- **法律风险**：低。GTO 策略数据为公开数学知识，练习工具不涉及真金博弈

### 关键技术决策

1. **GTO 数据格式**：建议 JSON 格式存储，按 `位置 × 场景 × 动作` 索引，preflop 约 50KB，常见 postflop spot 约 200-500KB
2. **BOT 决策引擎**：状态机模式，输入（手牌、位置、pot、对手动作历史）→ 风格权重调整 → 输出动作+金额
3. **复盘引擎**：牌局数据结构记录每个 street 的完整状态快照，复盘时逐步回放并查询 GTO 数据库对比

## Key Insights

1. **市场空白明确**：免费 + 浏览器端 + 完整对战 + GTO 复盘的组合在现有市场中没有直接竞品，GTO Wizard 最接近但价格门槛高且缺少完整牌局体验

2. **Postflop GTO 数据是核心壁垒也是核心风险**：MVP 需要明确覆盖哪些 postflop spot（建议优先：SRP IP C-bet、SRP OOP facing C-bet、3-bet pot C-bet），避免 scope 膨胀

3. **BOT 体验决定留存**：5 种风格 BOT 的行为可信度直接影响用户体验。建议每种 BOT 有可感知的"个性"（如 Fish 会 limp-call 弱牌、Nit 翻后几乎不 bluff），而非仅靠频率参数微调

4. **复盘是核心价值，对战是载体**：用户的核心痛点是"知道 GTO 理论但不知道自己偏离多少"。复盘界面的信息密度和可读性比对战界面更关键

5. **渐进式数据扩展策略**：MVP 用简化预计算数据，未来可接入 wasm-postflop（开源 WASM solver）实现更精确的 postflop 实时计算，或允许用户导入 PioSolver 解法文件

6. **游戏化元素提升粘性**：参考 Poker Trainer 的评分升级系统，可增加"GTO 偏离度评分"、"连续正确决策streak"等机制

7. **数据导出是差异化功能**：允许导出牌局记录为标准 HH（Hand History）格式，可导入其他工具分析，增强生态兼容性

8. **技术栈建议**：Next.js 静态导出 + React + Tailwind + Dexie.js(IndexedDB) + Recharts(图表)，完全契合纯前端架构约束
