export class BookmarkService {
  private static STORAGE_KEY = "quad_bookmarks_v1";

  private static read(): Set<string> {
    try {
      const raw = localStorage.getItem(BookmarkService.STORAGE_KEY);
      if (!raw) return new Set();
      const arr = JSON.parse(raw) as string[];
      if (Array.isArray(arr)) return new Set(arr);
      return new Set();
    } catch {
      return new Set();
    }
  }

  private static write(ids: Set<string>) {
    try {
      localStorage.setItem(
        BookmarkService.STORAGE_KEY,
        JSON.stringify(Array.from(ids))
      );
    } catch {
      // ignore write errors
    }
  }

  static isBookmarked(id: string): boolean {
    return BookmarkService.read().has(id);
  }

  static toggle(id: string): boolean {
    const ids = BookmarkService.read();
    let next = false;
    if (ids.has(id)) {
      ids.delete(id);
      next = false;
    } else {
      ids.add(id);
      next = true;
    }
    BookmarkService.write(ids);
    return next;
  }

  static list(): string[] {
    return Array.from(BookmarkService.read());
  }
}
