const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); // Add this line
const connectDB = require("./config/database");
const visitorRoutes = require("./routes/visitorRoutes");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Add this line
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Database connection
connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the Visitor API");
});
app.use("/api", visitorRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});