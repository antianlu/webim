/**
 * Created by An Tianlu on 13-11-15.
 */
require('../libs/extend');
var
    express  = require('express'),
    http     = require('http'),
    jst      = require('jst'),
    path     = require('path'),
    socket_io = require('socket.io'),
    routes   = require('../routes/router'),
    settings = require('./settings'),
    socket   = require('../libs/socket'),
    MongoStore = require('connect-mongo')(express);
    //sessionStorage = require('../libs/session_mem');

var app  = new express();

module.exports = function(dirname){
    var sessionStore = new MongoStore({
        url:settings.mongodb.host
    });
    var cookieParser =express.cookieParser('world');
    app.configure(function(){
        // load setting
        app.set('port', process.env.PORT || settings.host.port);
        // load view path
        app.set('views',path.join(dirname,'/views'));
        // view engine template is html
        app.set('view engine', 'html');
        // set how to use which manner compile view, we use jst template renderFile function do it.
        app.engine('html',jst.renderFile);
        // set language
        //app.use(function(req, res, next) { req.lang = 'zh_CN'; next(); });
        // recode logger info ,development error log,show different color in console print
        app.use(express.logger('dev'));

        app.use(express.favicon());
        // use bodyParser can compile application/json，application/x-www-form-urlencoded and multipart/form-data etc
        app.use(express.bodyParser());
        // this middleware can process POST ,pretend PUT,DELETE and other requests
        app.use(express.methodOverride());
        // login validate use
        app.use(cookieParser);
        app.use(express.session({
            store:sessionStore,
            key:'jsessionid',//user cloud share key
            secret:'hello'
        }));
        // use router ,it can filter visit path
        app.use(app.router);
        // load router
        routes(app);

        app.use(function (req, res, next) {
//            var err = req.session.error,
//                msg = req.session.success;
//            delete req.session.error;
//            delete req.session.success;
//            res.locals.message = '';
//            if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
//            if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
            res.header('Access-Control-Allow-Credentials', true); //允许客户端发送cookie信息
            var origin = (req.headers.origin || "*");
            res.header('Access-Control-Allow-Origin', origin);//origin为客户端自己的域名，如果不是跨域为'*'
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Set-Cookie, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
            next();
        });
        // configuration static files path,load js,css,images files
        // if use this set path ,client file's only use public path '/css/^^^','/js/^^^' etc.
        app.use(express.static(path.join(dirname,'/public')));
    });
    // set development url
    app.configure('development', function () {
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    });

    app.configure('production', function () {
        app.use(express.errorHandler());
    });

    var server = http.createServer(app);
    var io = socket_io.listen(server);
    socket(io,sessionStore,cookieParser);

    server.listen(app.get('port') , function(){
        console.log(app.get('port'));
        console.log('Express server listening on port ' + app.get('port'));
    });
}