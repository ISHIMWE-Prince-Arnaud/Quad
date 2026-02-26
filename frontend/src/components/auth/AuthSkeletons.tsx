import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Shared wrapper to ensure skeleton width matches the max-w-md form
 */
function SkeletonWrapper({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("space-y-8 w-full max-w-md mx-auto animate-in fade-in duration-500", className)}>
      {children}
    </div>
  );
}

export function LoginSkeleton() {
  return (
    <SkeletonWrapper>
      {/* Header Skeleton */}
      <div className="flex flex-col items-center text-center space-y-3">
        <Skeleton className="h-10 w-[240px] rounded-xl" />
        <Skeleton className="h-4 w-[200px] rounded-lg opacity-40" />
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          {/* Google Button Skeleton */}
          <Skeleton className="h-11 w-full rounded-full" />

          {/* Divider Skeleton */}
          <div className="relative py-4 flex items-center justify-center">
            <div className="w-full h-[1px] bg-border/20" />
            <Skeleton className="absolute h-4 w-8 rounded-md bg-background z-10" />
          </div>

          <div className="space-y-4">
            {/* Input Skeletons */}
            <Skeleton className="h-11 w-full rounded-full" />
            <Skeleton className="h-11 w-full rounded-full" />

            {/* Sign In Button Skeleton */}
            <div className="mt-2">
              <Skeleton className="h-11 w-full rounded-full bg-primary/20" />
            </div>
          </div>
        </div>

        {/* Footer Skeleton */}
        <div className="flex justify-center pt-2">
          <Skeleton className="h-4 w-[180px] rounded-md opacity-40" />
        </div>
      </div>
    </SkeletonWrapper>
  );
}

export function SignUpSkeleton() {
  return (
    <SkeletonWrapper>
      {/* Step Indicator Skeleton */}
      <div className="flex justify-center items-center gap-3 px-10">
        <Skeleton className="h-1.5 flex-1 rounded-full bg-primary/20" />
        <Skeleton className="h-1.5 flex-1 rounded-full opacity-20" />
      </div>

      {/* Header Skeleton */}
      <div className="flex flex-col items-center text-center space-y-3">
        <Skeleton className="h-10 w-[280px] rounded-xl" />
        <Skeleton className="h-4 w-[240px] rounded-lg opacity-40" />
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          {/* Google Button Skeleton */}
          <Skeleton className="h-11 w-full rounded-full" />

          {/* Divider Skeleton */}
          <div className="relative py-4 flex items-center justify-center">
            <div className="w-full h-[1px] bg-border/20" />
            <Skeleton className="absolute h-4 w-8 rounded-md bg-background z-10" />
          </div>

          <div className="space-y-4">
            {/* Input Skeletons */}
            <Skeleton className="h-11 w-full rounded-full" />
            <Skeleton className="h-11 w-full rounded-full" />
            <Skeleton className="h-11 w-full rounded-full" />

            {/* Sign Up Button Skeleton */}
            <div className="mt-2">
              <Skeleton className="h-11 w-full rounded-full bg-primary/20" />
            </div>
          </div>
        </div>

        {/* Footer Skeleton */}
        <div className="flex justify-center pt-2">
          <Skeleton className="h-4 w-[200px] rounded-md opacity-40" />
        </div>
      </div>
    </SkeletonWrapper>
  );
}

export function CallbackSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center space-y-10 py-8 w-full max-w-md mx-auto animate-in fade-in duration-500">
      {/* Loading Icon/Circle Skeleton */}
      <div className="relative">
        <div className="absolute inset-x-[-30px] inset-y-[-30px] bg-primary/5 blur-2xl rounded-full" />
        <Skeleton className="h-16 w-16 rounded-full border border-primary/10" />
      </div>

      <div className="text-center space-y-4 w-full flex flex-col items-center">
        {/* Title Skeleton */}
        <Skeleton className="h-9 w-[240px] rounded-lg" />
        
        <div className="flex flex-col items-center space-y-2 w-full">
          {/* Subtitle Skeleton */}
          <Skeleton className="h-4 w-[200px] rounded-md opacity-40" />
          
          {/* Progress Bar Skeleton */}
          <Skeleton className="w-[180px] h-[3px] rounded-full opacity-20 mt-2" />
        </div>
      </div>
    </div>
  );
}
