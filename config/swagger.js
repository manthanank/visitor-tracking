const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Visitor Tracking API",
      version: "1.0.0",
      description: "API documentation for the Visitor Tracking application",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./routes/*.js", "./controllers/*.js"], // Adjust the paths to your route and controller files
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};
