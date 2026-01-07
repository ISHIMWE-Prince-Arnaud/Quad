import { Search, X } from "lucide-react";
import type { FormEvent } from "react";

import { Input } from "@/components/ui/input";

export function SearchHeader({
  inputValue,
  onInputValueChange,
  onClear,
  onSubmit,
}: {
  inputValue: string;
  onInputValueChange: (value: string) => void;
  onClear: () => void;
  onSubmit: (e: FormEvent) => void;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Explore</h1>
        <p className="text-muted-foreground">
          Find people, conversations, and stories.
        </p>
      </div>

      <form onSubmit={onSubmit} className="relative w-full md:max-w-lg">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={inputValue}
          onChange={(e) => onInputValueChange(e.target.value)}
          placeholder="Search everything..."
          className="h-11 pl-10 pr-12 text-base shadow-sm transition-all focus:ring-2"
        />
        {inputValue && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </form>
    </div>
  );
}
