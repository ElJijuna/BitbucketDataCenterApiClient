import type { PaginationParams } from './Pagination';
import type { BitbucketRepository } from './Repository';
import type { BitbucketUser } from './User';

/** A ref affected by a ref change activity. */
export interface RefChangeActivityRef {
  id: string;
  displayId: string;
  type: 'BRANCH' | 'TAG';
}

/** The change recorded by a ref change activity. */
export interface RefChangeActivityChange {
  refId: string;
  ref?: RefChangeActivityRef;
  fromHash: string;
  toHash: string;
  type: 'ADD' | 'DELETE' | 'UPDATE';
  /** How an `UPDATE` moved the ref (e.g. whether it was force-pushed) */
  updatedType?: 'UNKNOWN' | 'UNRESOLVED' | 'NOT_FORCED' | 'FORCED';
}

/**
 * An entry in a repository's ref change activity log (pushes, branch/tag
 * creations and deletions, etc.).
 */
export interface BitbucketRefChangeActivity {
  id: number;
  createdDate: number;
  refChange: RefChangeActivityChange;
  repository?: BitbucketRepository;
  /** What caused the change (e.g. `'push'`) */
  trigger?: string;
  user?: BitbucketUser;
}

/**
 * Query parameters accepted by
 * `GET /rest/api/latest/projects/{key}/repos/{slug}/ref-change-activities`.
 */
export interface RefChangeActivitiesParams extends PaginationParams {
  /** Filter by ref id (e.g. `'refs/heads/main'`) */
  ref?: string;
}
