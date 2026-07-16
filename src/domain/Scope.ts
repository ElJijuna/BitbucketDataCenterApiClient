/**
 * The scope a setting or condition applies to (global, a project, or a repository).
 *
 * Returned by settings-style endpoints (reviewer groups, auto-decline,
 * auto-merge, hooks, default reviewer conditions, branch restrictions).
 */
export interface BitbucketScope {
  /** Id of the project or repository the setting is scoped to */
  resourceId: number;
  type: 'GLOBAL' | 'PROJECT' | 'REPOSITORY';
}
