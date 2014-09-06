/**
 * Created by antianlu on 14-1-9.
 */
var util = require('util'),
    EventEmitter = require('events').EventEmitter;

var START_INITED = 0,
    START_CLOSED   = 1;

var Socket = function (id,socket)
{
    var self = this;
    EventEmitter.call(this);
    this.id = id;
    this.socket = socket;
    this.remoteAddress = {
        ip:socket.handshake.address.address,
        port:socket.handshake.address.port
    };
    socket.on('message',function(msg){
       self.emit('message',msg);
    });
    socket.on('disconnect',this.emit.bind(this,'disconnect'));

    this.state = START_INITED;
}

util.inherits(Socket , EventEmitter);

module.exports = Socket;

Socket.prototype.send = function(msg)
{
    if(this.state !== START_INITED)
    {
        return;
    }
    if(typeof msg !=='string')
    {
        msg = JSON.stringify(msg);
    }
    this.socket.send(msg);
}

Socket.prototype.disconnect = function()
{
    if(this.state ===START_CLOSED)
    {
        return;
    }
    this.state = START_CLOSED;
    this.socket.disconnect();
}
// send group message
Socket.prototype.sendBatch  = function(msgs)
{
    //this.send();
}