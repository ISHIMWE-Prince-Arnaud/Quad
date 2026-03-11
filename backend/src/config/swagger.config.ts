import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env.config.js";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Quad API",
      version: "1.0.0",
      description:
        "Comprehensive API documentation for the Quad student social platform. Includes endpoints for authentication, posts, polls, chat, and more.",
      contact: {
        name: "Quad Support",
        email: "support@quad.app",
      },
      license: {
        name: "Proprietary",
      },
    },
    tags: [
      { name: "Auth", description: "Authentication and User Management" },
      { name: "Users", description: "User profiles and relationships" },
      { name: "Posts", description: "Feed, Stories, and Media Posts" },
      { name: "Polls", description: "Interactive Polls and Voting" },
      { name: "Chat", description: "Direct Messaging and Conversations" },
      { name: "Notifications", description: "User Activity Alerts" },
      { name: "Health", description: "System Health Checks" },
      { name: "Webhooks", description: "External integrations (e.g., Clerk)" },
    ],
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
  apis: ["./src/routes/**/*.ts", "./src/schemas/**/*.ts"], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
