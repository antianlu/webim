/**
 * Created by Administrator on 13-12-3.
 */
var cookie = require('./cookie');
var session_store = require('redis').createClient();
//var redis_client = require('redis').createClient(6379, '127.0.0.1');

// setting the expire time, unit second
// GC by redis server automatic handle
var EXPIRE_TIME = 3 /* hour */ * 60 /* minutes*/ * 60 /* seconds */;

function createSID ( prefix ) {
    pre = (pre) ? pre : 'NS';
    var time = (new Date()).getTime() + '';
    var id = pre + '_' + (time).substring(time.length - 6) + '_' + (Math.round(Math.random() * 1000));
    return id;
}

var session= function(sID) {
    var exists = function() {
        return session_store.exists(sID);
    };
    this.create = function() {
        session_store.mset(sID, 'sid', sID);
        this.poke();
    };
    this.poke = function() {
        // update the expire time
        session_store.expire(sID, EXPIRE_TIME);
    };
    this.del = function(key) {
        session_store.hdel(sID, key);
        this.poke();
    }
    this.set = function(key, value) {
        session_store.hset(sID, key, value);
        this.poke();
    };
    this.get = function(key) {
        return session_store.hget(sID, key);
        this.poke();
    };
    this.destory = function() {
        session_store.del(sID);
    };
    this.all = function() {
        session_store.hgetall(sID, function(err, data){
            return data;
        });
    }
}

exports.startSession = function(req, res, fn) {
    var _header = req.headers;
    var cookies = _header.hasOwnProperty(cookie)
        ? cookies = cookie.parseCookie(_header.cookie)
        : {};

    var sID = ( cookies.hasOwnProperty('sID') ) ? cookies['sID'] : '';
    if ( sID=='' || session.exists(sID) ) {
        sID = createSID();
        session.create(sID);
    }
    res.setHeader('Set-Cookie', ['sID=' + sID]);
    fn.call(new session(sID), req, res);
}
