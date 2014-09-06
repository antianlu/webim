/**
 * Created by antianlu on 13-12-23.
 */

var gp  = require('../controls/im-group');
module.exports = function(app){
    app.get('/group',gp.findGroupList);
   // app.get('/group:groupid',gp.findGroupById)
}