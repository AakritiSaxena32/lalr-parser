# **LALR Parser Generator**

A lightweight, web-based tool designed to visualize and generate **LALR (Look-Ahead LR)** parsing tables. This project helps students and developers understand the mechanics of bottom-up parsing by transforming context-free grammars into functional state machines and action/goto tables.



### **🚀 Live Demo**
You can try the tool directly in your browser: [lalr-parser.vercel.app]([lalr-parser-git-main-aakritisaxena2005-9259s-projects.vercel.app](https://lalr-parser-git-main-aakritisaxena2005-9259s-projects.vercel.app/))



## **✨ Features**

* **Grammar Input:** Define your custom context-free grammar via a simple text interface.
* **Collection of Items:** Visualize the $LR(1)$ item sets used to build the states.
* **Parsing Table:** Automatically generates the **Action** and **Goto** tables.
* **Step-by-Step Validation:** Check if a specific string is accepted by the grammar.



## **🛠️ Tech Stack**

* **HTML5 / CSS3:** For a responsive and clean user interface.
* **JavaScript (ES6):** Core logic for grammar processing, closure calculation, and table generation.



## **📂 Project Structure**

* **`index.html`**: The main entry point and UI layout.
* **`css/`**: Contains styling for the tables and input forms.
* **`js/`**: Contains the parsing algorithms and DOM manipulation logic.
