const express = require("express");
const router = express.Router();
const {
  getExchangeRates,
  connectDB,
  createTables,
} = require("../scraper/database");
// const { MongoClient } = require("mongodb");
require("dotenv").config();

// const uri = process.env.MONGO_URI;
// const client = new MongoClient(uri);

// Connect to the database once when the app starts
(async () => {
  try {
    await connectDB();
    await createTables(); // Ensure tables are created
    console.log("Database connected and tables created.");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
})();

router.get("/", (req, res) => {
  res.json({ message: "API is working!" });
});

router.post("/forex-data", async (req, res) => {
  const { from, to, period } = req.body;

  if (!from || !to || !period) {
    return res
      .status(400)
      .json({ error: "Please provide 'from', 'to', and 'period' fields." });
  }

  // Calculate the date range
  const queryDate = new Date(Date.now() - getPeriodInMilliseconds(period));
  console.log("Querying data from:", queryDate);

  try {
    // Fetch the exchange rates from SQLite
    const data = await getExchangeRates(from, to, queryDate);
    if (data.length === 0) {
      return res.json({ message: "No data found for the given query." });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function getPeriodInMilliseconds(period) {
  switch (period) {
    case "1W":
      return 7 * 24 * 60 * 60 * 1000;
    case "1M":
      return 30 * 24 * 60 * 60 * 1000;
    case "3M":
      return 90 * 24 * 60 * 60 * 1000;
    case "6M":
      return 180 * 24 * 60 * 60 * 1000;
    case "1Y":
      return 365 * 24 * 60 * 60 * 1000;
    default:
      return 0;
  }
}

module.exports = router;
