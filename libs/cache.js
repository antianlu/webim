/**
 * Created by Administrator on 13-12-2.
 */
// use redis database as memory cache
var
    redis  = require('redis');
    client = redis.createClient();

client.on('error',function(err){
   console.log('Error:' + err);
});

client.set('String key','String value',redis.print);

client.hset('Hash key','Hash value',redis.print);

client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
client.hkeys("hash key", function (err, replies) {
    console.log(replies.length + " replies:");
    replies.forEach(function (reply, i) {
        console.log("    " + i + ": " + reply);
    });
    client.quit();
});