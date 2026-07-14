/**
 * Aggregated line-change counts for a single file's diff.
 *
 * @remarks This endpoint's exact response shape is sparsely documented by
 * Atlassian; `additions`/`deletions` reflect the commonly observed fields, but
 * treat unknown fields defensively.
 */
export interface BitbucketDiffStatsSummary {
  additions: number;
  deletions: number;
  [key: string]: unknown;
}
