
function preprocessRegex(regex) {
  let result = "";
  const operators = new Set(["+", "*", "(", ")"]);

  for (let i = 0; i < regex.length; i++) {
    const current = regex[i];
    result += current;

    if (i < regex.length - 1) {
      const next = regex[i + 1];

     
      const needsConcat =
        (!operators.has(current) && !operators.has(next)) ||
        (!operators.has(current) && next === "(") ||
        (current === ")" && !operators.has(next)) ||
        (current === ")" && next === "(") ||
        (current === "*" && !operators.has(next)) ||
        (current === "*" && next === "(");

      if (needsConcat && next !== "*" && next !== "+") {
        result += ".";
      }
    }
  }

  return result;
}

/**
 * Converts infix regex to postfix using Shunting-Yard Algorithm
 * Operator Precedence: * (highest) > . (concatenation) > + (union/or) (lowest)
 */
function infixToPostfix(regex) {
  const preprocessed = preprocessRegex(regex);
  const output = [];
  const stack = [];

  // Operator precedence: higher number = higher precedence
  const precedence = {
    "+": 1, // Union/OR (lowest)
    ".": 2, // Concatenation
    "*": 3, // Kleene Star (highest)
  };

  for (const char of preprocessed) {
    if (char === "(") {
      stack.push(char);
    } else if (char === ")") {
      while (stack.length > 0 && stack[stack.length - 1] !== "(") {
        output.push(stack.pop());
      }
      stack.pop(); // Remove '('
    } else if (char in precedence) {
      while (
        stack.length > 0 &&
        stack[stack.length - 1] !== "(" &&
        precedence[stack[stack.length - 1]] >= precedence[char]
      ) {
        output.push(stack.pop());
      }
      stack.push(char);
    } else {
      // Regular character
      output.push(char);
    }
  }

  while (stack.length > 0) {
    output.push(stack.pop());
  }

  return output.join("");
}

// ==================== PHASE 1: THOMPSON'S NFA CONSTRUCTION ====================

let stateCounter = 0;

function createState() {
  return { id: stateCounter++, isAccept: false };
}

/**
 * Builds an NFA fragment for a single character
 */
function createBasicNFA(char) {
  const start = createState();
  const accept = createState();
  accept.isAccept = true;

  return {
    start,
    accept,
    transitions: [{ from: start.id, to: accept.id, symbol: char }],
  };
}

/**
 * Builds NFA for Kleene Star (a*)
 */
function createStarNFA(nfa) {
  const start = createState();
  const accept = createState();
  accept.isAccept = true;

  const transitions = [
    ...nfa.transitions,
    { from: start.id, to: nfa.start.id, symbol: "ε" }, // Start to inner
    { from: start.id, to: accept.id, symbol: "ε" }, // Skip (zero times)
    { from: nfa.accept.id, to: nfa.start.id, symbol: "ε" }, // Loop back
    { from: nfa.accept.id, to: accept.id, symbol: "ε" }, // Exit
  ];

  // Mark old accept as non-accepting
  nfa.accept.isAccept = false;

  return { start, accept, transitions };
}

/**
 * Builds NFA for Concatenation (ab)
 */
function createConcatNFA(nfa1, nfa2) {
  const transitions = [
    ...nfa1.transitions,
    ...nfa2.transitions,
    { from: nfa1.accept.id, to: nfa2.start.id, symbol: "ε" },
  ];

  nfa1.accept.isAccept = false;

  return { start: nfa1.start, accept: nfa2.accept, transitions };
}

/**
 * Builds NFA for Union (a+b)
 */
function createUnionNFA(nfa1, nfa2) {
  const start = createState();
  const accept = createState();
  accept.isAccept = true;

  const transitions = [
    ...nfa1.transitions,
    ...nfa2.transitions,
    { from: start.id, to: nfa1.start.id, symbol: "ε" },
    { from: start.id, to: nfa2.start.id, symbol: "ε" },
    { from: nfa1.accept.id, to: accept.id, symbol: "ε" },
    { from: nfa2.accept.id, to: accept.id, symbol: "ε" },
  ];

  nfa1.accept.isAccept = false;
  nfa2.accept.isAccept = false;

  return { start, accept, transitions };
}

/**
 * Main Thompson's Construction - Builds NFA from postfix regex
 */
