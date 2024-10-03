const axios = require("axios");
const cheerio = require("cheerio");
const { storeData } = require("./database");
const https = require("https");

// Create an agent with a larger maxHeaderSize
const agent = new https.Agent({
  maxHeaderSize: 32768, // Increase to 32KB
});

async function fetchExchangeData(quote, fromDate, toDate) {
  const url = `https://finance.yahoo.com/quote/${quote}/history/?period1=${fromDate}&period2=${toDate}`;
  console.log("Fetching data from:", url);

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
      httpsAgent: agent, // Use the custom agent
    });
    console.log(`Data fetched successfully for ${quote}`);
    const $ = cheerio.load(response.data);

    const data = [];
    $("table tbody tr").each((index, element) => {
      const cols = $(element).find("td");
      if (cols.length > 1) {
        const date = $(cols[0]).text();
        const openPrice = $(cols[1]).text();
        const highPrice = $(cols[2]).text();
        const lowPrice = $(cols[3]).text();
        const closePrice = $(cols[4]).text();
        const volume = $(cols[6]).text() || "0";

        data.push({
          date,
          open: parseFloat(openPrice.replace(/,/g, "")),
          high: parseFloat(highPrice.replace(/,/g, "")),
          low: parseFloat(lowPrice.replace(/,/g, "")),
          close: parseFloat(closePrice.replace(/,/g, "")),
          volume: parseInt(volume.replace(/,/g, ""), 10),
        });
      }
    });
    console.log(data);

    await storeData(data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

module.exports = { fetchExchangeData };
