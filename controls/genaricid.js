/**
 * Created by Administrator on 13-11-29.
 */

var
    mongoose = require('../libs/mongo'),
    Schema = mongoose.Schema;

var _ID = new Schema({
    groupid: Number,
    personid: Number,
    channelid: Number
}, {versionKey: false})

// 1.控制起始号末尾号
// 2.可以根据QQ号输入申请
// 3.控制特殊号和号段
var GenaricID = mongoose.model('GenaricID', _ID)

var id = new GenaricID();
//随机数
function getRandom(start,end)
{
    return Math.floor(Math.random() * (end - start) +start);
}