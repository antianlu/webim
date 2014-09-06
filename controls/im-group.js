/**
 * Created by antianlu on 13-12-21.
 * 对于组操作，获取组信息
 * 查询该用户所有有关的组信息，组成组列表
 * 当点击展开组时加重组成员列表信息
 * 点击组成员某一个人的信息时，加载详细信息
 * 客户端使用本地缓存，监控是否有新内容
 */
var Group = require('../models/group');
var User = require('../models/user');
//var group = new Group();
//var user = new User();

var G = module.exports;
G.createGroup = function (g) {
    var _group = new Group.Group(g);
    _group.save(function (err, newGroup) {
        if (err) console.log(err);
        //else console.log(newGroup);
    })
}
G.applyJoin = function () {
}
G.findNumberList = function (o, fn) {
    Group.Group.findOne(o, {number: 1}, function (err, data) {
        if (err) {
        }
        else {
            fn(data);
        }
    });
}
G.findGroup = function (o, fn) {
    //o={topid:999}
    var req = o.req;
    delete o.req;
    if (req == 1) {
        //获取关于这个用户所有群组
        Group.Group.find(o, {topid: 1, groupid: 1, icon: 1, name: 1, type: 1, maxuser: 1}, function (err, g) {
            if (!err) {
                fn && fn(err, g);
            }
        });
    }
    else {
        Group.Group.findOne(o, {number: 1}, function (err, g) {
            if (err) console.log(err);
            var len = g.number.length;
            if (len == 0) fn && fn(err, g);
            if (req == 2) fn && fn(err, g);
            else {
                g.number.forEach(function (u, i) {
                    User.findOne({userid: u.userid}, {userid: 1, nickname: 1, icon: 1}, function (err, d) {
                        if (err) {
                            console.log(err);
                        }
                        if (d) {
                            g.number[i] = d;
                           // if (i === len - 1) fn && fn(err, g);
                        }
                    })
                })
                process.nextTick(fn(null,g));
            }
        })
    }
}

G.quit = function () {
}
G.enter = function (data) {
    console.log('user connect server success --- ' + data.id + ' ' + data.name);
}
G.leave = function () {
}


var UG = module.exports;
UG.insert = function (uid) {
}
UG.delete = function (uid) {
}
UG.findUserGroup = function (uid) {
}
UG.addNumber = function (groupid) {
}

UG.update = function () {
}
UG.moveItem = function () {
}
UG.updateOnline = function () {
}
UG.onlineTip = function () {
}
UG.offline = function () {
}


//for (var i = 1; i < 10; i++) {
//    var json =
//    {
//        topid: i.toString() + i + i.toString(),
//        groupid: i.toString() + i + i.toString() + i + i.toString(),
//        name: '群组名称' + i.toString(),
//        icon: 'default/icons/user_group.png',
//        number: [],
//        maxuser: 1000,
//        type: '用户创建'
//    };
//    for (var j = 1; j < 10; j++) {
//        var number = {
//            userid: j.toString() + j + j.toString(),
//            remarke: ''
//        }
//        json.number.push(number);
//    }
//    G.createGroup(json);
//}

//exports.Group = Group;
//exports.UserGroup = User;