const Koa = require('koa');
const app = new Koa();

// response
app.use(ctx => {
  ctx.body = '码农开发中。。。';
});

app.listen(8088);