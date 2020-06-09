const {webkit, chromium, firefox} = require('playwright');
const utils = require('../utils');
const PositionMounter = require('./../Mounters/PositionMounter');
var moment = require('moment'); // require 

class EasynvestService { 

  // get

  // scrap

  // translate

  // save
  

  async scrap (params ) {
    return new Promise(async (resolve, reject) => {
    
      const browser = await firefox.launch(
        { 
          devtools: params.debug,
          headless: params.debug, 
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
      try{
        await page.click("css=.close-button");
      }catch(e){

      }
      await page.goto("https://www.easynvest.com.br/acompanhar/conta");
      utils.wait(500);

      const [responseAccount] = await Promise.all([
        page.waitForResponse('**/api/registrar/v1/customers/accounts'),
        page.click('text=Conta Easynvest')
      ]);

      const bankAccount = await responseAccount.json();
      // const bankAccount = {};

      const movements = await this.scrapMovements(page);

      resolve({
        positions: jsonCustody,
        movements: movements,
        bankAccount: bankAccount[0]
      });
      await browser.close();

    });
  }

  async save (data, params) {
    return utils.cacheSet('Easynvest-' + params.credentials.user ,data);
  }

  async scrapMovements (page) {
    await page.goto("https://www.easynvest.com.br/configuracoes/relatorios/extrato");
    await page.fill('//*[@id="account-statement"]/form/div[1]/div[2]/div/div[2]/div[1]/div/input', moment().subtract(90, "days").format("DD/MM/YYYY"))
    await page.fill('//*[@id="account-statement"]/form/div[1]/div[3]/div/div[2]/div/div/input', moment().format("DD/MM/YYYY"))
    
    await page.click('//*[@id="account-statement"]/section/div[2]')
    const [movementsNetwork] = await Promise.all([
      page.waitForResponse('**/api/gringott/statements/*'),
      page.click('//*[@id="account-statement"]/form/div[2]/button')
    ]);

    const result = await movementsNetwork.json();
    return result.value.statements;
  }

  translate (_data) {
    let data = {
      positions: [],
      movements: [],
      update_at: moment().format("Y-MM-DD HH:mm:ss")
    };

    for(var m in _data.movements){
      const movement = _data.movements[m];

      data.movements.push({
        date: movement.movementDate,
        description: movement.description,
        value: movement.value,
        balance: movement.balance,
        code: movement.historyCode
      })
    }


    data.positions.push({
      description: "Easynvest - Conta Corrente",
      total_amount: _data.positions.easyBalance ? _data.positions.easyBalance : 0,
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
        net_value: position.netValue,
        maturity: position.mautiry,

        is_grouped_position: position.status ? 0 : 1, //todo descobrir quais status existe (Pendente)

        quantity: position.quantity,
        unit_price: position.unitPrice,
        investment: {
          category: position.securityNameType,
          sub_type: position.type,
          ir: position.ir,
        },
        initial_amount: position.investedCapital,
        amount_currency: "BRL",
        external_id: position.hash,
        position_type: 2, //1- Conta corrente ; 2- Posicao
        bank_details: null
      })
    }
    
    return PositionMounter(data);
  }

  async getCached (params) {
    return utils.cacheGet('Easynvest-' + params.credentials.user);
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

module.exports = EasynvestService;