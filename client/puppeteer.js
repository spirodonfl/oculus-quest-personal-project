const puppeteer = require('puppeteer');
const fs = require('fs');

Screenshot('https://google.com');

async function Screenshot(url) {
   const browser = await puppeteer.launch({
       headless: true,
       args: [
       "--no-sandbox",
       "--disable-gpu",
       ]
   });

    const page = await browser.newPage();
    await page.goto(url, {
      timeout: 0,
      waitUntil: 'networkidle0',
    });
    const screenData = await page.screenshot({encoding: 'binary', type: 'jpeg', quality: 30});
    fs.writeFileSync('screenshot.jpg', screenData);

    await page.close();
    await browser.close();

    //const browser = await puppeteer.launch({
    //    browserWSEndpoint: `ws://repo.treescale.com:6799`,
    //});
    //https://docs.browserless.io/blog/2020/06/09/screencast.html
}