function buildNFA(regex) {
  stateCounter = 0;
  const postfix = infixToPostfix(regex);
  const stack = [];

  for (const char of postfix) {
    if (char === "*") {
      const nfa = stack.pop();
      stack.push(createStarNFA(nfa));
    } else if (char === ".") {
      const nfa2 = stack.pop();
      const nfa1 = stack.pop();
      stack.push(createConcatNFA(nfa1, nfa2));
    } else if (char === "+") {
      const nfa2 = stack.pop();
      const nfa1 = stack.pop();
      stack.push(createUnionNFA(nfa1, nfa2));
    } else {
      stack.push(createBasicNFA(char));
    }
  }

  const nfa = stack[0];

  // Collect all states
  const states = new Set();
  states.add(nfa.start.id);
  states.add(nfa.accept.id);
  nfa.transitions.forEach((t) => {
    states.add(t.from);
    states.add(t.to);
  });

  return {
    states: Array.from(states).map((id) => ({
      id,
      isStart: id === nfa.start.id,
      isAccept: id === nfa.accept.id,
    })),
    startState: nfa.start.id,
    acceptStates: [nfa.accept.id],
    transitions: nfa.transitions,
    alphabet: getAlphabet(nfa.transitions),
  };
}

function getAlphabet(transitions) {
  const alphabet = new Set();
  transitions.forEach((t) => {
    if (t.symbol !== "ε") {
      alphabet.add(t.symbol);
    }
  });
  return Array.from(alphabet).sort();
}

// ==================== PHASE 2: SUBSET CONSTRUCTION (NFA to DFA) ====================

/**
 * Computes epsilon closure of a set of states
 */
function epsilonClosure(states, transitions) {
  const closure = new Set(states);
  const stack = [...states];

  while (stack.length > 0) {
    const state = stack.pop();

    transitions
      .filter((t) => t.from === state && t.symbol === "ε")
      .forEach((t) => {
        if (!closure.has(t.to)) {
          closure.add(t.to);
          stack.push(t.to);
        }
      });
  }

  return Array.from(closure).sort((a, b) => a - b);
}

/**
 * Computes the move set for a state on a symbol
 */
function move(states, symbol, transitions) {
  const result = new Set();

  states.forEach((state) => {
    transitions
      .filter((t) => t.from === state && t.symbol === symbol)
      .forEach((t) => result.add(t.to));
  });

  return Array.from(result);
}

/**
 * Converts NFA to DFA using Subset Construction
 */
function nfaToDFA(nfa) {
  const dfaStates = [];
  const dfaTransitions = [];
  const stateMap = new Map(); // Maps state set string to DFA state id
  let dfaStateCounter = 0;

  // Start with epsilon closure of NFA start state
  const startClosure = epsilonClosure([nfa.startState], nfa.transitions);
  const startKey = startClosure.join(",");
  stateMap.set(startKey, dfaStateCounter);

  const startIsAccept = startClosure.some((s) => nfa.acceptStates.includes(s));
  dfaStates.push({
    id: dfaStateCounter,
    nfaStates: startClosure,
    isStart: true,
    isAccept: startIsAccept,
  });
  dfaStateCounter++;

  const queue = [startClosure];
  const processed = new Set([startKey]);

  while (queue.length > 0) {
    const currentStates = queue.shift();
    const currentKey = currentStates.join(",");
    const currentDfaId = stateMap.get(currentKey);

    // For each symbol in alphabet
    nfa.alphabet.forEach((symbol) => {
      const moveSet = move(currentStates, symbol, nfa.transitions);
      if (moveSet.length === 0) return;

      const closure = epsilonClosure(moveSet, nfa.transitions);
      const closureKey = closure.join(",");

      if (!stateMap.has(closureKey)) {
        stateMap.set(closureKey, dfaStateCounter);
        const isAccept = closure.some((s) => nfa.acceptStates.includes(s));
        dfaStates.push({
          id: dfaStateCounter,
          nfaStates: closure,
          isStart: false,
          isAccept,
        });
        dfaStateCounter++;

        if (!processed.has(closureKey)) {
          queue.push(closure);
          processed.add(closureKey);
        }
      }

      dfaTransitions.push({
        from: currentDfaId,
        to: stateMap.get(closureKey),
        symbol,
      });
    });
  }

  return {
    states: dfaStates,
    startState: 0,
    acceptStates: dfaStates.filter((s) => s.isAccept).map((s) => s.id),
    transitions: dfaTransitions,
    alphabet: nfa.alphabet,
  };
}

