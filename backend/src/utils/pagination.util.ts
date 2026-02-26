import type { Model } from "mongoose";
import type mongoose from "mongoose";

export type FilterQuery<T> = any;
export type PopulateOptions = any;
export type SortOrder = any;

export interface PaginationOptions {
  page: number;
  limit: number;
  sort?: string | Record<string, SortOrder> | Array<[string, SortOrder]>;
  select?: string;
  populate?: string | PopulateOptions | Array<string | PopulateOptions>;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
}

/**
 * Generic utility for paginated Mongoose queries
 */
export async function getPaginatedData<T>(
  model: Model<T>,
  query: FilterQuery<T>,
  options: PaginationOptions,
): Promise<PaginatedResult<T>> {
  const { page, limit, sort = { createdAt: -1 }, select, populate } = options;
  const skip = (page - 1) * limit;

  let baseQuery = model.find(query).sort(sort);
  if (select) {
    baseQuery = baseQuery.select(select);
  }
  if (populate) {
    if (typeof populate === "string") {
      baseQuery = baseQuery.populate(populate);
    } else if (Array.isArray(populate)) {
      baseQuery = baseQuery.populate(populate);
    } else {
      baseQuery = baseQuery.populate(populate);
    }
  }

  const [data, total] = await Promise.all([
    baseQuery.skip(skip).limit(limit).lean<T[]>(),
    model.countDocuments(query),
  ]);

  const pages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages,
      hasMore: page < pages,
    },
  };
}
