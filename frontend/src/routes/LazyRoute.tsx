import { Suspense } from "react";
import { LoadingPage } from "@/components/ui/loading";

interface LazyRouteProps {
  children: React.ReactNode;
}

export function LazyRoute({ children }: LazyRouteProps) {
  return <Suspense fallback={<LoadingPage />}>{children}</Suspense>;
}
