const express = require("express");
const bodyParser = require("body-parser");
const forexRoutes = require("./routes");
const { connectDB, closeDB } = require("../scraper/database");

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to the database when starting the app
(async () => {
  try {
    await connectDB();
    console.log("Connected to the database");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
})();

app.use(bodyParser.json());
app.use("/api", forexRoutes);

// Close the database connection when the app exits
process.on("exit", async () => {
  await closeDB();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
