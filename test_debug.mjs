import { generateAutomata, simulateString } from './src/utils/automataLogic.js';

const regex = 'd(de*d+ef*e+fd*f)df';
const testStrings = {
  valid: ['ddddf', 'ddeddf', 'ddeeddf', 'deedf', 'defedf', 'deffedf', 'dffdf', 'dfdfdf', 'dfddfdf'],
  invalid: ['dedf', 'dddd', 'dddf', 'defdf', 'dfdf', 'ddedef', 'dfffdf']
};

console.log(`Testing regex: ${regex}\n`);

const result = generateAutomata(regex);
if (!result.success) {
  console.error('Error generating automata:', result.error);
  process.exit(1);
}

console.log(`NFA States: ${result.nfa.states.length}`);
console.log(`DFA States: ${result.dfa.states.length}`);
console.log(`Minimized DFA States: ${result.minimizedDfa.states.length}\n`);

console.log('=== VALID STRINGS (Should Accept) ===');
testStrings.valid.forEach(str => {
  const testResult = simulateString(result.dfa, str);
  const status = testResult.accepted ? '✓ ACCEPTED' : '✗ REJECTED';
  console.log(`${str.padEnd(12)} => ${status}`);
});

console.log('\n=== INVALID STRINGS (Should Reject) ===');
testStrings.invalid.forEach(str => {
  const testResult = simulateString(result.dfa, str);
  const status = testResult.accepted ? '✓ ACCEPTED' : '✗ REJECTED';
  console.log(`${str.padEnd(12)} => ${status}`);
});

console.log('\n=== DETAILED TRACE FOR "ddeddf" ===');
const detailResult = simulateString(result.dfa, 'ddeddf');
console.log(JSON.stringify(detailResult, null, 2));
