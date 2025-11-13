// Simple Clerk appearance configuration that responds to our theme system
import { dark } from '@clerk/themes'

// Theme configuration that matches our shadcn/ui design system
export const getClerkAppearance = (isDarkMode: boolean) => ({
  baseTheme: isDarkMode ? dark : undefined,
  elements: {
    // Main card to match our card component
    card: "bg-card text-card-foreground border border-border shadow-lg",
    
    // Logo styling
    logoImage: "mx-auto mb-4 h-20 w-auto",
    logoBox: "flex justify-center mb-6",
    
    // Header with logo
    headerTitle: "text-2xl font-bold text-center mb-2",
    headerSubtitle: "text-center text-muted-foreground mb-6",
    
    // Form inputs to match our input styling
    formFieldInput: [
      "bg-background border-input text-foreground",
      "focus:ring-2 focus:ring-ring focus:border-transparent",
      "placeholder:text-muted-foreground"
    ].join(" "),
    
    // Buttons to match our design
    formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
    
    // Social buttons
    socialButtonsBlockButton: "bg-background hover:bg-accent border-border text-foreground",
    
    // Footer links
    footerActionLink: "text-primary hover:text-primary/80",
  },
  variables: {
    // Use our design system colors for perfect integration
    colorPrimary: "hsl(var(--primary))",
    colorDanger: "hsl(var(--destructive))",
    colorSuccess: "hsl(var(--success, 142 76% 36%))",
    colorWarning: "hsl(var(--warning, 38 92% 50%))",
    colorNeutral: "hsl(var(--muted))",
    
    // Match our background colors exactly
    colorBackground: "hsl(var(--card))",
    colorInputBackground: "hsl(var(--background))",
    colorInputText: "hsl(var(--foreground))",
    
    // Use our text colors
    colorText: "hsl(var(--foreground))",
    colorTextSecondary: "hsl(var(--muted-foreground))",
    colorTextOnPrimaryBackground: "hsl(var(--primary-foreground))",
    
    // Use our border and spacing
    borderRadius: "calc(var(--radius) - 2px)",
    spacingUnit: "1rem",
  },
  
  // Add custom logo
  layout: {
    logoImageUrl: "/logo.png",
    showOptionalFields: true,
  }
})

// Static version for components that don't need theme switching
export const clerkAppearance = {
  variables: {
    colorPrimary: "hsl(var(--primary))",
    colorBackground: "hsl(var(--background))",
    colorText: "hsl(var(--foreground))",
    borderRadius: "calc(var(--radius) - 2px)",
  },
  layout: {
    logoImageUrl: "/logo.png",
  }
}
