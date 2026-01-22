import { Model, Document, FilterQuery } from "mongoose";

export interface PaginationOptions {
  page: number;
  limit: number;
  sort?: any;
  select?: string;
  populate?: any;
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
export async function getPaginatedData<T extends Document>(
  model: Model<T>,
  query: FilterQuery<T>,
  options: PaginationOptions
): Promise<PaginatedResult<T>> {
  const { page, limit, sort = { createdAt: -1 }, select, populate } = options;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model
      .find(query)
      .sort(sort)
      .select(select)
      .populate(populate)
      .skip(skip)
      .limit(limit)
      .lean(),
    model.countDocuments(query),
  ]);

  const pages = Math.ceil(total / limit);

  return {
    data: data as T[],
    pagination: {
      page,
      limit,
      total,
      pages,
      hasMore: page < pages,
    },
  };
}
