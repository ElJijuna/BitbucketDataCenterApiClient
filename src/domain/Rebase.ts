/** A reason the pull request's source branch currently cannot be rebased. */
export interface RebaseVeto {
  summaryMessage: string;
  detailedMessage: string;
}

/**
 * Response for `GET /rest/git/latest/projects/{key}/repos/{slug}/pull-requests/{id}/rebase`.
 */
export interface CanRebaseResult {
  rebaseable: boolean;
  vetoes: RebaseVeto[];
}

/**
 * Response for `POST /rest/git/latest/projects/{key}/repos/{slug}/pull-requests/{id}/rebase`.
 */
export interface RebaseResult {
  id: string;
  displayId: string;
  rebasedCount?: number;
}
