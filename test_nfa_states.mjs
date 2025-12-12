import { generateAutomata } from "./src/utils/automataLogic.js";

const result = generateAutomata("d(de*d+ef*e+fd*f)df");

console.log("=== NFA State Information ===");
result.nfa.states.forEach((state) => {
  console.log(`State ${state.id}: isAccept=${state.isAccept}`);
});

console.log('\n=== Final States in Last Step of "ddeddf" ===');
console.log("State 33 isAccept?", result.nfa.states[33]?.isAccept);
console.log("All accept states:", result.nfa.acceptStates);
