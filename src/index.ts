import { PrismaClient } from "@prisma/client";
import { Page, PageOption, PrismaParams } from "./types/filter.type";
import { buildWhereClause, checkSortElement } from "./helpers/filter.helper";
import { PrismaClientOptions } from "@prisma/client/runtime/library";

export * from "./types";

export class PrismaClientPaginated extends PrismaClient {
  constructor(options?: PrismaClientOptions) {
    super(options);
  }

  /**
   * Paginates the results of a database query.
   *
   * @template T - The type of the items in the page.
   * @param {string} model - The name of the model to query.
   * @param {PageOption} pageOption - The pagination and filtering options.
   * @param {PrismaParams} [prismaParams] - Optional ways to add prima params (where, include, select, groupBy ...) directly.
   * @returns {Promise<Page<T>>} - A promise that resolves to a page of results.
   * * Example:
   * ```
   * const pageOption: PageOption = {
   *   page: 1,
   *   size: 20,
   *   sort: ['name=asc'],
   *   filter: ['name==John', 'age>=18'],
   *   nestedFilter: ['address.city==New York', 'address.state==NY'],
   *   route: '/users',
   * };
   * const prismaParams: prismaParams = {
   *    where: { isAdmin: false },
   *    include:  { address: true },
   * };
   * const result = await prismaService.paginate('User', pageOption, prismaParams);
   * ```
   */
  async paginate<T>(
    model: string,
    pageOption: PageOption,
    prismaParams?: PrismaParams
  ): Promise<Page<T>> {
    return await paginate(this, model, pageOption, prismaParams);
  }
}

/**
 * Paginates the results of a database query.
 *
 * @template T - The type of the items in the page.
 * @param {PrismaClient} prisma - prisma  client instance.
 * @param {string} model - The name of the model to query.
 * @param {PageOption} pageOption - The pagination and filtering options.
 * @param {PrismaParams} [prismaParams] - Optional ways to add prima params (where, include, select, groupBy ...) directly.
 * @returns {Promise<Page<T>>} - A promise that resolves to a page of results.
 * * Example:
 * ```
 * const prisma = new PrismaClient()
 * const pageOption: PageOption = {
 *   page: 1,
 *   size: 20,
 *   sort: ['name=asc'],
 *   filter: ['name==John', 'age>=18'],
 *   nestedFilter: ['address.city==New York', 'address.state==NY'],
 *   route: '/users',
 * };
 * const prismaParams: prismaParams = {
 *    where: { isAdmin: false },
 *    include:  { address: true },
 * };
 * const result = await prismaService.paginate(prisma, 'User', pageOption, prismaParams);
 * ```
 */
export async function paginate<T>(
  prisma: PrismaClient,
  model: string,
  pageOption: PageOption,
  prismaParams?: PrismaParams
): Promise<Page<T>> {
  const { page = 1, size = 20 } = pageOption;
  const skip = (page - 1) * size;

  const query: {
    skip: number;
    take: number;
    where: any;
    select: any;
    include: any;
    orderBy?: any;
  } = {
    skip,
    take: size,
    orderBy: prismaParams?.orderBy ?? undefined,
    where: prismaParams?.where ?? undefined,
    select: prismaParams?.select ?? undefined,
    include: prismaParams?.include ?? undefined,
  };

  const resultPage: Page<T> = {
    content: [],
    metaData: {
      page,
      size,
      totalPages: 0,
    },
  };

  // Handle filter and nestedFilter
  if (pageOption.filter && pageOption.filter?.length > 0) {
    query.where = buildWhereClause(pageOption.filter);
  }

  if (pageOption.nestedFilter && pageOption.nestedFilter?.length > 0) {
    const nestedFilter = buildWhereClause(pageOption.nestedFilter, true);
    if (!query?.where) query.where = {};
    query.where = Object.assign(query.where, nestedFilter);
  }

  // Add the orderBy to the query if it is provided
  let isSorted = false;

  if (pageOption.sort && pageOption.sort?.length > 0) {
    const sort = [...new Set(pageOption.sort)]?.map((sortElement) => {
      checkSortElement(sortElement);
      const [field, order] = sortElement.split("=");
      return {
        [field]: order.toLowerCase(),
      };
    });
    if (!query?.orderBy) query.orderBy = {};
    Object.assign(query.orderBy, sort);
    resultPage.metaData.sort = sort;
    isSorted = true;
  }

  if (query.select) {
    delete query.include;
    console.warn(
      "Please either use `include` or `select`, but not both at the same time."
    );
  }

  console.log("🚀 query", query);

  const [data, count] = await Promise.all<[T[], number]>([
    prisma[model].findMany(query),
    prisma[model].count({ where: query["where"] }),
  ]);

  const totalPages = Math.ceil(count / size);

  resultPage.content = data;

  if (pageOption.route && !pageOption.filter && !pageOption.nestedFilter) {
    const prev =
      page > 1 ? `${pageOption.route}?page=${page - 1}&size=${size}` : "";

    const next =
      page < totalPages
        ? `${pageOption.route}?page=${page + 1}&size=${size}`
        : "";

    resultPage.links = {
      first: isSorted
        ? `${pageOption.route}?size=${size}&sort=["${pageOption.sort}"]`
        : `${pageOption.route}?size=${size}`,

      prev:
        isSorted && prev != ""
          ? `${prev}&sort=["${pageOption.sort}"]`
          : `${prev}`,

      next:
        isSorted && next != ""
          ? `${next}&sort=["${pageOption.sort}"]`
          : `${next}`,

      last: isSorted
        ? `${pageOption.route}?page=${totalPages}&size=${size}&sort=["${pageOption.sort}"`
        : `${pageOption.route}?page=${totalPages}&size=${size}`,
    };
  }

  resultPage.metaData.totalPages = totalPages;

  return resultPage;
}
