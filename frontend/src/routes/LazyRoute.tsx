import { Suspense } from "react";
import { LoadingPage } from "@/components/ui/loading";

interface LazyRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function LazyRoute({ children, fallback }: LazyRouteProps) {
  return <Suspense fallback={fallback || <LoadingPage />}>{children}</Suspense>;
}
