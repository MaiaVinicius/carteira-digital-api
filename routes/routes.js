var Router = require('koa-router');
const router = new Router()
const GuiaBolso = require('./../Services/GuiabolsoService');
const Easynvest = require('./../Services/EasynvestService');
const Clear = require('./../Services/ClearService');
const Rico = require('./../Services/RicoService');



router.post('/rico/position', async (ctx, next) => {
  ctx.body = "";
  const params = ctx.request.body;

  return new Promise((resolve, reject) => {
    Rico.get({
      headless: false,
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
    Clear.get({
      headless: true,
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
    Easynvest.get({
      headless: true,
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
    GuiaBolso.get({
      headless: false,
      cached: params.cached ,
      credentials: params.credentials
    }).then((result)=>{
        ctx.body = result;
        resolve(1);
    });
  });
})

module.exports = router
