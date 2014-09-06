// JavaScript Document

(function ($, window, undefined) {

    var version = '0.1',
        fn = function () {
        },
        PLATFORM_NUM = 1,//平台系统个数，以至于可以系统中的虚拟系统
        DESKTOP_PANEL = {},
        TASKLIST = {};
    // TODO: 会根据配置文件调
    var settings =
    {
        spaces: 4,//多桌面数量
        sharespace: !1,//多人共享桌面是否开启
        desktoppanel: [
            {
                desktop: {
                    show: !0,
                    aerowindows: {
                        show: !0,
                        items: []
                    }
                },
                desktopicons: {
                    show: !0,
                    items: []
                },
                focus: !0
            }
        ],
        desktophelper:{show:!0},
        navbar: {show: !0},
        wallpapers: {show: !0},
        startmenu: {show: !0},
        menuba: {show: !0},
        taskbar: {
            show: !0,
            height: 40,
            position: 'bottom'
        }
    }
    //顶级Platform
    var Platform = function () {
        var args = arguments,
            self = this,
            options = {},
            modules = [],
            FOCUS_DESKTOP_OBJ = null;//焦点桌面对象
        FOCUS_DESKTOP_INDEX = 0;
        for (var i = 0, l = args.length; i < l; i++) {
            if (typeof args[i] == 'string') {
                this.id = args[i];
            }
            else if (typeof args[i] == 'object') {
                options = args[i];
            }
            else if (args[i] instanceof Array) {
                modules = args[i];
            }
            else if (typeof args[i] == 'function') {
                this.callback = args[i];
            }
        }
        //if(this.id) throw Error('need top of id');
        this.settings = $.extend({}, settings, options);
        this.platObj = $('#' + this.id);

        // 需要存储每个桌面实例
        this.DESKTOPS_OBJ = {};
        this.DESKTOPS_INST = {};
        this.DESKTOPS_IDS = [];

        $(window).resize(function () {
            var i = 0;
            $.each(self.platObj.data('desktops'), function () {
                i++;
                this.css({width: $(window).width(), height: $(window).height()});
            });
            $('.desktop-panel',self.platObj).css({width:$(window).width() * i,height:$(window).height()});
        })
        if (this.settings.taskbar) {
            initTaskbar(this.platObj);
        }
        //if(this.settings.desktophelper.show)
//		{
//			DesktopHelper.apply(this);
//		}
//        this.CreateAeroWindow = fn;
//        this.ContextMenu = fn;
//        this.TaskBar = fn;
//        this.Menubar = fn;
//        this.WebPage = fn;
//        this.StartMenu = fn;
//        this.FocusDesktop = $('#desktop-' + PLATFORM_NUM + '-1');//默认设置每个平台界面的第一个桌面为焦点
    }

    Platform.fx = Platform.prototype =
    {
        constructor: Platform,
        addDesktop: function (options) {
            var arr = this.platObj.data('desktops') || []
            var i = arr.length;
            var desktop = new Desktop(this, options, i);
            desktop.desktopIndex = i;
            return desktop;
        },
        addDesktopIcon: function (desktop, opts) {
            var self = this;
            //new DesktopIcon(self,desktop,opts);
            DesktopIcon.apply(null, [this,desktop, opts]);
        },
        AeroWindow: function (desktop, options) {
            var opts = options || {},
                wid = opts.wid || 'aerowindow-' + getRandom();
            if($('#'+wid).length>0) {
                var wo = desktop[wid];
                wo.set('status','minimized');
                wo.setWindowStatus('regular');
                return desktop[wid] ;
            }
            opts.wid = wid;
            var aero  = desktop['aerowindowids'] = desktop['aerowindowids'] || [];
            aero.push(wid);
            var wInst = new aerowindowPlugin(this,desktop, opts);
            desktop[wid] = wInst;
            return wInst;
        }
    }

    // 添加对平台的扩展支持
    Platform.extend = Platform.fx.extend = $.extend;

    function Desktop(root, options, index) {
        //this.settings = root.settings;
        var self = this,
            topObj = root.platObj,
            defaults = {
                index:index,
                left:$(window).width()*index
            },
            opts = $.extend({}, defaults, options || {});

        if ($('.desktop-panel', topObj).length == 0){ topObj.append('<div class="desktop-panel"></div>');}
        if($('.desktopbarhelper',topObj).length == 0){topObj.append('<div class="desktopbarhelper"><ul class="desktopbar"></ul></div>');}
        var dtid = 'desktop-' + PLATFORM_NUM + '-' + index;
        var helper = $('.desktopbarhelper ul.desktopbar',topObj);
        $('.desktop-panel', topObj).append('<div class="desktop" index="'+index+'" id="' + dtid + '">');
        if(index ==0){$('.desktop',topObj).addClass('current').show()}
        helper.append('<li index="'+index+'"><a href="#">'+index+'</a></li>');
        opts.iconid = dtid;
        var desktop = $('#' + dtid, topObj);
        root['desktop_' + index] = this;
        //保存每个桌面的对象	
        if ((topObj.data('desktops')) == null) {
            topObj.data('desktops', [desktop]);
        }
        else {
            topObj.data('desktops').push(desktop);
        }
        $('#' + dtid).css({
            'width': $(window).width(),
            'height': $(window).height()
        });
        $('.desktop-panel', topObj).css('width',$(window).width() * (index +1));
        this.desktopObj = desktop;
        //可以自由向桌面添加层
        this.addHtml = function (html) {
            desktop.append(html);
            return self;
        }
        this.addDesktopIcon = function (opts) {
            DesktopIcon.apply(this, [root,self, opts]);
            //new DesktopIcon(root,self,opts);
            return self;
        };
        //返回本桌面配置文件，用于保存
        this.getOptions = function () {
            return opts;
        };

        this.getWindowFocus = function () {
            $.each($('.aerowindow-panel', desktop).data('aerowindows'), function (i, v) {
                if (v.isFocus()) {
                    return v;
                }
            });
            return self;
        };
        this.setWindowFocus = function (wobj) {
            windowFocus(wobj);
            return self;
        };

        this.removeDesktopIcon = function (iconobj) {
            //移除Icon同时，移除创建的窗口
        };
        this.openWindow = function (wobj) {
            resizeWidnow('');
        };
//		this.editIcon = function(newOpts){}
        this.getCollection = function () {
            //get icons
            //get icons html lists
        };
        this.reflesh = function () {
            // load from server by API
        };
//		this.contextMenu = function(itms){};
        this.get = function (key) {
            return opts[key];
        };
        this.set = function (key, val) {
            opts[key] = val;
        };
        this.isFocus = function () {
            // 获取正在使用窗口对象
            return false;
        };
        $.extend(this,opts);
        //DesktopHelper.apply(root.obj);
    }

    Desktop.fx = Desktop.prototype = {};

    //添加对桌面的扩展支持
    Desktop.extend = Desktop.fx.extend = $.extend;

    function DesktopIcon(root, dtop, options) {
        var o = options||{};
        var defaults = {
                iconid: 'desktopicon-' + getRandom(),
                icon: 'default/Icons/alert.png',
                title: getRandom(),
                showDeskIcon: !0,
                createWindow: !1,
                draggable:!0,
                dblclick:$.noop
            },
            self = this;
        opts = $.extend({}, defaults,o),
            temp = opts.title.split(' '),
            title = '',
            this.desktopObj = desktop = dtop.desktopObj;
        this.desktopIndex = dtop.desktopIndex;

        $.each(temp, function (index, value) {
            if (value.length > 17) {
                title += value.substr(0, 17) + '...';
            }
            else {
                title += value + ' ';
            }
        });
        if ($('.desktopicons', desktop).length == 0)
            desktop.append('<div class="desktopicons" id="desktopicons-' + getRandom() + '"><ul></ul></div>');
        var icons = $('.desktopicons ul', desktop);
        //把模板添加到desktopicons 容器
        icons.append(TrimPath.processDOMTemplate('iconcontianer', opts));
        var iconObj = $('#' + opts.iconid);
        var dicons =  $('.desktopicons li.iconscontainer');
        iconObj.click(function(){
            dicons.removeClass('mouseclicked');
            dicons.removeClass('mouseout');
            $(this).addClass('mouseclicked');
        })
        dicons.bind("mouseover mouseout",function(event){//鼠标经过桌面图标时
            if(event.type=='mouseover'){
                if($(this).hasClass('mouseout'))
                    $(this).removeClass('mouseout');
                $(this).addClass('mouseover');
            }
            else{
                $(this).removeClass('mouseover');
                if($(this).hasClass('mouseclicked'))
                    $(this).addClass('mouseout');
            }
        });
        if(opts.draggable) {
            iconObj.draggable({
                helper: "original",
                start: function () {
                    dicons.removeClass('mouseclicked');
                    dicons.removeClass('mouseout');
                    $(this).addClass('mouseclicked');
                }
            });
        }

        var winInst = undefined;
        var wopts = o.winopts || {};
        //var wid = 'aerowindow-' + opts.iconid.split('-')[1];
        this.createWindow = function(options)
        {
            var defauts = {
                desktopIcon: {show: !1},
                status:'regulared'
            }

            var winopts = $.extend({},defauts,wopts,options || {});
            if($('#'+winopts.wid).length>0) return dtop[winopts.wid] ;//if already create return
            winInst = new aerowindowPlugin(root,dtop, winopts);
            dtop[winopts.id] = winInst;
            var aero  = dtop['aerowindowids'] = dtop['aerowindowids'] || [];
            aero.push(winopts.wid);
            return winInst;
        }

        //在创建图标的时候是否同时创建窗口
        if (opts.createWindow) {
            var opt ={ wid: 'aerowindow-' + opts.iconid.split('-')[1],
                icon:opts.icon}
            self.createWindow(opt);
        }

        iconObj.dblclick(function (e) {
            var wopt ={
                wid: 'aerowindow-' + $(this).attr('id').split('-')[1],
                icon:$('img',this).attr('src')
            }

            //winInst = dtop[wopt.wid];

            function before(fn)
            {
                if(winInst) fn();
                if(!winInst) (winInst = self.createWindow(wopt)) && o.dblbefore && o.dblbefore(winInst) && o.dblafter && o.dblafter(winInst) && fn() ;
                else o.dblafter && o.dblafter(winInst) && fn();
            }
            before(function(){
                if(typeof dtop['dblclick-'+wopt.wid] == 'function') dtop['dblclick-'+wopt.wid](e);
            })
        })
        this.platObj = root.platObj,
            this.desktopiconObj = iconObj;
        return this;
    }

    DesktopIcon.fx = DesktopIcon.prototype = {}
    //添加对桌面图标的扩展支持
    DesktopIcon.extend = DesktopIcon.fx.extend = $.extend;

    //设置活动窗口为焦点窗口
    function windowFocus(winobj) {
        $(".aerowindow").removeClass('active');
        //$(".aerowindow").find('.iframeHelper').css({'display':'block'});
        //aerowin.find('.iframeHelper').css({'display':'none'});
        $(".aerowindow", winobj).addClass('active');
        /*$("#Taskbar .Taskbar-Item").removeClass('active');
         $('#Taskbar'+this.id).addClass('active');
         $('#Taskbar'+this.id).css({display:'block'});*/

        if (($('body').data('winmaxzindex')) == null) {
            $('body').data('winmaxzindex', winobj.css('z-index'));
        }
        i = parseInt($('body').data('winmaxzindex'));
        i++;
        winobj.css({'z-index': i, 'display': 'block'});
        $('body').data('winmaxzindex', winobj.css('z-index'));
    }

    function aerowindowPlugin(root,dtop, options) {
        var self = this,
            top = root.platObj,
            desktop = dtop.desktopObj,
            settings = root.settings,
            cicon = options.icon || 'default/Icons/default.png',
            defaults = {
                wid: this.wid,//指定窗体id
                title: 'AeroWindow',//标题
                icon: cicon,//默认窗口左上角图标和桌面图标已经任务栏图标
                content: '',//窗体内容
                container:{html:'',style:''},//透明容器内容，与content只能二选一
                draggable: {enable:!0},//拖动窗体
                resizable: {enable:!0},//是否可以改变窗口大小
                status: 'regulared',//窗体状态,fold : 0x1,minimized : 0x2,regulared : 0x3,maximized : 0x4,closed : 0x5
                mode: 'window',//窗口模式,dialog,iframe,html
                custorm: 1,//1:window -1:完全自定义只保留拖拽改变窗口大小
                effectSpeed: 300,//效果延迟时间,单位是毫秒
                effectMode: 'easeInOutQuart',//特效方式
                hyalineSpeed: 300,//透明效果时间

                top: 100,//{center/值}初始时离桌面最上边位置
                left: 200,//{center/值}初始时离桌面最左边位置

                outerWidth: 450,//{值}外宽
                outerHeight: 300,//{值}外高
                minWidth: 250,//改变窗口大小时的最小宽度
                minHeight: 200,//改变窗口大小时的最小高度
                borderWidth: 18,//边框占用宽度，即WindowBorderWidth
                borderHeight: 23,//上下边框占用高度和内容窗口的margin-top 5像素
                closable:{
                    show:!0//显示关闭按钮
                },
                regular:{
                    show:!0//显示常规窗体控制按钮
                },
                maximize:{
                    show:!0//显示最大化按钮
                },
                minimize:{
                    show:!0//显示最小化按钮
                },
                fold:{
                    show:!0//显示折叠按钮
                },
                setting:{show:!0,html:''},
                header://窗口头
                {
                    show: !0,
                    height: 22
                },
                toolbar://工具栏
                {
                    show: !1,
                    html: '',
                    height: 20
                },
                statusbar://状态栏
                {
                    show: !1,
                    html: '状态栏',
                    height: 20
                },
                taskbar: {
                    showIcon: !0,//是否添加到taskbar
                    position: 'left',//Icon在任务栏中的位置，左边和右边
                    icon: cicon,//图标默认和窗口图标相同,
                    width: 32,
                    height: 32,
                    html:''//额外扩展
                },
                desktopIcon: {
                    show: !0,
                    icon: cicon,
                    title: ''
                },
                mouseCursor: 25,//鼠标指针宽度
                callback: $.noop//回调函数
            },
        //深度拷贝
            opts = $.extend(true, {}, defaults, options || {});
        //添加窗口包裹容器
        if ($('.aerowindow-panel', desktop).length == 0) {
            desktop.append('<div class="aerowindow-panel"></div>');
        }

        //本窗口属于第几个桌面
        opts.desktopIndex = dtop.index;
        this.options = opts;
        this.id = opts.wid;
        this.platObj = root.platOjb;
        // load template
        $('.aerowindow-panel', desktop).append(TrimPath.processDOMTemplate('windowtemplate', opts));
        var winobj = this.winObj = $('#' + opts.wid, desktop),
            container = winobj.find('.win-container'),
            aerowin = winobj.find('.aerowindow'),
            winheader = winobj.find('.win-header'),
            content = winobj.find('.win-content'),
            toolbar = winobj.find('.win-toolbar'),
            statusbar = winobj.find('win-statusbar'),
            maximize = winobj.find('.maxbtn'),
            minimize = winobj.find('.minbtn'),
            fold = winobj.find('.foldbtn'),
            regular = winobj.find('.regbtn'),
            closable = winobj.find('.closebtn'),
            iframe = container.find('iframe'),
            effect = {queue: true, duration: opts.effectSpeed, easing: opts.effectMode},
            commonno = opts.wid.split('-')[1],
        //窗口内容实际高度=外高-两边border-标题高-工具栏-状态栏
            ht = (opts.header.show ? opts.header.height : 0) + (opts.statusbar.show ? opts.statusbar.height : 0) + (opts.toolbar.show ? opts.toolbar.height : 0) + opts.borderHeight;
        this.container =container;
        this.content = content;
        this.iframe = iframe;
        var cHeight = opts.outerHeight - ht,
        //窗口内容实际宽度= 外宽-两边border
            cWidth = opts.outerWidth - opts.borderWidth;

        winobj.css({
            'z-index': 1,
            'height': opts.outerHeight + 'px',
            'width': opts.outerWidth + 'px',
            'top': opts.top + 'px',
            'left': opts.left + 'px',
            'position': 'absolute'
        });
        container.css({
            'height': cHeight + 'px',
            'width': cWidth + 'px'
        });
        //保存改变大小之前的窗口位置
        var saveBeforeSize = function () {
            opts.outerHeight = winobj.height();
            opts.outerWidth = winobj.width();
            opts.top = winobj.offset().top;
            opts.left = winobj.offset().left;
        };

        //拖拽窗口
        if (opts.draggable.enable) {
            winobj.draggable({
                distance: 3,
                cancel: '.win-container',
                opacity: 0.8,
                cursor: 'move',
                start: function (e) {
                    if (opts.resizable.enable && (opts.status == 'maximized' || opts.status == 'minimized')) {
                        self.resize('restoreToMouse');
                    }
                    windowFocus(winobj);//设置拖动窗体为焦点
                    //此助手的作用是解决下拉遮挡问题
                    //aWin.find('.iframeHelper').css({'display':'block'});
                    iframe.css('visibility', 'hidden');
                },
                drag: function () {//背景移动
                    _top = -1 * $(this).offset().top;
                    _left = -1 * $(this).offset().left;
                    aerowin.css({backgroundPosition: _left + 'px ' + _top + 'px'});
                },
                stop: function (e) {
                    //opts.top = winobj.offset().top;
                    //opts.left = winobj.offset().left;
                    if (e.pageY <= 0 && opts.maximize.show) {
                        self.resize('maximize');
                    }
                    //aWin.find('.iframeHelper').css({'display':'none'});
                    winobj.draggable({cursorAt: null});
                    iframe.css('visibility', 'visible');
                }
            });
        }

        //改变窗口大小
        if (opts.resizable.enable) {
            winobj.resizable({
                minHeight: opts.minHeight,
                minWidth: opts.minWidth,
                alsoResize: container,
                handles: 'n, e, s, w, ne, se, sw, nw',
                start: function (e, ui) {
                    iframe.css('visibility', 'hidden');
                    windowFocus(winobj);
                    opts.resizable.start && typeof opts.resizable.start === 'function' && opts.resizable.start(e,ui);
                },
                stop: function (e, ui) {
                    cHeight = container.height();
                    cWidth = container.width();
                    iframe.css('visibility', 'visible');
                    opts.resizable.stop && typeof opts.resizable.stop === 'function' && opts.resizable.stop(e,ui);
                }
            });
        }

        //创建窗口同时向桌面添加图标
        if (opts.desktopIcon.show) {
            var iconopt = {
                showDeskIcon: opts.desktopIcon.show,
                createWindow: !1,
                iconid: 'desktopicon-' + commonno
            }
            DesktopIcon(root,dtop, $.extend(iconopt,opts.desktopIcon));
        }
        // iframe 窗口特殊处理
        if (opts.model == 'iframe') {
            content.addClass('loading');
            iframe.css('visibility', 'hidden');
            //content.append('<div class="iframeHelper"></div>');
            iframe.attr('src', opts.content);
            iframe.load(function () {
                $(this).show().css('visibility', 'visible');
            })
        }

        function setBtnCss(o) {
            $.each(o, function (i, v) {
                var key, ob, bl;
                $.each(v, function (k, vl) {
                    typeof vl == 'object' ? (key = k, ob = vl) : bl = vl;
                })
                //console.log(key,bl);
                opts[key] ? (ob.css('display', bl ? 'block' : 'none')) : !!0;
            });
        }

        this.resize = function (status) {
            //正常化的时候，保存窗口的位置
            if (opts.status == 'regulared') saveBeforeSize();
            opts.beforeStatus = opts.status;
            switch (status) {
                case 'regular':
                    setBtnCss([
                        {fold: fold, show: !0},
                        {minimize: minimize, show: !0},
                        {regular: regular, show: !1},
                        {maximize: maximize, show: !0}
                    ]);
                    opts.status = 'regulared';
                    winobj.css('display', 'block');
                    container.css('display', 'block');
                    if(opts.top<0) opts.top = $(window).height()/2 - opts.outerHeight/2;
                    if ($.browser.msie) {
                        winobj.stop().animate({
                            width: opts.outerWidth,
                            height: opts.outerHeight,
                            top: opts.top + $(window).scrollTop(),
                            left: opts.left + $(window).scrollLeft()}, effect);
                    }
                    else {
                        winobj.stop().animate({
                            opacity: 1,
                            width: opts.outerWidth,
                            height: opts.outerHeight,
                            top: opts.top,
                            left: opts.left}, effect);
                    }
                    container.stop().animate({
                        opacity: 'show',
                        width: cWidth,
                        height: cHeight}, effect);
                    winobj.draggable({cursorAt: null});
                    opts.resizable.enable && winobj.resizable('enable');

                    break;

                case 'minimize':
                    setBtnCss([
                        {name: fold, show: !1},
                        {name: minimize, show: !1},
                        {name: regular, show: !1},
                        {name: maximize, show: !1}
                    ]);

                    opts.status = 'minimized';

                    if ($.browser.msie) {
                    }
                    else {
                        winobj.animate({opacity: 'hide'}, effect);
                    }
                    winobj.animate({
                            width: opts.minWidth,
                            height: opts.minHeight,
                            top: -100 + $('#taskbar-' + commonno).offset().top,
                            left: $('#taskbar-' + commonno).offset().left / 2
                        },
                        {
                            queue: true,
                            duration: opts.effectSpeed,
                            easing: opts.effectMode,
                            complete: function () {
                                winobj.css('display', 'none');
                                container.css('display', 'none');
                            }
                        }
                    ).draggable({
                            cursorAt: {cursor: "crosshair",
                                top: opts.mouseCursor,
                                left: (opts.outerWidth / 2)}
                        });
                    opts.resizable.enable && winobj.resizable('disable');

                    container.animate({
                        width: opts.minWidth - opts.borderWidth,
                        height: opts.minHeight - ht
                    }, effect);
                    break;

                case 'maximize':
                    if (container.css('visibility') == 'hidden') {
                        container.css({'visibility': 'visible'});
                    }
                    //if($.browser.msie){}//IE do nothing
//				else{winobj.animate({opacity:'fast'},effect);}
                    // winobj.draggable({disabled: true});
                    winobj.css('display', 'block');
                    container.css('display', 'block');
                    winobj.stop().animate({
                        width: $(window).width(),
                        height: (settings.taskbar.show ? $(window).height() - settings.taskbar.height : $(window).height()),
                        top: $(window).scrollTop(),
                        left: $(window).scrollLeft()}, {duration: opts.effectSpeed, easing: opts.effectMode});
                    container.stop().animate({'opacity': 1,
                        width: $(window).width() - opts.borderWidth,
                        height: (settings.taskbar.show ? $(window).height() - ht - settings.taskbar.height : $(window).height() - ht)}, {queue: false, duration: opts.effectSpeed, easing: opts.effectMode,
                        complete: function () {
                            opts.resizable.enable && winobj.resizable({disabled: true});
                            winobj.draggable({disabled: false});
                        }
                    });
                    // 在最大化窗口时拖拽header 窗口的header回到鼠标拖拽的中心点
                    winobj.draggable({
                        cursorAt: {cursor: "crosshair", top: opts.mouseCursor, left: (opts.outerWidth / 2)}});
                    setBtnCss([
                        {fold: fold, show: !0},
                        {minimize: minimize, show: !0},
                        {regular: regular, show: !0},
                        {maximize: maximize, show: !1}
                    ]);
                    opts.status = 'maximized';
                    break;

                case  'close' :
                    // save window before status
                    //opts.beforeStatus = opts.status;
                    if ($.browser.msie) {
                        winobj.css('display', 'none');
                    }
                    else {
                        winobj.animate({opacity: 1}, {
                            queue: true,
                            duration: opts.effectSpeed,
                            easing: opts.effectMode,
                            complete: function () {
                                winobj.css('display', 'none');
                            }});
                    }

                    $('#taskbar-' + commonno).css({display: 'none'});
                    opts.status = 'closed';
                    break;

                case 'restoreToMouse'://在窗口最大化时拖动窗口还原到window状态
                    setBtnCss([
                        {fold: fold, show: !0},
                        {minimize: minimize, show: !0},
                        {regular: regular, show: !1},
                        {maximize: maximize, show: !0}
                    ]);
                    opts.status = 'regulared';
                    winobj.css({width: opts.outerWidth, height: opts.outerHeight});
                    container.css({width: cWidth, height: cHeight});
                    if (opts.status != 'folded')
                        opts.resizable.enable && winobj.resizable('enable');

                    break;
                case 'restore'://点击还原窗口时还原窗口
                    setBtnCss([
                        {fold: fold, show: !0},
                        {minimize: minimize, show: !0},
                        {regular: regular, show: !1},
                        {maximize: maximize, show: !0}
                    ]);

                    opts.status = 'regulared';
                    winobj.css('display', 'block');
                    container.css('visibility', 'hidden');
                    if ($.browser.msie) {
                        winobj.animate({width: opts.outerWidth, height: opts.outerHeight,
                            top: opts.top + w(window).scrollTop(),
                            left: opts.left + w(window).scrollLeft()}, effect);
                    }
                    else {
                        winobj.stop().animate({opacity: 1,
                            width: opts.outerWidth,
                            height: opts.outerHeight,
                            top: opts.top,
                            left: opts.left}, effect);
                    }
                    container.stop().animate({opacity: 1,
                        width: cWidth,
                        height: cHeight}, effect);
                    winobj.draggable({cursorAt: null});
                    opts.resizable.enable && winobj.resizable('enable');
                    container.css('visibility', 'visible');
                    break;
                //改变窗体大小时动画
                case'changeSize':
                    opts.status = 'regulared';
                    iframe.css('display', 'none');
                    aerowin.animate({opacity: 'show'}, {
                        queue: true,
                        duration: opts.hyalineSpeed,
                        easing: opts.effect});
                    winobj.animate({
                        opacity: 1,
                        width: opts.outerWidth,
                        height: opts.outerHeight,
                        top: opts.top + $(window).scrollTop(),
                        left: opts.left + $(window).scrollLeft()}, {
                        queue: true,
                        duration: opts.effectSpeed,
                        easing: opts.effect});
                    container.animate({
                        opacity: 1,
                        width: opts.outerWidth - opts.borderWidth,
                        height: opts.outerHeight - ht}, {
                        queue: true, duration: opts.effectSpeed,
                        easing: opts.effect});
                    iframe.animate({opacity: 'show'}, {
                        queue: true,
                        duration: 2000});
                    break;
            }
        }
        this.dblclickDesktopIcon = function(e)
        {
            if (opts.status == 'minimized') {
                self.resize('restore');
            }
            else if (opts.status == 'regular') {
                windowFocus(winobj);
            }
            else if (opts.status == 'closed') {
                if (opts.content) {
                    content.addClass('loading');
                    iframe.css("visibility", "hidden");
                    if (opts.model == 'iframe') {
                        window.setTimeout(function () {
                            iframe.css("display", "none").attr("src", opts.content);
                            iframe.load(function () {
                                content.removeClass('loading');
                                $(this).css("display", "block");
                            });
                        }, 2000);
                    }
                }
                winobj.css('display', 'block');
                container.css('visibility', 'hidden');
                //container.css('display', 'none');
                var startWidth = 200,
                    startHeight = 100,
                    endWidth = opts.outerWidth,
                    endHeight =opts.outerHeight,
                    top = e.pageY - (startHeight / 2),
                    left = e.pageX - (startWidth / 2);
                winobj.css({
                    width: startWidth,
                    height: startHeight,
                    top: top + $(window).scrollTop(),
                    left: left + $(window).scrollLeft()}, {});
                container.css({
                    width: startWidth - opts.borderWidth,
                    height: startHeight - ht}, {});
                opts.outerWidth = startWidth;
                opts.outerHeight = startHeight;
                opts.left = left;
                opts.top = top;
                //self.resize('restore');

                opts.top = ($(window).height() / 2) - (startHeight / 2);
                opts.left = ($(window).width() / 2) - (startHeight / 2);
                opts.status = 'onChange';
                self.resize('changeSize');
                opts.status = 'onChange';

                opts.outerWidth = endWidth;
                opts.outerHeight = endHeight;
                opts.top = ($(window).height() / 2) - (opts.outerHeight / 2) + GetRandom(-50, 50);
                opts.left = ($(window).width() / 2) - (opts.outerWidth / 2) + GetRandom(-50, 50);
                self.resize('changeSize');
                //$('#taskbar-' + commonno).clone(true).appendTo("ul.mindesktopicons");
                container.css('visibility', 'visible');
                $('#taskbar-' + commonno).show();
            }
        }
        dtop['dblclick-'+opts.wid] = self.dblclickDesktopIcon;
        // TODO:
        fold.click(function () {
        })
        regular.click(function () {
            self.resize('regular');
        })
        maximize.click(function () {
            self.resize('maximize');
        })
        minimize.click(function () {
            self.resize('minimize');
        })
        closable.click(function () {
            self.resize('close')
        })
        winobj.dblclick(function () {
            if(!opts.resizable.enable) return false;
            if (opts.maximize.show && opts.status == 'regulared') {
                self.resize('maximize');
                return;
            }
            switch (opts.status) {
                case'maximized':
                    self.resize('regular');
                    break;
                case'minimized':
                    self.resize('regular');
                    break;
                default:
                    break;
            }
        })
        winobj.click(function () {
            //设置焦点
            if (!aerowin.hasClass('active')) {
                windowFocus(winobj);
            }
        })

        //用于回调事件处理
        var wbtns = {
            wmin: 'min',
            wmax: 'max',
            wreg: 'reg',
            wclose: 'close'
        };
        //点击最小化，最大化，关闭时回调函数返回值
        $.each(wbtns, function (k, v) {
            $("#" + opts.wid + "-" + v).click(function (e) {
                var g = $(this);
                return g.attr("disabled", "disabled"), opts.callback(v), g.removeAttr("disabled"), e.preventDefault(), !1
            })
        })

        this.get = function (key) {
            return opts[key];
        };
        this.set = function (key, val) {
            opts[key] = val;
        };

        this.remove = function () {
            winobj.remove();
            delete dtop[opts.wid];
        };
        this.setStatusBar = function (txt) {
            statusbar.html(txt);
            return self;
        };
        this.setFocus = function(wobj)
        {
            windowFocus(wobj);
        }
        // TODO:
        this.maximize = function () {
        };
        // TODO:
        this.minimize = fn;
        // TODO:
        this.setWindowStatus = function(status){
            self.resize(status);
        };

        this.close = function () {
            winobj.hide();
        }
        // TODO:
        this.addToTaskbar = function () {

        };
        //任务栏设置
        this.taskbarHandler = function () {
            if (settings.taskbar.show && opts.taskbar.showIcon) {

                var taskbaritem, minicons, itemid = 'li#taskbar-' + commonno;
                if (opts.taskbar.position == 'left') {
                    minicons = $('.taskbar-left ul.mindesktopicons', top);
                    minicons.append('<li id="taskbar-' + commonno + '" class="taskbar-item" title="' + opts.title + '"><img src="' + opts.taskbar.icon + '"></li>');
                }
                else {
                    minicons = $('.taskbar-right ul.appicons', top);
                    minicons.append('<li id="taskbar-' + commonno + '" class="taskbar-item" title="' + opts.title + '"><img src="' + opts.taskbar.icon + '"></li>');
                }
                taskbaritem = $(itemid, minicons);
                $('img', taskbaritem).css({width: opts.taskbar.width, height: opts.taskbar.height});
                taskbaritem.mousedown(function () {
                    $(this).find('img').css({marginTop: '2px', marginLeft: '2px'});
                });
                taskbaritem.mouseup(function () {
                    $(this).find('img').css({marginTop: '0px', marginLeft: '0px'});
                });
                minicons.on('click', itemid, function () {
                    var i = root.goDesktop(opts.desktopIndex);

                    windowFocus(winobj);
                    //console.log(opts.status,i , opts.desktopIndex);
                    if (opts.status == 'minimized') {
                        if (opts.beforeStatus == 'maximized') {
                            self.resize('maximize');
                        }
                        else { self.resize('regular');}
                    }
                    else if (opts.status == 'regulared' || opts.status == 'maximized') {
                        if (aerowin.hasClass('active') && i == opts.desktopIndex) {
                            self.resize('minimize');
                        }
                        // TODO: 设置完焦点后，如果最小化状态需要还原窗口
                        else {
                            windowFocus(winobj);
                        }
                    }
                })

            }
        }

//        if(!aerowin.hasClass('active'))
//        {
//            aerowin.hover(function(){
//                $(this).addClass('active')
//            },function(){
//                $(this).removeClass('active');
//            });
//        }
        this.setOutBackground= function(img)
        {
            winobj.css('background-image','url('+img+')');
        }
        this.setContainerBackground = function(img)
        {
            container.css('background-image','url('+img+')');
        }
        this.fixed = function () {
            winobj.css('position', 'fixed');
        }
        this.isFocus = function () {
            aerowin.hasClass('active');
        };
        this.setInnerContainerHTML = function (html) {
            container.html(html);
        };
        this.resetWindow = function (options) {
            var opts = $.extend(options || {},opts);
            winobj.css({width:opts.outerWidth,height:opts.outerHeight,left:opts.left,top:opts.top});
            //var template = $('#windowtemplate').html();
            //winpanel.append(jst.render(template, opts));
        };
        //init all
        saveBeforeSize();
        windowFocus(winobj);
        if (settings.taskbar.show) {
            self.taskbarHandler();
        }
    }

    aerowindowPlugin.prototype =
    {

    }

    function initTaskbar(top) {
        if ($('.aerotaskbar', top).length == 0)
            top.append(TrimPath.processDOMTemplate('taskbarhtml', {}));
        var aerotaskbar = $('.aerotaskbar',top);
        var hbar = $('.desktopbarhelper',top);
        aerotaskbar.draggable({
            axis:'y',
            opacity:0.7,
            cancel:'.undrag',
            containment:$('html'),//锁定范围
            drag:function(e,ui){
                //$('.startmenu-btn').css('display','none');

                if(ui.position.top<$(window).height()/2){
                    aerotaskbar.removeClass('horibottom');
                    aerotaskbar.addClass('horitop');
                    hbar.css({top:42});
                }
                else{
                    aerotaskbar.removeClass('horitop');
                    aerotaskbar.addClass('horibottom');
                    hbar.css({top:-45})
                }

            },
            stop:function(e,ui){
                if(ui.position.top<$(window).height()/2){
                    aerotaskbar.css({'top':'0px','bottom':'auto'});
                }
////                    $('.start-position').css({top:'40px',bottom:'auto'});
////                    $('.smbl').addClass('sm-bl');
////                    $('.smbm').addClass('sm-bm');
////                    $('.smbr').addClass('sm-br');
////                    $('.smtl').removeClass('sm-tl');
////                    $('.smtm').removeClass('sm-tm');
////                    $('.smtr').removeClass('sm-tr');
////                    $('.AdminIcon').remove();
////                    $('#StartMContaiter').after(admin);
//                }
                else{
                    aerotaskbar.css({'top':'auto','bottom':'0px'});
                }
//                    $('.Start-position').css({top:'auto',bottom:'40px'});
//                    $('.smbl').removeClass('sm-bl');
//                    $('.smbm').removeClass('sm-bm');
//                    $('.smbr').removeClass('sm-br');
//                    $('.smtl').addClass('sm-tl');
//                    $('.smtm').addClass('sm-tm');
//                    $('.smtr').addClass('sm-tr');
//                    $('.AdminIcon').remove();
//                    $('#StartMContaiter').before(admin);
//                }
            }
        });
    }

    //命名空间
    window.WebPlatform = window.WebPlatform || {};
    var plat = window.WebPlatform;
    plat.Platform = Platform;
    plat.Desktop = Desktop;
    plat.DesktopIcon = DesktopIcon;

    //var plat = window.Platform = window.Platform || {};
    var defaults =
    {
        //自适应最小宽度
        minWidth: 333,
        //自适应最大宽度,auto
        maxWidth: 333,
        showCover: !0,
        //模态层
        cover: {
            //透明度
            opacity: 0.7,
            //背景颜色
            background: '#DCE2F1'
        },
        //动画效果
        effect: false,
        //动画效果
        animation: {
            speed: 500,//效果延迟时间,单位是毫秒
            effectMode: 'easeOutCubic'//特效方式
        },
        //按钮文本
        btns: {
            //action 值 ok
            OK: '确 定',
            //action 值 no
            NO: ' 否 ',
            //action 值 yes
            YES: ' 是 ',
            //action 值 cancel
            CANCEL: '取 消',
            //action 值 CLOSE
            CLOSE: '关闭'
        }
    }

    function aeroDialog(title, content, type, fn) {
        var opt =
        {
            id: 'aerodialog-' + type + '-' + getRandom(),
            icon: '',
            title: title,
            type: type,
            content: content,
            top: 0,
            left: 0,
            callback: typeof fn == 'undefined' ? $.noop : fn
        }
        if (type == "alert" || "success" || "error") f.buttons = Platform.btns.OK;
        switch (type) {
            case "confirm":
                f.buttons = Platform.btns.OKCANCEL;
                break;
            case "warning":
                f.buttons = Platform.btns.YESNOCANCEL
        }
    }

    plat.tip = function () {
    }
    plat.success = function () {
    }
    plat.confirm = function () {
    }
    plat.error = function () {
    }
    plat.warming = fn;
    plat.alert = fn;
    plat.prompt = fn;

})(jQuery, this)

