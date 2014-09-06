/*
 //命名空间
 WebPlatform:
 WebPlatform
 AeroWindow
 initialize
 initByDeskIcons
 create(id,opts,fn)
 remove(id,fn)
 focus('id',fn)
 max('id,fn)
 min
 reg
 close
 resize
 drag
 hide
 addToTaskbar
 平铺
 get('name')
 set('name','val')
 getID | get('id')
 isFocus
 showToolbar
 showFooterbar
 getOptions
 extend
 ContextMenu
 TaskBar
 Menubar
 Desktop
 DesktopIcons
 ………………………………
 */
// task list
var TASK_LIST=[];
// platform system process
var APP_PROCESS=[];

(function (window) {

    var v = void 0,
        t = !0,
        l = null,
        f = !1,
        v = '1.0';
    fn = function () {
        return function () {
        }
    },
        root = this,
        process = {},
        Platform = function () {
            this.version = '1.0';
            //var c = Array.prototype.slice.call(arguments, 0)
            //console.log(c[0]);
            var len = arguments.length,
                args = arguments;
            self = this;
            var module = [],
                selector = '',
                settings = {},
                callback = jQuery.noop;
            //this.settings = settings;
            if (len > 0) {
                for (var i = 0; i < len; i++) {
                    //If haven't selector,return current object
                    if (args[i] instanceof Array) {
                        module = args[i];
                        continue;
                    }

                    if (typeof args[i] === 'string') {
                        //need know this string is id or class name or label
                        this.selector = document.getElementById(args[i]);
                        continue;
                    }

                    // options
                    if (typeof args[i] === 'object') {
                        settings = args[i];
                        continue;
                    }
                    // callback function
                    if (jQuery.isFunction(fn)) {
                        this.callback = args[i];
                        continue;
                    }
                }
            }

            if (selector.length == 0) {
                this.selector = document.getElementsByTagName('body');
            }
            this.settings = jQuery.extend(true, this.settings || {}, settings);
            if (module.length > 0) {
                this.settings.allshow = !1;
                jQuery.each(module, function (i, v) {
                    //self[v].settings = this[v].settings ||{};
                    //this[v].settings.show = !0;
                });
            }
            else {
                this.settings.allshow = !0;
            }
            //this.settings = jQuery.extend(true , WebPlatform.settings , settings);
            //return this;
        };

    //	Win7:0x1,Win8:0x2,Mac:0x3
    Platform.fx = Platform.prototype = {
        model: 0x1,
        constructor: Platform
    }

    // core use it init template
    function htmlTemplate(template, data) {
        return    TrimPath.parseTemplate(template).process(data);
    }

    function windowPlugin(s, options, callback) {
        var self = this,
            opts = $.extend({}, Platform.AeroWindowSettings, options || {});
        this.class = 'aerowindow';
        this.id = opts.id;
        this.selector = s.selector;
        var id = $('#' + this.id);
        this.callback = callback;
        //initialize aerowindow
//		var win7 = htmlTemplate(jQuery('#win7').val(),opts);
//		jQuery(Platform.id).append(win7);

        this.initByDeskIcons = function () {
        }

        //propoty operate
        this.get = function (key) {
            return opts[key];
        }
        this.set = function (key, val) {
            opts[key] = val;
        }

        this.create = function () {
        }

        this.remove = function (id) {
        }

        this.focus = function (id) {
        }

        this.maximize = function () {
        }

        this.minimize = fn;

        this.regulared = fn;

        this.close = function (id) {
        }

        this.resize = fn;

        this.hide = function (o) {
            o.css('display', 'none');
        }

        this.addToTaskbar = fn;

        this.removeFromTaskbar = fn;

//		this.showToolbar = fn;
//		
//		this.showFooterbar = fn;

        this.getOptions = function () {
            return opts
        }

        //template compile,we use jst template compile html,it's being very easy.

        // append html to body
        var winHTML = htmlTemplate(jQuery('#win7').val(), opts);
        jQuery(this.selector).append(winHTML);

        var ele = $('#' + this.id), wincontainer = ele;
        //console.log(container);
        // use this set css style in order to prevent failure
        wincontainer.css({
            'z-index': 100,
            width: opts.outerWidth + 'px',
            height: opts.outerHeight + 'px',
            top: opts.top + 'px',
            left: opts.left + 'px',
            position: 'absolute'
        });

        // get window actual size
        var contentHeight = opts.outerHeight - opts.borderHeight;
        var ht = getHeight(opts.header) + getHeight(opts.toolbar) + getHeight(opts.footerbar);
        contentHeight -= ht;

        function getHeight(o) {
            return o && o.visible ? o.height : 0;
        }

        // save change before size
        function saveOriginalSize() {
            opts.outerWidth = wincontainer.width();
            opts.outerHeight = wincontainer.height();
            opts.top = wincontainer.offset().top;
            opts.left = wincontainer.offset().left;
        }

        var btnFold = $(ele).find('.foldbtn'),
            btnMax = $(ele).find('.maxbtn'),
            btnMin = $(ele).find('.minbtn'),
            btnReg = $(ele).find('.regbtn'),
            btnClose = $(ele).find('.closebtn'),
            self = this,
        //content= $(ele).find('.win-content');
            container = $(ele).find('.win-container');
        aerowins = $('.aerowindow');

        //init inner container size
        container.css({
            width: (opts.outerWidth - opts.borderWidth) + 'px',
            height: contentHeight + 'px' //(opts.outerHeight - opts.borderHeight) + 'px'//
        });

        this.isFocus = function () {
            $(wincontainer).hasClass('active') ? !0 : !1;
        }


        if (opts.draggable) {
            wincontainer.draggable({
                distance: 3,
                cancel: '.win-container',//'.win-container',
                opacity: 0.6,
                cursor: 'move',
                start: function () {
                    if (opts.status == 0x2 || opts.status == 0x4) {
                        self.ResizeWindow('restoreToMouse');
                    }
                    winfocus();
                },
                drag: function () {
                },
                stop: function () {
                }
            });
        }

        // resize aerowinow
        if (opts.resizable) {
            wincontainer.resizable({
                minHeight: opts.minHeight,
                minWidth: opts.minWidth,
                alsoResize: container,
                handles: 'n, e, s, w, ne, se, sw, nw',
                start: function () {
                    winfocus();
                },
                stop: function () {
                    //wincontainer.find('.iframeHelper').css({'display':'none'});
                }
            });
        }

        // when click aerowindow set this current window is focus and set z-index is the max size
        function winfocus() {

            var zindex = wincontainer.css('z-index');
            aerowins.removeClass('active');
            wincontainer.addClass('active');
            if (($(self.selector).data('AerowinMaxZIndex')) == null) {
                $(self.selector).data('AerowinMaxZIndex', zindex);
            }
            var i = $(self.selector).data('AerowinMaxZIndex');
            i++;
            wincontainer.css({'z-index': i, 'display': 'block'});
            $(self.selector).data('AerowinMaxZIndex', i);
        }

        // from right to left
        var status = {
            close: 0x1,
            max: 0x2,
            reg: 0x3,
            min: 0x4,
            fold: 0x5,
            transparentOn: 0x6,
            transparentOff: 0x7,
            tomouse: 0x8
//			fold : 0x1,
//			min : 0x2,
//			reg : 0x3,
//			max : 0x4,
//			close : 0x5,
//			transparentOn : 0x6,
//			transparentOff : 0x7,
        }
        var aw = {};
        aw.ShowTaskbar = !1;
        var effect = {queue: true, duration: opts.effectSpeed, easing: opts.effectMode};
        this.resizeWindow = function (status) {
            var h, w, t, l, c = null;
            var cWidth = opts.outerWidth - opts.borderWidth, cHeight = contentHeight;
            //chage before we need save oringinal size, to restore window status
            if (opts.status == 0x3) {
                //saveOriginalSize();
                console.log(opts.outerWidth, opts.outerHeight);
                console.log(opts.left, opts.top);
            }
            // save window before status
            opts.beforeStatus = opts.status;
            switch (status) {
                case 0x5://Fold
                    setBtnCss([
                        {name: btnReg, visible: !1},
                        {name: btnMax, visible: !0},
                        {name: btnMin, visible: !0}
                    ]);

                    break;
                case 0x4: //Min
                    setBtnCss([
                        {name: btnFold, visible: !1},
                        {name: btnMin, visible: !1},
                        {name: btnReg, visible: !1},
                        {name: btnMax, visible: !0}
                    ]);
                    opts.status = 0x4;

                    if ($.browser.msie) {
                    }
                    else {
                        wincontainer.animate({opacity: 'hide'}, effect);
                    }
                    //	  h = opts.minWidth,
//				  h = opts.minHeight,
//				  t = -100+$('#Taskbar'+this.id).offset().top,
//				  l = $('#Taskbar'+this.id).offset().left;
                    wincontainer.animate({
                            width: opts.minWidth,
                            height: opts.minHeight
                            //top:-100+$('#Taskbar'+this.id).offset().top,
                            //left:$('#Taskbar'+this.id).offset().left
                        },
                        {
                            queue: true,
                            duration: opts.effectSpeed,
                            easing: opts.effectMode,
                            complete: function () {
                                wincontainer.css('display', 'none');
                            }
                        }
                    ).draggable({
                            cursorAt: {cursor: "crosshair",
                                top: opts.mouseCursor,
                                left: (opts.outerWidth / 2)}
                        }).resizable('disable');

                    container.animate({
                        width: opts.minWidth - opts.borderWidth,
                        height: opts.minHeight - opts.borderHeight
                    }, effect);
                    break;

                case 0x3: //reg reg->max
                    console.log(this.id);
                    if (container.css('visibility') == 'hidden') {
                        container.css({'visibility': 'visible'});
                    }
                    //if($.browser.msie){}//IE do nothing
//				else{wincontainer.animate({opacity:'fast'},effect);}
                    wincontainer.draggable({disabled: true});
                    wincontainer.animate({
                        width: $(window).width(),
                        height: (aw.ShowTaskbar ? $(window).height() - opts.TaskbarHeight : $(window).height()),
                        top: $(window).scrollTop(),
                        left: $(window).scrollLeft()}, {duration: opts.effectSpeed, easing: opts.FlashMode});
                    container.animate({'opacity': 1,
                        width: $(window).width() - opts.borderWidth,
                        height: (aw.ShowTaskbar ? $(window).height() - opts.borderHeight - opts.TaskbarHeight : $(window).height() - ht - opts.borderHeight)}, {queue: false, duration: opts.effectSpeed, easing: opts.FlashMode,
                        complete: function () {
                            wincontainer.resizable({disabled: true}).draggable({disabled: false});
                        }
                    });
                    setBtnCss([
                        {name: btnFold, visible: !0},
                        {name: btnMin, visible: !0},
                        {name: btnReg, visible: !1},
                        {name: btnMax, visible: !0}
                    ]);
                    wincontainer.draggable({
                        cursorAt: {cursor: "crosshair", top: opts.mouseCursor, left: (opts.OuterWidth / 2)}});
                    opts.status = 0x3;
                    break;

                case 0x2: //max max->reg
                    setBtnCss([
                        {name: btnFold, visible: !0},
                        {name: btnMin, visible: !0},
                        {name: btnReg, visible: !0},
                        {name: btnMax, visible: !1}
                    ]);
                    opts.status = 0x2;
                    wincontainer.css('display', 'block');//.animate({opacity:'show'},effect);
                    if ($.browser.msie) {
                        wincontainer.animate({width: opts.outerWidth, height: opts.outerHeight,
                            top: opts.top + $(window).scrollTop(),
                            left: opts.left + $(window).scrollLeft()}, effect);
                    }
                    else {
                        wincontainer.animate({
                            opacity: 'show',
                            width: opts.outerWidth,
                            height: opts.outerHeight,
                            top: opts.top,
                            left: opts.left}, effect)
                    }
                    container.animate({
                        opacity: 1,
                        width: cWidth,
                        height: cHeight}, effect);
                    wincontainer.draggable({cursorAt: null}).resizable('enable');
                    break;
                case 0x1: //close
                    // save window before status
                    opts.beforeStatus = opts.status;
                    if ($.browser.msie) {
                        wincontainer.css('display', 'none');
                    }
                    else {
                        wincontainer.animate({opacity: 0}, {
                            queue: true,
                            duration: opts.effectSpeed,
                            easing: opts.FlashMode,
                            complete: function () {
                                wincontainer.css('display', 'none');
                            }});
                    }
                    //$('#Taskbar'+this.id).css({display:'none'});
                    opts.status = 0x1;
                    break;

                case 0x6:
                    WinContContainer.animate({opacity: 0.0}, {queue: false, duration: opts.TransparentSpeed});
                    break;

                case 0x7:
                    WinContContainer.animate({opacity: 1}, {queue: false, duration: opts.TransparentSpeed});
                    break;
            }
            return !1;
        }

        //setBtnCss([{name:obj,visible:!0},{name:obj,visible:!0}]);

        function setBtnCss(o) {
            $.each(o, function (i, v) {
                v.name.css('display', v.visible ? 'block' : 'none');
            });
        }

        btnFold.click(function () {
            self.resizeWindow(status.fold);
        });
        btnMin.click(function () {
            self.resizeWindow(status.min);
        });
        btnReg.click(function () {
            self.resizeWindow(status.reg);
        });
        btnMax.click(function () {
            self.resizeWindow(status.max);
        });
        btnClose.click(function () {
            self.resizeWindow(status.close);
        });
        wincontainer.click(function () {
            if (!wincontainer.hasClass('active')) {
                winfocus();
            }
        });

        // loading set default status
        if (opts.btns.maximize) {
            wincontainer.dblclick(function () {
                switch (opts.status) {
                    case 0x3 :
                        self.resizeWindow(status.max);
                        break;
                    case 0x2 :
                        self.resizeWindow(status.reg);
                        break;
                    case 0x4 :
                        self.resizeWindow(status.reg);
                        break;
                    default:
                        break;
                }
            });
        }
        else {
            wincontainer.dblclick(function () {
                switch (opts.status) {
                    case 0x2 :
                        self.resizeWindow(status.reg);
                        break;
                    case 0x4 :
                        self.resizeWindow(status.reg);
                        break;
                    default :
                        break;
                }
            });
        }

        saveOriginalSize();

        // do callback
        //wincallback(opts);
        return this;
    }

//	WebPlatform.AeroWindow = function(options){
//	  return this.each(function(){
//		var element=$(this);
//		if(element.data('AeroWindow')) return;
//		var AeroWindow=new AeroWindowPlugin(this,options);//为每个新建窗体创建一个对象
//		element.data('AeroWindow',AeroWindow);
//		//AeroWindow.TaskbarHandler();//初始化任务栏
//		//AeroWindow.DesktopIconHandler();//初始化桌面图标
//		if(($('body').data('AeroWindows'))==null){
//			$('body').data('AeroWindows',[AeroWindow]);}
//		else{$('body').data('AeroWindows').push(AeroWindow);}
//	  });
//	};

    var createwindow = function (options) {
        //var id='win1';
        var opts = options || WebPlatform.aerowindowSettings;
        console.log(opts);
        var win = new windowPlugin(options.id, options);
    }

    // mount node
    var awin = {}//WebPlatform.AeroWindow;
    // when click minine, maximine and close do callback
    function wincallback(w) {
        var d, e = awin.winBtns.All;
        $.each(e, function (e, f) {
            $("#" + w.id + "_" + f.result).click(function (e) {
                var g = $(this);
                return g.attr("disabled", "disabled"), d = w.callback(f.result), g.removeAttr("disabled"), e.preventDefault(), !1
            })
        })
    }

    // callback handle
    awin.winBtns = {
        WFold: [
            {value: '收缩', result: "wfold"}
        ],
        WMin: [
            {value: '最小化', result: "wmin"}
        ],
        WMax: [
            {value: '最大化', result: "wmax"}
        ],
        WReg: [
            {value: '还原', result: 'wreg'}
        ],
        WClose: [
            {value: '关闭', result: "wclose"}
        ]
    },
        awin.winBtns.All = awin.winBtns.WMin.concat(awin.winBtns.WFold, awin.winBtns.WMax, awin.winBtns.WReg, awin.winBtns.WClose);

    //	Platform.prototype.constructor = Platform;
    //	Here to borrow the jQuery extend function as my structure extends
    //	if we don't want to use jQuery we can write our own extend in the future
    Platform.extend = Platform.fx.extend = jQuery.extend;

    Platform.fx.extend({
        Desktop: fn,
        DesktopIcons: function () {
            console.log(this.selector)
        },
        AeroWindow: function () {
            windowPlugin.apply(this, arguments)
        },
        CreateAeroWindow: function (opts, fn) {
            new windowPlugin(this, opts, fn);
            //windowPlugin(opts,fn);
            //Array.prototype.slice(arguments)
        },
        ContextMenu: fn,
        TaskBar: fn,
        Menubar: fn,
        //Utility : utility
        PlatformSettings: {effect: !0}
    });
    console.log(Platform.fx);
    Platform.extend({
        AeroWindowSettings: {
            id: '',//指定窗体id
            title: 'AeroWindow',//标题
            icon: 'default/Icons/default.png',//默认窗口左上角图标
            showicon: !0,//在创建新窗体的时，是否在桌面显示图标
            content: '',
            draggable: !0,//拖动窗体
            resizable: !0,//是否可以改变窗口大小
            fixed: !1,//是否固定窗口
            status: 0x3,//窗体状态,fold : 0x1,minimized : 0x2,regulared : 0x3,maximized : 0x4,closed : 0x5
            mode: 'window',//窗口模式,dialog,sucess,tip,etc.

            effectSpeed: 300,//效果延迟时间,单位是毫秒
            effectMode: 'easeInOutQuart',//特效方式
            hyalineSpeed: 300,//透明效果时间

            top: 100,//{center/值}初始时离桌面最上边位置
            left: 200,//{center/值}初始时离桌面最左边位置

            outerWidth: 450,//{值}内宽
            outerHeight: 300,//{值}内高
            minWidth: 200,//改变窗口大小时的最小宽度
            minHeight: 200,//改变窗口大小时的最小高度
            borderWidth: 18,//边框占用宽度，即WindowBorderWidth
            borderHeight: 23,//边框占用高度，即WindowBorderHeight
            frameWidth: 200,
            btns: {
                fold: !0,//显示折叠按钮
                minimize: !0,//显示最小化按钮
                maximize: !0,//显示最大化按钮
                closable: !0//显示关闭按钮
            },
            header: {
                visible: !0,
                height: 22
            },
            toolbar: {
                visible: !1,
                height: 20
            },
            footerbar: {
                visible: !0,
                content: '',
                height: 20
            },
            loadIframe: !0,//是否允许加载iframe链接内容
            mouseCursor: 25,//鼠标指针宽度
            taskbarHeight: 40,//任务栏高度,如果任务栏显示
            taskbarSite: 'bottom',//任务栏位置
            callback: $.noop//回调函数
        }
    });


    function getRnd() {
        return String((new Date()).getTime()).replace(/\D/gi, '');
    }

    function getWinID() {
        return "aerowin-" + getRnd();
    }

    //Platform.extend(WebPlatform,WebPlatform.fx);

    //register all class
//	WebPlatform = {
//		Platform : Platform,
//		AeroWindow : windowPlugin,
//		CreateAeroWindow : createwindow,
//		ContextMenu : fn,
//		TaskBar : fn,
//		Menubar : fn,
//		Desktop : fn,
//		DesktopIcons : fn,
//		//Utility : utility
//		PlatformSettings    : {effect:!0},
//		
//		desktopSettings      : {},
//		desktopIconsSettings : {}
//	}

    if (typeof window === "object" && typeof window.document === "object") {
        window.WebPlatform = Platform;
    }
})(window);


