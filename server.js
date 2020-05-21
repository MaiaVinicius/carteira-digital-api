var Koa = require('koa');
var Router = require('koa-router');
var rootRouter = require('./routes/routes')
const bodyParser = require('koa-bodyparser');


var app = new Koa();
var router = new Router();

app.use(bodyParser())
app.use(rootRouter.routes())
app.use(rootRouter.allowedMethods())

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000);