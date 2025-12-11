import { generateAutomata, stepByStepSimulation } from './src/utils/automataLogic.js';

const regex = 'd(de*d+ef*e+fd*f)df';
const testString = 'ddeddf';

const result = generateAutomata(regex);

console.log('=== TESTING WITH STEP-BY-STEP SIMULATION ===\n');

// Test with DFA
console.log('DFA Accept States:', result.dfa.acceptStates);
console.log('DFA States count:', result.dfa.states.length);
console.log('\nStep-by-step simulation for "ddeddf" on DFA:');

const generator = stepByStepSimulation(result.dfa, testString);
for (const step of generator) {
  console.log(`Step ${step.step}:`, step);
}

console.log('\n\n=== TESTING WITH MINIMIZED DFA ===\n');
console.log('Minimized DFA Accept States:', result.minimizedDfa.acceptStates);
console.log('Minimized DFA States count:', result.minimizedDfa.states.length);
console.log('\nStep-by-step simulation for "ddeddf" on Minimized DFA:');

const generator2 = stepByStepSimulation(result.minimizedDfa, testString);
for (const step of generator2) {
  console.log(`Step ${step.step}:`, step);
}
