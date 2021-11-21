import puppeteer from 'puppeteer';
import Doc from './gsheet.js';
import dotenv from 'dotenv';

dotenv.config();

const urls = [
    'https://old.reddit.com/r/learnprogramming/comments/4q6tae/i_highly_recommend_harvards_free_online_2016_cs50/',
    'https://old.reddit.com/r/france/comments/qaijts/american_managing_a_french_team_culture_advice/',
];

async function scrapeComments(url) {

    const browser = await puppeteer.launch({headless: false, defaultViewport: null});
    const page = await browser.newPage();
    await page.goto(url);

    // remove cookie bar by inserting custom css
    await page.evaluate(async () => {
        const style = document.createElement('style');
        style.type = 'text/css';
        const content = `
    .cookie-infobar {
      display: none!important;
    }
  `;
        style.appendChild(document.createTextNode(content));
        const promise = new Promise((resolve, reject) => {
            style.onload = resolve;
            style.onerror = reject;
        });
        document.head.appendChild(style);
        await promise;
    });

    // expand all comments threads
    let expandButtons = await page.$$('.morecomments');
    while (expandButtons.length) {
        for (let button of expandButtons) {
            await button.click({});
            await page.waitForTimeout(500);
        }
        await page.waitForTimeout(1000);
        expandButtons = await page.$$('.morecomments');
    }

    // select all comments, scrape text and points
    const comments = await page.$$('.entry');

    const formattedComments = [];
    let commentsInc = {
        commentsError: 0,
        commentsValuable: 0,
    };
    for (let comment of comments) {
        try {
            // scrape points
            const rawPoints = await (comment.$eval('.score', el => el.textContent));
            // scrape text
            const rawText = await comment.$eval('.usertext-body', el => el.textContent);
            // push only viable values
            if (rawPoints && rawText) {
                // clean points
                const points = Number(rawPoints.split(' ')[0]);
                // clean texts
                const text = rawText.replace(/\n/g, '');
                formattedComments.push({points, text});
            }
            commentsInc.commentsValuable++;
        } catch (err) {
            // inc the nbr of error mainly due to deleted comments
            commentsInc.commentsError++;
        }


    }
    // sorts comments by points
    formattedComments.sort((a, b) => {
        // if value > 0 then swap and reloop
        return b.points - a.points;
    });


    await browser.close();

    console.log(`There were ${commentsInc.commentsError} invalidate comments errors 
    & ${commentsInc.commentsValuable} valid comments!`);
    return formattedComments;
}

// insert into google spreadsheet
async function addWS(comments, index) {
    const doc = new Doc(process.env.GSHEET_ID);
    await doc.load();
    await doc.addRows(comments, index);
}

// main func
async function main() {
    for (const url of urls) {
        const index = urls.indexOf(url);
        const formattedComments = await scrapeComments(url);
        await addWS(formattedComments, index);
    }
}

await main();
