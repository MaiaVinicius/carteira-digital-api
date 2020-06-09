var Router = require('koa-router');
const router = new Router()
const GuiaBolso = require('./../Services/GuiabolsoService');
const Easynvest = require('./../Services/EasynvestService');
const Clear = require('./../Services/ClearService');
const Rico = require('./../Services/RicoService');
const Genial = require('./../Services/GenialService');



router.post('/rico/position', async (ctx, next) => {
  ctx.body = "";
  const params = ctx.request.body;

  return new Promise((resolve, reject) => {
    const rico = new Rico();


    let options = params.options;
    if(!options){
      options = {
        get_movements: true
      }
    }

    rico.get({
      debug: options.debug,
      cached: params.cached ,
      credentials: params.credentials
    }).then((result)=>{
        ctx.body = result;
        resolve(1);
    });
  });
});

router.post('/clear/position', async (ctx, next) => {
  ctx.body = "";
  const params = ctx.request.body;

  return new Promise((resolve, reject) => {
    const clear = new Clear();


    let options = params.options;
    if(!options){
      options = {
        get_movements: true
      }
    }

    clear.get({
      debug: options.debug,
      cached: params.cached ,
      credentials: params.credentials
    }).then((result)=>{
        ctx.body = result;
        resolve(1);
    });
  });
});



router.post('/genial/position', async (ctx, next) => {
  ctx.body = "";
  const params = ctx.request.body;

  return new Promise((resolve, reject) => {
    const genial = new Genial();


    let options = params.options;
    if(!options){
      options = {
        get_movements: true
      }
    }

    genial.get({
      debug: options.debug,
      cached: params.cached ,
      credentials: params.credentials
    }).then((result)=>{
        ctx.body = result;
        resolve(1);
    });
  });
});

router.post('/easynvest/position', async (ctx, next) => {
  ctx.body = "";
  const params = ctx.request.body;

  return new Promise((resolve, reject) => {
    const easy = new Easynvest();


    let options = params.options;
    if(!options){
      options = {
        get_movements: true
      }
    }

    easy.get({
      debug: options.debug,
      cached: params.cached ,
      credentials: params.credentials
    }).then((result)=>{
        ctx.body = result;
        resolve(1);
    });
  });
});


router.post('/guiabolso/position', async (ctx, next) => {
  ctx.body = "";
  const params = ctx.request.body;

  return new Promise((resolve, reject) => {
    const guiabolso = new GuiaBolso();


    let options = params.options;
    if(!options){
      options = {
        get_movements: true
      }
    }


    guiabolso.get({
      debug: options.debug,
      scrapMovements: options.get_movements,
      cached: params.cached ,
      credentials: params.credentials
    }).then((result)=>{
        ctx.body = result;
        resolve(1);
    });
  });
})

module.exports = router
