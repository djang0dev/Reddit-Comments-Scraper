# Reddit Comments Scraper
A simply reddit comment scraper using Puppeteer & google-spreadsheet
it returns all comments sorted by points in a spreadsheet
## How to install

-  Install packages
```bash
npm install
```


- Request gsheet `credentials.json` following this [doc](https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication?id=service-account "doc")
- Create a spreadsheet and get its ID (check link), then paste it in an `.env` file following `.env-example` sample

## How to run

- Paste in `const urls`  each `old.reddit` thread link
- run `npm run start`

You can switch between headless and headfull just by changing `headless: true` in `puppeteer.launch({})` options
