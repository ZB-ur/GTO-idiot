**React component** with:
- Tab navigation between "翻前图表" (Preflop) and "翻后指南" (Postflop) tabs
- Preflop tab: `PositionSelector` + `ScenarioSelector` → `PreflopChart` with API fetch from `/gto/preflop`
- Postflop tab: Street selector + IP/OOP toggle + `BoardTextureSelector` + `HandStrengthSelector` → `PostflopGuide` with API fetch from `/gto/postflop`
- `GTODisclaimerBanner` shown at page top
- Loading spinners and empty states for both tabs
- Consistent design tokens: `rounded-xl` cards, `blue-600` active states, `shadow-sm`, `border-gray-200`