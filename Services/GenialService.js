const {webkit, chromium, firefox} = require('playwright');
const utils = require('../utils');
const PositionMounter = require('../Mounters/PositionMounter');
var moment = require('moment'); // require 
const puppeteer = require('puppeteer');
const pptrFirefox = require('puppeteer-firefox');

class GenialService { 

  // get

  // scrap

  // translate

  // save
  

  async scrap (params ) {
    return new Promise(async (resolve, reject) => {

      const browser = await pptrFirefox.launch({ product: 'firefox', headless: false , args: ['--no-sandbox', '--disable-setuid-sandbox']});
    // const context = await browser.newContext();
    const page = await browser.newPage();
    
    await page.goto('https://www2.genialinvestimentos.com.br/login');


      resolve({
          positions: [],
          cash: []
      })

    });
  }

  async save (data, params) {
    return utils.cacheSet('Clear-' + params.credentials.user ,data);
  }

  translate (_data) {


    let data = {
      positions: [],
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

module.exports = GenialService;