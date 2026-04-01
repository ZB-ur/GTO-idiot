## Market Overview

德州扑克 GTO 训练工具市场正处于快速增长期。随着 Solver 学习从高端玩家普及到中低级别，GTO 训练已成为主流学习方式。市场呈现以下趋势：

- **云端 SaaS 模式主导**：GTO Wizard 凭借零硬件门槛和优秀 UX 占据领先地位，行业正从桌面端向云端/浏览器端迁移
- **AI 个性化教练兴起**：工具从单纯输出 GTO 策略，转向基于玩家个人数据的漏洞分析和个性化建议
- **多人桌求解需求增长**：GTO Wizard 于 2026 年初推出多人桌 AI 求解，说明市场对 6-max 场景的需求旺盛
- **价格分层明显**：从 $75 一次性购买（GTO+）到 $206/月订阅（GTO Wizard Ultra），不同层级玩家有不同预算

**GTO Idiot 的市场机会**：在"免费/低价 + 实战练习 + 即时 GTO 对比"这一细分赛道，目前缺乏强有力的竞品。现有工具要么偏重纯 Solver 分析（PioSOLVER），要么训练模式受限于预计算库（GTO Wizard），鲜有将"与 BOT 对战"和"GTO 复盘"深度整合的免费产品。

## Competitor Analysis

| Competitor | Core Features | Strengths | Weaknesses |
|---|---|---|---|
| **GTO Wizard** ($35-206/mo) | 预计算 GTO 库、交互式训练、手牌分析、漏洞检测、PokerArena 1v1 | 最佳 UX，无需本地硬件，游戏化学习，覆盖多种玩法 | 订阅费用高，预计算库无法覆盖所有场景，高级功能需 Ultra 层 |
| **PioSOLVER** ($249-549) | 极细粒度翻后求解、节点锁定、高级报告 | 业界金标准，最细粒度控制，一次性购买 | 学习曲线陡峭，仅 Windows，需大内存，无内置训练模式 |
| **Simple Postflop** ($299) | 快速求解、翻前翻后支持、可定制博弈树 | 求解速度快，性价比好 | 定制化不如 PioSOLVER，社区较小 |
| **GTO+** ($75) | 构建/修改博弈树、翻后求解 | 最便宜的桌面求解器，入门友好 | 求解速度慢，功能集少 |
| **PokerSnowie** ($99-230/yr) | 神经网络 AI 对手、翻前范围、手牌历史分析、漏洞检测 | 最适合初学者，直观界面，价格合理 | 非真正求解器（NN 近似），固定下注尺寸，不适合高级分析 |
| **WASM Postflop** (免费开源) | 浏览器内 DCFR 求解器、Rust→WASM | 免费，浏览器运行，代码可复用 | 开发已暂停，无训练模式，仅翻后求解 |

## Feasibility

### 技术可行性评估：**中等**

#### 核心模块可行性

| 模块 | 可行性 | 关键挑战 | 推荐方案 |
|---|---|---|---|
| **六人桌牌局引擎** | ✅ 高 | 游戏规则实现，牌面生成，底池计算 | TypeScript 实现，逻辑清晰且成熟 |
| **BOT AI（5 种风格）** | ✅ 高 | 不同风格的策略差异化 | 基于规则的 AI + 随机性参数调节（VPIP/PFR/AF 等），MVP 不需要 GTO AI |
| **简化 CFR 求解器** | ⚠️ 中 | 计算性能、精度与速度的平衡 | **关键决策点 — 见下文** |
| **牌局记录（IndexedDB）** | ✅ 高 | 数据结构设计 | 标准 IndexedDB 操作 |
| **复盘系统** | ✅ 高 | 玩家操作 vs GTO 推荐的对比展示 | 前端 UI + Solver 结果缓存 |

#### CFR 求解器方案选择（最大技术风险点）

