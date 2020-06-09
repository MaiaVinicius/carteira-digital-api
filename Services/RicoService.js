const { webkit, chromium, firefox } = require('playwright');
const utils = require('../utils');
const PositionMounter = require('../Mounters/PositionMounter');
var moment = require('moment'); // require 

class RicoService {

  // get

  // scrap

  // translate

  // save


  async scrap  (params) {
    return new Promise(async (resolve, reject) => {

      const browser = await chromium.launch({ 
          devtools: params.debug ? true : false,
          headless: params.debug ? false : true, 
       });
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto('https://www.rico.com.vc/login/');


      await page.fill(".color-dove-grey", params.credentials.user);
      await page.click('text=Avançar');

      await utils.wait(1000);

      await context.grantPermissions(['geolocation']);


      await utils.wait(1000);

      // KeyboardLogin__KeyboardButton-kZpsPe
      const passwordTyping = await page.$eval('.KeyboardLogin__KeyboardContainer-foANRY', async (e, pwd) => {

        function timeout(ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
        }

        var $buttons = document.getElementsByClassName('KeyboardLogin__KeyboardButton-kZpsPe');
        const pwdDigits = pwd.split("");

        for (var i = 0; i < pwdDigits.length; i++) {
          await timeout(250);

          var dig = parseInt(pwdDigits[i]);

          for (j = 0; j < $buttons.length; j++) {
            var $btn = $buttons[j];
            var txt = $btn.textContent;
            var numbers = txt.split("ou");

            if (numbers.length > 1) {
              var n1 = numbers[0];
              var n2 = numbers[1];

              if (parseInt(n1) === dig || parseInt(n2) === dig) {
                $btn.click();
              }
            }
          }
        }

        return pwd;
      }, params.credentials.password);

      await page.click('text=Acessar');

      let [balanceNetwork] = await Promise.all([
        page.waitForResponse('**/summary-position/'),
      ]);

      const summaryPositions = await balanceNetwork.json();

      const cashPositionbalance = summaryPositions.positions[0].grossValue;

      try{
        await page.click('.introjs-skipbutton');
        await page.click('.ngdialog-close');
      }catch(e){

      }


      let positions = {};
      

      let [responseCustody] = await Promise.all([
        page.waitForResponse('**/positions/'),
        page.goto("https://www.rico.com.vc/dashboard/tesouro-direto/")
      ]);
      let response = await responseCustody.json();
      positions.treasure = response[0].positions;

      let [responseCustody2] = await Promise.all([
        page.waitForResponse('**/positions/'),
        page.goto("https://www.rico.com.vc/arealogada/renda-fixa")
      ]);
      let response2 = await responseCustody2.json();
      positions.fixedIncome = response2.positions;



      let [responseCustody3] = await Promise.all([
        page.waitForResponse('**/customer-info'),
        page.goto("https://www.rico.com.vc/arealogada/meus-dados")
      ]);
      let response3 = await responseCustody3.json();
      const cash = {
        number: response3.defaultAccount.number,
        agency: '0003',
        bank: '102',
        balance: cashPositionbalance
      };
      
      await browser.close();

      resolve({
        positions: positions,
        cash: cash
      })

    });
  }


  async save (data, params) {
    return utils.cacheSet('Rico-' + params.credentials.user, data);
  }

  translate (_data) {

    let data = {
      positions: [],
      movements: [],
      update_at: moment().format("Y-MM-DD HH:mm:ss")
    };

    data.positions.push({
      description: "Conta Rico",
      total_amount: _data.cash.balance,
      // quantity: 1,
      amount_currency: "BRL",
      position_type: 1,
      bank_details: {
        agency: _data.cash.agency,
        account: _data.cash.number,
        account_digit: null,
        bank_id: _data.cash.bank
      }
    });

    for (var i in _data.positions.fixedIncome) {
      let position = _data.positions.fixedIncome[i];

      data.positions.push({

        description: position.order.offer.issuer.name,
        total_amount: position.currentTotalGrossValue,
        quantity: position.quantity,
        // unit_price: position.unitPrice,
        initial_amount: position.buyTotalValue,
        investment: {
          category: position.order.offer.type.backOfficeCode,
          // sub_type: position.type
          profitability: position.order.offer.currentBuyInterestRate,
          expires_at: position.order.offer.maturityDate
        },
        buy_date: position.order.dateOrder,
        initial_amount: position.buyTotalValue,
        amount_currency: "BRL",
        external_id: position.id,
        position_type: 2, //1- Conta corrente ; 2- Posicao
      })
    }


    for (var i in _data.positions.treasure) {
      let position = _data.positions.treasure[i];

      data.positions.push({

        description: position.offer.name,
        total_amount: position.currentTotalGrossValue,
        quantity: position.currentTotalQuantity,
        // unit_price: position.unitPrice,
        investment: {
          category: "TESOURO_DIRETO",
          // sub_type: position.type
          profitability: position.offer.currentBuyInterestRate,
          expires_at: position.offer.maturityDate
        },
        buy_date: position.offer.issueDate,
        initial_amount: position.buyTotalValue,
        amount_currency: "BRL",
        external_id: position.id,
        position_type: 2, //1- Conta corrente ; 2- Posicao
      })
    }


    return PositionMounter(data);
  }

  async getCached (params) {
    return utils.cacheGet('Rico-' + params.credentials.user);
  }

  async get (params) {
    if (params.cached) {
      const cachedData = await this.getCached(params);

      if (cachedData) {
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

module.exports = RicoService;