/**
 * Created by Administrator on 13-11-15.
 */

var
    env = 'development',
    mongodb ={},// mongodb settings
    mysql   ={},// mysql settings
    host={};// web server host settings

// development in local
if (env == 'development')
{
    host =
    {
        url: 'http://localhost:'+host.port,
        port: '3000'
    }
    mongodb =
    {
        host: 'mongodb://localhost/BestService',
        port: '27017'
    }
    mysql =
    {
        url: '192.168.1.88://mysql',
        username:'',
        password:''
    }
}
// according to different person
if(env == 'An dev')
{
    host =
    {
        url: 'http://192.168.1.3:'+host.port,
        port: '80'
    }
    mongodb =
    {
        host: 'mongodb://192.168.1.3/BestIM',
        port: '27017',
        username: 'mongodb',
        password: 'test'
    }
    mysql =
    {
        url: '192.168.1.88://mysql',
        username:'mysql',
        password:'test'
    }
}

module.exports ={
    host:host,
    mongodb:mongodb,
    mysql:mysql
}
