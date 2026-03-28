# Dynamic Project Constitution

## Product Constraints (from ProductOwner)

### Target User Profile
扑克新手和初中级玩家，刚接触GTO（Game Theory Optimal）概念，具备基本的德州扑克规则认知但缺乏系统性策略训练经验。主要使用桌面浏览器访问，期望零门槛（无需注册、无需付费、无需安装）即可开始练习。对扑克术语（position、pot odds、SPR等）有初步了解但不精通，需要直观的视觉反馈（红绿灯标记）而非复杂的数学分析。

### Core Value Proposition
在免费浏览器端提供"完整牌局对战 + 赛后逐手GTO复盘"的闭环体验——现有竞品要么是付费的（GTO Wizard $39/月），要么是选择题模式（无完整牌局），要么无GTO精确对比（PokerSnowie）。

### Feature Priority Rules
- P0 features MUST be fully functional — no stubs, no partial implementations
- P1 features SHOULD be implemented if time/budget allows
- P2 features are nice-to-have and may be omitted entirely
- When in doubt about scope, cut P2 first, then P1
- 牌局引擎（F-001）和复盘（F-006）是产品核心差异化，绝不可降级

### Product-Level NEVER Rules
- NEVER 在未覆盖的GTO spot上显示虚假或猜测的策略数据——必须明确标注"无GTO参考数据"
- NEVER 要求用户注册账号或登录才能开始对战——即开即玩是核心体验
- NEVER 将完整牌局体验降级为选择题/quiz模式——"打完整牌局"是与竞品的根本差异
- NEVER 在牌局引擎中跳过规则验证（如最小加注额、边池计算）——错误的规则会误导用户学习
- NEVER 让BOT做出违反基本扑克逻辑的动作（如在无人加注时fold）——BOT行为必须合理，即使是"鱼"风格
