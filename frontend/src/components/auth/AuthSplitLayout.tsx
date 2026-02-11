import type { ReactNode } from "react";
import { motion } from "framer-motion";

type AuthVariant = "login" | "signup";

type AuthSplitLayoutProps = {
  variant: AuthVariant;
  children: ReactNode;
};

function LiveAccentMocks() {
  return (
    <div className="relative mt-10 hidden w-full max-w-xl md:block">
      <motion.div
        className="absolute -left-2 top-2 h-40 w-64 rounded-2xl border border-border/60 bg-card/60 p-4 shadow-2xl backdrop-blur"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-foreground">Live Poll</div>
          <div className="text-xs text-muted-foreground">Updating</div>
        </div>
        <div className="mt-3 space-y-2">
          <div className="text-sm text-muted-foreground">
            Which feature should ship next?
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Stories editor</span>
                <motion.span
                  className="text-foreground"
                  initial={{ opacity: 0.85 }}
                  animate={{ opacity: [0.85, 1, 0.85] }}
                  transition={{ duration: 2.2, repeat: Infinity }}>
                  54%
                </motion.span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-muted">
                <motion.div
                  className="h-2 rounded-full bg-primary"
                  initial={{ width: "48%" }}
                  animate={{ width: ["48%", "54%", "52%", "54%"] }}
                  transition={{
                    duration: 3.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Reactions</span>
                <span className="text-foreground">31%</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-muted">
                <div className="h-2 w-[31%] rounded-full bg-secondary" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute right-0 top-16 h-36 w-72 rounded-2xl border border-border/60 bg-card/60 p-4 shadow-2xl backdrop-blur"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.05 }}>
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-foreground">Chat</div>
          <motion.div
            className="text-xs text-muted-foreground"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 1.8, repeat: Infinity }}>
            3 typing…
          </motion.div>
        </div>
        <div className="mt-3 space-y-2">
          <div className="w-fit rounded-full bg-muted px-3 py-1 text-xs text-foreground">
            Did you see the vote spike?
          </div>
          <motion.div
            className="ml-auto w-fit rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
            Yep. It’s moving fast.
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="absolute left-10 top-52 h-28 w-80 rounded-2xl border border-border/60 bg-card/60 p-4 shadow-2xl backdrop-blur"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}>
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-foreground">Story</div>
          <div className="text-xs text-muted-foreground">Now</div>
        </div>
        <div className="mt-3">
          <div className="text-sm text-muted-foreground">
            A thread turned into a story — with images and highlights.
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <div className="h-2 w-2 rounded-full bg-secondary" />
            <motion.div
              className="h-2 w-2 rounded-full bg-accent"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.7, repeat: Infinity }}
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          background:
            "radial-gradient(900px 380px at 20% 10%, hsl(var(--primary) / 0.20), transparent 60%), radial-gradient(900px 380px at 80% 30%, hsl(var(--secondary) / 0.18), transparent 60%), radial-gradient(900px 380px at 50% 90%, hsl(var(--accent, 0 84% 60%) / 0.16), transparent 60%)",
        }}
      />
    </div>
  );
}

function LeftPanelCopy({ variant }: { variant: AuthVariant }) {
  if (variant === "login") {
    return (
      <>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground lg:text-5xl">
          Welcome back to Quad.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground lg:text-lg">
          Conversations are happening. Polls are updating. Stories are unfolding
          in real time.
        </p>
        <div className="mt-8 space-y-3 text-sm text-foreground/90">
          <div className="flex items-center gap-3">
            <span className="text-base">🔴</span>
            <span>Live poll results</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-base">💬</span>
            <span>Instant conversations</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-base">📖</span>
            <span>Rich stories</span>
          </div>
        </div>
        <div className="mt-10 text-sm text-muted-foreground">
          Your world. Happening now.
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="text-4xl font-semibold tracking-tight text-foreground lg:text-5xl">
        Where conversations move in real time.
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground lg:text-lg">
        Quad combines posts, live polls, stories, and chat — all in one
        interactive space.
      </p>
      <div className="mt-8 space-y-3 text-sm text-foreground/90">
        <div className="flex items-center gap-3">
          <span className="text-base">🗳</span>
          <span>Vote and see results instantly</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-base">📖</span>
          <span>Share stories with rich formatting</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-base">💬</span>
          <span>Chat while the feed evolves</span>
        </div>
      </div>
      <div className="mt-10 text-sm text-muted-foreground">Join the flow.</div>
    </>
  );
}

export function AuthSplitLayout({ variant, children }: AuthSplitLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative min-h-screen">
        <motion.div
          className="pointer-events-none absolute inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            background:
              "radial-gradient(1200px 520px at 15% 20%, hsl(var(--primary) / 0.22), transparent 60%), radial-gradient(1100px 520px at 80% 40%, hsl(var(--secondary) / 0.18), transparent 60%)",
          }}
        />

        <div className="mx-auto flex min-h-screen max-w-6xl items-stretch px-4 py-10 lg:px-8">
          <div className="grid w-full grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center">
              <LeftPanelCopy variant={variant} />
              <LiveAccentMocks />
            </div>

            <div className="flex flex-col justify-center">
              <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card/80 p-6 shadow-2xl backdrop-blur sm:p-8">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
