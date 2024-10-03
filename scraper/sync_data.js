const cron = require("node-cron");
const { fetchExchangeData } = require("./scraper");

// Schedule to run once a day
// cron.schedule("0 0 * * *", () => {
// For testing purposes, we will run the cron job every minute
cron.schedule("* * * * *", () => {
  console.log("Running scheduled data sync...");

  const currencyPairs = [
    { from: "GBP", to: "INR", periods: ["1W", "1M", "3M", "6M", "1Y"] },
    { from: "AED", to: "INR", periods: ["1W", "1M", "3M", "6M", "1Y"] },
  ];

  currencyPairs.forEach((pair) => {
    pair.periods.forEach((period) => {
      const fromDate =
        Math.floor(Date.now() / 1000) - getPeriodInSeconds(period);
      const toDate = Math.floor(Date.now() / 1000);
      const quote = `${pair.from}${pair.to}=X`;
      fetchExchangeData(quote, fromDate, toDate);
    });
  });
});

function getPeriodInSeconds(period) {
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
