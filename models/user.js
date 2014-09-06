/**
 * Created by Administrator on 13-11-28.
 */

var
    mongoose = require('../libs/mongo'),
    Schema = mongoose.Schema;
var addresses = Schema({
    name: String,
    stress: String,
    postcode: String,
    default: Boolean
});
var Item = Schema({
    userid: Number,
    icon:{type:String,default:'default/head/default.jpg'},
    nickname:String,
    remark: String
}, {_id: false});
//用户分组列表
var UserGroup = Schema({
    name: String,
    list: [Item],
    total:Number,
    online:Number,
    Group: Schema.Types.Mixed
});
var GroupItem = Schema({
    groupid:Number,
    userid:Number,
    icon:String,
    name:String
},{versionKey:false,_id:false});
var Groups = Schema({
    type:String,
    name:String,
    icon:String,
    maxuser:Number,
    item:[GroupItem]
});

var User = Schema({
    username: String,
    password: String,
    secretkey: String,
    nickname: String,
    userid: {type: Number,unique:true, index: 1},
    name: String,
    groups:[Groups],
    usergroup:[UserGroup],
    gender: {type: Boolean, default: 0},
    birthday: Date,
    email: String,
    icon: {type: String, default: 'default/icons/icon_photos.png'},
    age: Number,
    qq: String,
    mobile: String,
    tel: String,
    profession: String,
    education: String,
    school: String,
    addresses:{type: [addresses],require:true},
    regtime: {type: Date, default: Date.now}
}, {collection:'users',versionKey: false});
//UserGroup.virtual('total').get(function () {
//    return this.list.length;
//});
//UserGroup.virtual('online').get(function () {
//    return this.list.length;
//});
module.exports = mongoose.model('Users', User);
var User = mongoose.model('Users', User);