// ==================== PHASE 3: DFA MINIMIZATION (Table-Filling Algorithm) ====================

/**
 * Minimizes DFA using Table-Filling Algorithm
 */
function minimizeDFA(dfa) {
  const n = dfa.states.length;

  // Create distinguishability table
  const table = Array(n)
    .fill(null)
    .map(() => Array(n).fill(false));

  // Step 1: Mark all pairs of (final, non-final) states as distinguishable
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const isFinal_i = dfa.states[i].isAccept;
      const isFinal_j = dfa.states[j].isAccept;

      if (isFinal_i !== isFinal_j) {
        table[i][j] = true;
      }
    }
  }

  // Step 2: Iteratively mark distinguishable pairs
  let changed = true;
  while (changed) {
    changed = false;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (table[i][j]) continue; // Already distinguishable

        // Check if there exists a symbol that distinguishes them
        for (const symbol of dfa.alphabet) {
          const next_i = getNextState(
            dfa.states[i].id,
            symbol,
            dfa.transitions
          );
          const next_j = getNextState(
            dfa.states[j].id,
            symbol,
            dfa.transitions
          );

          if (next_i !== null && next_j !== null) {
            const min = Math.min(next_i, next_j);
            const max = Math.max(next_i, next_j);

            if (table[min][max]) {
              table[i][j] = true;
              changed = true;
              break;
            }
          } else if (next_i !== next_j) {
            // One has transition, other doesn't
            table[i][j] = true;
            changed = true;
            break;
          }
        }
      }
    }
  }

  // Step 3: Group indistinguishable states (equivalence classes)
  const groups = [];
  const stateToGroup = new Map();

  for (let i = 0; i < n; i++) {
    if (stateToGroup.has(i)) continue;

    const group = [i];
    stateToGroup.set(i, groups.length);

    for (let j = i + 1; j < n; j++) {
      if (!table[i][j]) {
        // Indistinguishable
        group.push(j);
        stateToGroup.set(j, groups.length);
      }
    }

    groups.push(group);
  }

  // Step 4: Build minimized DFA
  const minStates = groups.map((group, idx) => {
    const representative = dfa.states[group[0]];
    return {
      id: idx,
      originalStates: group,
      isStart: group.includes(dfa.startState),
      isAccept: representative.isAccept,
    };
  });

  const minTransitions = [];
  const addedTransitions = new Set();

  groups.forEach((group, fromIdx) => {
    const representative = group[0];

    dfa.alphabet.forEach((symbol) => {
      const nextState = getNextState(representative, symbol, dfa.transitions);
      if (nextState !== null) {
        const toIdx = stateToGroup.get(nextState);
        const key = `${fromIdx}-${symbol}-${toIdx}`;

        if (!addedTransitions.has(key)) {
          minTransitions.push({
            from: fromIdx,
            to: toIdx,
            symbol,
          });
          addedTransitions.add(key);
        }
      }
    });
  });

  return {
    states: minStates,
    startState: minStates.find((s) => s.isStart).id,
    acceptStates: minStates.filter((s) => s.isAccept).map((s) => s.id),
    transitions: minTransitions,
    alphabet: dfa.alphabet,
  };
}

function getNextState(stateId, symbol, transitions) {
  const transition = transitions.find(
    (t) => t.from === stateId && t.symbol === symbol
  );
  return transition ? transition.to : null;
}

/**
 * Computes epsilon closure of a state in NFA
 */
function getEpsilonClosure(stateId, transitions) {
  const closure = new Set([stateId]);
  const stack = [stateId];

  while (stack.length > 0) {
    const current = stack.pop();
    const epsilonTransitions = transitions.filter(
      (t) => t.from === current && t.symbol === "ε"
    );

    for (const trans of epsilonTransitions) {
      if (!closure.has(trans.to)) {
        closure.add(trans.to);
        stack.push(trans.to);
      }
    }
  }

  return closure;
}

/**
 * Get all reachable states from a set of states with a given symbol (for NFA)
 */
function getNextStatesNFA(stateIds, symbol, transitions) {
  const nextStates = new Set();

  for (const stateId of stateIds) {
    const nextState = getNextState(stateId, symbol, transitions);
    if (nextState !== null) {
      nextStates.add(nextState);
    }
  }

  return nextStates;
}

