import swaggerJsdoc from "swagger-jsdoc";
import { version } from "../package.json";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PowerliftTool API Documentation",
      version,
      description: "API documentation for the PowerliftTool weightlifting management system",
    },
    servers: [
      {
        url: "http://localhost:5000",
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
  apis: ["./routes/*.ts", "./models/*.ts", "./types.ts"], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options); 