/**
 * Created by Administrator on 13-11-28.
 */

// connection mongoose
var
    setting = require('../conf/settings'),
    mongoose = require('mongoose');

//console.log('mongodb',setting.mongodb.host);

var options = {
    db: { native_parser: true },
    server: { poolSize: 5 },
    replset: { rs_name: 'myReplicaSetName' },
    user: 'myUserName',
    pass: 'myPassword'
}
//mongoose.connect(uri, options);
mongoose.connect(setting.mongodb.host);

module.exports = mongoose;