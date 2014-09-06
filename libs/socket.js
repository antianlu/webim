/**
 * Created by Administrator on 13-11-21.
 */
var
    common = require('../controls/chat_common'),
    Group = require('../controls/im-group'),
    User = require('../controls/user'),
    Cookie = require('../libs/cookie'),
    SessionSockets = require('./session.socket.io');
var ONLINEUSERS = {};
module.exports = function (io, sessionStore, cookieParser) {
    // var sessionSockets = new SessionSockets(io,sessionStore,cookieParser);
    io.set('log level', 1);
    io.configure('production', function () {
        io.enable('browser client etag');
        io.set('transports', [
            'websocket' ,
            'flashsocket',
            'htmlfile',
            'xhr-polling',
            'jsonp-polling'
        ]);
    });

//    io.configure('development', function(){
//        io.set('transports', ['websocket']);
//    });
    //设置session
    io.set('authorization', function (handshakeData, callback) {
        // 通过客户端的cookie字符串来获取其session数据
        handshakeData.cookie = Cookie.parseCookie(handshakeData.headers.cookie)
        var sidString = handshakeData.cookie['connect.sid'] || handshakeData.cookie['jsessionid'];
        if (sidString) {
            //console.log(getSessionID(sidString));
            sessionStore.get(getSessionID(sidString), function (error, session) {
                //console.log(error,session);
                if (error) {
                    // if we cannot grab a session, turn down the connection
                    callback(error.message, false);
                }
                else {
                    //console.log('session,',session)
                    // save the session data and accept the connection
                    handshakeData.session = session;
                    callback(null, true);
                }
            });
        }
        else {
            callback('nosession');
        }
    });

    //开始监听客户端连接
    //sessionSockets.on('connection', function (err,socket,session) {
    io.on('connection', function (socket) {
        console.log("Connection " + socket.id + " accepted.");
        socket.on('active', function (data) {
            console.log('XXXXXX正在浏览此网页'+data.id);
        })
        if (socket.handshake.session) {

            // ONLINEUSERS[userid] = socket;
            console.log('-session', socket.handshake.session.userid);
        }
        socket.on('sendGroup', function (dt) {
            var userid = socket.handshake.session.userid;
            User.findGroup({userid: userid}, function (err,data) {
                console.log(userid,data);
                ONLINEUSERS[userid].emit('groupList', data);
            });
        })
        //data format:{id:1,code:200,error:null,body:{}}
//        socket.on('loadIMList', function () {
//            var userid = socket.handshake.session.userid;
//            User.findGroup({userid: userid}, function (err,data) {
//                //console.log(data);
//                var dataFormat = {id: 1, code: 200, error: null, body: data};
//                ONLINEUSERS[userid].emit('groupList', dataFormat);
//            });
//        });
        socket.on('loadGroupNumber', function (data, fn) {
            if (data) {
                Group.findGroup({groupid: data.groupid, req: 3}, function (err,g) {
                    console.log('loadGroupNumber',g)
                    fn({id: 3, code: 200, body: g});
                })
            }
        })

        socket.on('doLogin', function (data, fn) {
            // login manner two ways :1.username,password,2.userid,password
            if (data.body) {
                var body = data.body,
                    username = body.username,
                    password = body.password;
                //check database and setsession
                var login = {password: password};
                if (/^[0-9]*$/.test(username)) {
                    login.userid = username;
                }
                else {
                    login.username = username;
                }
                console.log(body);
                User.doLogin(login, function (err,d) {
                    var dataFormat = {id: 3, code: 000, error: null };
                    if (d) {
                        ONLINEUSERS[d.userid] = socket;//保存会话
                        console.log('User:' ,d);
//                        console.log('handshake.session:' , socket.handshake.session);
                        socket.handshake.session.userid = d.userid;//设置会话session
                        var sidString = socket.handshake.cookie['connect.sid'] || socket.handshake.cookie['jsessionid'];
                        sessionStore.set(getSessionID(sidString), socket.handshake.session, function (err) {
                            if (!err) {
                                User.findGroup({userid: d.userid}, function (err, data) {
                                    if (err) {
                                        dataFormat.error = '加载群组列表失败', fn(dataFormat);
                                    }
                                    dataFormat.code = 200,
                                        dataFormat.body = {userinfo: d, group: data},
                                        //TODO:这里有一个奇怪现在必须调用两次才成功
                                        fn(dataFormat), fn(dataFormat);
                                });
                            }
                            else {
                                dataFormat.error = 'session 设置失败', fn(dataFormat);
                            }
                        })
                    }
                    else {
                        dataFormat.error = '登录失败';
                        fn(dataFormat)
                    }
                });
            }
        })

        socket.on('login', function (data, fn) {
            console.log(data);
            if (data.type == 'checklogin') {
                if (socket.handshake.session && socket.handshake.session.userid) {
                    fn(true);
                }
                else //need login
                {
                    fn(false);
                }
            }
            else {
                // login manner two ways :1.username,password,2.userid,password
                var username = data.username,
                    password = data.password;
                //check database and setsession
                var json = {password: password};
                if (/^[0-9]*$/.test(data.username)) {
                    json['userid'] = username;
                }
                else {
                    json['username'] = username;
                }

                User.doLogin(json, function (d) {
                    if (d) {
                        ONLINEUSERS[d.userid] = socket;//保存会话
                        socket.handshake.session.userid = d.userid;//设置会话session
                        var sidString = socket.handshake.cookie['connect.sid'] || socket.handshake.cookie['jsessionid'];
                        sessionStore.set(getSessionID(sidString), socket.handshake.session, function (err) {
                            if (!err) {
                            }
                        })
                        fn(true, d);
                        fn(true, d);
                    }
                });

            }
        })

        //从客户端接受消息
        socket.on('message', function (data, fn) {
            console.log(data);
            //var data = JSON.parse(data);
            var body = data.body;
            if (body.flag == 'private') {
                console.log('[private message]: form ' + body.from + ' to ' + body.to + ' msg:' + body.msg);
                var target = ONLINEUSERS[body.to];
                data.body.sendtime = new Date().format('yyyy-MM-dd hh:ss');
                if (target) {
                    console.log('正在转发[私聊]信息');
                    data.code = 200;//表示处理信息成功
                    console.log(data,data.body.sendtime);
                    //转发至目标用户
                    target.emit('message', data, function (reciept) {
                        if (reciept) {
                           // fn(true);//用户接收成功，向发送端回执
                        }
                    });
                }
                else {
                    fn(false);
                }
            }
            if (body.flag == 'group') {
                //get group number id
                console.log(data);
                Group.findGroup({groupid: body.to, req: 2}, function (err,g) {
                    var target, count = 0;
                    g.number.forEach(function (item,i) {
                        if (item.userid != body.from) {
                            target = ONLINEUSERS[item.userid];
                            data.code = 200;
                            if (target) {
                                console.log(item.userid);
                                console.log('正在转发[群聊]信息,成功转发：'+body.from);
                                count++;
                                target.emit('message', data,function (reciept) {
                                    if (reciept) {
                                      //  fn(true);//用户接收成功，向发送端回执
                                    }
                                });
                            }
                        }
                    });
                    if (count > 0) fn(true);
                })
                console.log('[group message]: from ' + body.from + ' to group id ' + body.to + ' msg :' + body.msg);
            }
        })


        //socket.emit('load',{hello:'world'})
        //console.log(new Date() + ' connection from origin id is:' + socket.id);
        //首先获得通信类型，根据通信类型定向到不同渠道
//        socket.emit('news', { hello: 'world' });
//        socket.on('my other event', function (data) {
//            console.log(data);
//        });
        // if connected success ,send current group lis to client
        //var notice = {success : true,group_list:groups};
        //socket.json.send(notice);

        // if new person enter first show this message
        //socket.emit('enter',{msg : 'you enter this chat room'});


        socket.on('stop_input', function () {

        });

        socket.on('connecting', function () {

        });
        //消息通知
        socket.on('msg_notice', function () {

        });
        //下线
        socket.on('disconnect', function (data) {

        });

        socket.on('public', function (msg) {
            console.log('[public] {username} to all say ' + msg);
        });
        //私聊操作
        //服务器转发事件
        socket.on('privateMessage', function (data, fn) {
            console.log(data);
            //var data = JSON.parse(data);
            var body = data.body;
            console.log('[privateMessage]: form ' + body.from + ' to ' + body.to + ' msg:' + body.msg);
            var target = ONLINEUSERS[body.to];
            if (target) {
                console.log('正在转发');
                //转发至目标用户
                target.emit('privateMessage', data, function (reciept) {
                    if (reciept) {
                        fn(true);//用户接收成功，向发送端回执
                    }
                });
            }
            else {
                fn(false);
                //target.emit('errorMessage')
            }
            //登录（connection）退出（disconnection）时向所有列表在线好友广播
            //提取好友请求并提示为处理
            //提取未读好友聊天信息并提示
            //各种消息发送，在线直接发送，不在线转存
            //好友实时状态
        });
        //群发操作
        socket.on('group', function (data) {
            console.log('[group]:', data.id, data.msg);
            var d =
            {
                fromid: '',
                groupid: '',//get all online users at this userid group
                msg: '',
                type: ''
            }
            var ids = ['one', 'two', 'three'];
//            ids.forEach(id,function(){
//                //id.emit('group',m);
//            })

            var m =
            {
                msg: '',
                groupid: ''
            }
            //进入退出群提示
            //发消息向群列表在线人员广播，{个人发送，信息广播}
            //群消息存储，如不在线下次进入群时提取未读并提示信息
        })

        socket.on('chat', function (data) {

            //core.chat(data);
        })

        //获取所有在线数量和部分列表
        socket.on('online', function () {

        });
        //系统广播所以在线用户
        socket.broadcast.on('system', function () {

        });

    });
}

function getSessionID(sidStr) {
    var sid = '';
    if (sidStr) {
        sid = sidStr.split(':')[1].split('.')[0];
    }
    return sid
}

var groups = {
    group1: {
        gid: 'g1',
        name: "group1",
        list: [
            {_id: '523458767', name: 'hello', sign_name: '', comment: ''},
            {_id: '089786423', name: 'hello', sign_name: '', comment: ''}
        ],
        online: 1,
        total: 100
    },
    group2: {
        gid: 'g2',
        name: "group2",
        list: [
            {_id: '523458767', name: 'hello', sign_name: '', comment: ''},
            {_id: '089786423', name: 'hello', sign_name: '', comment: ''}
        ],
        online: 90,
        total: 150
    },
    group3: []
}