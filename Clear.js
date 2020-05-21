const {firefox} = require('playwright');

(async () => {
  for (const browserType of ['firefox']) {
    const browser = await firefox.launch({ headless: false, slowMo: 50 });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto('https://www.clear.com.br/pit/signin?controller=SignIn&referrer=http%3a%2f%2fwww.clear.com.br%2fpit');
    // await page.screenshot({ path: `screenshot/example-${browserType}.png` });


    await page.fill("#identificationNumber", "177.820.767-73");
    await page.fill("#password", "624042");

    await page.evaluate(async () => {
        $("#dob").val("12/04/1999");
    });
    
    await page.click('css=.bt_signin');


    await page.waitForSelector('#wide');


    await page.goto("https://novopit.clear.com.br/MinhaConta/MeusAtivos");

    // await browser.close();
  }
})();
