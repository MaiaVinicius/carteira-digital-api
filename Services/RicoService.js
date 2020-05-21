const { webkit, chromium, firefox } = require('playwright');
const utils = require('../utils');
const PositionMounter = require('../Mounters/PositionMounter');
var moment = require('moment'); // require 

class RicoService {

  // get

  // scrap

  // translate

  // save


  static scrap = async (params) => {
    return new Promise(async (resolve, reject) => {

      const browser = await firefox.launch({ headless: false });
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

      await utils.wait(500);

      await page.click('.introjs-skipbutton');
      await page.click('.ngdialog-close');


      
      const [responseCustody] = await Promise.all([
        page.waitForResponse('**/positions/'),
        page.goto("https://www.rico.com.vc/dashboard/tesouro-direto/")
      ]);


      console.log(responseCustody)

      resolve({
        positions: [],
        cash: {}
      })

    });
  }


  static save = async (data, params) => {
    return utils.cacheSet('Rico-' + params.credentials.user, data);
  }

  static translate = (_data) => {

    let positions = [];


    let data = {
      positions: positions,
      movements: [],
      update_at: moment().format("Y-MM-DD HH:mm:ss")
    };


    return PositionMounter(data);
  }

  static getCached = async (params) => {
    return utils.cacheGet('Rico-' + params.credentials.user);
  }

  static get = async (params) => {
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