// ==================== STRING SIMULATION ====================

/**
 * Simulates a string on the DFA and returns the path taken
 */
function simulateString(dfa, inputString) {
  let currentState = dfa.startState;
  const path = [currentState];

  for (const char of inputString) {
    const nextState = getNextState(currentState, char, dfa.transitions);

    if (nextState === null) {
      return { accepted: false, path, stuck: true, stuckAt: char };
    }

    currentState = nextState;
    path.push(currentState);
  }

  const accepted = dfa.acceptStates.includes(currentState);
  return { accepted, path, stuck: false };
}

/**
 * Step-by-step simulation for real-time visualization
 * Handles both NFA (with epsilon transitions) and DFA
 */
function* stepByStepSimulation(automaton, inputString) {
  // Check if this is an NFA (has epsilon transitions)
  const hasEpsilonTransitions = automaton.transitions.some(
    (t) => t.symbol === "ε"
  );

  if (hasEpsilonTransitions) {
    // NFA simulation
    yield* stepByStepSimulationNFA(automaton, inputString);
  } else {
    // DFA simulation
    yield* stepByStepSimulationDFA(automaton, inputString);
  }
}

/**
 * Step-by-step DFA simulation
 */
function* stepByStepSimulationDFA(dfa, inputString) {
  let currentState = dfa.startState;
  const isAccepting = dfa.acceptStates.includes(currentState);

  yield {
    step: 0,
    char: null,
    state: currentState,
    accepted: isAccepting,
    complete: inputString.length === 0,
  };

  for (let i = 0; i < inputString.length; i++) {
    const char = inputString[i];
    const nextState = getNextState(currentState, char, dfa.transitions);

    if (nextState === null) {
      yield {
        step: i + 1,
        char,
        state: currentState,
        accepted: false,
        complete: true,
        stuck: true,
      };
      return;
    }

    currentState = nextState;
    const isAccepting = dfa.acceptStates.includes(currentState);

    yield {
      step: i + 1,
      char,
      state: currentState,
      accepted: isAccepting,
      complete: i === inputString.length - 1,
    };
  }
}

/**
 * Step-by-step NFA simulation with epsilon closure
 */
function* stepByStepSimulationNFA(nfa, inputString) {
  // Get initial epsilon closure
  let currentStates = getEpsilonClosure(nfa.startState, nfa.transitions);

  // Check if any state in closure is accepting
  const isAccepting = Array.from(currentStates).some((s) =>
    nfa.acceptStates.includes(s)
  );

  yield {
    step: 0,
    char: null,
    state: Array.from(currentStates)[0], // Show first state for visualization
    states: Array.from(currentStates), // All states in closure
    accepted: isAccepting,
    complete: inputString.length === 0,
  };

  for (let i = 0; i < inputString.length; i++) {
    const char = inputString[i];

    // Get next states from all current states
    const nextStates = getNextStatesNFA(currentStates, char, nfa.transitions);

    if (nextStates.size === 0) {
      yield {
        step: i + 1,
        char,
        state: Array.from(currentStates)[0],
        states: Array.from(currentStates),
        accepted: false,
        complete: true,
        stuck: true,
      };
      return;
    }

    // Compute epsilon closure of all next states
    const closureStates = new Set();
    for (const state of nextStates) {
      const closure = getEpsilonClosure(state, nfa.transitions);
      closure.forEach((s) => closureStates.add(s));
    }

    currentStates = closureStates;

    // Check if any state in closure is accepting
    const isAccepting = Array.from(currentStates).some((s) =>
      nfa.acceptStates.includes(s)
    );

    yield {
      step: i + 1,
      char,
      state: Array.from(currentStates)[0],
      states: Array.from(currentStates),
      accepted: isAccepting,
      complete: i === inputString.length - 1,
    };
  }
}

// ==================== MAIN PIPELINE ====================

export function generateAutomata(regex) {
  try {
    const nfa = buildNFA(regex);
    const dfa = nfaToDFA(nfa);
    const minimizedDfa = minimizeDFA(dfa);

    return {
      success: true,
      nfa,
      dfa,
      minimizedDfa,
      postfix: infixToPostfix(regex),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export { simulateString, stepByStepSimulation };
