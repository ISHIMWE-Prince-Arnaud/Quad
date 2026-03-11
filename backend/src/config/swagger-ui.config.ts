import type { SwaggerUiOptions } from "swagger-ui-express";

export const swaggerUiOptions: SwaggerUiOptions = {
  customSiteTitle: "Quad API Documentation",
  customfavIcon: "/favicon.ico",
  customCss: `
    /* Hide top bar */
    .swagger-ui .topbar { display: none; }
    
    /* Clean up borders and add subtle rounding */
    .swagger-ui .opblock { border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
    .swagger-ui .opblock .opblock-summary-method { border-radius: 6px; padding: 6px 15px; }
    .swagger-ui .btn { border-radius: 6px; font-weight: 600; }
    
    /* Filter bar styling */
    .swagger-ui .wrapper .block { padding-top: 20px; }
    .swagger-ui input[type=text] { border-radius: 6px; border: 1px solid #d1d5db; padding: 8px 12px; }
    
    /* Elegant Dark Mode Magic (Invert + Hue Rotate) */
    body { background-color: #0f172a; /* Tailwind slate-900 */ }
    .swagger-ui { filter: invert(92%) hue-rotate(180deg); }
    .swagger-ui .microlight { filter: invert(100%) hue-rotate(180deg); }
    .swagger-ui .opblock-summary-control:focus { outline: none; }
    .swagger-ui .models { display: none !important; } /* Hide models entirely for cleaner look */
  `,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true, // Enables the search bar to filter by tag
    defaultModelsExpandDepth: -1, // Hides models at the bottom
    docExpansion: "none", // Collapses all endpoints by default ('list' expands tags, 'full' expands endpoints)
    tagsSorter: "alpha",
    operationsSorter: "alpha",
    tryItOutEnabled: true, // Enables "Try it out" by default
  },
};
