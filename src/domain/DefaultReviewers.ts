import type { RefMatcher } from './RefMatcher';
import type { BitbucketReviewerGroup } from './ReviewerGroup';
import type { BitbucketScope } from './Scope';
import type { BitbucketUser } from './User';

/**
 * A default reviewer condition: when a pull request's source and target refs
 * match, the configured reviewers are added automatically.
 */
export interface BitbucketPullRequestCondition {
  id: number;
  /** The project or repository the condition is configured on */
  scope?: BitbucketScope;
  sourceRefMatcher: RefMatcher;
  targetRefMatcher: RefMatcher;
  reviewers: BitbucketUser[];
  reviewerGroups?: BitbucketReviewerGroup[];
  /** How many of the default reviewers must approve before merging */
  requiredApprovals: number;
}

/**
 * Payload shared by `POST …/condition` (create) and `PUT …/condition/{id}`
 * (update) of the default-reviewers API.
 */
export interface DefaultReviewersRequest {
  sourceMatcher: RefMatcher;
  targetMatcher: RefMatcher;
  /** Users to add as default reviewers, identified by `id` */
  reviewers?: Array<{ id: number }>;
  /** Reviewer groups to add as default reviewers, identified by `id` */
  reviewerGroups?: Array<{ id: number }>;
  requiredApprovals?: number;
}