function getRandom() {
    return Math.random().toString(16).substring(2);
}

//
//function getRnd(){
//	return String((new Date()).getTime()).replace(/\D/gi,'');
//}
function GetRandom(min, max) {//生成随机数
    if (min > max) {
        return(-1);
    }
    if (min == max) {
        return(min);
    }
    return(min + parseInt(Math.random() * (max - min + 1)));
}

//对桌面查扩展插件
WebPlatform.Platform.fx.DesktopHelper =function(options)
{

    var topObj = this.platObj;
    var self = this;
    var helperbar = $('.desktopbarhelper', topObj);
    //helperbar.css({'right':50,'top':30});
    helperbar.draggable({distacne:0});//可拖拽
    var desktopPanel = $('.desktop-panel',topObj);
    var desktops = desktopPanel.children();
    slider = $('ul.desktopbar',helperbar);
    var items =slider.children();
    var count = items.length;
    var currentIndex = 0;
    var itemSize = $(window).width();
    var index = function(_idx)
    {
        if( _idx < 0 ) return (count - 1);
        if( _idx >= count ) return 0;
        return _idx;
    }

    this.goDesktop = function(_idx)
    {
        var idx = index( _idx );
        var beforeIndex = $('.desktop.current',desktopPanel).attr('index');
        items.eq(idx).addClass('selected').siblings().removeClass('selected');
        desktops.eq(idx).addClass('current').siblings().removeClass('current');
        if( currentIndex != idx ){
            var offset_x = - idx * $(window).width();
            desktopPanel.stop().animate({'left':offset_x},500);
            currentIndex = idx;
        }
        return beforeIndex;
    }
    items.each(function(index, element){
        var curItem = $(this);
        curItem.data('index',index);
        curItem.click(function(){
            var index = $(this).data('index');
            self.goDesktop(index);
            return false;
        });
//        curItem.hover(function(){
//            var index = $(this).data('index');
//            self.goDesktop(index);
//            return false;
//        });
    });
    this.goDesktop(0);

    $('.mutidesktophelper',topObj).click(function(){
        var hbar = $('.desktopbarhelper',this);
        hbar.css({left:-hbar.width()/2});
        if(hbar.css('display') === 'block')
        { hbar.hide();}
        else
        {
            hbar.show();
        }
    });
}

