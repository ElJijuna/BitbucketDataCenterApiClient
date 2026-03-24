/**
 * Represents a Jira issue linked to a Bitbucket Data Center pull request.
 */
export interface BitbucketIssue {
  /** The Jira issue key (e.g., `'ABC-123'`) */
  key: string;
  /** The URL to the issue in Jira */
  url: string;
}
