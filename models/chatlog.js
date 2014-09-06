/**
 * Created by Administrator on 13-11-28.
 */

var
    mongoose = require('../libs/mongo'),
    Schema = mongoose.Schema;

var ChatLog = new Schema({
    top: Number,
    type: Number,
    userid: Schema.Types.objectId,
    fromid: Schema.Types.objectId,
    msg: String,
    date: {type:Date,default:Date.now}
},{versionKey:false,collection:'chatlogs'});

module.exports = mongoose.modle('ChatLogs', ChatLog);