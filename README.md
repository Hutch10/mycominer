# MycoMiner: Multi-Agent Intelligence Platform

A sophisticated Next.js 15 application for human-crafted mushroom intelligence with multi-agent orchestration, policy governance, semantic context tracking, and full explainability. Built with React 19, TypeScript, Tailwind CSS v3, and production-ready deployment configurations.

**Live Demo**: Coming Soon | **Documentation**: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🎯 Key Features

### Multi-Agent Orchestration
- 4 specialized agents: **Reasoner** (analysis), **Planner** (scheduling), **Critic** (evaluation), **General** (fallback)
- Deterministic keyword-based routing with scoring
- Intelligent context-aware agent selection
- Fallback safety mechanisms

### Policy Governance Layer
- Pre-message validation (length, safety, rate limits)
- Post-response validation (quality, content safety)
- Configurable policy rules with severity levels (info/warning/error/critical)
- Structured error reporting with failure tracking

### Real-Time Governance Logging
- Complete audit trail of all interactions
- Session-based log management
- Filterable logs (All/Completed/Failed/Pending)
- In-memory storage with configurable limits (1000 entries)
- Statistics aggregation

### Semantic Context Engine
- Rolling conversation windows (50 messages per session)
- Session isolation with up to 100 concurrent sessions
- Automatic context building for agent prompts
- Message metadata tracking

### Interactive Explainability Graph
- Typed nodes: message, reasoning, tool_call, decision, result, policy, routing, agent
- Metadata-enriched edges with timestamps and reasoning
- Automatic pruning at 300 nodes per graph
- Mermaid format export for visualization
- Real-time graph updates with visual legend

### Production-Ready UI
- Responsive dark mode support
- Real-time stats bar with system metrics
- Streaming agent console with message history
- Live governance panel with filtering
- Explainability viewer with auto-refresh
- Accessible components with keyboard navigation

---

## 📁 Project Structure

```
mycominer/
├── app/
│   ├── api/
│   │   ├── agent/route.ts              # Main orchestration endpoint
│   │   ├── governance/route.ts         # Governance log API
│   │   ├── explainability/route.ts     # Graph visualization API
│   │   └── workflows/route.ts          # Workflow execution API
│   ├── components/
│   │   ├── AgentConsole.tsx            # Chat interface
│   │   ├── GovernancePanel.tsx         # Log viewer
│   │   ├── ExplainabilityViewer.tsx    # Graph viewer
│   │   └── StatsBar.tsx                # System metrics
│   ├── system/
│   │   ├── orchestration/orchestrator.ts    # Agent routing
│   │   ├── policy/policyEngine.ts           # Policy validation
│   │   ├── governance/governanceLog.ts      # Audit logging
│   │   ├── semantic/semanticContext.ts      # Context management
│   │   ├── explainability/graph.ts          # Reasoning graph
│   │   └── workflow/engine.ts               # Workflow orchestration
│   ├── layout.tsx                      # Root layout
│   ├── page.tsx                        # Homepage
│   └── globals.css                     # Global styles
├── public/                             # Static assets
├── tests/
│   └── integration.test.ts             # Integration tests
├── package.json                        # Dependencies
├── tsconfig.json                       # TypeScript config
├── next.config.js                      # Next.js config
├── tailwind.config.js                  # Tailwind config
├── postcss.config.js                   # PostCSS config
├── .eslintrc.json                      # ESLint config
├── Dockerfile                          # Container image
├── vercel.json                         # Vercel deployment
├── DEPLOYMENT.md                       # Deployment guide
└── README.md                           # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- Agent Runtime service (running on `localhost:8080` by default)

### Installation

1. **Clone Repository**
```bash
git clone https://github.com/username/mycominer.git
cd mycominer
```

2. **Install Dependencies**
```bash
npm install
```

3. **Create Environment File**
```bash
cp .env.example .env.local
# Edit .env.local and set your agent runtime URL
```

4. **Start Development Server**
```bash
npm run dev
```

5. **Access Application**
Open [http://localhost:3000](http://localhost:3000) in your browser

---

## 🔧 Development

### Available Commands

```bash
# Development server with hot reload
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Production build
npm run build

