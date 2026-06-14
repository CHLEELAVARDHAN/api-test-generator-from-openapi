## TEAM NAME:
TEAM 16
- 4 team members

## We the TEAM MEMBERS:
- 24U45A4204	CH. LEELA VARDHAN
- 23u41a0530	Kurada Haritha
- 23U41A4248	PENTAKOTA SUDHA
- 24U45A0434	YALUSURI KALYANA RAMUDU

## Resumes
Available in the /resumes folder.

## Demo video link
Here's the demo video for this case study project, and can be viewed by the below link...
- https://drive.google.com/file/d/13zFySsNAs983PvtpL0N591hxfkTSgRNJ/view?usp=sharing

## Category
Quality assurance

## Title
API Test Generator from OpenAPI

## Business Problem
Hand-writing API tests for every endpoint is slow.

## Expected POC Output
Reads an OpenAPI/Swagger JSON → LLM generates pytest+requests tests covering happy path, missing required fields, bad types, auth missing.

## AI/AGENT CAPABILITY REQUIRED
Structured spec → code generation.

# Description

An AI-Agentic architecture for generating complete, robust API test suites. Featuring a self-healing JSON Payload agent that applies strict typing and schema validation using both deterministic rule-sets and Gemini-based generative correction.

---

## Setup Instructions

1. **Prerequisites:**
   - Node.js (v18+)
   - Python 3.10+
   - API Key for Google Gemini (Ensure you set `GEMINI_API_KEY` in your environment or `.env` file).

2. **Frontend Setup (React/Vite):**
   ```bash
   npm install
   ```

3. **Backend Setup (Python/Streamlit):**
   ```bash
   pip install streamlit google-genai pytest
   ```

## Run Instructions

1. **Run the React Frontend UI:**
   ```bash
   npm run dev
   ```

2. **Run the Python Agentic Workflow (Streamlit):**
   ```bash
   streamlit run app.py
   ```

---

## Technologies used
#Core AI & Agent Intelligence
- Google Gemini API (gemini-2.5-flash): Acts as the reasoning engine for generative code tracking, structural test building, and autonomous payload self-healing.
- Python ast (Abstract Syntax Tree): Used programmatically by the agent to parse and enforce strict syntactic correctness before delivering the LLM-generated Python Pytest code.
- Agentic Logic & Dashboard (Python)
- Python 3.10+: The primary runtime language powering the validation algorithms and agent loops.
- Streamlit: Utilized as the rapid-application framework to build the dashboard, bridge Python state management, and display the real-time AI Action Thread logs.
Testing Output Stack (Target Code)
- pytest: The standardized testing framework that the agent produces test suites in.
- requests: The standard HTTP library integrated into the generated scripts for endpoint execution.

## Frontend Workspace (React UI Sandbox)
React 18 & TypeScript: The underlying framework running the interactive web client workspace.
- Vite: The build system managing the React environment compilations.
- Tailwind CSS: Used for the structural layout, typography, and styling of the application.
- Lucide React: Powers the vector iconography across the user interface.

---

## Architecture Overview

The system consists of two main pieces:
1. **Agentic Backend (Python)**
   - `parser.py`: Basic payload parsing logic.
   - `validator.py`: Handles strict type checking based on API Schemas and outputs mismatches. Validates generated Pytest AST code for correctness.
   - `self_healing.py`: Attempts to deterministically fix missing types (e.g., bool strings to bool, string numerics to integers/floats). If it fails, falls back to generative LLM-based healing using Gemini.
   - `test_agent.py`: Triggers test generation prompting. Uses `validator.py` to validate the abstract syntax tree of generated code and applies up to 3 automatic retries when issues are found.
   - `app.py` & `analytics.py`: A Streamlit dashboard bridging Python AI logic with analytics and visual tracking.

2. **Frontend Dashboard (React + Tailwind)**
   - Displays real-time API states, architecture diagram simulation, and dynamic metrics showing how many APIs have been processed, healed, and validated successfully.

## Assumptions & Limitations

- **Assumptions:**
  - All input schemas are simple dictionary-based structures (no nested lists/objects for the current iteration).
  - The default local environment resolves port 3000 mapping internally.
- **Limitations:**
  - `TestGenerationAgent` is relying heavily on LLM determinism. Despite AST validation, logical validity is not guaranteed unless executed actively.

---

## AI Usage Note

**What AI helped with:**
- Designing the dual-stack concept (Python Agent logic vs React Dashboard visualization).
- Bootstrapping complex structural components (like AST parsing and validation algorithms).
- Streamlining Streamlit state-management logic without clutter.
- Scaffolding out responsive and fluid Tailwind CSS designs for the generic testing UI dashboard and sidebar.

