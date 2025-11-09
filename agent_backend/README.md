# Agent Backend

Production-ready agent backend for VPBank CRM system using LangGraph, MCP tools, and OpenAI.

## Features

- **LangGraph Agent**: Intelligent copilot for Relationship Managers
- **MCP Tools Integration**: Uses tools from MCP server (8 tools available)
- **OpenAI LLM**: Uses GPT-4o for natural language understanding
- **PostgreSQL**: Database access through MCP server
- **FastAPI**: Modern async web framework
- **Streaming Support**: Real-time streaming responses via SSE
- **Interrupt Handling**: User confirmation for critical operations

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Client    │─────▶│ Agent Backend│─────▶│ MCP Server  │
│  (Frontend) │      │  (FastAPI)   │      │  (NestJS)   │
└─────────────┘      └──────────────┘      └─────────────┘
                             │                       │
                             │                       ▼
                             │                ┌─────────────┐
                             │                │ PostgreSQL  │
                             │                └─────────────┘
                             │
                             ▼
                      ┌─────────────┐
                      │   OpenAI    │
                      │     API     │
                      └─────────────┘
```

## Prerequisites

- Python 3.12+
- Docker and Docker Compose (for containerized deployment)
- OpenAI API key
- MCP Server running (or use docker-compose)

## Setup

### 1. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and set your OpenAI API key:

```env
OPENAI_API_KEY=your_openai_api_key_here
MCP_SERVER_URL=http://localhost:3000/mcp
```

### 2. Local Development

#### Option A: Using Docker Compose (Recommended)

This will start the agent backend, MCP server, and PostgreSQL:

```bash
docker-compose up -d
```

The agent backend will be available at `http://localhost:8000`

#### Option B: Manual Setup

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Ensure MCP server is running:

```bash
# In mcp_server directory
cd ../mcp_server
pnpm install
pnpm run start:dev
```

3. Start the agent backend:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Verify Installation

Check health endpoint:

```bash
curl http://localhost:8000/health
```

## API Endpoints

### POST `/chat`

Process a chat message and get response.

**Request:**
```json
{
  "message": "Find customer named Thắng",
  "thread_id": "thread-123",
  "rm_id": 1,
  "resume_value": null
}
```

**Response:**
```json
{
  "response": "I found customer Ngô Đức Thắng...",
  "messages": ["...", "..."],
  "has_interrupt": false,
  "interrupt_message": null
}
```

### POST `/chat/stream`

Stream chat responses in real-time (Server-Sent Events).

**Request:** Same as `/chat`

**Response:** SSE stream with chunks:
```
data: {"content": "I found", "metadata": {}}

data: {"content": " customer", "metadata": {}}

data: [DONE]
```

### GET `/interrupt/{thread_id}`

Check if there's a pending interrupt (confirmation needed).

**Response:**
```json
{
  "has_interrupt": true,
  "interrupt_message": "Hãy confirm task sau: create_rm_task(...)"
}
```

## Available Tools (via MCP Server)

The agent has access to 8 tools:

### Customer Management
- `find_customer` - Find customer by various criteria

### Card Product Management
- `find_card_product` - Find card product by type, name, or network

### AI-Powered Recommendations
- `recommend_card_products` - Get AI recommendations for best card products for a customer
- `recommend_customers` - Get AI recommendations for best customers for a card product

### Task Management
- `find_rm_task` - Find relationship manager tasks by criteria
- `create_rm_task` - Create new task (requires confirmation)
- `update_rm_task` - Update existing task (requires confirmation)
- `report_performance` - Get performance report for relationship manager

## Usage Examples

### Basic Chat

```python
import requests

response = requests.post(
    "http://localhost:8000/chat",
    json={
        "message": "Find customer named Thắng",
        "thread_id": "user-123",
        "rm_id": 1
    }
)

print(response.json()["response"])
```

### Streaming Chat

```python
import requests
import json

response = requests.post(
    "http://localhost:8000/chat/stream",
    json={
        "message": "What's my performance this month?",
        "thread_id": "user-123",
        "rm_id": 1
    },
    stream=True
)

for line in response.iter_lines():
    if line:
        data = line.decode('utf-8')
        if data.startswith('data: '):
            content = data[6:]  # Remove 'data: ' prefix
            if content == '[DONE]':
                break
            chunk = json.loads(content)
            if 'content' in chunk:
                print(chunk['content'], end='', flush=True)
```

### Handling Interrupts (Confirmation)

```python
# 1. Send message that requires confirmation
response = requests.post(
    "http://localhost:8000/chat",
    json={
        "message": "Create a task for customer Thắng",
        "thread_id": "user-123",
        "rm_id": 1
    }
)

result = response.json()

# 2. Check if confirmation is needed
if result["has_interrupt"]:
    print(f"Confirmation needed: {result['interrupt_message']}")
    
    # 3. Resume with confirmation
    confirm_response = requests.post(
        "http://localhost:8000/chat",
        json={
            "message": "",  # Empty message when resuming
            "thread_id": "user-123",
            "rm_id": 1,
            "resume_value": "yes"  # or "no" to cancel
        }
    )
    
    print(confirm_response.json()["response"])
```

## Development

### Project Structure

```
agent_backend/
├── agent/
│   ├── __init__.py
│   └── core.py          # Agent core implementation
├── main.py               # FastAPI application
├── config.py             # Configuration management
├── requirements.txt       # Python dependencies
├── Dockerfile            # Docker image definition
├── docker-compose.yml    # Docker Compose configuration
└── README.md            # This file
```

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

### Code Quality

```bash
# Format code
black .

# Lint code
flake8 .

# Type checking
mypy .
```

## Production Deployment

### Docker Deployment

1. Build and start services:

```bash
docker-compose up -d --build
```

2. Check logs:

```bash
docker-compose logs -f agent_backend
```

### Environment Variables

Required environment variables:

- `OPENAI_API_KEY` - OpenAI API key (required)
- `MCP_SERVER_URL` - MCP server URL (default: http://localhost:3000/mcp)
- `APP_PORT` - Application port (default: 8000)
- `APP_HOST` - Application host (default: 0.0.0.0)

## Troubleshooting

### Agent not initializing

- Check that MCP server is running and accessible
- Verify `MCP_SERVER_URL` is correct
- Check MCP server logs for errors

### Tools not working

- Ensure MCP server has all tools registered
- Check that PostgreSQL is running and accessible from MCP server
- Verify RM ID is being passed correctly in headers

### OpenAI API errors

- Verify `OPENAI_API_KEY` is set correctly
- Check API key has sufficient credits
- Ensure network can reach OpenAI API

## License

Internal use only - VPBank Hackathon Project

