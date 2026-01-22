import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env.config.js";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Quad API",
      version: "1.0.0",
      description: "API documentation for the Quad student social platform",
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/schemas/*.ts"], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