**What AI got wrong:**
- Initially generated circular imports and variable scoping issues in the self-healing fallback loops. (i.e. Returning immediately inside `for` loops during payload validation logic).
- Sometimes failed to handle the Vite `esbuild` configuration properly during complex package interactions.

**Best Prompts Used During Development**

*Prompt 1 – Self-Healing JSON Agent*

*Generate a complete self-healing module that automatically detects missing fields, invalid data types, and malformed JSON payloads. Apply deterministic corrections first, then use Gemini API as a fallback mechanism when automatic correction is not possible.*

*Prompt 2 – Validation Engine Improvement*

*Review the validator module for logical and structural issues. Identify potential bugs in validation loops, type checking, and return statements. Suggest corrections and provide production-ready improvements.*

*Prompt 3 – UI and Project Refinement*

*Improve the Streamlit user interface by enhancing navigation, sidebar usability, dashboard presentation, and overall user experience. Generate a professional README, maintain clean project structure, and ensure repository readiness for evaluation.*

---

## Sample Data Folder

You can find the structural usage below simulating `Sample Data`.

**Input Files / Payload Structures Used:**
- `email`: `123`
- `password`: `true`
- `age`: `"25"`

**Expected Healed Output Generated:**
- `email`: `"123"` (Coerced)
- `password`: `"true"` (Coerced)
- `age`: `25` (Coerced)

---

## Test Cases
### Happy Path (Pytest equivalent simulated)

```python
import pytest
from validator import PayloadValidator
from self_healing import SelfHealingAgent

def test_happy_path_validation():
    schema = {
        "email": "string",
        "password": "string",
        "age": "integer"
    }
    
    # Valid Payload
    payload = {
        "email": "test@example.com",
        "password": "securepassword",
        "age": 20
    }
    
    validator = PayloadValidator(schema)
    is_valid, errors = validator.validate(payload)
    
    assert is_valid is True
    assert len(errors) == 0

def test_self_healing_deterministic():
    schema = {
        "email": "string",
        "age": "integer"
    }
    
    # Invalid Formats
    payload = {
        "email": 12345,
        "age": "30"
    }
    
    agent = SelfHealingAgent(schema)
    result = agent.heal_payload(payload)
    
    assert result["healing_applied"] is True
    assert result["healed_payload"]["email"] == "12345"
    assert result["healed_payload"]["age"] == 30
```

---

## Prompt Documentation

**Requirement:**
Prompt Documentation.

**Description:**
Maintain a simple notes file containing key prompts used during development.

---

## Ecosystem Analysis & Technical Information

**Category:** Quality Assurance
**Title:** API Test Generator from OpenAPI
**Business Problem:** Hand-writing API tests for every endpoint is slow and error-prone.
**Expected POC Output:** Reads an OpenAPI/Swagger JSON payload → LLM generates automated `pytest` + `requests` tests covering happy paths, missing required fields, bad types, and missing authentication.
**AI/Agent Capability Required:** Structured specification → code generation.

### Mandatory Capabilities Validated

This ecosystem successfully implements multiple mandatory AI/Agent capabilities required for robust code generation logic:

1. **Agent Loop:** 
   - **AST Validation & Retry Loop:** In `test_agent.py`, the agent applies a reflexive loop iterating up to 3 times. If the generated Pytest code fails Abstract Syntax Tree (AST) validation (`validate_generated_pytest_ast()`), the exact syntax error is fed back to the LLM so it can self-correct the payload and re-attempt.
   - **Self-Healing Generative Loop:** In `self_healing.py`, if structural validation fails, the agent attempts deterministic coercion, and loops to generative healing (using the Gemini API) to salvage non-conforming formats before testing resumes.
2. **External API / Service Integration:**
   - Deep integration with the **Google Gemini API** (`pkg: google-genai`, model: `gemini-2.5-flash`). This API acts directly as the intelligence core powering code generation, parsing, and data validation mapping loops.

---

## Any supporting documents

- **`prompts/prompt_test_gen.txt`**: A reference/template file where custom system prompts are kept to drive test generator behaviors.
- **Python Source Files**: The foundational documentation resides as docstrings directly within `parser.py`, `validator.py`, `self_healing.py`, and `test_agent.py`.
- **OpenAPI Schema Samples**: Built directly into the frontend `app.py` for quick validation of the application logic and testing.
- **`package-lock.json`**: Tracks frontend dependencies for consistent React UI builds.

### Installation Commands
\`\`\`bash
# Clone the repository
- git clone https://github.com/CHLEELAVARDHAN/api-test-generator-from-openapi.git
- cd api-test-generator-from-openapi

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\\Scripts\\activate

## Run Instructions

1. **Run the React Frontend UI:**
   ```bash
   npm run dev
   ```

2. **Run the Python Agentic Workflow (Streamlit):**
   ```bash
   streamlit run app.py
   ```
