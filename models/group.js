/**
 * Created by antianlu on 13-12-19.
 * This list common use by list,group,join hands different channel
 */

var mongoose = require('../libs/mongo'),
    Schema = mongoose.Schema,
    extend = require('mongoose-schema-extend');

var Item = new Schema({
    userid: Number,
    remarke: String
}, {_id: false});

var GroupItem = Item.extend({
    manager: Number
})

//群组基本信息
var BaseGroup = new Schema({
    name: String,
    groupid: {type: Number,unique:true, index: 1},
    type:String,
    topid:Number,//userid,companyid,etc.
    icon: String,
    number: [GroupItem],
    createat: {type: Date, default: Date.now},
    maxuser: {type: Number, default: 1000},
    verify: Boolean,
    notice: String
}, {collection: 'groups', versionKey:false});
//多渠道用途群组,并支持多级分组
var ChannelGroup = BaseGroup.extend({
    Group:Schema.Types.Mixed,
    channeltype: String,
    channelname: String
});
//用户创建的群组
var Group = BaseGroup.extend({
    classify:String
});

Group.virtual('total').get(function () {
    return this.number.length;
});

exports.Group = mongoose.model('Groups', Group);
exports.ChannelGroup = mongoose.model('ChannelGroup', ChannelGroup);

var lists =
{
    groups: [
        {
            groupid: '111111111',
            _id: 'GDFTY34RFERR326Y5TRG',
            name: "group1",
            list: [
                {_id: '5234587671', name: 'hello1', icon: 'default/icons/default.png', sign_name: '', comment: ''},
                {_id: '0897864232', name: 'hello2', icon: 'default/icons/alert.png', sign_name: '', comment: ''}
            ],
            online: 1,
            total: 100
        },
        {
            groupid: '222222222',
            _id: 'JHFDRTU654GDFFG43',
            name: "group2",
            list: [
                {_id: '5234587673', name: 'hello3', icon: 'default/icons/icon_photos.png', sign_name: '', comment: ''},
                {_id: '0897864234', name: 'hello4', icon: 'default/icons/icon_stocks.png', sign_name: '', comment: ''}
            ],
            online: 90,
            total: 150
        },
        {
            groupid: '333333333',
            _id: '5TDFGH54948FDGG4',
            name: 'group3',
            list: [
                {_id: '52345876735', name: 'hello5', icon: 'default/icons/default.png', sign_name: '', comment: ''}
            ],
            online: 0,
            total: 0,
            group: [
                {
                    groupid: '45567453467',
                    _id: '6GDFHU65HHGY5',
                    name: 'subgroup1',
                    list: [
                        {_id: '52345876735', name: 'hello5', icon: 'default/icons/default.png', sign_name: '', comment: ''}
                    ]
                }
            ]
        }
    ]
}

var groups = [
    {
        _id: 'h6h687tfye',
        groupid: '667867',
        name: 'AAAAAAA',
        icon: ''
    },
    {
        _id: 'rtyerwewerwer',
        groupid: '9346778',
        name: 'BBBBBBBBB',
        icon: ''
    },
    {
        _id: '4f44g9f4323',
        groupid: '765764564',
        name: 'CCCCCCC',
        icon: ''
    }
]