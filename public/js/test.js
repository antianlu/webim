//http://10.1.2.43

$(function () {
    var socket = io.connect('http://localhost');
    var plat = new WebPlatform.Platform('platform', function () {
    });
    var num = Math.max(plat.settings.spaces, plat.settings.desktoppanel.length);
    //console.log(num);
    for (var i = 0; i < num; i++) {
        var opts = $.extend({}, plat.settings.desktoppanel[0]);
        var desk = plat.addDesktop(opts, i);
        for (var j = 0; j < 1; j++) {
        }
    }
    plat.addDesktopIcon(plat.desktop1, {createWindow: !0});

    plat.DesktopHelper();

    //1.添加一个图标，如果要使用登录验证检查，不能创建窗口
    plat.addDesktopIcon(plat.desktop0, {
        //createWindow: !1,
        iconid:'desktopicon-login',
        icon: 'default/Icons/chat.png',
        title:'IM通信',
        winopts:{
            outerWidth: 320,
            outerHeight: 460,
            minWidth: 320,
            minHeight: 460,
            resizable:!1,
            icon: '',
            title: '',
            btns: {
                maximize: !1,
                fold: !1
            },
            desktopIcon:{
                show:!1
            },
            taskbar:{icon: 'default/Icons/chat.png'}
        },
        dblbefore:function(w){
            //在连接服务器时检查登录
            //总是打开登录窗口
                w.setInnerContainerHTML(TrimPath.processDOMTemplate('loginhtml', login()));
            //如果要显示透明设置到容器里
            //login.setInnerContainerHTML(TrimPath.processDOMTemplate('loginhtml', s));
            //login.setWindowStatus('regular');
        }
    });
    //2.双击图标打开窗口，此项功能由核心代码完成，在如上只要使用参数配置的dblbefore,dblafter可以完成双击创建窗口前后回调并返回window窗口实例

    function loadUserGroup(d)
    {
        if(!d) return;
        var userheader = TrimPath.processDOMTemplate('userheader', {nickname: d.nickname})
        var glist = plat.AeroWindow(plat.desktop0,{
            wid:'aerowindow-'+ d.userid,
            icon: 'default/Icons/chat.png',
            outerWidth: 280,
            outerHeight: 430,
            minWidth: 280,
            minHeight: 430,
            resizable:!1,
            title: '',
            taskbar: {
                position: 'right'
            },
            btns: {
                maximize: !1,
                fold: !1
            },
            toolbar:{show:!0,html:userheader,height:70},
            desktopIcon:{show:!1}
        });
        //glist.setInnerContainerHTML( (TrimPath.processDOMTemplate('imlist', {})));

//        $('.imnavbar li',glist.winObj).each(function(i,o){
//            $(o).click(function(){
//                $('.imlistbox').animate({
//                    left:-(i*w)+'px'
//                },500);
//            });
//        });
        socket.on('groupList', function (data) {
            console.log('grouplist',data);
            glist.setInnerContainerHTML(TrimPath.processDOMTemplate('imlist', data));//渲染列表
            var w = parseInt($('.imcontainer ul.accordion').width());
            // 切换列表
            $('.imnavbar li',glist.winObj).each(function(i){
                $(this).click(function(){
                    $('.imlistbox').stop(true,true).animate({
                        left:-(i*w)+'px'
                    },500);
                });
            });
            //点击分组展开和关闭列表
            // Store variables
            $('.imlistbox ul.accordion',glist.winObj).each(function(){
                var accordion_head = $('li > a',$(this)),
                    accordion_body = $('li > .sub-menu',$(this));
                // Open the first tab on load
                accordion_head.first().addClass('active').next().slideDown('normal');
                // Click function
                accordion_head.on('click', function (event) {
                    // Disable header links
                    event.preventDefault();
                    // Show and hide the tabs on click
                    if ($(this).attr('class') != 'active') {
                        accordion_body.slideUp('normal');
                        $(this).next().stop(true, true).slideToggle('normal');
                        accordion_head.removeClass('active');
                        $(this).addClass('active');
                    }
                });
            });

            //点击列表打开对话窗口
            glist.winObj.on('dblclick','ul.sub-menu li',function(){
                var name = $(this).find('.name').html();
                var img = $(this).find('img').attr('src');
                var toid = $(this).attr('id');
                console.log('from userid',data.userid);
                var porg = $(this).parent().parent().parent().hasClass('group');
                console.log(porg);
                var dialog = plat.AeroWindow(plat.desktop0, {
                    wid: 'aerowindow-' + toid,
                    icon: img,
                    outerWidth: 550,
                    outerHeight: 400,
                    minWidth: 300,
                    minHeight: 300,
                    left: 300,
                    top: 50,
                    desktopIcon: {show: !1},
                    title: '正在与 <b>' + name + '</b> 对话'
                });
                dialog.setInnerContainerHTML(TrimPath.processDOMTemplate('chatwindow', {wid: 'aerowindow-' + toid,type:porg?'group':'private'}));
                dialog.setContainerBackground('/default/chat/imbg1.jpg');
                var inner,top, bottom;
                var dobj = dialog.winObj;
                $('.chatmenubar',dobj).draggable({
                    axis: 'y',
                    distance: 5,
                    cursor: "s-resize",
                    containment: '#'+dobj.id+' .chatleft',
                    start: function () {
                        if($('.chat-content',dobj)[0].scrollHeight==0) $('.chat-window').css('overflow', 'hidden');
                        inner = parseInt($('.win-container',dobj).height())
                        $('.chat-input',dobj).css('paddingTop', '24px');
                    },
                    drag: function (e, ui) {
                        top = ui.position.top;
                        if (inner - top < 60)
                            ui.position.top = inner - 60;
                        top = (ui.position.top / inner) * 100;
                        bottom = 100 - top;
                        $('.chat-window',dobj).height(top + '%');
                        $('.chat-input',dobj).height(bottom + '%');
                        $('.chatmenubar',dobj).css({'top': 'auto', 'bottom': bottom + '%'});
                        //$('.middle').css('bottom',bottom+'%');
                    },
                    stop: function () {
                        $('.chat-window',dobj).css('overflow-y', 'auto');
                    }
                });
                var msg = $('.chat-content', dobj),
                    chattop = $('.chat-window',dobj);
                //接受从XX用户发来的消息内容
                socket.on('privateMessage',function(data,fn) {
                    var body = data.body;
                    console.log('接收私聊信息成功：',body.from,body.msg);
                    msg.append('<div class="rightd"><div class="rightimg"><img height="30" width="30" src="' + dobj.find('.win-title img').attr('src') + '" style="float:left;margin-left:10px"/></div><div class="speech right"> ' + body.msg + '<br>&nbsp;</div></div>');
                    chattop.scrollTop(chattop[0].scrollHeight);
                    fn(true);//表示成功收到信息，用服务器发送回执
                });

                dobj.on('click', 'li.sendmsgbtn', function () {
                    var fromid = data.userid;
                    //{cid:1,channel:1,body:{from:'1',to:'2’,msg:’dfsdfs’},onFn:’calll’}
                    var c = {
                        id:1,
                        channel:'1',
                        body:{
                            from:fromid,
                            to:toid,
                            msg:$('.chatcontent', dobj).val()
                        }
                    }
                    msg.append('<div class="leftd"><div class="leftimg"><img height="30" width="30" src="' + data.icon + '" style="float:left;margin-left:10px"/></div><div class="speech left"> ' + c.body.msg + '<br></div></div>');
                    chattop.scrollTop(chattop[0].scrollHeight);
//                    msg.animate({
//                        scrollTop:msg[0].scrollHeight
//                    },'fast');
                    socket.emit('privateMessage', c,function(reciept){
                        console.log(c);
                        if(reciept)
                        {
                            console.log('对方成功接收！');
                        }

                    });
                })
            })
        })
        socket.emit('sendGroup',{});
        return glist;
    }

    plat.platObj.on('click','.login-btn',function(){
        var uname = $.trim($('#signup_name').val());
        var pwd  = $('#signup_password').val();
        var logininfo = {username:uname,password:pwd,type:'login'};
        socket.emit('login',logininfo,function(reciept,data){
            test.call(this,data);
            console.log(data,reciept);
            if(reciept){
                //登录成功加载用户分组列表
                loadUserGroup(data);
                //$('#aerowindow-login').remove();
            }
            else
            {
                console.log('reciept',reciept);
                //这是一个外接的回调函数，在这个事件里不会创建窗口，待要准备的事情处理完毕后调用回调函数的第二个参数，返回值一个窗口实例

            }
        })
        //w.setInnerContainerHTML(TrimPath.processDOMTemplate('imlist', {}))
    })
    //login();
    //register();
    function login()
    {
        var settings  =
        {
            title:'用户登录',
            icon:'/images/login/people.jpg',
            username:'请输入用户名/QQ/ID',
            password:'请输入密码',
            button:'登录'
        }
        return settings;
    }
    function register()
    {
        var settings={
            title:'用户注册',
            icon:'/images/login/people1.png',
            username:'可输入用户名或QQ号',
            password:'请输入登录密码',
            button:'注册'
        }
        return authWindow(settings);
    }
    function authWindow(s){

        var login = plat.AeroWindow(plat.desktop0,{
            englishTitle:'login',
            outerWidth: 320,
            outerHeight: 460,
            minWidth: 320,
            minHeight: 460,
            resizable:!1,
            status:'minimized',
            content: '',
            icon: '',
            title: '',
            btns: {
                maximize: !1,
                fold: !1
            },
            desktopIcon:{
                show:!1
            },
            taskbar:{icon: 'default/Icons/chat.png'}
        });
        //如果要显示透明设置到容器里
        login.setInnerContainerHTML(TrimPath.processDOMTemplate('loginhtml', s));
        login.setWindowStatus('regular');
    }

    socket.on('message',function(data){
        console.log(data);
    })
    socket.on('disconnect', function () {
    })
    socket.on('reconnect', function () {
    })
    socket.on('reconnecting', function () {
    })
    socket.on('reconnect_fail', function () {
    })

    socket.on('news', function (data) {
        console.log(data);
        socket.emit('my other event', { my: 'data' });
    });

    socket.on('groupMessage', function (from,msg) {

    });

    socket.on('online_notice', function (data) {

    });

    $('#submit').click(function () {
        var name = $('#username').val();
        var pwd = $('#password').val();
        var d = {username: name, password: pwd}
        console.log(JSON.stringify(d));
        $.ajax({
            url: '/register',
            type: 'POST',
            data: JSON.stringify(d),
            dataType: 'json',
            contentType: 'application/json',
            success: function (data) {
                console.log(data);
            }
        });
    });

    function test()
    {
        console.log(this);
        console.log(arguments);
    }
});
