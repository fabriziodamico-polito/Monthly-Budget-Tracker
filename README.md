# Monthly Budget Tracker

A simple, single-file monthly budget tracker built with vanilla HTML, CSS, and JavaScript.

## Features

- **Track expenses** by category (dining, drinks, transport, etc.)
- **Set monthly budgets** with visual progress bar
- **History view** — browse all past months at a glance
- **Analytics dashboard** — charts and trends powered by [Chart.js](https://www.chartjs.org/)
- **Google Sheets sync** — optional cloud backup via Google Apps Script
- **Local storage** — works fully offline, data persists in the browser

## Usage

1. Open `index.html` in any modern browser. No build step required.
2. To enable cloud sync across your devices, deploy the included Google Apps Script.

### How to set up Cloud Sync (Optional)

1. Go to Google Sheets and create a new empty spreadsheet.
2. Click on **Extensions > Apps Script**.
3. Copy the contents of the `googleappscript.js` file from this repository and paste it into the editor.
4. Click **Deploy > New deployment**.
5. Choose **Web app** as the type.
6. Set "Execute as" to **Me** and "Who has access" to **Anyone**.
7. Click **Deploy** and copy the resulting **Web app URL**.
8. Open the budget app (`index.html`), click the **☁️ Sync** button at the top, and paste your URL.

## Tech Stack

HTML · CSS · JavaScript · Chart.js

## License

MIT