/** Discriminates how a {@link RefMatcher} matches refs. */
export type RefMatcherTypeId = 'ANY_REF' | 'BRANCH' | 'PATTERN' | 'MODEL_CATEGORY' | 'MODEL_BRANCH';

/**
 * Matches a set of refs (branches/tags) by exact id, pattern, or branching-model
 * category. Used by default reviewer conditions, branch restrictions, and
 * default tasks.
 *
 * @example
 * ```typescript
 * // Match a specific branch
 * { id: 'refs/heads/main', type: { id: 'BRANCH' } }
 *
 * // Match any ref
 * { id: 'ANY_REF_MATCHER_ID', type: { id: 'ANY_REF' } }
 *
 * // Match by pattern
 * { id: 'release/**', type: { id: 'PATTERN' } }
 * ```
 */
export interface RefMatcher {
  /** The ref, pattern, or category being matched (e.g. `'refs/heads/main'`) */
  id: string;
  /** Human-readable form of `id` (e.g. `'main'`); returned by the server */
  displayId?: string;
  type: {
    id: RefMatcherTypeId;
    /** Human-readable matcher type name (e.g. `'Branch'`); returned by the server, not needed on write */
    name?: string;
  };
}
