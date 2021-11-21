// const {GoogleSpreadsheet} = require('google-spreadsheet');
import {GoogleSpreadsheet} from 'google-spreadsheet';
import fs from 'fs';

let credentials = {};
fs.readFile('./credentials.json', 'utf8', (err, data) => {
    if (err) {
        throw err;
    }
    credentials = JSON.parse(data);
});

export default class Doc {
    constructor(id) {
        this.doc = new GoogleSpreadsheet(id);
    }

    async getTitle(index) {
        const sheet = this.doc.sheetsByIndex[index];
        console.log(sheet.title);
    }

    async load() {
        await this.doc.useServiceAccountAuth(credentials);
        await this.doc.loadInfo();
        // console.log(this.doc.title);
    }

    async addRows(rows, index) {
        let sheet = '';
        if (!this.doc.sheetsByIndex[index]) {
            sheet = await this.doc.addSheet({
                title: `Scrape url ${index}`,
                headerValues: ['points', 'text'],
            });
        } else {
            sheet = this.doc.sheetsByIndex[index];
        }
        await sheet.addRows(rows);


    }

    async getRows(index) {
        const sheet = this.doc.sheetsByIndex[index];
        return await sheet.getRows();
    }

    async delRows(rows) {
        for (let i = 1; i++; i < rows.length + 1) {
            await rows[1].delete();
        }
    }
};
