const {webkit, chromium} = require('playwright');
const utils = require('../utils');
const PositionMounter = require('./../Mounters/PositionMounter');
var moment = require('moment'); // require 

class GuiabolsoService { 

  // get

  // scrap

  // translate

  // save
  

  async scrap (params ) {
    return new Promise(async (resolve, reject) => {
    
      for (const browserType of ['chromium']) {
        const browser = await chromium.launch(
          { 
            devtools: params.debug,
            headless: params.debug, 
          // slowMo: 50 
          }
        );
        const context = await browser.newContext();
        const page = await context.newPage();
        
        await page.goto('https://www.guiabolso.com.br/web/#/login');
    
    
        await page.fill("#email", params.credentials.user);
        await page.fill("#password", params.credentials.password);
    
        
        await page.click('text=Entrar');

        const result = {
            positions: [],
            movements: []
        };

        let returnRequested = false;
    
        page.on('response', async (response) => {
          if(response.url() === "https://www.guiabolso.com.br/comparador/v2/events/"){
    
            const responseObject = await response.json();

            if(responseObject.name === "rawData:info:response"){

              result.positions = responseObject.payload.accounts;

              if(params.scrapMovements){
                result.movements = await this.scrapMovements(page);

                if(!returnRequested){
  
                  setTimeout(async ()=>{
                    resolve(result);
                    await browser.close();
    
                  }, 16 * 1000 );
  
                  returnRequested = true;
                }

              }else{
                result.movements = [];

                resolve(result);
                await browser.close();
              }
            }else if(responseObject.name === "users:summary:month:response"){

              console.log(responseObject.payload.financeSummary.month + "/" + responseObject.payload.financeSummary.year)
              result.movements = [...result.movements, ...responseObject.payload.userMonthHistory.statements];
            }
          }
        });
    
      }
    });
  }

  async scrapMovements(page) {
    let movements = [];
    await page.goto("https://www.guiabolso.com.br/web/#/financas/extrato");
    await utils.wait(3000);

      try{

        await page.evaluate(async (params) => {
          console.log(document.querySelector("[data-testid=MonthSelectMenuButton]"))
          document.querySelector("[data-testid=MonthSelectMenuButton]").click();

          let $menu = document.getElementById("month-select-menu");
          
          let $selected = $menu.querySelector("[tabindex='0']");
          let selectedMonthCode = $selected.value;
          
          for(let i=0;i<12;i++){
              let monthCode = selectedMonthCode - i;

              console.log(monthCode)
          
              $menu.querySelector("[value='"+monthCode+"']").click();
          }
          return;
        });
      }catch(e){
        // console.log(e)
      }

    return movements;
  }

  async save (data, params) {
    return utils.cacheSet('GuiaBolso-' + params.credentials.user ,data);
  }

  translate (_data) {
    const accounts = _data.positions;
    let data = {
      movements: [],
      positions: [],
      update_at: moment().format("Y-MM-DD HH:mm:ss")
    };

    let accountsBank = {};
    let addedMovementsIds = {};

    for (var i in accounts) {
      const account = accounts[i];
      
      for(var j in account.statements){
        const statement = account.statements[j];
        let bankDetails = null;

        if(account.accountType === 0){
            bankDetails = {
              agency: account.agency,
              bank_id: account.bank.number,
              account: account.account,
              account_digit: account.accountDigit,
            };

            accountsBank[statement.id] = bankDetails;

            data.positions.push({
            description: statement.name,
            total_amount: statement.value,
            amount_currency: "BRL",
            external_id: statement.id,
            position_type: statement.statementType === 1 ? 3 : 1, //1- Conta corrente ; 2- Posicao
            bank_details: bankDetails
          })
      }

      }
    }


    for (var acc in _data.movements){
      let account = _data.movements[acc];

      for(var m in account.transactions){
          let bank = accountsBank[account.id];
          let bank_id = null;
          if(bank){
            bank_id = bank.bank_id;
          }

          let mov = account.transactions[m];
          let movData = {
            value: mov.value,
            description: mov.label,
            category_id: mov.categoryId,
            date: moment(new Date(mov.date)).format("YYYY-MM-DD"),
            currency: mov.currency,
            details: mov.description,
            external_id: mov.id,
            account_name: account.name,
            account_id: account.id,
            bank_id: bank_id
          };

          if(!addedMovementsIds[mov.id]){
            data.movements.push(movData);
            addedMovementsIds[mov.id] = 1; 
          }
      }
  }


    return PositionMounter(data);
  }

  async getCached (params) {
    return utils.cacheGet('GuiaBolso-' + params.credentials.user);
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
      // const scrapData = this.getMock();


      const data = this.translate(scrapData);

      this.save(data, params);

      return data;

    
  }
}

module.exports = GuiabolsoService;