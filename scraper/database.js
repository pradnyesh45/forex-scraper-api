const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI; // MongoDB connection string
console.log(uri);
const client = new MongoClient(uri);

async function connectDB() {
  console.log("Connecting to DB");
  await client.connect();
  console.log("Connected to DB");
}

async function storeData(data) {
  console.log("Storing data in DB");
  const collection = client.db("forexDB").collection("exchangeData");
  await collection.insertMany(data);
}

async function closeDB() {
  await client.close();
}

connectDB().catch(console.error);

module.exports = { storeData, closeDB };
