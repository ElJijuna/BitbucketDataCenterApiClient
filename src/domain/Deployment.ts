/**
 * The environment a deployment was made to.
 *
 * @remarks Sparsely documented by Atlassian (nested schema not expanded in the
 * REST API reference); typed defensively based on the fields shown in example
 * payloads. `type` is a free-form string (e.g. `'production'`), not a
 * documented enum.
 */
export interface BitbucketDeploymentEnvironment {
  key: string;
  displayName: string;
  type?: string;
  url?: string;
}

/**
 * Represents a deployment associated with a commit.
 *
 * Returned by `GET /rest/api/latest/projects/{key}/repos/{slug}/commits/{id}/deployments`.
 *
 * @remarks `state` is documented as a required string but Atlassian does not
 * enumerate its values; commonly observed values include `'PENDING'`,
 * `'IN_PROGRESS'`, `'SUCCESSFUL'`, `'FAILED'`, and `'ROLLED_BACK'`.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v1003/api-group-builds-and-deployments/#api-api-latest-projects-projectkey-repos-repositoryslug-commits-commitid-deployments-get}
 */
export interface BitbucketDeployment {
  deploymentSequenceNumber: number;
  description: string;
  displayName: string;
  environment: BitbucketDeploymentEnvironment;
  key: string;
  state: string;
  url: string;
  /** Milliseconds since epoch; set by the server */
  lastUpdated?: number;
}

/**
 * Query parameters accepted by
 * `GET`/`DELETE /rest/api/latest/projects/{key}/repos/{slug}/commits/{id}/deployments`.
 *
 * Together these identify a single deployment.
 */
export interface DeploymentLookupParams {
  deploymentSequenceNumber: number;
  key: string;
  environmentKey: string;
}

/**
 * Payload for `POST /rest/api/latest/projects/{key}/repos/{slug}/commits/{id}/deployments`.
 */
export interface AddDeploymentData {
  deploymentSequenceNumber: number;
  description: string;
  displayName: string;
  environment: BitbucketDeploymentEnvironment;
  key: string;
  state: string;
  url: string;
}
