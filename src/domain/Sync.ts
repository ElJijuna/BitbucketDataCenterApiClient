/** A ref tracked by fork synchronization, and its state relative to upstream. */
export interface SyncRef {
  id: string;
  displayId: string;
  type: 'BRANCH' | 'TAG';
  state?: 'AHEAD' | 'DIVERGED' | 'ORPHANED';
  tag?: boolean;
}

/**
 * Fork synchronization status of a repository.
 */
export interface RefSyncStatus {
  /** Whether sync is available for this repository (i.e. it is a fork) */
  available?: boolean;
  /** Whether sync is enabled for this repository */
  enabled: boolean;
  /** Epoch millisecond timestamp of the last synchronization */
  lastSync?: number;
  aheadRefs?: SyncRef[];
  divergedRefs?: SyncRef[];
  orphanedRefs?: SyncRef[];
}

/**
 * Payload for `POST /rest/sync/latest/projects/{key}/repos/{slug}`
 * (enables or disables fork synchronization).
 */
export interface SetSyncStatusData {
  enabled: boolean;
}

/**
 * Payload for `POST /rest/sync/latest/projects/{key}/repos/{slug}/synchronize`
 * (manually synchronizes a diverged or orphaned ref).
 *
 * - `'MERGE'` — merge upstream into the ref (optionally with `context.commitMessage`)
 * - `'REBASE'` — rebase the ref onto upstream
 * - `'DISCARD'` — discard local changes, resetting the ref to upstream
 */
export interface RefSyncRequest {
  /** The ref to synchronize (e.g. `'refs/heads/main'`) */
  refId: string;
  action: 'MERGE' | 'REBASE' | 'DISCARD';
  context?: { commitMessage?: string };
}
