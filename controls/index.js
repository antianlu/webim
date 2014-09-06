/*
 * GET home page.
 */
//exports.index = function (req, res) {
//    res.render('jst', { title: 'test jst', name: 'jst template' }, function (err, ctx) {
//        res.send(ctx);
//    });
//};
var sessionStore = require('../libs/session_mem');
var hash = require('../libs/pass');
var User = require('./user');
var fs = require('fs');

exports.index = function (req, res) {
    //req.session.jsessionid = '888';
    fs.readFile('./views/newthinking.html', 'utf-8', function (err, data) {
        if (!err) {
            res.writeHeader(200, {"Content-Type": "text/html;charset:utf-8"});
            res.write(data);
            res.end();
        }
    });
}

exports.login = function (req, res) {
    var p = req.body;
    //delete req.session.userid;
    if (p.username == 'an' && p.password == 'an') {
        req.session.userid = '999';
        res.redirect("/");
    }
    if (p.username == 'an1' && p.password == 'an1') {
        req.session.userid = '888';
        res.redirect("/");
    }
    if (p.username == 'an2' && p.password == 'an2') {
        req.session.userid = '777';
        res.redirect("/");
    }
    else {
        res.render("login");
    }
}

exports.checkAuth = function (req, res, next) {
    next();
    //console.log('check session',req.session);
//    if (!req.session.userid) {
//        res.redirect("/login");
//    }
//    else {
//        next();
//    }
}

exports.logout = function (req, res) {
    delete req.session.user_id;
    res.render('login');
}

exports.register = function (req, res) {
    var p = req.body;
    var password = p.password;
    var username = p.username;
    var u = new User();
    hash(password, function (err, salt, hash) {
        if (err) throw err;
        u.insert({
            username: username,
            password: hash,
            salt: salt
        })
    })

    var data = '', d = {};
    req.on('data', function (chunk) {
        data += chunk;
    })
    //cookies : bim=GERDSF23TDF323FDSESDR3442;value=username:name,password:pwd;domain=.bim.com;path =/; expires ='
    req.on('end', function () {
        d = JSON.parse(data);
        d.cookie = 'bim=GERDSF23TDF323FDSESDR3442;value=username:name,password:pwd;domain=.bim.com;path =/; expires =';
        d.error = null;
        res.end(JSON.stringify(d));
    })

//    sessionStore.startSession(req,res,function(req,res){
//        var session = this;
//        session.set('path','/');
//        session.set('username','hello');
//    })

}


function checkUser(req, res, next) {
    User.count({
        username: req.body.username
    }, function (err, count) {
        if (count === 0) {
            next();
        } else {
            req.session.error = "User Exist"
            res.redirect("/signup");
        }
    });
}

function tryLogin(name, pass, fn) {
    if (!module.parent) console.log('authenticating %s:%s', name, pass);
    userinfo.findOne({username: name}, function (err, user) {
        if (user) {
            if (err) return fn(new Error('cannot find user'));

        }
    })
}

function doCookies(req, res) {
    var cookies = {};
    req.headers.cookie && req.headers.cookie.split(';').forEach(function (cookie) {
        var parts = cookie.split('=');
        cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
    });
    res.send(cookies['type']);//ninja
}


exports.test = function(req,res)
{
    if ( req.session && req.session.user_id){
        req.session.no = req.session.user_id + 1;
    } else {
        req.session.user_id = 1;
    }
    res.send("No: " + req.session.user_id);
}
