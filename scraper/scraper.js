const axios = require("axios");
const cheerio = require("cheerio");
const { storeData, getDb, connectDB } = require("./database");
let db = getDb();
const https = require("https");
const puppeteer = require("puppeteer");

// Create an agent with a larger maxHeaderSize
const agent = new https.Agent({
  maxHeaderSize: 32768, // Increase to 32KB
});

async function fetchExchangeData(quote, fromDate, toDate) {
  const url = `https://finance.yahoo.com/quote/${quote}/history/?period1=${fromDate}&period2=${toDate}`;

  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Set the User-Agent and other headers if necessary
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    });

    // Navigate to the URL
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // Wait for the specific element that contains the data (adjust the selector based on your needs)
    await page.waitForSelector(".table.yf-ewueuo.noDl"); // Change this to match the actual selector on the page

    // Scrape the data (adjust the evaluation function based on the content you need)
    const dataFromPuppeteer = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll(".table.yf-ewueuo.noDl tbody tr")
      ).map((row) => {
        const cells = row.querySelectorAll("td");
        return Array.from(cells).map((cell) => cell.innerText);
      });
    });

    // Close the browser
    await browser.close();

    // Transform the scraped data into the desired format
    // Transform the scraped data into the desired format
    const data = dataFromPuppeteer
      .map((row) => {
        if (row.length > 1) {
          const [date, openPrice, highPrice, lowPrice, closePrice, , volume] =
            row;

          // Format date to 'YYYY-MM-DD' if needed
          const formattedDate = new Date(date).toISOString().split("T")[0];

          return {
            date: formattedDate,
            fromCurrency: quote.slice(0, 3), // Extracting fromCurrency
            toCurrency: quote.slice(3, 6), // Extracting toCurrency
            open: parseFloat(openPrice.replace(/,/g, "")),
            high: parseFloat(highPrice.replace(/,/g, "")),
            low: parseFloat(lowPrice.replace(/,/g, "")),
            close: parseFloat(closePrice.replace(/,/g, "")),
            volume: parseInt(volume.replace(/,/g, ""), 10) || 0,
          };
        }
        return null;
      })
      .filter((row) => row !== null); // Remove null entries
    console.log(data);

    // Ensure the database is connected before storing data
    if (!db) {
      await connectDB(); // Connect to the database if not already connected
    }
    await storeData(data); // Store the data after ensuring db is connected
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

module.exports = { fetchExchangeData };
