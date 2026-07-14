/**
 * Response for
 * `GET /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/commit-message-suggestion`.
 */
export interface CommitMessageSuggestion {
  message: string;
}
