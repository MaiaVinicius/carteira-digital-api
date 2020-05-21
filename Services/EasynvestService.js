const {webkit, chromium, firefox} = require('playwright');
const utils = require('../utils');
const PositionMounter = require('./../Mounters/PositionMounter');
var moment = require('moment'); // require 

class EasynvestService { 

  // get

  // scrap

  // translate

  // save
  

  static scrap = async (params ) => {
    return new Promise(async (resolve, reject) => {
    
      const browser = await firefox.launch(
        { 
        headless: params.headless, 
        // slowMo: 50 
        }
      );
      const context = await browser.newContext();
      const page = await context.newPage();
      
      await page.goto('https://www.easynvest.com.br/autenticacao');
  
  
      await page.fill("#username", params.credentials.user);
      await page.fill("#password", params.credentials.password);
  
      
      await page.click('text=Entrar');
  
  
      utils.wait(1000);
  
  
      const [responseCustody] = await Promise.all([
        page.waitForResponse('**/api/samwise/v2/custody-position'),
      ]);
  
      await page.screenshot({ path: `src/screenshots/easynvest-${params.credentials.user}.png` });

      const jsonCustody = await responseCustody.json();
  
      utils.wait(500);
      await page.click('css=.sc-bsbRJL');
      utils.wait(500);

      const [responseAccount] = await Promise.all([
        page.waitForResponse('**/api/registrar/v1/customers/accounts'),
        page.click('text=Conta Easynvest')
      ]);

      const bankAccount = await responseAccount.json();
      // const bankAccount = {};

      resolve({
        positions: jsonCustody,
        bankAccount: bankAccount[0]
      });
      await browser.close();

    });
  }

  static save = async (data, params) => {
    return utils.cacheSet('Easynvest-' + params.credentials.user ,data);
  }

  static translate = (_data) => {
    let data = {
      positions: [],
      movements: [],
      update_at: moment().format("Y-MM-DD HH:mm:ss")
    };

    data.positions.push({
      description: "Easynvest - Conta Corrente",
      total_amount: _data.easyBalance ? _data.easyBalance : 0,
      amount_currency: "BRL",
      position_type: 1, //1- Conta corrente ; 2- Posicao
      bank_details: {
        agency: '0001',
        account: _data.bankAccount.accountNumber,
        account_digit: _data.bankAccount.verifyingDigit,
        bank_id: 140
      }
    })


    const positions = _data.positions.investments;

    for (var i in positions) {
      const position = positions[i];

      data.positions.push({

        description: position.nickName,
        total_amount: position.grossValue,
        quantity: position.quantity,
        unit_price: position.unitPrice,
        investment: {
          category: position.securityNameType,
          sub_type: position.type
        },
        initial_amount: position.investedCapital,
        amount_currency: "BRL",
        external_id: position.custodyId,
        position_type: 2, //1- Conta corrente ; 2- Posicao
        bank_details: null
      })
    }
    
    return PositionMounter(data);
  }

  static getCached = async (params) => {
    return utils.cacheGet('Easynvest-' + params.credentials.user);
  }

  static get = async (params) =>{
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

module.exports = EasynvestService;