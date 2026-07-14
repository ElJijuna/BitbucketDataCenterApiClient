import type { PagedResponse, PaginationParams } from '../src/domain/Pagination';
import { paginate } from '../src/pagination';

interface Item {
  id: number;
}

type FetchPage = (params?: PaginationParams) => Promise<PagedResponse<Item>>;

function page(values: number[], isLastPage: boolean, nextPageStart?: number): PagedResponse<Item> {
  return {
    values: values.map((id): Item => ({ id })),
    size: values.length,
    limit: 2,
    isLastPage,
    start: 0,
    nextPageStart,
  };
}

function mockFetchPage(): jest.MockedFunction<FetchPage> {
  return jest.fn<Promise<PagedResponse<Item>>, [PaginationParams?]>();
}

describe('paginate', () => {
  it('yields every item across multiple pages', async () => {
    const fetchPage = mockFetchPage();

    fetchPage
      .mockResolvedValueOnce(page([1, 2], false, 2))
      .mockResolvedValueOnce(page([3, 4], false, 4))
      .mockResolvedValueOnce(page([5], true));

    const items: Item[] = [];

    for await (const item of paginate(fetchPage)) {
      items.push(item);
    }

    expect(items.map((i) => i.id)).toEqual([1, 2, 3, 4, 5]);
  });

  it('stops after a single page when isLastPage is true', async () => {
    const fetchPage = mockFetchPage();

    fetchPage.mockResolvedValueOnce(page([1, 2], true));

    const items: Item[] = [];

    for await (const item of paginate(fetchPage)) {
      items.push(item);
    }

    expect(items.map((i) => i.id)).toEqual([1, 2]);
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it('stops when nextPageStart is undefined even if isLastPage is false', async () => {
    const fetchPage = mockFetchPage();

    fetchPage.mockResolvedValueOnce(page([1], false, undefined));

    const items: Item[] = [];

    for await (const item of paginate(fetchPage)) {
      items.push(item);
    }

    expect(items.map((i) => i.id)).toEqual([1]);
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it('passes the nextPageStart as the start param on subsequent calls', async () => {
    const fetchPage = mockFetchPage();

    fetchPage.mockResolvedValueOnce(page([1, 2], false, 2)).mockResolvedValueOnce(page([3], true));

    const items: Item[] = [];

    for await (const item of paginate(fetchPage, { limit: 2 })) {
      items.push(item);
    }

    expect(items.map((i) => i.id)).toEqual([1, 2, 3]);
    expect(fetchPage).toHaveBeenNthCalledWith(1, { limit: 2, start: undefined });
    expect(fetchPage).toHaveBeenNthCalledWith(2, { limit: 2, start: 2 });
  });

  it('preserves base params (e.g. filters) across every page', async () => {
    const fetchPage = mockFetchPage();

    fetchPage.mockResolvedValueOnce(page([1], false, 1)).mockResolvedValueOnce(page([2], true));

    const items: Item[] = [];

    for await (const item of paginate(fetchPage, { name: 'my-proj' } as PaginationParams)) {
      items.push(item);
    }

    expect(items.map((i) => i.id)).toEqual([1, 2]);
    expect(fetchPage).toHaveBeenNthCalledWith(1, { name: 'my-proj', start: undefined });
    expect(fetchPage).toHaveBeenNthCalledWith(2, { name: 'my-proj', start: 1 });
  });

  it('yields nothing for an empty first page', async () => {
    const fetchPage = mockFetchPage();

    fetchPage.mockResolvedValueOnce(page([], true));

    const items: Item[] = [];

    for await (const item of paginate(fetchPage)) {
      items.push(item);
    }

    expect(items).toEqual([]);
  });
});
