# Security Audit Report

## Verdict: WARN

## Automated Scan Results
- **Dependency vulnerabilities:** 10
- **Code pattern issues:** 0
- **Hardcoded secrets found:** 0

## LLM Security Findings

### [HIGH] Insecure Cryptography
- **File:** src/session/seat-assigner.ts
- **Description:** Math.random() is used for shuffling bot styles and assigning the human seat (lines in pickBotStyles and assignSeats). In a poker application, predictable randomness is a critical fairness issue — Math.random() is not cryptographically secure and its output can be predicted/reproduced. Use crypto.getRandomValues() or a CSPRNG wrapper for all game-critical randomness (seat assignment, dealer selection, shuffling).

### [HIGH] Insecure Cryptography
- **File:** src/services/session-service.ts
- **Description:** Same Math.random() issue duplicated in session-service.ts for pickBotStyles shuffle, humanSeat selection, and dealerSeat selection. This is duplicated logic from seat-assigner.ts — both the duplication and the weak RNG should be addressed. Centralize randomness in seat-assigner.ts and use crypto.getRandomValues().

### [MEDIUM] Missing Input Validation
- **File:** src/services/session-service.ts
- **Description:** selectedSeat is silently clamped via Math.max/Math.min instead of rejecting invalid values. Compare with seat-assigner.ts which correctly throws on out-of-range input. The service should throw an error on invalid seat numbers rather than silently accepting them, as silent clamping can mask bugs or manipulation attempts.

### [LOW] Missing Input Validation
- **File:** src/components/session/SessionStatusBar.tsx
- **Description:** getElapsedTime() parses session.startedAt with `new Date(startedAt)` without validating the date string. A malformed or future date from a corrupted IndexedDB record could produce negative values (clamped to 0) or NaN. Consider adding a validity check on the parsed date.

### [LOW] Configuration Issues
- **File:** src/persistence/database.ts
- **Description:** IndexedDB database name 'gto-idiot-db' is hardcoded and accessible to any script running on the same origin. While this is inherent to IndexedDB, be aware that any XSS on the domain could read/modify all session and hand history data. Ensure strong CSP headers are configured to mitigate XSS risk at the application hosting level.
