export interface PaginationParams {
  limit: number;
  cursor?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export function parsePagination(
  req: Request,
  options: { defaultLimit?: number } = {}
): PaginationParams {
  const url = new URL(req.url);
  const rawLimit = Number(url.searchParams.get('limit') ?? options.defaultLimit ?? DEFAULT_LIMIT);
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(1, Math.floor(rawLimit)), MAX_LIMIT)
    : DEFAULT_LIMIT;
  const cursor = url.searchParams.get('cursor') ?? undefined;
  return { limit, cursor };
}

export function encodeCursor(createdAt: string, id: string): string {
  return Buffer.from(`${createdAt}|${id}`).toString('base64url');
}

export function decodeCursor(cursor: string): { createdAt: string; id: string } | null {
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
    const separator = decoded.lastIndexOf('|');
    if (separator <= 0) {
      return null;
    }
    const createdAt = decoded.slice(0, separator);
    const id = decoded.slice(separator + 1);
    if (!createdAt || !id) {
      return null;
    }
    return { createdAt, id };
  } catch {
    return null;
  }
}
