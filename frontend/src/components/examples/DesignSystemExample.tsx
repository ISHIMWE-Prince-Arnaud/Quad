/**
 * Design System Example Component
 *
 * This component demonstrates the usage of design tokens and animations
 * from the Quad design system.
 */

import { motion } from "framer-motion";
import {
  pageTransition,
  pageTransitionConfig,
  cardHover,
  fadeIn,
  fadeInConfig,
} from "@/lib/animations";
import { cn } from "@/lib/utils";

export function DesignSystemExample() {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      transition={pageTransitionConfig}
      className="container-medium py-12 space-y-8">
      {/* Header */}
      <motion.div
        variants={fadeIn}
        initial="initial"
        animate="animate"
        transition={fadeInConfig}
        className="text-center space-y-4">
        <h1 className="heading-1">Quad Design System</h1>
        <p className="muted-text">
          A modern, accessible design system built with shadcn/ui, TailwindCSS,
          and Framer Motion
        </p>
      </motion.div>

      {/* Color Palette */}
      <section className="space-y-4">
        <h2 className="heading-2">Color Palette</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ColorSwatch color="bg-primary" label="Primary" />
          <ColorSwatch color="bg-secondary" label="Secondary" />
          <ColorSwatch color="bg-accent" label="Accent" />
          <ColorSwatch color="bg-destructive" label="Destructive" />
          <ColorSwatch color="bg-success" label="Success" />
          <ColorSwatch color="bg-warning" label="Warning" />
          <ColorSwatch color="bg-muted" label="Muted" />
          <ColorSwatch color="bg-card" label="Card" />
        </div>
      </section>

      {/* Interactive Cards */}
      <section className="space-y-4">
        <h2 className="heading-2">Interactive Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InteractiveCard
            title="Hover Effect"
            description="This card lifts and increases shadow on hover"
          />
          <InteractiveCard
            title="Smooth Transitions"
            description="All animations complete within 300ms"
          />
          <InteractiveCard
            title="Accessible"
            description="WCAG 2.1 AA compliant with proper focus states"
          />
        </div>
      </section>

      {/* Typography Scale */}
      <section className="space-y-4">
        <h2 className="heading-2">Typography Scale</h2>
        <div className="space-y-2">
          <p className="text-xs">Extra Small Text (12px)</p>
          <p className="text-sm">Small Text (14px)</p>
          <p className="text-base">Base Text (16px)</p>
          <p className="text-lg">Large Text (18px)</p>
          <p className="text-xl">Extra Large Text (20px)</p>
          <p className="text-2xl">2XL Text (24px)</p>
          <p className="text-3xl">3XL Text (30px)</p>
        </div>
      </section>

      {/* Spacing Scale */}
      <section className="space-y-4">
        <h2 className="heading-2">Spacing Scale</h2>
        <div className="space-y-2">
          <SpacingExample size="1" />
          <SpacingExample size="2" />
          <SpacingExample size="4" />
          <SpacingExample size="6" />
          <SpacingExample size="8" />
          <SpacingExample size="12" />
        </div>
      </section>

      {/* Border Radius */}
      <section className="space-y-4">
        <h2 className="heading-2">Border Radius</h2>
        <div className="flex flex-wrap gap-4">
          <RadiusExample radius="rounded-sm" label="Small" />
          <RadiusExample radius="rounded-md" label="Medium" />
          <RadiusExample radius="rounded-lg" label="Large" />
          <RadiusExample radius="rounded-xl" label="XL" />
          <RadiusExample radius="rounded-2xl" label="2XL" />
          <RadiusExample radius="rounded-full" label="Full" />
        </div>
      </section>

      {/* Shadows */}
      <section className="space-y-4">
        <h2 className="heading-2">Shadow Elevations</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <ShadowExample shadow="shadow-sm" label="Small" />
          <ShadowExample shadow="shadow-md" label="Medium" />
          <ShadowExample shadow="shadow-lg" label="Large" />
          <ShadowExample shadow="shadow-xl" label="XL" />
        </div>
      </section>
    </motion.div>
  );
}

function ColorSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="space-y-2">
      <div className={cn("h-20 rounded-lg", color)} />
      <p className="text-sm text-center">{label}</p>
    </div>
  );
}

function InteractiveCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      className={cn(
        "bg-card text-card-foreground",
        "rounded-lg shadow-md",
        "p-6 space-y-2",
        "border border-border",
        "cursor-pointer"
      )}>
      <h3 className="heading-4">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.div>
  );
}

function SpacingExample({ size }: { size: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className={cn("bg-primary h-4", `w-${size}`)} />
      <span className="text-sm">Spacing {size}</span>
    </div>
  );
}

function RadiusExample({ radius, label }: { radius: string; label: string }) {
  return (
    <div className="text-center space-y-2">
      <div className={cn("bg-primary h-16 w-16", radius)} />
      <p className="text-sm">{label}</p>
    </div>
  );
}

function ShadowExample({ shadow, label }: { shadow: string; label: string }) {
  return (
    <div className={cn("bg-card p-6 rounded-lg", shadow)}>
      <p className="text-sm text-center">{label}</p>
    </div>
  );
}
