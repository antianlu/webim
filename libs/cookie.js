// Parse the given cookie string into an object.
exports.parseCookie = function(str) {
    var obj = {}
        , pairs = str.split(/[;,] */);
    for (var i = 0, len = pairs.length; i < len; ++i) {
        var pair = pairs[i]
            , eqlIndex = pair.indexOf('=')
            , key = pair.substr(0, eqlIndex).trim().toLowerCase()
            , val = pair.substr(++eqlIndex, pair.length).trim();

        // quoted values
        if ('"' == val[0]) val = val.slice(1, -1);

        // only assign once
        if (typeof obj[key] === 'undefined') {
            val = val.replace(/\+/g, ' ');
            try {
                obj[key] = decodeURIComponent(val);
            } catch (err) {
                if (err instanceof URIError) {
                    obj[key] = val;
                } else {
                    throw err;
                }
            }
        }
    }
    return obj;
};

// Serialize the given object into a cookie string.
exports.serializeCookie = function(name, val, obj){
    var pairs = [name + '=' + encodeURIComponent(val)]
        , obj = obj || {};

    if (obj.domain) pairs.push('domain=' + obj.domain);
    if (obj.path) pairs.push('path=' + obj.path);
    if (obj.expires) pairs.push('expires=' + obj.expires.toUTCString());
    if (obj.httpOnly) pairs.push('httpOnly');
    if (obj.secure) pairs.push('secure');

    return pairs.join('; ');
};


//var http = require('http');
//http.createServer(function(req,res){
//    var today = new Date();
//    var time = today.getTime() + 60*1000;
//    var time2 = new Date(time);
//    var timeObj = time2.toGMTString();
//
//    res.writeHead(200,{'Content-Type':'text/plain', 'Set-Cookie':'myCookie="users=[{\"name\":\"a\",\"m\":1},{\"name\":\"b\"}]", "language=javascript";path="/";Expires='+timeObj+';httpOnly=true'});
//    res.end('hello world！');
//    console.log(req.headers);
//    //console.log(res.cookie)
//}).listen(3000);
//
//console.log('3000');
