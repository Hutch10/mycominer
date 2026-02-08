/**
 * Explainability Routes - Reasoning graphs and context
 */
import { Router, Request, Response } from 'express';
import graphSystem from '../system/graph';
import semanticContext from '../system/semanticContext';

const router = Router();

/**
 * GET /explainability/graph/:sessionId
 * Get the reasoning graph for a session
 */
router.get('/graph/:sessionId', (req: Request, res: Response) => {
  const { sessionId } = req.params;

  try {
    let graph = graphSystem.getGraph(sessionId);

    // If graph doesn't exist, initialize it with empty structure
    if (!graph) {
      graphSystem.initializeGraph(sessionId);
      graph = graphSystem.getGraph(sessionId)!;
    }

    res.json({
      success: true,
      graph,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve graph',
    });
  }
});

/**
 * GET /explainability/context/:sessionId
 * Get the conversation context for a session
 */
router.get('/context/:sessionId', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { limit } = req.query;

  try {
    const limitNum = limit && typeof limit === 'string' ? parseInt(limit, 10) : undefined;
    const messages = semanticContext.getMessages(sessionId, limitNum);

    res.json({
      success: true,
      sessionId,
      messages,
      count: messages.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve context',
    });
  }
});

/**
 * GET /explainability/reasoning-path/:sessionId
 * Get reasoning path between two nodes
 */
router.get('/reasoning-path/:sessionId', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { startNode, endNode } = req.query;

  if (!startNode || !endNode) {
    return res.status(400).json({
      success: false,
      error: 'startNode and endNode query parameters are required',
    });
  }

  try {
    const path = graphSystem.getReasoningPath(
      sessionId,
      startNode as string,
      endNode as string
    );

    res.json({
      success: true,
      path,
      length: path.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to compute reasoning path',
    });
  }
});

/**
 * GET /explainability/stats
 * Get explainability statistics
 */
router.get('/stats', (_req: Request, res: Response) => {
  try {
    const graphStats = graphSystem.getStats();
    const contextStats = semanticContext.getStats();

    res.json({
      success: true,
      stats: {
        graph: graphStats,
        context: contextStats,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve stats',
    });
  }
});

/**
 * DELETE /explainability/session/:sessionId
 * Clear all explainability data for a session
 */
router.delete('/session/:sessionId', (req: Request, res: Response) => {
  const { sessionId } = req.params;

  try {
    graphSystem.clearGraph(sessionId);
    semanticContext.clearSession(sessionId);

    res.json({
      success: true,
      message: `Cleared explainability data for session ${sessionId}`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to clear session data',
    });
  }
});

export default router;
