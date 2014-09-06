/**
 * Created by antianlu on 13-11-16.
 */

var jst = require('jst');

    jst.render('Hello {{ name }}',{name : 'jst template !'});

    jst.renderFile('',{},function(err , ctx){

    });