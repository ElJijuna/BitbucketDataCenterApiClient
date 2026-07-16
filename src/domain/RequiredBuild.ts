import type { RefMatcher } from './RefMatcher';

/**
 * A required-builds merge check condition: pull requests targeting refs
 * matched by `refMatcher` cannot merge until the listed build keys succeed.
 */
export interface BitbucketRequiredBuildCondition {
  id: number;
  /** Build parent keys that must be green for the merge check to pass */
  buildParentKeys: string[];
  /** Refs the condition applies to */
  refMatcher: RefMatcher;
  /** Source refs exempt from the condition */
  exemptRefMatcher?: RefMatcher;
  /** Whether the condition is enforced for pull requests (default `true`) */
  requiredForPullRequest?: boolean;
  /** Whether the condition is enforced for merges via the merge queue (default `true`) */
  requiredForMergeQueue?: boolean;
}

/**
 * Payload shared by `POST …/condition` (create) and `PUT …/condition/{id}`
 * (update) of the required-builds API.
 */
export interface RequiredBuildConditionRequest {
  /** Build parent keys that must be green; at least one, at most 100 */
  buildParentKeys: string[];
  refMatcher: RefMatcher;
  exemptRefMatcher?: RefMatcher;
  requiredForPullRequest?: boolean;
  requiredForMergeQueue?: boolean;
}
