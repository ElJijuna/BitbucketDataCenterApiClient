/**
 * The authenticated user's file-review progress on a pull request.
 *
 * @remarks This endpoint's response shape is sparsely documented by Atlassian;
 * fields beyond `reviewedFiles` may vary by Bitbucket version. Treat unknown
 * fields defensively.
 */
export interface PullRequestReview {
  reviewedFiles: string[];
  [key: string]: unknown;
}

/**
 * Payload for `PUT /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/review`,
 * marking the given files as reviewed by the authenticated user.
 */
export interface CompleteReviewData {
  reviewedFiles: string[];
}
