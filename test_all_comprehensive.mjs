import {
  generateAutomata,
  stepByStepSimulation,
} from "./src/utils/automataLogic.js";

const regex = "d(de*d+ef*e+fd*f)df";
const testStrings = {
  valid: [
    "ddddf",
    "ddeddf",
    "ddeeddf",
    "deedf",
    "defedf",
    "deffedf",
    "dffdf",
    "dfdfdf",
    "dfddfdf",
  ],
  invalid: ["dedf", "dddd", "dddf", "defdf", "dfdf", "ddedef", "dfffdf"],
};

const result = generateAutomata(regex);

console.log(`Testing regex: ${regex}\n`);

// Test NFA
console.log("=== VALID STRINGS ON NFA (Should Accept) ===");
let nfaValidPass = 0;
testStrings.valid.forEach((str) => {
  const generator = stepByStepSimulation(result.nfa, str);
  let finalStep;
  for (const step of generator) {
    finalStep = step;
  }
  const status = finalStep.accepted ? "✓ ACCEPTED" : "✗ REJECTED";
  if (finalStep.accepted) nfaValidPass++;
  console.log(`${str.padEnd(12)} => ${status}`);
});
console.log(
  `NFA Valid Pass Rate: ${nfaValidPass}/${testStrings.valid.length}\n`
);

console.log("=== INVALID STRINGS ON NFA (Should Reject) ===");
let nfaInvalidPass = 0;
testStrings.invalid.forEach((str) => {
  const generator = stepByStepSimulation(result.nfa, str);
  let finalStep;
  for (const step of generator) {
    finalStep = step;
  }
  const status = finalStep.accepted ? "✓ ACCEPTED" : "✗ REJECTED";
  if (!finalStep.accepted) nfaInvalidPass++;
  console.log(`${str.padEnd(12)} => ${status}`);
});
console.log(
  `NFA Invalid Pass Rate: ${nfaInvalidPass}/${testStrings.invalid.length}\n`
);

// Test DFA
console.log("=== VALID STRINGS ON DFA (Should Accept) ===");
let dfaValidPass = 0;
testStrings.valid.forEach((str) => {
  const generator = stepByStepSimulation(result.dfa, str);
  let finalStep;
  for (const step of generator) {
    finalStep = step;
  }
  const status = finalStep.accepted ? "✓ ACCEPTED" : "✗ REJECTED";
  if (finalStep.accepted) dfaValidPass++;
  console.log(`${str.padEnd(12)} => ${status}`);
});
console.log(
  `DFA Valid Pass Rate: ${dfaValidPass}/${testStrings.valid.length}\n`
);

console.log("=== INVALID STRINGS ON DFA (Should Reject) ===");
let dfaInvalidPass = 0;
testStrings.invalid.forEach((str) => {
  const generator = stepByStepSimulation(result.dfa, str);
  let finalStep;
  for (const step of generator) {
    finalStep = step;
  }
  const status = finalStep.accepted ? "✓ ACCEPTED" : "✗ REJECTED";
  if (!finalStep.accepted) dfaInvalidPass++;
  console.log(`${str.padEnd(12)} => ${status}`);
});
console.log(
  `DFA Invalid Pass Rate: ${dfaInvalidPass}/${testStrings.invalid.length}\n`
);

// Test Minimized DFA
console.log("=== VALID STRINGS ON MINIMIZED DFA (Should Accept) ===");
let minValidPass = 0;
testStrings.valid.forEach((str) => {
  const generator = stepByStepSimulation(result.minimizedDfa, str);
  let finalStep;
  for (const step of generator) {
    finalStep = step;
  }
  const status = finalStep.accepted ? "✓ ACCEPTED" : "✗ REJECTED";
  if (finalStep.accepted) minValidPass++;
  console.log(`${str.padEnd(12)} => ${status}`);
});
console.log(
  `Minimized DFA Valid Pass Rate: ${minValidPass}/${testStrings.valid.length}\n`
);

console.log("=== INVALID STRINGS ON MINIMIZED DFA (Should Reject) ===");
let minInvalidPass = 0;
testStrings.invalid.forEach((str) => {
  const generator = stepByStepSimulation(result.minimizedDfa, str);
  let finalStep;
  for (const step of generator) {
    finalStep = step;
  }
  const status = finalStep.accepted ? "✓ ACCEPTED" : "✗ REJECTED";
  if (!finalStep.accepted) minInvalidPass++;
  console.log(`${str.padEnd(12)} => ${status}`);
});
console.log(
  `Minimized DFA Invalid Pass Rate: ${minInvalidPass}/${testStrings.invalid.length}\n`
);

console.log("=== SUMMARY ===");
console.log(
  `NFA:           ${nfaValidPass + nfaInvalidPass}/${
    testStrings.valid.length + testStrings.invalid.length
  } tests passed`
);
console.log(
  `DFA:           ${dfaValidPass + dfaInvalidPass}/${
    testStrings.valid.length + testStrings.invalid.length
  } tests passed`
);
console.log(
  `Minimized DFA: ${minValidPass + minInvalidPass}/${
    testStrings.valid.length + testStrings.invalid.length
  } tests passed`
);
