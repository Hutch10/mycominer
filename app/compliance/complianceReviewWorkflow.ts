import { ComplianceReview } from './complianceTypes';
import { addLog } from './complianceLog';

export function startReview(reportId: string): ComplianceReview {
  const review: ComplianceReview = {
    reviewId: `review-${Date.now()}`,
    reportId,
    status: 'draft',
    reviewerComments: [],
    approvals: [],
  };
  addLog({ category: 'review', message: `Review started for report ${reportId}`, context: { reportId, reviewId: review.reviewId } });
  return review;
}

export function updateReviewStatus(review: ComplianceReview, status: ComplianceReview['status']): ComplianceReview {
  const updated = { ...review, status };
  addLog({ category: 'review', message: `Review status ${status}`, context: { reviewId: review.reviewId, reportId: review.reportId } });
  return updated;
}

export function addReviewerComment(review: ComplianceReview, comment: string): ComplianceReview {
  const updated = { ...review, reviewerComments: [...review.reviewerComments, comment] };
  addLog({ category: 'review', message: 'Reviewer comment added', context: { reviewId: review.reviewId }, details: { comment } });
  return updated;
}

export function recordApproval(review: ComplianceReview, params: { reviewer: string; decision: 'approved' | 'rejected'; reason?: string }): ComplianceReview {
  const approval = { reviewer: params.reviewer, timestamp: new Date().toISOString(), decision: params.decision, reason: params.reason };
  const updated = { ...review, approvals: [...review.approvals, approval], status: params.decision === 'approved' ? 'approved' : 'draft' };
  addLog({ category: params.decision === 'approved' ? 'approval' : 'rejection', message: `Review ${params.decision}`, context: { reviewId: review.reviewId, reportId: review.reportId }, details: approval });
  return updated;
}
