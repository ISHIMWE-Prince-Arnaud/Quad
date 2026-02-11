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
        className="absolute -left-2 top-2 h-40 w-64 rounded-2xl border border-border/40 bg-card/40 p-4 shadow-xl backdrop-blur"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <div className="h-4 w-24 rounded bg-muted/60" />
        <div className="mt-4 space-y-3">
          <div className="h-3 w-full rounded bg-muted/40" />
          <div className="h-3 w-3/4 rounded bg-muted/40" />
          <div className="mt-4 flex gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/20" />
            <div className="h-8 w-24 rounded-full bg-secondary/20" />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute right-0 top-16 h-36 w-72 rounded-2xl border border-border/40 bg-card/40 p-4 shadow-xl backdrop-blur"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.05 }}>
        <div className="flex items-center justify-between gap-4">
          <div className="h-4 w-16 rounded bg-muted/60" />
          <div className="h-3 w-12 rounded bg-muted/40" />
        </div>
        <div className="mt-4 space-y-3">
          <div className="h-6 w-32 rounded-full bg-muted/40" />
          <div className="ml-auto h-6 w-24 rounded-full bg-primary/20" />
        </div>
      </motion.div>

      <motion.div
        className="absolute left-10 top-52 h-28 w-80 rounded-2xl border border-border/40 bg-card/40 p-4 shadow-xl backdrop-blur"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}>
        <div className="h-4 w-20 rounded bg-muted/60" />
        <div className="mt-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-muted/40" />
          <div className="space-y-2">
            <div className="h-3 w-40 rounded bg-muted/40" />
            <div className="h-3 w-24 rounded bg-muted/40" />
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
            "radial-gradient(900px 380px at 20% 10%, hsl(var(--primary) / 0.10), transparent 60%), radial-gradient(900px 380px at 80% 30%, hsl(var(--secondary) / 0.08), transparent 60%)",
        }}
      />
    </div>
  );
}

function LeftPanelCopy() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="h-10 w-3/4 rounded-lg bg-foreground/10 lg:h-12" />
        <div className="h-10 w-1/2 rounded-lg bg-foreground/10 lg:h-12" />
      </div>

      <div className="space-y-4 pt-4">
        <div className="h-4 w-full rounded bg-muted/60" />
        <div className="h-4 w-5/6 rounded bg-muted/60" />
        <div className="h-4 w-4/6 rounded bg-muted/60" />
      </div>

      <div className="mt-8 space-y-4 pt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-full bg-muted/60" />
            <div className="h-4 w-32 rounded bg-muted/40" />
          </div>
        ))}
      </div>

      <div className="mt-10 h-4 w-40 rounded bg-muted/40" />
    </div>
  );
}

export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-background lg:h-screen lg:overflow-hidden">
      <div className="relative min-h-screen w-full lg:h-full">
        <motion.div
          className="pointer-events-none absolute inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            background:
              "radial-gradient(1200px 520px at 85% 20%, hsl(var(--primary) / 0.22), transparent 60%), radial-gradient(1100px 520px at 20% 40%, hsl(var(--secondary) / 0.18), transparent 60%)",
          }}
        />

        <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 lg:h-full lg:min-h-0 lg:px-8 lg:py-0">
          <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="flex flex-col justify-center">
              <div className="mx-auto w-full max-w-md rounded-2xl border border-border/80 bg-card/70 p-6 shadow-2xl backdrop-blur sm:p-8">
                {children}
              </div>
            </div>

            <div className="hidden animate-pulse flex-col justify-center lg:flex">
              <LeftPanelCopy />
              <LiveAccentMocks />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
