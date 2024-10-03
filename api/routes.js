const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

router.get("/", (req, res) => {
  res.json({ message: "API is working!" });
});

router.post("/forex-data", async (req, res) => {
  const { from, to, period } = req.body;

  try {
    await client.connect();
    const collection = client.db("forexDB").collection("exchangeData");
    const queryDate = new Date(Date.now() - getPeriodInMilliseconds(period));
    const data = await collection.find({ date: { $gte: queryDate } }).toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
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
