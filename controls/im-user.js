/**
 * Created by antianlu on 13-11-22.
 */
// return the current user information

var U = module.exports;
U.insert = function(user){}
U.delete = function(){}
U.findUser = function(myid){}
U.getOnline = function(){}
U.update = function(){}
var ONLINEUSERS={};
U.forwarderInfo = function(data,fn)
{
    var body = data.body;
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
// get chat log information
U.findChatLog =function(myid,userid)
{}
// get my notice information
U.findNotice =function(myid)
{}

// broadcast all online users
U.online = function()
{}
//
U.offline = function()
{}

U.changeStatus = function()
{}