//右键菜单扩展
WebPlatform.Platform.fx.AeroContextmenu = function(options){
    var cid = 'aerocontextmenu-'+getRandom();
    var defaults={
        scope:'',
        cancel:['body','.cancel'],
        cid:cid,
        offsetX:2,//鼠标在X轴偏移量
        offsetY:2,//鼠标在Y轴偏移量
        speed:300,//特效速度
        flash:!1,//特效是否开启，默认不开启
        flashMode:'',//特效模式,与flash为真时使用域
        items:[{
            id:'Item1',
            text:'刷新',
            icon:'default/contextmenu/icons/Sync.png',
            disable:!1,//新增加true/false
            action:function(){alert('first-item1')}//按照项添加
        },
            {
                id:'Item2',
                text:'桌面日历',
                icon:'default/contextmenu/icons/Calendar.png',
                action:function(e){console.log(e);alert('Second-item2')}//按照项添加
            }],//菜单项
        action:$.noop//自由菜单项回到事件
    };

    var opts = $.extend(true,defaults,options || {});
    if(opts.cancel)
    {
        $.each(opts.cancel,function(i,c){
            $(document.body).on('contextmenu',c,function(){return !1});
        });
    }

    function contextmenuhtml(th){
        var html=$('<ul class="aerocontextmenu" id="'+opts.cid+'"></ul>').appendTo(document.body);
        $.each(opts.items,function(i,itm){
            var row=$('<li><a class="'+(itm.disable?'disable':'sitem')+'" href="javascript:void(0)">' + (itm.icon?'<img src="'+itm.icon+'">':'') + (itm.text?'<span>' + itm.text + '</span>':'')+'</a></li>').appendTo(html);
            if(itm.action && typeof itm.action === 'function') {
                row.find('a').click(function(){
                    this.className!='disable' && itm.action(th);
                });
            }
        });
        return html;
    }

    $(document.body).on('contextmenu',opts.scope,function(e){
        $('.aerocontextmenu').length>0 && $('.aerocontextmenu').remove();
        var m = contextmenuhtml(this).show(),
            l = e.pageX + opts.offsetX,
            t = e.pageY+opts.offsetY,
            wh=$(window).height(),
            ww=$(window).width(),
            mh=m.height(),
            mw=m.width();
        t=(t+mh)>=wh?(t-=mh):t;//当菜单超出窗口边界时处理
        l=(l+mw)>=ww?(l-=mw):l;
        m.css({zIndex:1000001, left:l, top:t}).bind('contextmenu',function() { return false; });
        m.find('a').click(function(e){
            e.preventDefault();
            this.className !== 'disable' && opts.action(this);
        });
        $(document.body).bind('contextmenu click',function(){
            m.remove();
        });
        return false;
    });
    return this;
}