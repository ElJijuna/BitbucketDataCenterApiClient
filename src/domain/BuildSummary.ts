/**
 * Aggregated build counts for a single commit hash.
 */
export interface BitbucketBuildCount {
  successful: number;
  failed: number;
  inProgress: number;
  cancelled: number;
  unknown: number;
}

/**
 * Response from the build-summaries endpoint: a map of commit hash → build counts.
 *
 * Each key is a full commit SHA and the value contains the aggregated count of
 * builds in each state for that commit.
 *
 * @example
 * ```ts
 * {
 *   "abc123def456": { successful: 2, failed: 0, inProgress: 0, cancelled: 0, unknown: 0 },
 *   "def456abc123": { successful: 0, failed: 1, inProgress: 1, cancelled: 0, unknown: 0 }
 * }
 * ```
 */
export type BitbucketBuildSummaries = Record<string, BitbucketBuildCount>;
