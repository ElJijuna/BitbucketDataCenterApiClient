/**
 * Payload for `PUT /rest/api/latest/projects/{key}/repos/{slug}/browse/{path}`.
 */
export interface EditFilePayload {
  /** New file content */
  content: string;
  /** Commit message */
  message: string;
  /** Branch to update */
  branch: string;
  /** Latest commit ID on the branch — required to detect conflicts */
  sourceCommitId: string;
  /** Source branch for cross-branch edits */
  sourceBranch?: string;
}
