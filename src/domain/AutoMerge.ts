/**
 * A pending auto-merge request on a pull request: it merges automatically once
 * the pull request becomes mergeable (required builds pass, approvals met, etc.).
 */
export interface AutoMergeRequest {
  user: { name: string; displayName?: string; slug?: string };
  createdDate: number;
  message?: string;
  deleteSourceRef?: boolean;
}

/**
 * Payload for `POST /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/auto-merge`.
 */
export interface RequestAutoMergeData {
  message?: string;
  deleteSourceRef?: boolean;
  strategyId?: string;
}
