import type { BitbucketScope } from './Scope';

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

/**
 * Whether project-level auto-merge settings restrict repository-level overrides.
 *
 * - `'NONE'` — repositories may override the project setting
 * - `'RESTRICTED_MODIFIABLE'` — restricted, but the caller may lift the restriction
 * - `'RESTRICTED_UNMODIFIABLE'` — restricted by a higher scope the caller cannot change
 */
export type AutoMergeRestrictionState =
  | 'NONE'
  | 'RESTRICTED_MODIFIABLE'
  | 'RESTRICTED_UNMODIFIABLE';

/**
 * Auto-merge settings on a project or repository: whether pull request
 * auto-merge is available at that scope.
 */
export interface AutoMergeSettings {
  enabled: boolean;
  /** Only present on project-level settings */
  restrictionState?: AutoMergeRestrictionState;
  /** The scope the settings apply to */
  scope?: BitbucketScope;
}

/**
 * Payload for `PUT /rest/api/latest/projects/{key}/settings/auto-merge`.
 */
export interface AutoMergeProjectSettingsRequest {
  enabled?: boolean;
  /** Create or delete the restriction preventing repositories from overriding the project setting */
  restrictionAction?: 'CREATE' | 'DELETE' | 'NONE';
}

/**
 * Payload for `PUT /rest/api/latest/projects/{key}/repos/{slug}/settings/auto-merge`.
 */
export interface AutoMergeSettingsRequest {
  enabled?: boolean;
}
