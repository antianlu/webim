/**
 * Created by Administrator on 13-12-20.
 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/dev')

var db =  mongoose.connection;

    db.on('error',console.error.bind(console,'connection error:'));
    db.once('open',function callback (){
        console.log('connection mongodb success!');
    })
var _id = mongoose.Schema.Types.ObjectId;
    var user= mongoose.Schema({
        name:String,
        _id:mongoose.Schema.Types.ObjectId,
        date:{type:Date,default:Date.now}
    },{versionKey:false,_id:false});
    user.methods.speak = function(){
        var greeting  = this.name ? 'This is my name,'+this._id:'I have a no name!';
        console.log(greeting);
    }
    var User = mongoose.model('users',user);

    var test = new User({name:'kit-1',_id:new mongoose.Types.ObjectId});
    test.save(function(err,t){
       if(err) console.log(err);
        //console.log(t._id);
      t.speak();
    });
User.find(function(err,t){
        console.log();
    })
//console.log(db);