**方案 A：Rust→WASM 浏览器端求解（推荐）**
- Fork [postflop-solver](https://github.com/b-inary/postflop-solver)（Rust DCFR 库，已验证可编译为 WASM）
- 翻前：预计算查找表（169 手牌类 × 位置 × 行动 = 完全可枚举，存为 JSON）
- 翻后：DCFR + 激进抽象（10 个手牌桶 × 3-4 个下注尺寸），1-5 秒内收敛
- 优点：无需后端服务器，纯前端部署
- 缺点：6-max 多人场景求解精度有限，需简化为单挑/三人子博弈

**方案 B：Node.js 后端求解**
- 用 Rust/C++ 编写求解器，通过 N-API 绑定到 Node.js
- 或直接用 TypeScript 实现简化版（性能较差，仅适用于极度抽象的场景）
- 优点：计算资源不受浏览器限制
- 缺点：需要部署后端服务

**方案 C：预计算数据库 + 查找（最快 MVP）**
- 预计算常见场景的 GTO 策略存为静态数据
- 翻前 100% 预计算，翻后按 flop 纹理分类预计算
- 优点：无实时计算开销，响应即时
- 缺点：覆盖不完全，存储空间需求大

**MVP 推荐策略：方案 C 为主 + 方案 A 为辅**
- 翻前策略完全预计算（覆盖率 100%）
- 常见翻后场景预计算（覆盖 70-80% 实战情况）
- 非常见场景用简化 DCFR 实时求解（WASM，接受精度损失）

#### 6-max 的特殊挑战

完整求解 6-max NLHE 在计算上**不可行**（Pluribus 用 12,400 CPU 核心时跑了 8 天）。MVP 的务实做法：
1. 翻前使用预计算的 6-max GTO 范围（公开资料丰富）
2. 翻后当多人入池时，简化为"英雄 vs 对手范围合并"的伪单挑模型
3. 精度标注："本场景为简化计算，仅供参考"

#### 关键开源资源

| 项目 | 语言 | 可复用性 |
|---|---|---|
| [postflop-solver](https://github.com/b-inary/postflop-solver) | Rust→WASM | ⭐⭐⭐ 可直接 fork，生产级 DCFR |
| [wasm-postflop](https://github.com/b-inary/wasm-postflop) | Rust/WASM | ⭐⭐⭐ 浏览器端求解已验证 |
| [noambrown/poker_solver](https://github.com/noambrown/poker_solver) | C++/Python | ⭐⭐ 参考实现（Libratus/Pluribus 作者） |
| [TexasSolver](https://github.com/bupticybee/TexasSolver) | C++ | ⭐⭐ DCFR++，注意 AGPL 许可 |
| [OpenSpiel](https://github.com/google-deepmind/open_spiel) | C++/Python | ⭐ 研究级框架，含 CFR 实现 |

#### 非技术风险

- **法律合规**：GTO 训练工具属于"离桌学习工具"，主流扑克平台允许，但需明确标注"仅供学习用途"
- **开源许可**：postflop-solver 使用 MIT 许可（友好），TexasSolver 使用 AGPL（需开源衍生作品）

### 业务可行性：**高**

- 目标用户明确（中级德州扑克玩家）
- 免费/开源定位可快速获取用户
- 技术栈（React + TypeScript + Tailwind）与团队能力匹配
- 本地存储设计避免了服务端运维成本

## Key Insights

1. **纯 JS/TS 实现 CFR 求解器不可行**（慢 10-100 倍），必须走 Rust→WASM 或 C++→N-API 路线，这是架构上的硬约束
2. **预计算 + 实时求解混合策略**是 MVP 最务实的路径：翻前全量预计算，翻后常见场景预计算 + 非常见场景简化实时求解
3. **6-max 多人翻后的精确 GTO 求解在当前技术下不可行**，需降级为简化模型（伪单挑化），并向用户透明标注精度限制
4. **BOT 风格差异化是用户体验的关键差异点**：通过调节 VPIP/PFR/AF 等参数实现不同风格（TAG/LAG/Fish/Nit/Maniac），这比求解器精度更影响用户留存
5. **市场定位应避开 GTO Wizard 的强项（预计算库深度）**，聚焦"免费实战练习 + 即时偏差反馈"的体验闭环
6. **postflop-solver (Rust) 是最佳技术起点**：MIT 许可、生产级质量、已验证 WASM 编译，虽然开发暂停但代码完整可用
7. **复盘系统的核心价值在于"偏差可视化"**：不仅展示 GTO 推荐，更要量化偏差程度（如 EV 损失估算），这是现有免费工具缺失的功能