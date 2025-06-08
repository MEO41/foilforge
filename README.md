<!-- ===========================  ForgeFoil README  =========================== -->

<h1 align="center">ForgeFoil &mdash; Airfoil Optimization Platform</h1>

<p align="center">
  <a href="https://github.com/MEO41/foilforge/actions/workflows/ci.yml">
    <img alt="Build" src="https://img.shields.io/github/actions/workflow/status/MEO41/foilforge/ci.yml?label=build">
  </a>
  <a href="https://github.com/MEO41/foilforge/issues">
    <img alt="Open Issues" src="https://img.shields.io/github/issues/MEO41/foilforge">
  </a>
  <a href="./LICENSE">
    <img alt="License" src="https://img.shields.io/github/license/MEO41/foilforge">
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
[Your chosen license]

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
