/**
 * Created by antianlu on 13-11-16.
 */
var
    index = require('../controls/index');

var test  = require('../controls/test');

// if want to use template ,you can use controls invoke render
// if only return content , you can use each of file object invoke
module.exports = function(app)
{
    //app.get('/index',index.index);
    app.get('/',index.checkAuth,index.index,function(req,res){});

//    app.get('/test',function(req,res){
//        if ( req.session && req.session.no){
//            req.session.no = req.session.no + 1;
//        } else {
//            req.session.no = 1;
//        }
//        res.send("No: " + req.session.no);
//    });
    app.get('/login',function(req,res){
        res.render('login');
    });

    app.get('/logout',index.logout);
    app.post('/register',index.register);
    app.post('/login',index.login);
}