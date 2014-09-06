/**
 * Created by Administrator on 14-3-11.
 */
var EventEmitter = require('events').EventEmitter,
    util = require('util');

/*
 * 提供外部调用
 */
var Promise = function()
{
    EventEmitter.call(this);
}

util.inherits(Promise,EventEmitter);
/*
 * 1.接受完成态、错误态的回调方法。在操作完成和错误时，将会调用对应的方法。
 * 2.可选的支持progress事件回调作为第三个方法。
 * 3.then()方法只接受function对象，其余对象将会被忽略。
 * 4.then()方法返回Promise对象，已实现链式调用。
 */
Promise.prototype.then = function(fulfilledHandler , errorHandler,progressHandler)
{
    if(typeof fulfilledHandler === 'function')
    {
        this.once('success',fulfilledHandler);
    }
    if(typeof errorHandler === 'function')
    {
        this.once('error',errorHandler);
    }
    if(typeof progressHandler === 'function')
    {
        this.on('progress',progressHandler);
    }
    return this;
}

/*
 * deferred.promise 只能内部调用
 */
var Deferrd = function()
{
    this.state = 'unfulfilled';
    this.promise = new Promise();
}

Deferrd.prototype.resolve = function(obj)
{
    this.state = 'fulfilled';
    this.promise.emit('success',obj);
}

Deferred.prototype.reject = function(err)
{
    this.state = 'failed';
    this.promise.emit('error',err);
}

Deferred.prototype.progress = function(data)
{
    this.promise.emit('progress',data);
}


/**
 * How to use?
 */

var promisity = function(res)
{
    var deferred = new Deferrd();
    var result='';
    res.on('data',function(chunk){
       result += chunk;
       deferred.progress(chunk);
    });
    res.on('end',function(){
        deferred.resolve(result);
    });
    res.on('error',function(err){
       deferred.reject(err);
    });
    return deferred.promise;
}

// invoke promise

promisity(res).then(function(data){},function(){})