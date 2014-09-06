/**
 * Created by antianlu on 14-1-9.
 */
var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    sio = require('socket.io'),
    IMSocket = require('./imsocket'),
    currentId = 1;

var Connector = function(host,port,opts)
{
    if(!(this instanceof Connector))
    {
        return new Connector(host,port,opts);
    }

    EventEmitter.call(this);
    this.host = host;
    this.port = port;
    this.opts = opts;
}

util.inherits(Connector , EventEmitter);

module.exports = Connector;

// start connect socket
Connector.prototype.start = function(cb)
{
    var self = this;
    if(!!this.opts.transports)
    {
        this.wsocket = sio.listen(this.port,this.opts.transport);
    }
    else
    {
        this.wsocket = sio.listen(this.port,{
            transports:[
                'websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling', 'flashsocket'
            ]
        })
    }

    this.wsocket.set('log level',1);
    this.wsocket.sockets.on('connection',function(socket){
        var imsocket = new IMSocket(currentId++,socket);
        self.emit('connection',imsocket);
        imsocket.on('closing',function(reason){
            imsocket.send({reason:reason});
        });
    });
    process.nextTick(cb);
};

Connector.prototype.stop = function(cb)
{
    this.wsocket.server.close();
    process.nextTick(cb);
};

//{ msgid:1,userid:'55',body:{}}