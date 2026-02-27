import { AuthenticateWithRedirectCallback, useClerk } from "@clerk/clerk-react";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { CallbackSkeleton } from "@/components/auth/AuthSkeletons";

import { AuthProcessingState } from "@/components/auth/AuthProcessingState";

export default function SsoCallbackPage() {
  const { loaded: isLoaded } = useClerk();

  return (
    <AuthSplitLayout variant="login">
      {!isLoaded ? (
        <CallbackSkeleton />
      ) : (
        <div className="flex flex-col items-center justify-center py-8 max-w-md mx-auto w-full">
          <AuthProcessingState />

          <div className="flex flex-col items-center">
            <AuthenticateWithRedirectCallback
              signInFallbackRedirectUrl="/app/feed"
              signUpFallbackRedirectUrl="/app/feed"
              signInForceRedirectUrl="/app/feed"
              signUpForceRedirectUrl="/app/feed"
            />
          </div>
        </div>
      )}
    </AuthSplitLayout>
  );
}
