# Forex Scraper

- Scrapes Historical Exchange Data from Yahoo Finance Website
- Github Link: https://github.com/pradnyesh45/forex-scraper-api

## How to run?

- Make sure you have node installed on your system.
- Clone the repository onto your local computer.
- Open the root directory of forex-scraper-api on your termial.
- Type `npm install` to install all the dependencies.
- Type `node api/app.js` to run the server on localhost 3000. Leave it running.
- Open another terminal and again go to root directory of forex-scraper-api.
- Type `node scraper/sync_data.js`, it will run the cron job server which runs every minute. Wait for 1-2 minutes.
- We are done with the setup.

## Example in Action

- Post API endpoint: `http://localhost:3000/api/forex-data`
- Body: `{ "from": "GBP", "to": "INR", "period": "1M" }`
- Output: ![Output Image](./images/postman%20screenshot.png)
