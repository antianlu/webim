/**
 * Created by antianlu on 14-1-5.
 */

$(function () {
    var socket = io.connect('http://localhost');
    socket.on('connect', function () {
        socket.emit('active', {id: 1});
    });
    socket.on('disconnect', function () {
    })
    socket.on('reconnect', function () {
    })
    socket.on('reconnecting', function () {
    })
    socket.on('reconnect_fail', function () {
    })
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
    plat.addDesktopIcon(plat.desktop_1, {createWindow: !0});

    plat.DesktopHelper();
    // 桌面右键菜单
    plat.AeroContextmenu({
        scope:'#platform',
        cancel:['.aerowincontainer','.aerotaskbar','.iconscontainer'],
        items:[{
            id:'Item1',
            text:'刷新',
            icon:'default/contextmenu/icons/Sync.png',
            action:function(){alert('first-item1')}//按照项添加
        },
            {
                id:'Item2',
                text:'桌面日历',
                icon:'default/contextmenu/icons/Calendar.png',
                action:function(e){console.log(e);alert('Second-item2')}//按照项添加
            },
            {
                id:'Item1',
                text:'设置',
                icon:'default/contextmenu/icons/Pinion.png',
                disable:!1,//新增加true/false
                action:function(){alert('first-item3')}//按照项添加
            },
            {
                id:'Item2',
                text:'保存',
                icon:'default/contextmenu/icons/Save.png',
                action:function(e){console.log(e);alert('Second-item4')}//按照项添加
            }]
    });
    var loginsettings =
    {
        title: '用户登录',
        icon: '/images/login/people.jpg',
        username: '请输入用户名/QQ/ID',
        password: '请输入密码',
        button: '登录'
    }
    //1.添加一个图标，如果要使用登录验证检查，不能创建窗口
    plat.addDesktopIcon(plat.desktop_0, {
        //createWindow: !1,
        iconid: 'desktopicon-login',
        icon: 'default/Icons/chat.png',
        title: 'IM通信',
        winopts: {
            outerWidth: 320,
            outerHeight: 460,
            minWidth: 320,
            minHeight: 460,
            resizable: !1,
            icon: '',
            title: '',
            maximize:{show:!1},
            fold:{show:!1},
            desktopIcon: {
                show: !1
            },
            taskbar: {icon: 'default/Icons/chat.png'}
        },
        dblbefore: function (w) {
            //总是打开登录窗口
            w.setInnerContainerHTML(TrimPath.processDOMTemplate('loginhtml', loginsettings));
//            var logininfo = {id: 1, body: {username: 888, password: 'im8'}, onFn: 'doLogin'};
//            socket.emit('doLogin', logininfo, function (data) {
//                if (data.code == 200) {
//                    loadIMList(data.body);
//                }
//                else {
//                    console.log(data.error);
//                }
//            })
        }
    });
    plat.desktop_0.addHtml('<div style="position: relative; z-index: 1">hello world</div>');

//    plat.AeroWindow(plat.desktop_0,{
//        wid:'aerowindow-msgtip',
//        outerWidth: 200,
//        outerHeight: 100,
//        minWidth: 100,
//        minHeight: 100,
//        resizable: !1,
//        icon: '',
//        title: '消息提示',
//        header:{height:15},
//        container:' ',
//        btns:{
//            maximize:!1,
//            minimize:!1,
//            regular:!1,
//            fold:!1
//        },
//        desktopIcon: {
//            show: !1
//        },
//        taskbar: {show:!1}
//    });

    plat.platObj.on('click', '.login-btn', function () {
        var uname = $.trim($('#signup_name').val());
        var pwd = $('#signup_password').val();
        var logininfo = {id: 1, body: {username: uname, password: pwd}, onFn: 'doLogin'};
        socket.emit('doLogin', logininfo, function (data) {
            if (data.code == 200) {
                loadIMList(data.body);
            }
            else {
                console.log(data.error);
            }
        })
    });

    function loadIMList(d) {
        var user = d.userinfo;
        var userheader = TrimPath.processDOMTemplate('userheader', user);
        //创建显示列表的窗口
        var imlist = plat.AeroWindow(plat.desktop_0, {
            wid: 'aerowindow-' + user.userid,
            icon: 'default/Icons/chat.png',
            outerWidth: 300,
            outerHeight: 430,
            minWidth: 280,
            minHeight: 430,
            resizable: !1,
            title: '',
            container: {html:TrimPath.processDOMTemplate('imlist', d.group),style:'overflow-y:auto'},
            taskbar: {
                position: 'right'
            },
            maximize:{show:!1},
            fold:{show:!1},
            toolbar: {show: !0, html: userheader, height: 100},
            desktopIcon: {show: !1}
        });
        var wobj = imlist.winObj;

        plat.AeroContextmenu({
            scope:'.usergroup>li>a',
            items:[{
                id:'Item1',
                text:'添加分组',
                icon:'default/contextmenu/icons/Person.png',
                disable:!1,//新增加true/false
                action:function(t){
                    console.log(t);
                    alert('first-item3')
                }//按照项添加
            },
                {
                    id:'Item2',
                    text:'重命名',
                    icon:'default/contextmenu/icons/Left-right.png',
                    action:function(e){console.log(e);alert('Second-item4')}//按照项添加
                }]
        })

        var w = parseInt($('.imcontainer ul.accordion').width());
        //列表切换
        $('.imnavbar li', wobj).each(function (i) {
            $(this).click(function () {
                $('.imlistbox').stop(true, true).animate({
                    left: -(i * w) + 'px'
                }, 500);
            });
        });
        //点击分组展开和关闭列表
        $('.imlistbox ul.accordion', wobj).each(function () {
            var _self = this;
            var accordion_head = $('li > a.ugl', $(this)),
                accordion_body = $('li > .sub-menu', $(this));
            accordion_head.first().addClass('active').next().slideDown('normal');
            accordion_head.on('click', function (event) {
                event.preventDefault();
                if (!$(this).hasClass('active')) {
                    accordion_body.slideUp('normal');
                    $(this).next().stop(true, true).slideToggle('normal');
                    accordion_head.removeClass('active');
                    $(this).addClass('active');
                }
            });
        });

        $('.usergroup ul.sub-menu li', wobj).dblclick(function (event) {
            event.preventDefault();
            var ths = $(this),
                uname = ths.find('.uname').html(),
                icon = ths.find('img').attr('src'),
                toid = ths.attr('id').split('-')[1];
            var d = {name: uname, icon: icon, selficon: user.icon, fromid: user.userid, toid: toid, flag: 'private'};
            chitChat(d);

        });

        $('.groups ul.sub-menu li', wobj).dblclick(function (event) {
            event.preventDefault();
            var ths = $(this),
                gname = ths.find('.gname').html(),
                icon = ths.find('img').attr('src'),
                groupid = Number(ths.attr('id').split('-')[1]);
            var d = {name: gname, icon: icon, selficon: user.icon, fromid: user.userid, toid: groupid, flag: 'group'};
            socket.emit('loadGroupNumber', {groupid: groupid}, function (data) {
                console.log(data);
                if (data.code == 200) {
                    chitChat($.extend(d, data.body));
                }
            })
        });
    }

    socket.on('message', function (data, fn) {
        //接收从服务器发来的消息格式：{id:1,code:200,error:null,body:{form :1,to:2,msg:'aaaaa'}}
        //接收来的消息首先要存储，提示或打开窗体
        //1.在图标出显示条数，同时在联系人列表中显示各自的消息条数
        //2.在每个列表top列表显示总消息条数，在各自列表显示消息条数 ||
        //3.来消息后弹出窗题，显示信息。
        console.log('接收到从服务器端发来的消息：', data);
        var body = data.body,icon,
            wid = body.flag == 'group'?body.to:body.from,
            wo = $('#aerowindow-' +wid ),
            chatmsg = $('.chat-content', wo),
            chatbox = $('.chat-window', wo);
        if(body.flag == 'group')
        {
            icon = $('.numberlist #user-'+body.from,wo).find('img').attr('src');
        }
        else
        {
            var imnotice = $('#taskbar-'+body.to);
            var msgnum = $('.imnotice',imnotice);
            if(msgnum.length === 0)
            {
               imnotice.append('<div class="imnotice">1</div>');
            }
            else
            {
                msgnum.html(parseInt(msgnum.html(),10) + 1);
            }
            icon = wo.find('.win-title img').attr('src');

        }
        if (data.code == 200) {
            console.log('接收信息成功：', body.from, body.msg);
            addChatTime(chatmsg,body.sendtime);
            chatmsg.append('<div class="leftd"><div class="leftimg"><img height="30" width="30" src="' + icon + '" style="float:left;margin-left:10px"/></div><div class="speech left"> ' + body.msg + '<br></div></div>');
            chatbox.scrollTop(chatbox[0].scrollHeight);
            fn(true);//表示成功收到信息，用服务器发送回执
        }
    });

    function chitChat(d) {
        //打开对话框
        var dialog = plat.AeroWindow(plat.desktop_0, {
            wid: 'aerowindow-' + d.toid,
            icon: d.icon,
            outerWidth: 550,
            outerHeight: 400,
            minWidth: 300,
            minHeight: 300,
            left: 300,
            top: 50,
            resizable:{
              start:function(){},
              stop:function(){alert('STOP')}
            },
            container: {html:TrimPath.processDOMTemplate('chatwindow', d)},
            desktopIcon: {show: !1},
            title: '正在与 <b>' + d.name + '</b> 对话'
        });
        dialog.setContainerBackground('/default/chat/imbg1.jpg');
        var dobj = dialog.winObj,
            top, bottom, inner;
        //TODO:聊天窗口工具栏拖放
        $('.chatmenubar', dobj).draggable({
            axis: 'y',
            distance: 5,
            cursor: "s-resize",
            containment: '#' + dobj.id + ' .chatleft',
            start: function () {
                if ($('.chat-content', dobj)[0].scrollHeight == 0) $('.chat-window').css('overflow', 'hidden');
                inner = parseInt($('.win-container', dobj).height())
                $('.chat-input', dobj).css('paddingTop', '24px');
            },
            drag: function (e, ui) {
                top = ui.position.top;
                if (inner - top < 60)
                    ui.position.top = inner - 60;
                top = (ui.position.top / inner) * 100;
                bottom = 100 - top;
                $('.chat-window', dobj).height(top + '%');
                $('.chat-input', dobj).height(bottom + '%');
                $('.chatmenubar', dobj).css({'top': 'auto', 'bottom': bottom + '%'});
            },
            stop: function () {
                $('.chat-window', dobj).css('overflow-y', 'auto');
            }
        });

        dobj.on('click', 'li.sendmsgbtn', function () {
            var chatmsg = $('.chat-content', dobj),
                chatbox = $('.chat-window', dobj),
                sendmsg = $('.chatcontent', dobj).val();
            //{cid:1,channel:1,body:{from:'1',to:'2’,msg:’dfsdfs’},onFn:’calll’}
            var msg = {
                id: 1,
                channel: '1',
                body: {
                    from: d.fromid,
                    to: d.toid,
                    msg: sendmsg,
                    flag: d.flag
                }
            }
            //left icon is myself icon
            chatmsg.append('<div class="rightd"><div class="rightimg"><img height="30" width="30" src="' + d.selficon + '" style="float:left;margin-left:10px"/></div><div class="speech right"> ' + sendmsg + '<br></div></div>');
            chatbox.scrollTop(chatbox[0].scrollHeight);
            socket.emit('message', msg, function (reciept) {
                if (reciept) {
                    console.log('对方成功接收！');
                }
            });
            $('.chatcontent', dobj).val('');
        })
    }

    function addChatTime(o,ct)
    {
        o.append('<div class="centerd"><div class="centertime">'+ct+'</div></div>')
    }
})