/*(function( window, undefined ) {
 // 构造jQuery对象
 var jQuery = function( selector, context ) {
 return new jQuery.fn.init( selector, context, rootjQuery );
 }
 // 工具函数 Utilities
 // 异步队列 Deferred
 // 浏览器测试 Support
 // 数据缓存 Data
 // 队列 queue
 // 属性操作 Attribute
 // 事件处理 Event
 // 选择器 Sizzle
 // DOM遍历
 // DOM操作
 // CSS操作
 // 异步请求 Ajax
 // 动画 FX
 // 坐标和大小
 window.jQuery = window.$ = jQuery;
 })(window);




 (function( window, undefined ) {

 var jQuery = (function() {
 // 构建jQuery对象
 var jQuery = function( selector, context ) {
 return new jQuery.fn.init( selector, context, rootjQuery );
 }

 // jQuery对象原型
 jQuery.fn = jQuery.prototype = {
 constructor: jQuery,
 init: function( selector, context, rootjQuery ) {
 // selector有以下7种分支情况：
 // DOM元素
 // body（优化）
 // 字符串：HTML标签、HTML字符串、#id、选择器表达式
 // 函数（作为ready回调函数）
 // 最后返回伪数组
 }
 };

 // Give the init function the jQuery prototype for later instantiation
 jQuery.fn.init.prototype = jQuery.fn;

 // 合并内容到第一个参数中，后续大部分功能都通过该函数扩展
 // 通过jQuery.fn.extend扩展的函数，大部分都会调用通过jQuery.extend扩展的同名函数
 jQuery.extend = jQuery.fn.extend = function() {};

 // 在jQuery上扩展静态方法
 jQuery.extend({
 // ready bindReady
 // isPlainObject isEmptyObject
 // parseJSON parseXML
 // globalEval
 // each makeArray inArray merge grep map
 // proxy
 // access
 // uaMatch
 // sub
 // browser
 });

 // 到这里，jQuery对象构造完成，后边的代码都是对jQuery或jQuery对象的扩展
 return jQuery;

 })();

 window.jQuery = window.$ = jQuery;
 })(window);


 */