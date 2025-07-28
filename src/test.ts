// test.tsx
const userCode = "console.log('Hello')";
eval(userCode); // 🚨 Semgrep p/javascript.security.audit.eval-detect 잡힘