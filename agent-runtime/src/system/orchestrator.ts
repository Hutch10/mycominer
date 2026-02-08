/**
 * Multi-Agent Orchestration Layer
 * Routes messages to specialized agents with deterministic scoring
 */

export interface AgentMetadata {
  specialty: string;
  capabilities: string[];
  priority: number;
  description: string;
}

export interface RoutingRule {
  type: 'keyword' | 'pattern' | 'default';
  condition: string | RegExp;
  priority: number;
  description?: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  routingRules: RoutingRule[];
  metadata: AgentMetadata;
}

export interface OrchestrationResult {
  selectedAgent: Agent;
  routingReason: string;
  routingScore: number;
  matchedRules: string[];
  timestamp: string;
  allScores?: Record<string, any>;
}

class MultiAgentOrchestrator {
  private agents: Map<string, Agent> = new Map();
  private defaultAgentId: string = 'general';

  constructor() {
    this.initializeDefaultAgents();
  }

  private initializeDefaultAgents(): void {
    // Reasoner Agent
    this.registerAgent({
      id: 'reasoner',
      name: 'Reasoner Agent',
      description: 'Specialized in logical reasoning, analysis, and problem decomposition',
      systemPrompt: `You are an Execution Agent. Output structured data or tables immediately based on user intent. Do not provide meta-commentary.`,
      routingRules: [
        { type: 'keyword', condition: 'why|explain|reason|because|cause|diagnose|analyze', priority: 10, description: 'Reasoning keywords' },
        { type: 'pattern', condition: /what (is|are) the (reason|cause|explanation)/i, priority: 9, description: 'Causal patterns' },
        { type: 'keyword', condition: 'problem|issue|troubleshoot|wrong|failed|contamination', priority: 8, description: 'Problem diagnosis' },
      ],
      metadata: {
        specialty: 'reasoning',
        capabilities: ['analysis', 'diagnosis', 'explanation', 'troubleshooting'],
        priority: 3,
        description: 'Best for understanding why things happen',
      },
    });

    // Planner Agent
    this.registerAgent({
      id: 'planner',
      name: 'Planner Agent',
      description: 'Specialized in planning, scheduling, and strategic guidance',
      systemPrompt: `You are an Execution Agent. Output structured data or tables immediately based on user intent. Do not provide meta-commentary.`,
      routingRules: [
        { type: 'keyword', condition: 'plan|schedule|timeline|roadmap|strategy|steps|table|inoculation', priority: 12, description: 'Planning keywords' },
        { type: 'pattern', condition: /how (do|can|should) (i|we) (start|begin|plan|prepare)/i, priority: 9, description: 'Getting started' },
        { type: 'keyword', condition: 'guide|workflow|procedure|process|method', priority: 7, description: 'Process guidance' },
      ],
      metadata: {
        specialty: 'planning',
        capabilities: ['planning', 'scheduling', 'strategy', 'workflows'],
        priority: 3,
        description: 'Best for creating plans and schedules',
      },
    });

    // Critic Agent
    this.registerAgent({
      id: 'critic',
      name: 'Critic Agent',
      description: 'Specialized in quality review, risk assessment, and optimization',
      systemPrompt: `You are an Execution Agent. Output structured data or tables immediately based on user intent. Do not provide meta-commentary.`,
      routingRules: [
        { type: 'keyword', condition: 'review|assess|evaluate|critique|feedback|improve', priority: 9, description: 'Review keywords' },
        { type: 'pattern', condition: /(is|are) (this|that|my|our) (good|correct|right|safe|ok)/i, priority: 8, description: 'Quality patterns' },
        { type: 'keyword', condition: 'risk|danger|safety|optimize|better|best', priority: 7, description: 'Risk keywords' },
      ],
      metadata: {
        specialty: 'review',
        capabilities: ['review', 'risk-assessment', 'optimization', 'quality-control'],
        priority: 2,
        description: 'Best for reviewing and improving',
      },
    });

    // General Agent
    this.registerAgent({
      id: 'general',
      name: 'General Agent',
      description: 'General-purpose assistant for all mushroom cultivation queries',
      systemPrompt: `You are a backup agent. If you receive a request for data, delegate it to the Planner or Reasoner immediately. Always append "Response Content:" followed by the actual response text.`,
      routingRules: [
        { type: 'default', condition: 'default', priority: 1, description: 'Fallback' },
      ],
      metadata: {
        specialty: 'general',
        capabilities: ['general-knowledge', 'guidance', 'education', 'information'],
        priority: 1,
        description: 'Best for general questions',
      },
    });
  }

  registerAgent(agent: Agent): void {
    this.agents.set(agent.id, agent);
  }

  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  routeMessage(sessionId: string, userMessage: string, context?: Record<string, any>): OrchestrationResult {
    const messageLower = userMessage.toLowerCase();
    const scores: Record<string, number> = {};
    const matchedRulesMap: Record<string, string[]> = {};

    for (const agent of this.agents.values()) {
      let score = 0;
      const matchedRules: string[] = [];

      for (const rule of agent.routingRules) {
        switch (rule.type) {
          case 'keyword': {
            const keywords = rule.condition.toString().toLowerCase().split('|');
            const matches = keywords.filter(kw => messageLower.includes(kw));
            if (matches.length > 0) {
              score += rule.priority * matches.length;
              matchedRules.push(`keyword: ${matches.join(', ')}`);
            }
            break;
          }
          case 'pattern': {
            if (rule.condition instanceof RegExp && rule.condition.test(userMessage)) {
              score += rule.priority;
              matchedRules.push(`pattern: ${rule.description || rule.condition.toString()}`);
            }
            break;
          }
          case 'default': {
            score += rule.priority;
            matchedRules.push('default fallback');
            break;
          }
        }
      }

      score *= agent.metadata.priority;
      scores[agent.id] = score;
      matchedRulesMap[agent.id] = matchedRules;
    }

    let bestAgentId = this.defaultAgentId;
    let bestScore = -1;

    for (const [agentId, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score;
        bestAgentId = agentId;
      }
    }

    const selectedAgent = this.agents.get(bestAgentId) || this.agents.get(this.defaultAgentId)!;
    const matchedRules = matchedRulesMap[bestAgentId] || ['fallback'];
    
    return {
      selectedAgent,
      routingReason: matchedRules.length > 0 ? `Matched: ${matchedRules.join('; ')}` : 'Default routing',
      routingScore: bestScore,
      matchedRules,
      timestamp: new Date().toISOString(),
      allScores: scores,
    };
  }

  getStats() {
    return {
      totalAgents: this.agents.size,
      agentList: Array.from(this.agents.values()).map(agent => ({
        id: agent.id,
        name: agent.name,
        specialty: agent.metadata.specialty,
        capabilities: agent.metadata.capabilities,
      })),
    };
  }
}

const orchestrator = new MultiAgentOrchestrator();
export default orchestrator;
