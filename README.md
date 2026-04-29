# Visionary Parser 🎙️🤖
### **Interactive LALR(1) Compiler Construction & Visualization Engine**

**Visionary Parser** is a sophisticated, "software-only" educational tool designed to demystify the complexities of compiler design. By integrating **Natural Language Processing (NLP)** and **Voice Assistance**, it allows students to visualize the entire lifecycle of an LALR(1) parser—from English descriptions to a fully functional parse tree.

---

## 🌟 Core Capabilities

### 🧠 Hybrid Input Engine
* **NLP Assistant**: A pattern-matching heuristic engine that translates descriptive English into formal BNF notation. 
* **BNF Mode**: Direct entry for seasoned developers familiar with standard grammar syntax.

### 🔍 Deep Trace Visualization
* **First & Follow Sets**: Real-time computation of terminal lookahead sets.
* **Canonical Collection**: Full derivation of LR(1) items and state transitions.
* **LALR Optimization**: Visual mapping of the state-merging process used in tools like YACC and Bison.
* **Action/Goto Tables**: Interactive logic tables representing the final parser state machine.

### 🎙️ Human-Centric Interface
* **Voice Narrator**: Built-in voice synthesis that explains errors, ambiguity warnings, and parsing success.
* **Live Simulation**: A real-time trace of the Stack, Symbols, and Input Buffer during string validation.
* **Dynamic Parse Tree**: A visual, hierarchical representation of the derivation process.

---

## 🛠️ Technical Architecture

| Component | Technology | Responsibility |
| :--- | :--- | :--- |
| **Logic Engine** | Vanilla JavaScript | LALR State Machine, Item Set Merging |
| **NLP Module** | Regex Pattern Matching | Heuristic translation of descriptive rules |
| **Interface** | HTML5 / CSS3 | Modern "Terminal" Aesthetic with Syne & JetBrains Mono |
| **Audio API** | Web Speech API | Real-time auditory feedback and guidance |

---

## 🚀 Step-by-Step Usage

1. **Define**: Use the **NLP Assistant** to describe your grammar (e.g., *"Term is Term times Fact or Fact"*).
2. **Compile**: Click **Run** to generate the LALR states and parsing table.
3. **Analyze**: Explore the sidebar to see how the grammar was decomposed and optimized.
4. **Test**: Go to **Simulate** and enter space-separated tokens (e.g., `id + id * id`).
5. **Visualize**: View the resulting **Parse Tree** to see the derivation hierarchy.

---

### 📄 License
This project is open-source and intended for educational use in Computer Science curricula.


## **📂 Project Structure**
visionary-parser/
├── index.html          # Main entry point (the UI)
├── README.md           # Project documentation and features
├── css/
│   └── style.css       # Terminal aesthetic and NLP UI styles
└── js/
    ├── state.js        # Global state management
    ├── nlp.js          # NEW: NLP to BNF translation engine
    ├── voice.js        # Web Speech API & voice logic
    ├── nav.js          # Sidebar navigation and UI controllers
    ├── grammar.js      # BNF parsing and augmentation logic
    ├── firstfollow.js  # FIRST/FOLLOW set computation
    ├── lr1.js          # LR(1) Item set generation
    ├── lalr.js         # LALR state merging logic
    ├── parsetable.js   # ACTION/GOTO table construction
    └── parser.js       # Input simulation and tree rendering
