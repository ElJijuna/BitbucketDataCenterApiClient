import type { PaginationParams } from './Pagination';
import type { BitbucketScope } from './Scope';

/** When a repository hook runs. */
export type RepositoryHookType = 'PRE_RECEIVE' | 'POST_RECEIVE' | 'PRE_PULL_REQUEST_MERGE';

/** Static metadata describing an installed repository hook. */
export interface RepositoryHookDetails {
  /** Unique hook module key (e.g. `'com.atlassian.bitbucket…:force-push-hook'`) */
  key: string;
  name: string;
  type: RepositoryHookType;
  description?: string;
  version?: string;
  configFormKey?: string;
  supportedScopes?: Array<'GLOBAL' | 'PROJECT' | 'REPOSITORY'>;
}

/**
 * A repository hook and its state at a given scope.
 */
export interface BitbucketRepositoryHook {
  details: RepositoryHookDetails;
  enabled: boolean;
  /** Whether the hook has been configured at this scope */
  configured?: boolean;
  /** The scope the state applies to */
  scope?: BitbucketScope;
}

/**
 * Query parameters accepted by `GET …/settings/hooks`.
 */
export interface HooksParams extends PaginationParams {
  /** Filter by hook type */
  type?: RepositoryHookType;
}

/**
 * Settings stored for a hook. The shape is defined by each hook's
 * configuration form, so it is an arbitrary JSON object of primitive values.
 */
export type HookSettings = Record<string, unknown>;
