# 🚀 Agentify - AI-Powered CRM System for VPBank

<div align="center">

**VPBANK TECHNOLOGY HACKATHON 2025 – SENIOR TRACK: HACK2HIRE**

**Team #22 | Task #16: AI Agents for the CRM System**

[![License](https://img.shields.io/badge/license-Internal-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.0+-blue.svg)](https://www.typescriptlang.org/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Component Setup](#-component-setup)
- [API Documentation](#-api-documentation)
- [Demo & Screenshots](#-demo--screenshots)
- [Team](#-team)
- [License](#-license)

---

## 🎯 Overview

**Agentify** is an intelligent AI-powered CRM system designed specifically for VPBank's Relationship Managers (RMs). The system leverages cutting-edge AI technology to streamline customer relationship management, automate routine tasks, and provide intelligent recommendations for card products and customer engagement.

### Problem Statement

Relationship Managers at VPBank face challenges in:
- Managing large customer portfolios efficiently
- Personalizing customer communications at scale
- Identifying optimal card product recommendations
- Tracking and managing daily tasks effectively
- Generating timely, personalized customer outreach

### Our Solution

Agentify provides an AI copilot that:
- ✅ Understands natural language queries in Vietnamese
- ✅ Accesses real-time customer and product data
- ✅ Provides AI-powered recommendations using advanced algorithms
- ✅ Automates email and message generation for customer touchpoints
- ✅ Manages tasks with intelligent reminders and performance tracking
- ✅ Offers a modern, intuitive web interface for seamless interaction

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Agentify System                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│                  │         │                  │         │                  │
│  Agentify Web    │◄───────►│ Agentify Backend │◄───────►│   MCP Server     │
│   (Frontend)     │         │   (AI Agent)     │         │  (Tools & Data)  │
│                  │         │                  │         │                  │
│  Next.js 16      │         │  LangGraph       │         │   NestJS         │
│  React 19        │         │  FastAPI         │         │   TypeORM        │
│  Ant Design      │         │  OpenAI GPT-4o   │         │   PostgreSQL     │
│  TypeScript      │         │  Python 3.12     │         │   OpenAI API     │
│                  │         │                  │         │                  │
└──────────────────┘         └──────────────────┘         └──────────────────┘
      Port 3001                   Port 8000                    Port 3000
```

### Component Responsibilities

#### 1. **Agentify Web** (Frontend)
- Modern, responsive user interface
- Real-time chat interface with streaming responses
- Customer and task management dashboards
- Email generation and management interface
- Settings and customization panels

#### 2. **Agentify Backend** (AI Agent)
- LangGraph-based conversational AI agent
- Natural language understanding for Vietnamese
- Tool orchestration and execution
- Streaming response generation
- Interrupt handling for confirmations

#### 3. **MCP Server** (Tools & Data Layer)
- RESTful API with Swagger documentation
- 8 specialized tools for CRM operations
- PostgreSQL database management
- Automated email generation service
- AI-powered recommendation engine

---

## ✨ Key Features

### 🤖 Intelligent AI Copilot
- **Natural Language Interface**: Interact with the system using natural Vietnamese language
- **Context-Aware Responses**: Maintains conversation history for coherent interactions
- **Tool Integration**: Seamlessly executes 8 specialized CRM tools
- **Streaming Responses**: Real-time response generation for better user experience

### 👥 Customer Management
- **Advanced Search**: Find customers by name, email, phone, segment, or behavior
- **Comprehensive Profiles**: View detailed customer information including cards, preferences, and history
- **Segment Analysis**: Understand customer segments (Diamond, Platinum, Gold, Silver, Bronze)

### 💳 Card Product Management
- **Product Catalog**: Browse and search VPBank's card products
- **AI Recommendations**: Get intelligent card product suggestions for specific customers
- **Customer Matching**: Find ideal customers for specific card products
- **Benefit Analysis**: Detailed card benefits and features

### 📧 Automated Email Generation
- **Daily Automation**: Automatically generates personalized emails at 5 AM daily
- **Multiple Triggers**: Birthday wishes, card renewal reminders, segment milestones
- **Dual Content**: Both formal email and informal message versions
- **Custom Prompts**: RM-level and per-email customization
- **Lifecycle Management**: Draft, sent, and deleted status tracking

### ✅ Task Management
- **Task Creation**: Create tasks with confirmations
- **Task Tracking**: Monitor task status and deadlines
- **Performance Reports**: View RM performance metrics
- **Smart Reminders**: Automated task reminders

### 📊 Performance Analytics
- **RM Dashboard**: Track individual performance metrics
- **Task Completion Rates**: Monitor task efficiency
- **Customer Engagement**: Measure customer interaction quality

---

## 🛠️ Technology Stack

### Frontend (Agentify Web)
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.0.1 | React framework with App Router |
| React | 19.2.0 | UI library |
| TypeScript | 5.x | Type-safe development |
| Ant Design | 5.28.0 | UI component library |
| TanStack Query | 5.90.6 | Data fetching and caching |
| Zustand | 5.0.8 | State management |
| Axios | 1.13.1 | HTTP client |
| Tailwind CSS | 4.x | Utility-first CSS |

### Backend (Agentify Backend)
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.12+ | Programming language |
| FastAPI | 0.121.1 | Modern async web framework |
| LangGraph | 1.0.2 | Agent orchestration |
| LangChain | 1.0.4 | LLM framework |
| OpenAI | GPT-4o | Large language model |
| Uvicorn | 0.38.0 | ASGI server |

### MCP Server (Tools & Data)
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime environment |
| NestJS | 11.0.1 | Progressive Node.js framework |
| TypeScript | 5.7.3 | Type-safe development |
| TypeORM | 0.3.27 | ORM for database |
| PostgreSQL | 17+ | Relational database |
| OpenAI API | 6.8.1 | AI recommendations |
| Swagger | 11.2.1 | API documentation |

---

## 📁 Project Structure

```
vpbank/
├── agentify_backend/          # AI Agent Backend (Python/FastAPI)
│   ├── agent/
│   │   ├── core.py           # LangGraph agent implementation
│   │   └── config.py         # Configuration management
│   ├── main.py               # FastAPI application entry point
│   ├── requirements.txt      # Python dependencies
│   ├── Dockerfile           # Docker configuration
│   └── README.md            # Backend documentation
│
├── mcp_server/               # MCP Tools & Data Server (NestJS)
│   ├── src/
│   │   ├── customer/        # Customer management module
│   │   ├── card/            # Card product module
│   │   ├── rm/              # Relationship manager module
│   │   ├── rm_task/         # Task management module
│   │   ├── gen_email/       # Email generation module
│   │   ├── tools/           # MCP tools implementation
│   │   └── data/            # Database scripts and seeders
│   ├── package.json         # Node.js dependencies
│   ├── Dockerfile          # Docker configuration
│   └── README.md           # MCP server documentation
│
├── agentify-web/            # Frontend Application (Next.js)
│   ├── app/
│   │   ├── (main)/         # Main application pages
│   │   └── api/            # API proxy routes
│   ├── components/
│   │   ├── agent/          # Chat components
│   │   ├── layout/         # Layout components
│   │   └── setting/        # Settings components
│   ├── lib/
│   │   ├── api/            # API client functions
│   │   └── utils/          # Utility functions
│   ├── stores/             # Zustand state stores
│   ├── types/              # TypeScript type definitions
│   ├── package.json        # Node.js dependencies
│   ├── Dockerfile         # Docker configuration
│   └── README.md          # Frontend documentation
│
└── README.md              # This file
```

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Docker & Docker Compose** (recommended for easy setup)
- **Python 3.12+** (for local backend development)
- **Node.js 18+** (for local frontend/MCP development)
- **PostgreSQL 17+** (if not using Docker)
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))

### Option 1: Docker Compose (Recommended)

The fastest way to get all services running:

```bash
# Clone the repository
git clone <repository-url>
cd vpbank

# Set up environment variables (see below)
# Create .env files in each component directory

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

**Services will be available at:**
- Frontend: http://localhost:3001
- Backend: http://localhost:8000
- MCP Server: http://localhost:3000
- MCP Server API Docs: http://localhost:3000/api

### Option 2: Manual Setup

For development, you may want to run services individually. See [Component Setup](#-component-setup) section below.

---

## 🔧 Component Setup

### 1. MCP Server Setup

The MCP Server must be started first as it provides the data layer and tools.

```bash
# Navigate to MCP server directory
cd mcp_server

# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env
# Edit .env and set:
# - APP_PORT=3000
# - POSTGRES_HOST=localhost
# - POSTGRES_PORT=5432
# - POSTGRES_USERNAME=postgres
# - POSTGRES_PASSWORD=your_password
# - POSTGRES_NAME=vpbank_db
# - OPENAI_API_KEY=your_openai_api_key

# Start PostgreSQL (if using Docker)
docker-compose up -d postgres

# Seed the database with mock data
pnpm run db:seed

# Start the development server
pnpm run start:dev

# Verify it's running
curl http://localhost:3000/api
```

**Available Commands:**
```bash
pnpm run start:dev      # Development mode with hot reload
pnpm run start:prod     # Production mode
pnpm run db:seed        # Seed database with mock data
pnpm run db:export      # Export database to JSON
pnpm run db:clear       # Clear all database data
pnpm run test           # Run unit tests
pnpm run test:e2e       # Run end-to-end tests
```

**API Documentation:** http://localhost:3000/api

📖 **Detailed Documentation:** [mcp_server/README.md](mcp_server/README.md)

---

### 2. Agentify Backend Setup

The AI agent backend processes natural language and orchestrates tool execution.

```bash
# Navigate to backend directory
cd agentify_backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and set:
# - OPENAI_API_KEY=your_openai_api_key
# - MCP_SERVER_URL=http://localhost:3000/mcp

# Start the development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Verify it's running
curl http://localhost:8000/health
```

**Available Commands:**
```bash
uvicorn main:app --reload              # Development mode
uvicorn main:app --host 0.0.0.0        # Production mode
python test_client.py                   # Test the agent
pytest                                  # Run tests (if available)
```

**API Endpoints:**
- `POST /chat` - Send a message to the agent
- `POST /chat/stream` - Stream agent responses (SSE)
- `GET /interrupt/{thread_id}` - Check for pending confirmations
- `GET /health` - Health check

📖 **Detailed Documentation:** [agentify_backend/README.md](agentify_backend/README.md)

---

### 3. Agentify Web Setup

The frontend provides a modern, intuitive interface for RMs.

```bash
# Navigate to web directory
cd agentify-web

# Install dependencies
yarn install
# or: npm install

# Configure environment variables
# Create .env.local file:
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
echo "NEXT_PUBLIC_MCP_URL=http://localhost:3000" >> .env.local

# Start the development server
yarn dev
# or: npm run dev

# Open browser to http://localhost:3001
```

**Available Commands:**
```bash
yarn dev          # Development mode with hot reload
yarn build        # Build for production
yarn start        # Start production server
yarn lint         # Run ESLint
```

**Key Features:**
- 💬 Real-time chat with AI agent
- 👥 Customer search and management
- 💳 Card product recommendations
- 📧 Email generation and management
- ✅ Task tracking and creation
- ⚙️ Settings and customization

📖 **Detailed Documentation:** [agentify-web/README.md](agentify-web/README.md)

---

## 🎨 Demo & Screenshots

### Main Chat Interface
The primary interface where RMs interact with the AI copilot using natural language.

### Customer Management
Search, view, and manage customer profiles with detailed information.

### Email Generation
Automated email and message generation with customization options.

### Task Dashboard
Track and manage tasks with performance metrics.

---

## 🔐 Environment Variables

### Agentify Backend (.env)
```env
OPENAI_API_KEY=your_openai_api_key_here
MCP_SERVER_URL=http://localhost:3000/mcp
APP_PORT=8000
APP_HOST=0.0.0.0
```

### MCP Server (.env)
```env
# Application
APP_PORT=3000

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USERNAME=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_NAME=vpbank_db

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here
```

### Agentify Web (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_MCP_URL=http://localhost:3000
```

---

## 👥 Team

**Team #22 - Agentify**

VPBank Technology Hackathon 2025 – Senior Track: Hack2Hire

---

## 📄 License

This project is developed for the VPBank Technology Hackathon 2025. All rights reserved.

---

<div align="center">

**Built with ❤️ by Team Agentify**

**VPBank Technology Hackathon 2025**

</div>

