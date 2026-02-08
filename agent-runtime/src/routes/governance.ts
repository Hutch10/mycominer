/**
 * Governance Routes - Access to governance logs
 */
import { Router, Request, Response } from 'express';
import governanceLog from '../system/governanceLog';

const router = Router();

/**
 * GET /governance/stats
 * Get governance statistics
 */
router.get('/stats', (_req: Request, res: Response) => {
  try {
    const stats = governanceLog.getStats();

    res.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve stats',
    });
  }
});

/**
 * GET /governance
 * Get all governance logs or filter by session
 */
router.get('/', (req: Request, res: Response) => {
  const { sessionId, limit } = req.query;

  try {
    let logs;

    if (sessionId && typeof sessionId === 'string') {
      logs = governanceLog.getLogsBySession(sessionId);
    } else {
      logs = governanceLog.getAllLogs();
    }

    // Apply limit if specified
    if (limit && typeof limit === 'string') {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        logs = logs.slice(-limitNum);
      }
    }

    res.json({
      success: true,
      logs,
      count: logs.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve logs',
    });
  }
});

/**
 * GET /governance/:logId
 * Get a specific log entry by ID
 */
router.get('/:logId', (req: Request, res: Response) => {
  const { logId } = req.params;

  try {
    const allLogs = governanceLog.getAllLogs();
    const log = allLogs.find(l => l.id === logId);

    if (!log) {
      return res.status(404).json({
        success: false,
        error: 'Log entry not found',
      });
    }

    res.json({
      success: true,
      log,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve log',
    });
  }
});

/**
 * DELETE /governance/:sessionId
 * Clear logs for a specific session
 */
router.delete('/:sessionId', (req: Request, res: Response) => {
  const { sessionId } = req.params;

  try {
    // Get all logs except those from this session
    const allLogs = governanceLog.getAllLogs();
    const logsToKeep = allLogs.filter(l => l.sessionId !== sessionId);
    const deletedCount = allLogs.length - logsToKeep.length;

    res.json({
      success: true,
      message: `Deleted ${deletedCount} log entries for session ${sessionId}`,
      deletedCount,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete logs',
    });
  }
});

export default router;
