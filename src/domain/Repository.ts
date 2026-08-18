import type { PaginationParams } from './Pagination';
import type { BitbucketProject } from './Project';

/**
 * Represents a Bitbucket Data Center repository.
 */
export interface BitbucketRepository {
  slug: string;
  id: number;
  name: string;
  description?: string;
  state: string;
  statusMessage: string;
  forkable: boolean;
  project: BitbucketProject;
  public: boolean;
  links: Record<string, unknown>;
}

/**
 * Query parameters accepted by `GET /rest/api/latest/projects/{key}/repos`.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v819/api-group-repository/#api-api-latest-projects-projectkey-repos-get}
 */
export interface ReposParams extends PaginationParams {
  /** Filter by repository slug (case-insensitive prefix match) */
  slug?: string;
  /** Filter by repository name (case-insensitive prefix match) */
  name?: string;
  /**
   * Filter by the permission the authenticated user has on the repository.
   * e.g. `'REPO_READ'`, `'REPO_WRITE'`, `'REPO_ADMIN'`
   */
  permission?: string;
}

/**
 * Query parameters accepted by
 * `GET /rest/api/latest/projects/{key}/repos/{slug}/related`.
 */
export interface RelatedRepositoriesParams extends PaginationParams {
  /** Only include related repositories for which the user has this permission. */
  permission?: 'REPO_READ' | 'REPO_WRITE' | 'REPO_ADMIN';
}

/**
 * Payload for `POST /rest/api/latest/projects/{key}/repos` (create).
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v1003/api-group-repository/#api-api-latest-projects-projectkey-repos-post}
 */
export interface CreateRepositoryData {
  name: string;
  /** SCM to use; defaults to `'git'` (the only bundled SCM) */
  scmId?: string;
  /** Slug for the new repository; derived from `name` when omitted */
  slug?: string;
  /** Name of the default branch (e.g. `'main'`) */
  defaultBranch?: string;
  description?: string;
  forkable?: boolean;
  public?: boolean;
}

/**
 * Payload for `PUT /rest/api/latest/projects/{key}/repos/{slug}`.
 *
 * Only the fields to change need to be supplied; the server merges them with
 * the repository's current state. Set `project.key` to move the repository
 * to a different project.
 */
export interface UpdateRepositoryData {
  name?: string;
  description?: string;
  forkable?: boolean;
  public?: boolean;
  project?: { key: string };
}

/**
 * Payload for `POST /rest/api/latest/projects/{key}/repos/{slug}` (fork).
 *
 * All fields are optional; omit them to fork with the same name into the
 * same project.
 */
export interface ForkRepositoryData {
  name?: string;
  project?: { key: string };
  defaultBranch?: string;
}

/**
 * Query parameters accepted by
 * `GET /rest/api/latest/projects/{key}/repos/{slug}/archive`.
 */
export interface ArchiveParams {
  /** Branch, tag, or commit to archive; defaults to the default branch */
  at?: string;
  /** Archive format; defaults to `'zip'` */
  format?: 'zip' | 'tar' | 'tar.gz' | 'tgz';
  /** Filename suggested in the `Content-Disposition` response header */
  filename?: string;
  /** Paths to include in the archive; omit to archive the whole repository */
  path?: string | string[];
  /** Prefix prepended to every entry in the archive (e.g. `'my-repo/'`) */
  prefix?: string;
}

/**
 * Query parameters accepted by
 * `GET /rest/api/latest/projects/{key}/repos/{slug}/files[/{path}]`.
 */
export interface FilesParams extends PaginationParams {
  /** Branch, tag, or commit to list files at; defaults to the default branch */
  at?: string;
}

/**
 * Query parameters accepted by `GET /rest/api/latest/repos` (global repository search).
 *
 * All filters are optional and sent verbatim to the API.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v1003/api-group-repository/#api-api-latest-repos-get}
 */
export interface GlobalReposParams extends PaginationParams {
  /** Filter by repository name (case-insensitive, partial match) */
  name?: string;
  /** Filter by project key (case-insensitive match on the project key) */
  projectkey?: string;
  /**
   * Filter by project name (case-insensitive, **partial** match on the project
   * name — not its key). Projects with similar names can match more than
   * expected; prefer {@link GlobalReposParams.projectkey} or validate
   * `project.key` on each returned repository before processing.
   */
  projectname?: string;
  /**
   * Filter by the permission the authenticated user has on the repository
   * (e.g. `'REPO_READ'`, `'REPO_WRITE'`, `'REPO_ADMIN'`). When omitted, an
   * implicit 'read' permission (lower than `REPO_READ`) is assumed.
   */
  permission?: string;
  /** Filter by visibility: `'public'` or `'private'` */
  visibility?: 'public' | 'private';
  /** Filter by repository state */
  state?: 'AVAILABLE' | 'INITIALISING' | 'INITIALISATION_FAILED';
  /** Filter by archived status (default: `'ACTIVE'`) */
  archived?: 'ACTIVE' | 'ARCHIVED' | 'ALL';
}

/**
 * Query parameters accepted by {@link BitbucketClient.search}, which applies a
 * `%` contains-match prefix to `name` before calling `GET /rest/api/latest/repos`.
 *
 * For a 1:1 mapping of the documented endpoint parameters use
 * {@link GlobalReposParams} with `BitbucketClient.repos()` instead.
 */
export interface SearchReposParams extends PaginationParams {
  /**
   * Filter by repository name. A `%` prefix is automatically prepended to
   * perform a contains-style match (e.g. `'api'` → `'%api'`).
   */
  name?: string;
  /** Filter by project key (exact match) */
  projectkey?: string;
  /** Filter by project name (case-insensitive prefix match) */
  projectname?: string;
  /**
   * Filter by the permission the authenticated user has on the repository.
   * e.g. `'REPO_READ'`, `'REPO_WRITE'`, `'REPO_ADMIN'`
   */
  permission?: string;
  /** Filter by visibility: `'public'` or `'private'` */
  visibility?: 'public' | 'private';
  /** Filter by repository state */
  state?: 'AVAILABLE' | 'INITIALISING' | 'INITIALISATION_FAILED';
}
