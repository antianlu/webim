/**
 * Created by antianlu on 13-11-22.
 */
exports.inputting = function(socket)
{
    socket.emit('inputting',{});
}

exports.stop_input = function()
{

}
// get user or group unread
exports.get_unread =function()
{

}
// private,group
exports.chat = function(data)
{
    if(data.type == 'group')
    {
        console.log('[group] received message ' + data.id);
    }
    else if(data.type == 'private')
    {
        console.log('[private] received message ' + data.id);
    }
}