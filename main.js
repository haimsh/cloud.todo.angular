/**
 * Created by ShachorFam on 28/01/14.
 */
console.log("hello world");
var Express = require('mini.express.haim.shachor/miniExpress');
var app = Express();
app.use(Express.cookieParser());
app.use(Express.bodyParser());
app.use(Express.static(__dirname + '/www'));
app.listen(8080);