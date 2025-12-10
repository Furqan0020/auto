# 🎓 Automata Visualizer

**Theory of Automata - Visualization Suite**  
**Group 4 - Furqan Azeem**

A production-ready React application that visualizes **Regular Expressions** through **NFA**, **DFA**, and **Minimized DFA** using D3.js force-directed graphs.

---

## ✨ Features

- 🔄 **Complete Automata Pipeline:** Regex → NFA → DFA → Minimized DFA
- 🎨 **Beautiful Visualization:** Interactive D3.js force-directed graphs
- ⚡ **Real-time Simulation:** Step-by-step string processing with live highlighting
- 🧪 **Comprehensive Testing:** Built-in test cases with Accept/Reject feedback
- 📚 **Full Documentation:** Algorithm explanations and viva preparation guides

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173/ in your browser.

---

## 🎯 Assigned Regex

**`(a+aaa+aa)*cc+ba+aa`**

This regex has three patterns:
- **A:** `(a+aaa+aa)*cc` - Any number of a's followed by cc
- **B:** `ba` - Exactly "ba"
- **C:** `aa` - Exactly "aa"

---

## 📖 Usage

1. Click **"Load Assigned Task"** to auto-fill the regex
2. Click **"Generate Automata"** to build NFA, DFA, and Minimized DFA
3. Switch between tabs to view different representations
4. Enter a test string or click quick test buttons
5. Click **"Play"** to watch real-time simulation
6. Observe **green (Accept)** or **red (Reject)** results

---

## 🧪 Test Cases

### Valid ✅
`cc` `acc` `aacc` `aaacc` `ba` `aa`

### Invalid ❌
`c` `a` `aaa` `b` `bac` `caa` `aba`

---

## 🛠️ Technology Stack

- **React 18+** with Vite
- **D3.js v7** for visualization
- **lucide-react** for icons
- **Pure JavaScript** (no automata libraries)

---

## 📁 Project Structure

```
src/
├── components/
│   └── AutomataGraph.jsx      # D3.js visualization
├── utils/
│   └── automataLogic.js       # Core algorithms
├── App.jsx                    # Main UI
└── App.css                    # Styling
```

---

## 🎓 Academic Features

### Algorithms (Manual Implementation)
- ✅ **Shunting-Yard Parser** - Operator precedence handling
- ✅ **Thompson's NFA Construction** - Builds NFA from postfix regex
- ✅ **Subset Construction** - Converts NFA to DFA using ε-closure
- ✅ **Table-Filling Minimization** - Produces minimal DFA

### Visualization Features
- ✅ **Color-coded states** (Start: green, Final: blue double-circle)
- ✅ **Edge merging** (Multiple transitions → single label)
- ✅ **Self-loops** as curved arcs
- ✅ **Real-time highlighting** during simulation
- ✅ **Interactive controls** (drag, zoom, pan)

---

## 📚 Documentation

- **DOCUMENTATION.md** - Complete project overview
- **TESTING_GUIDE.md** - 15 test cases with instructions
- **VIVA_REFERENCE.md** - Quick reference for presentations
- **PROJECT_SUMMARY.md** - Full deliverables summary

---

## 🏆 Critical Demo: "aacc"

This test case demonstrates **Accept → Reject → Accept** behavior:

```
Step 2 (aa):   ✅ ACCEPT (Pattern C)
Step 3 (aac):  ❌ REJECT (intermediate)
Step 4 (aacc): ✅ ACCEPT (Pattern A)
```

This proves the DFA correctly handles overlapping patterns.

---

## 👨‍💻 Author

**Furqan Azeem**  
Group 4  
Theory of Automata - Fall 2024

---

## 📄 License

Educational Project - Free to use for learning purposes

---

## 🙏 Acknowledgments

Built with React, D3.js, and a deep understanding of automata theory.

---

**Status:** ✅ Production Ready | 🎓 Viva Ready | 🚀 Deployed
