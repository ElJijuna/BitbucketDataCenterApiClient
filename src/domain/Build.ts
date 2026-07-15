import type { BuildState } from './BuildStatus';

/**
 * Represents a build status associated with a commit, as returned by the
 * modern builds API (distinct from the legacy `/rest/build-status/latest` endpoint).
 *
 * Returned by `GET /rest/api/latest/projects/{key}/repos/{slug}/commits/{id}/builds?key={key}`.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v1003/api-group-builds-and-deployments/#api-api-latest-projects-projectkey-repos-repositoryslug-commits-commitid-builds-get}
 */
export interface BitbucketBuild {
  key: string;
  state: BuildState;
  url: string;
  buildNumber?: string;
  name?: string;
  description?: string;
  duration?: number;
  /** Milliseconds since epoch; defaults to the current date if not provided on creation */
  dateAdded?: number;
  /** Milliseconds since epoch; set by the server */
  lastUpdated?: number;
  /** Identifier of the plan/job that ran the branch plan that produced this build status */
  parent?: string;
  /** Fully qualified git reference, e.g. `refs/heads/main` */
  ref?: string;
  testResults?: {
    successful: number;
    failed: number;
    skipped: number;
  };
}

/**
 * Payload for `POST /rest/api/latest/projects/{key}/repos/{slug}/commits/{id}/builds`.
 */
export interface AddBuildData {
  key: string;
  state: BuildState;
  url: string;
  buildNumber?: string;
  name?: string;
  description?: string;
  duration?: number;
  dateAdded?: number;
  parent?: string;
  ref?: string;
  testResults?: {
    successful: number;
    failed: number;
    skipped: number;
  };
}
