const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI; // MongoDB connection string
const client = new MongoClient(uri);

async function connectDB() {
  await client.connect();
}

async function storeData(data) {
  const collection = client.db("forexDB").collection("exchangeData");
  await collection.insertMany(data);
}

async function closeDB() {
  await client.close();
}

connectDB().catch(console.error);

module.exports = { storeData, closeDB };
