const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/database");
const visitorRoutes = require("./routes/visitorRoutes");
const getClientIp = require('./middleware/getClientIp');
const rateLimiter = require('./middleware/rateLimiter');
const morgan = require("morgan");
const errorHandler = require("./middleware/errorHandler");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
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

// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});