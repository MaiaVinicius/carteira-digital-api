const {webkit} = require('playwright');
const utils = require('../utils');
const PositionMounter = require('./../Mounters/PositionMounter');
var moment = require('moment'); // require 

class GuiabolsoService { 

  // get

  // scrap

  // translate

  // save
  

  static scrap = async (params ) => {
    return new Promise(async (resolve, reject) => {
    
      for (const browserType of ['chromium']) {
        const browser = await webkit.launch(
          { 
          headless: params.headless, 
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
    
        page.on('response', async (response) => {
          if(response.url() === "https://www.guiabolso.com.br/comparador/v2/events/"){
    
            const responseObject = await response.json();

            await page.screenshot({ path: `src/screenshots/guiabolso-${params.credentials.user}.png` });

            if(responseObject.name === "rawData:info:response"){

              await page.goto("https://www.guiabolso.com.br/web/#/financas/extrato");

              result.positions = responseObject.payload.accounts;


              resolve(result);
              await browser.close();
            }else if(responseObject.name === "users:summary:month:response"){

              result.movements = responseObject.payload.userMonthHistory.statements;

            }
          }
        });
    
      }
    });
  }

  static save = async (data, params) => {
    return utils.cacheSet('GuiaBolso-' + params.credentials.user ,data);
  }

  static translate = (_data) => {
    const accounts = _data.positions;
    let data = {
      movements: [],
      positions: [],
      update_at: moment().format("Y-MM-DD HH:mm:ss")
    };

    for (var acc in _data.movements){
        let account = _data.movements[acc];

        for(var m in account.transactions){
            let mov = account.transactions[m];

            data.movements.push({
              value: mov.value,
              description: mov.label,
              category_id: mov.categoryId,
              date: moment(new Date(mov.date)).format("YYYY-MM-DD"),
              currency: mov.currency,
              details: mov.description,
              // external_id: mov.statementId,
              account_name: account.name,
              account_id: account.id
            });
        }
    }

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
        
          data.positions.push({
            description: statement.name,
            total_amount: statement.value,
            amount_currency: "BRL",
            external_id: account.id,
            position_type: 1, //1- Conta corrente ; 2- Posicao
            bank_details: bankDetails
          })
      }

      }
    }
    

