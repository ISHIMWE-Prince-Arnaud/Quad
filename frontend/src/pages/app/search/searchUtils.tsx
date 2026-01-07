import type { ReactNode } from "react";
import { ArrowRight, type LucideIcon, Search } from "lucide-react";

type ResultCardProps = {
  icon: LucideIcon;
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: string;
  onClick: () => void;
};

export const ResultCard = ({
  icon: Icon,
  title,
  subtitle,
  meta,
  onClick,
}: ResultCardProps) => (
  <div
    onClick={onClick}
    className="group flex cursor-pointer items-start gap-4 rounded-lg border bg-card p-4 transition-all hover:bg-accent/50 hover:shadow-sm"
  >
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
      <Icon className="h-5 w-5" />
    </div>
    <div className="flex-1 space-y-1">
      <h4 className="font-medium leading-none group-hover:text-primary transition-colors">
        {title}
      </h4>
      {subtitle && (
        <p className="text-sm text-muted-foreground line-clamp-2">{subtitle}</p>
      )}
      {meta && <p className="text-xs text-muted-foreground pt-1">{meta}</p>}
    </div>
    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
  </div>
);

export const EmptyState = ({ query }: { query: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
      <Search className="h-8 w-8 text-muted-foreground" />
    </div>
    <h3 className="mt-4 text-lg font-semibold">No results found</h3>
    <p className="max-w-xs text-sm text-muted-foreground">
      We couldn't find anything matching "{query}". Try adjusting your filters or
      search term.
    </p>
  </div>
);

export const SearchSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
        <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
          <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);
