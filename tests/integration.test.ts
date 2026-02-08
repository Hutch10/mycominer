/**
 * Integration Tests for MycoMiner API
 * Tests the core orchestration, governance, and explainability flows
 */

import orchestrator from '@/app/system/orchestration/orchestrator';
import policyEngine from '@/app/system/policy/policyEngine';
import governanceLogger from '@/app/system/governance/governanceLog';
import semanticContextEngine from '@/app/system/semantic/semanticContext';
import explainabilityGraphEngine from '@/app/system/explainability/graph';

describe('MycoMiner Integration Tests', () => {
  const testSessionId = `test_session_${Date.now()}`;

  beforeEach(() => {
    // Clear logs before each test
    governanceLogger.clearLogs();
    explainabilityGraphEngine.clearGraph(testSessionId);
    semanticContextEngine.clearSession(testSessionId);
  });

  describe('Orchestrator Tests', () => {
    it('should route reasoning questions to the Reasoner agent', () => {
      const message = 'explain the carbon cycle';
      const result = orchestrator.routeMessage(testSessionId, message);
      
      expect(result.selectedAgent.name).toBe('Reasoner');
      expect(result.routingScore).toBeGreaterThan(0);
    });

    it('should route planning questions to the Planner agent', () => {
      const message = 'schedule the cultivation timeline';
      const result = orchestrator.routeMessage(testSessionId, message);
      
      expect(result.selectedAgent.name).toBe('Planner');
    });

    it('should route to General agent for unknown queries', () => {
      const message = 'xyz unknown query';
      const result = orchestrator.routeMessage(testSessionId, message);
      
      expect(['General', 'Reasoner', 'Planner', 'Critic']).toContain(result.selectedAgent.name);
    });
  });

  describe('Policy Engine Tests', () => {
    it('should pass valid messages through pre-check', () => {
      const message = 'This is a valid message for the system';
      const result = policyEngine.preMessageCheck(message, { sessionId: testSessionId });
      
      expect(result.passed).toBe(true);
    });

    it('should reject messages that are too short', () => {
      const message = 'a';
      const result = policyEngine.preMessageCheck(message, { sessionId: testSessionId });
      
      expect(result.passed).toBe(false);
    });

    it('should pass valid responses through post-check', () => {
      const response = 'This is a thoughtful and complete response to the user question.';
      const result = policyEngine.postMessageCheck(response, { sessionId: testSessionId });
      
      expect(result.passed).toBe(true);
    });
  });

  describe('Governance Logger Tests', () => {
    it('should create and complete governance log entries', () => {
      const message = 'Test message';
      const response = 'Test response';
      
      const entryId = governanceLogger.createEntry(testSessionId, message);
      expect(entryId).toBeDefined();
      
      governanceLogger.completeEntry(entryId, response);
      
      const logs = governanceLogger.getAllLogs();
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].status).toBe('completed');
    });

    it('should track failed entries', () => {
      const message = 'Test message';
      const entryId = governanceLogger.createEntry(testSessionId, message);
      
      governanceLogger.failEntry(entryId, 'Test error');
      
      const logs = governanceLogger.getAllLogs();
      expect(logs[0].status).toBe('failed');
      expect(logs[0].error).toBe('Test error');
    });

    it('should provide statistics', () => {
      governanceLogger.createEntry(testSessionId, 'Message 1');
      governanceLogger.createEntry(testSessionId, 'Message 2');
      
      const stats = governanceLogger.getStats();
      expect(stats.total).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Semantic Context Tests', () => {
    it('should add and retrieve messages from context', () => {
      const message = 'Test message content';
      semanticContextEngine.addMessage(testSessionId, 'user', message);
      
      const context = semanticContextEngine.buildContextString(testSessionId);
      expect(context).toContain(message);
    });

    it('should maintain session isolation', () => {
      const sessionA = `${testSessionId}_A`;
      const sessionB = `${testSessionId}_B`;
      
      semanticContextEngine.addMessage(sessionA, 'user', 'Message A');
      semanticContextEngine.addMessage(sessionB, 'user', 'Message B');
      
      const contextA = semanticContextEngine.buildContextString(sessionA);
      const contextB = semanticContextEngine.buildContextString(sessionB);
      
      expect(contextA).toContain('Message A');
      expect(contextA).not.toContain('Message B');
      expect(contextB).toContain('Message B');
      expect(contextB).not.toContain('Message A');
    });
  });

  describe('Explainability Graph Tests', () => {
    it('should initialize and track graph nodes', () => {
      const nodeId = explainabilityGraphEngine.addUserMessage(testSessionId, 'Test message');
      expect(nodeId).toBeDefined();
      
      const graph = explainabilityGraphEngine.getGraph(testSessionId);
      expect(graph?.nodes.length).toBe(1);
    });

    it('should create edges between nodes', () => {
      const node1 = explainabilityGraphEngine.addUserMessage(testSessionId, 'Message');
      const node2 = explainabilityGraphEngine.addNode(testSessionId, 'reasoning', 'Step 1', 'Reasoning');
      
      const edgeId = explainabilityGraphEngine.addEdge(
        testSessionId,
        node1,
        node2,
        'triggers',
        'causes'
      );
      
      expect(edgeId).toBeDefined();
      
      const graph = explainabilityGraphEngine.getGraph(testSessionId);
      expect(graph?.edges.length).toBe(1);
    });

    it('should export Mermaid format', () => {
      explainabilityGraphEngine.addUserMessage(testSessionId, 'Test message');
      
      const mermaid = explainabilityGraphEngine.exportMermaid(testSessionId);
      expect(mermaid).toContain('graph TD');
    });
  });

  describe('End-to-End Flow Tests', () => {
    it('should execute a complete message flow', () => {
      // 1. Add to context
      semanticContextEngine.addMessage(testSessionId, 'user', 'explain photosynthesis');
      
      // 2. Run orchestration
      const orchestrationResult = orchestrator.routeMessage(testSessionId, 'explain photosynthesis');
      expect(orchestrationResult.selectedAgent).toBeDefined();
      
      // 3. Run pre-policy check
      const preCheck = policyEngine.preMessageCheck('explain photosynthesis', { sessionId: testSessionId });
      expect(preCheck.passed).toBe(true);
      
      // 4. Create governance log
      const logId = governanceLogger.createEntry(testSessionId, 'explain photosynthesis');
      expect(logId).toBeDefined();
      
      // 5. Create graph nodes
      const userNode = explainabilityGraphEngine.addUserMessage(testSessionId, 'explain photosynthesis');
      const routingNode = explainabilityGraphEngine.addRoutingNode(
        testSessionId,
        orchestrationResult.selectedAgent.name,
        orchestrationResult.routingReason,
        orchestrationResult.routingScore
      );
      
      // 6. Run post-policy check
      const response = 'Photosynthesis is the process by which plants convert light energy into chemical energy.';
      const postCheck = policyEngine.postMessageCheck(response, { sessionId: testSessionId });
      expect(postCheck.passed).toBe(true);
      
      // 7. Complete governance log
      governanceLogger.completeEntry(logId, response);
      
      // 8. Verify all systems tracked
      const graph = explainabilityGraphEngine.getGraph(testSessionId);
      expect(graph?.nodes.length).toBe(2);
      expect(graph?.edges.length).toBe(0);
      
      const logs = governanceLogger.getAllLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].status).toBe('completed');
    });
  });
});
