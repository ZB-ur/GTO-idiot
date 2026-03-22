## Market Overview

德州扑克 GTO 训练工具市场在 2024-2026 年间持续增长，主要驱动力包括：线上扑克竞争加剧、GTO 策略从职业圈向大众普及、以及 AI/solver 技术的成熟。

**市场规模与趋势：**
- GTO 训练工具已成为认真玩家的标配，月订阅价格从 $39 到 $150 不等
- 市场从"solver 工具"向"训练+分析一体化平台"演进
- 云端 SaaS 模式主导（GTO Wizard、GTOBase），本地工具（PioSOLVER）仍占据专业市场
- 开源 GTO solver 生态活跃（TexasSolver、desktop-postflop），但缺少完整的"练习器"产品

**市场机会：**
本产品定位为**纯本地、免订阅的 GTO 练习器**，填补了"免费/一次性付费 + 本地隐私 + 交互式练习"这一空白。现有竞品要么是高价订阅 SaaS，要么是纯 solver 工具（无练习模式），要么是开源但功能不完整。

Sources: [Cardplayer Lifestyle - Best Poker Training Software](https://cardplayerlifestyle.com/poker-software/), [PokerNews - Best Poker Tools 2026](https://www.pokernews.com/poker-tools/)

## Competitor Analysis

| Competitor | Core Features | Strengths | Weaknesses |
|---|---|---|---|
| **GTO Wizard** ($39-149/月) | GTO Trainer、手牌分析、范围查看器、AI solver | 功能最全面；支持 Cash/MTT/Spin；UI 优秀；自带预计算策略库 | 高订阅费；云端依赖；无法离线使用；数据不可导出 |
| **GTOBase** ($150/月) | 策略查看器、GTO Trainer、手牌历史分析 | 支持导入 solver 文件；22100 种翻牌面覆盖；手牌分析速度快(200手/分) | 价格极高；移动端体验有限；学习曲线陡 |
| **PioSOLVER** ($249-$499 一次性) | 专业 GTO solver、UPI 接口、.cfr 文件输出 | 行业标准 solver；精度最高；支持 API 集成 | 纯 solver 无练习模式；需手动配置场景；Windows only |
| **GTO+** ($75 一次性) | 轻量 solver、策略查看器 | 性价比高；界面比 PioSOLVER 友好；支持 .cfr 导入 | 无训练模式；功能不如 PioSOLVER 深 |
| **Simple GTO Trainer** | 训练模式、范围查看 | 专注训练；支持自定义范围 | 功能单一；策略库有限 |
| **Fearless River** (原 WPT GTO Trainer) | 玩已解决的手牌、即时反馈 | WPT 品牌背书；易上手 | 场景有限；无自定义 solver 导入 |
| **TexasSolver** (开源) | C++ GTO solver、命令行界面 | 免费开源；性能优秀 | 无 GUI；无训练模式；纯 solver |
| **Desktop Postflop** (开源，已停更) | Rust 实现的 GTO solver、Tauri 桌面应用 | 开源；性能超越 PioSOLVER；跨平台 | 已停止开发；无训练模式；无手牌回放 |

Sources: [GTO Wizard](https://gtowizard.com/), [GTOBase](https://gtobase.com/), [PioSOLVER](https://piosolver.com/), [TexasSolver GitHub](https://github.com/bupticybee/TexasSolver), [Desktop Postflop GitHub](https://github.com/b-inary/desktop-postflop)

### 竞争差异化分析

本产品的核心差异化：
1. **纯本地运行 + 零订阅费**：vs GTO Wizard/GTOBase 的高额月费
2. **完整练习闭环**（对战 → 即时 GTO 对比 → 统计分析 → leak 追踪）：vs PioSOLVER/TexasSolver 的纯 solver
3. **多难度 BOT 对战**：vs Simple GTO Trainer 的静态范围训练
4. **PioSOLVER .cfr 文件生态兼容**：vs Fearless River 的封闭策略库

## Feasibility

### 技术可行性评估

**1. 牌局引擎（高可行性 ✅）**
- JavaScript/Node.js 生态有成熟的牌力评估库：`pokersolver`（功能全面）、`poker-evaluator`（Two Plus Two 算法，22M hands/sec）、`phe`（高性能 C 移植）
- 6-max 牌局逻辑虽复杂但有明确规则，属于确定性工程
- Side pot 计算是已解决问题，有标准算法

**2. .cfr 文件解析（中等可行性 ⚠️ — 核心风险）**
- .cfr 是 PioSOLVER 的**二进制私有格式**，无官方公开规范
- 文件以 `cfrversion00` 开头，大小 740KB-8MB，包含策略树、手牌频率和 EV 值
- **替代方案 A（推荐）：通过 UPI 协议与 PioSOLVER 通信**
  - PioSOLVER 提供 UPI（Universal Poker Interface）协议，通过 stdin/stdout 通信
  - 关键命令：`load_tree`（加载 .cfr）、`show_strategy`（查询策略）、`calc_ev`（计算 EV）、`show_node`（节点信息）
  - 需要用户本地安装 PioSOLVER（Windows），Node.js 通过 child_process 调用
  - 已有 Python 参考实现：[pyosolver](https://github.com/weston/pyosolver)、[PioSolverConnection](https://github.com/kuba97531/PioSolverConnection)
- **替代方案 B：使用开源 solver 引擎**
  - desktop-postflop 的 Rust solver 库可编译为 WASM，直接嵌入前端
  - 但项目已停更，且需要实时求解（计算密集）
- **替代方案 C：预计算策略表**
  - 为 MVP 预置常见场景的 GTO 策略（JSON 格式）
  - 覆盖面有限但实现最简单，可作为 fallback

**3. BOT AI 实现（高可行性 ✅）**
- 鱼（松散被动）：简单规则引擎，随机化加宽范围
- 普通（TAG）：基于位置和手牌强度的范围表 + 简单决策树
- GTO BOT：直接查询 .cfr 策略树/预计算表，按频率随机化动作
- 不需要实时 CFR 计算，查表即可

**4. 前端 UI（高可行性 ✅）**
- React + Tailwind 完全胜任牌桌 UI、策略可视化、统计图表
- 可参考开源牌桌 UI 组件
- Electron/Tauri 可打包为桌面应用（MVP 阶段可先用浏览器）

**5. 数据存储（高可行性 ✅）**
- SQLite 完全满足本地存储需求：手牌记录、统计数据、会话管理
- better-sqlite3 或 sql.js 提供 Node.js 集成

**6. GTO 对比分析（中等可行性 ⚠️）**
- 需要将玩家决策点精确映射到策略树节点
- 抽象化处理（bet sizing 归类）是关键技术挑战
- EV 差异计算需要策略树中的完整 EV 数据

### 业务可行性评估

- **目标用户明确**：有 GTO 意识的中级玩家，愿意投入时间学习
- **获客路径**：开源社区（GitHub）、扑克论坛（2+2、Reddit r/poker）、中文扑克社区
- **变现模式**：可开源核心 + 付费高级功能，或纯开源项目
- **开发周期**：MVP 预计 4-6 周（单开发者），核心挑战在 .cfr 解析/UPI 集成

### 综合可行性：**中等偏高（Medium-High）**

核心风险集中在 .cfr 文件集成方案选择上，但有多个可行的替代路径。

Sources: [PioSOLVER UPI Documentation](https://piosolver.com/docs/upi/), [PioSOLVER UPI Commands](https://piosolver.com/docs/upi/commands/), [pokersolver npm](https://www.npmjs.com/package/pokersolver), [poker-evaluator npm](https://www.npmjs.com/package/poker-evaluator)

## Key Insights

### 1. .cfr 解析策略应分层实现
MVP 采用"预计算策略表（JSON）+ UPI 协议桥接"双轨方案：
- **默认模式**：内置覆盖主要 preflop 场景和常见 flop texture 的预计算 GTO 策略（JSON），零依赖即可运行
- **高级模式**：用户有 PioSOLVER 时，通过 UPI 协议加载自定义 .cfr 文件获得完整策略树
- 这样 MVP 可以独立运行，同时为高级用户保留扩展能力

### 2. BOT 难度是核心用户体验差异化
竞品（GTO Wizard 等）的对手只有 GTO 策略，而真实牌桌上对手水平参差不齐。提供多难度 BOT 不仅是练习工具，更是"exploit vs GTO"策略切换的训练场景，这在市场上几乎没有竞品覆盖。

### 3. Leak 追踪比单手分析更有长期价值
用户最终需要的不是"这手牌我错了"，而是"我在 CO vs 3bet 的场景下系统性地 fold 过多"。统计面板应以 leak 模式（按位置/场景/动作类型聚合）为核心，而非仅手牌列表。

### 4. 策略树抽象化是技术关键
真实牌局的 bet sizing 不会精确匹配 solver 的 betting line（如 solver 用 33%/67%/150% pot，玩家可能 bet 55% pot）。需要设计 bet sizing 归类算法（如将 40%-60% 归为"half pot"），这直接影响 GTO 对比的准确性和用户体验。

### 5. 前端可视化需兼顾"牌桌沉浸感"和"数据分析感"
- 牌桌 UI 需要足够沉浸（动画、筹码视觉效果）以模拟真实对战体验
- 分析面板需要清晰的数据可视化（范围矩阵、EV 柱状图、频率饼图）
- 两者切换应无缝，最好在同一视图中叠加（如 GTO Wizard 的 in-line 分析）

### 6. Node.js 生态完全支撑技术栈
- 牌力评估：`pokersolver` 或 `poker-evaluator`
- 数据库：`better-sqlite3`
- 前端：React + Tailwind + 可选 Chart.js/D3 for 统计图
- 桌面打包：Electron（MVP 可暂缓，先用浏览器）
- UPI 桥接：Node.js `child_process` spawn PioSOLVER 进程

### 7. 开源策略可形成社区飞轮
如果开源核心引擎，社区可以：贡献预计算策略表、开发新 BOT 类型、扩展统计分析维度。这在扑克工具领域是空白——目前没有活跃的开源 GTO 练习器项目。
