# Test Report

## Summary
- **Total:** 20
- **Passed:** 19
- **Failed:** 1
- **Skipped:** 0
- **Verdict:** FAIL

## Failures

### [22m[49m tests/bot/regular-strategy.test.ts[2m > [22mRegularStrategy[2m > [22mshould respect position-based ranges from preflop table
- **File:** tests/bot/regular-strategy.test.ts
- **Module:** bot-ai
- **Error:** Test failed (see raw output for details)

## Raw Output
```
[1m[46m RUN [49m[22m [36mv4.1.0 [39m[90m/Users/lddmay/AiCoding/mosaicat/.mosaic/artifacts/run-1774116428111/code[39m

 [32m✓[39m tests/engine/types.test.ts [2m([22m[2m5 tests[22m[2m)[22m[32m 2[2mms[22m[39m
 [31m❯[39m tests/bot/regular-strategy.test.ts [2m([22m[2m5 tests[22m[2m | [22m[31m1 failed[39m[2m)[22m[32m 6[2mms[22m[39m
     [32m✓[39m should fold weak hands out of position[32m 2[2mms[22m[39m
     [32m✓[39m should raise strong hands in late position[32m 0[2mms[22m[39m
     [32m✓[39m should call with drawing hands given proper pot odds[32m 0[2mms[22m[39m
[31m     [31m×[31m should respect position-based ranges from preflop table[39m[32m 2[2mms[22m[39m
     [32m✓[39m should complete within 200ms[32m 1[2mms[22m[39m
 [32m✓[39m tests/engine/deck.test.ts [2m([22m[2m6 tests[22m[2m)[22m[32m 9[2mms[22m[39m
 [32m✓[39m tests/gto/preflop-ranges.test.ts [2m([22m[2m7 tests[22m[2m)[22m[32m 17[2mms[22m[39m
 [32m✓[39m tests/gto/cfr-worker.test.ts [2m([22m[2m3 tests[22m[2m)[22m[32m 25[2mms[22m[39m
 [32m✓[39m tests/engine/game-engine.test.ts [2m([22m[2m12 tests[22m[2m)[22m[32m 11[2mms[22m[39m
 [32m✓[39m tests/integration/game-loop.test.ts [2m([22m[2m5 tests[22m[2m)[22m[32m 13[2mms[22m[39m
 [32m✓[39m tests/bot/bot-manager.test.ts [2m([22m[2m5 tests[22m[2m)[22m[32m 11[2mms[22m[39m
 [32m✓[39m tests/engine/pot-calculator.test.ts [2m([22m[2m6 tests[22m[2m)[22m[32m 4[2mms[22m[39m
 [32m✓[39m tests/gto/game-tree.test.ts [2m([22m[2m5 tests[22m[2m)[22m[32m 4[2mms[22m[39m
 [32m✓[39m tests/services/deviation-analyzer.test.ts [2m([22m[2m7 tests[22m[2m)[22m[32m 4[2mms[22m[39m
 [32m✓[39m tests/bot/fish-strategy.test.ts [2m([22m[2m4 tests[22m[2m)[22m[32m 5[2mms[22m[39m
 [32m✓[39m tests/services/replay-service.test.ts [2m([22m[2m4 tests[22m[2m)[22m[32m 5[2mms[22m[39m
 [32m✓[39m tests/gto/postflop-solver.test.ts [2m([22m[2m5 tests[22m[2m)[22m[32m 229[2mms[22m[39m
 [32m✓[39m tests/engine/hand-evaluator.test.ts [2m([22m[2m14 tests[22m[2m)[22m[32m 3[2mms[22m[39m
 [32m✓[39m tests/bot/gto-bot-strategy.test.ts [2m([22m[2m3 tests[22m[2m)[22m[32m 261[2mms[22m[39m
 [32m✓[39m tests/engine/action-validator.test.ts [2m([22m[2m5 tests[22m[2m)[22m[32m 3[2mms[22m[39m
 [32m✓[39m tests/gto/preflop-advisor.test.ts [2m([22m[2m5 tests[22m[2m)[22m[32m 3[2mms[22m[39m
 [32m✓[39m tests/types/index.test.ts [2m([22m[2m3 tests[22m[2m)[22m[32m 3[2mms[22m[39m
 [32m✓[39m tests/services/metrics-calculator.test.ts [2m([22m[2m7 tests[22m[2m)[22m[32m 3[2mms[22m[39m

[2m Test Files [22m [1m[31m1 failed[39m[22m[2m | [22m[1m[32m19 passed[39m[22m[90m (20)[39m
[2m      Tests [22m [1m[31m1 failed[39m[22m[2m | [22m[1m[32m115 passed[39m[22m[90m (116)[39m
[2m   Start at [22m 04:44:50
[2m   Duration [22m 667ms[2m (transform 716ms, setup 0ms, import 1.05s, tests 622ms, environment 1ms)[22m


[90mstderr[2m | tests/gto/cfr-worker.test.ts[2m > [22m[2mCFR Worker[2m > [22m[2mshould respond to solve message with strategy result
[22m[39m[CFRWorker] Failed to create Web Worker, will use main-thread fallback


[31m⎯⎯⎯⎯⎯⎯⎯[39m[1m[41m Failed Tests 1 [49m[22m[31m⎯⎯⎯⎯⎯⎯⎯[39m

[41m[1m FAIL [22m[49m tests/bot/regular-strategy.test.ts[2m > [22mRegularStrategy[2m > [22mshould respect position-based ranges from preflop table
[31m[1mAssertionError[22m: expected 0 to be greater than 0.5[39m
[36m [2m❯[22m tests/bot/regular-strategy.test.ts:[2m109:33[22m[39m
    [90m107|[39m       [35mif[39m (result[33m.[39maction [33m===[39m [32m'raise'[39m) raiseCount[33m++[39m[33m;[39m
    [90m108|[39m     }
    [90m109|[39m     [34mexpect[39m(raiseCount [33m/[39m trials)[33m.[39m[34mtoBeGreaterThan[39m([34m0.5[39m)[33m;[39m
    [90m   |[39m                                 [31m^[39m
    [90m110|[39m   })[33m;[39m
    [90m111|[39m

[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯[22m[39m
```