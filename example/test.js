/**
 * Created by Administrator on 13-11-27.
 */
// This is a way use event's EventEmitter
//var EventEmitter = require('events').EventEmitter,
//    a = new EventEmitter();
//
//a.on('event',function(){
//
//})
//a.emit('event');
//
//
//var EventEmitter  = process.EventEmitter,
//    MyClass = function(){};
//
//MyClass.prototype.__proto__= EventEmitter.prototype;
//
//// how to use it
// var a = new MyClass();
//a.on('some defined event',function(){
//    // do something
//})
require('buffer');
var mybuffer = new Buffer('==ii1j2i3h1i23h', 'base64');
console.log(mybuffer);
require('fs').writeFile('logo.png', mybuffer);
console.log('/\033[39m')