# Run production build locally
npm start
```

### Project Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript type checking |

---

## 🏗️ System Architecture

### Request Flow

```
1. User Message
   ↓
2. Pre-Policy Check → (Validate message)
   ↓
3. Semantic Context → (Add to session history)
   ↓
4. Explainability Graph → (Create user node)
   ↓
5. Governance Logger → (Create log entry)
   ↓
6. Agent Orchestration → (Select agent with scoring)
   ↓
7. Explainability Graph → (Add routing node)
   ↓
8. Agent Execution → (Process with context)
   ↓
9. Explainability Graph → (Add response node)
   ↓
10. Post-Policy Check → (Validate response)
    ↓
11. Semantic Context → (Add response to history)
    ↓
12. Governance Logger → (Complete log entry)
    ↓
13. Response → (Return to user with metadata)
```

### Component Architecture

```
Layout.tsx (Root)
├── StatsBar (Live metrics)
├── Header (Session info)
├── AgentConsole (User input)
├── GovernancePanel (Log viewer)
├── ExplainabilityViewer (Graph)
└── Features Section (Description)
```

### System Modules

| Module | Purpose | Files |
|--------|---------|-------|
| **Orchestration** | Route messages to agents | `orchestrator.ts` |
| **Policy** | Enforce governance rules | `policyEngine.ts` |
| **Governance** | Audit trail logging | `governanceLog.ts` |
| **Semantic** | Context management | `semanticContext.ts` |
| **Explainability** | Reasoning visualization | `graph.ts` |
| **Workflow** | Workflow execution | `engine.ts` |

---

## ⚙️ Configuration

### Environment Variables

Create `.env.local`:

```bash
# Agent Runtime
AGENT_RUNTIME_URL=http://localhost:8080

# Next.js
NODE_ENV=development
NEXT_PUBLIC_REACT_STRICT_MODE=true

# Logging
LOG_LEVEL=info
```

### Tailwind Configuration

Configured in `tailwind.config.js`:
- Content paths: `./app/**/*`, `./components/**/*`
- Theme extensions: Custom colors and animations
- Dark mode: Media query based

### Next.js Configuration

Key settings in `next.config.js`:
- React strict mode enabled
- SWC minification enabled
- API response limit: 4MB
- Images: Unoptimized for flexibility

---

## 🔌 API Routes

### /api/agent (POST)
Main orchestration endpoint. Handles:
- Pre-policy validation
- Agent routing
- Post-policy validation
- Governance logging
- Context updates
- Graph generation

**Request**:
```json
{
  "message": "Explain photosynthesis",
  "sessionId": "session_xxx",
  "context": {}
}
```

**Response**:
```json
{
  "response": "...",
  "metadata": {
    "selectedAgent": {"id": "reasoner", "name": "Reasoner"},
    "orchestration": {"routingScore": 0.95, "routingReason": "..."},
    "policyValidation": {"preCheck": {...}, "postCheck": {...}},
    "explainabilityGraph": {"nodeCount": 5, "edgeCount": 4, "depth": 3}
  }
}
```

### /api/governance (GET/DELETE)
Governance log access:
- **GET**: Retrieve logs, optionally filtered by sessionId
- **DELETE**: Clear logs for session or all

### /api/explainability (GET)
Graph visualization:
- Returns Mermaid format graph
- Node and edge statistics
- Session-specific graphs

### /api/workflows (POST/GET)
Workflow management:
- **POST**: Register workflows, execute flows
- **GET**: Check execution status

---

## 🧪 Testing

Integration tests in `tests/integration.test.ts`:

```bash
# Run tests
npm test

