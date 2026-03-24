/**
 * Common pagination and filtering parameters accepted by Bitbucket Data Center list endpoints.
 */
export interface PaginationParams {
  /**
   * Maximum number of results to return per page.
   * Bitbucket default is `25`, maximum is `1000`.
   */
  limit?: number;
  /**
   * 0-based index of the first result to return.
   * Use `nextPageStart` from the previous response to paginate forward.
   */
  start?: number;
}

/**
 * Wrapper returned by Bitbucket paginated list endpoints.
 * @internal
 */
export interface PagedResponse<T> {
  values: T[];
  size: number;
  limit: number;
  isLastPage: boolean;
  start: number;
  nextPageStart?: number;
}
