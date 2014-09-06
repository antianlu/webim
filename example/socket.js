/**
 * Created by Administrator on 13-11-18.
 */

var
    app    = require('express')(),
    server = require('http').createServer(app),
    io      = require('socket.io').listen(server);

    app.get('/',function(req,res){
        res.sendfile(__dirname + '/socket01.html');
    });

    io.sockets.on('connection',function(socket){
       socket.emit('news',{hello : 'world'});
        socket.on('my other event',function(data){
            console.log(data);
        });
    });

    server.listen(3000,function(){
        console.log('Server start!')
    });