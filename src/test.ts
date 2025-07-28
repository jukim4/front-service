// eval 사용 (일부 Semgrep 룰이 위험한 함수로 탐지함)
const userInput = "2 + 2";
const result = eval(userInput);
console.log(result);
