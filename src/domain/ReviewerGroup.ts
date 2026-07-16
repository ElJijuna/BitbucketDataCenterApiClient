import type { BitbucketScope } from './Scope';
import type { BitbucketUser } from './User';

/**
 * A named group of reviewers configured on a project or repository, usable in
 * default reviewer conditions and when adding reviewers to pull requests.
 */
export interface BitbucketReviewerGroup {
  id: number;
  name: string;
  description?: string;
  /** The project or repository the group belongs to */
  scope?: BitbucketScope;
  /** Members of the group */
  users?: BitbucketUser[];
}

/**
 * Payload shared by `POST /settings/reviewer-groups` (create) and
 * `PUT /settings/reviewer-groups/{id}` (update).
 */
export interface ReviewerGroupPayload {
  name: string;
  description?: string;
  /** Members of the group; identify each user by `name` (and/or `id`/`slug`) */
  users?: Array<{ name: string; id?: number; slug?: string }>;
}
