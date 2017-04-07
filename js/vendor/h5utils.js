(function (doc, win) {

    var H5Utils = {};

    var UA = win.navigator.userAgent;
    H5Utils.ua = {
        isIos : !!UA.match(/iPhone|iPad|iPod/i),
        isAnd : !!UA.match(/Android|Linux/i),   //android终端或者uc浏览器
        isWeixin : !!UA.match(/MicroMessenger/i),
        isWeibo : !!UA.match(/weibo/i),
        isQq : !!UA.match(/QQ/i),

        isMCapp : !!UA.match(/mucang/i)
    };



    H5Utils.request = {};
    (function(){

        //search
        H5Utils.request.search = {};
        var HrefSearchParams = win.location.search.replace(/^\?/, "").split("&");
        for(var i = 0, len = HrefSearchParams.length; i < len; i++ ){
            var sps = HrefSearchParams[i].split("=");
            H5Utils.request.search[ decodeURIComponent(sps[0]) ] = sps[1] ? decodeURIComponent(sps[1]) : "";
        }

        //hash
        H5Utils.request.hash = {};
        var HrefHasgParams = win.location.hash.replace(/^\#/, "").split("&");
        for(var i = 0, len = HrefHasgParams.length; i < len; i++ ){
            var sps = HrefHasgParams[i].split("=");
            H5Utils.request.hash[ decodeURIComponent(sps[0]) ] = sps[1] ? decodeURIComponent(sps[1]) : "";
        }


        //shareData
        H5Utils.request.shareData = {};
        try{
            H5Utils.request.shareData = JSON.parse( H5Utils.request.search.shareData || H5Utils.request.hash.shareData || "{}");
        }catch (e){}


    })();



    //App信息
    H5Utils.App = {};
    (function(){

        var delayTime = 4;

        H5Utils.App.isMCapp = !!UA.match(/mucang/i);

        H5Utils.App.appName = H5Utils.request.search.shareProduct || H5Utils.request.shareData._productCategory || H5Utils.request.search.shareAppName || H5Utils.request.shareData._appName;

        H5Utils.App.pkgName = H5Utils.request.shareData._pkgName || H5Utils.request.search._pkgName || H5Utils.request.hash._pkgName;

        H5Utils.App.getOpenUrl = function( protocolUrl, appName ){
            protocolUrl = protocolUrl && encodeURIComponent(protocolUrl || "");
            appName = appName || H5Utils.App.appName;

            return 'mucang' + (appName ? ('-' + appName) : '') + '://gateway' + (protocolUrl ? ('?navUrl=' + protocolUrl) : '');
        };

        //唤起app，失败 => 打开downloadUrl
        H5Utils.App.open = function( downloadUrl, protocolUrl, appName ){

            if( H5Utils.App.open.__wait ) return false;
            H5Utils.App.open.__wait = 1;

            appName = appName || H5Utils.App.appName;

            var now = +new Date(), isTag, dom = this,
                hackUrl = H5Utils.App.getOpenUrl(protocolUrl, appName);

            if( dom && dom.tagName.toLowerCase() === "a" ){
                isTag = true;
            }
            if( !isTag ) win.location = hackUrl;

            H5Utils.App.open.__wait = 0;

            //唤起失败
            setTimeout(function(){
                var now2 = +new Date();
                if( now2 - now < 300 + delayTime ){
                    win.location = downloadUrl || 'http://down.kakamobi.com/download.ashx?product=' + appName + '&detail=true';
                }
            }, 300);

            return isTag ? undefined : false;

        };


        H5Utils.App.getMoonUrl = function( appId, ruleId, pkg, downloadUrl ){
            if( !downloadUrl && H5Utils.App.appName ){
                downloadUrl = 'http://down.kakamobi.com/download.ashx?product=' + H5Utils.App.appName + '&detail=true';
            }

            pkg = pkg || H5Utils.App.pkgName;

            return "mc-moon://moon/install?appId=" +appId+ "&ruleId=" +ruleId+ "&pkg=" +pkg+ "&callback=clearinstalltimer&url=" + encodeURIComponent(downloadUrl);
        };

        //捆绑安装
        H5Utils.App.moon = function(appId, ruleId, pkg, downloadUrl){

            if( !downloadUrl && H5Utils.App.appName ){
                downloadUrl = 'http://down.kakamobi.com/download.ashx?product=' + H5Utils.App.appName + '&detail=true';
            }

            pkg = pkg || H5Utils.App.pkgName;

            if( !H5Utils.App.isMCapp ){
                win.location = downloadUrl;
                return false;
            }

            var now = +new Date();
            win.location = "mc-moon://moon/install?appId=" +appId+ "&ruleId=" +ruleId+ "&pkg=" +pkg+ "&callback=clearinstalltimer&url=" + encodeURIComponent(downloadUrl);

            setTimeout(function(){
                var now2 = +new Date();
                if( now2 - now < 30 + delayTime ){
                    window.location = downloadUrl;
                }
            }, 30);

            return false;

        };

    })();

    //用户信息
    H5Utils.User = {};
    (function(){

        H5Utils.User.authToken = undefined;
        H5Utils.User.info = undefined;

        H5Utils.User.getToken = function(){
            var UserInfo;
            var AuthToken = H5Utils.User.authToken || H5Utils.request.search.authToken || H5Utils.request.hash.authToken || H5Utils.request.shareData.authToken;

            if( !AuthToken && window.webview ){
                try{
                    UserInfo = webview.user.get();
                }catch (e){}

                try{
                    if(typeof UserInfo === "string")  UserInfo = JSON.stringify(UserInfo || "{}") || {};
                }catch (e){}

                try{
                    AuthToken = UserInfo.authToken || UserInfo.accessToken || UserInfo.data.authToken || UserInfo.data.accessToken;
                }catch (e){}
            }

            if(AuthToken) H5Utils.User.authToken = AuthToken;
            if(UserInfo) H5Utils.User.info = UserInfo;

            return AuthToken;
        };

        H5Utils.User.getToken();

    })();






    // localStorage
    H5Utils.localStorage = function(name, v, expire){

        expire = parseInt( expire ) || 0;
        var now = +new Date();

        //set
        if( v ){

            if( expire > 0 ) expire = expire * 1000 + now;
            var val = { v : v, e : expire };

            try{
                win.localStorage.removeItem(name);

                win.localStorage.setItem(name, JSON.stringify(val) );
            }catch (e){}

        }
        //get
        else{

            try{
                var val = JSON.parse( win.localStorage.getItem(name) );

                if( val.e > 0 && val.e < now ) return undefined;

                return val.v;

            }catch (e){}

        }

    };


    //tools
    H5Utils.tools = {

        type : function(obj){
            var s = Object.prototype.toString.call(obj);
            return s.substr(8, s.length - 9).toLowerCase();
        },

        randomInt : function(max, min){
            min = min || 0;
            return parseInt( Math.random()*(max-min+1) + min )
        },

        getUUid : function( inLocalStorage ){
            if( !inLocalStorage ){
                return +new Date() + "" + parseInt(Math.random() * 1000)  + parseInt(Math.random() * 1000);
            }

            var uuid = H5Utils.localStorage('h5uuid');
            if( !uuid ){
                uuid = H5Utils.tools.getUUid( false );
                H5Utils.localStorage('h5uuid', uuid);
            }

            return uuid;
        },

        shuffle : function( ary ){
            for (var j, x, i = ary.length; i; j = parseInt(Math.random() * i), x = ary[--i], ary[i] = ary[j], ary[j] = x);
            return ary;
        },

        date : function(timeStamp, format){
            format = format || "yy-MM-dd HH:mm:ss";
            var week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            var date = new Date(timeStamp);

            var o = {
                "M+": date.getMonth() + 1,
                "d+": date.getDate(),
                "h+": date.getHours() % 12,
                "H+": date.getHours(),
                "m+": date.getMinutes(),
                "s+": date.getSeconds(),
                "q+": Math.floor((date.getMonth() + 3) / 3),
                "S+": date.getMilliseconds(),
                "W+": week[date.getDay()]
            };

            if (/(y+)/.test(format))
                format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));

            for (var k in o)
                if (new RegExp("(" + k + ")").test(format))
                    format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));

            return format;
        },

        niceTime : function( timeStamp ){
            var date = new Date( timeStamp );
            var now = new Date();

            var deltaTime = (now.getTime() - date.getTime()) / 1000;
            if (deltaTime < 60) {
                return '刚刚';
            } else if (deltaTime < 3600) {
                return parseInt(deltaTime / 60) + '分钟前';
            } else if ( deltaTime < 3600 * 24 ) {
                return parseInt(deltaTime / 3600) + '小时前';
            }/*else if ( this.date(date) == this.date(now) ) {
             return this.date(date, 'HH:mm');
             } */else if (date.getFullYear() == now.getFullYear()) {
                return H5Utils.tools.date(timeStamp, 'MM-dd HH:mm');
            } else {
                return H5Utils.tools.date(timeStamp);
            }
        },

        object2params : function(obj){
            var params = [];
            for(var key in obj ){
                if( obj.hasOwnProperty(key) ){
                    var v = obj[key];
                    var type = H5Utils.tools.type( v );
                    if( type == 'array' || type == 'object' ){
                        v = JSON.stringify(v);
                    }
                    params.push( key + "=" + v );
                }
            }
            return params.join("&");
        }

    };






    //平滑执行某一事件（触发频率限制）
    var SmoothPool = {};
    H5Utils.Smooth = function(fun, type, delay, clearBefore){
        var Pools = SmoothPool;

        type = type || '_simple_';
        delay = delay || 500;

        if( clearBefore && Pools[type] ){
            clearTimeout( Pools[type].timer );
            Pools[type] = null;
        }

        if( !Pools[type] ){
            Pools[type] = {
                timer : setTimeout(function(){
                    Pools[type]['fun']();
                }, delay),
                fun : function(){
                    fun();
                    Pools[type] = null;
                }
            };
        }
        else{
            Pools[type]['fun'] = null;
            Pools[type]['fun'] = function(){
                fun();
                Pools[type] = null;
            }
        }

    };




    //取电脑/手机硬件信息
    H5Utils.Hardware = {
        devicePixelRatio : window.devicePixelRatio,

        screen_width : window.screen.width,
        screen_height : window.screen.height,
        screen_colorDepth : window.screen.colorDepth,
        screen_pixelDepth : window.screen.pixelDepth,

        navigator_platform : window.navigator.platform,
        navigator_hardwareConcurrency : window.navigator.hardwareConcurrency,
        navigator_language : window.navigator.language,
        navigator_userAgent : window.navigator.userAgent
    };




    win.H5Utils = H5Utils;

})(document, window);