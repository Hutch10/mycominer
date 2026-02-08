# MycoMiner Agent Runtime

Standalone Node.js backend service for the MycoMiner platform. Provides agent orchestration, governance, explainability, and workflow management via RESTful API.

## Architecture

This service operates as the **backend runtime** in a two-service architecture:
- **Frontend Cockpit**: Next.js UI at `localhost:3000`
- **Backend Runtime**: This Express.js service at `localhost:8080`

## Features

### Core System Modules
- **Multi-Agent Orchestrator**: Routes messages to specialized agents (Reasoner, Planner, Critic, General)
- **Policy Engine**: Pre/post message validation with severity levels
- **Governance Log**: Complete audit trail of all interactions
- **Semantic Context**: Session-based conversation history
- **Graph System**: Reasoning chains and explainability graphs
- **Workflow Engine**: Multi-step workflow execution management

### API Endpoints

#### Agent Execution
- `POST /agent/execute` - Execute agent message with full governance
- `GET /agent/health` - System health and statistics

#### Governance
- `GET /governance` - Retrieve governance logs (optionally filtered by session)
- `GET /governance/stats` - Governance statistics
- `GET /governance/:logId` - Get specific log entry
- `DELETE /governance/:sessionId` - Clear session logs

#### Explainability
- `GET /explainability/graph/:sessionId` - Get reasoning graph
- `GET /explainability/context/:sessionId` - Get conversation context
- `GET /explainability/reasoning-path/:sessionId` - Get path between nodes
- `GET /explainability/stats` - Explainability statistics
- `DELETE /explainability/session/:sessionId` - Clear session data

#### Workflows
- `POST /workflows` - Create workflow execution
- `GET /workflows/:executionId` - Get execution details
- `POST /workflows/:executionId/start` - Start execution
- `POST /workflows/:executionId/pause` - Pause execution
- `POST /workflows/:executionId/resume` - Resume execution
- `POST /workflows/:executionId/steps/:stepId/complete` - Complete step
- `POST /workflows/:executionId/steps/:stepId/fail` - Fail step
- `GET /workflows/stats` - Workflow statistics
- `DELETE /workflows/:executionId` - Delete execution

## Installation

```bash
cd agent-runtime
npm install
```

## Configuration

1. Copy environment template:
```bash
cp .env.example .env
```

2. Edit `.env` to configure:
```env
PORT=8080
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Running the Service

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## Example Usage

### Execute Agent Message
```bash
curl -X POST http://localhost:8080/agent/execute \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I pasteurize substrate?",
    "sessionId": "user-session-123",
    "userId": "john@example.com"
  }'
```

### Check System Health
```bash
curl http://localhost:8080/agent/health
```

### Retrieve Governance Logs
```bash
curl http://localhost:8080/governance?sessionId=user-session-123
```

## Integration with Frontend

The Next.js frontend should call this backend instead of using local API routes:

**Before (Monolithic):**
```typescript
const response = await fetch('/api/agent', { ... });
```

**After (Two-Service):**
```typescript
const RUNTIME_URL = process.env.NEXT_PUBLIC_AGENT_RUNTIME_URL || 'http://localhost:8080';
const response = await fetch(`${RUNTIME_URL}/agent/execute`, { ... });
```

## Tech Stack

- **Framework**: Express.js 4.18
- **Language**: TypeScript 5.3
- **Module System**: CommonJS (for Node.js compatibility)
- **CORS**: Enabled for frontend integration
- **Development**: ts-node-dev with auto-restart

## Project Structure

```
agent-runtime/
├── src/
│   ├── system/           # Core system modules
│   │   ├── orchestrator.ts
│   │   ├── policyEngine.ts
│   │   ├── governanceLog.ts
│   │   ├── semanticContext.ts
│   │   ├── graph.ts
│   │   └── workflowEngine.ts
│   ├── routes/           # Express route handlers
│   │   ├── agent.ts
│   │   ├── governance.ts
│   │   ├── explainability.ts
│   │   └── workflows.ts
│   └── server.ts         # Main entry point
├── dist/                 # Compiled output (generated)
├── package.json
├── tsconfig.json
└── .env                  # Environment config (create from .env.example)
```

## Development Notes

- All system modules use singleton pattern for consistent state
- In-memory storage with configurable limits (suitable for development/small-scale)
- For production scale, consider adding database persistence
- CORS is pre-configured for `localhost:3000`
- Request logging included for debugging

## Production Considerations

For production deployment:
1. Set `NODE_ENV=production` in `.env`
2. Configure proper CORS origins
3. Add authentication/authorization middleware
4. Implement database persistence (replace in-memory stores)
5. Add rate limiting
6. Set up monitoring/alerting
7. Use process manager (PM2, systemd)
8. Configure reverse proxy (nginx, Caddy)

## License

Part of the MycoMiner platform.
