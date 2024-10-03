const axios = require("axios");
const cheerio = require("cheerio");
const { storeData } = require("./database");

async function fetchExchangeData(quote, fromDate, toDate) {
  const url = `https://finance.yahoo.com/quote/${quote}/history/?period1=${fromDate}&period2=${toDate}`;

  try {
    const response = await axios.get(url);
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

    await storeData(data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

module.exports = { fetchExchangeData };
