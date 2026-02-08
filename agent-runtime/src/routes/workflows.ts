/**
 * Workflows Routes - Workflow execution management
 */
import { Router, Request, Response } from 'express';
import workflowEngine from '../system/workflowEngine';

const router = Router();

/**
 * POST /workflows
 * Create a new workflow execution
 */
router.post('/', (req: Request, res: Response) => {
  const { workflowName, steps } = req.body;

  if (!workflowName || !steps || !Array.isArray(steps)) {
    return res.status(400).json({
      success: false,
      error: 'workflowName and steps array are required',
    });
  }

  try {
    const executionId = workflowEngine.createExecution(workflowName, steps);

    res.status(201).json({
      success: true,
      executionId,
      message: 'Workflow execution created',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create workflow execution',
    });
  }
});

/**
 * GET /workflows/:executionId
 * Get workflow execution details
 */
router.get('/:executionId', (req: Request, res: Response) => {
  const { executionId } = req.params;

  try {
    const execution = workflowEngine.getExecution(executionId);

    if (!execution) {
      return res.status(404).json({
        success: false,
        error: 'Workflow execution not found',
      });
    }

    res.json({
      success: true,
      execution,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve workflow execution',
    });
  }
});

/**
 * POST /workflows/:executionId/start
 * Start a workflow execution
 */
router.post('/:executionId/start', (req: Request, res: Response) => {
  const { executionId } = req.params;

  try {
    const success = workflowEngine.startExecution(executionId);

    if (!success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to start execution - may already be running or not found',
      });
    }

    res.json({
      success: true,
      message: 'Workflow execution started',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to start workflow execution',
    });
  }
});

/**
 * POST /workflows/:executionId/pause
 * Pause a running workflow execution
 */
router.post('/:executionId/pause', (req: Request, res: Response) => {
  const { executionId } = req.params;

  try {
    const success = workflowEngine.pauseExecution(executionId);

    if (!success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to pause execution - may not be running or not found',
      });
    }

    res.json({
      success: true,
      message: 'Workflow execution paused',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to pause workflow execution',
    });
  }
});

/**
 * POST /workflows/:executionId/resume
 * Resume a paused workflow execution
 */
router.post('/:executionId/resume', (req: Request, res: Response) => {
  const { executionId } = req.params;

  try {
    const success = workflowEngine.resumeExecution(executionId);

    if (!success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to resume execution - may not be paused or not found',
      });
    }

    res.json({
      success: true,
      message: 'Workflow execution resumed',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to resume workflow execution',
    });
  }
});

/**
 * POST /workflows/:executionId/steps/:stepId/complete
 * Complete a workflow step
 */
router.post('/:executionId/steps/:stepId/complete', (req: Request, res: Response) => {
  const { executionId, stepId } = req.params;
  const { output } = req.body;

  try {
    const success = workflowEngine.completeStep(executionId, stepId, output);

    if (!success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to complete step - may not be running or not found',
      });
    }

    res.json({
      success: true,
      message: 'Step completed',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to complete step',
    });
  }
});

/**
 * POST /workflows/:executionId/steps/:stepId/fail
 * Fail a workflow step
 */
router.post('/:executionId/steps/:stepId/fail', (req: Request, res: Response) => {
  const { executionId, stepId } = req.params;
  const { error } = req.body;

  if (!error) {
    return res.status(400).json({
      success: false,
      error: 'Error message is required',
    });
  }

  try {
    const success = workflowEngine.failStep(executionId, stepId, error);

    if (!success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to fail step - step not found',
      });
    }

    res.json({
      success: true,
      message: 'Step marked as failed',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fail step',
    });
  }
});

/**
 * GET /workflows/stats
 * Get workflow execution statistics
 */
router.get('/stats', (_req: Request, res: Response) => {
  try {
    const stats = workflowEngine.getStats();

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
 * DELETE /workflows/:executionId
 * Delete a workflow execution
 */
router.delete('/:executionId', (req: Request, res: Response) => {
  const { executionId } = req.params;

  try {
    const success = workflowEngine.deleteExecution(executionId);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Workflow execution not found',
      });
    }

    res.json({
      success: true,
      message: 'Workflow execution deleted',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete workflow execution',
    });
  }
});

export default router;
