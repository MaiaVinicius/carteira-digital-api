const {chromium} = require('playwright');
const utils = require('./utils');

(async () => {
  for (const browserType of ['chromium']) {
    const browser = await chromium.launch({ headless: false, slowMo: 50 });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto('https://www.easynvest.com.br/autenticacao');
    // await page.screenshot({ path: `screenshot/example-${browserType}.png` });


    await page.fill("#username", "viniciusmaia.tx@gmail.com");
    await page.fill("#password", "##Coffee&Code102!!!");

    
    await page.click('text=Entrar');


    utils.wait(1000);


    const [response] = await Promise.all([
      page.waitForResponse('**/api/samwise/v2/custody-position'),
    ]);

    const jsonCustody = await response.json();

    console.log(jsonCustody)
    
      
  // page.on('response', response =>
      // console.log('<<', response.status(), response.url()));

    

    // await browser.close();
  }
})();
