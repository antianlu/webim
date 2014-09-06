/**
 * Created by antianlu on 13-11-28.
 */
var mongoose = require('mongoose');
var User = require('../models/user');
var IMGroup = require('./im-group');

var EventProxy = require('eventproxy');
var proxy = new EventProxy();
//var Promise = require('mpromise');
//var Q = require('q');
var user = new User();
var U = module.exports;

U.insert = function (user) {
    var u = new User(user);
    u.save(function (err, newUser) {
        if (err) throw err;
        else console.log(newUser)
    });
};
U.update = function () {
};
U.delete = function (o) {
};
U.doLogin = function (u, fn) {
    User.findOne(u, {userid: 1, username: 1, nickname: 1, name: 1, icon: 1}, function (err, nu) {
        fn(err,nu);
    });
};
U.findGroup = function (u, cb) {
    User.findOne(u, {userid: 1, icon: 1, usergroup: 1, groups: 1}, function (err, user) {
        if (err) throw Error('find user group error');
        else {
            // find usergroup
            var len = user.usergroup.length;
            if(len ===0) return getGroup();
            user.usergroup.forEach(function (ugroup, i) {
                ugroup.list.forEach(function (list, j) {
                    User.findOne({userid: list.userid}, function (err, r) {
                        if (r) {
                            //这两个字段是mongoose的schema中必须存在
                            // user.usergroup[i].list[j].remark = r.nickname;
                            user.usergroup[i].list[j].nickname = r.nickname;
                            //修改完毕后在触发回调函数
                            if (i === len-1) getGroup();
                        }
                    })
                })
                user.usergroup[i].total = user.usergroup[i].list.length;
                user.usergroup[i].online = 0;
                if(ugroup.list.length === 0) getGroup();
            })
            function getGroup(){
                var glen = user.groups[0].item.length;
                if(glen === 0 ) return cb && cb(user);
                user.groups[0].item.forEach(function(group,x){
                    IMGroup.findGroup({groupid:group.groupid,req:1},function(err,g){
                        user.groups[0].item[x] = g[0];
                        if(g[0]._id && (glen-1 === x)) {
                            cb && cb(err,user);
                        }
                    })
                })
            }
        }
    })
}

//U.findUser({userid: 888}).then(function(data){
//    console.log( data);
//});

//for( var i=1;i<10;i++)
//{
//    var json =
//    {
//        username:'im'+i,
//        password:'im'+i,
//        nickname:i%2==0 ?('逐梦飞扬'+i):('造化玉碟'+i),
//        userid:i.toString()+i+ i.toString(),
//        icon:'default/heads/'+i+'.png',
//        usergroup:[],
//        groups:[{
//            name:'我的IM群组',
//            item:[]
//        }]
////        usergroup:[{
////            name:'我的好友',
////            list:[{
////                userid:111,
////                remarke:'00'
////            }]
////        }]
//    }
//   // json.usergroup[0].list.push({a:'a'});
//    for(var j=0;j<i;j++){
//        //console.log(json.usergroup[j].list);
//        var id = j+1;
//        json.usergroup.push( {
//            name:'我的好友'+id,
//            list:[]
//        });
//        json.groups[0].item.push({
//            groupid:id.toString()+id+id.toString()+id+id.toString()
//        })
//        //console.log(json.usergroup[j]);
//       if(id==i) ++id;
//        var list  =
//        {
//            userid:id.toString()+id+ id.toString(),
//            icon:'default/heads/'+id+'.png',
//            remark:'备注'+ i.toString()+ id.toString()
//        }
//        json.usergroup[j].list.push(list);
//        for(var k = 1;k<j;k++)
//        {
//            var list;
//            if(k!=(i+1))
//            {
//                 list  =
//                {
//                    userid:k.toString()+k+ k.toString()+ i.toString(),
//                    icon:'default/heads/default.png',
//                    remark:'备注'+ i.toString()+ k.toString()
//                }
//            }
//            json.usergroup[j].list.push(list);
//        }
//    }
//    U.insert(json);
//}

//function authenticate(name, pass, fn) {
//    if (!module.parent) console.log('authenticating %s:%s', name, pass);
//
//    User.findOne({
//            username: name
//        },
//
//        function (err, user) {
//            if (user) {
//                if (err) return fn(new Error('cannot find user'));
//                hash(pass, user.salt, function (err, hash) {
//                    if (err) return fn(err);
//                    if (hash == user.hash) return fn(null, user);
//                    fn(new Error('invalid password'));
//                });
//            } else {
//                return fn(new Error('cannot find user'));
//            }
//        });
//}
