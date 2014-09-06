var cookie = require('./cookie');

// session expire time setting
var EXPIRE_TIME = 3 * 60 * 1000;

// cache all session in server
var _sessions = {};

// GC the expire sessions
setInterval( function() {
    for ( var id in _sessions ) {
        if ( !_sessions.hasOwnProperty(id) ) {
            continue;
        }
        if (new Date() - _sessions[id].timestamp > EXPIRE_TIME) {
            delete _sessions[id];
        }
    }
}, 1000);

function createSID(pre) {
    pre = (pre) ? pre : 'SESS';
    var time = (new Date()).getTime() + '';
    var id = pre + '_' + (time).substring(time.length - 6) + '_' + (Math.round(Math.random() * 1000));
    return id;
}

var createSession = function(sID) {
    var session = {
        SID: sID,
        timestamp: new Date()
    }
    return session;
}

// define actions of session object
var session = function(_sessions, sID) {
    this.poke = function() {
        _sessions[sID].timestamp = new Date();
    };
    this.set = function(key, value) {
        _sessions[sID][key] = value;
        this.poke();
    };
    this.get = function(key) {
        return _sessions[sID][key];
        this.poke();
    };
    this.del = function(key) {
        delete _sessions[sID][key];
        this.poke();
    };
    this.destory = function() {
        delete _sessions[sID];
    };
}

// description session start
exports.startSession = function(req, res, callback) {
    var _header = req.headers;
    var cookies = {};
    if ( _header.cookie ) {
        cookies = cookie.parseCookie(_header.cookie);
    }

    var sID;
    for (var i in cookies) {
        if (i == 'sID') {
            sID = cookies[i];
            break;
        }
    }
    if (!sID || typeof _sessions[sID] == 'undefined') {
        var sID = createSID();
        _sessions[sID] = createSession(sID);
    }
    res.setHeader('Set-Cookie', ['sID=' + sID]);
    callback.call(new session(_sessions, sID), req, res);
}
