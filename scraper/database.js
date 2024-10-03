const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

let db;

// Connect to the file-based SQLite database
function connectDB() {
  return new Promise((resolve, reject) => {
    console.log("Connecting to file-based DB");

    // Change the database from in-memory to file-based
    db = new sqlite3.Database("./forex-data.db", (err) => {
      if (err) {
        console.error("Could not connect to database:", err.message);
        reject(err);
      } else {
        console.log("Connected to the file-based SQLite database.");
        resolve();
      }
    });
  });
}

// Connect to the in-memory SQLite database
// function connectDB() {
//   return new Promise((resolve, reject) => {
//     console.log("Connecting to in-memory DB");
//     db = new sqlite3.Database(":memory:", (err) => {
//       if (err) {
//         console.error("Could not connect to database:", err.message);
//         reject(err);
//       } else {
//         console.log("Connected to the in-memory database.");
//         resolve();
//       }
//     });
//   });
// }

// Create tables for storing exchange rates
async function createTables() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(
        `
        CREATE TABLE IF NOT EXISTS exchangeRates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          fromCurrency TEXT NOT NULL,
          toCurrency TEXT NOT NULL,
          open REAL NOT NULL,
          high REAL NOT NULL,
          low REAL NOT NULL,
          close REAL NOT NULL,
          volume INTEGER NOT NULL
        )
      `,
        (err) => {
          if (err) {
            console.error("Error creating table:", err.message);
            reject(err);
          } else {
            console.log("Table created successfully.");
            resolve();
          }
        }
      );
    });
  });
}

// Store scraped data in the database
async function storeData(data) {
  await createTables();
  return new Promise((resolve, reject) => {
    console.log("Storing data in DB");
    const stmt = db.prepare(`
      INSERT INTO exchangeRates (date, fromCurrency, toCurrency, open, high, low, close, volume) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    data.forEach((record) => {
      stmt.run(
        record.date,
        record.fromCurrency,
        record.toCurrency,
        record.open,
        record.high,
        record.low,
        record.close,
        record.volume
      );
    });

    stmt.finalize((err) => {
      if (err) {
        console.error("Error finalizing statement:", err.message);
        reject(err);
      } else {
        console.log("Data stored successfully.");
        resolve();
      }
    });
  });
}

// Close the database connection
async function closeDB() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        console.error("Error closing database:", err.message);
        reject(err);
      } else {
        console.log("Database connection closed.");
        resolve();
      }
    });
  });
}

// Get exchange rates for specific currencies from the database
async function getExchangeRates(from, to, queryDate) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT * FROM exchangeRates 
      WHERE fromCurrency = ? 
      AND toCurrency = ? 
      AND date >= ?
      ORDER BY date ASC
    `;
    console.log("Querying exchange rates from DB", sql);

    db.all(
      sql,
      [from, to, queryDate.toISOString().split("T")[0]],
      (err, rows) => {
        if (err) {
          console.error("Error querying exchange rates:", err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
}

function getDb() {
  return db;
}

// Export the database functions
module.exports = {
  connectDB,
  createTables,
  storeData,
  closeDB,
  getExchangeRates,
  getDb,
};
