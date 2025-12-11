import { generateAutomata, stepByStepSimulation } from './src/utils/automataLogic.js';

const regex = 'd(de*d+ef*e+fd*f)df';
const testString = 'ddeddf';

const result = generateAutomata(regex);

console.log('Testing NFA simulation with epsilon closure handling\n');
console.log('=== NFA Simulation for "ddeddf" ===');

const nfaGenerator = stepByStepSimulation(result.nfa, testString);
for (const step of nfaGenerator) {
  console.log(`Step ${step.step}: Char='${step.char || 'START'}', State=${step.state}, Accepted=${step.accepted}, Complete=${step.complete}`);
  if (step.states) {
    console.log(`  → All reachable states: [${step.states.join(', ')}]`);
  }
}

console.log('\n=== DFA Simulation for "ddeddf" ===');
const dfaGenerator = stepByStepSimulation(result.dfa, testString);
for (const step of dfaGenerator) {
  console.log(`Step ${step.step}: Char='${step.char || 'START'}', State=${step.state}, Accepted=${step.accepted}, Complete=${step.complete}`);
}

console.log('\n=== Minimized DFA Simulation for "ddeddf" ===');
const minDfaGenerator = stepByStepSimulation(result.minimizedDfa, testString);
for (const step of minDfaGenerator) {
  console.log(`Step ${step.step}: Char='${step.char || 'START'}', State=${step.state}, Accepted=${step.accepted}, Complete=${step.complete}`);
}
