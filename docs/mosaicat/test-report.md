# Test Report

## Summary
- **Total:** 12
- **Passed:** 4
- **Failed:** 8
- **Skipped:** 0
- **Verdict:** FAIL

## Failures

### [22m[49m tests/app-shell.test.ts[2m [ tests/app-shell.test.ts ][22m
- **File:** tests/app-shell.test.ts
- **Module:** app-shell
- **Error:** Test failed (see raw output for details)

### [22m[49m tests/e2e-game-loop.test.ts[2m [ tests/e2e-game-loop.test.ts ][22m
- **File:** tests/e2e-game-loop.test.ts
- **Module:** e2e
- **Error:** Test failed (see raw output for details)

### [22m[49m tests/gto-reference-ui.test.ts[2m [ tests/gto-reference-ui.test.ts ][22m
- **File:** tests/gto-reference-ui.test.ts
- **Module:** gto-reference-ui
- **Error:** Test failed (see raw output for details)

### [22m[49m tests/review-ui.test.ts[2m [ tests/review-ui.test.ts ][22m
- **File:** tests/review-ui.test.ts
- **Module:** review-ui
- **Error:** Test failed (see raw output for details)

### [22m[49m tests/session-manager.test.ts[2m [ tests/session-manager.test.ts ][22m
- **File:** tests/session-manager.test.ts
- **Module:** session-manager
- **Error:** Test failed (see raw output for details)

### [22m[49m tests/stats-service.test.ts[2m [ tests/stats-service.test.ts ][22m
- **File:** tests/stats-service.test.ts
- **Module:** stats
- **Error:** Test failed (see raw output for details)

### [22m[49m tests/stats-ui.test.ts[2m [ tests/stats-ui.test.ts ][22m
- **File:** tests/stats-ui.test.ts
- **Module:** stats-ui
- **Error:** Test failed (see raw output for details)

### [22m[49m tests/stores.test.ts[2m [ tests/stores.test.ts ][22m
- **File:** tests/stores.test.ts
- **Module:** stores
- **Error:** Test failed (see raw output for details)

### [22m[49m tests/table-ui.test.ts[2m [ tests/table-ui.test.ts ][22m
- **File:** tests/table-ui.test.ts
- **Module:** table-ui
- **Error:** Test failed (see raw output for details)

### [22m[49m tests/persistence.test.ts[2m > [22mDatabase Schema[2m > [22mshould create database with correct schema and indexes
- **File:** tests/persistence.test.ts
- **Module:** persistence
- **Error:** Test failed (see raw output for details)

### [22m[49m tests/persistence.test.ts[2m > [22mSession CRUD[2m > [22mshould CRUD session records
- **File:** tests/persistence.test.ts
- **Module:** persistence
- **Error:** Test failed (see raw output for details)

### [22m[49m tests/persistence.test.ts[2m > [22mHand Repository[2m > [22mshould save hand record with full action history
- **File:** tests/persistence.test.ts
- **Module:** persistence
- **Error:** Test failed (see raw output for details)

### [22m[49m tests/persistence.test.ts[2m > [22mHand Repository[2m > [22mshould query hands by sessionId
- **File:** tests/persistence.test.ts
- **Module:** persistence
- **Error:** Test failed (see raw output for details)

### [22m[49m tests/persistence.test.ts[2m > [22mHand Repository[2m > [22mshould query hands by compound index
- **File:** tests/persistence.test.ts
- **Module:** persistence
- **Error:** Test failed (see raw output for details)

### [22m[49m tests/persistence.test.ts[2m > [22mSession State[2m > [22mshould save and restore session state for crash recovery
- **File:** tests/persistence.test.ts
- **Module:** persistence
- **Error:** Test failed (see raw output for details)

### [22m[49m tests/persistence.test.ts[2m > [22mSession State[2m > [22mshould overwrite session state on each save
- **File:** tests/persistence.test.ts
- **Module:** persistence
- **Error:** Test failed (see raw output for details)

### [22m[49m tests/persistence.test.ts[2m > [22mSession State[2m > [22mshould handle concurrent writes gracefully
- **File:** tests/persistence.test.ts
- **Module:** persistence
- **Error:** Test failed (see raw output for details)

