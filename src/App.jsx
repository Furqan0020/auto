import { useState } from "react";
import { Play, RotateCcw, Loader } from "lucide-react";
import AutomataGraph from "./components/AutomataGraph";
import { generateAutomata, stepByStepSimulation } from "./utils/automataLogic";
import "./App.css";

const ASSIGNED_REGEX = "d(de*d+ef*e+fd*f)df";

function App() {
  const [regex, setRegex] = useState("");
  const [automata, setAutomata] = useState(null);
  const [activeTab, setActiveTab] = useState("nfa");
  const [testString, setTestString] = useState("");
  const [simulationState, setSimulationState] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = () => {
    if (!regex.trim()) {
      setError("Please enter a regular expression");
      return;
    }

    setError("");
    const result = generateAutomata(regex);

    if (result.success) {
      setAutomata(result);
      setActiveTab("nfa");
      setSimulationState(null);
    } else {
      setError(result.error);
    }
  };

  const handleLoadAssigned = () => {
    setRegex(ASSIGNED_REGEX);
    setError("");
  };

  const handleSimulate = () => {
    if (!automata) {
      setError("Please generate an automaton first");
      return;
    }

    if (!testString) {
      setError("Please enter a test string");
      return;
    }

    setError("");
    setIsSimulating(true);

    // Get the current automaton based on active tab
    let currentAutomaton;
    if (activeTab === "nfa") {
      currentAutomaton = automata.nfa;
    } else if (activeTab === "dfa") {
      currentAutomaton = automata.dfa;
    } else {
      currentAutomaton = automata.minimizedDfa;
    }

    // Run step-by-step simulation
    const generator = stepByStepSimulation(currentAutomaton, testString);
    let stepIndex = 0;

    const runStep = () => {
      const { value, done } = generator.next();

      if (done) {
        setIsSimulating(false);
        return;
      }

      setSimulationState(value);

      if (!value.complete) {
        stepIndex++;
        setTimeout(runStep, 800); // 800ms delay between steps
      } else {
        setIsSimulating(false);
      }
    };

    runStep();
  };

  const handleReset = () => {
    setSimulationState(null);
    setIsSimulating(false);
  };

  const getCurrentAutomaton = () => {
    if (!automata) return null;
    if (activeTab === "nfa") return automata.nfa;
    if (activeTab === "dfa") return automata.dfa;
    return automata.minimizedDfa;
  };

  const getResultMessage = () => {
    if (!simulationState) return null;
    if (!simulationState.complete) return null;

    if (simulationState.stuck) {
      return (
        <div className="result-message rejected">
          <span className="result-icon">✗</span>
          <span>REJECTED - No transition for '{simulationState.char}'</span>
        </div>
      );
    }

    if (simulationState.accepted) {
      return (
        <div className="result-message accepted">
          <span className="result-icon">✓</span>
          <span>ACCEPTED</span>
        </div>
      );
    }

    return (
      <div className="result-message rejected">
        <span className="result-icon">✗</span>
        <span>REJECTED - Not in final state</span>
      </div>
    );
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Automata Visualizer</h1>
        <p className="subtitle">Group 5 </p>
      </header>

      <div className="container">
        {/* Control Panel */}
        <div className="control-panel">
          <div className="input-group">
            <label htmlFor="regex">Regular Expression:</label>
            <div className="input-row">
              <input
                id="regex"
                type="text"
                value={regex}
                onChange={(e) => setRegex(e.target.value)}
                placeholder="Enter regex (e.g., a*b+c)"
                className="text-input"
              />
              <button
                onClick={handleLoadAssigned}
                className="btn btn-secondary"
              >
                Load Assigned Task
              </button>
            </div>
          </div>

          <button onClick={handleGenerate} className="btn btn-primary">
            Generate Automata
          </button>

          {error && <div className="error-message">{error}</div>}

          {automata && (
            <div className="info-box">
              <p>
                <strong>Postfix:</strong> {automata.postfix}
              </p>
              <p>
                <strong>Alphabet:</strong> {automata.nfa.alphabet.join(", ")}
              </p>
            </div>
          )}
        </div>

        {/* Visualization */}
        {automata && (
          <div className="visualization-section">
            <div className="tabs">
              <button
                className={`tab ${activeTab === "nfa" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("nfa");
                  handleReset();
                }}
              >
                NFA
              </button>
              <button
                className={`tab ${activeTab === "dfa" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("dfa");
                  handleReset();
                }}
              >
                DFA
              </button>
              <button
                className={`tab ${activeTab === "minimized" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("minimized");
                  handleReset();
                }}
              >
                Minimized DFA
              </button>
            </div>

            <div className="graph-container">
              <AutomataGraph
                automaton={getCurrentAutomaton()}
                highlightedState={simulationState?.state}
              />
            </div>

            {/* Statistics */}
            <div className="stats">
              <div className="stat-item">
                <span className="stat-label">States:</span>
                <span className="stat-value">
                  {getCurrentAutomaton().states.length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Transitions:</span>
                <span className="stat-value">
                  {getCurrentAutomaton().transitions.length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Accept States:</span>
                <span className="stat-value">
                  {getCurrentAutomaton().acceptStates.length}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Simulation Panel */}
        {automata && (
          <div className="simulation-panel">
            <h3>String Simulation & Testing</h3>

            <div className="input-group">
              <label htmlFor="testString">Test String:</label>
              <input
                id="testString"
                type="text"
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                placeholder="Enter string to test"
                className="text-input"
                disabled={isSimulating}
              />
            </div>

            <div className="simulation-controls">
              <button
                onClick={handleSimulate}
                className="btn btn-primary"
                disabled={isSimulating || !testString}
              >
                {isSimulating ? (
                  <>
                    <Loader className="icon spinning" />
                    Simulating...
                  </>
                ) : (
                  <>
                    <Play className="icon" />
                    Play
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                className="btn btn-secondary"
                disabled={isSimulating}
              >
                <RotateCcw className="icon" />
                Reset
              </button>
            </div>

            {simulationState && (
              <div className="simulation-feedback">
                <div className="step-info">
                  <p>
                    <strong>Step:</strong> {simulationState.step} /{" "}
                    {testString.length}
                  </p>
                  <p>
                    <strong>Current State:</strong> q{simulationState.state}
                  </p>
                  {simulationState.char && (
                    <p>
                      <strong>Reading:</strong> '{simulationState.char}'
                    </p>
                  )}
                </div>

                {getResultMessage()}
              </div>
            )}

            {/* Test Cases */}
            <div className="test-cases">
              <h4>Quick Test Cases for: {ASSIGNED_REGEX}</h4>
              <div className="test-grid">
                <div className="test-column">
                  <p className="test-header">Valid (Should Accept)</p>
                  {[
                    "ddddf",
                    "ddeddf",
                    "ddeeddf",
                    "deedf",
                    "defedf",
                    "deffedf",
                    "dffdf",
                    "dfdfdf",
                    "dfddfdf",
                  ].map((str) => (
                    <button
                      key={str}
                      className="test-btn valid"
                      onClick={() => setTestString(str)}
                    >
                      {str}
                    </button>
                  ))}
                </div>
                <div className="test-column">
                  <p className="test-header">Invalid (Should Reject)</p>
                  {[
                    "dedf",
                    "dddd",
                    "dddf",
                    "defdf",
                    "dfdf",
                    "ddedef",
                    "dfffdf",
                  ].map((str) => (
                    <button
                      key={str}
                      className="test-btn invalid"
                      onClick={() => setTestString(str)}
                    >
                      {str}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
