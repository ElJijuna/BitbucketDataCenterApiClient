/**
 * Pull-request merge strategy configuration for a repository.
 */
export interface BitbucketMergeStrategy {
  id: 'no-ff' | 'ff' | 'ff-only' | 'rebase-no-ff' | 'rebase-ff-only' | 'squash' | 'squash-ff-only';
  name: string;
  description: string;
  flag: string;
}

/**
 * Pull-request settings for a repository.
 *
 * Returned by `GET /rest/api/latest/projects/{key}/repos/{slug}/settings/pull-requests`.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v819/api-group-repository/#api-api-latest-projects-projectkey-repos-repositoryslug-settings-pull-requests-get}
 */
export interface BitbucketRepositorySettings {
  mergeConfig: {
    commitSummaries: number;
    defaultStrategy: BitbucketMergeStrategy;
    strategies: BitbucketMergeStrategy[];
    type: string;
  };
  requiredApprovals: number;
  requiredAllApprovals: boolean;
  requiredSuccessfulBuilds: number;
  pullRequestsEnabled: boolean;
}

/**
 * Payload for `POST /rest/api/latest/projects/{key}/repos/{slug}/settings/pull-requests`.
 *
 * Only the fields to change need to be supplied.
 */
export interface UpdateRepositorySettingsData {
  mergeConfig?: {
    defaultStrategy?: { id: BitbucketMergeStrategy['id'] };
    strategies?: { id: BitbucketMergeStrategy['id'] }[];
    commitSummaries?: number;
    type?: string;
  };
  requiredApprovals?: number;
  requiredAllApprovals?: boolean;
  requiredSuccessfulBuilds?: number;
}