## Raw Output
```
[1m[46m RUN [49m[22m [36mv4.1.0 [39m[90m/Users/lddmay/AiCoding/mosaicat/.mosaic/artifacts/run-1774154526958/code[39m

 [31m❯[39m tests/app-shell.test.ts [2m([22m[2m0 test[22m[2m)[22m
 [31m❯[39m tests/review-ui.test.ts [2m([22m[2m0 test[22m[2m)[22m
 [31m❯[39m tests/gto-reference-ui.test.ts [2m([22m[2m0 test[22m[2m)[22m
 [31m❯[39m tests/e2e-game-loop.test.ts [2m([22m[2m0 test[22m[2m)[22m
 [32m✓[39m tests/review-service.test.ts [2m([22m[2m7 tests[22m[2m)[22m[32m 3[2mms[22m[39m
 [31m❯[39m tests/persistence.test.ts [2m([22m[2m8 tests[22m[2m | [22m[31m8 failed[39m[2m)[22m[32m 9[2mms[22m[39m
[31m     [31m×[31m should create database with correct schema and indexes[39m[32m 4[2mms[22m[39m
[31m     [31m×[31m should CRUD session records[39m[32m 0[2mms[22m[39m
[31m     [31m×[31m should save hand record with full action history[39m[32m 1[2mms[22m[39m
[31m     [31m×[31m should query hands by sessionId[39m[32m 0[2mms[22m[39m
[31m     [31m×[31m should query hands by compound index[39m[32m 0[2mms[22m[39m
[31m     [31m×[31m should save and restore session state for crash recovery[39m[32m 0[2mms[22m[39m
[31m     [31m×[31m should overwrite session state on each save[39m[32m 1[2mms[22m[39m
[31m     [31m×[31m should handle concurrent writes gracefully[39m[32m 1[2mms[22m[39m
 [32m✓[39m tests/bot-engine.test.ts [2m([22m[2m14 tests[22m[2m)[22m[32m 5[2mms[22m[39m
 [32m✓[39m tests/game-engine.test.ts [2m([22m[2m25 tests[22m[2m)[22m[32m 9[2mms[22m[39m
 [32m✓[39m tests/gto-service.test.ts [2m([22m[2m9 tests[22m[2m)[22m[32m 14[2mms[22m[39m
 [31m❯[39m tests/stats-service.test.ts [2m([22m[2m0 test[22m[2m)[22m
 [31m❯[39m tests/session-manager.test.ts [2m([22m[2m0 test[22m[2m)[22m
 [31m❯[39m tests/stats-ui.test.ts [2m([22m[2m0 test[22m[2m)[22m
 [31m❯[39m tests/stores.test.ts [2m([22m[2m0 test[22m[2m)[22m
 [31m❯[39m tests/table-ui.test.ts [2m([22m[2m0 test[22m[2m)[22m

[2m Test Files [22m [1m[31m10 failed[39m[22m[2m | [22m[1m[32m4 passed[39m[22m[90m (14)[39m
[2m      Tests [22m [1m[31m8 failed[39m[22m[2m | [22m[1m[32m55 passed[39m[22m[90m (63)[39m
[2m   Start at [22m 14:56:05
[2m   Duration [22m 635ms[2m (transform 624ms, setup 0ms, import 798ms, tests 40ms, environment 1ms)[22m



[31m⎯⎯⎯⎯⎯⎯[39m[1m[41m Failed Suites 9 [49m[22m[31m⎯⎯⎯⎯⎯⎯⎯[39m

[41m[1m FAIL [22m[49m tests/app-shell.test.ts[2m [ tests/app-shell.test.ts ][22m
[31m[1mError[22m: No test suite found in file /Users/lddmay/AiCoding/mosaicat/.mosaic/artifacts/run-1774154526958/code/tests/app-shell.test.ts[39m
[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/17]⎯[22m[39m

[41m[1m FAIL [22m[49m tests/e2e-game-loop.test.ts[2m [ tests/e2e-game-loop.test.ts ][22m
[31m[1mError[22m: No test suite found in file /Users/lddmay/AiCoding/mosaicat/.mosaic/artifacts/run-1774154526958/code/tests/e2e-game-loop.test.ts[39m
[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/17]⎯[22m[39m

[41m[1m FAIL [22m[49m tests/gto-reference-ui.test.ts[2m [ tests/gto-reference-ui.test.ts ][22m
[31m[1mError[22m: No test suite found in file /Users/lddmay/AiCoding/mosaicat/.mosaic/artifacts/run-1774154526958/code/tests/gto-reference-ui.test.ts[39m
[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/17]⎯[22m[39m

[41m[1m FAIL [22m[49m tests/review-ui.test.ts[2m [ tests/review-ui.test.ts ][22m
[31m[1mError[22m: No test suite found in file /Users/lddmay/AiCoding/mosaicat/.mosaic/artifacts/run-1774154526958/code/tests/review-ui.test.ts[39m
[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/17]⎯[22m[39m

[41m[1m FAIL [22m[49m tests/session-manager.test.ts[2m [ tests/session-manager.test.ts ][22m
[31m[1mError[22m: No test suite found in file /Users/lddmay/AiCoding/mosaicat/.mosaic/artifacts/run-1774154526958/code/tests/session-manager.test.ts[39m
[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/17]⎯[22m[39m

[41m[1m FAIL [22m[49m tests/stats-service.test.ts[2m [ tests/stats-service.test.ts ][22m
[31m[1mError[22m: No test suite found in file /Users/lddmay/AiCoding/mosaicat/.mosaic/artifacts/run-1774154526958/code/tests/stats-service.test.ts[39m
[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/17]⎯[22m[39m

[41m[1m FAIL [22m[49m tests/stats-ui.test.ts[2m [ tests/stats-ui.test.ts ][22m
[31m[1mError[22m: No test suite found in file /Users/lddmay/AiCoding/mosaicat/.mosaic/artifacts/run-1774154526958/code/tests/stats-ui.test.ts[39m
[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/17]⎯[22m[39m

[41m[1m FAIL [22m[49m tests/stores.test.ts[2m [ tests/stores.test.ts ][22m
[31m[1mError[22m: No test suite found in file /Users/lddmay/AiCoding/mosaicat/.mosaic/artifacts/run-1774154526958/code/tests/stores.test.ts[39m
[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/17]⎯[22m[39m

[41m[1m FAIL [22m[49m tests/table-ui.test.ts[2m [ tests/table-ui.test.ts ][22m
[31m[1mError[22m: No test suite found in file /Use
```