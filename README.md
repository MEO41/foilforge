<!-- ===========================  ForgeFoil README  =========================== -->

<h1 align="center">ForgeFoil &mdash; Airfoil Optimization Platform</h1>

<p align="center">
  <a href="https://github.com/MEO41/foilforge/actions/workflows/ci.yml">
    <img alt="Build" src="https://img.shields.io/github/actions/workflow/status/MEO41/foilforge/ci.yml?label=build">
  </a>
  <a href="https://github.com/MEO41/foilforge/issues">
    <img alt="Open Issues" src="https://img.shields.io/github/issues/MEO41/foilforge">
  </a>
  <a href="./LICENSE.md">
    <img alt="License" src="https://img.shields.io/badge/License-MIT-yellow.svg">
  </a>
</p>
<p align="center">
  <img src="https://github.com/MEO41/foilforge/raw/main/image.png" alt="ForgeFoil Screenshot" width="640">
</p>


---

## Table&nbsp;of&nbsp;Contents
1. [Overview](#overview)  
2. [Key Features](#key-features)  
3. [Architecture & Tech Stack](#architecture--tech-stack)  
4. [Quick Start](#quick-start)  
5. [Contributing](#contributing)  
6. [License](#license)  
7. [Additional Resources](#additional-resources)  

---

## Overview
**ForgeFoil** is a web-based platform for aerodynamicists to **visualize, analyze and optimize airfoil geometries**. It combines an intuitive UI with powerful numerical tooling, enabling rapid design iterations and comparison of performance metrics.

---

## Key Features
| Category | Description |
|----------|-------------|
| Interactive Visualization | Real-time SVG rendering of airfoil profiles with coordinate inspection |
| Performance Analytics | Instant computation of Cl, Cd, Cm and L/D across the operating envelope |
| Optimization Engine | Automated parameter sweeps and gradient-based optimizations with live progress feedback |
| Project Tracking | Save, load and compare multiple design studies in a single workspace |
| Modern UI | Responsive React/Next.js front-end styled with Tailwind CSS |

---
## Architecture & Tech Stack
| Layer | Technology |
|-------|------------|
| **Front-end** | Next.js (React + TypeScript), Tailwind CSS |
| **Visualization** | Native SVG + D3 utilities |
| **State-Management** | React hooks & Context API |
| **Back-end** | Python / FastAPI (REST) |
| **Numerics** | NumPy, SciPy, XFoil wrappers |
| **CI/CD** | GitHub Actions & Vercel deployment |

---

## Quick Start

### Prerequisites
* **Node.js ≥ 18** and **npm**  
* **Python ≥ 3.9** (recommend using a virtual environment)

### 1. Clone the Repository
```bash
git clone https://github.com/MEO41/foilforge.git
cd foilforge
#front end setup
npm install          # install JS/TS dependencies
npm run dev          # start Next.js dev server
# → visit http://localhost:3000
#backend setup
python -m venv .venv && source .venv/bin/activate  # optional but recommended
pip install -r backend/requirements.txt
python backend/run.py
# → default API endpoint: http://localhost:8000

```
## License
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
# Additional Resources

Here are some helpful tools, libraries, and documentation relevant to ForgeFoil:

## 🔧 Development Tools
- **Next.js Documentation**  
  https://nextjs.org/docs

- **React Docs**  
  https://reactjs.org/docs/

- **Tailwind CSS**  
  https://tailwindcss.com/docs

- **TypeScript Docs**  
  https://www.typescriptlang.org/docs/

- **FastAPI**  
  https://fastapi.tiangolo.com/

- **Python Virtual Environments**  
  https://docs.python.org/3/tutorial/venv.html

## 📈 Visualization & Data
- **SVG Basics (MDN)**  
  https://developer.mozilla.org/en-US/docs/Web/SVG

- **D3.js (if used)**  
  https://d3js.org/

## 🛠 Utilities
- **Shields.io (Badges)**  
  https://shields.io/

- **Vercel Deployment**  
  https://vercel.com/docs

---

Let us know if there are other tools you'd recommend including!
