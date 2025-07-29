# 🤖 AI-Powered : Research Paper : PDF Reader

Instantly transform dense, complex research papers into understandable and interactive documents. This tool uses the power of Google's Gemini AI to analyze any uploaded PDF, providing you with summaries, definitions, and an intelligent reading experience so you can focus on what matters most.


---

## 🚀 Live Demo

Watch a full demonstration of the workflow, from uploading a PDF to interacting with the AI-powered analysis.

![AI PDF Assistant Demo GIF](<assets/demo.gif>)

---

## ✨ Core Features

The Reader aids in understanding the paper easily and efficiently.

### 🧠 Intelligent Document Analysis
At its core, the application leverages a powerful AI model to perform a deep analysis of your PDF content, presented in a clean, accessible sidebar.

* **Executive Summary:** Get a high-level, easy-to-understand summary of the paper's main contributions, methodology, and findings.
* **Key Concepts:** Automatically extracts important technical terms and provides simple definitions for each.
* **People & Entities:** Identifies all mentioned authors and individuals, providing context about who they are.
* **Section-by-Section Summaries:** Generates concise summaries for each major section of the paper, accessible via a ✨ icon next to the section title.

![Main Application Interface with Analysis Sidebar](<assets/screenshot-main.png>)

###  Interactive Reading Experience
The PDF viewer is not just a static page. It's an interactive environment designed to provide context exactly when you need it.

#### Smart Keyword Definitions
Hover over any highlighted keyword to get an instant, AI-generated definition, helping you grasp complex topics without breaking your reading flow.

![Keyword Definition Tooltip](<assets/screenshot-keyword.png>)

#### Author Information on Hover
Instantly learn more about the authors and other individuals mentioned in the paper. Just hover over a highlighted name to see a brief description of their role or field.

![Author Description Tooltip](<assets/screenshot-author.png>)

#### Instant Reference Previews
No more scrolling to the end of the paper to find a reference. Hover over any citation number to see the full reference in a convenient tooltip. While hovering provides a preview, clicking the citation will perform a targeted Google search for the source.

![Reference Preview Tooltip](<assets/screenshot-reference.png>)

### 🎨 Modern User Interface
Aesthetics and usability are key.
* **Sleek & Responsive Design:** A clean, modern interface that works beautifully on all screen sizes.
* **Light & Dark Modes:** Automatically detects your system preference and provides a comfortable viewing experience, day or night.

![Dark Mode Interface](<assets/screenshot-darkmode.png>)

---

## 🛠️ Tech Stack

This project is built with modern web technologies:

* **Frontend:** HTML5, CSS3, JavaScript (ES6 Modules)
* **PDF Rendering:** [PDF.js](https://mozilla.github.io/pdf.js/) by Mozilla
* **AI Backend:** [Google Gemini API](https://ai.google.dev/)
* **Icons:** [Material Icons](https://fonts.google.com/icons)

---

## ⚙️ How to Use

To get a local copy up and running, follow these simple steps.

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/agentsc07/gemini-pdf-reader.git](https://github.com/agentsc07/gemini-pdf-reader.git)
    ```
2.  **Get your API Key:**
    * Create an API key from [Google AI Studio](https://ai.google.dev/).
    * Open `src/geminiService.js` and replace the placeholder `YOUR_API_KEY_HERE` with your actual key.
3.  **Run the application:**
    * Due to browser security policies (CORS), you need to run this project from a local server. The easiest way is using the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension for VS Code.
    * Right-click `index.html` and select "Open with Live Server".


___
~ Human Intuition x Machine Logic
 (🤖 x 👨)