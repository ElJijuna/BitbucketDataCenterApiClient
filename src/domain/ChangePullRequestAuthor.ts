import type { BitbucketScope } from './Scope';

/** Whether a project restriction permits repository-level change-author overrides. */
export type ChangePullRequestAuthorRestrictionState =
  | 'NONE'
  | 'RESTRICTED_MODIFIABLE'
  | 'RESTRICTED_UNMODIFIABLE';

/** Effective pull request change-author settings for a project or repository. */
export interface ChangePullRequestAuthorSettings {
  enabled: boolean;
  restrictionState?: ChangePullRequestAuthorRestrictionState;
  scope?: BitbucketScope;
}

/** Payload for `PUT /rest/api/latest/projects/{key}/settings/change-author`. */
export interface ChangePullRequestAuthorProjectSettingsRequest {
  enabled?: boolean;
  /** Create, delete, or leave unchanged the repository override restriction. */
  restrictionAction?: 'CREATE' | 'DELETE' | 'NONE';
}

/** Payload for `PUT /rest/api/latest/projects/{key}/repos/{slug}/settings/change-author`. */
export interface ChangePullRequestAuthorSettingsRequest {
  enabled?: boolean;
}
