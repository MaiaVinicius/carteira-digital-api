const {webkit, chromium, firefox} = require('playwright');
const utils = require('../utils');
const PositionMounter = require('./../Mounters/PositionMounter');
var moment = require('moment'); // require 
const puppeteer = require('puppeteer');
const pptrFirefox = require('puppeteer-firefox');

class ClearService { 

  // get

  // scrap

  // translate

  // save
  

  async scrap (params ) {
    return new Promise(async (resolve, reject) => {

      const browser = await pptrFirefox.launch({ 
        devtools: params.debug ? true : false,
        headless: params.debug ? false : true, 
        product: 'firefox', 
        args: ['--no-sandbox', '--disable-setuid-sandbox']}
        );
    // const context = await browser.newContext();
    const page = await browser.newPage();
    
    await page.goto('https://www.clear.com.br/pit/signin?controller=SignIn&referrer=http%3a%2f%2fwww.clear.com.br%2fpit');
    // await page.screenshot({ path: `screenshot/example-${browserType}.png` });


    await page.$eval('#identificationNumber', (el, val) => el.value = val ,params.credentials.user);
    await page.$eval('#password', (el, val) => el.value = val, params.credentials.password);

    await page.evaluate(async (params) => {
        $("#dob").val(params.credentials.birthdate);
    }, params);

    // await utils.wait(1000)
    
    await page.click('.bt_signin');

    // await utils.wait(1000)

    await page.waitForSelector('#wide');


    await page.goto("https://novopit.clear.com.br/MinhaConta/MeusAtivos");

    await utils.wait(1000)

    const userCode = await page.$eval('.user-code', e => e.textContent);
    const frame = page.frames().find(frame => frame.name() === 'content-page');

    const cash = await frame.$eval('.cash', async (e) => {

      function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

      let cash = {};

    
      $(e).find('a').click();
      await timeout(1000);

      let $stockDetails = $(".container_balance"),
        convertCurrency = (val) => {
          return parseFloat(val.replace('R$ ', '').replace('.','').replace(',', '.'))
        },
        getVal = (el)=>{
            return $stockDetails.find($(el)).html()
        },
        total = getVal(".total-value");

        cash = {
          total: convertCurrency(total)
        };


      return cash;
    });

    const positions = await frame.$$eval('.stock', async (e) => {

      function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

      const stocks = [];

      for(let i=0;i<e.length;i++){
      
        $(e[i]).find('a').click();
        await timeout(1000);

        let $stockDetails = $(".container_equities"),
          convertCurrency = (val) => {
            return parseFloat(val.replace('R$ ', '').replace('.','').replace(',', '.'))
          },
          getVal = (el)=>{
              return $stockDetails.find($(el)).html()
          },
          quantity = getVal(".position-quantity"),
          price = getVal(".asset-price"),
          positionAverage = getVal('.position-value-average');

          stocks.push({
            symbol: $(e[i]).find('.custody-symbol').text(),
            quantity: convertCurrency(quantity),
            currentPrice: convertCurrency(price),
            averagePrice: convertCurrency(positionAverage)
          });
      }


      return stocks;
    });
    
    await page.screenshot({ path: `src/screenshots/clear-${params.credentials.user}.png` });

    
    await browser.close();


      resolve({
          userCode: userCode,
          positions: positions,
          cash: cash
      })

    });
  }

  async save (data, params) {
    return utils.cacheSet('Clear-' + params.credentials.user ,data);
  }

  translate (_data) {

    let positions = [];

    positions.push({
      description: "Clear - Conta Corrente",
      total_amount: _data.cash.total,
      quantity: 1,
      amount_currency: "BRL",
      position_type: 1,
      bank_details: {
        agency: '0001',
        account: _data.userCode,
        account_digit: '9',
        bank_id: 102
      }
    });


    for(let i=0;i<_data.positions.length;i++){
      const pos = _data.positions[i];

      positions.push({
        description: pos.symbol,
        total_amount: pos.totalAmount,
        quantity: pos.quantity,
        unit_price: pos.currentPrice,
        total_amount: pos.quantity*pos.currentPrice,
        amount_currency: "BRL",
        average_price: pos.averagePrice,
        investment: {
          category: null,
          sub_type: null
        },
        position_type: 2, //1- Conta corrente ; 2- Posicao
      })
    }


    let data = {
      positions: positions,
      movements: [],
      update_at: moment().format("Y-MM-DD HH:mm:ss")
    };

    
    return PositionMounter(data);
  }

  async getCached (params) {
    return utils.cacheGet('Clear-' + params.credentials.user);
  }

  async get (params) {
    if(params.cached){
      const cachedData = await this.getCached(params);

      if(cachedData){
        return cachedData
      }
    }
    
      // get scrapped
      const scrapData = await this.scrap(params);
      const data = this.translate(scrapData);

      this.save(data, params);

      return data;

    
  }
}

module.exports = ClearService;