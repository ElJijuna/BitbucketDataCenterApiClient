import type { PagedResponse, PaginationParams } from './domain/Pagination';

/**
 * Lazily iterates over every item across all pages of a paginated Bitbucket
 * endpoint, following `nextPageStart` until `isLastPage` is reached.
 *
 * @param fetchPage - A function that fetches a single page given a `start` offset,
 *   typically a bound client/resource method (e.g. `(params) => bb.projects(params)`)
 * @param params - Base parameters passed to every page request (e.g. `limit`, filters)
 *
 * @example
 * ```typescript
 * for await (const project of paginate((params) => bb.projects(params), { limit: 50 })) {
 *   console.log(project.key);
 * }
 *
 * const prs = await bb.project('PROJ').repo('my-repo').pullRequests();
 * for await (const pr of paginate(
 *   (params) => bb.project('PROJ').repo('my-repo').pullRequests(params),
 *   { state: 'OPEN' },
 * )) {
 *   console.log(pr.id);
 * }
 * ```
 */
export async function* paginate<T, P extends PaginationParams = PaginationParams>(
  fetchPage: (params: P) => Promise<PagedResponse<T>>,
  params?: P,
): AsyncGenerator<T, void, void> {
  let start = params?.start;

  while (true) {
    const page = await fetchPage({ ...params, start } as P);

    yield* page.values;

    if (page.isLastPage || page.nextPageStart === undefined) {
      return;
    }

    start = page.nextPageStart;
  }
}
