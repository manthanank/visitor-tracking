const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/database");
const visitorRoutes = require("./routes/visitorRoutes");
const getClientIp = require("./middleware/getClientIp");
const rateLimiter = require("./middleware/rateLimiter");
const morgan = require("morgan");
const helmet = require("helmet");
const { swaggerUi, specs } = require("./config/swagger");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./middleware/logger");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(getClientIp);
app.use(rateLimiter);

// Database connection
connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the Visitor API");
});
app.use("/api", visitorRoutes);

// Swagger documentation route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