# Watch mode
npm test -- --watch
```

Tests cover:
- Orchestrator routing
- Policy validation
- Governance logging
- Semantic context
- Explainability graphs
- End-to-end flows

---

## 📦 Dependencies

### Core
- **Next.js 15**: Full-stack React framework
- **React 19**: Modern UI library
- **TypeScript 5.3**: Type-safe JavaScript
- **Tailwind CSS 3**: Utility-first CSS

### Development
- **ESLint**: Code linting
- **TypeScript**: Static typing
- **Tailwind CSS**: Styling

See [package.json](./package.json) for complete list.

---

## 🚢 Deployment

Complete deployment guide in [DEPLOYMENT.md](./DEPLOYMENT.md)

### Quick Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

### Docker Deployment

```bash
docker build -t mycominer:latest .
docker run -p 3000:3000 -e AGENT_RUNTIME_URL=http://host.docker.internal:8080 mycominer:latest
```

### Traditional VPS (Ubuntu)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete VPS setup with Nginx, PM2, and SSL.

---

## 🔐 Security

- **Policy Validation**: Pre and post-message checks
- **Rate Limiting**: Configurable in policyEngine.ts
- **Session Isolation**: Complete data separation per session
- **Input Sanitization**: Message validation before processing
- **Error Handling**: Safe error boundaries on all routes
- **HTTPS**: SSL/TLS in production
- **CORS**: Configured for specific origins

---

## 📊 Performance

- **In-Memory Storage**:
  - Governance logs: Max 1000 entries
  - Sessions: Max 100 concurrent
  - Graph nodes: Max 300 per session (auto-prunes to 225)

- **Optimization**:
  - SWC-based minification
  - Automatic code splitting
  - Static site generation where possible
  - API route compression

- **Monitoring**:
  - Real-time stats bar
  - Log statistics
  - Graph depth tracking
  - Execution timing in metadata

---

## 🛠️ Troubleshooting

### Port 3000 Already in Use
```bash
lsof -i :3000        # Find process
kill -9 <PID>        # Kill process
```

### Cannot Connect to Agent Runtime
1. Verify agent runtime is running
2. Check `AGENT_RUNTIME_URL` environment variable
3. Ensure network connectivity: `curl http://AGENT_RUNTIME_URL/health`

### TypeScript Errors After Installation
```bash
npm run type-check
# Or delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Memory Issues
Adjust Node.js heap size:
```bash
node --max-old-space-size=4096 node_modules/next/dist/bin/next dev
```

---

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide for all platforms
- **[System Components](./app/system/)** - Individual module documentation
- **[API Routes](./app/api/)** - Endpoint specifications

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test: `npm run type-check && npm run lint`
3. Build production version: `npm run build`
4. Push and create pull request

---

## 📝 License

Proprietary - MycoMiner Project

---

## 🆘 Support & Contact

For issues and questions:
1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section
2. Review API documentation in code comments
3. Check system logs in `/var/log/` (production)
4. Review PM2 logs: `pm2 logs` (VPS deployment)

---

## 🎉 Success Checklist

- [x] Multi-agent orchestration with 4 specialized agents
- [x] Policy governance with configurable rules
- [x] Real-time governance logging with filtering
- [x] Semantic context with session management
- [x] Explainability graph with visualization
- [x] Responsive UI with dark mode
- [x] Production-ready build system
- [x] Complete deployment guide
- [x] Integration tests
- [x] TypeScript type safety
- [x] ESLint and code quality
- [x] Tailwind v3 styling
- [x] Docker containerization
- [x] Vercel serverless support
- [x] VPS traditional deployment
- [x] Security best practices

---

## 🚀 Production Ready

This project is production-ready and includes:
- ✅ Full TypeScript type coverage
- ✅ Comprehensive error handling
- ✅ Security best practices
- ✅ Performance optimization
- ✅ Monitoring and logging
- ✅ Automated testing
- ✅ Database-ready architecture
- ✅ Scalable design
- ✅ Complete documentation
- ✅ Multiple deployment options

**Ready to deploy!**
