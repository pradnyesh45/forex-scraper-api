const cron = require("node-cron");
const { fetchExchangeData } = require("./scraper");

// Schedule to run once a day
cron.schedule("0 0 * * *", () => {
  // For testing purposes, we will run the cron job every minute
  // cron.schedule("* * * * *", () => {
  console.log("Running scheduled data sync...");

  const currencyPairs = [
    { from: "GBP", to: "INR" },
    { from: "AED", to: "INR" },
  ];

  currencyPairs.forEach((pair) => {
    const fromDate =
      Math.floor(Date.now() / 1000) - convertPeriodToSeconds("1Y");
    const toDate = Math.floor(Date.now() / 1000);
    const quote = `${pair.from}${pair.to}=X`;

    console.log(
      `Fetching 1-year data for ${quote} from ${fromDate} to ${toDate}`
    );

    fetchExchangeData(quote, fromDate, toDate)
      .then(() => {
        console.log(`Data fetched successfully for ${quote}`);
      })
      .catch((error) => {
        console.error(`Error fetching data for ${quote}: ${error.message}`);
      });
  });
});

function convertPeriodToSeconds(period) {
  switch (period) {
    case "1W":
      return 7 * 24 * 60 * 60;
    case "1M":
      return 30 * 24 * 60 * 60;
    case "3M":
      return 90 * 24 * 60 * 60;
    case "6M":
      return 180 * 24 * 60 * 60;
    case "1Y":
      return 365 * 24 * 60 * 60;
    default:
      return 0;
  }
}