    return PositionMounter(data);
  }

  static getCached = async (params) => {
    return utils.cacheGet('GuiaBolso-' + params.credentials.user);
  }

  static getMock = () => {
    return {"positions":[{"id":7964993,"created":1537129476000,"modified":1590021110000,"name":"Banco do Brasil S/A","agency":"493-6","account":"5****","accountDigit":"1","accountStatus":1,"accountType":0,"accountConnectionType":0,"accountConnectionTypeName":"DEFAULT","bank":{"id":4,"name":"Banco do Brasil S/A","active":1,"status":0,"number":"001","color":null,"identifier":null},"update":{"error":false,"errorId":0,"last":1590021107000,"message":"Ihh..sem sistema não dá pra sincronizar a conta. Preciso de um tempinho pra organizar tudo por aqui, tá? Volta mais tarde! #nãodesiste "},"statements":[{"id":16654998,"created":1537129478000,"modified":1590021110000,"name":"Banco do Brasil S/A","statementType":0,"statementStatus":1,"currency":null,"creditCardFinalNumbers":null,"value":603.84}]},{"id":9777183,"created":1561928444000,"modified":1590021160000,"name":"Nu Pagamentos S.A","agency":"0001","account":"8******","accountDigit":"1","accountStatus":1,"accountType":0,"accountConnectionType":0,"accountConnectionTypeName":"DEFAULT","bank":{"id":11,"name":"Nubank","active":1,"status":0,"number":"260","color":null,"identifier":null},"update":{"error":false,"errorId":0,"last":1590021107000,"message":"Ihh..sem sistema não dá pra sincronizar a conta. Preciso de um tempinho pra organizar tudo por aqui, tá? Volta mais tarde! #nãodesiste "},"statements":[{"id":20385394,"created":1561928446000,"modified":1590021137000,"name":"Nu Pagamentos S.A","statementType":0,"statementStatus":1,"currency":null,"creditCardFinalNumbers":null,"value":1000.35},{"id":22617600,"created":1576093572000,"modified":1590021138000,"name":"5860","statementType":1,"statementStatus":1,"currency":null,"creditCardFinalNumbers":"5860","value":-39.17}]},{"id":11033521,"created":1584294405000,"modified":1589324202000,"name":"Banco Inter S/A.","agency":"0001","account":"1******","accountDigit":"6","accountStatus":1,"accountType":0,"accountConnectionType":1,"accountConnectionTypeName":"APP_TOKEN","bank":{"id":12,"name":"Banco Inter S.A.","active":1,"status":0,"number":"77","color":null,"identifier":null},"update":{"error":true,"errorId":23,"last":1584294596000,"message":"Você só precisa do código I-Safe, aquele número de 6 dígitos que fica disponível no app do Inter."},"statements":[{"id":23904371,"created":1584294410000,"modified":1584294598000,"name":"Banco Inter S/A.","statementType":0,"statementStatus":1,"currency":null,"creditCardFinalNumbers":null,"value":96.24}]},{"id":11177132,"created":1588733679000,"modified":1588733679000,"name":"Conta manual","agency":null,"account":null,"accountDigit":null,"accountStatus":1,"accountType":1,"accountConnectionType":0,"accountConnectionTypeName":"DEFAULT","bank":{"id":6,"name":"Conta manual","active":1,"status":0,"number":"000","color":null,"identifier":null},"update":null,"statements":[{"id":24313130,"created":1588733679000,"modified":1588733679000,"name":"Clear","statementType":0,"statementStatus":1,"currency":"BRL","creditCardFinalNumbers":null,"value":17528.67},{"id":24313137,"created":1588733727000,"modified":1588733727000,"name":"Easynvest","statementType":0,"statementStatus":1,"currency":"BRL","creditCardFinalNumbers":null,"value":2172.43},{"id":24313145,"created":1588733790000,"modified":1588733790000,"name":"Rico","statementType":0,"statementStatus":1,"currency":"BRL","creditCardFinalNumbers":null,"value":1738.1},{"id":24313146,"created":1588733836000,"modified":1588733836000,"name":"1519","statementType":1,"statementStatus":1,"currency":"BRL","creditCardFinalNumbers":null,"value":-2700}]}],"movements":[{"id":16654998,"transactions":[{"statementId":16654998,"serieId":null,"isVisualized":false,"categoryId":8,"label":"FIES JRS/AMORTIZACAO","originalValue":-318.92,"date":1589511600000,"deleted":false,"monthCode":24244,"currency":"BRL","modified":1589843152000,"id":2524756563,"parentId":0,"exchangeValue":0,"duplicated":false,"created":1589843148000,"description":"","value":-318.92,"instalment":null},{"statementId":16654998,"serieId":null,"isVisualized":true,"categoryId":4,"label":"TED-Crédito em Conta 077 0001 17782076773 VINICIUS MAIA","originalValue":500,"date":1588647600000,"deleted":false,"monthCode":24244,"currency":"BRL","modified":1589019478000,"id":2505451726,"parentId":0,"exchangeValue":0,"duplicated":false,"created":1589019475000,"description":"","value":500,"instalment":null},{"statementId":16654998,"serieId":null,"isVisualized":true,"categoryId":4,"label":"TED Transf.Eletr.Disponív 077 0001 17782076773 VINICIUS MAIA","originalValue":500,"date":1588647600000,"deleted":true,"monthCode":24244,"currency":"BRL","modified":1589019478000,"id":2498969718,"parentId":0,"exchangeValue":0,"duplicated":true,"created":1588723229000,"description":"","value":500,"instalment":null}],"series":[],"created":1537129478000,"creditCardFinalNumbers":null,"name":"Banco do Brasil S/A","statementType":"CHECKING_ACCOUNT","statementTypeId":0,"modified":1590021110000,"statementStatus":"ACTIVE","currency":null},{"id":20385394,"transactions":[{"statementId":20385394,"serieId":null,"isVisualized":false,"categoryId":35,"label":"Transferência enviada - Vinicius Maia Teixeira","originalValue":-506.49,"date":1589338800000,"deleted":false,"monthCode":24244,"currency":"BRL","modified":1589414026000,"id":2514375438,"parentId":0,"exchangeValue":0,"duplicated":false,"created":1589413996000,"description":"","value":-506.49,"instalment":null},{"statementId":20385394,"serieId":null,"isVisualized":true,"categoryId":35,"label":"Transferência enviada - Silvânia Maia Teixeira","originalValue":-2700,"date":1588820400000,"deleted":false,"monthCode":24244,"currency":"BRL","modified":1589105843000,"id":2507467407,"parentId":0,"exchangeValue":0,"duplicated":false,"created":1589105824000,"description":"","value":-2700,"instalment":null},{"statementId":20385394,"serieId":null,"isVisualized":true,"categoryId":4,"label":"Transferência recebida - Vinicius Maia Teixeira","originalValue":8700,"date":1588647600000,"deleted":false,"monthCode":24244,"currency":"BRL","modified":1588723250000,"id":2498970014,"parentId":0,"exchangeValue":0,"duplicated":false,"created":1588723229000,"description":"","value":8700,"instalment":null},{"statementId":20385394,"serieId":null,"isVisualized":true,"categoryId":35,"label":"Transferência enviada - Vinicius Maia Teixeira","originalValue":-1800,"date":1588647600000,"deleted":false,"monthCode":24244,"currency":"BRL","modified":1588723250000,"id":2498970013,"parentId":0,"exchangeValue":0,"duplicated":false,"created":1588723229000,"description":"","value":-1800,"instalment":null},{"statementId":20385394,"serieId":null,"isVisualized":true,"categoryId":35,"label":"Transferência enviada - Vinicius Maia Teixeira","originalValue":-3200,"date":1588647600000,"deleted":false,"monthCode":24244,"currency":"BRL","modified":1588723250000,"id":2498970012,"parentId":0,"exchangeValue":0,"duplicated":false,"created":1588723229000,"description":"","value":-3200,"instalment":null},{"statementId":20385394,"serieId":null,"isVisualized":true,"categoryId":4,"label":"Transferência recebida - Vinicius Maia Teixeira","originalValue":400,"date":1588647600000,"deleted":false,"monthCode":24244,"currency":"BRL","modified":1588723250000,"id":2498970011,"parentId":0,"exchangeValue":0,"duplicated":false,"created":1588723229000,"description":"","value":400,"instalment":null}],"series":[],"created":1561928446000,"creditCardFinalNumbers":null,"name":"Nu Pagamentos S.A","statementType":"CHECKING_ACCOUNT","statementTypeId":0,"modified":1590021137000,"statementStatus":"ACTIVE","currency":null},{"id":22617600,"transactions":[{"statementId":22617600,"serieId":null,"isVisualized":false,"categoryId":7,"label":"Raia","originalValue":-5.67,"date":1589166000000,"deleted":false,"monthCode":24244,"currency":"BRL","modified":1589324222000,"id":2512146839,"parentId":0,"exchangeValue":0,"duplicated":false,"created":1589324200000,"description":"","value":-5.67,"instalment":null},{"statementId":22617600,"serieId":null,"isVisualized":true,"categoryId":17,"label":"Mercadopago *Fomezero","originalValue":-12,"date":1588993200000,"deleted":false,"monthCode":24244,"currency":"BRL","modified":1589105844000,"id":2507467409,"parentId":0,"exchangeValue":0,"duplicated":false,"created":1589105824000,"description":"","value":-12,"instalment":null},{"statementId":22617600,"serieId":null,"isVisualized":true,"categoryId":15,"label":"Mc Donalds Fre","originalValue":-21.5,"date":1588906800000,"deleted":false,"monthCode":24244,"currency":"BRL","modified":1589105844000,"id":2507467408,"parentId":0,"exchangeValue":0,"duplicated":false,"created":1589105824000,"description":"","value":-21.5,"instalment":null}],"series":[],"created":1576093572000,"creditCardFinalNumbers":"5860","name":"5860","statementType":"CREDIT_CARD","statementTypeId":1,"modified":1590021138000,"statementStatus":"ACTIVE","currency":null},{"id":23904371,"transactions":[],"series":[],"created":1584294410000,"creditCardFinalNumbers":null,"name":"Banco Inter S/A.","statementType":"CHECKING_ACCOUNT","statementTypeId":0,"modified":1584294598000,"statementStatus":"ACTIVE","currency":null},{"id":24313130,"transactions":[],"series":[],"created":1588733679000,"creditCardFinalNumbers":null,"name":"Clear","statementType":"CHECKING_ACCOUNT","statementTypeId":0,"modified":1588733679000,"statementStatus":"ACTIVE","currency":"BRL"},{"id":24313137,"transactions":[],"series":[],"created":1588733727000,"creditCardFinalNumbers":null,"name":"Easynvest","statementType":"CHECKING_ACCOUNT","statementTypeId":0,"modified":1588733727000,"statementStatus":"ACTIVE","currency":"BRL"},{"id":24313145,"transactions":[],"series":[],"created":1588733790000,"creditCardFinalNumbers":null,"name":"Rico","statementType":"CHECKING_ACCOUNT","statementTypeId":0,"modified":1588733790000,"statementStatus":"ACTIVE","currency":"BRL"},{"id":24313146,"transactions":[],"series":[],"created":1588733836000,"creditCardFinalNumbers":null,"name":"1519","statementType":"CREDIT_CARD","statementTypeId":1,"modified":1588733836000,"statementStatus":"ACTIVE","currency":"BRL"}]}
  }

  static get = async (params) =>{
    if(params.cached){
      const cachedData = await this.getCached(params);

      if(cachedData){
        return cachedData
      }
    }
    
      // get scrapped
      // const scrapData = await this.scrap(params);
      const scrapData = this.getMock();

      const data = this.translate(scrapData);

      this.save(data, params);

      return data;

    
  }
}

module.exports = GuiabolsoService;